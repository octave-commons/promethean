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
<<<<<<< HEAD
- [ducks-attractor-states|Duck's Attractor States]
- [promethean-dev-workflow-update|Promethean Dev Workflow Update]
- [the-jar-of-echoes|The Jar of Echoes]
- [creative-moments|Creative Moments]
- [promethean-chat-activity-report|Promethean Chat Activity Report]
- [promethean-documentation-update.txt|Promethean Documentation Update]
- [promethean-notes|Promethean Notes]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [eidolon-field-abstract-model|Eidolon Field Abstract Model]
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [docs/unique/field-interaction-equations|field-interaction-equations]
- [graph-ds]
- [migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]
- [homeostasis-decay-formulas]
- plan-update-confirmation$plan-update-confirmation.md
- [model-selection-for-lightweight-conversational-tasks|Model Selection for Lightweight Conversational Tasks]
- [docs/unique/promethean-state-format|Promethean State Format]
- [docs/unique/typed-struct-compiler|typed-struct-compiler]
- [ducks-self-referential-perceptual-loop|Duck's Self-Referential Perceptual Loop]
- [docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]
- [eidolon-node-lifecycle]
- [typescript-patch-for-tool-calling-support|TypeScript Patch for Tool Calling Support]
- [functional-refactor-of-typescript-document-processing|Functional Refactor of TypeScript Document Processing]
- [performance-optimized-polyglot-bridge]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
## Sources
- [creative-moments#^ref-10d98225-8-0|Creative Moments — L8] (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0 (line 38, col 0, score 1)
- [Docops Feature Updates — L56]docops-feature-updates-3.md#^ref-cdbd21ee-56-0 (line 56, col 0, score 1)
- [per-domain-policy-system-for-js-crawler#^ref-c03020e1-495-0|Per-Domain Policy System for JS Crawler — L495] (line 495, col 0, score 1)
- [performance-optimized-polyglot-bridge#^ref-f5579967-459-0|Performance-Optimized-Polyglot-Bridge — L459] (line 459, col 0, score 1)
- [pipeline-enhancements#^ref-e2135d9f-27-0|Pipeline Enhancements — L27] (line 27, col 0, score 1)
- plan-update-confirmation — L1002$plan-update-confirmation.md#^ref-b22d79c6-1002-0 (line 1002, col 0, score 1)
- [polyglot-repl-interface-layer#^ref-9c79206d-171-0|polyglot-repl-interface-layer — L171] (line 171, col 0, score 1)
- [post-linguistic-transhuman-design-frameworks#^ref-6bcff92c-112-0|Post-Linguistic Transhuman Design Frameworks — L112] (line 112, col 0, score 1)
- [promethean-chat-activity-report#^ref-18344cf9-24-0|Promethean Chat Activity Report — L24] (line 24, col 0, score 1)
- Protocol_0_The_Contradiction_Engine — L143$protocol-0-the-contradiction-engine.md#^ref-9a93a756-143-0 (line 143, col 0, score 1)
- [provider-agnostic-chat-panel-implementation#^ref-43bfe9dd-241-0|Provider-Agnostic Chat Panel Implementation — L241] (line 241, col 0, score 1)
- [typescript-patch-for-tool-calling-support#^ref-7b7ca860-588-0|TypeScript Patch for Tool Calling Support — L588] (line 588, col 0, score 1)
- [schema-evolution-workflow#^ref-d8059b6a-589-0|schema-evolution-workflow — L589] (line 589, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L283]layer1survivabilityenvelope.md#^ref-64a9f9f9-283-0 (line 283, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L301]particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-301-0 (line 301, col 0, score 1)
- plan-update-confirmation — L1078$plan-update-confirmation.md#^ref-b22d79c6-1078-0 (line 1078, col 0, score 1)
- [promethean-copilot-intent-engine#^ref-ae24a280-91-0|Promethean-Copilot-Intent-Engine — L91] (line 91, col 0, score 1)
- [promethean-dev-workflow-update#^ref-03a5578f-82-0|Promethean Dev Workflow Update — L82] (line 82, col 0, score 1)
- [promethean-documentation-pipeline-overview#^ref-3a3bf2c9-284-0|Promethean Documentation Pipeline Overview — L284] (line 284, col 0, score 1)
- [promethean-eidolon-synchronicity-model#^ref-2d6e5553-164-0|Promethean_Eidolon_Synchronicity_Model — L164] (line 164, col 0, score 1)
- [promethean-infrastructure-setup#^ref-6deed6ac-739-0|Promethean Infrastructure Setup — L739] (line 739, col 0, score 1)
- [promethean-pipelines#^ref-8b8e6103-206-0|Promethean Pipelines — L206] (line 206, col 0, score 1)
- [creative-moments#^ref-10d98225-9-0|Creative Moments — L9] (line 9, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L117]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-117-0 (line 117, col 0, score 1)
- [Docops Feature Updates — L58]docops-feature-updates-3.md#^ref-cdbd21ee-58-0 (line 58, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-82-0|Docops Feature Updates — L82] (line 82, col 0, score 1)
- [DuckDuckGoSearchPipeline — L67]duckduckgosearchpipeline.md#^ref-e979c50f-67-0 (line 67, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-66-0|Duck's Attractor States — L66] (line 66, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-113-0|Duck's Self-Referential Perceptual Loop — L113] (line 113, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-469-0|Dynamic Context Model for Web Components — L469] (line 469, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-270-0|Eidolon Field Abstract Model — L270] (line 270, col 0, score 1)
- [creative-moments#^ref-10d98225-13-0|Creative Moments — L13] (line 13, col 0, score 1)
- [Docops Feature Updates — L99]docops-feature-updates-3.md#^ref-cdbd21ee-99-0 (line 99, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-118-0|Docops Feature Updates — L118] (line 118, col 0, score 1)
- [DuckDuckGoSearchPipeline — L108]duckduckgosearchpipeline.md#^ref-e979c50f-108-0 (line 108, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-68-0|Duck's Attractor States — L68] (line 68, col 0, score 1)
- [creative-moments#^ref-10d98225-38-0|Creative Moments — L38] (line 38, col 0, score 1)
- [Docops Feature Updates — L51]docops-feature-updates-3.md#^ref-cdbd21ee-51-0 (line 51, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-79-0|Docops Feature Updates — L79] (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77]duckduckgosearchpipeline.md#^ref-e979c50f-77-0 (line 77, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-115-0|Duck's Attractor States — L115] (line 115, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-61-0|Duck's Self-Referential Perceptual Loop — L61] (line 61, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-212-0|Eidolon Field Abstract Model — L212] (line 212, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-150-0|eidolon-field-math-foundations — L150] (line 150, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-148-0|eidolon-field-math-foundations — L148] (line 148, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-36-0|eidolon-node-lifecycle — L36] (line 36, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-166-0|Factorio AI with External Agents — L166] (line 166, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-148-0|field-dynamics-math-blocks — L148] (line 148, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-153-0|field-interaction-equations — L153] (line 153, col 0, score 1)
- [field-node-diagram-outline#^ref-1f32c94a-118-0|field-node-diagram-outline — L118] (line 118, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-168-0|field-node-diagram-set — L168] (line 168, col 0, score 1)
- field-node-diagram-visualizations — L103$field-node-diagram-visualizations.md#^ref-e9b27b06-103-0 (line 103, col 0, score 1)
- [functional-embedding-pipeline-refactor#^ref-a4a25141-380-0|Functional Embedding Pipeline Refactor — L380] (line 380, col 0, score 1)
- [functional-refactor-of-typescript-document-processing#^ref-1cfae310-194-0|Functional Refactor of TypeScript Document Processing — L194] (line 194, col 0, score 1)
- [creative-moments#^ref-10d98225-94-0|Creative Moments — L94] (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0 (line 63, col 0, score 1)
- [Docops Feature Updates — L66]docops-feature-updates-3.md#^ref-cdbd21ee-66-0 (line 66, col 0, score 1)
- [DuckDuckGoSearchPipeline — L93]duckduckgosearchpipeline.md#^ref-e979c50f-93-0 (line 93, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-73-0|Duck's Self-Referential Perceptual Loop — L73] (line 73, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-403-0|Dynamic Context Model for Web Components — L403] (line 403, col 0, score 1)
- [Docops Feature Updates — L85]docops-feature-updates-3.md#^ref-cdbd21ee-85-0 (line 85, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-93-0|Duck's Attractor States — L93] (line 93, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-64-0|Duck's Self-Referential Perceptual Loop — L64] (line 64, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-153-0|Factorio AI with External Agents — L153] (line 153, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-141-0|field-dynamics-math-blocks — L141] (line 141, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-35-0|Docops Feature Updates — L35] (line 35, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-94-0|Duck's Attractor States — L94] (line 94, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-53-0|Duck's Self-Referential Perceptual Loop — L53] (line 53, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-424-0|Dynamic Context Model for Web Components — L424] (line 424, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-209-0|Eidolon Field Abstract Model — L209] (line 209, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-142-0|eidolon-field-math-foundations — L142] (line 142, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-39-0|eidolon-node-lifecycle — L39] (line 39, col 0, score 1)
- [Docops Feature Updates — L44]docops-feature-updates-3.md#^ref-cdbd21ee-44-0 (line 44, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-61-0|Docops Feature Updates — L61] (line 61, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-99-0|Duck's Attractor States — L99] (line 99, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-80-0|Duck's Self-Referential Perceptual Loop — L80] (line 80, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-405-0|Dynamic Context Model for Web Components — L405] (line 405, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-216-0|Eidolon Field Abstract Model — L216] (line 216, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-189-0|Factorio AI with External Agents — L189] (line 189, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-172-0|field-interaction-equations — L172] (line 172, col 0, score 1)
- [creative-moments#^ref-10d98225-28-0|Creative Moments — L28] (line 28, col 0, score 1)
- [Docops Feature Updates — L65]docops-feature-updates-3.md#^ref-cdbd21ee-65-0 (line 65, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-86-0|Docops Feature Updates — L86] (line 86, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-123-0|Duck's Attractor States — L123] (line 123, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-34-0|Duck's Self-Referential Perceptual Loop — L34] (line 34, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-442-0|Dynamic Context Model for Web Components — L442] (line 442, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-218-0|Eidolon Field Abstract Model — L218] (line 218, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-176-0|eidolon-field-math-foundations — L176] (line 176, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-70-0|eidolon-node-lifecycle — L70] (line 70, col 0, score 1)
- [creative-moments#^ref-10d98225-52-0|Creative Moments — L52] (line 52, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L71]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-71-0 (line 71, col 0, score 1)
- [DuckDuckGoSearchPipeline — L99]duckduckgosearchpipeline.md#^ref-e979c50f-99-0 (line 99, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-412-0|Dynamic Context Model for Web Components — L412] (line 412, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-261-0|Eidolon Field Abstract Model — L261] (line 261, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-181-0|eidolon-field-math-foundations — L181] (line 181, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-90-0|eidolon-node-lifecycle — L90] (line 90, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-157-0|Factorio AI with External Agents — L157] (line 157, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-205-0|field-dynamics-math-blocks — L205] (line 205, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-203-0|field-node-diagram-set — L203] (line 203, col 0, score 1)
```
=======
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
>>>>>>> stealth/obsidian
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
