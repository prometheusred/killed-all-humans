import Phaser from 'phaser'

import { connect, type WsMessage } from '../net/wsClient'

export class MainScene extends Phaser.Scene {
  private tickText?: Phaser.GameObjects.Text
  private welcomeText?: Phaser.GameObjects.Text

  create() {
    const width = this.scale.width
    const height = this.scale.height

    const title = this.add
      .text(width / 2, 48, 'killed-all-humans', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '32px',
        color: '#e6edf3',
      })
      .setOrigin(0.5, 0.5)

    this.welcomeText = this.add
      .text(width / 2, 100, 'connecting...', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '16px',
        color: '#9fb3c8',
      })
      .setOrigin(0.5, 0.5)

    this.tickText = this.add
      .text(width / 2, 130, 'tick: --', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '18px',
        color: '#c8e1ff',
      })
      .setOrigin(0.5, 0.5)

    const glow = this.add
      .rectangle(width / 2, height / 2 + 40, 260, 120, 0x111827, 0.8)
      .setStrokeStyle(2, 0x1f6feb, 0.8)

    const avatar = this.add.rectangle(width / 2 - 90, height / 2 + 40, 50, 50, 0x23d18b)

    this.tweens.add({
      targets: [glow, avatar],
      y: '+=12',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    connect((msg: WsMessage) => {
      if (msg.type === 'welcome' && this.welcomeText) {
        this.welcomeText.setText(msg.message ?? 'connected')
      }
      if (msg.type === 'state' && this.tickText) {
        this.tickText.setText(`tick: ${msg.tick ?? '--'}`)
      }
    })

    this.add
      .text(width / 2, height - 40, 'ws://localhost:8000/ws', {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '14px',
        color: '#7d8590',
      })
      .setOrigin(0.5, 0.5)
  }
}
