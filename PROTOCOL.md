# killed-all-humans – PROTOCOL

Audience: humans + agents; message schemas for client/server comms.

This document defines client/server WebSocket messages for v0.

## welcome
- direction: server -> client
- fields:
  - `type`: `"welcome"`
  - `message`: string

Example:
```json
{"type":"welcome","message":"hello from backend"}
```

## state
- direction: server -> client
- fields:
  - `type`: `"state"`
  - `tick`: number
  - `message`: string

Example:
```json
{"type":"state","tick":42,"message":"hello from game loop"}
```
