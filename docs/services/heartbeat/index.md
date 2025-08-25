# index.js

**Path**: `services/js/heartbeat/index.js`

**Description**: Service that subscribes to the message broker topic `heartbeat`, recording process heartbeats in MongoDB, enforcing per-app instance limits and capturing CPU, memory, and network metrics. Each document stores a service-instance session ID so restarts ignore stale entries and shutdowns mark them as killed. The service exposes no HTTP endpoints.

Producer guidance: All services must publish `{ pid: number, name: string }` heartbeats via their runtime's canonical broker client so that loss of broker connectivity stops heartbeats and stale processes are reaped.

- Python: `shared.py.service_template` (preferred) or `shared.py.heartbeat_broker`
- JS/TS: `shared/js/heartbeat` (wraps `@shared/js/brokerClient.js`)

## Dependencies
- mongodb
- pidusage
- fs
- path

## Dependents
- `services/js/heartbeat/tests/heartbeat.test.js`
- `services/js/heartbeat/tests/client.test.js`
