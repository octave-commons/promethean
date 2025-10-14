---
uuid: "0f1d191b-1326-48c2-a122-b37f8d1199fd"
title: "Fix Kanban UI MIME Type Issue for JavaScript Modules       )"
slug: "fix-kanban-ui-mime-type-issue"
status: "incoming"
priority: "P1"
labels: ["bug", "kanban", "ui", "mime-type", "frontend"]
created_at: "2025-10-13T23:32:36.411Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Problem

The Kanban UI server was serving JavaScript modules with `application/javascript` content type, which was causing MIME type errors in browsers and preventing the virtual scroll component from loading properly.

## Changes Made

1. **Updated MIME types** in `packages/kanban/src/lib/ui-server.ts`:

   - Changed all JavaScript assets from `application/javascript` to `text/javascript`
   - Enhanced CORS headers for ES modules:
     - Added `Cross-Origin-Embedder-Policy: unsafe-none`
     - Added `Cross-Origin-Resource-Policy: cross-origin`
     - Updated `Access-Control-Allow-Methods` to include `OPTIONS`

2. **Fixed build error** in `packages/kanban/src/lib/kanban.ts`:
   - Removed duplicate `export` keyword on line 1152

## Testing

- Built the kanban package successfully
- Started UI server on port 4173 and confirmed it serves assets with correct MIME types
- Virtual scroll component now loads without MIME type errors

## Files Modified

- `packages/kanban/src/lib/ui-server.ts` - MIME type and CORS header fixes
- `packages/kanban/src/lib/kanban.ts` - Build error fix
