---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Extending tsconfig explained"
conversation_id: 68af03bd-e268-8331-ae2f-f167a7f54e22
create_time: 08/27/2025 at 8:11 AM
update_time: 08/27/2025 at 9:46 AM
---

# Title: Extending tsconfig explained

Created: 08/27/2025 at 8:11 AM
Last Updated: 08/27/2025 at 9:46 AM
Chat URL: https://chat.openai.com/c/68af03bd-e268-8331-ae2f-f167a7f54e22


>[!nexus_user] **User** - 08/27/2025 at 8:11 AM
> Give me a detailed explaination of how extending tsconfigs work.
> Where do the paths resolve to, in relation to the config file, or in relation to the cwd of the process that is using them?
<!-- UID: a020ee86-01bc-4e5e-8ca5-dc9a35c395ad -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 8:11 AM
> Here’s the no-BS version.
> 
> # How `extends` in tsconfig works
> 
> ## Mental model
> - TypeScript reads **one “root” tsconfig** (the file you pass with `-p` or the nearest `tsconfig.json` from your CWD).
> - If that file has `"extends"`, it **loads the base**, then **deep-merges** options **key-by-key**:
>  - Objects (e.g., `compilerOptions`) → merged; **child overrides keys** from base.
>  - Arrays (e.g., `lib`, `types`, `rootDirs`, path lists inside `paths` entries) → **replaced** by the child if present (not concatenated).
>  - Top-level `files`, `include`, `exclude`, `references` → **replaced** whole if the child sets them; otherwise inherited as-is.
> - You can chain: A extends B extends C… Only one `extends` per file, but it can form a chain.
> 
> ## Where paths resolve from (the part people trip on)
> **Rule of thumb:** 
> > **Every relative path is resolved relative to the config file *that defines it*.** 
> > Not the process CWD. Not the root tsconfig (unless that’s the file that defines that particular option).
> 
> Consequences:
> 
> - If your **base** config sets `"baseUrl": "."`, that “.” means “the folder containing the **base** tsconfig,” not the child’s folder.
> - If your **child** config sets `"outDir": "./dist"`, that resolves in the **child** folder, even if the base has its own `outDir`.
> - **`paths`** entries resolve **relative to the `baseUrl` from the same config file**. No `baseUrl`, no `paths` remapping.
> - **`include` / `exclude` / `files`** globs are evaluated relative to the file that declares them.
> - **`references[].path`** (project references) is relative to the tsconfig that lists the reference.
> 
> So: **CWD only matters for selecting the initial tsconfig** (e.g., `tsc -p .`). Once a tsconfig is chosen, **all path math is anchored to the file that declares each option.**
> 
> ---
> 
> ## How `extends` is resolved
> - `"extends": "./tsconfig.base.json"` → relative to the **child** file’s folder.
> - `"extends": "@tsconfig/node18/tsconfig.json"` → resolved via **Node module resolution** from the child’s folder (i.e., found in `node_modules`).
> 
> ---
> 
> ## Practical patterns (that won’t bite you)
> 
> ### 1) Monorepo “root base” pattern
> ```
> repo/
>  tsconfig.base.json ← sets shared compiler flags + baseUrl="."
>  packages/
>  foo/tsconfig.json ← extends ../../tsconfig.base.json
>  bar/tsconfig.json
> ```
> - Put **generic** stuff in `tsconfig.base.json`: `target`, `module`, `lib`, `strict`, `moduleResolution`, `skipLibCheck`, and often `baseUrl: "."` + repo-wide `paths` (e.g., mapping `@shared/*`).
> - **Do not** put project-specific paths (`outDir`, `rootDir`, `include`, `exclude`) in the base. Because they’ll be relative to the **base file**, which is almost never what you want for a shared config.
> 
> ### 2) Per-package specifics
> Each package’s `tsconfig.json` sets:
> ```jsonc
> {
>  "extends": "../../tsconfig.base.json",
>  "compilerOptions": {
>  "rootDir": "src",
>  "outDir": "dist"
>  },
>  "include": ["src"]
> }
> ```
> Now those paths anchor to the package folder (correct).
> 
> ---
> 
> ## `paths` + `baseUrl` clarified
> - `compilerOptions.baseUrl` → **relative to the file that declares it**.
> - `compilerOptions.paths` → values are **relative to that same `baseUrl`**.
> - If your base sets `baseUrl: "."` and the base sits at the repo root, `paths` in the base will also anchor to the repo root for **all** children. That’s by design and often desirable.
> 
> **Gotcha:** If you move `baseUrl` from base → child without updating `paths`, your aliases will silently point somewhere else.
> 
> ---
> 
> ## What gets merged vs replaced (quick reference)
> 
> | Property | Behavior when child sets it |
> |----------------------------------|------------------------------|
> | `compilerOptions` (object) | **Merged** (child keys override) |
> | `compilerOptions.paths` (object) | **Merged** per key; each key’s **array is replaced** if the child defines that key |
> | `lib`, `types`, `rootDirs` | **Replaced** (arrays don’t concat) |
> | `plugins` | Treat as **replaced** (don’t count on concat) |
> | `include`, `exclude`, `files` | **Replaced** whole if present in child |
> | `references` | **Replaced** whole if present in child |
> | `watchOptions`, `typeAcquisition`| **Merged** like objects (child keys override) |
> 
> ---
> 
> ## Debugging checklist (use these, don’t guess)
> 
> 1. **Show the effective config** 
>  ```bash
>  tsc -p path/to/tsconfig.json --showConfig
>  ```
>  This prints the final merged config with paths resolved. If something surprises you, this tells you *which file* contributed each setting.
> 
> 2. **Trace module resolution** (for alias/import issues) 
>  ```bash
>  tsc -p path/to/tsconfig.json --traceResolution
>  ```
>  You’ll see exactly how a specifier was matched (including `baseUrl`/`paths` behavior).
> 
> 3. **Sanity check path anchors** 
>  If you’re unsure what “.” means somewhere, temporarily change it to an absolute path and re-run `--showConfig`. If that fixes it, you had an anchoring assumption wrong.
> 
> ---
> 
> ## Common foot-guns (and how to avoid them)
> 
> - **Putting `include`/`exclude` in a shared base.** 
>  They’ll point at the base’s folder, not your project. Let children declare their file lists.
> 
> - **Setting `outDir`/`rootDir` in a shared base.** 
>  You’ll emit into the base’s neighbor folders (or worse, `node_modules`). Keep those per-project.
> 
> - **Assuming `paths` entries are relative to the tsconfig file.** 
>  They are relative to `baseUrl`. And `baseUrl` itself is relative to the file that declares it.
> 
> - **Expecting arrays to merge.** 
>  They don’t. If you define `lib` in the child, you **replace** the base list. (Same for `types`, etc.)
> 
> - **Forgetting runtime support for `paths`.** 
>  Node doesn’t know about TS `paths`. If you run TS directly (ts-node/tsx), use their `tsconfig-paths`/built-in alias support; if you compile then run JS, your bundler needs matching alias config.
> 
> ---
> 
> ## Short answers to your questions
> 
> > **How does extending tsconfigs work?** 
> Base config is loaded, then your child config **overrides or merges** option keys. You can chain. Arrays are replaced, objects are merged with child taking precedence.
> 
> > **Where do the paths resolve—relative to the config file or the process CWD?** 
> **Relative to the config file that *declares* the option.** `paths` entries are relative to the **`baseUrl`** declared in that same file. The process CWD only determines which tsconfig is considered the *root* when you run `tsc` without `-p`.
> 
> ---
> 
> ## Opinionated rules that keep you out of trouble
> - Keep **base** configs free of project-specific path options; use them only for shared compiler behavior and (if you intend it) a repo-root `baseUrl` + repo-wide `paths`.
> - Put **`include`/`exclude`/`outDir`/`rootDir`** in the **child** configs.
> - When in doubt, **`--showConfig`**. It’s the ground truth.
> 
> #tags/TypeScript #tags/tsconfig #tags/build-systems #tags/monorepo #tags/paths #tags/extends #tags/practical-debugging
<!-- UID: 6f010c43-1eb7-4a45-b48c-e63c5e12c455 -->

---




>[!nexus_user] **User** - 08/27/2025 at 9:19 AM
> what exactly is baseurl for?
<!-- UID: 465cc6d4-832c-4d5e-a0d1-ba1048a1e574 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 9:19 AM
> Good question — `baseUrl` is one of those things that sounds simple but trips people up.
> 
> ---
> 
> # What `baseUrl` is for
> 
> By default, TypeScript (and Node, etc.) resolve imports **relative to the file that contains the import**:
> 
> ```ts
> import { foo } from "../../utils/foo";
> ```
> 
> That’s ugly in big projects. `baseUrl` gives you a **logical root directory** from which non-relative imports are allowed. 
> 
> So if you set:
> 
> ```json
> {
>  "compilerOptions": {
>  "baseUrl": "./src"
>  }
> }
> ```
> 
> then in any file you can write:
> 
> ```ts
> import { foo } from "utils/foo";
> ```
> 
> instead of walking up/down directories with `../..`.
> 
> ---
> 
> # How it actually works
> 
> - `baseUrl` tells TypeScript **where to start looking** when an import is *non-relative* (no `./` or `../` at the front).
> - It does **not** affect relative imports (`./thing` or `../thing`).
> - It does **not** magically rewrite runtime resolution — it’s purely a compiler/bundler hint. You need a runtime loader (like Node + `tsconfig-paths`, Webpack, Vite, etc.) to respect the same base if you’re not compiling down.
> 
> ---
> 
> # Interaction with `paths`
> 
> `paths` sits on top of `baseUrl`. 
> Think of it as “aliases relative to baseUrl.”
> 
> Example:
> 
> ```json
> {
>  "compilerOptions": {
>  "baseUrl": "./src",
>  "paths": {
>  "@models/*": ["models/*"],
>  "@utils/*": ["utils/*"]
>  }
>  }
> }
> ```
> 
> - `"@models/User"` → resolves to `src/models/User.ts`
> - `"@utils/helpers"` → resolves to `src/utils/helpers.ts`
> 
> Without `baseUrl`, those path entries are relative to the tsconfig that declares them.
> 
> ---
> 
> # Practical rules
> 
> - **Use `baseUrl` to cut out `../../` hell.**
> - **Combine with `paths` to set up nice aliases.**
> - **Keep `baseUrl` broad** (often the repo root or `src`). 
>  Don’t set it per-package unless you want different anchors.
> - Remember: **`baseUrl` only affects non-relative imports**.
> 
> ---
> 
> # TL;DR
> 
> 👉 `baseUrl` defines the “root” folder where TypeScript starts resolving bare imports like `"foo/bar"`. 
> 
> 👉 All `paths` mappings are evaluated relative to that `baseUrl`. 
> 
> 👉 It’s a compile-time feature — runtime loaders need matching config to honor it. 
> 
> ---
> 
> Do you want me to also walk through how this interacts with **monorepo setups** (like Yarn workspaces or PNPM), where `baseUrl` can bite you if you put it in the wrong tsconfig?
<!-- UID: 8e0cf974-dcfb-409b-9d3d-f5a16c3c499e -->

---


