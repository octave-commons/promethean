# Health Service

**Path**: `services/js/health/index.js`

Aggregates heartbeat metrics from MongoDB and exposes a `/health` endpoint with
overall CPU and memory utilization. Other services can poll this endpoint to
decide when to throttle their workloads.
