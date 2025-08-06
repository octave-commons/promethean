# index.js

**Path**: `services/js/health/index.js`

**Description**: Express service that aggregates recent heartbeat metrics from MongoDB and returns overall CPU and memory load via a `/health` endpoint. The response includes total and normalized ratios so other services can determine when to throttle.

## Dependencies
- express
- mongodb
- os

## Dependents
- `services/js/health/tests/health.test.js`
