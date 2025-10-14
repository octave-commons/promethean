# OpenCode SDK Integration Documentation

## Overview

This document describes the integration of the OpenCode SDK with the session manager package, enabling real code review functionality through a web-based GUI.

## Architecture

### Components

1. **OpenCode SDK Wrapper** (`public/js/opencode-wrapper.js`)
   - Provides a JavaScript interface for the OpenCode SDK
   - Includes mock implementation for development/testing
   - Automatically falls back to mock if real SDK is unavailable

2. **ClojureScript Integration** (`src/app/opencode.cljs`)
   - ClojureScript wrapper for JavaScript SDK functions
   - Provides idiomatic ClojureScript API
   - Handles state management and error handling

3. **Enhanced Session Manager** (`src/app/webcomponents/enhanced_session_manager.cljs`)
   - Web component with real SDK integration
   - Session creation, management, and deletion
   - Code review functionality
   - Real-time connection status

4. **Demo Application** (`demo.html`)
   - Complete working example
   - Both basic and enhanced session managers
   - Interactive demo controls

## Features

### Session Management
- ✅ Create new sessions with title, description, and tags
- ✅ List all sessions from OpenCode client
- ✅ View session details
- ✅ Delete sessions
- ✅ Real-time session updates

### Code Review
- ✅ Start code reviews for files/directories
- ✅ Configure file patterns and review options
- ✅ Display review results and issues
- ✅ Submit feedback on reviews
- ✅ Multiple review templates

### Connection Management
- ✅ Automatic connection to OpenCode server (port 4096)
- ✅ Connection status indicator
- ✅ Graceful fallback to mock implementation
- ✅ Error handling and recovery

### User Interface
- ✅ Responsive design for mobile and desktop
- ✅ Modal dialogs for session creation
- ✅ Interactive session cards
- ✅ Collapsible review panels
- ✅ Loading states and error messages

## Installation and Setup

### Prerequisites
- Node.js 18+ 
- OpenCode server running on port 4096 (optional for mock mode)

### Dependencies
```json
{
  "@opencode-ai/sdk": "^0.15.2"
}
```

### Build Process
```bash
# Install dependencies
pnpm install

# Build ClojureScript
pnpm build

# Start development server
pnpm start:dev
```

## Usage

### Basic Usage
```html
<!DOCTYPE html>
<html>
<head>
  <title>OpenCode Session Manager</title>
  <link rel="stylesheet" href="public/css/styles.css">
</head>
<body>
  <!-- Load SDK wrapper -->
  <script src="public/js/opencode-wrapper.js"></script>
  
  <!-- Load compiled ClojureScript -->
  <script src="public/js/main.js"></script>
  
  <!-- Use the enhanced session manager -->
  <enhanced-session-manager server-url="http://localhost:4096">
  </enhanced-session-manager>
</body>
</html>
```

### Advanced Configuration
```javascript
// Custom server URL
const manager = document.querySelector('enhanced-session-manager');
manager.setAttribute('server-url', 'http://custom-server:8080');

// Listen for events
document.addEventListener('session-created', (e) => {
  console.log('New session:', e.detail);
});

document.addEventListener('start-review', (e) => {
  console.log('Review started:', e.detail);
});
```

## API Reference

### Session Management
```clojure
;; List sessions
(opencode/list-sessions (fn [sessions error]
                          (if error
                            (println "Error:" error)
                            (println "Sessions:" sessions))))

;; Create session
(opencode/create-session! 
  {:title "My Session" 
   :description "Session description"
   :tags ["frontend" "review"]}
  (fn [session error]
    (if error
      (println "Error:" error)
      (println "Created:" session))))

;; Delete session
(opencode/delete-session! 
  "session-id"
  (fn [success error]
    (if error
      (println "Error:" error)
      (println "Deleted successfully"))))
```

### Code Review
```clojure
;; Start review
(opencode/start-code-review!
  {:path "./src"
   :patterns ["**/*.cljs" "**/*.js"]
   :session-id "session-id"}
  (fn [review error]
    (if error
      (println "Error:" error)
      (println "Review started:" review))))

;; Get results
(opencode/get-review-results
  "review-id"
  (fn [results error]
    (if error
      (println "Error:" error)
      (println "Results:" results))))
```

## Testing

### Manual Testing
1. Start the test server:
   ```bash
   node test-integration-simple.js
   ```

2. Open http://localhost:3000 in your browser

3. Test the following workflows:
   - Create a new session
   - View session details
   - Start a code review
   - Check review results
   - Delete a session

### Automated Testing
```bash
# Run integration tests
node test-opencode-integration.js

# Run with Playwright (if installed)
npx playwright test
```

## Development

### File Structure
```
src/app/
├── core.cljs                          # Application entry point
├── opencode.cljs                      # SDK integration layer
├── opencode_sdk.js                    # JavaScript SDK wrapper
└── webcomponents/
    ├── session_manager.cljs           # Basic session manager
    └── enhanced_session_manager.cljs  # Enhanced session manager

public/
├── js/
│   ├── main.js                        # Compiled ClojureScript
│   └── opencode-wrapper.js            # SDK wrapper
└── css/
    └── styles.css                     # Component styles

test/
├── integration/
│   └── opencode-integration.test.js   # Playwright tests
├── test-opencode-integration.js       # Node.js integration tests
└── test-integration-simple.js         # Simple test server
```

### Mock Implementation
The SDK wrapper includes a complete mock implementation that:
- Simulates session management operations
- Provides realistic review results
- Works without a running OpenCode server
- Maintains the same API as the real SDK

### Error Handling
- Connection failures fall back to mock mode
- API errors are displayed to users
- Network timeouts are handled gracefully
- Invalid input validation

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if OpenCode server is running on port 4096
   - Verify server URL configuration
   - Mock mode will activate automatically

2. **Components Not Loading**
   - Ensure all JavaScript files are loaded
   - Check browser console for errors
   - Verify ClojureScript compilation succeeded

3. **Session Creation Fails**
   - Check required fields (title, description)
   - Verify network connectivity
   - Check OpenCode server logs

4. **Code Review Not Working**
   - Verify file paths are correct
   - Check file patterns syntax
   - Ensure OpenCode server supports review operations

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('opencode-debug', 'true');
```

## Performance Considerations

- Components use Shadow DOM for encapsulation
- Lazy loading of review results
- Debounced API calls to prevent spam
- Efficient re-rendering with Reagent
- Minimal bundle size with advanced optimizations

## Security

- No sensitive data stored in browser
- All API calls use proper error handling
- Input validation on all user inputs
- XSS prevention with Shadow DOM
- CSP-compatible implementation

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced review filtering
- [ ] Session templates
- [ ] Batch operations
- [ ] Export/import functionality
- [ ] Integration with Git providers
- [ ] Collaborative reviews
- [ ] Review assignment system

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use semantic versioning
5. Test with both mock and real SDK

## License

This integration follows the same license as the main project.