# {{SERVICE_NAME}} Service

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

The broker also provides simple task queue semantics. Clients may enqueue work items and workers may dequeue them one at a time.

### Actions

- `{"action":"enqueue","queue":"jobs","task":{...}}`
- `{"action":"dequeue","queue":"jobs"}` → server responds with `{ "task": { ... } }` or `{ "task": null }` if empty

If a Redis server is available (configured via `REDIS_URL` or default `redis://127.0.0.1:6379`), queues are persisted in Redis. Otherwise, an in-memory queue is used.

## Development

```
pnpm install
npm test
```
