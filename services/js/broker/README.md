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

## Development

```
npm install
npm test
```
