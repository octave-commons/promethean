[**Promethean Kanban v0.1.0**](../../../README.md)

***

[Promethean Kanban](../../../modules.md) / [lib/git-sync](../README.md) / GitSyncOptions

# Type Alias: GitSyncOptions

> **GitSyncOptions** = `object`

Defined in: [lib/git-sync.ts:6](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L6)

Configuration options for git synchronization

## Properties

### workingDir

> `readonly` **workingDir**: `string`

Defined in: [lib/git-sync.ts:8](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L8)

Working directory for git operations

***

### autoPush?

> `readonly` `optional` **autoPush**: `boolean`

Defined in: [lib/git-sync.ts:10](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L10)

Enable automatic push operations

***

### autoPull?

> `readonly` `optional` **autoPull**: `boolean`

Defined in: [lib/git-sync.ts:12](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L12)

Enable automatic pull operations

***

### debounceMs?

> `readonly` `optional` **debounceMs**: `number`

Defined in: [lib/git-sync.ts:14](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L14)

Debounce delay in milliseconds for sync operations

***

### remoteName?

> `readonly` `optional` **remoteName**: `string`

Defined in: [lib/git-sync.ts:16](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L16)

Git remote name (default: 'origin')

***

### branchName?

> `readonly` `optional` **branchName**: `string`

Defined in: [lib/git-sync.ts:18](https://github.com/promethean-ai/promethean/blob/main/packages/kanban/src/lib/git-sync.ts#L18)

Git branch name (default: 'main')
