---
```
uuid: 2d79c5b8-9f76-4d7f-9741-694d1f99ec25
```
```
created_at: 2025-09-05T10:56:08Z
```
filename: Promethean Build Pattern
title: Promethean Build Pattern
description: A concise pattern for managing package builds with pnpm, ensuring each package owns its build script while the root orchestrates workspace builds. This approach minimizes duplication, handles dependencies efficiently, and supports incremental builds without conflicts.
tags:
  - pnpm
  - workspace
  - build
  - typescript
  - dependency
  - incremental
```
related_to_uuid: []
```
```
related_to_title: []
```
references:
```
-
```
---
Short version: put a *thin* `build` script in every package, then drive them from the root using pnpm’s recursive + filters. You keep per-package builds, and the root builds everything (or smart subsets) without duplication.

Here’s the pattern that works and doesn’t fight pnpm.

# 1) Each package owns its local build
```
`packages/foo/package.json`
```
```json
{
  "name": "@promethean/foo",
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}
```

Keep this minimal. If you need extra steps (copy files, fix .js extensions, etc.), wrap them in a local `scripts/build.ts` and call it here.

# 2) Root scripts orchestrate

Root `package.json`

```json
{
  "private": true,
  "scripts": {
    // build ALL packages in the workspace (in parallel, respecting deps)
    "build": "pnpm -r --workspace-concurrency=4 run build",

    // build a single package by name (pass PKG=@promethean/foo)
    "build:pkg": "pnpm -r --filter {PKG} run build",

    // build a package + all of its upstream dependencies
    "build:with-deps": "pnpm -r --filter ...{PKG} run build",

    // build only packages that changed since last commit (cheap heuristic)
    "build:since": "pnpm -r --filter \"...[HEAD^]\" run build",

    // watch everything (if packages expose `watch`)
    "watch": "pnpm -r run watch"
  }
}
```

### Why these matter

* `pnpm -r run build` runs each package’s own `build`, so packages stay independently buildable:
  `pnpm --filter @promethean/foo run build`.
* The **ellipsis** rules are non-obvious but critical:

  * `--filter ...@promethean/foo` (prefix ellipsis) includes **dependencies** of `foo` (build upstream first).
  * `--filter @promethean/foo...` (trailing ellipsis) includes **dependents** of `foo` (downstream).
  * No ellipsis → just that package.

# 3) (Optional but recommended) TypeScript project references

If you enable TS build mode, the root can drive a strictly ordered build without any external tool.

Root `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "packages/foo" },
    { "path": "packages/bar" }
  ]
}
```

Package `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "composite": true, "declaration": true, "outDir": "dist" },
  "include": ["src"]
}
```

Then add at root:

```json
{
  "scripts": {
    "build:ts": "tsc -b",
    "clean:ts": "tsc -b --clean"
  }
}
```

You still keep `pnpm --filter @promethean/foo run build` working, but `tsc -b` can do the whole graph deterministically when you want a clean, full build.

# 4) Keep duplication out

* Put **tooling** deps at the root `typescript`, `ava`, `@types/node`, linters.
* Use package-level runtime deps only where they’re actually needed.
* Use `pnpm.overrides` at the root to pin versions repo-wide.
* Add a CI check that fails a PR if a leaf re-declares a root-owned tool (we can wire that next).

# 5) Practical commands you’ll actually use

* Build everything fast:

  ```
  pnpm build
  ```
* Build just one package:

  ```
  pnpm --filter @promethean/foo run build
  ```
* Build `foo` **and its dependencies** (fixes your earlier “HeadersInit” type errors by ensuring upstream is compiled):

  ```
  pnpm -r --filter ...@promethean/foo run build
  ```
* Build packages affected by your last commit (changed or dependents):

  ```
  pnpm -r --filter "...[HEAD^]" run build
  ```

If you want, I’ll add a tiny `@promethean/build-tools` helper (ESM, no mutation) that:

* enforces `.js` extensions in `exports` after build,
* copies minimal `package.json` to `dist`,
* and gives you a single `prom-build` you can call from every package to avoid script drift.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
