import Phaser from 'phaser'

import { connect, sendMoveIntent, type AgentState, type WsMessage } from '../net/wsClient'

export class MainScene extends Phaser.Scene {
  private tickText?: Phaser.GameObjects.Text
  private fpsText?: Phaser.GameObjects.Text
  private welcomeText?: Phaser.GameObjects.Text
  private titleText?: Phaser.GameObjects.Text
  private hudBar?: Phaser.GameObjects.Rectangle
  private wsText?: Phaser.GameObjects.Text
  private ws?: WebSocket
  private playerId?: number
  private selectedAgentId?: number
  private agentSprites = new Map<number, Phaser.GameObjects.Container>()
  private agentTargets = new Map<number, { x: number; y: number }>()
  private obstacleRects: Phaser.GameObjects.Rectangle[] = []
  private worldBounds?: { width: number; height: number }
  private boundsRect?: Phaser.GameObjects.Rectangle
  private edgeGlow?: Phaser.GameObjects.Rectangle

  create() {
    this.input.mouse?.disableContextMenu()

    this.hudBar = this.add
      .rectangle(0, 0, 100, 56, 0x0b1220, 0.9)
      .setStrokeStyle(1, 0x1f6feb, 0.4)

    this.titleText = this.add
      .text(0, 0, 'killed-all-humans', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '24px',
        color: '#e6edf3',
      })
      .setOrigin(0, 0)

    this.welcomeText = this.add
      .text(0, 0, "what's even the point?", {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '15px',
        color: '#95aec4',
      })
      .setOrigin(0, 0)

    this.tickText = this.add
      .text(0, 0, 'tick: --', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '18px',
        color: '#c8e1ff',
      })
      .setOrigin(1, 0)

    this.fpsText = this.add
      .text(0, 0, 'fps: --', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '14px',
        color: '#95aec4',
      })
      .setOrigin(1, 0)

    this.wsText = this.add
      .text(0, 0, 'ws://localhost:8000/ws', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '14px',
        color: '#7d8590',
      })
      .setOrigin(0.5, 1)

    for (const hud of [this.hudBar, this.titleText, this.welcomeText, this.tickText, this.fpsText, this.wsText]) {
      hud.setScrollFactor(0)
      hud.setDepth(100)
    }

    this.ws = connect((msg: WsMessage) => {
      if (msg.type === 'welcome') {
        this.playerId = msg.player_id
        if (this.welcomeText) {
          this.welcomeText.setText(msg.message ?? 'connected')
        }
      }
      if (msg.type === 'world_state') {
        this.tickText?.setText(`tick: ${msg.tick}`)
        this.applyWorldBounds(msg.bounds)
        this.syncObstacles(msg.obstacles)
        this.syncAgents(msg.agents)
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2 || pointer.rightButtonDown()) {
        if (this.ws && this.selectedAgentId != null) {
          sendMoveIntent(this.ws, this.selectedAgentId, pointer.worldX, pointer.worldY)
          this.spawnMoveMarker(pointer.worldX, pointer.worldY)
        }
        return
      }

      const clickedAgent = this.pickAgent(pointer.worldX, pointer.worldY)
      this.selectedAgentId = clickedAgent ?? undefined
      this.highlightSelection()
    })

    this.layoutHud(this.scale.width, this.scale.height)

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.layoutHud(gameSize.width, gameSize.height)
    })
  }

  private syncObstacles(obstacles: { id: number; x: number; y: number; width: number; height: number }[]) {
    for (const rect of this.obstacleRects) {
      rect.destroy()
    }
    this.obstacleRects = obstacles.map((obstacle) =>
      this.add.rectangle(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width, obstacle.height, 0x0f172a, 0.9).setStrokeStyle(2, 0x1f6feb, 0.6),
    )
  }

  private syncAgents(agents: AgentState[]) {
    const seen = new Set<number>()
    for (const agent of agents) {
      seen.add(agent.id)
      this.agentTargets.set(agent.id, { x: agent.x, y: agent.y })
      const existing = this.agentSprites.get(agent.id)
      if (existing) {
        continue
      }
      const sprite = this.buildRobot(agent)
      sprite.x = agent.x
      sprite.y = agent.y
      this.agentSprites.set(agent.id, sprite)
    }
    for (const [id, sprite] of this.agentSprites.entries()) {
      if (!seen.has(id)) {
        sprite.destroy(true)
        this.agentSprites.delete(id)
        this.agentTargets.delete(id)
      }
    }
    this.highlightSelection()
    this.centerCameraOnPlayer()
  }

  private buildRobot(agent: AgentState): Phaser.GameObjects.Container {
    const ring = this.add.circle(0, 4, 28, 0x0b0e14, 0.0).setStrokeStyle(2, 0x9fb3c8, 0.6)
    const body = this.add.rectangle(0, 0, 42, 28, parseInt(agent.primary.slice(1), 16))
    body.setStrokeStyle(2, 0x0b0e14, 0.5)

    const head = this.add.rectangle(0, -22, 26, 18, parseInt(agent.secondary.slice(1), 16))
    head.setStrokeStyle(2, 0x0b0e14, 0.5)

    const eye = this.add.circle(6, -24, 3, parseInt(agent.accent.slice(1), 16))
    const antenna = this.add.rectangle(-10, -36, 4, 12, parseInt(agent.secondary.slice(1), 16))
    const antennaTip = this.add.circle(-10, -44, 3, parseInt(agent.accent.slice(1), 16))

    const name = this.add
      .text(0, 26, `#${agent.id}`, {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '12px',
        color: '#9fb3c8',
      })
      .setOrigin(0.5, 0.5)

    const container = this.add.container(0, 0, [ring, body, head, eye, antenna, antennaTip, name])
    container.setData('owner', agent.owner)
    container.setData('ring', ring)
    return container
  }

  private pickAgent(x: number, y: number): number | undefined {
    for (const [id, sprite] of this.agentSprites.entries()) {
      const dx = sprite.x - x
      const dy = sprite.y - y
      if (dx * dx + dy * dy <= 22 * 22) {
        return id
      }
    }
    return undefined
  }

  private highlightSelection() {
    for (const [id, sprite] of this.agentSprites.entries()) {
      const owner = sprite.getData('owner') as number | undefined
      const ring = sprite.getData('ring') as Phaser.GameObjects.Arc | undefined
      if (ring) {
        ring.setVisible(owner === this.playerId)
      }
      sprite.setScale(id === this.selectedAgentId ? 1.08 : 1.0)
      sprite.setAlpha(id === this.selectedAgentId ? 1.0 : 0.85)
    }
  }

  private spawnMoveMarker(x: number, y: number) {
    const ring = this.add.circle(x, y, 10, 0x1f6feb, 0.3)
    const outline = this.add.circle(x, y, 16, 0x1f6feb, 0.0).setStrokeStyle(2, 0x1f6feb, 0.8)
    this.tweens.add({
      targets: [ring, outline],
      scale: 1.4,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => {
        ring.destroy()
        outline.destroy()
      },
    })
  }

  private applyWorldBounds(bounds: { width: number; height: number }) {
    if (this.worldBounds && this.worldBounds.width === bounds.width && this.worldBounds.height === bounds.height) {
      return
    }
    this.worldBounds = bounds
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height)
    if (this.boundsRect) {
      this.boundsRect.destroy()
    }
    this.boundsRect = this.add
      .rectangle(bounds.width / 2, bounds.height / 2, bounds.width, bounds.height, 0x0b0e14, 0.0)
      .setStrokeStyle(2, 0x1f6feb, 0.18)
      .setDepth(-1)
    if (this.edgeGlow) {
      this.edgeGlow.destroy()
    }
    this.edgeGlow = this.add
      .rectangle(bounds.width / 2, bounds.height / 2, bounds.width, bounds.height, 0x1f6feb, 0.08)
      .setStrokeStyle(6, 0x1f6feb, 0.35)
      .setDepth(-2)
  }

  private centerCameraOnPlayer() {
    if (!this.playerId || !this.worldBounds) {
      return
    }
    const playerAgent = Array.from(this.agentSprites.entries()).find(([_, sprite]) => sprite.getData('owner') === this.playerId)
    if (!playerAgent) {
      return
    }
    this.cameras.main.centerOn(playerAgent[1].x, playerAgent[1].y)
  }

  update() {
    if (!this.edgeGlow || !this.worldBounds) {
      return
    }
    const cam = this.cameras.main
    const padding = 120
    const nearEdge =
      cam.scrollX < padding ||
      cam.scrollY < padding ||
      cam.scrollX + cam.width > this.worldBounds.width - padding ||
      cam.scrollY + cam.height > this.worldBounds.height - padding
    this.edgeGlow.setAlpha(nearEdge ? 0.18 : 0.04)
  }

  private layoutHud(width: number, height: number) {
    if (!this.hudBar || !this.titleText || !this.welcomeText || !this.tickText || !this.fpsText || !this.wsText) {
      return
    }
    this.hudBar.setPosition(width / 2, 28)
    this.hudBar.setSize(width, 56)
    this.titleText.setPosition(24, 8)
    this.welcomeText.setPosition(24, 32)
    this.tickText.setPosition(width - 24, 10)
    this.fpsText.setPosition(width - 24, 32)
    this.wsText.setPosition(width / 2, height - 18)
  }

  update() {
    for (const [id, sprite] of this.agentSprites.entries()) {
      const target = this.agentTargets.get(id)
      if (!target) {
        continue
      }
      sprite.x = target.x
      sprite.y = target.y
    }
    if (this.fpsText) {
      this.fpsText.setText(`fps: ${Math.round(this.game.loop.actualFps)}`)
    }
    if (!this.edgeGlow || !this.worldBounds) {
      return
    }
    const cam = this.cameras.main
    const padding = 120
    const nearEdge =
      cam.scrollX < padding ||
      cam.scrollY < padding ||
      cam.scrollX + cam.width > this.worldBounds.width - padding ||
      cam.scrollY + cam.height > this.worldBounds.height - padding
    this.edgeGlow.setAlpha(nearEdge ? 0.18 : 0.04)
  }
}
