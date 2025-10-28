[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/dev-server](../README.md) / DevServerOptions

# Type Alias: DevServerOptions

> **DevServerOptions** = `object`

Defined in: [lib/dev-server.ts:13](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L13)

Configuration options for the development server

## Properties

### boardFile

> `readonly` **boardFile**: `string`

Defined in: [lib/dev-server.ts:15](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L15)

Path to the kanban board file

***

### tasksDir

> `readonly` **tasksDir**: `string`

Defined in: [lib/dev-server.ts:17](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L17)

Path to the tasks directory

***

### host?

> `readonly` `optional` **host**: `string`

Defined in: [lib/dev-server.ts:19](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L19)

Server host (default: 127.0.0.1)

***

### port?

> `readonly` `optional` **port**: `number`

Defined in: [lib/dev-server.ts:21](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L21)

Server port (default: 3000)

***

### autoGit?

> `readonly` `optional` **autoGit**: `boolean`

Defined in: [lib/dev-server.ts:23](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L23)

Enable automatic git synchronization

***

### autoOpen?

> `readonly` `optional` **autoOpen**: `boolean`

Defined in: [lib/dev-server.ts:25](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L25)

Automatically open browser on startup

***

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: [lib/dev-server.ts:27](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/dev-server.ts#L27)

Debounce delay for file changes in milliseconds
