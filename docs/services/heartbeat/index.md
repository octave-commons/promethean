# index.js

**Path**: `services/js/heartbeat/index.js`

**Description**: Express service that records process heartbeats in MongoDB, enforcing per-app instance limits and capturing CPU, memory, and network metrics. Each document stores a service-instance session ID so restarts ignore stale entries and shutdowns mark them as killed.

### Endpoints

- `POST /heartbeat` – record a heartbeat with `{ pid, name }` and resource
  metrics.
- `GET /heartbeats` – return all heartbeat documents.

## Dependencies
- express
- mongodb
- pidusage
- fs
- path

## Dependents
- `services/js/heartbeat/tests/heartbeat.test.js`
- `services/js/heartbeat/tests/client.test.js`
