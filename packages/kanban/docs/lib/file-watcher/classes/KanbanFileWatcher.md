[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/file-watcher](../README.md) / KanbanFileWatcher

# Class: KanbanFileWatcher

Defined in: [lib/file-watcher.ts:81](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L81)

File watcher for kanban development mode

Monitors board files, task files, and configuration files for changes
and provides debounced event notifications to avoid excessive processing.

## Constructors

### Constructor

> **new KanbanFileWatcher**(`options`, `callbacks`): `KanbanFileWatcher`

Defined in: [lib/file-watcher.ts:98](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L98)

Creates a new KanbanFileWatcher instance

#### Parameters

##### options

[`FileWatcherOptions`](../type-aliases/FileWatcherOptions.md)

Configuration options for the watcher

##### callbacks

[`FileWatcherCallbacks`](../type-aliases/FileWatcherCallbacks.md)

Event callback functions

#### Returns

`KanbanFileWatcher`

## Methods

### start()

> **start**(): `void`

Defined in: [lib/file-watcher.ts:132](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L132)

Starts the file watcher

Begins monitoring the configured files and directories for changes.
If a watcher is already running, it will be stopped first.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [lib/file-watcher.ts:188](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L188)

Stops the file watcher

Stops monitoring files and cleans up resources.

#### Returns

`void`

***

### isWatching()

> **isWatching**(): `boolean`

Defined in: [lib/file-watcher.ts:242](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L242)

Checks if the file watcher is currently active

#### Returns

`boolean`

True if watching files, false otherwise

***

### getWatchedPaths()

> **getWatchedPaths**(): readonly `string`[]

Defined in: [lib/file-watcher.ts:250](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L250)

Gets the list of paths currently being watched

#### Returns

readonly `string`[]

Array of watched directory paths
