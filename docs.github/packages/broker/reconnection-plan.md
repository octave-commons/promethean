# Broker Reconnection Problem

## Problem Statement

The broker service frequently tears down and re-establishes WebSocket connections for every request. These repeated reconnections increase latency, drop in-flight messages, and create unnecessary load on both clients and the broker.

## Goals

- Reuse an existing WebSocket session for at least **15 minutes** under normal network conditions.
- Limit reconnections to network errors or explicit session invalidation events.

## Acceptance Criteria

- `shared/js/brokerClient.js` maintains a persistent connection and exposes a heartbeat or keepalive to detect stale links.
- Service initialization scripts use the shared client and do not create new connections per request.
- Telemetry shows no more than one reconnection per client within a 15‑minute window during nominal operation.

## References

- `shared/js/brokerClient.js`$../../../shared/js/brokerClient.js
- Service initialization scripts such as `services/js/**/index.js` and equivalent startup files in other runtimes.
