import asyncio

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from app.connections import ConnectionManager
from app.game_loop import run_game_loop
from app.state import GameState

app = FastAPI()
state = GameState()
manager = ConnectionManager()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    await websocket.send_json({"type": "welcome", "message": "hello from backend"})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.on_event("startup")
async def startup() -> None:
    asyncio.create_task(run_game_loop(state, manager))
