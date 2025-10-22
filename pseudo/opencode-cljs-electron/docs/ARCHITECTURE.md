# Opencode ClojureScript Electron Architecture

This document provides a comprehensive overview of the architecture and design patterns used in the Opencode ClojureScript Electron application.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Electron Process Model](#electron-process-model)
- [ClojureScript Architecture](#clojurescript-architecture)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Plugin System](#plugin-system)
- [Opencode Integration](#opencode-integration)
- [Build System](#build-system)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Performance Considerations](#performance-considerations)

---

## High-Level Architecture

The Opencode ClojureScript Electron application follows a multi-layered architecture that combines:

1. **Electron Framework** - Cross-platform desktop application runtime
2. **ClojureScript** - Functional programming language compiling to JavaScript
3. **Reagent** - React wrapper for ClojureScript
4. **Shadow-CLJS** - Advanced ClojureScript compilation tool
5. **Opencode SDK** - AI agent communication framework

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Header    │ │   Editor    │ │  Sidebar    │           │
│  │ Component   │ │  Component  │ │ Component   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                ClojureScript Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    UI       │ │    State    │ │   Opencode  │           │
│  │ Components  │ │ Management  │ │ Integration │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Electron Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Main      │ │  Preload    │ │   Renderer  │           │
│  │  Process    │ │   Script    │ │  Process    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 System Layer                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ File System │ │   Network   │ │   Plugins   │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Electron Process Model

The application follows Electron's secure multi-process architecture:

### Main Process (`electron/main.cljs`)

**Responsibilities:**

- Application lifecycle management
- Window creation and management
- File system operations
- Plugin system management
- IPC (Inter-Process Communication) handling
- Menu and native UI integration

**Key Features:**

- Single main process instance
- Direct access to Node.js APIs
- Manages multiple renderer processes
- Handles security-sensitive operations

### Renderer Process (`src/main.cljs`, `src/app/`)

**Responsibilities:**

- User interface rendering
- User input handling
- Editor logic and state management
- Opencode SDK communication
- Web content display

**Security Features:**

- Context isolation enabled
- Node.js integration disabled
- Preload script for secure API exposure
- Content Security Policy enforcement

### Preload Script (`electron/preload.cljs`)

**Responsibilities:**

- Secure bridge between main and renderer processes
- API exposure via `contextBridge`
- Input validation and sanitization
- Privilege escalation control

**Security Model:**

- Runs in renderer context with elevated privileges
- Cannot access DOM directly
- Exposes only safe, validated APIs
- Prevents prototype pollution

---

## ClojureScript Architecture

### Module Organization

```
src/
├── main.cljs              # Application entry point
└── app/
    ├── state.cljs         # Global state management
    ├── ui.cljs            # Main UI components
    ├── layout.cljs        # Layout components
    ├── buffers.cljs       # Buffer management
    ├── evil.cljs          # Evil mode implementation
    ├── keymap.cljs        # Keybinding system
    ├── opencode.cljs      # Opencode SDK integration
    └── env.cljs           # Environment abstraction
```

### Design Patterns

#### Functional Programming

- Immutable data structures
- Pure functions where possible
- State management through atoms
- Reactive programming with Reagent

#### Component-Based Architecture

- Reusable UI components
- Clear separation of concerns
- Props-based data flow
- Component lifecycle management

#### Event-Driven Architecture

- Event handlers for user input
- Reactive state updates
- Pub/sub pattern for loose coupling
- Async event processing

---

## State Management

### Global State Structure

The application uses a centralized state management pattern with Reagent atoms:

```clojure
(defonce app-state
  (r/atom {:buffers {}           ; Buffer management
           :current-buffer nil  ; Active buffer tracking
           :evil-state {...}    ; Evil mode state
           :ui {...}           ; UI preferences
           :opencode {...}     ; Opencode integration
           :plugins {...}      ; Plugin system
           ...}))
```

### State Management Patterns

#### Immutable Updates

```clojure
;; Good: Immutable update
(swap! app-state update-in [:evil-state :mode] assoc :normal)

;; Bad: Direct mutation
(reset! (get-in @app-state [:evil-state :mode]) :normal)
```

#### Derived State (Ratoms)

```clojure
(defn current-buffer-content []
  (ratom/reaction
    (when-let [buffer (get-current-buffer)]
      (:content buffer))))
```

#### Watchers for Side Effects

```clojure
(add-watch app-state :auto-save
  (fn [_key _ref old new]
    (when (buffer-changed? old new)
      (save-buffer!))))
```

### State Flow

```
User Action → Event Handler → State Update → Component Re-render → UI Update
     ↑                                                           ↓
     └─────────────────── Side Effects (File I/O, Network) ──────┘
```

---

## Component Architecture

### Component Hierarchy

```
app
├── header
│   ├── app-title
│   ├── menu-bar
│   └── window-controls
├── main-content
│   ├── left-sidebar
│   │   ├── file-tree
│   │   └── recent-files
│   ├── editor-area
│   │   ├── tab-bar
│   │   ├── editor-pane
│   │   │   └── editor
│   │   └── minimap
│   └── right-sidebar
│       ├── opencode-status
│       └── plugins-list
├── status-bar
├── which-key-popup
└── command-palette
```

### Component Patterns

#### Stateful Components

```clojure
(defn tab-bar []
  (let [buffers (r/cursor state/app-state [:buffers])
        current-buffer (r/cursor state/app-state [:current-buffer])]
    (fn []
      [:div.tab-bar
       (for [[buffer-id buffer] @buffers]
         ^{:key buffer-id}
         [tab-component buffer-id buffer])])))
```

#### Stateless Components

```clojure
(defn tab-component [buffer-id buffer]
  [:div.tab
   {:on-click #(state/set-current-buffer! buffer-id)}
   [:span (:name buffer)]
   (when (:modified? buffer)
     [:span.modified "●"])])
```

#### Higher-Order Components

```clojure
(defn with-keybindings [component keybindings]
  (let [keymap (r/atom keybindings)]
    (fn [props]
      [:div {:on-key-down (handle-keys @keymap)}
       [component props]])))
```

---

## Plugin System

### Plugin Architecture

```
Plugin System
├── Plugin Manager (Main Process)
├── Plugin Loader (Dynamic Loading)
├── Plugin API (Exposed via Preload)
├── Plugin Registry (Manifest Management)
└── Plugin Sandbox (Isolated Execution)
```

### Plugin Structure

```
my-plugin/
├── manifest.json          # Plugin metadata
├── dist/
│   └── index.js          # Compiled plugin
├── src/
│   ├── main.js           # Plugin entry point
│   └── components/       # UI components
└── assets/               # Static assets
```

### Plugin Lifecycle

1. **Discovery**: Scan plugin directory for manifests
2. **Loading**: Load plugin code in isolated context
3. **Registration**: Register plugin capabilities
4. **Activation**: Enable plugin functionality
5. **Deactivation**: Clean up plugin resources
6. **Unloading**: Remove plugin from memory

### Plugin API

```javascript
// Plugin can access:
window.electronAPI.loadPlugin()
window.electronAPI.unloadPlugin()
window.electronAPI.listPlugins()
window.electronAPI.onPluginEvent()

// Plugin can register:
- Keybindings
- Menu items
- UI components
- File handlers
- Tool providers
```

---

## Opencode Integration

### Integration Architecture

```
Opencode Integration
├── SDK Client (HTTP/WebSocket)
├── Session Management
├── Tool Execution Engine
├── Agent Communication
├── File Operations Bridge
└── UI Integration Layer
```

### Communication Flow

```
Editor UI → Opencode Client → Opencode Server → AI Agent
    ↑                                                    ↓
    └────────────── Response/Results ────────────────────┘
```

### Key Integration Points

#### Tool Execution

```clojure
(defn execute-tool [tool-name parameters]
  (-> (opencode-api-call "POST" "/api/tools/execute"
                         {:tool-name tool-name
                          :parameters parameters})
      (.then handle-tool-result)
      (.catch handle-tool-error)))
```

#### Agent Communication

```clojure
(defn send-agent-message [agent-id message]
  (opencode-api-call "POST"
                     (str "/api/agents/" agent-id "/message")
                     {:message message}))
```

#### File Operations

```clojure
(defn opencode-read-file [file-path]
  (execute-tool "serena_read_file" {:relative_path file-path}))
```

---

## Build System

### Shadow-CLJS Configuration

```clojure
{:builds
 {:renderer {:target :browser
             :output-dir "public/renderer"
             :modules {:main {:init-fn main/init}}}
  :main     {:target :node-script
             :output-to "dist/main.js"
             :main electron.main/start}
  :preload  {:target :node-script
             :output-to "dist/preload.js"
             :main electron.preload/start}
  :server   {:target :node-script
             :output-to "dist/server.js"
             :main electron.server/start}}}
```

### Build Targets

#### Renderer Target

- **Purpose**: Browser-based UI
- **Output**: JavaScript files for web browser
- **Features**: Hot reload, React components, CSS compilation

#### Main Target

- **Purpose**: Electron main process
- **Output**: Node.js executable
- **Features**: File system access, IPC, window management

#### Preload Target

- **Purpose**: Secure bridge between processes
- **Output**: Node.js script
- **Features**: Context isolation, API exposure

#### Server Target

- **Purpose**: Web server for development
- **Output**: Node.js HTTP server
- **Features**: Static file serving, development tools

### Compilation Pipeline

```
ClojureScript → Shadow-CLJS → JavaScript → Electron/Web
      ↓              ↓            ↓           ↓
  Source Code   Compilation   Optimized   Runtime
                & Bundling    Code       Execution
```

---

## Data Flow

### User Input Flow

```
Keyboard Input → Key Event → Normalization → Keymap Lookup → Handler Execution → State Update → UI Re-render
```

### File Operation Flow

```
File Request → IPC Call → Main Process → File System → Response → Renderer → State Update → UI Update
```

### Opencode Integration Flow

```
Tool Request → Opencode Client → HTTP Request → Opencode Server → AI Agent → Response → UI Update
```

### State Update Flow

```
Action → State Update → Watcher Trigger → Side Effects → Component Re-render → DOM Update
```

---

## Security Model

### Process Isolation

- **Main Process**: Full system access, no direct UI
- **Renderer Process**: Limited access, sandboxed
- **Preload Script**: Controlled API exposure
- **Plugin Sandbox**: Isolated plugin execution

### API Security

#### Context Bridge

```javascript
// Secure API exposure
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  // Only safe, validated APIs exposed
});
```

#### Input Validation

```clojure
(defn validate-file-path [path]
  (when (and (string? path)
             (not (str/includes? path ".."))
             (str/starts-with? path "/safe/"))
    path))
```

#### Permission System

```clojure
(def plugin-permissions
  {:fs-read #{:safe-directories}
   :fs-write #{:user-data}
   :network #{:opencode-api}
   :ui #{:sidebar :menu}})
```

### Security Best Practices

1. **Context Isolation**: Prevent prototype pollution
2. **Input Validation**: Sanitize all user inputs
3. **Least Privilege**: Minimal API exposure
4. **Content Security Policy**: Restrict resource loading
5. **Plugin Sandboxing**: Isolate third-party code

---

## Performance Considerations

### Rendering Performance

#### Virtual Scrolling

```clojure
(defn virtual-list [items item-height]
  (let [visible-range (calculate-visible-range)]
    (for [i (range (:start visible-range) (:end visible-range))]
      [list-item (nth items i)])))
```

#### Debounced Updates

```clojure
(defn debounced-update [f delay]
  (let [timeout (atom nil)]
    (fn [& args]
      (when @timeout (js/clearTimeout @timeout))
      (reset! timeout (js/setTimeout #(apply f args) delay)))))
```

### Memory Management

#### Buffer Pooling

```clojure
(def buffer-pool (atom {}))

(defn get-buffer [id]
  (or (get @buffer-pool id)
      (let [buffer (create-buffer id)]
        (swap! buffer-pool assoc id buffer)
        buffer)))
```

#### Garbage Collection

```clojure
(defn cleanup-unused-buffers! []
  (let [active-buffers (get-active-buffer-ids)]
    (swap! buffer-pool
           (fn [pool]
             (select-keys pool active-buffers)))))
```

### Async Operations

#### Promise Management

```clojure
(defn with-timeout [promise timeout-ms]
  (let [timeout-promise (js/Promise.reject
                         (js/Error. "Operation timed out"))]
    (js/Promise.race [promise
                     (js/new Promise
                       (fn [resolve]
                         (js/setTimeout resolve timeout-ms)))])))
```

#### Concurrent Operations

```clojure
(defn parallel-execute [operations]
  (->> operations
       (map js/Promise.resolve)
       (apply js/Promise.all)))
```

---

## Testing Strategy

### Unit Testing

- Pure function testing with Clojure test
- Component testing with Reagent test utilities
- State management testing with atom inspection

### Integration Testing

- IPC communication testing
- File system operation testing
- Opencode integration testing

### End-to-End Testing

- User workflow testing
- Cross-platform compatibility testing
- Performance testing under load

---

## Deployment Architecture

### Development Deployment

```
Development Server (localhost:3000)
├── Hot Reload Enabled
├── Source Maps Available
├── Debug Tools Open
└── Logging Verbose
```

### Production Deployment

```
Electron App Bundle
├── Optimized JavaScript
├── Minified CSS
├── Packed Resources
└── Code Signing (Optional)
```

### Web Deployment

```
Web Server
├── Static File Serving
├── CDN Integration
├── Caching Strategy
└── HTTPS Enforcement
```

---

## Future Architecture Considerations

### Scalability

- Multi-window support
- Plugin ecosystem expansion
- Cloud synchronization
- Collaborative editing

### Extensibility

- Theme system enhancement
- Custom language modes
- Advanced plugin APIs
- Integration marketplace

### Performance

- Web Workers for heavy operations
- IndexedDB for large file handling
- Streaming for large files
- GPU acceleration for rendering

This architecture provides a solid foundation for a modern, extensible, and secure text editor that combines the power of functional programming with the flexibility of web technologies.
