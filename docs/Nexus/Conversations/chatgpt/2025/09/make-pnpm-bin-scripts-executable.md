---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Make pnpm bin scripts executable"
conversation_id: 68b629c9-4ba8-8333-8b6d-1d7fb3b7a95e
create_time: 09/01/2025 at 6:18 PM
update_time: 09/01/2025 at 6:23 PM
---

# Title: Make pnpm bin scripts executable

Created: 09/01/2025 at 6:18 PM
Last Updated: 09/01/2025 at 6:23 PM
Chat URL: https://chat.openai.com/c/68b629c9-4ba8-8333-8b6d-1d7fb3b7a95e


>[!nexus_user] **User** - 09/01/2025 at 6:18 PM
> making pnpm submodule bin scripts executable postinstall
<!-- UID: a794fc57-2686-4d08-a586-36f2e34300bf -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 6:18 PM
> Got it. Here’s the straight path to make **workspace/submodule bin scripts executable** with pnpm—without playing whack-a-mole every install.
> 
> # What actually works (order matters)
> 
> 1) **Declare the bin properly** 
> In each package that exposes a CLI:
> ```json
> {
>  "name": "@your/thing",
>  "version": "0.0.0",
>  "bin": {
>  "your-cli": "dist/cli.js"
>  }
> }
> ```
> pnpm will link this into `node_modules/.bin/your-cli`.
> 
> 2) **Make the file executable in git (best, durable fix)** 
> This survives clones, submodules, and publishes:
> ```bash
> git update-index --chmod=+x packages/your-thing/dist/cli.js
> git commit -m "chore: mark cli executable"
> ```
> If you see git “forgetting” the bit:
> ```bash
> git config core.filemode true
> ```
> Do that inside the submodule, too, if you’re using one.
> 
> 3) **Ensure a proper shebang at the top of the bin file**
> ```js
> #!/usr/bin/env node
> ```
> No shebang = shell can’t exec it cleanly on *nix.
> 
> 4) **Auto-fix on install as a safety net** 
> Even if the git bit goes missing (e.g., Windows dev box, weird checkouts), run a repo-level postinstall that sets `0755` on anything listed in `"bin"` across all workspace packages.
> 
> ### package.json (repo root)
> ```json
> {
>  "scripts": {
>  "postinstall": "node scripts/fix-bins.js"
>  }
> }
> ```
> 
> ### scripts/fix-bins.js
> ```js
> #!/usr/bin/env node
> /**
>  * Walk all workspace packages, read their package.json, find "bin" entries,
>  * and chmod +x each target. Cross-platform (no shx), minimal deps.
>  */
> const { promises: fs } = require('fs');
> const path = require('path');
> 
> async function readJSON(p) {
>  return JSON.parse(await fs.readFile(p, 'utf8'));
> }
> 
> async function exists(p) {
>  try { await fs.access(p); return true; } catch { return false; }
> }
> 
> async function chmodX(p) {
>  const stat = await fs.stat(p);
>  const mode = stat.mode | 0o755; // ensure exec bits
>  if (stat.mode !== mode) {
>  await fs.chmod(p, mode);
>  console.log(`chmod +x ${p}`);
>  }
> }
> 
> async function fixPackage(pkgDir) {
>  const pkgPath = path.join(pkgDir, 'package.json');
>  if (!(await exists(pkgPath))) return;
>  const pkg = await readJSON(pkgPath);
>  if (!pkg.bin) return;
> 
>  const bins = typeof pkg.bin === 'string'
>  ? [pkg.bin]
>  : Object.values(pkg.bin);
> 
>  for (const rel of bins) {
>  const abs = path.join(pkgDir, rel);
>  if (await exists(abs)) {
>  // ensure shebang exists (best effort, don’t mutate if missing)
>  // You can enforce shebang by uncommenting the block below.
>  // const content = await fs.readFile(abs, 'utf8');
>  // if (!content.startsWith('#!')) {
>  // console.warn(`WARN: ${abs} has no shebang (#!/usr/bin/env node).`);
>  // }
>  await chmodX(abs);
>  }
>  }
> }
> 
> async function main() {
>  // Infer workspace package paths from pnpm
>  // Works because pnpm writes a lockfile with importers, but we avoid parsing it.
>  // Simpler: walk ./packages/* (adjust if your layout differs).
>  const root = process.cwd();
>  const pkgsRoot = path.join(root, 'packages');
>  if (!(await exists(pkgsRoot))) return;
> 
>  const entries = await fs.readdir(pkgsRoot, { withFileTypes: true });
>  for (const ent of entries) {
>  if (ent.isDirectory()) {
>  await fixPackage(path.join(pkgsRoot, ent.name));
>  }
>  }
> }
> 
> main().catch(err => {
>  console.error(err);
>  process.exit(1);
> });
> ```
> 
> 5) **If your bin is built on install (TS → dist)** 
> Put the chmod in the **owning package** so it runs after build:
> 
> ```json
> {
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "prepare": "pnpm run build && node ./scripts/chmod-bin.js"
>  }
> }
> ```
> 
> `prepare` runs on `pnpm install` (from git) and before publish—exactly when you want to ensure the built `dist/cli.js` is executable.
> 
> ### scripts/chmod-bin.js (per package)
> ```js
> #!/usr/bin/env node
> const { promises: fs } = require('fs');
> const path = require('path');
> 
> (async () => {
>  const pkg = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
>  const bin = pkg.bin;
>  const rels = typeof bin === 'string' ? [bin] : Object.values(bin || {});
>  for (const rel of rels) {
>  const target = path.join(__dirname, '..', rel);
>  try {
>  await fs.chmod(target, 0o755);
>  console.log(`chmod +x ${rel}`);
>  } catch (_) {}
>  }
> })();
> ```
> 
> # Why this combo
> - **Git exec bit** is the canonical source of truth. If you publish to npm, the tarball preserves mode; consumers get `0755`.
> - **Shebang** ensures OS knows how to run it.
> - **Root postinstall** covers cross-platform oddities and submodule edge cases.
> - **Package-level prepare** ensures built artifacts (often ignored by git) are fixed before .
> 
> # Quick checklist
> - [ ] `bin` field points to the right file(s) 
> - [ ] Shebang at top of each bin file 
> - [ ] `git update-index --chmod=+x <file>` committed 
> - [ ] Root `postinstall` script wired 
> - [ ] If building bins, package `prepare` runs `chmod` after build
> 
> #hashtags #pnpm #workspaces #submodules #cli #nodejs #devops #buildsystem
<!-- UID: 72e4dca5-0f9a-4e52-9e3a-403491dcf9a8 -->

---


