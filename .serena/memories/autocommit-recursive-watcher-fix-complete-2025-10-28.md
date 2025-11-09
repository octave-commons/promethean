# Autocommit Recursive Watcher Fix Complete - 2025-10-28

## Problem Solved
Fixed critical git lock conflict issue in autocommit recursive mode where multiple watchers were competing for the same parent directory instead of watching individual subrepo paths.

## Root Cause Identified
The `startSingleRepository()` function was calling `gitRoot(repoPath)` for ALL repositories, including subrepos. This caused:
- **Main repo**: `/home/err/devel/promethean` (correct)
- **All subrepos**: Also `/home/err/devel/promethean` (incorrect - should be their own paths)

This resulted in multiple watchers trying to `git add -A` on the same repository simultaneously, causing "Unable to create index.lock" errors.

## Fix Implemented
Updated `startSingleRepository()` function in `packages/autocommit/src/index.ts`:

```typescript
// OLD CODE (caused conflicts):
const root = await gitRoot(repoPath);

// NEW CODE (fixed):
const root = isSubrepo ? repoPath : await gitRoot(repoPath);
```

## Configuration Updated
Updated `ecosystem.config.mjs` to use correct CLI flags:
- Changed `--subrepo-strategy separate` to `--handle-subrepos`
- Changed path from `../` to `.`
- Added `--recursive` flag

## Verification Results
Manual testing confirmed the fix works correctly:

### Before Fix
- All subrepos watched parent directory: `/home/err/devel/promethean`
- Multiple competing watchers caused git lock conflicts
- "Unable to create index.lock" errors

### After Fix  
- Each subrepo watches its own path (e.g., `/home/err/devel/promethean/packages/kanban`)
- 14 individual watchers for 14 repositories
- No more competing watchers or git lock conflicts

### Repository Distribution
- 1 main git repository: `/home/err/devel/promethean`
- 13 subrepos with individual watchers:
  - `/home/err/devel/promethean/git-subrepo-source`
  - `/home/err/devel/promethean/git-subrepo-source/ext/bashplus`
  - `/home/err/devel/promethean/git-subrepo-source/ext/test-more-bash`
  - `/home/err/devel/promethean/packages/apply-patch`
  - `/home/err/devel/promethean/packages/auth-service`
  - `/home/err/devel/promethean/packages/autocommit`
  - `/home/err/devel/promethean/packages/kanban`
  - `/home/err/devel/promethean/packages/logger`
  - `/home/err/devel/promethean/packages/mcp`
  - `/home/err/devel/promethean/packages/naming`
  - `/home/err/devel/promethean/packages/persistence`
  - `/home/err/devel/promethean/packages/utils`
  - `/home/err/devel/promethean/test-data/test-git`

## Files Modified
1. `packages/autocommit/src/index.ts` - Fixed watcher logic
2. `ecosystem.config.mjs` - Updated CLI arguments
3. `packages/autocommit/dist/` - Rebuilt TypeScript code

## Next Steps
The PM2 service will automatically pick up the configuration changes and restart with the fixed behavior. The fix ensures each subrepo is monitored independently without git conflicts.

## Impact
- **Eliminates git lock conflicts** during recursive autocommit operations
- **Proper isolation** between repositories and subrepos  
- **Scalable solution** that works with any number of subrepos
- **Maintains backward compatibility** for non-recursive usage

The recursive autocommit feature now works as intended with distributed watchers instead of competing watchers.