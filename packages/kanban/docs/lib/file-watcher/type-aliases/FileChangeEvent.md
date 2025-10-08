[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/file-watcher](../README.md) / FileChangeEvent

# Type Alias: FileChangeEvent

> **FileChangeEvent** = `object`

Defined in: [lib/file-watcher.ts:38](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L38)

Represents a file change event detected by the watcher

## Properties

### type

> `readonly` **type**: `"board"` \| `"task"` \| `"config"`

Defined in: [lib/file-watcher.ts:40](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L40)

Type of file that changed

***

### filePath

> `readonly` **filePath**: `string`

Defined in: [lib/file-watcher.ts:42](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L42)

Absolute path to the changed file

***

### relativePath

> `readonly` **relativePath**: `string`

Defined in: [lib/file-watcher.ts:44](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L44)

Path relative to current working directory

***

### event

> `readonly` **event**: `"add"` \| `"change"` \| `"unlink"`

Defined in: [lib/file-watcher.ts:46](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L46)

Type of file system event
