export type WsMessage = {
  type: string
  message?: string
  tick?: number
}

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
