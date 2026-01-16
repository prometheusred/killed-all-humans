# killed-all-humans TODO

Audience: humans + agents; living task list and progress tracker.

## v0 (tonight)
- [x] Bootstrap tooling (uv, Node LTS, corepack) and pin Python 3.11
- [x] Scaffold backend (FastAPI + WebSocket + tick loop)
- [x] Scaffold frontend (Vite + Phaser scene + ws client)
- [x] Wire end-to-end: welcome + live tick counter
- [x] Add minimal visuals (simple background + animated shape)
- [x] Commit lockfiles + initial push

## v1 (next)
- [x] 1) Define protocol
- [x]    - Add player_id to welcome
- [x]    - Add world_state (bounds, obstacles, agents)
- [x]    - Add move_intent (agent_id, target)
- [x] 2) Build server state
- [x]    - Define world bounds (2400x1400)
- [x]    - Define static obstacles (AABB rectangles)
- [x]    - Track agents (id, owner, position, target, radius)
- [x] 3) Handle connections
- [x]    - Assign incremental player_id
- [x]    - Spawn one agent per connection
- [x]    - Broadcast world_state each tick
- [x] 4) Implement movement
- [x]    - Straight-line motion at ~300 units/sec
- [x]    - Circle-vs-rect collision
- [x]    - Stop on bounds/obstacle collision
- [x] 5) Update client input/render
- [x]    - Render agents + obstacles
- [x]    - Click to select/deselect
- [x]    - Right-click sends move_intent
- [ ] 6) Smooth visuals (deferred)
- [ ]    - Linear interpolation for remote agents (deferred)
- [ ] 8) Future networking polish
- [ ]    - Add client-side prediction for local agent
- [ ]    - Add interpolation buffer for remote agents (render in the past)
- [x] 7) Polish
- [x]    - Move indicator + name/ID label
- [x] 8) Basic error responses (invalid payload, not_owner)
