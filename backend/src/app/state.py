from __future__ import annotations

from dataclasses import dataclass, field
import random


@dataclass
class Bounds:
    width: int
    height: int

    def to_dict(self) -> dict:
        return {"width": self.width, "height": self.height}


@dataclass
class Obstacle:
    id: int
    x: float
    y: float
    width: float
    height: float

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
        }


@dataclass
class Agent:
    id: int
    owner: int
    x: float
    y: float
    radius: float = 18.0
    primary: str = "#23d18b"
    secondary: str = "#1f6feb"
    accent: str = "#f2cc60"
    target_x: float | None = None
    target_y: float | None = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "owner": self.owner,
            "x": self.x,
            "y": self.y,
            "radius": self.radius,
            "primary": self.primary,
            "secondary": self.secondary,
            "accent": self.accent,
        }


@dataclass
class GameState:
    tick: int = 0
    bounds: Bounds = field(default_factory=lambda: Bounds(width=2400, height=1400))
    obstacles: list[Obstacle] = field(default_factory=list)
    agents: dict[int, Agent] = field(default_factory=dict)
    next_player_id: int = 1
    next_agent_id: int = 1
    rng: random.Random = field(default_factory=random.Random)

    def __post_init__(self) -> None:
        if not self.obstacles:
            self.obstacles = [
                Obstacle(id=1, x=600, y=350, width=220, height=90),
                Obstacle(id=2, x=1300, y=700, width=260, height=120),
                Obstacle(id=3, x=900, y=1050, width=180, height=80),
            ]

    def assign_player_id(self) -> int:
        player_id = self.next_player_id
        self.next_player_id += 1
        return player_id

    def spawn_agent(self, owner: int) -> Agent:
        agent_id = self.next_agent_id
        self.next_agent_id += 1
        primary, secondary, accent = self._palette_from_id(agent_id)
        x, y = self._find_spawn(radius=18.0)
        agent = Agent(
            id=agent_id,
            owner=owner,
            x=x,
            y=y,
            primary=primary,
            secondary=secondary,
            accent=accent,
        )
        self.agents[agent_id] = agent
        return agent

    def to_world_state(self) -> dict:
        return {
            "type": "world_state",
            "tick": self.tick,
            "bounds": self.bounds.to_dict(),
            "agents": [agent.to_dict() for agent in self.agents.values()],
            "obstacles": [obstacle.to_dict() for obstacle in self.obstacles],
        }

    def step_agents(self, dt: float, speed: float = 300.0) -> None:
        for agent in self.agents.values():
            if agent.target_x is None or agent.target_y is None:
                continue
            dx = agent.target_x - agent.x
            dy = agent.target_y - agent.y
            dist_sq = dx * dx + dy * dy
            if dist_sq <= 1e-6:
                agent.target_x = None
                agent.target_y = None
                continue
            dist = dist_sq ** 0.5
            step = min(dist, speed * dt)
            next_x = agent.x + (dx / dist) * step
            next_y = agent.y + (dy / dist) * step
            if not _within_bounds(next_x, next_y, agent.radius, self.bounds):
                agent.target_x = None
                agent.target_y = None
                continue
            if self._collides_obstacle(next_x, next_y, agent.radius):
                agent.target_x = None
                agent.target_y = None
                continue
            agent.x = next_x
            agent.y = next_y
            if step >= dist:
                agent.target_x = None
                agent.target_y = None

    def _palette_from_id(self, agent_id: int) -> tuple[str, str, str]:
        hue = (agent_id * 137.5) % 360
        primary = _hsl_to_hex(hue, 0.62, 0.5)
        secondary = _hsl_to_hex((hue + 40) % 360, 0.55, 0.42)
        accent = _hsl_to_hex((hue + 200) % 360, 0.7, 0.6)
        return primary, secondary, accent

    def _find_spawn(self, radius: float) -> tuple[float, float]:
        margin = radius + 12.0
        max_attempts = 80
        for _ in range(max_attempts):
            x = self.rng.uniform(margin, self.bounds.width - margin)
            y = self.rng.uniform(margin, self.bounds.height - margin)
            if self._collides_obstacle(x, y, radius):
                continue
            if self._collides_agent(x, y, radius):
                continue
            return x, y
        return 200.0, 200.0

    def _collides_obstacle(self, x: float, y: float, radius: float) -> bool:
        for obstacle in self.obstacles:
            if _circle_rect_overlap(x, y, radius, obstacle):
                return True
        return False

    def _collides_agent(self, x: float, y: float, radius: float) -> bool:
        for agent in self.agents.values():
            dx = agent.x - x
            dy = agent.y - y
            if dx * dx + dy * dy < (agent.radius + radius) ** 2:
                return True
        return False


def _circle_rect_overlap(x: float, y: float, radius: float, obstacle: Obstacle) -> bool:
    closest_x = min(max(x, obstacle.x), obstacle.x + obstacle.width)
    closest_y = min(max(y, obstacle.y), obstacle.y + obstacle.height)
    dx = x - closest_x
    dy = y - closest_y
    return dx * dx + dy * dy <= radius * radius


def _within_bounds(x: float, y: float, radius: float, bounds: Bounds) -> bool:
    return radius <= x <= bounds.width - radius and radius <= y <= bounds.height - radius


def _hsl_to_hex(h: float, s: float, l: float) -> str:
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    r, g, b = 0.0, 0.0, 0.0
    if 0 <= h < 60:
        r, g, b = c, x, 0
    elif 60 <= h < 120:
        r, g, b = x, c, 0
    elif 120 <= h < 180:
        r, g, b = 0, c, x
    elif 180 <= h < 240:
        r, g, b = 0, x, c
    elif 240 <= h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    r_i = int((r + m) * 255)
    g_i = int((g + m) * 255)
    b_i = int((b + m) * 255)
    return f"#{r_i:02x}{g_i:02x}{b_i:02x}"
