---
title: Fix Kanban UI MIME Type Issue for JavaScript Modules
status: incoming
priority: P1
tags: [bug, kanban, ui, mime-type, frontend]
uuid: $(uuidgen)
created_at: 2025-10-13T12:00:00Z
---

## Problem Description

The kanban UI web interface is failing to load with the following error:
```
Loading module from 'http://127.0.0.1:4173/assets/virtual-scroll.js' was blocked because of a disallowed MIME type ('text/plain')
```

This error occurs when the browser attempts to load JavaScript modules but receives them with an incorrect MIME type (text/plain instead of application/javascript), causing the module loading to be blocked for security reasons.

## Root Cause Analysis

The issue is in the `FRONTEND_ASSETS` mapping in `/packages/kanban/src/lib/ui-server.ts`. The mapping only includes three JavaScript files:
- `/assets/kanban-ui.js` ✓
- `/assets/render.js` ✓  
- `/assets/styles.js` ✓

However, the build process generates four JavaScript files in `dist/frontend/`:
- `kanban-ui.js` ✓
- `render.js` ✓
- `styles.js` ✓
- `virtual-scroll.js` ❌ **missing from mapping**

The `virtual-scroll.js` file is imported by `render.ts` but is not registered in the asset server, causing it to be served with the default MIME type of `text/plain` instead of `application/javascript`.

## Investigation Steps

1. **Verify the current asset mapping**: Check `FRONTEND_ASSETS` in `ui-server.ts`
2. **Confirm built files exist**: Verify `dist/frontend/virtual-scroll.js` exists
3. **Check import usage**: Confirm `virtual-scroll.js` is imported by other frontend modules
4. **Test current behavior**: Reproduce the MIME type error
5. **Identify any other missing assets**: Check for additional built files not in the mapping

## Solution Approach

### Primary Fix: Update Asset Mapping

Add the missing `virtual-scroll.js` entry to the `FRONTEND_ASSETS` map in `ui-server.ts`:

```typescript
const FRONTEND_ASSETS: ReadonlyMap<string, FrontendAsset> = new Map([
  [
    '/assets/kanban-ui.js',
    createAssetDescriptor('../frontend/kanban-ui.js', 'application/javascript; charset=utf-8'),
  ],
  [
    '/assets/render.js',
    createAssetDescriptor('../frontend/render.js', 'application/javascript; charset=utf-8'),
  ],
  [
    '/assets/styles.js',
    createAssetDescriptor('../frontend/styles.js', 'application/javascript; charset=utf-8'),
  ],
  [
    '/assets/virtual-scroll.js',
    createAssetDescriptor('../frontend/virtual-scroll.js', 'application/javascript; charset=utf-8'),
  ],
]);
```

### Secondary Improvements

1. **Add asset validation**: Create a function to verify all built frontend files are registered
2. **Automated asset discovery**: Consider auto-discovering frontend assets instead of manual mapping
3. **Build verification**: Add a check during build to ensure all referenced assets are mapped

## Testing Approach

### Manual Testing
1. Start the kanban UI: `pnpm kanban ui --port 4173`
2. Open browser to `http://127.0.0.1:4173`
3. Check browser console for MIME type errors
4. Verify virtual scrolling functionality works correctly
5. Test all UI interactions (task movement, search, etc.)

### Automated Testing
1. Add integration test to verify all frontend assets load with correct MIME types
2. Add test to ensure `dist/frontend` files match `FRONTEND_ASSETS` mapping
3. Verify UI loads without console errors in test environment

### Regression Testing
1. Test with different ports and host configurations
2. Verify existing functionality remains intact
3. Test with both development and production builds

## Acceptance Criteria

### Must Have
- [ ] `virtual-scroll.js` loads with correct MIME type (`application/javascript`)
- [ ] No console errors related to MIME type when loading kanban UI
- [ ] Virtual scrolling functionality works correctly
- [ ] All existing kanban UI features remain functional
- [ ] Asset mapping includes all built frontend files

### Should Have  
- [ ] Automated test to prevent future asset mapping mismatches
- [ ] Build process validates asset mapping completeness
- [ ] Clear error messages if assets are missing from mapping

### Could Have
- [ ] Automatic asset discovery system
- [ ] Development-time asset mapping validation
- [ ] Performance monitoring for asset loading

## Implementation Notes

### Files to Modify
- `/packages/kanban/src/lib/ui-server.ts` - Add missing asset mapping
- `/packages/kanban/src/tests/ui-server.test.ts` - Add asset validation tests

### Risk Assessment
- **Low Risk**: Simple addition to existing asset mapping
- **No Breaking Changes**: Only adds missing functionality
- **Easy Rollback**: Change can be easily reverted if issues arise

### Dependencies
- Requires kanban package to be built (`pnpm --filter @promethean/kanban build`)
- No external dependencies or API changes required

## Verification Commands

```bash
# Build the kanban package
pnpm --filter @promethean/kanban build

# Start the UI server
pnpm kanban ui --port 4173

# Test asset loading
curl -I http://127.0.0.1:4173/assets/virtual-scroll.js

# Run tests
pnpm --filter @promethean/kanban test
```

Expected curl output should include:
```
Content-Type: application/javascript; charset=utf-8
```

## Related Issues

This fix addresses the immediate MIME type error. Consider related improvements:
- Asset bundling optimization
- Caching strategies for static assets  
- Development vs production asset handling
- Error handling for missing assets