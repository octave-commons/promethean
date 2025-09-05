---
uuid: 6546ebef-4b70-4ddb-ac70-e215ce409083
created_at: git-commit-optimization-for-code-reviews.md
filename: git-commit-optimization-for-code-reviews
title: git-commit-optimization-for-code-reviews
description: >-
  Optimizes Git workflows for code reviews by enforcing minimal output and
  commit contracts. The solution includes a no-diff policy, token caps, and a
  commit helper script that stages changes, enforces change budgets, and outputs
  only essential commit information.
tags:
  - git
  - code-review
  - commit-optimization
  - token-efficiency
  - no-diff
  - commit-helper
  - change-budget
  - scripting
related_to_uuid:
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - de34f84b-270b-4f16-92a8-a681a869b823
  - 18138627-a348-4fbb-b447-410dfb400564
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 5c307293-04cb-4478-ba2c-4cd85dbec260
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
related_to_title:
  - Promethean Dev Workflow Update
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - Promethean Chat Activity Report
  - Promethean Documentation Update
  - Creative Moments
  - Dynamic Context Model for Web Components
  - Promethean Infrastructure Setup
  - Functional Refactor of TypeScript Document Processing
  - Promethean Notes
  - Obsidian ChatGPT Plugin Integration
  - obsidian-ignore-node-modules-regex
  - Obsidian Templating Plugins Integration Guide
  - The Jar of Echoes
  - zero-copy-snapshots-and-workers
  - Promethean State Format
  - run-step-api
  - field-node-diagram-outline
  - Prompt_Folder_Bootstrap
  - Provider-Agnostic Chat Panel Implementation
  - field-interaction-equations
  - Self-Improving Documentation Tool
  - Factorio AI with External Agents
  - field-dynamics-math-blocks
references:
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 133
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 147
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 92
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 99
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 85
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 92
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 101
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 132
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 136
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 757
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 777
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 103
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 161
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 115
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 21
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 235
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 199
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 206
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 200
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 234
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 184
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 348
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 418
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 245
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 453
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 201
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 70
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 192
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 113
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 160
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 71
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 604
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 277
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 225
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 323
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 57
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 131
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 88
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 134
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 48
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 125
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 304
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 289
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 616
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 245
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 171
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 208
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 202
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 236
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 186
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 420
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 247
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 186
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 247
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 354
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 217
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 157
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 185
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 367
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 170
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 162
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 140
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 550
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 136
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 163
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
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 468
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 57
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 67
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 434
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 121
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 110
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 33
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 15
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 44
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 401
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 205
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 56
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 79
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 103
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 119
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 559
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 256
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 202
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 114
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1044
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 595
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 77
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 9
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 117
    col: 0
    score: 1
---
Fair. If you’ve got Git, you don’t need the bot vomiting diffs into the chat and burning tokens. Solve it at the **prompt + repo** level:

# 1) Add a “no-diff” contract to `AGENTS.md` (top)

> **No chat diffs.** Never print patches or large code blocks. Make edits directly in the repo and **only** output:
>
> * a one-line **summary**
> * the **list of files touched** (paths only)
> * the **commit hash**
>   If a review is needed, write details to `./.codex/LOG.md`. I’ll inspect via Git.
>   If you violate this, STOP and ask before continuing.

Also add a **token cap**:

> Keep chat output under **200 tokens** unless explicitly told otherwise.

# 2) Give the agent a commit helper (keeps output tiny)

Add a small commit tool that **caps change size** and prints just the essentials.

`scripts/codex-commit.ts`

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
  const br = `codex/${Date.now()}`;
  sh(`git rev-parse --git-dir`); // throws if not a git repo
  sh(`git checkout -b ${br}`);
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
    const msg = `Change budget exceeded (files=${files.length}/${limits.maxFiles}, added=${added}/${limits.maxAddedLines}).`;
    writeFileSync(logPath, `# Oversize change blocked\n\n${msg}\n\nFiles:\n${files.map(f => `- ${f}`).join("\n")}\n`);
    console.error(`[codex] ${msg} Details -> ${logPath}`);
    process.exit(2);
  }

  const branch = ensureBranch();
  const summary = shortStat();
  const commitMsg = process.env.CODEX_MSG ?? "codex: apply change";
  sh(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  const hash = sh(`git rev-parse --short HEAD`);

  // Write a tiny log for humans (no diffs)
  writeFileSync(
    logPath,
    `# Codex Change\n\n- Branch: ${branch}\n- Commit: ${hash}\n- Summary: ${summary}\n\n## Files\n${files.map(f => `- ${f}`).join("\n")}\n`
  );

  // Print minimal info to the chat
  console.log(`[codex] ${hash} ${summary}`);
  files.forEach(f => console.log(f));
};

main();
```

**Why this helps**

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
\#codex #tokens #nodiffs #git #workflow #zerowaste #typescript #pnpm
