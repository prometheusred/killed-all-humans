# killed-all-humans – AGENTS
Audience: Codex (workflow rules and constraints).

## Purpose
This file defines how Codex should operate in this repo. Project design and architecture live in `ARCHITECTURE.md`.

## Tooling rules
- Backend uses `uv` for Python dependencies and environments.
- Frontend uses `pnpm` for JavaScript/TypeScript dependencies.
- Do not use npm or yarn in this repo.

## Codex behavior
- Respect the layout in `ARCHITECTURE.md`.
- Avoid introducing new major dependencies without a clear reason and doc updates.
- Prefer minimal, incremental changes unless asked for sweeping rewrites.
- Keep behavior identical when refactoring unless explicitly requested.
- Keep message schemas in `PROTOCOL.md` in sync with code changes.

## Documentation hygiene
- Keep `README.md` and `AGENTS.md` aligned on workflow expectations.
- Keep `ARCHITECTURE.md` updated as the system evolves.
- Keep `TODO.md` current as tasks change.
- Keep `CONTEXT.md` updated with raw links for external tools.
- Keep editor settings (e.g., `.vscode/settings.json`) aligned with tooling.
- Share Codex CLI workflow tips when relevant (skills, agent loops, automation).

## Guardrails
- No databases, ORMs, or persistence layers at this stage.
- No auth, accounts, or matchmaking yet.
- Avoid heavy frontend state libraries; prefer simple scene-level state.
- Optimize for clarity and debuggability.
