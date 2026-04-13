# Page Refresh Test Suite

A comprehensive browser-based test suite to verify state persistence across page refreshes.

## 🚀 Quick Start

### Option 1: Node.js Server (Recommended)
```bash
cd /app/workspace/devel/tmp
node server.js
# Open http://localhost:8765/page-refresh-test.html in your browser
```

### Option 2: Python HTTP Server
```bash
cd /app/workspace/devel/tmp
python3 -m http.server 8765
# Open http://localhost:8765/page-refresh-test.html in your browser
```

### Option 3: Open Directly
```bash
# Simply open the HTML file directly in your browser
open /app/workspace/devel/tmp/page-refresh-test.html  # macOS
xdg-open /app/workspace/devel/tmp/page-refresh-test.html  # Linux
```

## 🧪 What It Tests

This test suite verifies 7 different persistence mechanisms:

### 1. **localStorage**
- ✅ Data persists across refresh
- ✅ Data persists across browser restarts
- ✅ Data persists across tabs (same origin)

### 2. **sessionStorage**
- ✅ Data persists across refresh
- ❌ Data does NOT persist in new tab
- ❌ Data does NOT persist after browser restart

### 3. **IndexedDB**
- ✅ Data persists across refresh
- ✅ Data persists across browser restarts
- ✅ Can store large amounts of structured data
- ✅ Async API, transaction-based

### 4. **URL Parameters**
- ✅ Data persists across refresh
- ✅ Shareable via URL
- ✅ Works with browser history (back/forward buttons)
- ⚠️ Visible in address bar

### 5. **Cookies**
- ✅ Data persists across refresh
- ✅ Data persists across browser restarts
- ✅ Can set expiration
- ⚠️ Sent with every HTTP request
- ⚠️ Size limited to ~4KB

### 6. **Counter State**
- Demonstrates numeric state persistence
- Tests increment/decrement operations
- Shows real-time updates

### 7. **Form Auto-save**
- Auto-saves form input every second
- Demonstrates practical use case
- Tests multiple form fields simultaneously

## 📋 How to Use

### Basic Testing
1. Open the test page in your browser
2. The page automatically runs all tests on load
3. Enter values in each test section
4. Click "Save" buttons to store data
5. Click "Refresh Page" to test persistence
6. Verify that your data is restored

### Advanced Testing

#### Test Cross-tab Persistence
```javascript
// Open two tabs with the same page
// In Tab 1: Enter value in localStorage test
// In Tab 2: Refresh - should see the same value
```

#### Test sessionStorage Isolation
```javascript
// In Tab 1: Enter value in sessionStorage test
// Open a new tab (Ctrl+T) to the same URL
// In Tab 2: sessionStorage should be empty
// Refresh Tab 1 - sessionStorage should persist
```

#### Test IndexedDB
```javascript
// Enter large JSON data in IndexedDB test
// Example:
{
  "name": "Test Document",
  "content": "Large text content...",
  "metadata": {
    "author": "User",
    "date": "2026-04-10"
  }
}
```

#### Test URL Parameters
```javascript
// Enter a value and click "Set URL Parameter"
// Copy the URL from address bar
// Open in a new tab - should restore the value
// Share the URL with someone else
```

## 🎯 Test Results Interpretation

| Status | Meaning |
|--------|---------|
| **PENDING** | Test not yet run or no data saved |
| **PASS** | Data successfully persisted |
| **FAIL** | Data not persisted (check browser settings) |

## 🔧 Troubleshooting

### Data Not Persisting?
1. **Check browser settings** - Make sure cookies and site data are allowed
2. **Private/Incognito mode** - Some storage mechanisms may be restricted
3. **Storage quota exceeded** - Clear some data
4. **Browser extensions** - Privacy extensions might block storage

### Clear All Test Data
Click the "🗑️ Clear All Storage" button to reset all tests.

## 📊 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| localStorage | ✅ | ✅ | ✅ | ✅ |
| sessionStorage | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| URL Parameters | ✅ | ✅ | ✅ | ✅ |
| Cookies | ✅ | ✅ | ✅ | ✅ |

## 🎨 Features

- **Dark theme** for comfortable viewing
- **Responsive design** works on mobile and desktop
- **Auto-run tests** on page load
- **Visual feedback** with color-coded status indicators
- **One-click clear** all stored data
- **No external dependencies** - pure vanilla JavaScript

## 📝 Implementation Details

### File Locations
```
/app/workspace/devel/tmp/
├── page-refresh-test.html  # Main test page
├── server.js               # Node.js server
└── README.md               # This file
```

### Storage Limits (Approximate)
- **localStorage**: 5-10 MB
- **sessionStorage**: 5-10 MB
- **IndexedDB**: 50 MB - unlimited (varies by browser)
- **Cookies**: ~4 KB per cookie, max 20 cookies per domain
- **URL Parameters**: ~2,000 characters (browser dependent)

## 🔬 Use Cases

1. **Development Testing**: Quickly test if your app's state persistence is working
2. **Browser Testing**: Verify storage behavior across different browsers
3. **Learning Tool**: Understand how different storage mechanisms work
4. **Debugging**: Isolate storage issues in web applications
5. **Education**: Demonstrate web storage concepts

## 🚦 Next Steps

After understanding persistence mechanisms, consider:
- Implementing state management libraries (Redux, Zustand, etc.)
- Using storage abstraction layers
- Implementing data synchronization
- Adding offline support with Service Workers

## 📚 Related Documentation

- [MDN Web Docs - Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN Web Docs - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Web Docs - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

**Created**: 2026-04-10  
**Author**: Knoxx (AI Assistant)  
**Purpose**: Test state persistence across page refreshes
