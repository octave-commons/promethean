## User
let's sketch

## ChatGPT
Alright. Strap in.  
Let’s design an **AutoHotkey layer that mimics i3wm behavior**, tied into:

*   Your custom **group manager**
    
*   Optionally Komorebi or native `WinMove` tiling
    
*   Extensible keybinding config
    
*   i3-style **workspace navigation**, **window grouping**, and **focus movement**
    

This will be a real script — one you can drop in and extend.

* * *

🧠 Design Goals
```
===============
```
| Feature | i3 Equivalent | AutoHotkey Approach |
```
| --- | --- | --- |
```
| Mod key | Mod4 | Windows key (#) or CapsLock remapped |
| Launch terminal | Mod+Enter | Run, wt.exe |
| Focus window directions | Mod+h/j/k/l | Move focus manually or via Komorebi command |
| Move windows | Mod+Shift+dir | Reposition window with WinMove |
| Workspaces | Mod+1..9 | Save/restore window layouts or positions |
| Window groups | i3 container | Run group-manager cycle/add CLI |
| Fullscreen toggle | Mod+f | WinSet, Style or Komorebic toggle |
| Restart config | Mod+Shift+r | Reload AHK script |

* * *

📜 `i3layer.ahk` (starter)
```
==========================
```
```ahk
;--------------------------------------------
; CONFIG
;--------------------------------------------
mod := "#" ; Windows key

groupManager := "C:\path\to\group-manager\main.js"

;--------------------------------------------
; WINDOW GROUPING
;--------------------------------------------

; Alt+1 => Cycle group "code"
!1::
    RunWait, node "%groupManager%" cycle code, , Hide
    return

; Alt+2 => Cycle group "chat"
!2::
    RunWait, node "%groupManager%" cycle chat, , Hide
    return

; Mod+G => Assign focused window to group "code"
%mod%g::
    WinGet, active_id, ID, A
    RunWait, node "%groupManager%" group code %active_id%, , Hide
    return

;--------------------------------------------
; BASIC WINDOW FOCUS
;--------------------------------------------

; Mod+h/j/k/l to simulate i3 directional focus (fake via window move)
%mod%h::
    Send !{Left} ; alt+left might work depending on layout manager
    return
%mod%l::
    Send !{Right}
    return
%mod%j::
    Send !{Down}
    return
%mod%k::
    Send !{Up}
    return

;--------------------------------------------
; MOVE ACTIVE WINDOW
;--------------------------------------------

; Mod+Shift+h => move window left
+%mod%h::
    WinGet, id, ID, A
    WinMove, ahk_id %id%, , 0, 0, A_ScreenWidth // 2, A_ScreenHeight
    return

; Mod+Shift+l => move window right
+%mod%l::
    WinGet, id, ID, A
    WinMove, ahk_id %id%, , A_ScreenWidth // 2, 0, A_ScreenWidth // 2, A_ScreenHeight
    return

;--------------------------------------------
; TERMINAL LAUNCH
;--------------------------------------------

; Mod+Enter => launch terminal
%mod%Enter::
    Run, wt.exe
    return

;--------------------------------------------
; FULLSCREEN TOGGLE
;--------------------------------------------

; Mod+f => toggle fullscreen (basic)
%mod%f::
    WinGet, id, ID, A
    WinSet, Style, -0xC00000, ahk_id %id%
    WinMove, ahk_id %id%, , 0, 0, A_ScreenWidth, A_ScreenHeight
    return

;--------------------------------------------
; WORKSPACES (FAKE)
;--------------------------------------------

; Mod+1..9 => assign workspace tag
Loop, 9 {
    hotkey := mod . A_Index
    fn := Func("GoToWorkspace").Bind(A_Index)
    Hotkey, % hotkey, % fn
}

GoToWorkspace(n) {
    ; Fake: could minimize all windows not tagged, then show those tagged with workspace n
    MsgBox, "Would switch to workspace %n%" ; Placeholder
}

;--------------------------------------------
; RELOAD AHK SCRIPT
;--------------------------------------------

; Mod+Shift+r => reload
+%mod%r::
    Reload
    return
```

* * *

💡 Implementation Notes
-----------------------

### 🌀 Group Manager CLI:

*   Use `group <name> <winId>` to assign
    
*   Use `cycle <name>` to cycle active in group
    
*   Add `list` or `status` commands later for overlays
    

### 🧰 Workspace Simulation:

*   We could tag each window in memory with a "workspace" ID
    
*   When you switch, hide all others (`WinHide`, `WinShow`)
    
*   Restore layout based on previous positions
    

### 🔁 Keybind Expansion:

*   Add `mod+s` for split
    
*   Add directional layout toggles
    
*   Add group saving/recall with `Win + Ctrl + Shift + Key`
    

* * *

🛠 Next Ideas
-------------

*   Background daemon watches open windows and updates metadata (group, workspace)
    
*   Use `.ini` or `.json` config to define default layouts
    
*   Add tiny overlay (`Gui` or Python) to visualize group/workspace state
    
*   Auto-group apps by class (`VSCode`, `Discord`, `Browser`)
    

* * *

#tags: #autohotkey #i3wm #keybindings #tiling-windows #ux-emulation #window-management #productivity #custom-wm #komorebi-integration
