export type AgentState = {
  id: number
  owner: number
  x: number
  y: number
  radius: number
  primary: string
  secondary: string
  accent: string
}

export type ObstacleState = {
  id: number
  x: number
  y: number
  width: number
  height: number
}

export type WorldBounds = {
  width: number
  height: number
}

export type WsMessage =
  | { type: 'welcome'; message: string; player_id: number }
  | { type: 'world_state'; tick: number; bounds: WorldBounds; agents: AgentState[]; obstacles: ObstacleState[] }
  | { type: string; [key: string]: unknown }

export function connect(onMessage: (msg: WsMessage) => void): WebSocket {
  const ws = new WebSocket('ws://localhost:8000/ws')

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as WsMessage
      onMessage(parsed)
    } catch (error) {
      console.warn('ws: failed to parse message', error)
    }
  }

  ws.onclose = () => {
    console.warn('ws: connection closed')
  }

  return ws
}

export function sendMoveIntent(ws: WebSocket, agentId: number, x: number, y: number) {
  ws.send(
    JSON.stringify({
      type: 'move_intent',
      agent_id: agentId,
      target: { x, y },
    }),
  )
}
