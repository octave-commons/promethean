# Autocommit Package

Automated commit management for Promethean development workflows.

## Overview

The `@promethean-os/autocommit` package provides intelligent automated commit functionality:

- Smart commit message generation
- Automatic commit scheduling
- Change detection and batching
- Integration with development workflows

## Features

- **Smart Messages**: AI-powered commit message generation
- **Change Detection**: Automatic detection of meaningful changes
- **Batch Processing**: Groups related changes together
- **Workflow Integration**: Works with development pipelines

## Usage

```typescript
import { createAutocommitSystem } from '@promethean-os/autocommit';

const autocommit = createAutocommitSystem({
  enabled: true,
  commitInterval: '30m',
  messageStyle: 'conventional',
  autoPush: false,
});

// Enable automatic commits
await autocommit.start();

// Manual commit trigger
await autocommit.commitChanges({
  message: 'feat: add new feature',
  files: ['src/**/*.ts'],
  push: true,
});
```

## Configuration

```typescript
interface AutocommitConfig {
  enabled: boolean;
  commitInterval: string; // cron format
  messageStyle: 'conventional' | 'semantic' | 'ai-generated';
  autoPush: boolean;
  excludePatterns: string[];
  maxChangesPerCommit: number;
}
```

## 📁 Implementation

### Core Files
- **cli.ts**: [src/cli.ts](../../../packages/autocommit/src/cli.ts) (65 lines)
- **config.ts**: [src/config.ts](../../../packages/autocommit/src/config.ts) (115 lines)
- **constants.ts**: [src/constants.ts](../../../packages/autocommit/src/constants.ts) (43 lines)
- **git.ts**: [src/git.ts](../../../packages/autocommit/src/git.ts) (253 lines)
- **index.ts**: [src/index.ts](../../../packages/autocommit/src/index.ts) (352 lines)
- **llm.ts**: [src/llm.ts](../../../packages/autocommit/src/llm.ts) (137 lines)
- **messages.ts**: [src/messages.ts](../../../packages/autocommit/src/messages.ts) (21 lines)
- **tests/autocommit.unit.test.ts**: [src/tests/autocommit.unit.test.ts](../../../packages/autocommit/src/tests/autocommit.unit.test.ts) (17 lines)
- **tests/config.unit.test.ts**: [src/tests/config.unit.test.ts](../../../packages/autocommit/src/tests/config.unit.test.ts) (192 lines)
- **tests/deep-nested-integration.test.ts**: [src/tests/deep-nested-integration.test.ts](../../../packages/autocommit/src/tests/deep-nested-integration.test.ts) (382 lines)
- **tests/empty-staging.test.ts**: [src/tests/empty-staging.test.ts](../../../packages/autocommit/src/tests/empty-staging.test.ts) (25 lines)
- **tests/git.unit.test.ts**: [src/tests/git.unit.test.ts](../../../packages/autocommit/src/tests/git.unit.test.ts) (156 lines)
- **tests/llm.unit.test.ts**: [src/tests/llm.unit.test.ts](../../../packages/autocommit/src/tests/llm.unit.test.ts) (182 lines)
- **tests/recursive-integration.test.ts**: [src/tests/recursive-integration.test.ts](../../../packages/autocommit/src/tests/recursive-integration.test.ts) (156 lines)
- **tests/recursive.test.ts**: [src/tests/recursive.test.ts](../../../packages/autocommit/src/tests/recursive.test.ts) (26 lines)
- **tests/simple-recursive.test.ts**: [src/tests/simple-recursive.test.ts](../../../packages/autocommit/src/tests/simple-recursive.test.ts) (60 lines)
- **tests/simple.test.ts**: [src/tests/simple.test.ts](../../../packages/autocommit/src/tests/simple.test.ts) (6 lines)
- **tests/subrepo.test.ts**: [src/tests/subrepo.test.ts](../../../packages/autocommit/src/tests/subrepo.test.ts) (97 lines)

### Key Classes & Functions
- **ConfigSchema()**: [ConfigSchema()](../../../packages/autocommit/src/config.ts#L46) - Key function
- **MAX_FILES_LIST()**: [MAX_FILES_LIST()](../../../packages/autocommit/src/constants.ts#L6) - Key function
- **MAX_FALLBACK_FILES()**: [MAX_FALLBACK_FILES()](../../../packages/autocommit/src/constants.ts#L7) - Key function
- **MAX_DIFF_LINES()**: [MAX_DIFF_LINES()](../../../packages/autocommit/src/constants.ts#L8) - Key function
- **DEFAULT_DEBOUNCE_MS()**: [DEFAULT_DEBOUNCE_MS()](../../../packages/autocommit/src/constants.ts#L11) - Key function
- _... and 40 more_

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/autocommit/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/autocommit/src)




## 📚 API Reference

### Functions

#### ConfigSchema()
**Location**: [ConfigSchema()](../../../packages/autocommit/src/config.ts#L46)

**Description**: Key function for configschema operations.

**File**: `src/config.ts`

#### MAX_FILES_LIST()
**Location**: [MAX_FILES_LIST()](../../../packages/autocommit/src/constants.ts#L6)

**Description**: Key function for max_files_list operations.

**File**: `src/constants.ts`

#### MAX_FALLBACK_FILES()
**Location**: [MAX_FALLBACK_FILES()](../../../packages/autocommit/src/constants.ts#L7)

**Description**: Key function for max_fallback_files operations.

**File**: `src/constants.ts`

#### MAX_DIFF_LINES()
**Location**: [MAX_DIFF_LINES()](../../../packages/autocommit/src/constants.ts#L8)

**Description**: Key function for max_diff_lines operations.

**File**: `src/constants.ts`

#### DEFAULT_DEBOUNCE_MS()
**Location**: [DEFAULT_DEBOUNCE_MS()](../../../packages/autocommit/src/constants.ts#L11)

**Description**: Key function for default_debounce_ms operations.

**File**: `src/constants.ts`

#### MIN_DEBOUNCE_MS()
**Location**: [MIN_DEBOUNCE_MS()](../../../packages/autocommit/src/constants.ts#L12)

**Description**: Key function for min_debounce_ms operations.

**File**: `src/constants.ts`

#### MAX_DEBOUNCE_MS()
**Location**: [MAX_DEBOUNCE_MS()](../../../packages/autocommit/src/constants.ts#L13)

**Description**: Key function for max_debounce_ms operations.

**File**: `src/constants.ts`

#### FILE_STABILITY_THRESHOLD()
**Location**: [FILE_STABILITY_THRESHOLD()](../../../packages/autocommit/src/constants.ts#L14)

**Description**: Key function for file_stability_threshold operations.

**File**: `src/constants.ts`

#### FILE_POLL_INTERVAL()
**Location**: [FILE_POLL_INTERVAL()](../../../packages/autocommit/src/constants.ts#L15)

**Description**: Key function for file_poll_interval operations.

**File**: `src/constants.ts`

#### DEFAULT_MAX_DIFF_BYTES()
**Location**: [DEFAULT_MAX_DIFF_BYTES()](../../../packages/autocommit/src/constants.ts#L18)

**Description**: Key function for default_max_diff_bytes operations.

**File**: `src/constants.ts`

#### MIN_MAX_DIFF_BYTES()
**Location**: [MIN_MAX_DIFF_BYTES()](../../../packages/autocommit/src/constants.ts#L19)

**Description**: Key function for min_max_diff_bytes operations.

**File**: `src/constants.ts`

#### MAX_MAX_DIFF_BYTES()
**Location**: [MAX_MAX_DIFF_BYTES()](../../../packages/autocommit/src/constants.ts#L20)

**Description**: Key function for max_max_diff_bytes operations.

**File**: `src/constants.ts`

#### MAX_COMMIT_MESSAGE_LENGTH()
**Location**: [MAX_COMMIT_MESSAGE_LENGTH()](../../../packages/autocommit/src/constants.ts#L21)

**Description**: Key function for max_commit_message_length operations.

**File**: `src/constants.ts`

#### MAX_COMMIT_MESSAGE_LINES()
**Location**: [MAX_COMMIT_MESSAGE_LINES()](../../../packages/autocommit/src/constants.ts#L22)

**Description**: Key function for max_commit_message_lines operations.

**File**: `src/constants.ts`

#### GIT_SUBJECT_LINE_MAX()
**Location**: [GIT_SUBJECT_LINE_MAX()](../../../packages/autocommit/src/constants.ts#L23)

**Description**: Key function for git_subject_line_max operations.

**File**: `src/constants.ts`

#### DEFAULT_IGNORE_PATTERNS()
**Location**: [DEFAULT_IGNORE_PATTERNS()](../../../packages/autocommit/src/constants.ts#L26)

**Description**: Key function for default_ignore_patterns operations.

**File**: `src/constants.ts`

#### CODE_FILE_EXTENSIONS()
**Location**: [CODE_FILE_EXTENSIONS()](../../../packages/autocommit/src/constants.ts#L33)

**Description**: Key function for code_file_extensions operations.

**File**: `src/constants.ts`

#### DEFAULT_TEMPERATURE()
**Location**: [DEFAULT_TEMPERATURE()](../../../packages/autocommit/src/constants.ts#L36)

**Description**: Key function for default_temperature operations.

**File**: `src/constants.ts`

#### MIN_TEMPERATURE()
**Location**: [MIN_TEMPERATURE()](../../../packages/autocommit/src/constants.ts#L37)

**Description**: Key function for min_temperature operations.

**File**: `src/constants.ts`

#### MAX_TEMPERATURE()
**Location**: [MAX_TEMPERATURE()](../../../packages/autocommit/src/constants.ts#L38)

**Description**: Key function for max_temperature operations.

**File**: `src/constants.ts`

#### DEFAULT_BASE_URL()
**Location**: [DEFAULT_BASE_URL()](../../../packages/autocommit/src/constants.ts#L41)

**Description**: Key function for default_base_url operations.

**File**: `src/constants.ts`

#### DEFAULT_MODEL()
**Location**: [DEFAULT_MODEL()](../../../packages/autocommit/src/constants.ts#L42)

**Description**: Key function for default_model operations.

**File**: `src/constants.ts`

#### gitRoot()
**Location**: [gitRoot()](../../../packages/autocommit/src/git.ts#L5)

**Description**: Key function for gitroot operations.

**File**: `src/git.ts`

#### hasRepo()
**Location**: [hasRepo()](../../../packages/autocommit/src/git.ts#L10)

**Description**: Key function for hasrepo operations.

**File**: `src/git.ts`

#### statusPorcelain()
**Location**: [statusPorcelain()](../../../packages/autocommit/src/git.ts#L19)

**Description**: Key function for statusporcelain operations.

**File**: `src/git.ts`

#### listChangedFiles()
**Location**: [listChangedFiles()](../../../packages/autocommit/src/git.ts#L24)

**Description**: Key function for listchangedfiles operations.

**File**: `src/git.ts`

#### addAll()
**Location**: [addAll()](../../../packages/autocommit/src/git.ts#L34)

**Description**: Key function for addall operations.

**File**: `src/git.ts`

#### hasStagedChanges()
**Location**: [hasStagedChanges()](../../../packages/autocommit/src/git.ts#L38)

**Description**: Key function for hasstagedchanges operations.

**File**: `src/git.ts`

#### stagedDiff()
**Location**: [stagedDiff()](../../../packages/autocommit/src/git.ts#L47)

**Description**: Key function for stageddiff operations.

**File**: `src/git.ts`

#### repoSummary()
**Location**: [repoSummary()](../../../packages/autocommit/src/git.ts#L58)

**Description**: Key function for reposummary operations.

**File**: `src/git.ts`

#### GIT_EMPTY_WORKING_TREE_PATTERNS()
**Location**: [GIT_EMPTY_WORKING_TREE_PATTERNS()](../../../packages/autocommit/src/git.ts#L74)

**Description**: Key function for git_empty_working_tree_patterns operations.

**File**: `src/git.ts`

#### isEmptyWorkingTreeError()
**Location**: [isEmptyWorkingTreeError()](../../../packages/autocommit/src/git.ts#L80)

**Description**: Key function for isemptyworkingtreeerror operations.

**File**: `src/git.ts`

#### commit()
**Location**: [commit()](../../../packages/autocommit/src/git.ts#L89)

**Description**: Key function for commit operations.

**File**: `src/git.ts`

#### sanitizeCommitMessage()
**Location**: [sanitizeCommitMessage()](../../../packages/autocommit/src/git.ts#L116)

**Description**: Key function for sanitizecommitmessage operations.

**File**: `src/git.ts`

#### hasSubrepo()
**Location**: [hasSubrepo()](../../../packages/autocommit/src/git.ts#L147)

**Description**: Key function for hassubrepo operations.

**File**: `src/git.ts`

#### isSubrepoDir()
**Location**: [isSubrepoDir()](../../../packages/autocommit/src/git.ts#L162)

**Description**: Key function for issubrepodir operations.

**File**: `src/git.ts`

#### findSubrepos()
**Location**: [findSubrepos()](../../../packages/autocommit/src/git.ts#L171)

**Description**: Key function for findsubrepos operations.

**File**: `src/git.ts`

#### findGitRepositories()
**Location**: [findGitRepositories()](../../../packages/autocommit/src/git.ts#L212)

**Description**: Key function for findgitrepositories operations.

**File**: `src/git.ts`

#### performCommit()
**Location**: [performCommit()](../../../packages/autocommit/src/index.ts#L142)

**Description**: Key function for performcommit operations.

**File**: `src/index.ts`

#### startSingleRepository()
**Location**: [startSingleRepository()](../../../packages/autocommit/src/index.ts#L261)

**Description**: Key function for startsinglerepository operations.

**File**: `src/index.ts`

#### start()
**Location**: [start()](../../../packages/autocommit/src/index.ts#L308)

**Description**: Key function for start operations.

**File**: `src/index.ts`

#### createSafeHeaders()
**Location**: [createSafeHeaders()](../../../packages/autocommit/src/llm.ts#L30)

**Description**: Key function for createsafeheaders operations.

**File**: `src/llm.ts`

#### chatCompletion()
**Location**: [chatCompletion()](../../../packages/autocommit/src/llm.ts#L109)

**Description**: Key function for chatcompletion operations.

**File**: `src/llm.ts`

#### SYSTEM()
**Location**: [SYSTEM()](../../../packages/autocommit/src/messages.ts#L1)

**Description**: Key function for system operations.

**File**: `src/messages.ts`

#### USER()
**Location**: [USER()](../../../packages/autocommit/src/messages.ts#L8)

**Description**: Key function for user operations.

**File**: `src/messages.ts`




## Development Status

🚧 **Under Development** - Basic functionality implemented, testing in progress.

## Dependencies

- `@promethean-os/git` - Git operations
- `@promethean-os/logger` - Commit logging
- `@promethean-os/llm` - Message generation

## Related Packages

- [[github-sync]] - GitHub integration
- [[cli]] - Command-line interface
- [[logger]] - Logging system
