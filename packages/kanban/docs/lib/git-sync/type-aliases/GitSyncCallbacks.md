[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/git-sync](../README.md) / GitSyncCallbacks

# Type Alias: GitSyncCallbacks

> **GitSyncCallbacks** = `object`

Defined in: [lib/git-sync.ts:46](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L46)

Callback functions for git synchronization events

## Properties

### onSyncStart()?

> `readonly` `optional` **onSyncStart**: (`operation`) => `void`

Defined in: [lib/git-sync.ts:48](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L48)

Called when a sync operation starts

#### Parameters

##### operation

`"push"` | `"pull"` | `"status"`

#### Returns

`void`

***

### onSyncComplete()?

> `readonly` `optional` **onSyncComplete**: (`operation`, `result`) => `void`

Defined in: [lib/git-sync.ts:50](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L50)

Called when a sync operation completes successfully

#### Parameters

##### operation

`"push"` | `"pull"` | `"status"`

##### result

[`GitSyncStatus`](GitSyncStatus.md)

#### Returns

`void`

***

### onSyncError()?

> `readonly` `optional` **onSyncError**: (`operation`, `error`) => `void`

Defined in: [lib/git-sync.ts:52](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L52)

Called when a sync operation encounters an error

#### Parameters

##### operation

`"push"` | `"pull"` | `"status"`

##### error

`Error`

#### Returns

`void`

***

### onConflict()?

> `readonly` `optional` **onConflict**: (`conflictedFiles`) => `void`

Defined in: [lib/git-sync.ts:54](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L54)

Called when git conflicts are detected

#### Parameters

##### conflictedFiles

`ReadonlyArray`\<`string`\>

#### Returns

`void`
