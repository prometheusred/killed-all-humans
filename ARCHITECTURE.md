killed-all-humans – ARCHITECTURE

Audience: humans + agents; canonical system design and structure.

This document describes the high-level architecture for killed-all-humans.

The initial goal (v0) is a “hello world” multiplayer sandbox skeleton:

A Python backend using FastAPI and WebSockets, running a simple tick loop.

A TypeScript frontend using Vite and Phaser 3, connecting to the backend via WebSocket.

A single repository containing both parts, with a clean separation between backend, frontend, shared protocol, and (later) an Electron wrapper.

Later this will grow into a small RTS-style agent playground: multiple units, simple world rules, and eventually LLM/VLM-driven agents. v0 is strictly about wiring up a working end-to-end stack.

Repository Layout

The repository is a single monorepo containing all major parts:

killed-all-humans/
backend/ Python backend (FastAPI + WebSocket + game loop)
frontend/ TypeScript frontend (Vite + Phaser, managed by pnpm)
shared/ Shared protocol/types/docs (optional for v0)
electron/ Electron wrapper around the frontend (for later)
ARCHITECTURE.md, AGENTS.md, PROTOCOL.md
README.md, TODO.md, CONTEXT.md
.gitignore

1.1 backend/

The backend is a Python project managed using uv. It uses FastAPI for HTTP + WebSockets and uvicorn as the ASGI server. It contains a minimal game loop that ticks on an interval and broadcasts a dummy state.

Target layout:

backend/
pyproject.toml
uv.lock
src/
app/
__init__.py
main.py
game_loop.py
state.py
connections.py

1.2 frontend/

The frontend is a Vite + TypeScript app managed using pnpm. It uses Phaser 3 for rendering. It connects to the backend WebSocket at ws://localhost:8000/ws during development and displays messages from the server.

Target layout:

frontend/
package.json
pnpm-lock.yaml
tsconfig.json
vite.config.ts
index.html
src/
main.ts
game/
MainScene.ts
net/
wsClient.ts

1.3 shared/

This folder is optional in v0 and can simply store PROTOCOL.md. Later it can contain shared TypeScript and/or Python definitions or schemas that help keep the client and server in sync.

Example:

shared/
protocol/
PROTOCOL.md

1.4 electron/

For v0 this can be empty. Later it will contain a minimal Electron wrapper around the built frontend so the game can run as a desktop app and eventually interact more deeply with the OS.

Example future layout:

electron/
package.json
main.ts
preload.ts

Backend Architecture (hello world)

Tooling:

Python 3.11+

uv for dependency/environment management

FastAPI and uvicorn for serving HTTP/WebSocket

Developer scaffolding from an empty backend/ folder:

cd backend

uv init --app (or create a pyproject.toml manually)

uv add fastapi uvicorn[standard]

After this, pyproject.toml should include at least:

fastapi

uvicorn[standard]

Running the backend during development:

cd backend
uv run uvicorn app.main:app --reload --app-dir src

Backend requirements for hello world:

main.py must create a FastAPI app instance.

There should be a GET /health endpoint returning {"status": "ok"}.

There should be a WebSocket route at /ws that:

accepts the WebSocket connection

registers it in a ConnectionManager

sends a JSON welcome message, for example:
{"type": "welcome", "message": "hello from backend"}

logs or echoes any incoming messages (for now)

Game loop:

game_loop.py must define an async loop that:

ticks every 0.2–1.0 seconds (for hello world)

increments a tick counter in GameState

broadcasts a JSON message to all connected clients via ConnectionManager.broadcast()

Example state broadcast:

{"type": "state", "tick": 42, "message": "hello from game loop"}

Startup:

main.py should start the game loop from a FastAPI startup handler using asyncio.create_task(). The game loop should receive access to the GameState and ConnectionManager instances so it can update state and broadcast.

Connection management:

connections.py defines ConnectionManager with methods like:

async connect(websocket)

disconnect(websocket)

async broadcast(data_dict)

ConnectionManager stores active WebSocket connections and handles broken connections gracefully: when a send fails, the connection is removed.

State representation:

state.py defines GameState. For hello world, GameState can be minimal:

tick: integer counter

optional other fields for future expansion

Frontend Architecture (hello world)

Tooling:

Node LTS

pnpm (instead of npm)

Vite + TypeScript

Phaser 3

Developer scaffolding from an empty frontend/ folder:

Option A (Vite template first):

cd frontend

pnpm create vite . (choose vanilla-ts)

pnpm add phaser

Option B (manual):

cd frontend

pnpm init

pnpm add phaser

pnpm add -D vite typescript @types/node

In either case, ensure:

package.json has scripts including "dev": "vite"

tsconfig.json exists and TypeScript is configured

vite.config.ts is present

Running the frontend during development:

cd frontend
pnpm install
pnpm run dev

Then open http://localhost:5173
 in a browser.

Frontend requirements for hello world:

src/main.ts should construct a Phaser Game instance and register MainScene.

src/game/MainScene.ts should define a simple Phaser scene with:

preload(): optional, for assets

create(): displays “killed-all-humans” and connects to the backend WebSocket

update(): optional, for future per-frame logic

WebSocket client:

src/net/wsClient.ts should:

expose a connect(onMessage: (msg: any) => void) function that:

creates a WebSocket to ws://localhost:8000/ws

registers onopen and onmessage handlers

parses incoming JSON messages and passes them to onMessage

Optionally, wsClient.ts can also export a send(ws: WebSocket, message: any) helper for client-to-server messages later.

MainScene behavior for hello world:

On scene creation, call connect() from wsClient.ts.

When a "welcome" message is received, show the message text in the scene.

When a "state" message is received, update a text label showing the current tick value.

Hello World Flow (end-to-end)

End-to-end behavior for v0:

Backend is running:

cd backend
uv run uvicorn app.main:app --reload --app-dir src

Frontend is running:

cd frontend
pnpm install (first time only)
pnpm run dev
open http://localhost:5173
 in the browser

On page load:

Vite serves the frontend.

Phaser creates MainScene.

MainScene calls connect(), opening a WebSocket to ws://localhost:8000/ws.

Backend:

Accepts the WebSocket.

Sends a "welcome" JSON message.

game_loop() is running and periodically broadcasts "state" messages with an incrementing tick counter.

Client:

Receives the "welcome" message and displays its text.

Receives "state" messages and updates a visible tick counter in the scene.

The hello world architecture is considered validated when:

The Phaser scene renders successfully.

A dynamic tick value in the scene clearly updates over time, in sync with messages from the Python backend’s game loop.

v1 (next milestone)

Goal: a minimally interactive, multiplayer sandbox with controllable agents.

High-level scope:

- Authoritative server owns unit state and movement.
- World model uses free-form XY coordinates with simple static obstacles.
- One controllable agent per connected client (for now).
- Client input: click to select, click off to deselect, right-click to move.
- Server receives move intents and advances positions on each tick, with basic bounds/collision handling (pathfinding deferred).
- Client renders positions, basic move indicator, and simple motion cues.

Notes:
- World size (v1): 2400x1400 world-space units.
- Obstacles (v1): axis-aligned rectangles in world coordinates.
- Movement (v1): straight-line motion at ~300 units/sec with circle-vs-rect collision.
- Dynamic agent avoidance and pathfinding are deferred until after v1.
- Visuals should be minimal but distinct (e.g., simple robot-like shapes).
- Tick rate can be increased (e.g., 10–20 Hz) for smoother motion.

Future Extensions (not required for hello world)

These are explicitly out of scope until the basic hello world works:

Electron wrapper in /electron that loads the built frontend assets.

Game entities and spatial grid in GameState (units with x/y positions, ownership, simple actions).

Intent-based protocol (messages like move_unit, spawn_unit, etc.).

State diffs instead of full snapshots.

LLM/VLM “agent player” tasks that observe game state and emit intents.

Authentication, persistence, matchmaking, accounts, etc.

The only objective of v0 is:

Backend (FastAPI + WebSocket, using uv) <-> Frontend (Vite + Phaser, using pnpm) communication working with a ticking counter visible in the game scene.
