---
uuid: 5b8c984e-cff5-4d59-b904-4c7c558a4030
created_at: lisp-dsl-for-window-management.md
filename: lisp-dsl-window-management
title: lisp-dsl-window-management
description: >-
  A minimal, homoiconic Lisp-style DSL for defining window management behaviors
  including hotkeys, group operations, workspace definitions, layouts, and
  external command integrations. The DSL aims to be interpretable by Hy,
  Sibilant, or custom runtimes with S-expression structures.
tags:
  - lisp
  - window-management
  - dsl
  - homoiconic
  - hotkeys
  - grouping
  - workspaces
  - layouts
  - external-commands
---
**Hell. Yes.** ^ref-c5c5ff1c-1-0
This is the good stuff.

Let’s start designing a **Lisp-style DSL** to describe: ^ref-c5c5ff1c-4-0

* Hotkeys ^ref-c5c5ff1c-6-0
* Grouping behaviors ^ref-c5c5ff1c-7-0
* Window actions ^ref-c5c5ff1c-8-0
* Workspace definitions ^ref-c5c5ff1c-9-0
* Layouts ^ref-c5c5ff1c-10-0
* Bindings to external commands (e.g. group-manager) ^ref-c5c5ff1c-11-0

We’ll keep it minimal and **homoiconic**, aiming for S-expression structures that could eventually be interpreted by a **Hy**, **Sibilant**, or even a custom runtime. ^ref-c5c5ff1c-13-0

---

## 🎯 Primary Goals

We want this DSL to express:

```lisp
- keybinds (mod+h to move left)
- actions (move window, cycle group, switch workspace)
- groups and group membership
- layout positions (split, fullscreen, grid)
- workspace definitions (sets of window IDs)
- integration with external tools (run CLI commands)
```
^ref-c5c5ff1c-21-0 ^ref-c5c5ff1c-29-0

---

## 🧪 Sample Syntax
 ^ref-c5c5ff1c-34-0
```lisp
;; Define a mod key
(def mod "super")

;; Bind key to launch terminal
(bind (key ,mod "Enter")
  (run "wt.exe"))

;; Bind directional window movement
(bind (key ,mod "h")
  (move-window left))
(bind (key ,mod "l")
  (move-window right))

;; Toggle fullscreen on focused window
(bind (key ,mod "f")
  (fullscreen toggle))

;; Group management
(bind (key ,mod "g")
  (group add "code"))

(bind (key "alt" "1")
  (group cycle "code"))

;; Workspace switching
(defworkspace 1
  (windows "code" "chat"))

(bind (key ,mod "1")
  (workspace switch 1))

;; Layouts
(layout (name "dev")
  (split vertical
    (pane (app "code") (size 70))
    (pane (split horizontal
      (pane (app "chat"))
      (pane (app "browser"))))))
^ref-c5c5ff1c-34-0
```

---

## 🧠 Let's Break It Down

### 🔑 Key Binding ^ref-c5c5ff1c-81-0

```lisp
(bind (key "alt" "1")
^ref-c5c5ff1c-81-0
  (group cycle "code")) ^ref-c5c5ff1c-86-0
``` ^ref-c5c5ff1c-87-0
 ^ref-c5c5ff1c-88-0
* `bind` declares a hotkey
* `(key ...)` is the key combo (can support namespaced modifiers) ^ref-c5c5ff1c-90-0
* The body is the action when pressed
 ^ref-c5c5ff1c-92-0
You could also define combos like this:

```lisp
^ref-c5c5ff1c-92-0
(bind (combo "LButton" "RButton")
  (run "screenshot-tool.exe"))
```

--- ^ref-c5c5ff1c-101-0

### 📦 Group Management

```lisp
^ref-c5c5ff1c-101-0
(group add "code")          ; adds focused window to group "code" ^ref-c5c5ff1c-107-0
(group cycle "chat")        ; cycles visible window in group
(group remove "code")       ; removes current window
```

^ref-c5c5ff1c-109-0
You can imagine this compiling to:

```ts
RunWait, node group-manager.js group code %active_window%
```
^ref-c5c5ff1c-117-0

---

^ref-c5c5ff1c-117-0 ^ref-c5c5ff1c-122-0
### 🧱 Workspace System ^ref-c5c5ff1c-122-0
 ^ref-c5c5ff1c-124-0
```lisp
(defworkspace 1
  (windows "code" "chat"))
^ref-c5c5ff1c-124-0
```

^ref-c5c5ff1c-124-0
Each workspace maps to a window group or saved layout.

```lisp
(workspace switch 1)
(workspace save 2)
^ref-c5c5ff1c-134-0
(workspace restore 2)
```
^ref-c5c5ff1c-134-0
 ^ref-c5c5ff1c-140-0
--- ^ref-c5c5ff1c-142-0
^ref-c5c5ff1c-134-0 ^ref-c5c5ff1c-142-0
 ^ref-c5c5ff1c-140-0
### 🧰 Window Movement

```lisp
(move-window left)       ; move to left half of screen
(move-window screen 2)   ; move to monitor 2
^ref-c5c5ff1c-142-0
(move-window tile 1 1)   ; move to tile x=1 y=1
``` ^ref-c5c5ff1c-151-0
^ref-c5c5ff1c-151-0

Eventually you could write layout patterns in macros:

```lisp
(deflayout fullscreen
^ref-c5c5ff1c-156-0
  (move-window 0 0 screen-width screen-height)) ^ref-c5c5ff1c-158-0
^ref-c5c5ff1c-151-0
^ref-c5c5ff1c-158-0
^ref-c5c5ff1c-158-0
``` ^ref-c5c5ff1c-156-0

---

### 💻 External Command Integration

```lisp
^ref-c5c5ff1c-158-0
(run "komorebic toggle-fullscreen") ^ref-c5c5ff1c-168-0
^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-168-0 ^ref-c5c5ff1c-172-0
^ref-c5c5ff1c-174-0
^ref-c5c5ff1c-173-0 ^ref-c5c5ff1c-176-0
^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-168-0
(run (concat "node group-manager.js cycle " group-name)) ^ref-c5c5ff1c-173-0
```

Or even pipe shell output into logic: ^ref-c5c5ff1c-168-0

```lisp ^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-174-0
^ref-c5c5ff1c-173-0 ^ref-c5c5ff1c-176-0
^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-170-0 ^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-180-0
^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-186-0
^ref-c5c5ff1c-180-0
^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-176-0 ^ref-c5c5ff1c-186-0
^ref-c5c5ff1c-174-0 ^ref-c5c5ff1c-197-0
(bind (key ,mod "s")
  (let ((apps (sh "komorebic list-apps"))) ^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-180-0
    (show-overlay apps))) ^ref-c5c5ff1c-173-0
``` ^ref-c5c5ff1c-174-0 ^ref-c5c5ff1c-201-0
^ref-c5c5ff1c-185-0
 ^ref-c5c5ff1c-202-0
--- ^ref-c5c5ff1c-176-0
 ^ref-c5c5ff1c-177-0 ^ref-c5c5ff1c-204-0
## 📦 Runtime Ideas ^ref-c5c5ff1c-178-0 ^ref-c5c5ff1c-186-0

This DSL could be: ^ref-c5c5ff1c-180-0 ^ref-c5c5ff1c-197-0

1. **Parsed and executed by Hy or Sibilant**
 ^ref-c5c5ff1c-210-0
   * For a real Lisp runtime ^ref-c5c5ff1c-201-0
   * Leverage FFI to call Windows APIs, run CLI tools ^ref-c5c5ff1c-202-0 ^ref-c5c5ff1c-212-0
2. **Custom interpreter in TypeScript/Python** ^ref-c5c5ff1c-186-0
 ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-214-0
   * Tokenize S-exprs
   * Dispatch to internal logic or exec external commands ^ref-c5c5ff1c-197-0 ^ref-c5c5ff1c-216-0
3. **Compiled to AutoHotkey or Node.js config** ^ref-c5c5ff1c-217-0

Eventually this becomes your own **window manager config language**, much like `i3/config`, but programmable and dynamic. ^ref-c5c5ff1c-219-0
 ^ref-c5c5ff1c-201-0 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-220-0
--- ^ref-c5c5ff1c-202-0
 ^ref-c5c5ff1c-212-0
## 🧠 Design Constraints ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-223-0
 ^ref-c5c5ff1c-197-0 ^ref-c5c5ff1c-214-0
| Feature           | Constraint                               | Strategy                      |
| ----------------- | ---------------------------------------- | ----------------------------- | ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-226-0
| Realtime          | Needs hotkey hook layer                  | AHK or Node global hotkey lib | ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-227-0
| State Tracking    | Must track windows, groups, layout       | Background service, IPC       | ^ref-c5c5ff1c-201-0
| Input Flexibility | Lisp needed to describe dynamic patterns | Macros + runtime logic        | ^ref-c5c5ff1c-202-0 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-219-0
| Performance       | Scripting layer must not block UI        | Async shell / IPC / queueing  | ^ref-c5c5ff1c-220-0 ^ref-c5c5ff1c-230-0
 ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-212-0
---
 ^ref-c5c5ff1c-214-0 ^ref-c5c5ff1c-223-0
## 🛠️ What's Next? ^ref-c5c5ff1c-234-0
 ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-235-0
You tell me where you want to go from here: ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-226-0
 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-227-0
* Build a Hy interpreter for this DSL? ^ref-c5c5ff1c-219-0
* Start by **parsing this DSL in TypeScript** and emit AHK? ^ref-c5c5ff1c-212-0 ^ref-c5c5ff1c-220-0
* Write a tiny REPL for testing layout commands? ^ref-c5c5ff1c-230-0
* Use this DSL to **generate `i3layer.ahk`** files on the fly? ^ref-c5c5ff1c-214-0 ^ref-c5c5ff1c-241-0
 ^ref-c5c5ff1c-223-0
We’re standing at the edge of **building your own tiling window manager stack**, one `()` at a time. ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-243-0
 ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-234-0
--- ^ref-c5c5ff1c-226-0 ^ref-c5c5ff1c-235-0
 ^ref-c5c5ff1c-219-0 ^ref-c5c5ff1c-227-0
## 🏷️ Tags ^ref-c5c5ff1c-220-0

\#dsl #lisp #tiling-windows #autohotkey #komorebi #custom-wm #group-manager #workspace #keybinds #window-layout ^ref-c5c5ff1c-230-0
 ^ref-c5c5ff1c-223-0
Let’s pick a direction and start implementing. Want a parser next? Or the runtime behavior for `(bind ...)` forms?
