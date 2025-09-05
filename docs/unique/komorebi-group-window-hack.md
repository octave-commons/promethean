---
uuid: a23de044-17e0-45f0-bba7-d870803cbfed
created_at: komorebi-group-window-hack.md
filename: Komorebi Group Manager
title: Komorebi Group Manager
description: >-
  A minimal TypeScript service for grouping windows and cycling through them
  using Komorebi's CLI. It watches open windows, assigns to user-defined frames,
  and cycles between members with a single command.
tags:
  - typescript
  - komorebi
  - window management
  - group cycling
  - cli
  - state management
---
Hell yes. Here's a starting point: a **group manager service** in **TypeScript** that watches open windows via Komorebi, assigns them into user-defined "frames," and lets you cycle through members of a frame. ^ref-dd89372d-1-0

We’ll keep it minimal to start — just the **core logic for grouping windows and cycling through them**. Integration with Komorebi will be via shell commands or reading its config/state files. Later, we can layer in hotkey handling (AutoHotKey, Node global hotkeys, etc.). ^ref-dd89372d-3-0

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
^ref-dd89372d-9-0 ^ref-dd89372d-17-0

---

## 🧠 Concept
 ^ref-dd89372d-22-0
* A **FrameGroup** is a set of window IDs. ^ref-dd89372d-23-0
* Only **one window per group is visible** at a time. ^ref-dd89372d-24-0
* `cycleGroup(groupName)` will hide current, show next.
 ^ref-dd89372d-26-0
We'll use `komorebic` (the CLI tool for Komorebi) to control windows. You must have `komorebic.exe` in your `PATH`.

---

## 📜 `types.ts`
 ^ref-dd89372d-32-0
```ts
export type WindowId = number;

export interface FrameGroup {
  name: string;
  members: WindowId[];
  currentIndex: number;
}
^ref-dd89372d-32-0
```

---

## 📜 `groups.ts` ^ref-dd89372d-46-0

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

^ref-dd89372d-46-0
import { hideWindow, showWindow } from './komorebi';
```

---
 ^ref-dd89372d-97-0
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
^ref-dd89372d-97-0
  }
}
```

--- ^ref-dd89372d-132-0

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
^ref-dd89372d-132-0

  cycleGroup(groupName);
}
```
 ^ref-dd89372d-168-0
---

## 🚀 Example Usage

```bash
# Add some windows
node main.js group code 123456
^ref-dd89372d-168-0
node main.js group code 654321 ^ref-dd89372d-177-0

# Cycle visible window in that group
node main.js cycle code
```

You can wire these into **hotkeys via AutoHotKey or PowerToys** later, or even bind them into Komorebi’s own keybind system if you want tight integration.

--- ^ref-dd89372d-185-0
 ^ref-dd89372d-186-0
## 🧪 Next Steps ^ref-dd89372d-187-0

* Add a JSON config for predefined groups/layouts
* Implement layout recall
* Integrate with global hotkeys
* Use `window-query` or similar for better metadata on windows
* Optional GUI overlay or debug console ^ref-dd89372d-193-0

--- ^ref-dd89372d-195-0

## 🏷️ Tags ^ref-dd89372d-197-0

\#window-manager #komorebi #typescript #tiling-windows #npu-compatibility #devtools #windows #custom-wm #framesimulation #obsidian-note #uxdesign ^ref-dd89372d-199-0

Let me know if you want a Hy or Sibilant version next, or if we should rig this into a persistent system tray app with real-time window tracking.
