# Health Service

**Path**: `services/js/health/index.js`

Listens for heartbeat events from the message broker and exposes a `/health`
endpoint with aggregated CPU and memory utilization. Other services can poll
this endpoint to decide when to throttle their workloads.
