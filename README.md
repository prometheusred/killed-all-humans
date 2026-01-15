# killed-all-humans

An experimental multiplayer sandbox and coding playground. v0 focuses on a tiny end-to-end loop: a FastAPI WebSocket server broadcasting a tick counter to a Phaser client.

## Goals (v0)
- Prove backend <-> frontend WebSocket communication.
- Render a Phaser scene that displays a welcome message and a live tick counter.
- Keep the stack minimal and easy to iterate on.

## Repo layout (intended)
- `backend/` FastAPI + WebSockets game server (Python, uv)
- `frontend/` Vite + Phaser client (TypeScript, pnpm)
- `shared/` Optional shared protocol/types
- `electron/` Optional desktop wrapper (later)
- `Architecture.md` Canonical architecture and hello-world behavior
- `Agents.md` Codex workflow rules and guardrails
- `Protocol.md` Message definitions (when needed)

## Prereqs
- Python 3.11+
- `uv` for Python env/deps
- Node.js (LTS)
- `pnpm` for frontend deps

## Bootstrap (one-time, per machine)
Install tooling and set up versions:

```bash
# Install uv (Python toolchain)
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.local/bin/env

# Node LTS via nvm (if you use nvm)
nvm install --lts
nvm use --lts
corepack enable

# Pin Python 3.11 for this repo
cd /path/to/killed-all-humans
uv python install 3.11
uv python pin 3.11
```

## Backend setup (dev)
```bash
cd backend
uv init --app
uv add fastapi uvicorn[standard]
uv run uvicorn app.main:app --reload --app-dir src
```

Expected endpoints:
- `GET /health` -> `{"status": "ok"}`
- `WS /ws` -> welcome message + periodic tick updates

## Frontend setup (dev)
```bash
cd frontend
pnpm create vite . --template vanilla-ts
pnpm add phaser
pnpm install
pnpm run dev
```

Open http://localhost:5173 and verify:
- A welcome message from the server
- A tick counter that updates live

## Run both (v0 smoke test)
```bash
# terminal 1
cd backend
uv run uvicorn app.main:app --reload --app-dir src

# terminal 2
cd frontend
pnpm install
pnpm run dev
```

Then open http://localhost:5173 and confirm:
- WebSocket connects (welcome message appears)
- Tick counter updates every ~200ms

## Keeping docs in sync
- `Architecture.md` is the source of truth for structure and hello-world behavior.
- `Agents.md` defines Codex behavior and guardrails.
- This README mirrors the human-facing setup and should be kept consistent with those docs.
- `TODO.md` tracks v0 tasks and should be kept current as progress is made.
- `Protocol.md` defines WebSocket message shapes.

## Notes
- No LLM integration in v0.
- No persistence/auth/matchmaking in v0.
- Keep changes minimal and incremental until the hello-world loop works.
