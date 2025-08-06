# index.js

**Path**: `services/js/broker/index.js`

**Description**: WebSocket-based message broker providing a simple pub/sub event bus. It normalizes published messages and routes them to subscribers based on topic. Supports optional correlation IDs and reply topics for request/response patterns. Includes a lightweight task queue with TTL-based expiration and pull-based retrieval.

## Dependencies
- ws

## Dependents
- `services/js/broker/tests/broker.test.js`
