## User
yea  give us some code.

## ChatGPT
Hell yes. Here's a starting point: a **group manager service** in **TypeScript** that watches open windows via Komorebi, assigns them into user-defined "frames," and lets you cycle through members of a frame.

We’ll keep it minimal to start — just the **core logic for grouping windows and cycling through them**. Integration with Komorebi will be via shell commands or reading its config/state files. Later, we can layer in hotkey handling (AutoHotKey, Node global hotkeys, etc.).

* * *

📂 File Layout (starter)
------------------------

```pgsql
group-manager/
├── main.ts                  # Entry point
├── groups.ts                # Logic for grouping windows
├── komorebi.ts              # Komorebi CLI wrappers
├── types.ts                 # Shared types
└── state.json               # Current layout state
```

* * *

🧠 Concept
----------

*   A **FrameGroup** is a set of window IDs.
    
*   Only **one window per group is visible** at a time.
    
*   `cycleGroup(groupName)` will hide current, show next.
    

We'll use `komorebic` (the CLI tool for [Komorebi](https://github.com/LGUG2Z/komorebi)) to control windows. You must have `komorebic.exe` in your `PATH`.

* * *

📜 `types.ts`
-------------

```ts
export type WindowId = number;

export interface FrameGroup {
  name: string;
  members: WindowId[];
  currentIndex: number;
}
```

* * *

📜 `groups.ts`
--------------

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

* * *

📜 `komorebi.ts`
----------------

```ts
import { execSync } from 'child_process';

export function hideWindow(id: number) {
  try {
    execSync(`komorebic hide {id}`);
  } catch (e) {
    console.error(`Failed to hide window {id}`, e);
  }
}

export function showWindow(id: number) {
  try {
    execSync(`komorebic show {id}`);
  } catch (e) {
    console.error(`Failed to show window {id}`, e);
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

* * *

📜 `main.ts`
------------

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
  console.log(`Window {winId} added to group {groupName}`);
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

* * *

🚀 Example Usage
----------------

```bash
# Add some windows
node main.js group code 123456
node main.js group code 654321

# Cycle visible window in that group
node main.js cycle code
```

You can wire these into **hotkeys via AutoHotKey or PowerToys** later, or even bind them into Komorebi’s own keybind system if you want tight integration.

* * *

🧪 Next Steps
-------------

*   Add a JSON config for predefined groups/layouts
    
*   Implement layout recall
    
*   Integrate with global hotkeys
    
*   Use `window-query`(https://github.com/m4b/window_query) or similar for better metadata on windows
    
*   Optional GUI overlay or debug console
    

* * *

#tags: #window-manager #komorebi #typescript #tiling-windows #npu-compatibility #devtools #windows #custom-wm #framesimulation #obsidian-note #uxdesign
