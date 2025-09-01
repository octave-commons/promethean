---
uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
created_at: 2025.07.28.11.07.38-komorebic-group-window-hack.md
filename: komorebi-group-window-hack
description: TypeScript service for grouping and cycling windows using Komorebi's CLI
tags:
  - typescript
  - komorebi
  - window-management
  - grouping
  - cycling
related_to_title:
  - windows-tiling-with-autohotkey
  - Window Management
  - lisp-dsl-for-window-management
  - Lisp-Compiler-Integration
  - sibilant-meta-string-templating-runtime
  - template-based-compilation
  - ts-to-lisp-transpiler
  - DSL
  - Unique Info Dump Index
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 216
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 216
    col: 3
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 225
    col: 1
    score: 0.93
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 225
    col: 3
    score: 0.93
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 12
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 12
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 102
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 102
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
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 11
    col: 1
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 11
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Hell yes. Here's a starting point: a **group manager service** in **TypeScript** that watches open windows via Komorebi, assigns them into user-defined "frames," and lets you cycle through members of a frame.

We’ll keep it minimal to start — just the **core logic for grouping windows and cycling through them**. Integration with Komorebi will be via shell commands or reading its config/state files. Later, we can layer in hotkey handling (AutoHotKey, Node global hotkeys, etc.).

---

## 📂 File Layout (starter)

```
group-manager/
├── main.ts                  # Entry point
├── groups.ts                # Logic for grouping windows
├── komorebi.ts              # Komorebi CLI wrappers
├── types.ts                 # Shared types
└── state.json               # Current layout state
```

---

## 🧠 Concept

* A **FrameGroup** is a set of window IDs.
* Only **one window per group is visible** at a time.
* `cycleGroup(groupName)` will hide current, show next.

We'll use `komorebic` (the CLI tool for [Komorebi](https://github.com/LGUG2Z/komorebi)) to control windows. You must have `komorebic.exe` in your `PATH`.

---

## 📜 `types.ts`

```ts
export type WindowId = number;

export interface FrameGroup {
  name: string;
  members: WindowId[];
  currentIndex: number;
}
```

---

## 📜 `groups.ts`

```ts
import { FrameGroup, WindowId } from './types';
import * as fs from 'fs';

const stateFile = './state.json';

let groups: Record<string, FrameGroup> = {};

function loadState() {
  if (fs.existsSync(stateFile)) {
    groups = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  }
}

function saveState() {
  fs.writeFileSync(stateFile, JSON.stringify(groups, null, 2));
}

export function addWindowToGroup(groupName: string, winId: WindowId) {
  loadState();
  if (!groups[groupName]) {
    groups[groupName] = { name: groupName, members: [], currentIndex: 0 };
  }
  if (!groups[groupName].members.includes(winId)) {
    groups[groupName].members.push(winId);
  }
  saveState();
}

export function cycleGroup(groupName: string) {
  loadState();
  const group = groups[groupName];
  if (!group || group.members.length === 0) return;

  const currentWin = group.members[group.currentIndex];
  hideWindow(currentWin);

  group.currentIndex = (group.currentIndex + 1) % group.members.length;
  const nextWin = group.members[group.currentIndex];
  showWindow(nextWin);

  saveState();
}

import { hideWindow, showWindow } from './komorebi';
```

---

## 📜 `komorebi.ts`

```ts
import { execSync } from 'child_process';

export function hideWindow(id: number) {
  try {
    execSync(`komorebic hide ${id}`);
  } catch (e) {
    console.error(`Failed to hide window ${id}`, e);
  }
}

export function showWindow(id: number) {
  try {
    execSync(`komorebic show ${id}`);
  } catch (e) {
    console.error(`Failed to show window ${id}`, e);
  }
}

export function listWindows(): number[] {
  try {
    const output = execSync(`komorebic query -w`).toString();
    const windows = JSON.parse(output);
    return windows.map((w: any) => w.handle);
  } catch (e) {
    console.error('Failed to list windows', e);
    return [];
  }
}
```

---

## 📜 `main.ts`

```ts
import { listWindows } from './komorebi';
import { addWindowToGroup, cycleGroup } from './groups';

const args = process.argv.slice(2);

const command = args[0];

if (command === 'group') {
  const groupName = args[1];
  const winId = parseInt(args[2]);

  if (!groupName || isNaN(winId)) {
    console.log('Usage: group <groupName> <windowId>');
    process.exit(1);
  }

  addWindowToGroup(groupName, winId);
  console.log(`Window ${winId} added to group ${groupName}`);
}

if (command === 'cycle') {
  const groupName = args[1];
  if (!groupName) {
    console.log('Usage: cycle <groupName>');
    process.exit(1);
  }

  cycleGroup(groupName);
}
```

---

## 🚀 Example Usage

```bash
# Add some windows
node main.js group code 123456
node main.js group code 654321

# Cycle visible window in that group
node main.js cycle code
```

You can wire these into **hotkeys via AutoHotKey or PowerToys** later, or even bind them into Komorebi’s own keybind system if you want tight integration.

---

## 🧪 Next Steps

* Add a JSON config for predefined groups/layouts
* Implement layout recall
* Integrate with global hotkeys
* Use [`window-query`](https://github.com/m4b/window_query) or similar for better metadata on windows
* Optional GUI overlay or debug console

---

## 🏷️ Tags

\#window-manager #komorebi #typescript #tiling-windows #npu-compatibility #devtools #windows #custom-wm #framesimulation #obsidian-note #uxdesign

Let me know if you want a Hy or Sibilant version next, or if we should rig this into a persistent system tray app with real-time window tracking.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Window Management](chunks/window-management.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [DSL](chunks/dsl.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)

## Sources
- [lisp-dsl-for-window-management — L216](lisp-dsl-for-window-management.md#L216) (line 216, col 1, score 1)
- [lisp-dsl-for-window-management — L216](lisp-dsl-for-window-management.md#L216) (line 216, col 3, score 1)
- [lisp-dsl-for-window-management — L225](lisp-dsl-for-window-management.md#L225) (line 225, col 1, score 0.93)
- [lisp-dsl-for-window-management — L225](lisp-dsl-for-window-management.md#L225) (line 225, col 3, score 0.93)
- [DSL — L12](chunks/dsl.md#L12) (line 12, col 1, score 1)
- [DSL — L12](chunks/dsl.md#L12) (line 12, col 3, score 1)
- [Unique Info Dump Index — L102](unique-info-dump-index.md#L102) (line 102, col 1, score 1)
- [Unique Info Dump Index — L102](unique-info-dump-index.md#L102) (line 102, col 3, score 1)
- [Lisp-Compiler-Integration — L546](lisp-compiler-integration.md#L546) (line 546, col 1, score 1)
- [Lisp-Compiler-Integration — L546](lisp-compiler-integration.md#L546) (line 546, col 3, score 1)
- [sibilant-meta-string-templating-runtime — L126](sibilant-meta-string-templating-runtime.md#L126) (line 126, col 1, score 1)
- [sibilant-meta-string-templating-runtime — L126](sibilant-meta-string-templating-runtime.md#L126) (line 126, col 3, score 1)
- [template-based-compilation — L110](template-based-compilation.md#L110) (line 110, col 1, score 1)
- [template-based-compilation — L110](template-based-compilation.md#L110) (line 110, col 3, score 1)
- [ts-to-lisp-transpiler — L11](ts-to-lisp-transpiler.md#L11) (line 11, col 1, score 1)
- [ts-to-lisp-transpiler — L11](ts-to-lisp-transpiler.md#L11) (line 11, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
