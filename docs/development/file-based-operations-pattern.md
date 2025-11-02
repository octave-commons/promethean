# File-Based Operations Pattern

This document establishes the standard pattern for file-based operations across all Promethean pipeline packages.

## Core Principles

1. **Skip dotfiles by default** - Files and directories starting with `.` should be ignored unless explicitly requested
2. **Respect .gitignore** - Always honor .gitignore patterns when scanning files
3. **Skip common build/cache directories** - Automatically ignore well-known directories like `node_modules`, `dist`, `build`, etc.

## Implementation

### Using @promethean-os/file-indexer

All file scanning operations should use the `scanFiles` function with the new `useDefaultIgnores` option:

```typescript
import { scanFiles } from '@promethean-os/file-indexer';

// Default behavior - skips dotfiles and respects .gitignore
await scanFiles({
  root: './src',
  exts: ['.ts', '.js'],
  useDefaultIgnores: true, // This is the default
  onFile: async (file) => {
    // Process file
  },
});

// Explicitly disable default ignores (rare)
await scanFiles({
  root: './src',
  exts: ['.ts', '.js'],
  useDefaultIgnores: false,
  onFile: async (file) => {
    // Process all files including dotfiles
  },
});
```

### Direct fs.readdir Operations

For simple directory scanning, add dotfile filtering:

```typescript
import { promises as fs } from 'fs';

// Before: Processes all directories
const dirs = (await fs.readdir(root, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

// After: Skip dotfiles
const dirs = (await fs.readdir(root, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .filter((e) => !e.name.startsWith('.')) // Skip dotfiles
  .map((e) => e.name);
```

## Default Ignore Patterns

The following patterns are automatically ignored when `useDefaultIgnores: true`:

### Directories

- `node_modules`
- `.git`
- `dist`
- `build`
- `coverage`
- `.cache`
- `target`
- `.vscode`
- `.idea`
- `tmp`
- `temp`
- `.pytest_cache`
- `__pycache__`
- `.next`
- `.nuxt`
- `.output`
- `.vercel`

### File Patterns

- `*.log`
- `.env*`
- `.DS_Store`

### Dotfiles

All files and directories starting with `.` (except `.gitignore` which is read for patterns)

## Migration Guide

### For Pipeline Packages

1. **Update scanFiles calls** - Add `useDefaultIgnores: true` (or rely on default)
2. **Update direct fs.readdir calls** - Add dotfile filtering
3. **Test with .gitignore** - Ensure your .gitignore patterns are respected

### Example Migration

**Before:**

```typescript
await scanFiles({
  root: './docs',
  exts: ['.md'],
  onFile: processFile,
});
```

**After:**

```typescript
await scanFiles({
  root: './docs',
  exts: ['.md'],
  useDefaultIgnores: true, // Explicit but optional
  onFile: processFile,
});
```

## CLI Tools

For CLI tools that accept directory paths, consider adding these options:

```typescript
interface Options {
  includeDotfiles?: boolean; // --include-dotfiles
  respectGitignore?: boolean; // --no-respect-gitignore
  additionalIgnores?: string[]; // --ignore pattern1,pattern2
}
```

## Testing

When testing file operations:

1. **Include dotfiles in test fixtures** to ensure they're properly ignored
2. **Test .gitignore parsing** with various patterns
3. **Verify default ignores** work for common directories

```typescript
test('skips dotfiles by default', async (t) => {
  const result = await scanFiles({
    root: testFixtureDir,
    useDefaultIgnores: true,
  });

  t.false(result.files.some((f) => f.path.includes('.env')));
  t.false(result.files.some((f) => f.path.includes('.hidden')));
});
```

## Rationale

This pattern prevents common user errors:

1. **Accidentally processing sensitive files** (`.env`, `.DS_Store`)
2. **Wasting time on build artifacts** (`node_modules`, `dist`)
3. **Inconsistent behavior** across different tools
4. **Ignoring user preferences** expressed in `.gitignore`

The approach is conservative - it prevents accidents while still allowing power users to override the defaults when needed.

## Implementation Status

- ✅ `@promethean-os/file-indexer` updated with `useDefaultIgnores` option
- ✅ Default ignore patterns implemented
- ✅ .gitignore parsing support added
- 🔄 Pipeline packages being migrated
- ⏳ Documentation updates in progress

## Related Files

- `packages/file-indexer/src/gitignore-utils.ts` - Core ignore utilities
- `packages/file-indexer/src/scan-files.ts` - Updated scanFiles function
- `packages/file-indexer/src/types.ts` - Updated type definitions
