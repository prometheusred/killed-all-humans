import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from app.connections import ConnectionManager
from app.game_loop import run_game_loop
from app.state import GameState

app = FastAPI()
state = GameState()
manager = ConnectionManager()
player_by_socket: dict[WebSocket, int] = {}
agent_by_socket: dict[WebSocket, int] = {}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    player_id = state.assign_player_id()
    agent = state.spawn_agent(owner=player_id)
    player_by_socket[websocket] = player_id
    agent_by_socket[websocket] = agent.id
    await websocket.send_json(
        {
            "type": "welcome",
            "message": "what's even the point?",
            "player_id": player_id,
        }
    )
    await websocket.send_json(state.to_world_state())
    try:
        while True:
            message = await websocket.receive_text()
            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {
                        "type": "error",
                        "code": "invalid_json",
                        "message": "payload is not valid JSON",
                    }
                )
                continue

            if payload.get("type") == "move_intent":
                agent_id = payload.get("agent_id")
                target = payload.get("target")
                if not isinstance(agent_id, int) or not isinstance(target, dict):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "code": "invalid_payload",
                            "message": "move_intent requires agent_id and target",
                        }
                    )
                    continue
                agent = state.agents.get(agent_id)
                if agent is None:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "code": "unknown_agent",
                            "message": "agent_id not found",
                        }
                    )
                    continue
                if agent_by_socket.get(websocket) != agent_id:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "code": "not_owner",
                            "message": "agent_id is not owned by this connection",
                        }
                    )
                    continue
                try:
                    agent.target_x = float(target.get("x", agent.x))
                    agent.target_y = float(target.get("y", agent.y))
                except (TypeError, ValueError):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "code": "invalid_payload",
                            "message": "target coordinates must be numbers",
                        }
                    )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        player_by_socket.pop(websocket, None)
        agent_id = agent_by_socket.pop(websocket, None)
        if agent_id is not None:
            state.agents.pop(agent_id, None)


@app.on_event("startup")
async def startup() -> None:
    asyncio.create_task(run_game_loop(state, manager))
