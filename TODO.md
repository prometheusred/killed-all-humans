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
- [ ] Define agent state + movement intent protocol
- [ ] Add static obstacles to world state
- [ ] Implement basic obstacle-aware movement on server
- [ ] Add selection + right-click move on client
- [ ] Render simple agent visuals + move indicator
