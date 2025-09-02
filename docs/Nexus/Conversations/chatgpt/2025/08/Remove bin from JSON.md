---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Remove bin from JSON"
conversation_id: 68b50360-10ac-8333-a212-ab8dbe2a24b9
create_time: 08/31/2025 at 9:23 PM
update_time: 08/31/2025 at 9:28 PM
---

# Title: Remove bin from JSON

Created: 08/31/2025 at 9:23 PM
Last Updated: 08/31/2025 at 9:28 PM
Chat URL: https://chat.openai.com/c/68b50360-10ac-8333-a212-ab8dbe2a24b9


>[!nexus_user] **User** - 08/31/2025 at 9:23 PM
> I need to remove all instances of "bin":{"prom-lisp":"dist/cli/lisp.js"} from every package.json file in packages/*
<!-- UID: 87ceb54b-b6d0-4719-ac93-7d676ae00c01 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 9:23 PM
> Got it. Here are two safe, practical ways—pick your poison.
> 
> # Option A — TypeScript script (no brittle regex)
> 
> Create `scripts/remove-prom-lisp-bin.ts`:
> 
> ```ts
> // scripts/remove-prom-lisp-bin.ts
> import { promises as fs } from "node:fs";
> import { join } from "node:path";
> 
> const ROOT = "packages";
> const DRY = process.argv.includes("--dry-run");
> 
> async function fileExists(p: string) {
>  try { await fs.access(p); return true; } catch { return false; }
> }
> 
> async function run() {
>  const dirs = await fs.readdir(ROOT, { withFileTypes: true });
>  let touched = 0, skipped = 0, missing = 0;
> 
>  for (const d of dirs) {
>  if (!d.isDirectory()) continue;
>  const pkgPath = join(ROOT, d.name, "package.json");
>  if (!(await fileExists(pkgPath))) { missing++; continue; }
> 
>  const raw = await fs.readFile(pkgPath, "utf8");
>  let pkg: any;
>  try { pkg = JSON.parse(raw); } catch { skipped++; continue; }
> 
>  let changed = false;
> 
>  if (pkg && pkg.bin) {
>  // If bin is exactly {"prom-lisp": "dist/cli/lisp.js"} OR contains that entry
>  if (typeof pkg.bin === "object" && pkg.bin["prom-lisp"] === "dist/cli/lisp.js") {
>  delete pkg.bin["prom-lisp"];
>  if (Object.keys(pkg.bin).length === 0) delete pkg.bin;
>  changed = true;
>  }
>  }
> 
>  if (changed) {
>  touched++;
>  if (!DRY) {
>  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
>  }
>  console.log(`${DRY ? "[dry]" : "[edit]"} ${pkgPath}`);
>  }
>  }
> 
>  console.log(`Done. edited=${touched} skipped=${skipped} missing_pkg_json=${missing}`);
> }
> 
> run().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> Run:
> 
> ```bash
> # preview first
> pnpm tsx scripts/remove-prom-lisp-bin.ts --dry-run
> 
> # then do it
> pnpm tsx scripts/remove-prom-lisp-bin.ts
> ```
> 
> What it does:
> - Only touches `packages/*/package.json`
> - Removes `bin.prom-lisp` iff it equals `dist/cli/lisp.js`
> - Deletes `bin` entirely if it becomes empty
> - Leaves everything else alone
> 
> # Option B — Shell + jq (fast one-liner loop)
> 
> ```bash
> fd -a -g 'packages/*/package.json' \
> | while read -r f; do
>  tmp="$(mktemp)"
>  jq '
>  if (.bin | type == "object") then
>  # remove the specific entry
>  .bin |= (del(.["prom-lisp"] | select(. == "dist/cli/lisp.js")))
>  # drop .bin if now empty
>  | if (.bin != null and (.bin | length) == 0) then del(.bin) else . end
>  else
>  .
>  end
>  ' "$f" > "$tmp" && mv "$tmp" "$f"
>  echo "[edit] $f"
> done
> ```
> 
> Sanity check before/after:
> 
> ```bash
> rg -n '"bin"\s*:\s*\{\s*"prom-lisp"\s*:\s*"dist/cli/lisp.js"\s*\}' packages || true
> ```
> 
> If that prints nothing after running, you’re clean.
> 
> ---
> 
> Blunt take: don’t sed JSON. Use TS or jq so this never bites you again. If you expect variants like `./dist/cli/lisp.js`, tweak the equality check accordingly.
> 
> #tags #typescript #node #jq #repo-maintenance #monorepo
<!-- UID: aa84b6af-a251-419e-b300-9fb0b9d26a63 -->

---




>[!nexus_user] **User** - 08/31/2025 at 9:27 PM
> I can't get the bin.piper property in my ./packages/piper/package.json to work when I run pnpm install
<!-- UID: 8f181231-c022-4803-93d2-6396949d61f1 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 9:27 PM
> Alright, here’s what actually matters with `bin.piper` + pnpm in a workspace.
> 
> # What “working” means (pick one)
> 
> - **You want `piper` available at the workspace root** (`node_modules/.bin/piper`): the **root must depend** on `@promethean/piper` (workspace link). Otherwise pnpm won’t create the shim.
> - **You want `piper` available globally**: you need to `pnpm link --global` that package.
> - **You want to run it inside the package**: a package does **not** link its own `bin` to its own `.bin`. Use a script (`"piper": "node dist/cli/piper.js"`) or run with `pnpm exec` directly.
> 
> If your expectation doesn’t match the above, that’s the bug.
> 
> # Minimal, correct `package.json` for `packages/piper`
> 
> ```json
> {
>  "name": "@promethean/piper",
>  "version": "0.0.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "piper": "dist/cli/piper.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "prepare": "pnpm run build" 
>  }
> }
> ```
> 
> Key points:
> - `bin.piper` must be **relative to the package root** and point to a **built** file.
> - `prepare` runs on local installs/ so `dist` exists when pnpm wires the shim.
> 
> # The JS file itself
> 
> Top of `dist/cli/piper.js` must have a Node shebang and be executable:
> 
> ```js
> #!/usr/bin/env node
> // ... your CLI code ...
> ```
> 
> ```bash
> chmod +x packages/piper/dist/cli/piper.js
> ```
> 
> (Some tools strip shebangs. If you bundle with `tsup`, add `--banner.js "#!/usr/bin/env node"`.)
> 
> # Make it appear at the workspace root
> 
> 1) **Declare it as a dependency of the root** (so pnpm installs/ it):
> 
> ```bash
> jq '.devDependencies["@promethean/piper"]="workspace:*"' package.json \
> | sponge package.json
> ```
> 
> (Or edit by hand. The `"workspace:*"` is the important bit.)
> 
> 2) **Install at the root**:
> 
> ```bash
> pnpm -w install
> ```
> 
> 3) **Verify**:
> 
> ```bash
> ls -l node_modules/.bin/piper
> readlink -f node_modules/.bin/piper
> node_modules/.bin/piper --help
> ```
> 
> If you don’t see a shim, the root doesn’t depend on it (or `dist/cli/piper.js` didn’t exist when pnpm tried to wire it).
> 
> # Alternative: make it globally available
> 
> ```bash
> pnpm --filter @promethean/piper build
> pnpm --filter @promethean/piper link --global
> which piper
> piper --help
> ```
> 
> # Quick diagnostic checklist (do these, in order)
> 
> 1. **Path**: `bin.piper` is exactly `"dist/cli/piper.js"` (no leading `./` required, but it’s fine if present). 
> 2. **Built file exists**: `test -f packages/piper/dist/cli/piper.js || echo "missing"`. 
> 3. **Shebang + exec bit**: file starts with `#!/usr/bin/env node` and `chmod +x`. 
> 4. **Root depends on it**: `jq -r '.devDependencies["@promethean/piper"]' package.json` ⇒ `workspace:*`. 
> 5. **Reinstall**: `pnpm -w install`. 
> 6. **Check shim**: `ls node_modules/.bin | rg '^piper$'`. 
> 7. **No collision**: ensure no other package exports a `piper` bin (`rg -n '"bin".*piper' packages -g '!packages/piper'`).
> 
> # Why `pnpm install` “did nothing”
> pnpm only creates `node_modules/.bin/<name>` for **installed dependencies**. Your package doesn’t install itself. Either make it a dependency of something (root or another package) or link it globally.
> 
> If you want to run it in-place during dev, add a script to `packages/piper/package.json`:
> 
> ```json
> "scripts": {
>  "dev": "tsx src/cli/piper.ts"
> }
> ```
> 
> And do:
> 
> ```bash
> pnpm --filter @promethean/piper dev
> ```
> 
> No bin shims needed while developing.
> 
> ---
> 
> If you still hit friction, paste:
> - `packages/piper/package.json`
> - `head -n1 packages/piper/dist/cli/piper.js`
> - output of `ls -l node_modules/.bin/piper` and `readlink -f node_modules/.bin/piper`
> 
> I’ll tell you exactly which step is failing.
> 
> #tags #pnpm #workspaces #node #typescript #cli #bin-shims #monorepo
<!-- UID: 6e0ff890-a1f0-4eae-a244-06c30b9d779a -->

---


