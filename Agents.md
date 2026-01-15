Codex Guide for killed-all-humans

idea and inspiration

You are helping develop a small RTS-style multiplayer sandbox called "killed all humans". This project is a playground for:

experimenting with AI-infused coding workflows using Codex and ChatGPT

getting experience with modern tooling (uv, pnpm, FastAPI, Vite, Phaser, WebSockets)

playing with ideas around LLMs/VLMs, weird interactive experiences, and blurring the line between “play” and “building the platform for play”

The name "killed all humans" also comes from a narrative game idea about a broken-hearted robot who (accidentally or intentionally) killed all humans and is physically and emotionally damaged. Long term, the project may explore narrative, agents, and emergent behavior. Short term, the focus is a small, 2D RTS-like world with multiplayer mechanics and eventually LLM-driven agents.

repo layout

The repo is a single monorepo. The intended layout is:

backend/: Python (FastAPI + WebSockets + asyncio) – authoritative game server

frontend/: TypeScript (Vite + Phaser 3, managed with pnpm) – client

electron/: Electron wrapper (later) – desktop shell around the frontend

shared/: any shared protocol/types (optional at first)

Documentation lives at repo root for now:
Architecture.md, Agents.md, Protocol.md (when created).

Follow Architecture.md for the current canonical structure.

tooling rules

Python (backend):

Use uv to manage Python dependencies and virtual environment for backend/.

Dependencies are declared in backend/pyproject.toml and locked in uv.lock.

Prefer commands like:

uv add fastapi uvicorn[standard]

uv run uvicorn app.main:app --reload --app-dir src

TypeScript/JavaScript (frontend):

Use pnpm as the package manager for frontend/.

Do not use npm or yarn commands in this repo.

Prefer commands like:

pnpm install

pnpm add phaser

pnpm add -D vite typescript @types/node

pnpm run dev

Electron (later):

When Electron is introduced, it should live under electron/ with its own package.json.

It should wrap the built frontend (from frontend/dist) and not duplicate frontend logic.

architecture rules

The server is authoritative. Clients only send intents and render state; they do not own truth.

WebSocket messages must be JSON and, when defined, must follow Protocol.md.

The backend runs a periodic game loop that updates GameState and broadcasts state messages.

The frontend connects via WebSocket, receives JSON messages, and updates the Phaser scene accordingly.

The Electron wrapper is a thin shell around the frontend and does not replace the client-server model.

coding style and structure

Keep functions small and readable. Prefer composition over huge monolithic classes.

Group related logic into modules:

backend/src/app/main.py: FastAPI app and wiring

backend/src/app/game_loop.py: main tick loop

backend/src/app/state.py: GameState/Data models

backend/src/app/connections.py: WebSocket connection management

frontend/src/game/: Phaser scenes and game logic

frontend/src/net/: WebSocket client and networking helpers

Use async/await and non-blocking patterns in Python, especially for network and loop logic.

Prefer explicit types in TypeScript for messages and state where reasonable.

protocol and docs rules

If you introduce or change any client–server message format, update docs/PROTOCOL.md with:

message type name

direction (client -> server, server -> client)

field names and types

example JSON payloads

Architecture.md is the source of truth for high-level layout and hello-world behavior. Keep it consistent with the codebase when making structural changes.

Agents.md (this file) is the guide for how Codex should behave. If major workflow changes occur (e.g., new package managers, new layout), update this file.

behavior for Codex

When you (Codex) are editing this repo:

Always respect the existing layout described in Architecture.md.

Use uv for Python dependency management in backend/.

Use pnpm for JavaScript/TypeScript dependency management in frontend/.

Do not introduce new major dependencies (frameworks, databases, etc.) without:

a clear reason in comments

updating Architecture.md if the architecture changes

Prefer incremental, minimal changes over large, sweeping rewrites unless explicitly requested.

When you refactor:

keep behavior identical unless requested otherwise

explain significant refactors in code comments or commit messages (if present)

When uncertain about types or message formats:

propose a clear, simple schema

update Protocol.md accordingly

keep message shapes symmetric between client (TypeScript types) and server (Pydantic models or equivalent)

Keep README.md and Agents.md aligned on workflow and expectations, but allow each to stay audience-appropriate (human setup vs. Codex behavior).

Keep TODO.md current as work progresses so the team can track v0 status and next steps.

When relevant, share Codex CLI workflow tips or power-user ideas as we go (e.g., skills, agent loops, tooling, automation).

Keep workspace editor settings (e.g., `.vscode/settings.json`) aligned with the repo's tooling and type-checking expectations.

hello world objective (for Codex)

For the initial implementation, focus on achieving this end-to-end behavior:

Backend:

FastAPI app with /health and /ws

A game loop that increments a tick counter and broadcasts it regularly over WebSocket

Frontend:

Phaser scene that:

connects to ws://localhost:8000/ws

shows a welcome message from the server

displays a tick counter that updates as state messages arrive

Once that is working, further work can add units, simple movement, and richer protocol messages.

guardrails

Do not add databases, ORMs, or complex persistence layers at this stage.

Do not add auth, accounts, or matchmaking yet.

Do not introduce heavy state management libraries on the frontend; simple scene-level or module-level state is fine for now.

Focus on clarity and debuggability; this project is also a learning and experimentation environment.

END AGENT.MD (v2)

If you want to move fast tonight:
– Make repo + docs/, drop these in.
– Let Codex scaffold backend/ and frontend/ following this.
– Get /health + /ws + a ticking counter working, then push to GitHub.
