[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/file-watcher](../README.md) / FileWatcherCallbacks

# Type Alias: FileWatcherCallbacks

> **FileWatcherCallbacks** = `object`

Defined in: [lib/file-watcher.ts:66](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L66)

Callback functions for file watcher events

## Properties

### onFileChange()

> `readonly` **onFileChange**: (`event`) => `void`

Defined in: [lib/file-watcher.ts:68](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L68)

Called when a relevant file change is detected

#### Parameters

##### event

[`FileChangeEvent`](FileChangeEvent.md)

#### Returns

`void`

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => `void`

Defined in: [lib/file-watcher.ts:70](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L70)

Called when an error occurs during file watching

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onReady()?

> `readonly` `optional` **onReady**: () => `void`

Defined in: [lib/file-watcher.ts:72](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/file-watcher.ts#L72)

Called when the file watcher is ready and watching

#### Returns

`void`
