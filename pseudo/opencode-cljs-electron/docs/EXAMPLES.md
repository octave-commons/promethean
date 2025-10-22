# Usage Examples

This document provides practical examples and code snippets for using the Opencode ClojureScript Electron application.

## Table of Contents

- [Basic Editor Usage](#basic-editor-usage)
- [Evil Mode Examples](#evil-mode-examples)
- [Spacemacs Keybindings](#spacemacs-keybindings)
- [Opencode Integration](#opencode-integration)
- [Plugin Development](#plugin-development)
- [Custom Configuration](#custom-configuration)
- [Advanced Workflows](#advanced-workflows)

---

## Basic Editor Usage

### Opening and Editing Files

#### Opening a File

```clojure
;; Using the file menu
SPC f f  ; Open file dialog

;; Using command palette
Ctrl-p    ; Open command palette
Type "Open File" and press Enter

;; Programmatically (for plugins)
(app.buffers/open-file "/path/to/file.cljs")
```

#### Creating a New Buffer

```clojure
;; Using keybindings
SPC b n  ; New buffer

;; Programmatically
(let [buffer-id (app.buffers/generate-buffer-id)]
  (app.state/add-buffer!
    (app.state/create-buffer buffer-id "")))
```

#### Saving Files

```clojure
;; Save current buffer
SPC f s  ; Save file

;; Save as
SPC f w  ; Save as

;; Programmatically
(app.buffers/save-current-buffer)
```

### Basic Text Editing

#### Inserting Text

```clojure
;; Enter insert mode
i        ; Enter insert mode at cursor
a        ; Enter insert mode after cursor
o        ; Open new line below and enter insert mode
O        ; Open new line above and enter insert mode

;; Type your text, then:
ESC      ; Return to normal mode
```

#### Navigation

```clojure
;; Basic movement
h j k l  ; Left, down, up, right
w        ; Move to next word
b        ; Move to previous word
0        ; Beginning of line
$        ; End of line
gg       ; Beginning of buffer
G        ; End of buffer

;; Line numbers
5g       ; Go to line 5
:50      ; Go to line 50 (in command mode)
```

#### Text Manipulation

```clojure
;; Deleting
x        ; Delete character at cursor
dd       ; Delete line
dw       ; Delete word
d0       ; Delete to beginning of line
d$       ; Delete to end of line

;; Yanking (copying)
yy       ; Yank line
yw       ; Yank word
y0       ; Yank to beginning of line
y$       ; Yank to end of line

;; Pasting
p        ; Paste after cursor
P        ; Paste before cursor
```

---

## Evil Mode Examples

### Mode Transitions

#### Normal to Insert Mode

```clojure
;; Multiple ways to enter insert mode
i        ; Insert at cursor
a        ; Append after cursor
I        ; Insert at beginning of line
A        ; Append at end of line
o        ; Open line below
O        ; Open line above
s        ; Substitute character
S        ; Substitute line
```

#### Visual Mode Operations

```clojure
;; Enter visual mode
v        ; Character-wise visual mode
V        ; Line-wise visual mode
Ctrl-v   ; Block-wise visual mode

;; Visual mode operations
d        ; Delete selection
y        ; Yank selection
c        ; Change selection
>        ; Indent selection
<        ; Unindent selection

;; Exit visual mode
ESC      ; Return to normal mode
```

### Advanced Evil Mode

#### Search and Replace

```clojure
;; Search
/pattern ; Search forward for pattern
?pattern ; Search backward for pattern
n        ; Next search result
N        ; Previous search result

;; Replace
:%s/old/new/g        ; Replace all occurrences in file
:%s/old/new/gc       ; Replace with confirmation
:2,5s/old/new/g      ; Replace in lines 2-5
```

#### Marks and Jumps

```clojure
;; Set marks
ma       ; Set mark 'a' at cursor
mA       ; Set global mark 'A'

;; Jump to marks
`a       ; Jump to mark 'a' (exact position)
'a       ; Jump to mark 'a' (beginning of line)

;; Jump list
Ctrl-o   ; Jump to older position
Ctrl-i   ; Jump to newer position
```

#### Registers

```clojure
;; Named registers
"ay      ; Yank to register 'a'
"ap      ; Paste from register 'a'

;; System registers
"*y      ; Yank to system clipboard
"*p      ; Paste from system clipboard

;; Number registers
"1p      ; Paste from register 1 (last yank/delete)
"2p      ; Paste from register 2 (second last)
```

---

## Spacemacs Keybindings

### File Operations

#### File Management

```clojure
SPC f f  ; Find file
SPC f s  ; Save file
SPC f w  ; Save as
SPC f r  ; Rename file
SPC f d  ; Delete file
SPC f c  ; Copy file
SPC f m  ; Move file
```

#### Recent Files

```clojure
SPC f r  ; Recent files
SPC f j  ; Jump to recent file
SPC f f  ; Find file (with recent files)
```

### Buffer Operations

#### Buffer Navigation

```clojure
SPC b b  ; Switch buffer
SPC b n  ; Next buffer
SPC b p  ; Previous buffer
SPC b l  ; List buffers
SPC b k  ; Kill buffer
SPC b d  ; Kill other buffers
```

#### Buffer Management

```clojure
SPC b s  ; Save buffer
SPC b S  ; Save all buffers
SPC b r  ; Revert buffer
SPC b R  ; Revert all buffers
```

### Window Operations

#### Window Navigation

```clojure
SPC w w  ; Other window
SPC w h  ; Window left
SPC w j  ; Window down
SPC w k  ; Window up
SPC w l  ; Window right
```

#### Window Management

```clojure
SPC w s  ; Split window horizontally
SPC w v  ; Split window vertically
SPC w c  ; Close window
SPC w o  ; Close other windows
SPC w d  ; Delete window
```

### Project Operations

#### Project Navigation

```clojure
SPC p p  ; Switch project
SPC p f  ; Find file in project
SPC p s  ; Search in project
SPC p d  ; Find directory
```

#### Project Management

```clojure
SPC p a  ; Add file to project
SPC p r  ; Remove file from project
SPC p l  ; List project files
```

### Editor Operations

#### Code Navigation

```clojure
SPC e e  ; Evaluate expression
SPC e l  ; Evaluate line
SPC e b  ; Evaluate buffer
SPC e r  ; Evaluate region
```

#### Code Formatting

```clojure
SPC e f  ; Format buffer
SPC e r  ; Format region
SPC e =  ; Align region
```

---

## Opencode Integration

### Connecting to Opencode

#### Basic Connection

```clojure
;; Using keybindings
SPC o c  ; Connect to Opencode

;; Using command palette
Ctrl-p
Type "Connect to Opencode"

;; Programmatically
(app.opencode/connect-to-opencode "http://localhost:3000")
  .then((result) => {
    if (result.error) {
      console.error("Connection failed:", result.error);
    } else {
      console.log("Connected successfully");
    }
  });
```

#### Connection Status

```clojure
;; Check connection status
SPC o s  ; Show Opencode status

;; Programmatically
(let [state (app.opencode/get-opencode-state)]
  (println "Connected:" (:connected? state))
  (println "Session:" (:session-id state)))
```

### Working with Agents

#### Spawning an Agent

```clojure
;; Using keybindings
SPC o a  ; Spawn agent

;; Using command palette
Ctrl-p
Type "Spawn Agent"

;; Programmatically
(app.opencode/spawn-agent "code-reviewer"
                         "Review this ClojureScript code for best practices")
  .then((result) => {
    if (!result.error) {
      console.log("Agent spawned:", result.agent-id);
      // Create chat buffer
      (app.opencode/create-agent-chat-buffer result.agent-id "code-reviewer");
    }
  });
```

#### Agent Communication

```clojure
;; Send message to agent
(app.opencode/send-agent-message "agent-123"
                                "What are the best practices for ClojureScript state management?"
                                "instruction")

;; Get agent status
(app.opencode/get-agent-status "agent-123")
  .then((status) => {
    console.log("Agent status:", status);
  });
```

#### Agent Chat Buffer

```clojure
;; Create agent chat buffer
(app.opencode/create-agent-chat-buffer "agent-123" "general")

;; In the chat buffer:
;; Type your message above the "---" line
;; Use C-c C-c to send to agent

;; Send buffer content programmatically
(app.opencode/send-buffer-content-to-agent "buffer-456")
```

### Tool Execution

#### Executing Tools

```clojure
;; Using keybindings
SPC o e  ; Execute tool

;; Using command palette
Ctrl-p
Type "Execute Tool"

;; Programmatically
(app.opencode/execute-tool "serena_search_for_pattern"
                          {:substring_pattern "defn"
                           :paths_include_glob "*.cljs"})
  .then((result) => {
    if (!result.error) {
      console.log("Search results:", result);
    }
  });
```

#### File Operations via Opencode

```clojure
;; Read file through Opencode
(app.opencode/opencode-read-file "src/app/state.cljs")
  .then((result) => {
    if (!result.error) {
      console.log("File content:", result.content);
    }
  });

;; Write file through Opencode
(app.opencode/opencode-write-file "src/app/new_file.cljs"
                                  "(ns new-file)\n\n(defn hello []\n  \"Hello World\")")
  .then((result) => {
    if (!result.error) {
      console.log("File saved successfully");
    }
  });

;; Search code
(app.opencode/opencode-search-code "defn"
                                   {:paths_include_glob "*.cljs"
                                    :context_lines_before 2
                                    :context_lines_after 2})
  .then((results) => {
    console.log("Search results:", results);
  });
```

### Tool Execution Buffer

#### Creating Tool Execution Buffer

```clojure
;; Automatically created when executing tools
;; Shows execution progress and results

;; Manually create tool execution buffer
(app.opencode/create-tool-execution-buffer
  "serena_read_file"
  {:relative_path "src/app/state.cljs"}
  "exec-123")

;; Update buffer with results
(app.opencode/update-tool-execution-buffer "exec-123")
```

---

## Plugin Development

### Basic Plugin Structure

#### Plugin Manifest

```json
{
  "name": "example-plugin",
  "version": "1.0.0",
  "description": "Example plugin for Opencode",
  "main": "src/main.js",
  "entry": "dist/index.js",
  "permissions": ["fs", "network", "ui"],
  "contributes": {
    "commands": [
      {
        "command": "example.hello",
        "title": "Hello World",
        "category": "Example"
      },
      {
        "command": "example.insert-date",
        "title": "Insert Date",
        "category": "Example"
      }
    ],
    "keybindings": [
      {
        "command": "example.hello",
        "key": "ctrl+shift+h",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

#### Plugin Implementation

```javascript
// src/main.js
class ExamplePlugin {
  constructor(api) {
    this.api = api;
  }

  async activate() {
    console.log('Example plugin activated');

    // Register commands
    this.api.registerCommand('example.hello', () => {
      this.api.showNotification('Hello from Example Plugin!');
    });

    this.api.registerCommand('example.insert-date', () => {
      const date = new Date().toLocaleString();
      this.api.insertText(date);
    });

    // Register keybindings
    this.api.registerKeybinding(['SPC', 'e', 'h'], () => {
      this.api.executeCommand('example.hello');
    });

    // Add menu items
    this.api.addMenuItem({
      label: 'Example',
      submenu: [
        {
          label: 'Hello World',
          click: () => this.api.executeCommand('example.hello'),
        },
        {
          label: 'Insert Date',
          click: () => this.api.executeCommand('example.insert-date'),
        },
      ],
    });

    // Listen to events
    this.api.onBufferChanged((buffer) => {
      console.log('Buffer changed:', buffer.id);
    });
  }

  async deactivate() {
    console.log('Example plugin deactivated');

    // Clean up resources
    this.api.unregisterCommand('example.hello');
    this.api.unregisterCommand('example.insert-date');
  }
}

module.exports = ExamplePlugin;
```

### Advanced Plugin Examples

#### File Watcher Plugin

```javascript
class FileWatcherPlugin {
  constructor(api) {
    this.api = api;
    this.watchers = new Map();
  }

  async activate() {
    this.api.registerCommand('filewatch.start', () => {
      this.startWatching();
    });

    this.api.registerCommand('filewatch.stop', () => {
      this.stopWatching();
    });
  }

  startWatching() {
    const currentBuffer = this.api.getCurrentBuffer();
    if (currentBuffer && currentBuffer.path) {
      const fs = require('fs');
      const watcher = fs.watchFile(currentBuffer.path, () => {
        this.api.showNotification('File changed on disk');
        this.api.reloadBuffer(currentBuffer.id);
      });

      this.watchers.set(currentBuffer.id, watcher);
    }
  }

  stopWatching() {
    this.watchers.forEach((watcher, bufferId) => {
      const fs = require('fs');
      fs.unwatchFile(watcher.path);
    });
    this.watchers.clear();
  }
}
```

#### Code Formatter Plugin

```javascript
class CodeFormatterPlugin {
  constructor(api) {
    this.api = api;
  }

  async activate() {
    this.api.registerCommand('formatter.format-buffer', () => {
      this.formatCurrentBuffer();
    });

    this.api.registerKeybinding(['SPC', 'e', 'f'], () => {
      this.formatCurrentBuffer();
    });
  }

  async formatCurrentBuffer() {
    const buffer = this.api.getCurrentBuffer();
    if (!buffer) return;

    let formatted = buffer.content;

    // Simple ClojureScript formatter
    if (buffer.language === 'clojurescript') {
      formatted = this.formatClojureScript(formatted);
    }

    if (formatted !== buffer.content) {
      this.api.updateBuffer(buffer.id, formatted);
      this.api.showNotification('Buffer formatted');
    }
  }

  formatClojureScript(code) {
    // Simple formatting rules
    return code
      .replace(/\(/g, '(\n  ')
      .replace(/\)/g, '\n)')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }
}
```

---

## Custom Configuration

### Custom Keybindings

#### Adding Custom Keybindings

```clojure
;; In your configuration or plugin
(app.keymap/register-keybinding :normal ["g" "d"]
  #(app.buffers/goto-definition))

(app.keymap/register-keybinding :normal ["g" "r"]
  #(app.buffers/goto-references))

;; Spacemacs-style bindings
(app.keymap/register-spacemacs-binding ["SPC" "c" "g"]
  #(app.buffers/comment-region))

(app.keymap/register-spacemacs-binding ["SPC" "c" "u"]
  #(app.buffers/uncomment-region))
```

#### Mode-Specific Keybindings

```clojure
;; Insert mode keybindings
(app.keymap/register-keybinding :insert ["Ctrl-j"]
  #(app.evil/enter-normal-mode))

;; Visual mode keybindings
(app.keymap/register-keybinding :visual ["*"]
  #(app.search/selection-forward))
```

### Custom Themes

#### Creating a Custom Theme

```clojure
;; In app/ui.cljs or custom theme file
(defn custom-theme-styles []
  [:style
   (str "
   .theme-custom {
     --bg-primary: #1e1e1e;
     --bg-secondary: #252526;
     --bg-tertiary: #2d2d30;
     --text-primary: #cccccc;
     --text-secondary: #969696;
     --text-dim: #6a6a6a;
     --border: #3e3e42;
     --accent: #007acc;
     --accent-hover: #005a9e;
     --success: #4ec9b0;
     --warning: #ce9178;
     --error: #f48771;
     --selection: rgba(0, 122, 204, 0.3);
   }

   .theme-custom .editor-content {
     font-family: 'Fira Code', 'Consolas', monospace;
     line-height: 1.6;
   }
   ")])
```

#### Applying Custom Theme

```clojure
;; Set custom theme
(swap! state/app-state assoc-in [:ui :theme] :custom)

;; Add theme styles to UI
(defn app []
  [:div.app-container
   {:class (str "theme-" (get-in @state/app-state [:ui :theme]))}
   [custom-theme-styles]
   ;; ... rest of app
   ])
```

### Custom Commands

#### Creating Custom Commands

```clojure
(defn custom-commands []
  [{:name "Custom: Hello World"
    :description "Shows a hello world message"
    :action #(js/alert "Hello World!")
    :keys "SPC c h"}

   {:name "Custom: Toggle Line Numbers"
    :description "Toggles line number display"
    :action #(swap! state/app-state update-in [:ui :line-numbers] not)
    :keys "SPC c l"}

   {:name "Custom: Insert Timestamp"
    :description "Inserts current timestamp at cursor"
    :action #(app.evil/insert-text-at-cursor (str (js/Date.)))
    :keys "SPC c t"}])

;; Add to command palette
(swap! state/command-palette concat (custom-commands))
```

---

## Advanced Workflows

### Code Review Workflow

#### Setting Up Code Review

```clojure
;; 1. Open file to review
SPC f f  ; Find file

;; 2. Spawn code reviewer agent
SPC o a  ; Spawn agent
Type: "code-reviewer"
Prompt: "Review this ClojureScript code for best practices, performance, and readability"

;; 3. Agent creates chat buffer
;; 4. Paste code in chat buffer
;; 5. Use C-c C-c to send to agent

;; 6. Review agent feedback
;; 7. Make suggested changes
```

#### Automated Code Analysis

```clojure
;; Create custom command for code analysis
(defn analyze-code []
  (let [buffer (state/get-current-buffer)]
    (when buffer
      ;; Check for common issues
      (app.opencode/execute-tool "serena_search_for_pattern"
                                {:substring_pattern "defn-"
                                 :paths_include_glob (:path buffer)})
      (.then (fn [result]
               (when (> (count result) 0)
                 (js/alert "Found private functions - consider documentation")))))))

;; Register command
(app.keymap/register-spacemacs-binding ["SPC" "a" "c"] analyze-code)
```

### Documentation Generation

#### Generating Documentation

```clojure
(defn generate-docs []
  (let [buffer (state/get-current-buffer)]
    (when buffer
      ;; Extract function definitions
      (app.opencode/execute-tool "serena_search_for_pattern"
                                {:substring_pattern "\\(defn\\s+([^\\s]+)"
                                 :paths_include_glob (:path buffer)
                                 :useRegexp true})
      (.then (fn [functions]
               ;; Create documentation buffer
               (let [doc-buffer (app.buffers/create-buffer
                                  "docs"
                                  (generate-doc-content functions))]
                 (state/add-buffer! doc-buffer)))))))

(defn generate-doc-content [functions]
  (str "# API Documentation\n\n"
       (clojure.string/join "\n"
         (map (fn [f]
                (str "## " (:name f) "\n"
                     "TODO: Add documentation\n"))
              functions))))
```

### Project Management

#### Project Setup Workflow

```clojure
(defn setup-new-project []
  ;; 1. Create project structure
  (app.opencode/execute-tool "serena_create_text_file"
                            {:relative_path "README.md"
                             :content "# New Project\n\nDescription here\n"})

  ;; 2. Create source directory
  (app.opencode/execute-tool "serena_create_text_file"
                            {:relative_path "src/.gitkeep"
                             :content ""})

  ;; 3. Create test directory
  (app.opencode/execute-tool "serena_create_text_file"
                            {:relative_path "test/.gitkeep"
                             :content ""})

  ;; 4. Open README for editing
  (app.opencode/open-buffer-with-opencode "README.md"))

;; Register as command
(app.keymap/register-spacemacs-binding ["SPC" "p" "n"] setup-new-project)
```

### Debugging Workflow

#### Debug Buffer Operations

```clojure
(defn debug-buffer-state []
  (let [buffer (state/get-current-buffer)]
    (when buffer
      (js/console.log "Buffer debug info:")
      (js/console.log "ID:" (:id buffer))
      (js/console.log "Path:" (:path buffer))
      (js/console.log "Language:" (:language buffer))
      (js/console.log "Cursor:" (:cursor-pos buffer))
      (js/console.log "Modified:" (:modified? buffer))
      (js/console.log "Content length:" (count (:content buffer))))))

;; Add to debug menu
(app.keymap/register-spacemacs-binding ["SPC" "h" "d"] debug-buffer-state)
```

#### Performance Monitoring

```clojure
(defn monitor-performance []
  (let [start-time (js/performance.now)]
    ;; Perform operation
    (app.opencode/list-available-tools)
      (.then (fn [result]
               (let [end-time (js/performance.now)
                     duration (- end-time start-time)]
                 (js/console.log "Operation took:" duration "ms")
                 (state/update-statusbar! ""
                                         (str "Operation: " duration "ms")
                                         "")))))

;; Register for performance testing
(app.keymap/register-spacemacs-binding ["SPC" "h" "p"] monitor-performance)
```

These examples demonstrate the power and flexibility of the Opencode ClojureScript Electron application, showing how to leverage its features for real-world development workflows.
