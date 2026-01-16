import asyncio

from app.connections import ConnectionManager
from app.state import GameState


async def run_game_loop(
    state: GameState, manager: ConnectionManager, interval: float = 0.05
) -> None:
    while True:
        await asyncio.sleep(interval)
        state.tick += 1
        state.step_agents(interval)
        await manager.broadcast(state.to_world_state())
