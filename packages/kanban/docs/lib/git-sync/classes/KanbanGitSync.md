[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/git-sync](../README.md) / KanbanGitSync

# Class: KanbanGitSync

Defined in: [lib/git-sync.ts:63](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L63)

Git synchronization service for kanban development mode

Provides automatic git operations including push, pull, and conflict detection
with configurable debounce timing and comprehensive error handling.

## Constructors

### Constructor

> **new KanbanGitSync**(`options`, `callbacks`): `KanbanGitSync`

Defined in: [lib/git-sync.ts:76](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L76)

Creates a new KanbanGitSync instance

#### Parameters

##### options

[`GitSyncOptions`](../type-aliases/GitSyncOptions.md)

Configuration options for git synchronization

##### callbacks

[`GitSyncCallbacks`](../type-aliases/GitSyncCallbacks.md) = `{}`

Event callback functions

#### Returns

`KanbanGitSync`

## Methods

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [lib/git-sync.ts:97](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L97)

Initializes the git synchronization service

Validates that we're in a git repository, checks for remote connectivity,
and gets the initial status.

#### Returns

`Promise`\<`void`\>

#### Throws

Error if not in a git repository or other initialization failures

***

### autoPush()

> **autoPush**(`message?`): `Promise`\<`boolean`\>

Defined in: [lib/git-sync.ts:166](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L166)

Automatically pushes changes to remote repository

#### Parameters

##### message?

`string`

Optional commit message

#### Returns

`Promise`\<`boolean`\>

True if push was successful, false otherwise

***

### autoPull()

> **autoPull**(): `Promise`\<`boolean`\>

Defined in: [lib/git-sync.ts:223](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L223)

Automatically pulls changes from remote repository

#### Returns

`Promise`\<`boolean`\>

True if pull was successful, false otherwise

***

### getStatus()

> **getStatus**(): `null` \| [`GitSyncStatus`](../type-aliases/GitSyncStatus.md)

Defined in: [lib/git-sync.ts:320](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L320)

Gets the last known git status

#### Returns

`null` \| [`GitSyncStatus`](../type-aliases/GitSyncStatus.md)

GitSyncStatus or null if no status available

***

### isSyncInProgress()

> **isSyncInProgress**(): `boolean`

Defined in: [lib/git-sync.ts:328](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L328)

Checks if a sync operation is currently in progress

#### Returns

`boolean`

True if syncing, false otherwise

***

### resolveConflicts()

> **resolveConflicts**(`strategy`): `Promise`\<`boolean`\>

Defined in: [lib/git-sync.ts:337](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L337)

Attempts to resolve git conflicts using the specified strategy

#### Parameters

##### strategy

Conflict resolution strategy

`"manual"` | `"ours"` | `"theirs"`

#### Returns

`Promise`\<`boolean`\>

True if conflicts were resolved, false otherwise
