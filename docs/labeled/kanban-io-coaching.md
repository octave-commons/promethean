---
uuid: 95513ada-e67b-43f4-8ffa-26ec0e1cb367
created_at: '2025-10-06T15:01:14Z'
title: 2025.10.06.15.01.14
filename: kanban-io-coaching
description: >-
  Minimal IO utilities for Kanban task management with coaching feedback and
  session storage. Handles JSONL task reading, writing, and session state
  persistence using a cache directory.
tags:
  - kanban
  - io
  - coaching
  - jsonl
  - session
  - persistence
  - task
related_to_uuid: []
related_to_title: []
references: []
---

# Minimal IO + coaching utilities

```ts
// packages/kanban/src/lib/prioritize/io.ts
import fs from "node:fs/promises";
import path from "node:path";
import { Task, Choice } from "./types";

export async function readTasksJSONL(argv:any): Promise<Task[]> {
  // If stdin has data, read it; else use your existing loaders via argv.--kanban/--tasks
  // For now, stub: call your current search/index logic to produce a flat list of tasks.
  return []; // TODO: integrate with existing readers
}
export async function readTasksByUUIDs(argv:any): Promise<Task[]> { /* ... */ return []; }

export async function writeJSONL(rows:any[], opts:any={}){
  for (const r of rows) process.stdout.write(JSON.stringify(r)+"\n");
}

export function coach(line:string, argv:any){
  if (argv.quiet) return;
  process.stderr.write(line+"\n");
}

const CACHE = ".kanban-cache";
function sessionFile(session:string){ return path.join(CACHE, "pairwise", `${session}.jsonl`); }
export async function ensureSession(session:string){
  await fs.mkdir(path.dirname(sessionFile(session)), { recursive:true });
}
export async function readChoices(session:string): Promise<Choice[]> {
  try {
    const txt = await fs.readFile(sessionFile(session), "utf8");
    return txt.trim().split("\n").filter(Boolean).map(l=>JSON.parse(l));
  } catch { return []; }
}
export async function appendChoice(c: Omit<Choice,"ts">){
  const row = { ...c, ts: new Date().toISOString() };
  await ensureSession(c.session);
  await fs.appendFile(sessionFile(c.session), JSON.stringify(row)+"\n", "utf8");
  return row;
}
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
