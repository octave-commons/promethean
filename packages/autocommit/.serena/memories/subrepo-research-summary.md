# Subrepo Support Research Summary

## Current Understanding

### Git Submodule vs Git Subrepo
- **Git Submodule**: Native Git feature, uses `.gitmodules` file, each submodule has separate `.git` directory
- **Git Subrepo**: Third-party tool, uses `.gitrepo` files in subdirectories, squashes history, simpler workflow

### Current Codebase Analysis
The autocommit package currently:
1. Scans for `.git` directories to identify repositories in `findGitRepositories()` (src/git.ts:123-157)
2. Uses `chokidar` to watch for file changes
3. Supports recursive repository detection with `--recursive` flag
4. Ignores `node_modules`, `dist`, `.git` directories for performance

### Integration Points
Subrepo detection should be integrated at:
1. **Repository Detection**: Modify `findGitRepositories()` to also detect `.gitrepo` files
2. **Repository Status**: Update status checking to handle subrepo state
3. **Commit Logic**: Ensure commits work correctly with subrepo-managed directories
4. **Configuration**: Add options to handle subrepo-specific behavior

### Key Differences for Implementation
- Subrepos use `.gitrepo` files instead of `.git` directories
- Subrepos are part of the main repository history (squashed commits)
- Subrepo commands are external Git commands, not native Git functionality
- Need to detect both `.git` and `.gitrepo` files for comprehensive support