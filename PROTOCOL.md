# killed-all-humans – PROTOCOL

Audience: humans + agents; message schemas for client/server comms.

This document defines client/server WebSocket messages for v0 and v1.

## welcome
- direction: server -> client
- fields:
  - `type`: `"welcome"`
  - `message`: string
  - `player_id`: number

Example:
```json
{"type":"welcome","message":"what's even the point?","player_id":1}
```

## world_state
- direction: server -> client
- fields:
  - `type`: `"world_state"`
  - `tick`: number
  - `bounds`: `{ "width": number, "height": number }`
  - `agents`: array of `{ "id": number, "owner": number, "x": number, "y": number, "radius": number, "primary": string, "secondary": string, "accent": string }`
  - `obstacles`: array of `{ "id": number, "x": number, "y": number, "width": number, "height": number }`

Example:
```json
{"type":"world_state","tick":12,"bounds":{"width":2400,"height":1400},"agents":[{"id":1,"owner":1,"x":420,"y":300,"radius":18,"primary":"#23d18b","secondary":"#1f6feb","accent":"#f2cc60"}],"obstacles":[{"id":1,"x":900,"y":400,"width":180,"height":80}]}
```

## move_intent
- direction: client -> server
- fields:
  - `type`: `"move_intent"`
  - `agent_id`: number
  - `target`: `{ "x": number, "y": number }`

Example:
```json
{"type":"move_intent","agent_id":1,"target":{"x":1200,"y":700}}
```

## error
- direction: server -> client
- fields:
  - `type`: `"error"`
  - `code`: string
  - `message`: string

Example:
```json
{"type":"error","code":"invalid_payload","message":"move_intent missing target"}
```
