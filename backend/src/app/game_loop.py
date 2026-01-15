import asyncio

from app.connections import ConnectionManager
from app.state import GameState


async def run_game_loop(
    state: GameState, manager: ConnectionManager, interval: float = 0.2
) -> None:
    while True:
        await asyncio.sleep(interval)
        state.tick += 1
        await manager.broadcast(
            {"type": "state", "tick": state.tick, "message": "hello from game loop"}
        )
