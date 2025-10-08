[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/git-sync](../README.md) / GitSyncStatus

# Type Alias: GitSyncStatus

> **GitSyncStatus** = `object`

Defined in: [lib/git-sync.ts:24](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L24)

Status information for git synchronization

## Properties

### isClean

> `readonly` **isClean**: `boolean`

Defined in: [lib/git-sync.ts:26](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L26)

Whether the working directory is clean

***

### hasChanges

> `readonly` **hasChanges**: `boolean`

Defined in: [lib/git-sync.ts:28](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L28)

Whether there are uncommitted changes

***

### hasRemoteChanges

> `readonly` **hasRemoteChanges**: `boolean`

Defined in: [lib/git-sync.ts:30](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L30)

Whether there are changes available on remote

***

### lastSyncTime?

> `readonly` `optional` **lastSyncTime**: `Date`

Defined in: [lib/git-sync.ts:32](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L32)

Timestamp of last synchronization

***

### currentBranch

> `readonly` **currentBranch**: `string`

Defined in: [lib/git-sync.ts:34](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L34)

Current git branch name

***

### aheadCount

> `readonly` **aheadCount**: `number`

Defined in: [lib/git-sync.ts:36](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L36)

Number of commits ahead of remote

***

### behindCount

> `readonly` **behindCount**: `number`

Defined in: [lib/git-sync.ts:38](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L38)

Number of commits behind remote

***

### conflictCount

> `readonly` **conflictCount**: `number`

Defined in: [lib/git-sync.ts:40](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L40)

Number of conflicted files
