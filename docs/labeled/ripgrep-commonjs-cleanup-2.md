---
uuid: bb57799a-2a07-40f3-bd1f-65df66d73544
created_at: '2025-09-19T17:06:49Z'
title: 2025.09.19.17.06.49
filename: Ripgrep CommonJS Cleanup
description: >-
  A practical guide to using ripgrep for identifying and cleaning CommonJS usage
  in JavaScript/TypeScript projects while ignoring build artifacts and vendor
  files. Includes regex patterns to avoid false positives and CI checks for
  ensuring no CJS files remain.
tags:
  - ripgrep
  - commonjs
  - ci
  - regex
  - javascript
  - typescript
  - build artifacts
  - file filtering
related_to_uuid: []
related_to_title: []
references: []
---
You’re OR-ing in `.` (matches almost every non-blank line), which is why it’s noisy. Drop that and tighten both the file set and the regexes.

### Clean, practical ripgrep

**Search JS/TS source only, ignore build/vendor junk, and flag CommonJS usage:**

```bash
rg -nI --no-heading \
  -g '!**/{.git,node_modules,.pnpm,.cache,dist,build,coverage,.next,.nuxt,.svelte-kit}/**' \
  -g '!**/*.{map,min.js,min.css,snap,lock}' \
  -g '**/*.{js,jsx,ts,tsx,mjs,cjs}' \
  -e '(?<![\w$])require\s*\('
```

* `-I` ignores binaries.
* `-g` filters away noisy dirs/files and limits to code extensions.
* The require regex uses a negative lookbehind so `foo.require(` or `required(` don’t match.

### If you also want to catch `.cjs` files (by filename, not content)

Ripgrep matches **content**, not filenames, so list `.cjs` files separately:

```bash
rg --files \
  -g '!**/{.git,node_modules,.pnpm,.cache,dist,build,coverage,.next,.nuxt,.svelte-kit}/**' \
  -g '**/*.cjs'
```

### CI/“assert empty” friendly (fails if any CJS is present)

```bash
# 1) require( ) usage anywhere in source files
if rg -qI \
  -g '!**/{.git,node_modules,.pnpm,.cache,dist,build,coverage,.next,.nuxt,.svelte-kit}/**' \
  -g '!**/*.{map,min.js,min.css,snap,lock}' \
  -g '**/*.{js,jsx,ts,tsx,mjs,cjs}' \
  '(?<![\w$])require\s*\(' ; then
  echo "❌ CommonJS require() found"; exit 1
fi

# 2) any .cjs files at all
if rg --files -q \
  -g '!**/{.git,node_modules,.pnpm,.cache,dist,build,coverage,.next,.nuxt,.svelte-kit}/**' \
  -g '**/*.cjs' ; then
  echo "❌ .cjs files present"; exit 1
fi
```

If you want this permanent, put the `-g '!…'` rules into a repo-root `.rgignore` so you don’t repeat yourself.

Does this make sense, and do you want me to tailor the ignore globs to your exact repo layout (e.g., `packages/`, `examples/`, `docs/` noise)?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
