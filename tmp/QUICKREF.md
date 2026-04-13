# Page Refresh Test - Quick Reference

## Start Server
```bash
cd /app/workspace/devel/tmp && node server.js
```

## Open Test Page
```
http://localhost:8765/page-refresh-test.html
```

## Tests Overview

| # | Test | Storage Type | Persists |
|---|------|--------------|----------|
| 1 | localStorage | Browser storage | ✅ Refresh, tabs, restarts |
| 2 | sessionStorage | Browser storage | ✅ Refresh only |
| 3 | IndexedDB | Database | ✅ Refresh, restarts, large data |
| 4 | URL Params | URL string | ✅ Refresh, shareable |
| 5 | Cookies | HTTP headers | ✅ Refresh, restarts |
| 6 | Counter | localStorage | ✅ Numeric state |
| 7 | Form | localStorage | ✅ Auto-save |

## Quick Test Steps

1. **Open** test page
2. **Enter** values in each section
3. **Save** each test
4. **Refresh** page (F5 or button)
5. **Verify** data restored

## Status Colors

- 🟡 **PENDING** - Not tested yet
- 🟢 **PASS** - Data persisted successfully
- 🔴 **FAIL** - Data not persisted

## Clear All Data
Click "🗑️ Clear All Storage" button
