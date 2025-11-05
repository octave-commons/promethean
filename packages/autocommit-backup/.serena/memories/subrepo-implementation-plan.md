# Subrepo Implementation Plan

## Overview
The autocommit package needs to understand repositories that use git-subrepo (third-party tool) in addition to standard git repositories and submodules.

## Key Differences
- **Git Submodule**: Native, uses `.gitmodules`, separate `.git` directories
- **Git Subrepo**: Third-party, uses `.gitrepo` files, squashed history, simpler workflow

## Implementation Phases

### Phase 1: Core Detection Functions
1. Add subrepo detection functions in `src/git.ts`:
   - `hasSubrepo(cwd: string): Promise<boolean>`
   - `findSubrepos(rootPath: string): Promise<string[]>`
   - `isSubrepoDir(cwd: string): Promise<boolean>`

2. Modify `findGitRepositories()` to detect both `.git` and `.gitrepo` files

### Phase 2: Status and Operations
3. Update status functions for subrepo compatibility:
   - Modify `statusPorcelain()` for subrepo directories
   - Ensure `listChangedFiles()` works with subrepo content
   - Verify commit operations work with subrepo changes

### Phase 3: Configuration and CLI
4. Add configuration options in `src/config.ts`:
   - `handleSubrepos: boolean`
   - `subrepoStrategy: 'separate'|'integrated'`

5. Update CLI in `src/cli.ts` with new flags

### Phase 4: Integration and Testing
6. Update main logic in `src/index.ts` for mixed repo/subrepo handling
7. Add comprehensive tests for new functionality

## Key Implementation Details
- Subrepos appear as regular directories in parent repo
- Changes to subrepo content are committed to parent repo
- No special git-subrepo commands needed for basic autocommit
- Backward compatibility maintained
- Opt-in via configuration