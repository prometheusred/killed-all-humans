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
- [ ] 1) Define protocol
- [ ]    - Add player_id to welcome
- [ ]    - Add world_state (bounds, obstacles, agents)
- [ ]    - Add move_intent (agent_id, target)
- [ ] 2) Build server state
- [ ]    - Define world bounds (2400x1400)
- [ ]    - Define static obstacles (AABB rectangles)
- [ ]    - Track agents (id, owner, position, target, radius)
- [ ] 3) Handle connections
- [ ]    - Assign incremental player_id
- [ ]    - Spawn one agent per connection
- [ ]    - Broadcast world_state each tick
- [ ] 4) Implement movement
- [ ]    - Straight-line motion at ~300 units/sec
- [ ]    - Circle-vs-rect collision
- [ ]    - Stop on bounds/obstacle collision
- [ ] 5) Update client input/render
- [ ]    - Render agents + obstacles
- [ ]    - Click to select/deselect
- [ ]    - Right-click sends move_intent
- [ ] 6) Smooth visuals
- [ ]    - Linear interpolation for remote agents
- [ ] 7) Polish
- [ ]    - Move indicator + name/ID label
