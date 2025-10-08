[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/file-watcher](../README.md) / FileWatcherOptions

# Type Alias: FileWatcherOptions

> **FileWatcherOptions** = `object`

Defined in: [lib/file-watcher.ts:52](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L52)

Configuration options for the file watcher

## Properties

### boardFile

> `readonly` **boardFile**: `string`

Defined in: [lib/file-watcher.ts:54](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L54)

Absolute path to the kanban board file

***

### tasksDir

> `readonly` **tasksDir**: `string`

Defined in: [lib/file-watcher.ts:56](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L56)

Absolute path to the tasks directory

***

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: [lib/file-watcher.ts:58](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L58)

Debounce delay in milliseconds for file change events

***

### ignored?

> `readonly` `optional` **ignored**: `ReadonlyArray`\<`string`\>

Defined in: [lib/file-watcher.ts:60](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L60)

Array of glob patterns to ignore
