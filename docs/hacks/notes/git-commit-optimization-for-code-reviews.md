---
```
uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
```
```
created_at: 2025.09.01.21.07.19.md
```
filename: Git Commit Optimization for Code Reviews
```
description: >-
```
  This guide outlines a method to optimize Git commits for code reviews by
  preventing large diffs and token waste. It includes adding a 'no-diff'
  contract to AGENTS.md, implementing a commit helper script that enforces
  change limits, and integrating a simple UX workflow with token caps.
tags:
  - git
  - code review
  - commit optimization
  - token efficiency
  - prompt engineering
  - agentic workflows
  - devops
```
related_to_uuid:
```
  - de34f84b-270b-4f16-92a8-a681a869b823
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
  - 5c307293-04cb-4478-ba2c-4cd85dbec260
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 18138627-a348-4fbb-b447-410dfb400564
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 59b5670f-36d3-4d34-8985-f3144b15347a
```
related_to_title:
```
  - Promethean Documentation Update
  - run-step-api
  - balanced-bst
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Board Walk – 2025-08-11
  - AI-First-OS-Model-Context-Protocol
  - Board Automation Improvements
  - Self-Improving Documentation Tool
  - Promethean Dev Workflow Update
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - Functional Refactor of TypeScript Document Processing
  - Promethean Chat Activity Report
  - Promethean Notes
  - Creative Moments
  - The Jar of Echoes
  - Canonical Org-Babel Matplotlib Animation Template
  - aionian-circuit-math
  - Promethean Infrastructure Setup
  - Reawakening Duck
references:
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 151
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 299
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 12
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 0
    score: 1
  - uuid: de34f84b-270b-4f16-92a8-a681a869b823
    line: 39
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 252
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 253
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 109
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 110
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 204
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 205
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 274
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 275
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 255
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 256
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 585
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1283
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 610
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1487
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 591
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1030
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 26
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1198
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 596
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1294
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 621
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1498
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 571
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 602
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1031
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 27
    col: 0
    score: 1
  - uuid: de34f84b-270b-4f16-92a8-a681a869b823
    line: 41
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1032
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 28
    col: 0
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 16
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 294
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 317
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 29
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 158
    col: 0
    score: 1
  - uuid: de34f84b-270b-4f16-92a8-a681a869b823
    line: 42
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1033
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 29
    col: 0
    score: 1
  - uuid: de34f84b-270b-4f16-92a8-a681a869b823
    line: 43
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1034
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 30
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 168
    col: 0
    score: 0.98
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 299
    col: 0
    score: 0.98
  - uuid: de34f84b-270b-4f16-92a8-a681a869b823
    line: 44
    col: 0
    score: 0.98
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1035
    col: 0
    score: 0.98
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 31
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 7
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 9
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 11
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 13
    col: 0
    score: 1
---
Fair. If you’ve got Git, you don’t need the bot vomiting diffs into the chat and burning tokens. Solve it at the **prompt + repo** level:

# 1) Add a “no-diff” contract to `AGENTS.md` (top)

> **No chat diffs.** Never print patches or large code blocks. Make edits directly in the repo and **only** output:
>
```
> * a one-line **summary**
```
> * the **list of files touched** (paths only)
```
> * the **commit hash**
```
>   If a review is needed, write details to `./.codex/LOG.md`. I’ll inspect via Git.
>   If you violate this, STOP and ask before continuing.
```
Also add a **token cap**:
```
> Keep chat output under **200 tokens** unless explicitly told otherwise.

# 2) Give the agent a commit helper (keeps output tiny)

Add a small commit tool that **caps change size** and prints just the essentials.
```
`scripts/codex-commit.ts`
```
```ts
#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Limits = { maxFiles: number; maxAddedLines: number };
const limits: Limits = {
  maxFiles: Number(process.env.CODEX_MAX_FILES ?? 50),
  maxAddedLines: Number(process.env.CODEX_MAX_ADDED ?? 2000),
};

const sh = (cmd: string) => execSync(cmd, { stdio: "pipe" }).toString().trim();
const safe = <T>(f: () => T, d: T) => { try { return f(); } catch { return d; } };

const codexDir = ".codex";
const logPath = join(codexDir, "LOG.md");
if (!existsSync(codexDir)) mkdirSync(codexDir, { recursive: true });

const ensureBranch = () => {
  const br = `codex/{Date.now()}`;
  sh(`git rev-parse --git-dir`); // throws if not a git repo
  sh(`git checkout -b {br}`);
  return br;
};

const shortStat = () => sh(`git diff --cached --shortstat`);
const changedFiles = () => sh(`git diff --cached --name-only`).split("\n").filter(Boolean);
const addedLines = () => {
  // count only additions in staged diff
  const numstat = sh(`git diff --cached --numstat`);
  return numstat
    .split("\n")
    .filter(Boolean)
    .map(l => l.split("\t")[0])
    .filter(a => a !== "-" && a !== "")
    .map(a => Number(a))
    .reduce((a, b) => a + b, 0);
};

const main = () => {
  // Stage everything the agent changed
  safe(() => sh(`git add -A`), "");

  const files = changedFiles();
  if (files.length === 0) {
    console.log(`[codex] No changes staged. Nothing to commit.`);
    process.exit(0);
  }

  // Enforce change budget
  const added = addedLines();
  if (files.length > limits.maxFiles || added > limits.maxAddedLines) {
    const msg = `Change budget exceeded (files={files.length}/{limits.maxFiles}, added={added}/{limits.maxAddedLines}).`;
    writeFileSync(logPath, `# Oversize change blocked\n\n{msg}\n\nFiles:\n{files.map(f => `- {f}`).join("\n")}\n`);
    console.error(`[codex] {msg} Details -> {logPath}`);
    process.exit(2);
  }

  const branch = ensureBranch();
  const summary = shortStat();
  const commitMsg = process.env.CODEX_MSG ?? "codex: apply change";
  sh(`git commit -m "{commitMsg.replace(/"/g, '\\"')}"`);
  const hash = sh(`git rev-parse --short HEAD`);

  // Write a tiny log for humans (no diffs)
  writeFileSync(
    logPath,
    `# Codex Change\n\n- Branch: {branch}\n- Commit: {hash}\n- Summary: {summary}\n\n## Files\n{files.map(f => `- {f}`).join("\n")}\n`
  );

  // Print minimal info to the chat
  console.log(`[codex] {hash} {summary}`);
  files.forEach(f => console.log(f));
};

main();
```
```
**Why this helps**
```
* The agent **commits directly** (your preference), but prints only hash + file list.
* If it tries to change too much, it **fails fast** without dumping a novel.
* You can revert with plain Git if it went goofy.

# 3) Wire it into scripts (simple UX)

```json
{
  "scripts": {
    "codex:apply": "CODEX_MAX_FILES=50 CODEX_MAX_ADDED=2000 tsx scripts/codex-commit.ts",
    "codex:revert": "git reset --hard HEAD^"
  }
}
```

In your prompt, tell the agent:

> “Make the changes, then run `pnpm codex:apply`. Don’t print diffs. If blocked for size, split into smaller commits and try again.”

# 4) Adjust the prompt to stop token spew

Add this **once** to `AGENTS.md`:

```
Output policy:
- Never print file contents, patches, or large code blocks.
- After changes, only run: `pnpm codex:apply` and print its single-line output.
- If a reviewer needs details, append them to ./.codex/LOG.md (not the chat).
```

# 5) Optional: tiny “show me” without diffs

If you do want a peek: have the agent run

```
git --no-pager show --name-only --stat --pretty=oneline HEAD
```

and paste **just that one line** plus file list (still tiny), never the patch.

---

### Bottom line

* **No more chat diffs** → no more token waste.
* The agent **writes to git** (your call), and you revert if needed.
* You keep **one session** and real control, minus the verbosity tax.

If you want, I’ll drop these snippets into your repo paths and trim the budget numbers to match your normal change size.

\#hashtags
\#codex #tokens #nodiffs #git #workflow #zerowaste #typescript #pnpm<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Documentation Update]promethean-documentation-update-3.md
- [run-step-api]
- [balanced-bst]
- [api-gateway-versioning]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
- [board-walk-2025-08-11|Board Walk – 2025-08-11]
- [ai-first-os-model-context-protocol]
- [board-automation-improvements|Board Automation Improvements]
- [self-improving-documentation-tool|Self-Improving Documentation Tool]
- [promethean-dev-workflow-update|Promethean Dev Workflow Update]
- [ducks-attractor-states|Duck's Attractor States]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [functional-refactor-of-typescript-document-processing|Functional Refactor of TypeScript Document Processing]
- [promethean-chat-activity-report|Promethean Chat Activity Report]
- [promethean-notes|Promethean Notes]
- [creative-moments|Creative Moments]
- [the-jar-of-echoes|The Jar of Echoes]
- Canonical Org-Babel Matplotlib Animation Template$canonical-org-babel-matplotlib-animation-template.md
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [promethean-documentation-update.txt|Promethean Documentation Update]
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [reawakening-duck|Reawakening Duck]
## Sources
- [ai-first-os-model-context-protocol#^ref-618198f4-11-0|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 0, score 1)
- [docs/unique/aionian-circuit-math#^ref-f2d83a77-151-0|aionian-circuit-math — L151] (line 151, col 0, score 1)
- [docs/unique/aionian-circuit-math#^ref-f2d83a77-152-0|aionian-circuit-math — L152] (line 152, col 0, score 1)
- [api-gateway-versioning#^ref-0580dcd3-286-0|api-gateway-versioning — L286] (line 286, col 0, score 1)
- [api-gateway-versioning#^ref-0580dcd3-288-0|api-gateway-versioning — L288] (line 288, col 0, score 1)
- [balanced-bst#^ref-d3e7db72-299-0|balanced-bst — L299] (line 299, col 0, score 1)
- [board-automation-improvements#^ref-ac60a1d6-12-0|Board Automation Improvements — L12] (line 12, col 0, score 1)
- [board-walk-2025-08-11#^ref-7aa1eb92-135-0|Board Walk – 2025-08-11 — L135] (line 135, col 0, score 1)
- [Promethean Documentation Update — L39]promethean-documentation-update-3.md#^ref-de34f84b-39-0 (line 39, col 0, score 1)
- Canonical Org-Babel Matplotlib Animation Template — L252$canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-252-0 (line 252, col 0, score 1)
- Canonical Org-Babel Matplotlib Animation Template — L253$canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-253-0 (line 253, col 0, score 1)
- [creative-moments#^ref-10d98225-109-0|Creative Moments — L109] (line 109, col 0, score 1)
- [creative-moments#^ref-10d98225-110-0|Creative Moments — L110] (line 110, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-204-0|Duck's Attractor States — L204] (line 204, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-205-0|Duck's Attractor States — L205] (line 205, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-274-0|eidolon-field-math-foundations — L274] (line 274, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-275-0|eidolon-field-math-foundations — L275] (line 275, col 0, score 1)
- [functional-refactor-of-typescript-document-processing#^ref-1cfae310-255-0|Functional Refactor of TypeScript Document Processing — L255] (line 255, col 0, score 1)
- [functional-refactor-of-typescript-document-processing#^ref-1cfae310-256-0|Functional Refactor of TypeScript Document Processing — L256] (line 256, col 0, score 1)
- [creative-moments#^ref-10d98225-585-0|Creative Moments — L585] (line 585, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-1283-0|Duck's Attractor States — L1283] (line 1283, col 0, score 1)
- [promethean-chat-activity-report#^ref-18344cf9-610-0|Promethean Chat Activity Report — L610] (line 610, col 0, score 1)
- [promethean-dev-workflow-update#^ref-03a5578f-1487-0|Promethean Dev Workflow Update — L1487] (line 1487, col 0, score 1)
- [promethean-notes#^ref-1c4046b5-591-0|Promethean Notes — L591] (line 591, col 0, score 1)
- [run-step-api#^ref-15d25922-1030-0|run-step-api — L1030] (line 1030, col 0, score 1)
- [self-improving-documentation-tool#^ref-5c307293-26-0|Self-Improving Documentation Tool — L26] (line 26, col 0, score 1)
- [the-jar-of-echoes#^ref-18138627-1198-0|The Jar of Echoes — L1198] (line 1198, col 0, score 1)
- [creative-moments#^ref-10d98225-596-0|Creative Moments — L596] (line 596, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-1294-0|Duck's Attractor States — L1294] (line 1294, col 0, score 1)
- [promethean-chat-activity-report#^ref-18344cf9-621-0|Promethean Chat Activity Report — L621] (line 621, col 0, score 1)
- [promethean-dev-workflow-update#^ref-03a5578f-1498-0|Promethean Dev Workflow Update — L1498] (line 1498, col 0, score 1)
- [promethean-documentation-update.txt#^ref-0b872af2-571-0|Promethean Documentation Update — L571] (line 571, col 0, score 1)
- [promethean-notes#^ref-1c4046b5-602-0|Promethean Notes — L602] (line 602, col 0, score 1)
- [run-step-api#^ref-15d25922-1031-0|run-step-api — L1031] (line 1031, col 0, score 1)
- [self-improving-documentation-tool#^ref-5c307293-27-0|Self-Improving Documentation Tool — L27] (line 27, col 0, score 1)
- [Promethean Documentation Update — L41]promethean-documentation-update-3.md#^ref-de34f84b-41-0 (line 41, col 0, score 1)
- [run-step-api#^ref-15d25922-1032-0|run-step-api — L1032] (line 1032, col 0, score 1)
- [self-improving-documentation-tool#^ref-5c307293-28-0|Self-Improving Documentation Tool — L28] (line 28, col 0, score 1)
- [ai-first-os-model-context-protocol#^ref-618198f4-16-0|AI-First-OS-Model-Context-Protocol — L16] (line 16, col 0, score 1)
- [api-gateway-versioning#^ref-0580dcd3-294-0|api-gateway-versioning — L294] (line 294, col 0, score 1)
- [balanced-bst#^ref-d3e7db72-317-0|balanced-bst — L317] (line 317, col 0, score 1)
- [board-automation-improvements#^ref-ac60a1d6-29-0|Board Automation Improvements — L29] (line 29, col 0, score 1)
- [board-walk-2025-08-11#^ref-7aa1eb92-158-0|Board Walk – 2025-08-11 — L158] (line 158, col 0, score 1)
- [Promethean Documentation Update — L42]promethean-documentation-update-3.md#^ref-de34f84b-42-0 (line 42, col 0, score 1)
- [run-step-api#^ref-15d25922-1033-0|run-step-api — L1033] (line 1033, col 0, score 1)
- [self-improving-documentation-tool#^ref-5c307293-29-0|Self-Improving Documentation Tool — L29] (line 29, col 0, score 1)
- [Promethean Documentation Update — L43]promethean-documentation-update-3.md#^ref-de34f84b-43-0 (line 43, col 0, score 1)
- [run-step-api#^ref-15d25922-1034-0|run-step-api — L1034] (line 1034, col 0, score 1)
- [self-improving-documentation-tool#^ref-5c307293-30-0|Self-Improving Documentation Tool — L30] (line 30, col 0, score 1)
- [docs/unique/aionian-circuit-math#^ref-f2d83a77-168-0|aionian-circuit-math — L168] (line 168, col 0, score 0.98)
- [api-gateway-versioning#^ref-0580dcd3-299-0|api-gateway-versioning — L299] (line 299, col 0, score 0.98)
- [Promethean Documentation Update — L44]promethean-documentation-update-3.md#^ref-de34f84b-44-0 (line 44, col 0, score 0.98)
- [run-step-api#^ref-15d25922-1035-0|run-step-api — L1035] (line 1035, col 0, score 0.98)
- [self-improving-documentation-tool#^ref-5c307293-31-0|Self-Improving Documentation Tool — L31] (line 31, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L1]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1-0 (line 1, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L7]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-7-0 (line 7, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L9]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-9-0 (line 9, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L11]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-11-0 (line 11, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L13]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-13-0 (line 13, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
