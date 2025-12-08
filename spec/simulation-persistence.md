# Simulation Persistence and Streaming

## Scope

Implement a single-active simulation model with server-side physics, Redis-backed state/tick queue, RabbitMQ event fan-out, and UI consumption by session via SSE.

## Current state

- Simulations are created/started/stopped via GraphQL; session manager spawns a runner process per session, storing JSON state/logs under `.space/simulations/{id}`.
- UI lists sessions and renders a graph based on global graph state; graph event stream `/api/graph/events` does not scope by session.
- Redis/RabbitMQ not yet used for simulation persistence; graph streaming exists but not tied to session-specific backend.

## Requirements

- Only one active simulation at a time; activating a session deactivates others.
- Physics runs server-side only; UI is view/editor.
- Redis as primary state store and tick queue:
  - `sim:{id}:state` → current frame/nodes/edges
  - `sim:{id}:tick_queue` → pending ticks (stream/list)
  - optional `sim:active` key to mark active session
- RabbitMQ as event bus:
  - Exchange `kg.sim`; routes `sim.state` (full), `sim.delta` (per tick), `sim.status` (start/stop/error)
- SSE endpoint `/api/graph/events?sessionId={id}`:
  - On connect: load full state from Redis and stream it
  - Subscribe to RabbitMQ deltas for that session; fallback to Redis poll if bus is down
- UI:
  - Selecting a session sets it active (mutation) and subscribes SSE with `sessionId`
  - Show channel/status/last update; buttons show busy/disabled states; auto-refresh session list

## Definition of done

- Backend enforces single active session and persists state/ticks to Redis.
- SSE streams session-scoped graph (full + deltas) sourced from Redis/RabbitMQ; fallback to Redis polling works.
- UI targets the active session (start/stop/set-active) and displays streaming status.
- Tests updated/added to cover session activation, Redis-backed state fetch, and SSE handler without real RabbitMQ.
