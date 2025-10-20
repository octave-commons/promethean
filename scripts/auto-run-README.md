# Auto-run Scripts for pnpm Workspaces

This script automatically runs `pnpm --filter <packagename>` when source files change in a valid pnpm workspace.

## Usage

### Basic Usage

```bash
# Watch for changes and run 'build' command (default)
./scripts/auto-run-on-change.sh

# Watch for changes and run specific command
./scripts/auto-run-on-change.sh test
./scripts/auto-run-on-change.sh typecheck
./scripts/auto-run-on-change.sh dev
```

### Using npm scripts

```bash
# From project root
pnpm --filter @promethean/auto-run-scripts watch
pnpm --filter @promethean/auto-run-scripts watch:build
pnpm --filter @promethean/auto-run-scripts watch:test
pnpm --filter @promethean/auto-run-scripts watch:typecheck
pnpm --filter @promethean/auto-run-scripts watch:dev
```

## Features

- **Automatic package detection**: Finds the package containing the changed file
- **Workspace validation**: Ensures you're in a valid pnpm workspace
- **Cross-platform**: Works on Linux (inotifywait) and macOS (fswatch)
- **Colored output**: Clear visual feedback with colors
- **Initial run**: Runs the command on all packages at startup
- **Error handling**: Graceful handling of missing dependencies and failures

## Requirements

### Linux

```bash
sudo apt-get install inotify-tools
```

### macOS

```bash
brew install fswatch
```

### Node.js

Required for parsing package.json files.

## How it Works

1. **Validation**: Checks if you're in a pnpm workspace
2. **Discovery**: Finds all packages with package.json files
3. **Initial run**: Executes the command on all packages
4. **Watching**: Monitors all `src/` directories for changes
5. **Execution**: When a file changes, finds the containing package and runs the command

## Example Output

```
🔍 Auto-run script started
Command: build
Watching for changes in src/ folders...
🏃 Initial run for all packages...
🚀 Running: pnpm --filter @promethean/core build
✅ Success: @promethean/core
---
👀 Watching with inotifywait...
Press Ctrl+C to stop
📝 Changed: packages/core/src/index.ts
📦 Package: @promethean/core (packages/core)
🚀 Running: pnpm --filter @promethean/core build
✅ Success: @promethean/core
---
```

## Troubleshooting

### "Not in a pnpm workspace"

Make sure you're in a directory with either:

- `pnpm-workspace.yaml` file, or
- `package.json` with `workspaces` configuration

### "Neither inotifywait nor fswatch found"

Install the appropriate file watcher for your platform (see requirements above).

### Command fails

Ensure the command you're trying to run exists in the target package's `package.json` scripts section.
