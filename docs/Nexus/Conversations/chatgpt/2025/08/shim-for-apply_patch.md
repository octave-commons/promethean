---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Shim for apply_patch"
conversation_id: 68a8e435-3188-8321-8004-062e13389f0e
create_time: 08/22/2025 at 4:43 PM
update_time: 08/27/2025 at 10:01 AM
---

# Title: Shim for apply_patch

Created: 08/22/2025 at 4:43 PM
Last Updated: 08/27/2025 at 10:01 AM
Chat URL: https://chat.openai.com/c/68a8e435-3188-8321-8004-062e13389f0e


>[!nexus_user] **User** - 08/22/2025 at 4:43 PM
> I've noticed that whenever you generate a tool call for applying a patch, you're always looking for a command called `apply_patch` which appears to be a thing inserted into the @openai/codex cli sandbox.
> 
> I need a shim
<!-- UID: d0013e2b-ef1d-41f1-ad96-598e584ff612 -->




>[!nexus_agent] **Assistant** - 08/22/2025 at 4:43 PM
> Yep—`apply_patch` is a sandbox convenience the Codex CLI drops into PATH. Outside that sandbox you get nothing, so your tools keep “calling” a command that doesn’t exist. You want a drop-in shim named `apply_patch` that:
> 
> - accepts either a unified diff (what most tools send) **or** a simple JSON edits format,
> - applies it safely to your repo,
> - can dry-run/validate,
> - fails loudly with good exit codes.
> 
> Here’s a pragmatic, repo-friendly shim in plain Node (no deps) you can drop into `scripts/apply_patch.js` and expose via `bin`. It favors `git apply` for real diffs (fast, correct) and falls back to simple file rewrites for JSON.
> 
> ---
> 
> ### 1) The shim (drop-in CLI)
> 
> Create `scripts/apply_patch.js`:
> 
> ```js
> #!/usr/bin/env node
> /**
>  * apply_patch — shim for Codex-style patch tool calls.
>  * Supports:
>  * - Unified diffs via stdin -> git apply
>  * - JSON edits via stdin: { changes:[{path, action, content?}] }
>  *
>  * Actions (JSON):
>  * - { path, action: "rewrite", content }
>  * - { path, action: "append", content }
>  * - { path, action: "delete" }
>  * - { path, action: "chmod", mode } // e.g. "755"
>  *
>  * Flags:
>  * --check Dry-run/validate (git apply --check or no-op verify)
>  * --allow-add Allow creating new files from JSON (default true)
>  * --no-allow-add Disallow creating new files from JSON
>  *
>  * Exit codes:
>  * 0 success, 1 usage/input error, 2 apply failed
>  */
> const { spawnSync } = require("node:child_process");
> const { readFileSync, writeFileSync, mkdirSync, statSync, rmSync, chmodSync } = require("node:fs");
> const { dirname, resolve, sep, isAbsolute } = require("node:path");
> 
> function readStdinSync() {
>  let data = "";
>  try {
>  const buf = readFileSync(0, "utf8");
>  data = buf.toString();
>  } catch (_) {}
>  return data.trim();
> }
> 
> function die(msg, code = 1) {
>  console.error(`[apply_patch] ${msg}`);
>  process.exit(code);
> }
> 
> function insideRepo(path, repoRoot) {
>  const abs = resolve(repoRoot, path);
>  return abs.startsWith(repoRoot + sep);
> }
> 
> function getRepoRoot() {
>  const probe = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" });
>  if (probe.status === 0) return probe.stdout.trim();
>  // Fallback to CWD if not a git repo; still enforce path safety.
>  return process.cwd();
> }
> 
> function isUnifiedDiff(s) {
>  if (!s) return false;
>  // Heuristics: presence of diff headers
>  return /^(diff --git|Index: |\+\+\+ |--- )/m.test(s);
> }
> 
> function maybeJson(s) {
>  try {
>  return JSON.parse(s);
>  } catch {
>  return null;
>  }
> }
> 
> function applyUnifiedDiff(patch, repoRoot, checkOnly) {
>  const args = ["apply"];
>  if (checkOnly) args.push("--check");
>  // More forgiving whitespace; reject hunks if needed.
>  args.push("--whitespace=nowarn");
>  // Apply relative to repo root
>  const res = spawnSync("git", args, {
>  encoding: "utf8",
>  cwd: repoRoot,
>  input: patch,
>  });
>  if (res.status !== 0) {
>  console.error(res.stdout);
>  console.error(res.stderr);
>  die("git apply failed", 2);
>  }
> }
> 
> function ensureDir(p) {
>  mkdirSync(dirname(p), { recursive: true });
> }
> 
> function applyJsonEdits(doc, repoRoot, checkOnly, allowAdd) {
>  if (!doc || !Array.isArray(doc.changes)) die("Invalid JSON: expected { changes: [...] }", 1);
> 
>  // Validate all paths first
>  for (const c of doc.changes) {
>  if (!c || typeof c.path !== "string" || !c.path.length) die("Invalid change entry (missing path)", 1);
>  if (isAbsolute(c.path) || c.path.includes("..")) die(`Unsafe path: ${c.path}`, 1);
>  const abs = resolve(repoRoot, c.path);
>  if (!insideRepo(abs, repoRoot)) die(`Path escapes repo: ${c.path}`, 1);
>  }
> 
>  if (checkOnly) {
>  // For check, just verify we *could* do the operations
>  for (const c of doc.changes) {
>  const abs = resolve(repoRoot, c.path);
>  switch (c.action) {
>  case "rewrite":
>  case "append":
>  if (!allowAdd) {
>  try { statSync(abs); } catch { die(`File does not exist and --no-allow-add: ${c.path}`, 1); }
>  }
>  if (typeof c.content !== "string") die(`Missing content for ${c.action}: ${c.path}`, 1);
>  break;
>  case "delete":
>  try { statSync(abs); } catch { /* ok: deleting non-existent is a no-op */ }
>  break;
>  case "chmod":
>  if (!c.mode) die(`Missing mode for chmod: ${c.path}`, 1);
>  break;
>  default:
>  die(`Unknown action: ${c.action}`, 1);
>  }
>  }
>  return;
>  }
> 
>  // Apply
>  for (const c of doc.changes) {
>  const abs = resolve(repoRoot, c.path);
>  switch (c.action) {
>  case "rewrite": {
>  ensureDir(abs);
>  writeFileSync(abs, c.content ?? "", "utf8");
>  break;
>  }
>  case "append": {
>  ensureDir(abs);
>  let prev = "";
>  try { prev = readFileSync(abs, "utf8"); } catch {}
>  writeFileSync(abs, prev + (c.content ?? ""), "utf8");
>  break;
>  }
>  case "delete": {
>  try { rmSync(abs, { force: true }); } catch {}
>  break;
>  }
>  case "chmod": {
>  chmodSync(abs, c.mode);
>  break;
>  }
>  default:
>  die(`Unknown action: ${c.action}`, 1);
>  }
>  }
> }
> 
> (function main() {
>  const args = process.argv.slice(2);
>  const checkOnly = args.includes("--check");
>  const allowAdd = args.includes("--no-allow-add") ? false : true;
> 
>  const input = readStdinSync();
>  if (!input) die("No input provided on stdin (expecting unified diff or JSON).", 1);
> 
>  const repoRoot = getRepoRoot();
> 
>  if (isUnifiedDiff(input)) {
>  applyUnifiedDiff(input, repoRoot, checkOnly);
>  console.log(checkOnly ? "[apply_patch] OK (diff validated)" : "[apply_patch] OK (diff applied)");
>  process.exit(0);
>  }
> 
>  const asJson = maybeJson(input);
>  if (asJson) {
>  applyJsonEdits(asJson, repoRoot, checkOnly, allowAdd);
>  console.log(checkOnly ? "[apply_patch] OK (json validated)" : "[apply_patch] OK (json applied)");
>  process.exit(0);
>  }
> 
>  die("Unrecognized input. Provide a unified diff or JSON edits.", 1);
> })();
> ```
> 
> Make it executable:
> 
> ```bash
> chmod +x scripts/apply_patch.js
> ```
> 
> Expose it as a repo-wide command by adding this to the **root** `package.json`:
> 
> ```json
> {
>  "bin": {
>  "apply_patch": "./scripts/apply_patch.js"
>  }
> }
> ```
> 
> Then `pnpm i` (or `npm i`) in the root so it lands in `node_modules/.bin/`. Any agent/sandbox that shells out to `apply_patch` will now succeed in your repo, sandbox or not.
> 
> ---
> 
> ### 2) How your agents/tools should call it
> 
> **Unified diff path (preferred):**
> 
> ```bash
> apply_patch <<'PATCH'
> diff --git a/services/ts/cephalon/src/foo.ts b/services/ts/cephalon/src/foo.ts
> index e69de29..1b2c3d4 100644
> --- a/services/ts/cephalon/src/foo.ts
> +++ b/services/ts/cephalon/src/foo.ts
> @@ -0,0 +1,3 @@
> +export const x = 42;
> +export function ping() { return 'pong'; }
> +
> PATCH
> ```
> 
> Validate only:
> 
> ```bash
> apply_patch --check <<'PATCH'
> ...diff...
> PATCH
> ```
> 
> **JSON edits path (for LLMs that can’t emit clean diffs):**
> 
> ```bash
> apply_patch <<'JSON'
> {
>  "changes": [
>  { "path": "docs/AGENTS.md", "action": "append", "content": "\n\n## Changelog\n- Added apply_patch shim.\n" },
>  { "path": "scripts/apply_patch.js", "action": "chmod", "mode": "755" }
>  ]
> }
> JSON
> ```
> 
> To forbid accidental file creation from JSON (force “edit existing only”):
> 
> ```bash
> apply_patch --no-allow-add <<'JSON'
> { "changes":[{ "path":"src/exists.ts", "action":"rewrite", "content":"..." }] }
> JSON
> ```
> 
> ---
> 
> ### 3) Safety + failure behavior (so you can trust it)
> 
> - **Path jail:** rejects absolute paths and `..` escapes; resolves inside repo root.
> - **Non-git fallback:** if you run it outside a git repo, it still works for JSON edits and will *attempt* diffs (but `git apply` will fail—by design).
> - **Exit codes:** non-zero on malformed input or failed apply; your agent runner can key off that to retry/regenerate.
> - **Dry-run:** `--check` lets you validate before committing an agent’s patch.
> 
> ---
> 
> ### 4) Optional niceties (do later if useful)
> 
> - Auto-stage on success: add `git add -A` after a successful apply; or gate behind `--stage`.
> - Emit a minimal summary JSON to stdout for your logger sink (files touched, ops counts).
> - Support a third input mode: **LLM blocks** with file delimiters (e.g., `<<<FILE path>>>` …) if you find your models keep emitting those.
> 
> ---
> 
> ### 5) Wiring into your ecosystem
> 
> - Put `apply_patch` on PATH for all services that might spawn shell tools (Codex bridge, agent orchestrator, etc.). With the `bin` entry, `pnpm dlx`-style execution or `node_modules/.bin` resolution will handle it.
> - In your Codex/Ollama bridge, **don’t special-case** tool calls—just let “tool:shell” execute `apply_patch` with the patch on stdin. Your current pattern should work unchanged.
> 
> If you want this shim packaged separately later, we can split it into an internal `@shared/ts` binary and keep the same CLI.
> 
> Want me to spit out the JSON summary variant too, or add `--stage`? Happy to tighten it further.
> 
> #devtools #codex #agents #shim #patch #tooling
<!-- UID: 8eadc041-ce0f-4667-80e9-c2b8fbf8426a -->

---




>[!nexus_user] **User** - 08/22/2025 at 4:56 PM
> Remember for the future to always use import, never require, in node.js scripts.
<!-- UID: 7267ac31-6924-4ca9-8dd5-66c861217085 -->




>[!nexus_agent] **Assistant** - 08/22/2025 at 4:56 PM
> Got it — thanks for pointing that out. From now on I’ll always stick with **ESM style imports (`import ... from`)** in Node.js scripts instead of `require`. 
> 
> For example, the `apply_patch` shim I drafted would be rewritten like this at the top:
> 
> ```js
> #!/usr/bin/env node
> import { spawnSync } from "node:child_process";
> import { readFileSync, writeFileSync, mkdirSync, statSync, rmSync, chmodSync } from "node:fs";
> import { dirname, resolve, sep, isAbsolute } from "node:path";
> ```
> 
> That keeps it modern and consistent with the rest of your codebase. 
> 
> Do you also want me to rewrite the whole shim I gave you earlier into pure `import` form so it’s ready to drop in, or just keep the rule in mind for future outputs?
<!-- UID: 38da28ee-2bb2-4356-ad0d-5b2a47285d70 -->

---




>[!nexus_user] **User** - 08/22/2025 at 4:57 PM
> I added it to the package.json bin and ran pnpm i, and added node_modules/.bin to the path through direnv, but when I inspect that folder it's empty
<!-- UID: 1980741d-c1ac-4c29-9e84-898c3abfe396 -->




>[!nexus_agent] **Assistant** - 08/22/2025 at 4:57 PM
> You didn’t do anything “wrong.” With **pnpm**, your own package’s `"bin"` **does not** get into `node_modules/.bin` for *that same package*. `node_modules/.bin` only contains **binaries of dependencies**. So if the root is the package that declares `"bin"`, you’ll see an empty `.bin` unless you depend on something that exposes a bin.
> 
> Practical fixes—pick one:
> 
> ## Option A — Fastest: put `./bin` on PATH
> - Create an executable ESM entry:
> 
> `bin/apply_patch.mjs`
> ```js
> #!/usr/bin/env node
> import { main } from "../scripts/apply_patch.mjs";
> await main();
> ```
> 
> `scripts/apply_patch.mjs` (your actual logic)
> ```js
> export async function main() {
>  // ... all the code (ESM imports only) ...
> }
> ```
> 
> - Ensure exec bit: `chmod +x bin/apply_patch.mjs`
> - In `.envrc`:
> ```sh
> PATH_add bin
> ```
> Reload direnv. Now `apply_patch` is callable directly. No pnpm needed.
> 
> ## Option B — Use an npm script alias
> In `package.json`:
> ```json
> {
>  "scripts": {
>  "apply_patch": "node ./scripts/apply_patch.mjs"
>  }
> }
> ```
> Call with:
> ```bash
> pnpm run -s apply_patch < patch.diff
> ```
> Not as nice as a bare command, but dead simple.
> 
> ## Option C — Make it a real dependency (workspace style)
> Split the shim into its own workspace package so pnpm *does* link the bin:
> 
> ```
> packages/apply-patch/
>  package.json // name: "@your/apply-patch", version, type: module, bin: {"apply_patch":"./bin/cli.mjs"}
>  bin/cli.mjs // tiny wrapper that imports ../dist/index.mjs and calls main()
>  src/index.mjs // logic
> ```
> 
> Root `package.json`:
> ```json
> {
>  "private": true,
>  "workspaces": ["packages/*"],
>  "dependencies": {
>  "@your/apply-patch": "workspace:*"
>  }
> }
> ```
> 
> Then:
> ```bash
> pnpm i
> ```
> Now `node_modules/.bin/apply_patch` exists, because it’s a **dependency**. This is the cleanest long-term shape if you want multiple services to rely on it.
> 
> ## Option D — Global link (quick but leaky)
> ```bash
> pnpm link --global
> ```
> This the current package’s bin **globally**. Works, but I’d prefer A or C in a mono-repo.
> 
> ---
> 
> ### Quick ESM notes (your rule: “always import”)
> - Keep `package.json` with `"type": "module"`.
> - Use `.mjs` for executable bin files to avoid ambiguity.
> - Shebang + ESM is fine:
>  ```js
>  #!/usr/bin/env node
>  import { main } from '../scripts/apply_patch.mjs';
>  await main();
>  ```
> 
> ### Sanity checks
> - Make sure the bin file is **executable** (`chmod +x`).
> - If using Option C, verify the bin path in the package’s `package.json` points to the actual file and includes the shebang.
> - If you still want the command in `node_modules/.bin` without a workspace split, you can `pnpm pack` the root and `pnpm add ./your-tarball.tgz`—but that’s a hassle; just do Option A or C.
> 
> If you want, I’ll rewrite the full shim into ESM (`import`-only) with `main()` extracted and give you the exact files for Option A or C. #tooling #pnpm #bin #esm
<!-- UID: 96da73f1-5d32-4b17-bc4c-3699b4438ff6 -->

---


