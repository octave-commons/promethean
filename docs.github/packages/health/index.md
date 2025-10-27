# index.js

**Path**: `services/js/health/index.js`

**Description**: Express service that subscribes to heartbeat events from the message broker and returns overall CPU and memory load via a `/health` endpoint. The response includes total and normalized ratios so other services can determine when to throttle.

## Dependencies
- express
- ws
- os

## Dependents
- `services/js/health/tests/health.test.js`
