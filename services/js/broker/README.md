# Message Broker Service (Node.js)

Simple WebSocket-based pub/sub broker. Services connect and exchange messages through
topics instead of direct links. Messages are normalized into a common event format and
routed to subscribers by topic.

## Protocol

Clients send JSON messages:

- `{"action":"subscribe","topic":"example.topic"}`
- `{"action":"unsubscribe","topic":"example.topic"}`
- `{"action":"publish","message":{...}}`

Published messages are normalized to:

```json
{
  "type": "example.topic",
  "source": "publisher-id",
  "payload": { "key": "value" },
  "timestamp": "2025-08-06T01:23:45Z",
  "correlationId": "optional",
  "replyTo": "optional.topic"
}
```

Subscribers receive `{ "event": <normalized message> }` envelopes.

## Task Queues

The broker also provides simple task queue semantics. Clients may enqueue work items and workers may pull them one at a time. Each task receives an ID and optional TTL (default 60s). Expired tasks decay out of the buffer and are not delivered.

### Actions

- `{"action":"enqueue","queue":"jobs","task":{...},"ttl":1000}`
- `{"action":"pull","queue":"jobs"}` → server responds with `{ "task": { "id": "...", "payload": { ... }, "queue": "jobs" } }` or `{ "task": null, "queue": "jobs" }` if empty or expired
- `{"action":"ack","taskId":"..."}` (optional no-op)
- `{"action":"fail","taskId":"...","reason":"..."}` (optional no-op)

If a Redis server is available (configured via `REDIS_URL` or default `redis://127.0.0.1:6379`), queues are persisted in Redis. Otherwise, an in-memory queue is used.

## Development

```
npm install
npm test
```
