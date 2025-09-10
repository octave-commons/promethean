---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Node module resolution"
conversation_id: 68a73534-5fc8-832b-8e4d-d56952d97b66
create_time: 08/21/2025 at 10:04 AM
update_time: 08/21/2025 at 10:21 AM
---

# Title: Node module resolution

Created: 08/21/2025 at 10:04 AM
Last Updated: 08/21/2025 at 10:21 AM
Chat URL: https://chat.openai.com/c/68a73534-5fc8-832b-8e4d-d56952d97b66


>[!nexus_user] **User** - 08/21/2025 at 10:04 AM
> We should be able to change the name of node_modules... I've messed with module resolution before working with sibilant. You just add directories to a list... Does node have an ENV var like python has a PYTHONPATH that would let you modify that array?
<!-- UID: eb62d236-48a8-4942-a852-747299242900 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 10:04 AM
> Node doesn’t have a direct equivalent to `PYTHONPATH`. The module resolution algorithm is pretty rigid, and `node_modules` is hard-coded into it. You can’t just rename the folder and expect `require`/`import` to look there.
> 
> Here are the knobs you *do* have: 
> 
> ### 1. `NODE_PATH`
> - Node exposes an env var called `NODE_PATH`. 
> - If you set it, Node will prepend those directories to its module search paths. 
> - Example: 
> 
> ```bash
> export NODE_PATH=/my/custom_modules:/another/place
> node app.js
> ```
> 
> But: 
> - It doesn’t replace `node_modules`, it only supplements. 
> - It’s been considered “legacy” for years—still works, but not recommended. 
> - Doesn’t affect ESM resolution (`import`) as cleanly as CommonJS.
> 
> ---
> 
> ### 2. `--require` / preload hooks
> - You can inject a custom resolver at runtime with `--require` and monkeypatch `Module._resolveFilename`. 
> - That lets you hijack how Node searches and redirect requests into whatever directory you want. 
> - Ugly but effective if you’re trying to emulate renaming `node_modules`.
> 
> ---
> 
> ### 3. Package `exports` / `imports`
> - In `package.json` you can use the `exports` or `imports` fields to define alias paths. 
> - Example: 
> 
> ```json
> {
>  "imports": {
>  "#lib/*": "./src/lib/*"
>  }
> }
> ```
> 
> Then you can `import '#lib/foo.js'`. 
> - That doesn’t let you rename `node_modules`, but it *does* let you control logical resolution.
> 
> ---
> 
> ### 4. Tooling (pnpm, yarn, npm link, etc.)
> Some package managers already implement custom layouts (`pnpm` stores dependencies outside `node_modules` and uses sym). But they still expose a `node_modules` entry point because Node itself expects it.
> 
> ---
> 
> ⚠️ **Bottom line:** 
> There’s no blessed env var that lets you swap out `node_modules`. If you want Python-style flexibility, your best bet is: 
> - Use `NODE_PATH` (legacy, works for CJS). 
> - Write a resolver shim with `--require`. 
> - Or just accept `node_modules` is a sacred cow and build an abstraction layer with `imports/exports`.
> 
> ---
> 
> Do you want me to show you how to write a quick shim that would let you, say, use a directory called `duck_modules/` instead of `node_modules/`?
<!-- UID: af7fa910-fe06-4e89-9ece-e82631f7c1b9 -->

---




>[!nexus_user] **User** - 08/21/2025 at 10:05 AM
> yea if you would be so kind as to remind me how that is done.
<!-- UID: 2c121263-7d34-43a1-b2f0-6fcb80c684bd -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 10:05 AM
> Got you. Three practical ways, from “least invasive” to “you’re really doing it”:
> 
> # 0) The quick-and-dirty: `NODE_PATH`
> Works for CommonJS. Doesn’t rename `node_modules`, just adds another lookup root.
> 
> ```bash
> # put your packages in ./duck_modules/
> export NODE_PATH="$PWD/duck_modules"
> node app.cjs
> ```
> 
> Pros: trivial. 
> Cons: legacy; flaky with ESM; won’t *replace* `node_modules`.
> 
> ---
> 
> # 1) CJS preload shim (`--require`) that tries `duck_modules/` first
> This patches Node’s resolver to fall back to a custom directory if the normal path fails.
> 
> **duck-resolver.js**
> ```js
> // CommonJS only
> const Module = require('module');
> const path = require('path');
> 
> const DUCK_DIR = process.env.DUCK_MODULES ||
>  path.resolve(process.cwd(), 'duck_modules');
> 
> const originalResolveFilename = Module._resolveFilename;
> 
> Module._resolveFilename = function (request, parent, isMain, options) {
>  // First: try normal resolution
>  try {
>  return originalResolveFilename.call(this, request, parent, options);
>  } catch (err) {
>  // Second: try again with DUCK_DIR as a top-priority search root
>  const patched = {
>  ...options,
>  paths: [DUCK_DIR, ...(options?.paths || [])],
>  };
>  return originalResolveFilename.call(this, request, parent, patched);
>  }
> };
> ```
> 
> **Run it:**
> ```bash
> # DUCK_MODULES defaults to ./duck_modules; override if you like
> node --require ./duck-resolver.js app.cjs
> # or
> DUCK_MODULES=/abs/path/to/duck_modules node --require ./duck-resolver.js app.cjs
> ```
> 
> Behavior: `require('chalk')` will resolve normally; if not found, it’ll look under `DUCK_DIR/chalk` (package.json `exports`/`main` respected by Node’s own machinery).
> 
> ---
> 
> # 2) ESM loader (`--experimental-loader`) that falls back to `duck_modules/`
> Use Node’s ESM loader hook to do the same for `import` syntax.
> 
> **duck-loader.mjs**
> ```js
> import path from 'path';
> import { pathToFileURL } from 'url';
> import { createRequire } from 'module';
> 
> const DUCK_DIR = process.env.DUCK_MODULES ||
>  path.resolve(process.cwd(), 'duck_modules');
> 
> // A require scoped to the duck_modules directory so we can reuse Node's CJS resolver
> const requireFromDuck = createRequire(path.join(DUCK_DIR, '.__duck__.js'));
> 
> export async function resolve(specifier, context, next) {
>  // Try the default resolver first
>  try {
>  return await next(specifier, context);
>  } catch (firstErr) {
>  // Fallback: try to resolve from DUCK_DIR
>  try {
>  const resolved = requireFromDuck.resolve(specifier);
>  return { url: pathToFileURL(resolved).href };
>  } catch {
>  // Preserve the original error (better stack for real misses)
>  throw firstErr;
>  }
>  }
> }
> ```
> 
> **Run it:**
> ```bash
> # Node ≥18: loader API is still behind a flag in many LTS builds
> node --experimental-loader ./duck-loader.mjs app.mjs
> # or with env
> DUCK_MODULES=/abs/path/to/duck_modules node --experimental-loader ./duck-loader.mjs app.mjs
> ```
> 
> Notes:
> - This preserves Node’s package `exports`/`main` logic by delegating to a `require` rooted at `duck_modules`.
> - If you import ESM packages from `duck_modules`, Node will still do ESM/CJS interop as usual.
> 
> ---
> 
> ## What this does *not* do
> - It doesn’t literally *rename* `node_modules`. You’re adding a new top-priority root called `duck_modules` and falling back to it.
> - Tooling (TS, ESLint, Jest, etc.) may still assume `node_modules`. For TypeScript, add path hints if you import by bare specifiers that now live in `duck_modules`.
> 
> ---
> 
> ## Sanity checklist
> - Put packages under `duck_modules/<pkg-name>/...` exactly like `node_modules`.
> - Keep lockfiles/package managers happy (pnpm/yarn/npm still manage `node_modules`). Your duck dir is for *extras* or experiments; you can symlink if you’re brave.
> - If you want this project-wide: bake the flags into your dev scripts:
>  - CJS: `"dev": "node --require ./duck-resolver.js ./src/index.cjs"`
>  - ESM: `"dev": "node --experimental-loader ./duck-loader.mjs ./src/index.mjs"`
> 
> If you want, I can also add a tiny `postinstall` script to mirror/symlink selected deps into `duck_modules/` so you can prove the pattern without hand-copying.
> 
> #tags #node #module-resolution #esm #commonjs #duck_modules #systems-design
<!-- UID: 32fd6e6b-9da9-4103-a2a7-ac65bc14398e -->

---




>[!nexus_user] **User** - 08/21/2025 at 10:16 AM
> I'll explain exactly what it is I am trying to do. Obsidian slower and slower the more files you have present in your repo. Even if you ignore them, they are still included in a way to the obsidian process. They're just not index and don't show up in searches, but you can still navigate to them from their file explorer.
> 
> To truly make obsidian ignore a file or folder, it must begin with a `.`. 
> 
> I've been running my vault under my `docs/` folder recently, because it was too laggy to deal with otherwise.
> 
> There are plugins for it that don't really.. work... one of them works on a list of files/folders you wish to ignore, and then gives you an "ignore" toggle, which renames all of those files/folders to start with a "." to get obsidian to ignore them while you're using it. 
> 
> The others just hide their UI, they are still seen by obsidian.
> 
> So I was thinking, if I could just put at least all of my `node_modules` into `.node_modules`, or at least have that be in the resolution list, that I could start using obsidian in my repo root again to keep track of stuff like AGENTS.md files in code folders.
<!-- UID: 00468b63-777e-445b-a4b9-c5120cf81fd1 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 10:16 AM
> Got it. You want Obsidian to stop seeing `node_modules`, so you’ll hide it behind a dot folder **without breaking your tooling**. Here’s a pragmatic plan that actually works.
> 
> # Goal
> - Keep your vault at repo root.
> - Move deps to `./.node_modules/` (Obsidian ignores dotdirs).
> - Make Node/TS/ESLint/Jest/etc. still resolve packages and binaries.
> - Keep installs working with npm/yarn/pnpm.
> 
> ---
> 
> # Step 1 — Put deps in `.node_modules/` and keep installs working
> 
> Add two scripts that *temporarily* restore the conventional layout just for `install`, then hide it again.
> 
> **package.json**
> ```json
> {
>  "scripts": {
>  "preinstall": "bash scripts/_preinstall_restore_node_modules.sh",
>  "postinstall": "bash scripts/_postinstall_hide_node_modules.sh",
>  "dev": "DUCK_MODULES=.node_modules node --require ./duck-resolver.js src/index.cjs",
>  "dev:esm": "DUCK_MODULES=.node_modules node --experimental-loader ./duck-loader.mjs src/index.mjs"
>  }
> }
> ```
> 
> **scripts/_preinstall_restore_node_modules.sh**
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> if [[ -d ".node_modules" && ! -e "node_modules" ]]; then
>  # restore a symlink so the package manager can write to node_modules
>  ln -s .node_modules node_modules
> fi
> ```
> 
> **scripts/_postinstall_hide_node_modules.sh**
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # If a real dir exists (not a symlink), move it once
> if [[ -d "node_modules" && ! -L "node_modules" ]]; then
>  mv node_modules .node_modules
> fi
> 
> # Remove the visible entry; Obsidian must not see 'node_modules'
> if [[ -L "node_modules" ]]; then
>  rm node_modules
> fi
> ```
> 
> > Net effect: during `npm|yarn|pnpm install`, a **temporary symlink** named `node_modules` exists so the installer is happy. After install, it’s removed and all deps live in `./.node_modules/` (hidden from Obsidian). Between installs, there is **no** visible `node_modules`.
> 
> ---
> 
> # Step 2 — Make Node resolve from `.node_modules/`
> 
> ## CommonJS (works everywhere)
> **duck-resolver.js**
> ```js
> // CommonJS preload: try normal resolution, then fall back to DUCK_DIR
> const Module = require('module');
> const path = require('path');
> 
> const DUCK_DIR = process.env.DUCK_MODULES ||
>  path.resolve(process.cwd(), '.node_modules');
> 
> const originalResolveFilename = Module._resolveFilename;
> 
> Module._resolveFilename = function (request, parent, isMain, options) {
>  try {
>  return originalResolveFilename.call(this, request, parent, isMain, options);
>  } catch (err) {
>  const patched = { ...(options || {}), paths: [DUCK_DIR, ...(options?.paths || [])] };
>  return originalResolveFilename.call(this, request, parent, isMain, patched);
>  }
> };
> ```
> 
> Run with:
> ```bash
> DUCK_MODULES=.node_modules node --require ./duck-resolver.js src/index.cjs
> ```
> 
> ## ESM (for `import`)
> **duck-loader.mjs**
> ```js
> import path from 'path';
> import { pathToFileURL } from 'url';
> import { createRequire } from 'module';
> 
> const DUCK_DIR = process.env.DUCK_MODULES ||
>  path.resolve(process.cwd(), '.node_modules');
> 
> // Reuse Node’s resolver from the duck dir
> const requireFromDuck = createRequire(path.join(DUCK_DIR, '.__duck__.js'));
> 
> export async function resolve(specifier, context, next) {
>  try {
>  return await next(specifier, context);
>  } catch (firstErr) {
>  try {
>  const resolved = requireFromDuck.resolve(specifier);
>  return { url: pathToFileURL(resolved).href };
>  } catch {
>  throw firstErr;
>  }
>  }
> }
> ```
> 
> Run with:
> ```bash
> DUCK_MODULES=.node_modules node --experimental-loader ./duck-loader.mjs src/index.mjs
> ```
> 
> > Put those flags into your `package.json` scripts so you don’t think about them.
> 
> ---
> 
> # Step 3 — Make CLI binaries still work
> When `node_modules` is hidden, `node_modules/.bin` disappears too. Expose it via PATH in your scripts:
> 
> **package.json**
> ```json
> {
>  "scripts": {
>  "lint": "PATH=\"$PWD/.node_modules/.bin:$PATH\" node --require ./duck-resolver.js eslint .",
>  "test": "PATH=\"$PWD/.node_modules/.bin:$PATH\" node --require ./duck-resolver.js ava"
>  }
> }
> ```
> 
> If you use `npx`, prefer calling the bin directly (via PATH) or use `pnpm dlx` which doesn’t rely on local `.bin`.
> 
> ---
> 
> # Step 4 — TypeScript sanity (so editors don’t freak out)
> Type declaration lookup often piggybacks Node resolution. Help it a bit:
> 
> **tsconfig.json**
> ```json
> {
>  "compilerOptions": {
>  "baseUrl": ".",
>  "typeRoots": ["./.node_modules/@types", "./types"],
>  "paths": {
>  "*": ["./.node_modules/*", "./*"]
>  }
>  }
> }
> ```
> 
> This covers most cases where tsserver insists on looking under `node_modules`.
> 
> ---
> 
> # Step 5 — Extra belt & suspenders (optional)
> - Set `NODE_PATH` to `.node_modules` for crusty tools:
>  ```bash
>  export NODE_PATH="$PWD/.node_modules"
>  ```
> - ESLint sometimes resolves plugins relative to the config file. If needed:
>  ```json
>  { "resolvePluginsRelativeTo": ".node_modules" }
>  ```
> - Jest custom resolver:
>  ```js
>  // jest.config.js
>  module.exports = {
>  resolver: '<rootDir>/jest.resolver.js'
>  };
>  ```
>  ```js
>  // jest.resolver.js
>  const path = require('path');
>  module.exports = (request, options) => {
>  try { return options.defaultResolver(request, options); }
>  catch (e) { return options.defaultResolver(request, { ...options, moduleDirectories: ['.node_modules','node_modules'] }); }
>  };
>  ```
> 
> ---
> 
> # Caveats (be real about them)
> - Some third-party CLIs hardcode `node_modules`. The PATH shim handles most, but there will be outliers.
> - IDE integrations (ESLint/TS plugins inside the editor) may not inherit your script PATH. Point them at your workspace Node and add `.node_modules/.bin` to the editor’s PATH/env.
> - On Windows, the bash scripts need `.cmd` equivalents. You’re on Linux, so you’re fine.
> 
> ---
> 
> # Minimal “it actually works” checklist
> 1. Run `pnpm install` (or npm/yarn) — it will create a temporary `node_modules` symlink; after install it gets moved/hidden.
> 2. Confirm repo root shows **`.node_modules/`** and **no** `node_modules/`.
> 3. `pnpm run dev` → uses the resolver shim → app runs.
> 4. `pnpm run lint` / `pnpm test` → PATH includes `./.node_modules/.bin`.
> 
> This gives you a vault at repo root with the heavy stuff invisible to Obsidian, while your Node world keeps humming.
> 
> If you want, I can collapse these snippets into a tiny `setup-hidden-node-modules.sh` that drops all files in the right places and patches `package.json` for you. #obsidian #node #module-resolution #performance #typescript #pnpm #eslint #jest #devxp
<!-- UID: 74f55f29-14a1-4f92-819e-a0ea7afed987 -->

---




>[!nexus_user] **User** - 08/21/2025 at 10:20 AM
> I want a .envrcs that can be used with direnv
<!-- UID: b1f35c26-057d-46c2-8f07-2eb56ea568e8 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 10:20 AM
> Perfect fit: `direnv` can *inject* all the env vars so you don’t need to remember flags. Here’s a solid `.envrc` you can drop in your repo root to make `.node_modules/` invisible to Obsidian but still usable by Node, TS, ESLint, etc.
> 
> ---
> 
> # `.envrc`
> 
> ```bash
> # Load asdf/nvm/etc if you use them
> # use node
> 
> # Hide real node_modules from Obsidian
> # (just in case a leftover exists, we move it once into .node_modules)
> if [[ -d node_modules && ! -L node_modules ]]; then
>  mv node_modules .node_modules
> fi
> 
> # Export DUCK_MODULES for resolvers
> export DUCK_MODULES="$PWD/.node_modules"
> 
> # Add hidden bin dir to PATH so CLIs (eslint, jest, ava, etc) work
> PATH_add "$DUCK_MODULES/.bin"
> 
> # Make Node aware of our hidden deps
> # NODE_PATH is legacy but helps with tools that ignore --require
> export NODE_PATH="$DUCK_MODULES"
> 
> # Force TypeScript tooling (tsserver, eslint) to look in the hidden @types
> export TS_NODE_PROJECT="$PWD/tsconfig.json"
> 
> # Optional: alias "node" to always preload the duck resolver (CJS) or loader (ESM)
> alias nodecjs='node --require "$PWD/duck-resolver.js"'
> alias nodeesm='node --experimental-loader "$PWD/duck-loader.mjs"'
> ```
> 
> ---
> 
> # Usage
> 
> 1. Put that in `.envrc` at repo root. 
> 2. Run:
>  ```bash
>  direnv allow
>  ```
> 3. Now every time you `cd` into the repo:
>  - `PATH` includes `./.node_modules/.bin` 
>  - `DUCK_MODULES` and `NODE_PATH` are set 
>  - Symlink cleanup happens automatically 
>  - You get `nodecjs` and `nodeesm` wrappers preloaded with your shims 
> 
> ---
> 
> # Optional niceties
> 
> - If you want *every* `node` command to use your shim, you can override the `node` alias instead of separate ones:
>  ```bash
>  alias node='node --require "$PWD/duck-resolver.js"'
>  ```
>  (But beware: some package managers and tools invoke `node` internally. Keep a backdoor: `\node` will bypass the alias.)
> 
> - If you want to enforce `.node_modules` after every install:
>  ```bash
>  watch_file package.json
>  watch_file package-lock.json
>  watch_file pnpm-lock.yaml
>  watch_file yarn.lock
> 
>  # re-hide node_modules after install
>  if [[ -d node_modules && ! -L node_modules ]]; then
>  mv node_modules .node_modules
>  fi
>  ```
>  `direnv` will reload when lockfiles change.
> 
> ---
> 
> Want me to also give you a `scripts/_postinstall_hide_node_modules.sh` that’s direnv-aware (so you don’t even need the npm `postinstall` hook)?
<!-- UID: b045494d-f92d-48f5-80d5-c10eaff30658 -->

---


