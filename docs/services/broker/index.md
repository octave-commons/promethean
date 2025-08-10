# index.js

**Path**: `services/js/broker/index.js`

**Description**: WebSocket-based message broker providing a simple pub/sub event bus. It normalizes published messages and routes them to subscribers based on topic. Message actions are dispatched through an internal event emitter rather than `if` chains, and the service supports optional correlation IDs and reply topics for request/response patterns.

## Dependencies
- ws

## Dependents
- `services/js/broker/tests/broker.test.js`
