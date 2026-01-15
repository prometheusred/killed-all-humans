from dataclasses import dataclass


@dataclass
class GameState:
    tick: int = 0

    def to_dict(self) -> dict:
        return {"tick": self.tick}
