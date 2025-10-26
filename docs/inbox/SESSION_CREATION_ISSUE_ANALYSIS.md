# OpenCode Client Session Creation Issue Analysis

## Issues Identified

### 1. Title Parameter Ignored by Server

**Problem**: When running `pnpm exec opencode-client sess create "test title"`, the title argument is ignored by the server.

**Evidence**: Debug output shows:

- Client correctly sends: `title: "test title"`
- Server responds with: `title: "New session - 2025-10-18T23:50:55.091Z"`

**Root Cause**: The OpenCode server (running on localhost:4096) automatically generates session titles regardless of the provided title parameter.

### 2. SSL Deprecation Warning

**Problem**: Warning about 'path' argument being deprecated in favor of 'ssl', 'host', and 'port'.

**Location**: This appears to be coming from the OpenCode server or SDK connection.

### 3. Command Does Not Actually Hang

**Finding**: The command doesn't actually hang - it completes successfully. The perceived "hanging" was likely due to the unexpected title override.

## Current Status

- ✅ Session creation works
- ✅ Client correctly passes title parameter
- ✅ Timestamp field now works (after fix)
- ❌ Server ignores provided title
- ⚠️ SSL deprecation warning

## Potential Solutions

### Option 1: Server Configuration

Check if there's a server configuration option to disable automatic title generation.

### Option 2: Different Parameter Name

The server might expect a different parameter name (e.g., `name` instead of `title`).

### Option 3: Post-Creation Rename

Use the session update API to set the title after creation.

### Option 4: Server Issue

This might be a bug in the OpenCode server version being used.

## Files Modified

- `/packages/opencode-client/src/actions/sessions/create.ts` - Fixed createdAt field mapping
- Debug logging added and removed for investigation

## Next Steps

1. Test with different parameter names
2. Check OpenCode server documentation for title configuration
3. Implement post-creation title update if needed
4. Address SSL deprecation warning
