[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/dev-server](../README.md) / DevServerStatus

# Type Alias: DevServerStatus

> **DevServerStatus** = `object`

Defined in: [lib/dev-server.ts:33](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L33)

Status information for the development server

## Properties

### isRunning

> `readonly` **isRunning**: `boolean`

Defined in: [lib/dev-server.ts:35](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L35)

Whether the server is currently running

***

### uptime

> `readonly` **uptime**: `number`

Defined in: [lib/dev-server.ts:37](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L37)

Server uptime in milliseconds

***

### fileWatcherActive

> `readonly` **fileWatcherActive**: `boolean`

Defined in: [lib/dev-server.ts:39](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L39)

Whether the file watcher is active

***

### gitSyncActive

> `readonly` **gitSyncActive**: `boolean`

Defined in: [lib/dev-server.ts:41](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L41)

Whether git synchronization is active

***

### lastSyncTime?

> `readonly` `optional` **lastSyncTime**: `Date`

Defined in: [lib/dev-server.ts:43](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L43)

Timestamp of last synchronization

***

### connectedClients

> `readonly` **connectedClients**: `number`

Defined in: [lib/dev-server.ts:45](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L45)

Number of connected WebSocket clients

***

### syncStatus?

> `readonly` `optional` **syncStatus**: [`GitSyncStatus`](../../git-sync/type-aliases/GitSyncStatus.md)

Defined in: [lib/dev-server.ts:47](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L47)

Current git synchronization status
