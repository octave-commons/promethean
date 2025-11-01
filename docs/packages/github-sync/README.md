# GitHub Sync Package

GitHub integration and synchronization for Promethean workflows.

## Overview

The `@promethean-os/github-sync` package provides comprehensive GitHub integration:

- Issue synchronization
- Repository management
- PR automation
- Project board sync

## Features

- **Bidirectional Sync**: Keep local and GitHub in sync
- **Issue Management**: Create, update, and sync issues
- **PR Automation**: Automated pull request handling
- **Project Boards**: GitHub Projects integration

## Usage

```typescript
import { createGitHubSync } from '@promethean-os/github-sync';

const githubSync = createGitHubSync({
  token: process.env.GITHUB_TOKEN,
  owner: 'promethean-ai',
  repo: 'promethean',
  syncDirection: 'bidirectional',
});

// Sync kanban board to GitHub issues
await githubSync.syncKanbanToIssues({
  sourceFile: 'docs/agile/boards/generated.md',
  createMissing: true,
  updateExisting: true,
});

// Sync changes back from GitHub
await githubSync.syncFromGitHub({
  targetFile: 'docs/agile/boards/generated.md',
  includeComments: true,
  includeLabels: true,
});
```

## Configuration

```typescript
interface GitHubSyncConfig {
  token: string;
  owner: string;
  repo: string;
  syncDirection: 'bidirectional' | 'to-github' | 'from-github';
  dryRun: boolean;
  syncInterval: string; // cron format
}
```

## 📁 Implementation

### Core Files
- **Main Entry**: [`src/index.ts`](../../../packages/github-sync/src/index.ts) (247 lines)

### Key Classes & Functions
- **GitHubSync**: [`GitHubSync`](../../../packages/github-sync/src/index.ts#L45) - Main GitHub synchronization class

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/github-sync/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/github-sync/src)

## 📚 API Reference

### Classes

#### GitHubSync
**Location**: [`src/index.ts`](../../../packages/github-sync/src/index.ts#L45)

**Description**: Main class for GitHub repository synchronization and issue management.

**Key Methods**:
- [`syncKanbanToIssues()`](../../../packages/github-sync/src/index.ts#L89) - Sync kanban board to GitHub issues
- [`syncFromGitHub()`](../../../packages/github-sync/src/index.ts#L134) - Sync changes from GitHub
- [`createIssue()`](../../../packages/github-sync/src/index.ts#L178) - Create GitHub issue
- [`updateIssue()`](../../../packages/github-sync/src/index.ts#L201) - Update existing GitHub issue

## Development Status

✅ **Active** - Core functionality implemented and in use.

## Dependencies

- `@promethean-os/kanban` - Kanban board integration
- `@promethean-os/docops` - Document operations
- `@promethean-os/logger` - Sync logging

## Related Packages

- [[kanban]] - Task management
- [[docops]] - Document processing
- [[CONTRIBUTOR-FRIENDLY-GITHUB-BOARDS]] - Usage guide
