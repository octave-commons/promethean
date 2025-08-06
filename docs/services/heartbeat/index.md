# index.js

**Path**: `services/js/heartbeat/index.js`

**Description**: Express service that records process heartbeats in MongoDB, enforcing per-app instance limits and capturing CPU, memory, and network metrics.

## Dependencies
- express
- mongodb
- pidusage
- fs
- path

## Dependents
- `services/js/heartbeat/tests/heartbeat.test.js`
- `services/js/heartbeat/tests/client.test.js`
