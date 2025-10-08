[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/dev-server](../README.md) / KanbanDevServer

# Class: KanbanDevServer

Defined in: [lib/dev-server.ts:68](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L68)

Development server for kanban boards with real-time synchronization

Combines file watching, git synchronization, and WebSocket communication
to provide a live development experience for kanban board management.

## Constructors

### Constructor

> **new KanbanDevServer**(`options`): `KanbanDevServer`

Defined in: [lib/dev-server.ts:85](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L85)

Creates a new KanbanDevServer instance

#### Parameters

##### options

[`DevServerOptions`](../type-aliases/DevServerOptions.md)

Configuration options for the development server

#### Returns

`KanbanDevServer`

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [lib/dev-server.ts:108](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L108)

Starts the development server

Initializes file watching, git synchronization, HTTP server,
and WebSocket connections. If autoOpen is enabled, opens the browser.

#### Returns

`Promise`\<`void`\>

#### Throws

Error if server fails to start

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [lib/dev-server.ts:152](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L152)

Stops the development server

Gracefully shuts down file watching, git synchronization,
WebSocket connections, and HTTP server.

#### Returns

`Promise`\<`void`\>

***

### getStatus()

> **getStatus**(): [`DevServerStatus`](../type-aliases/DevServerStatus.md)

Defined in: [lib/dev-server.ts:477](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L477)

Gets the current status of the development server

#### Returns

[`DevServerStatus`](../type-aliases/DevServerStatus.md)

Current server status
