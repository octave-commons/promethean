# Opencode ClojureScript Electron API Documentation

This document provides comprehensive API documentation for the core modules of the Opencode ClojureScript Electron application.

## Table of Contents

- [State Management (`app.state`)](#state-management-appstate)
- [Evil Mode (`app.evil`)](#evil-mode-appevil)
- [Keymap System (`app.keymap`)](#keymap-system-appkeymap)
- [Opencode Integration (`app.opencode`)](#opencode-integration-appopencode)
- [Buffer Management (`app.buffers`)](#buffer-management-appbuffers)
- [UI Components (`app.ui`)](#ui-components-appui)
- [Layout Components (`app.layout`)](#layout-components-applayout)
- [Environment (`app.env`)](#environment-appenv)
- [Electron Main Process (`electron.main`)](#electron-main-process-electronmain)
- [Electron Preload (`electron.preload`)](#electron-preload-electronpreload)

---

## State Management (`app.state`)

Global application state management using Reagent atoms and reactive programming.

### Core State Structure

```clojure
{:buffers {}                    ; Map of buffer ID -> buffer data
 :current-buffer nil           ; Currently active buffer ID
 :windows {}                   ; Window layout state
 :keymap-state {}              ; Current keymap state
 :evil-state {:mode :normal     ; Evil mode state
              :count nil
              :register nil
              :mark nil
              :last-search nil
              :search-direction :forward}
 :which-key {:active false      ; Which-key popup state
             :prefix []
             :timeout nil}
 :statusbar {:left ""           ; Statusbar content
             :center ""
             :right ""}
 :plugins {}                   ; Loaded plugins
 :opencode {:connected false   ; Opencode connection state
            :session-id nil
            :available-agents []
            :active-tasks {}}
 :ui {:theme :dark             ; UI preferences
      :font-size 14
      :line-numbers true
      :minimap true}
 :workspace {:current-dir nil   ; Workspace state
            :project-files []
            :recent-files []
            :bookmarks {}}}
```

### Buffer Operations

#### `create-buffer`

```clojure
(create-buffer id content & {:keys [name path language modified?]
                            :or {name (str "Buffer " id)
                                 path nil
                                 language "text"
                                 modified? false}})
```

Creates a new buffer with the given content and metadata.

**Parameters:**

- `id` - Unique buffer identifier
- `content` - Initial buffer content
- `:name` - Display name (optional)
- `:path` - File path (optional)
- `:language` - Language mode (optional, default: "text")
- `:modified?` - Modified state (optional, default: false)

**Returns:** Buffer map with metadata

#### `add-buffer!`

```clojure
(add-buffer! buffer)
```

Adds a new buffer to the app state.

**Parameters:**

- `buffer` - Buffer map created by `create-buffer`

#### `remove-buffer!`

```clojure
(remove-buffer! buffer-id)
```

Removes a buffer from the app state.

**Parameters:**

- `buffer-id` - ID of buffer to remove

#### `get-current-buffer`

```clojure
(get-current-buffer)
```

Gets the currently active buffer.

**Returns:** Current buffer map or nil

#### `update-current-buffer!`

```clojure
(update-current-buffer! f)
```

Updates the current buffer with the given function.

**Parameters:**

- `f` - Function that takes buffer and returns updated buffer

### Evil Mode Operations

#### `set-evil-mode!`

```clojure
(set-evil-mode! mode)
```

Sets the current Evil mode.

**Parameters:**

- `mode` - One of `:normal`, `:insert`, `:visual`, `:visual-line`

#### `get-evil-mode`

```clojure
(get-evil-mode)
```

Gets the current Evil mode.

**Returns:** Current mode keyword

### UI State Operations

#### `update-statusbar!`

```clojure
(update-statusbar! left center right)
```

Updates statusbar content.

**Parameters:**

- `left` - Left section content
- `center` - Center section content
- `right` - Right section content

#### `show-which-key!`

```clojure
(show-which-key! prefix)
```

Shows which-key popup with the given prefix.

**Parameters:**

- `prefix` - Key sequence prefix vector

#### `hide-which-key!`

```clojure
(hide-which-key!)
```

Hides which-key popup.

### Workspace Operations

#### `save-workspace!`

```clojure
(save-workspace!)
```

Saves current workspace state to localStorage.

#### `load-workspace!`

```clojure
(load-workspace!)
```

Loads workspace state from localStorage.

### Derived State (Ratoms)

#### `current-buffer-content`

```clojure
(current-buffer-content)
```

Reactive atom for current buffer content.

#### `current-buffer-language`

```clojure
(current-buffer-language)
```

Reactive atom for current buffer language.

#### `current-evil-mode`

```clojure
(current-evil-mode)
```

Reactive atom for current Evil mode.

---

## Evil Mode (`app.evil`)

Complete Vim-style modal editing implementation.

### Mode Management

#### `set-mode!`

```clojure
(set-mode! mode)
```

Sets the current Evil mode and updates statusbar.

**Parameters:**

- `mode` - Mode keyword (`:normal`, `:insert`, `:visual`, `:visual-line`)

#### `get-mode`

```clojure
(get-mode)
```

Gets the current Evil mode.

**Returns:** Current mode keyword

#### `enter-normal-mode`

```clojure
(enter-normal-mode)
```

Switches to Normal mode.

#### `enter-insert-mode`

```clojure
(enter-insert-mode)
```

Switches to Insert mode.

#### `enter-visual-mode`

```clojure
(enter-visual-mode)
```

Switches to Visual mode.

#### `enter-visual-line-mode`

```clojure
(enter-visual-line-mode)
```

Switches to Visual Line mode.

#### `exit-visual-mode`

```clojure
(exit-visual-mode)
```

Exits Visual mode and returns to Normal mode.

### Cursor Movement

#### `move-cursor`

```clojure
(move-cursor direction)
```

Moves cursor in the specified direction.

**Parameters:**

- `direction` - One of `:left`, `:right`, `:up`, `:down`

#### `word-forward`

```clojure
(word-forward)
```

Moves cursor to next word boundary.

#### `word-backward`

```clojure
(word-backward)
```

Moves cursor to previous word boundary.

#### `beginning-of-line`

```clojure
(beginning-of-line)
```

Moves cursor to beginning of current line.

#### `end-of-line`

```clojure
(end-of-line)
```

Moves cursor to end of current line.

#### `beginning-of-buffer`

```clojure
(beginning-of-buffer)
```

Moves cursor to beginning of buffer.

#### `end-of-buffer`

```clojure
(end-of-buffer)
```

Moves cursor to end of buffer.

### Text Editing

#### `insert-text-at-cursor`

```clojure
(insert-text-at-cursor text)
```

Inserts text at current cursor position.

**Parameters:**

- `text` - Text to insert

#### `delete-char-at-cursor`

```clojure
(delete-char-at-cursor)
```

Deletes character at cursor position.

#### `delete-char-before-cursor`

```clojure
(delete-char-before-cursor)
```

Deletes character before cursor position.

#### `delete-line`

```clojure
(delete-line)
```

Deletes current line.

#### `yank-line`

```clojure
(yank-line)
```

Copies current line to register.

#### `paste-after`

```clojure
(paste-after)
```

Pastes register content after cursor.

#### `paste-before`

```clojure
(paste-before)
```

Pastes register content before cursor.

### Line Operations

#### `open-line-below`

```clojure
(open-line-below)
```

Opens new line below current line and enters Insert mode.

#### `open-line-above`

```clojure
(open-line-above)
```

Opens new line above current line and enters Insert mode.

#### `append-after-cursor`

```clojure
(append-after-cursor)
```

Moves cursor right and enters Insert mode.

### Visual Mode Operations

#### `start-visual-selection`

```clojure
(start-visual-selection)
```

Starts visual selection at current cursor position.

#### `extend-selection`

```clojure
(extend-selection direction)
```

Extends visual selection in specified direction.

**Parameters:**

- `direction` - One of `:left`, `:right`, `:up`, `:down`

#### `delete-selection`

```clojure
(delete-selection)
```

Deletes selected text.

#### `yank-selection`

```clojure
(yank-selection)
```

Copies selected text to register.

#### `change-selection`

```clojure
(change-selection)
```

Copies selection to register, deletes it, and enters Insert mode.

### Search Operations

#### `search-forward`

```clojure
(search-forward)
```

Prompts for search term and searches forward.

#### `search-backward`

```clojure
(search-backward)
```

Prompts for search term and searches backward.

#### `next-search-result`

```clojure
(next-search-result)
```

Jumps to next search result.

#### `previous-search-result`

```clojure
(previous-search-result)
```

Jumps to previous search result.

### Undo/Redo

#### `undo`

```clojure
(undo)
```

Undoes last edit operation.

#### `redo`

```clojure
(redo)
```

Redoes last undone operation.

---

## Keymap System (`app.keymap`)

Spacemacs-style keybinding system with leader key sequences and mode-specific bindings.

### Keybinding Structure

```clojure
{:leader {:bindings {"SPC" {:name "Leader"
                            :bindings {"f" {:name "File"
                                           :bindings {...}}}}}}
 :normal {:bindings {"h" {:handler #(evil/move-cursor :left)}
                     "j" {:handler #(evil/move-cursor :down)}
                     ...}}}
```

### Key Event Handling

#### `handle-key-down`

```clojure
(handle-key-down event)
```

Main key event handler for processing keydown events.

**Parameters:**

- `event` - DOM keyboard event

#### `handle-key-up`

```clojure
(handle-key-up event)
```

Handles keyup events (currently minimal implementation).

**Parameters:**

- `event` - DOM keyboard event

#### `handle-global-key`

```clojure
(handle-global-key event)
```

Handles global keybindings that work regardless of mode.

**Parameters:**

- `event` - DOM keyboard event

### Keybinding Registration

#### `register-keybinding`

```clojure
(register-keybinding mode key-sequence handler)
```

Registers a new mode-specific keybinding.

**Parameters:**

- `mode` - Mode keyword (`:normal`, `:insert`, `:visual`)
- `key-sequence` - Vector of keys (e.g., `["g" "g"]`)
- `handler` - Function to execute when binding is triggered

#### `unregister-keybinding`

```clojure
(unregister-keybinding mode key-sequence)
```

Removes a mode-specific keybinding.

**Parameters:**

- `mode` - Mode keyword
- `key-sequence` - Vector of keys

#### `register-spacemacs-binding`

```clojure
(register-spacemacs-binding path handler)
```

Registers a Spacemacs-style leader keybinding.

**Parameters:**

- `path` - Key sequence path (e.g., `["SPC" "f" "f"]`)
- `handler` - Function to execute

### Utility Functions

#### `normalize-key`

```clojure
(normalize-key event)
```

Normalizes keyboard event to string representation.

**Parameters:**

- `event` - DOM keyboard event

**Returns:** Normalized key string (e.g., "Ctrl-c", "SPC")

#### `find-binding`

```clojure
(find-binding key-sequence mode)
```

Finds binding for given key sequence and mode.

**Parameters:**

- `key-sequence` - Vector of keys
- `mode` - Current mode

**Returns:** Binding map or nil

#### `execute-binding`

```clojure
(execute-binding binding)
```

Executes the handler for a binding.

**Parameters:**

- `binding` - Binding map with `:handler` function

#### `show-which-key`

```clojure
(show-which-key prefix)
```

Shows which-key popup for given prefix.

**Parameters:**

- `prefix` - Key sequence prefix

### State Access

#### `get-current-key-sequence`

```clojure
(get-current-key-sequence)
```

Gets the current key sequence being built.

**Returns:** Vector of keys

#### `is-key-sequence-active?`

```clojure
(is-key-sequence-active?)
```

Checks if a key sequence is currently being built.

**Returns:** Boolean

---

## Opencode Integration (`app.opencode`)

Opencode SDK integration for AI agent communication and tool execution.

### Connection Management

#### `connect-to-opencode`

```clojure
(connect-to-opencode endpoint)
```

Connects to Opencode server.

**Parameters:**

- `endpoint` - Server URL (e.g., "http://localhost:3000")

**Returns:** Promise with connection result

#### `disconnect-from-opencode`

```clojure
(disconnect-from-opencode)
```

Disconnects from Opencode server and clears state.

### Session Management

#### `create-session`

```clojure
(create-session)
```

Creates new Opencode session.

**Returns:** Promise with session result

#### `join-session`

```clojure
(join-session session-id)
```

Joins existing Opencode session.

**Parameters:**

- `session-id` - Existing session ID

**Returns:** Promise with join result

### Tool Management

#### `list-available-tools`

```clojure
(list-available-tools)
```

Gets list of available Opencode tools.

**Returns:** Promise with tools list

#### `execute-tool`

```clojure
(execute-tool tool-name parameters & [options])
```

Executes an Opencode tool.

**Parameters:**

- `tool-name` - Name of tool to execute
- `parameters` - Tool parameters map
- `options` - Optional execution options

**Returns:** Promise with execution result

### Agent Management

#### `list-active-agents`

```clojure
(list-active-agents)
```

Gets list of active Opencode agents.

**Returns:** Promise with agents list

#### `spawn-agent`

```clojure
(spawn-agent agent-type prompt & [options])
```

Spawns a new Opencode agent.

**Parameters:**

- `agent-type` - Type of agent to spawn
- `prompt` - Agent prompt/instructions
- `options` - Optional spawn options

**Returns:** Promise with agent spawn result

#### `send-agent-message`

```clojure
(send-agent-message agent-id message & [message-type])
```

Sends message to an Opencode agent.

**Parameters:**

- `agent-id` - Target agent ID
- `message` - Message content
- `message-type` - Message type (optional, default: "instruction")

**Returns:** Promise with send result

#### `get-agent-status`

```clojure
(get-agent-status agent-id)
```

Gets status of an Opencode agent.

**Parameters:**

- `agent-id` - Agent ID

**Returns:** Promise with agent status

### File Operations via Opencode

#### `opencode-read-file`

```clojure
(opencode-read-file file-path)
```

Reads file using Opencode file operations.

**Parameters:**

- `file-path` - Path to file

**Returns:** Promise with file content

#### `opencode-write-file`

```clojure
(opencode-write-file file-path content)
```

Writes file using Opencode file operations.

**Parameters:**

- `file-path` - Path to file
- `content` - File content

**Returns:** Promise with write result

#### `opencode-search-code`

```clojure
(opencode-search-code pattern & [options])
```

Searches code using Opencode tools.

**Parameters:**

- `pattern` - Search pattern
- `options` - Optional search options

**Returns:** Promise with search results

### Buffer Integration

#### `open-buffer-with-opencode`

```clojure
(open-buffer-with-opencode file-path)
```

Opens buffer using Opencode file operations.

**Parameters:**

- `file-path` - Path to file

**Returns:** Promise with buffer creation result

#### `save-buffer-with-opencode`

```clojure
(save-buffer-with-opencode buffer-id)
```

Saves buffer using Opencode file operations.

**Parameters:**

- `buffer-id` - Buffer ID to save

**Returns:** Promise with save result

### Agent Communication Integration

#### `create-agent-chat-buffer`

```clojure
(create-agent-chat-buffer agent-id agent-type)
```

Creates buffer for agent communication.

**Parameters:**

- `agent-id` - Agent ID
- `agent-type` - Agent type

**Returns:** Created buffer

#### `send-buffer-content-to-agent`

```clojure
(send-buffer-content-to-agent buffer-id)
```

Sends buffer content to agent.

**Parameters:**

- `buffer-id` - Buffer ID containing message

**Returns:** Promise with send result

### Tool Execution UI Integration

#### `create-tool-execution-buffer`

```clojure
(create-tool-execution-buffer tool-name parameters execution-id)
```

Creates buffer to display tool execution results.

**Parameters:**

- `tool-name` - Name of executed tool
- `parameters` - Tool parameters
- `execution-id` - Execution ID

**Returns:** Created buffer

#### `update-tool-execution-buffer`

```clojure
(update-tool-execution-buffer execution-id)
```

Updates tool execution buffer with results.

**Parameters:**

- `execution-id` - Execution ID

### Command Integration

#### `opencode-commands`

```clojure
(opencode-commands)
```

Gets Opencode-specific commands for command palette.

**Returns:** Vector of command maps

### State Access

#### `get-opencode-state`

```clojure
(get-opencode-state)
```

Gets current Opencode state.

**Returns:** Opencode state atom

#### `get-tool-executions`

```clojure
(get-tool-executions)
```

Gets tool execution tracking state.

**Returns:** Tool executions atom

#### `get-agent-communications`

```clojure
(get-agent-communications)
```

Gets agent communication tracking state.

**Returns:** Agent communications atom

---

## Buffer Management (`app.buffers`)

Buffer management system for file operations and editor functionality.

### Buffer Lifecycle

#### `generate-buffer-id`

```clojure
(generate-buffer-id)
```

Generates unique buffer ID.

**Returns:** New buffer ID

#### `close-buffer`

```clojure
(close-buffer buffer-id)
```

Closes buffer with save prompt if modified.

**Parameters:**

- `buffer-id` - Buffer ID to close

#### `kill-current-buffer`

```clojure
(kill-current-buffer)
```

Kills current buffer.

### File Operations

#### `open-file`

```clojure
(open-file file-path)
```

Opens file in new buffer.

**Parameters:**

- `file-path` - Path to file

#### `save-current-buffer`

```clojure
(save-current-buffer)
```

Saves current buffer to file.

#### `save-current-buffer-as`

```clojure
(save-current-buffer-as)
```

Saves current buffer to new file path.

### Buffer Navigation

#### `switch-buffer`

```clojure
(switch-buffer)
```

Opens buffer switcher interface.

#### `next-buffer`

```clojure
(next-buffer)
```

Switches to next buffer.

#### `previous-buffer`

```clojure
(previous-buffer)
```

Switches to previous buffer.

#### `list-buffers`

```clojure
(list-buffers)
```

Lists all open buffers.

### Search Functionality

#### `search-next`

```clojure
(search-next query)
```

Searches for next occurrence of query.

**Parameters:**

- `query` - Search query

#### `search-prev`

```clojure
(search-prev query)
```

Searches for previous occurrence of query.

**Parameters:**

- `query` - Search query

### Editor Component

#### `editor`

```clojure
(editor buffer)
```

Creates editor component for buffer.

**Parameters:**

- `buffer` - Buffer map

**Returns:** Reagent component

### Command Palette

#### `command-palette`

```clojure
(command-palette)
```

Opens command palette.

#### `show-command-palette`

```clojure
(show-command-palette)
```

Shows command palette interface.

### Window Operations

#### `other-window`

```clojure
(other-window)
```

Switches to other window.

#### `split-window`

```clojure
(split-window)
```

Splits window horizontally.

#### `vsplit-window`

```clojure
(vsplit-window)
```

Splits window vertically.

#### `close-window`

```clojure
(close-window)
```

Closes current window.

### Project Operations

#### `find-file`

```clojure
(find-file)
```

Opens file finder.

#### `find-file-in-project`

```clojure
(find-file-in-project)
```

Finds file in current project.

#### `switch-project`

```clojure
(switch-project)
```

Switches to different project.

### Editor Operations

#### `eval-expression`

```clojure
(eval-expression)
```

Evaluates ClojureScript expression.

### UI Operations

#### `toggle-terminal`

```clojure
(toggle-terminal)
```

Toggles terminal panel.

#### `toggle-fullscreen`

```clojure
(toggle-fullscreen)
```

Toggles fullscreen mode.

#### `open-settings`

```clojure
(open-settings)
```

Opens settings dialog.

---

## UI Components (`app.ui`)

Main UI components and application layout.

### Main Application

#### `app`

```clojure
(app)
```

Main application component.

**Returns:** Reagent component representing entire app

### Theme System

#### `theme-styles`

```clojure
(theme-styles)
```

Generates CSS styles for current theme.

**Returns:** Reagent component with style tag

### Initialization

#### `init`

```clojure
(init)
```

Initializes the UI system.

Sets up:

- Workspace loading from localStorage
- Global event listeners
- App mounting to DOM
- Resize handlers

#### `reload`

```clojure
(reload)
```

Hot module replacement reload function.

#### `clear`

```clojure
(clear)
```

Hot module replacement clear function.

---

## Layout Components (`app.layout`)

Layout and UI component implementations.

### Header

#### `header`

```clojure
(header)
```

Creates header with menu bar and window controls.

**Returns:** Header component

### Sidebars

#### `left-sidebar`

```clojure
(left-sidebar)
```

Creates left sidebar with file tree and recent files.

**Returns:** Left sidebar component

#### `right-sidebar`

```clojure
(right-sidebar)
```

Creates right sidebar with plugins and Opencode status.

**Returns:** Right sidebar component

### Tab Bar

#### `tab-bar`

```clojure
(tab-bar)
```

Creates tab bar for open buffers.

**Returns:** Tab bar component

### Status Bar

#### `status-bar`

```clojure
(status-bar)
```

Creates status bar with mode and position information.

**Returns:** Status bar component

### Popups and Overlays

#### `which-key-popup`

```clojure
(which-key-popup)
```

Creates which-key popup for keybinding help.

**Returns:** Which-key popup component

#### `command-palette`

```clojure
(command-palette)
```

Creates command palette for command execution.

**Returns:** Command palette component

### Minimap

#### `minimap`

```clojure
(minimap buffer)
```

Creates minimap for buffer navigation.

**Parameters:**

- `buffer` - Buffer map

**Returns:** Minimap component

---

## Environment (`app.env`)

Environment abstraction layer for cross-platform compatibility.

### Platform Detection

#### `electron?`

```clojure
(electron?)
```

Checks if running in Electron environment.

**Returns:** Boolean

#### `web?`

```clojure
(web?)
```

Checks if running in web browser environment.

**Returns:** Boolean

#### `node?`

```clojure
(node?)
```

Checks if running in Node.js environment.

**Returns:** Boolean

#### `get-platform`

```clojure
(get-platform)
```

Gets current platform identifier.

**Returns:** Platform keyword (`:electron`, `:web`, `:node`, `:unknown`)

### API Access

#### `electron-api`

```clojure
(electron-api)
```

Gets Electron API if available.

**Returns:** Electron API object or nil

### Feature Detection

#### `show-notification?`

```clojure
(show-notification?)
```

Checks if notifications are supported.

**Returns:** Boolean

#### `file-system-access?`

```clojure
(file-system-access?)
```

Checks if file system access is available.

**Returns:** Boolean

### Utility Functions

#### `get-app-version`

```clojure
(get-app-version)
```

Gets application version.

**Returns:** Version string

#### `open-external-url`

```clojure
(open-external-url url)
```

Opens URL in external browser.

**Parameters:**

- `url` - URL to open

---

## Electron Main Process (`electron.main`)

Electron main process implementation for desktop application.

### Window Management

#### `create-window`

```clojure
(create-window)
```

Creates main application window.

Configures:

- Window size (1400x900)
- Preload script
- Context isolation
- File loading

#### `user-data-path`

```clojure
(user-data-path)
```

Gets user data directory path.

**Returns:** Path string

#### `plugin-dir`

```clojure
(plugin-dir)
```

Gets plugins directory path.

**Returns:** Path string

#### `workspace-dir`

```clojure
(workspace-dir)
```

Gets workspace directory path.

**Returns:** Path string

#### `state-file`

```clojure
(state-file)
```

Gets application state file path.

**Returns:** Path string

### Directory Management

#### `ensure-dir!`

```clojure
(ensure-dir! p)
```

Ensures directory exists, creates if necessary.

**Parameters:**

- `p` - Directory path

**Returns:** Path string

#### `ensure-plugin-dir!`

```clojure
(ensure-plugin-dir!)
```

Ensures plugins directory exists.

#### `ensure-workspace-dir!`

```clojure
(ensure-workspace-dir!)
```

Ensures workspace directory exists.

### Plugin Management

#### `list-plugin-manifests`

```clojure
(list-plugin-manifests)
```

Lists available plugin manifests.

**Returns:** Array of plugin manifest objects

#### `start-plugin-watch!`

```clojure
(start-plugin-watch!)
```

Starts file watcher for plugin directory changes.

### IPC Handlers

#### `register-ipc!`

```clojure
(register-ipc!)
```

Registers all IPC handlers for renderer communication.

Handles:

- Path operations
- File system operations
- State management
- Window management
- Plugin management
- Development tools

#### `setup-menu-handlers!`

```clojure
(setup-menu-handlers!)
```

Sets up menu action handlers.

#### `setup-plugin-handlers!`

```clojure
(setup-plugin-handlers!)
```

Sets up plugin event handlers.

### Application Lifecycle

#### `start`

```clojure
(start)
```

Starts the Electron application.

Sets up:

- App event handlers
- Directory structure
- IPC handlers
- Plugin system
- Window creation

---

## Electron Preload (`electron.preload`)

Electron preload script for secure renderer-main communication.

### API Exposure

#### `contextBridge.exposeInMainWorld`

Exposes secure APIs to renderer process via `window.electronAPI`:

### File Operations

#### `openFile`

```javascript
window.electronAPI.openFile(path);
```

Opens file and returns content.

**Parameters:**

- `path` - File path

**Returns:** Promise with file content

#### `saveFile`

```javascript
window.electronAPI.saveFile(path, content);
```

Saves content to file.

**Parameters:**

- `path` - File path
- `content` - File content

**Returns:** Promise with success boolean

#### `listDirectory`

```javascript
window.electronAPI.listDirectory(path);
```

Lists directory contents.

**Parameters:**

- `path` - Directory path

**Returns:** Promise with file list

### Event Handling

#### `onMenuAction`

```javascript
window.electronAPI.onMenuAction(callback);
```

Registers callback for menu actions.

**Parameters:**

- `callback` - Function to handle menu actions

#### `sendToMain`

```javascript
window.electronAPI.sendToMain(channel, data);
```

Sends message to main process.

**Parameters:**

- `channel` - IPC channel name
- `data` - Message data

#### `onMainMessage`

```javascript
window.electronAPI.onMainMessage(channel, callback);
```

Registers callback for main process messages.

**Parameters:**

- `channel` - IPC channel name
- `callback` - Function to handle messages

#### `removeAllListeners`

```javascript
window.electronAPI.removeAllListeners(channel);
```

Removes all listeners for channel.

**Parameters:**

- `channel` - IPC channel name

### Plugin System

#### `loadPlugin`

```javascript
window.electronAPI.loadPlugin(pluginPath);
```

Loads plugin from path.

**Parameters:**

- `pluginPath` - Path to plugin

**Returns:** Promise with load result

#### `unloadPlugin`

```javascript
window.electronAPI.unloadPlugin(pluginName);
```

Unloads plugin by name.

**Parameters:**

- `pluginName` - Plugin name

**Returns:** Promise with unload result

#### `listPlugins`

```javascript
window.electronAPI.listPlugins();
```

Lists available plugins.

**Returns:** Promise with plugin list

#### `onPluginEvent`

```javascript
window.electronAPI.onPluginEvent(callback);
```

Registers callback for plugin events.

**Parameters:**

- `callback` - Function to handle plugin events

### Window Management

#### `minimizeWindow`

```javascript
window.electronAPI.minimizeWindow();
```

Minimizes application window.

#### `maximizeWindow`

```javascript
window.electronAPI.maximizeWindow();
```

Maximizes/unmaximizes application window.

#### `closeWindow`

```javascript
window.electronAPI.closeWindow();
```

Closes application window.

### Development Tools

#### `openDevTools`

```javascript
window.electronAPI.openDevTools();
```

Opens developer tools.

### App Information

#### `getAppVersion`

```javascript
window.electronAPI.getAppVersion();
```

Gets application version.

**Returns:** Promise with version string

---

## Error Handling

Most API functions return promises that resolve with result objects or reject with errors. Always handle promise rejections appropriately:

```clojure
(-> (opencode/execute-tool "some-tool" {:param "value"})
    (.then (fn [result]
             (if (:error result)
               (handle-error (:error result))
               (process-result result))))
    (.catch (fn [error]
              (handle-unexpected-error error))))
```

## Event System

The application uses a reactive event system through Reagent atoms and watchers:

```clojure
;; Add watcher to state changes
(add-watch state/app-state :my-watcher
  (fn [key ref old new]
    (handle-state-change old new)))
```

## Plugin Development

Plugins can access the full API through the exposed Electron APIs and ClojureScript namespaces. See the main README for plugin development guidelines.
