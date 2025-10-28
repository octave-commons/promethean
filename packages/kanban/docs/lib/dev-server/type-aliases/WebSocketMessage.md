[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/dev-server](../README.md) / WebSocketMessage

# Type Alias: WebSocketMessage

> **WebSocketMessage** = `object`

Defined in: [lib/dev-server.ts:53](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L53)

WebSocket message format for real-time communication

## Properties

### type

> `readonly` **type**: `"board-change"` \| `"task-change"` \| `"config-change"` \| `"sync-status"` \| `"error"` \| `"status"` \| `"sync"`

Defined in: [lib/dev-server.ts:55](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L55)

Type of message

***

### timestamp

> `readonly` **timestamp**: `string`

Defined in: [lib/dev-server.ts:57](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L57)

ISO timestamp of when the message was sent

***

### data

> `readonly` **data**: `unknown`

Defined in: [lib/dev-server.ts:59](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L59)

Message payload
