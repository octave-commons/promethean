---
```
uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
```
```
created_at: 2025.07.28.11.07.04-autohotkey.md
```
filename: windows-tiling-with-autohotkey
```
description: >-
```
  Replicates i3wm's window management on Windows using AutoHotkey for
  hotkey-driven window cycling, grouping, and tiling.
tags:
  - autohotkey
  - windows
  - tiling
  - keybindings
  - i3wm
  - komorebi
  - window-groups
  - window-management
```
related_to_title:
```
  - lisp-dsl-for-window-management
  - ParticleSimulationWithCanvasAndFFmpeg
  - komorebi-group-window-hack
  - Window Management
  - template-based-compilation
  - Lisp-Compiler-Integration
  - sibilant-meta-string-templating-runtime
  - 2d-sandbox-field
  - EidolonField
  - field-node-diagram-outline
  - Reawakening Duck
```
related_to_uuid:
```
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 59b5670f-36d3-4d34-8985-f3144b15347a
references:
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 210
    col: 1
    score: 0.85
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 201
    col: 1
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 201
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 546
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 546
    col: 3
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 126
    col: 1
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 126
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 110
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 110
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 201
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 201
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 246
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 246
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 117
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 117
    col: 3
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 116
    col: 1
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 116
    col: 3
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 14
    col: 1
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 14
    col: 3
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 222
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 222
    col: 3
    score: 1
---
Hell yes — if you want to replicate the feel of i3wm’s hotkey-driven control over windows **on Windows**, then **AutoHotkey** is the closest you're going to get. Think of it as the *keyboard daemon of your dreams* — and pairing it with `komorebic` or even raw WinAPI gives you serious power.

---

## 🔥 What Can AutoHotkey Do for This Setup?

You can use AHK to:

* Trigger window cycling in your custom group manager
* Move/resize windows manually or via tiling logic
* Bind keys exactly like i3: `mod+Enter`, `mod+H`, `mod+J`, etc.
* Call your TypeScript CLI commands directly
* Even draw overlays, popups, or OSDs if you want

---

## 🧪 Goal: Cycle Group with a Hotkey

Let’s wire up a key like `Alt + 1` to cycle through the `"code"` group in our custom group manager.

---

## 📜 `group-manager.ahk`

```ahk
; Use Alt+1 to cycle through a window group called "code"
!1::
{
    RunWait, node "C:\path\to\group-manager\main.js" cycle code, , Hide
    return
}
```

🔧 Replace `C:\path\to\group-manager\main.js` with your actual path.

If you compile your group manager to a single `.exe` using `pkg` or `nexe`, this gets even cleaner:

```ahk
!1::
{
    RunWait, "C:\group-manager.exe" cycle code, , Hide
    return
}
```

---

## 🧱 Example: i3-style Navigation Keybinds

```ahk
; Mod key = Windows key
Mod := "#"

; Mod+Enter to open Terminal
%Mod%Enter::
Run, wt.exe ; Windows Terminal
return

; Mod+H to move window left
%Mod%h::
WinGet, active_id, ID, A
WinMove, ahk_id %active_id%, , 0, 0, A_ScreenWidth//2, A_ScreenHeight
return

; Mod+L to move window right
%Mod%l::
WinGet, active_id, ID, A
WinMove, ahk_id %active_id%, , A_ScreenWidth//2, 0, A_ScreenWidth//2, A_ScreenHeight
return
```

You can layer more logic to make this dynamically detect screen size, move windows between monitors, or even interface with Komorebi to use its layout engine.

---

## 🧬 Mixing AHK + Komorebi + Your Group Manager

Here’s the full loop:

```plaintext
[AHK Keybinds]
     ↓
[Runs custom group-manager CLI]
     ↓
[CLI calls Komorebi or manages layout]
     ↓
[Windows layout updates]
```

So the **real window tree** is flat (because Windows is dumb), but your logic layer group manager + AHK can *simulate* i3's behavior.

---

## 🧠 Pro Tip: AHK Global Hooks

* You can use `#IfWinActive` to scope hotkeys per app
* You can bind to mouse buttons or combos (`~LButton & RButton`)
* You can script layout logic **per monitor**, **per workspace**, etc.

---

## ⛓ Want to go deeper?

Let me know and we can:

* Add a hotkey for assigning windows to a group `mod+g`
* Use `WinGet` to pull window IDs on the fly
* Hook into Komorebi's `query` output
* Create “workspaces” like in i3 and jump windows around
* Add a `status bar` overlay like i3bar using AHK GUI or Python/Tauri/etc.

---

## 🏷️ Tags

#autohotkey #komorebi #tiling-windows #keybindings #i3wm #windows #uxautomation #window-groups #ahk-scripting #promethean-devtools

You want the real i3 vibes? AHK + Komorebi + your own logic daemon is the only way there on Windows.

Want me to sketch a full i3 keybind layer with workspaces, layout presets, and group cycling in AHK next?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
```
- lisp-dsl-for-window-management$lisp-dsl-for-window-management.md
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- komorebi-group-window-hack$komorebi-group-window-hack.md
- [Window Management]chunks/window-management.md
- [docs/unique/template-based-compilation|template-based-compilation]
- [lisp-compiler-integration]
- [sibilant-meta-string-templating-runtime]
- [2d-sandbox-field]
- [[eidolonfield]]
- [field-node-diagram-outline]
- [reawakening-duck|Reawakening Duck]

## Sources
- lisp-dsl-for-window-management — L210$lisp-dsl-for-window-management.md#L210 (line 210, col 1, score 0.85)
- komorebi-group-window-hack — L201$komorebi-group-window-hack.md#L201 (line 201, col 1, score 1)
- komorebi-group-window-hack — L201$komorebi-group-window-hack.md#L201 (line 201, col 3, score 1)
- [lisp-compiler-integration#L546|Lisp-Compiler-Integration — L546] (line 546, col 1, score 1)
- [lisp-compiler-integration#L546|Lisp-Compiler-Integration — L546] (line 546, col 3, score 1)
- [sibilant-meta-string-templating-runtime#L126|sibilant-meta-string-templating-runtime — L126] (line 126, col 1, score 1)
- [sibilant-meta-string-templating-runtime#L126|sibilant-meta-string-templating-runtime — L126] (line 126, col 3, score 1)
- [docs/unique/template-based-compilation#L110|template-based-compilation — L110] (line 110, col 1, score 1)
- [docs/unique/template-based-compilation#L110|template-based-compilation — L110] (line 110, col 3, score 1)
- [2d-sandbox-field#L201|2d-sandbox-field — L201] (line 201, col 1, score 1)
- [2d-sandbox-field#L201|2d-sandbox-field — L201] (line 201, col 3, score 1)
- [[eidolonfield#L246|EidolonField — L246]] (line 246, col 1, score 1)
- [[eidolonfield#L246|EidolonField — L246]] (line 246, col 3, score 1)
- [field-node-diagram-outline#L117|field-node-diagram-outline — L117] (line 117, col 1, score 1)
- [field-node-diagram-outline#L117|field-node-diagram-outline — L117] (line 117, col 3, score 1)
- [reawakening-duck#L116|Reawakening Duck — L116] (line 116, col 1, score 1)
- [reawakening-duck#L116|Reawakening Duck — L116] (line 116, col 3, score 1)
- [Window Management — L14]chunks/window-management.md#L14 (line 14, col 1, score 1)
- [Window Management — L14]chunks/window-management.md#L14 (line 14, col 3, score 1)
- lisp-dsl-for-window-management — L222$lisp-dsl-for-window-management.md#L222 (line 222, col 1, score 1)
- lisp-dsl-for-window-management — L222$lisp-dsl-for-window-management.md#L222 (line 222, col 3, score 1)
```
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
