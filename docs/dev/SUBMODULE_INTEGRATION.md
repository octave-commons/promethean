# Submodule Integration with pnpm Install

## Overview
The `promethean` repository now automatically initializes git submodules as part of the `pnpm install` process through the npm `prepare` lifecycle script.

## Implementation

### Scripts Added
1. **`scripts/ensure-submodules.mjs`** - New script that:
   - Checks for `.gitmodules` file
   - Runs `git submodule sync` 
   - Runs `git submodule update --init --recursive`
   - Handles errors gracefully

### Changes Made
1. **Updated `package.json` prepare script** to:
   ```json
   "prepare": "node ./scripts/ensure-submodules.mjs && node ./scripts/ensure-cli-perms.mjs"
   ```

## How It Works
1. When `pnpm install` is run, npm automatically triggers the `prepare` script
2. The prepare script first runs submodule initialization, then CLI permissions
3. Submodules are initialized and updated recursively
4. If no `.gitmodules` file exists, the script skips gracefully

## Current Submodules
- `packages/apply-patch`
- `packages/auth-service` 
- `packages/autocommit`
- `packages/kanban`
- `packages/logger`
- `packages/mcp`
- `packages/naming`
- `packages/persistence`
- `packages/utils`

## Usage
```bash
# This will now automatically initialize submodules
pnpm install

# Or run prepare manually
pnpm run prepare
```

## Benefits
- Automatic setup for new developers
- Ensures submodules are always up-to-date
- No manual steps required after cloning
- Integrated into standard install workflow
