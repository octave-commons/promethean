---
uuid: "afcc3154-299a-4531-8adc-94374511e047"
title: "1) require( ) usage anywhere in source files"
slug: "1-require-usage-anywhere-in-source-files"
status: "icebox"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.219Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/2025.09.19.17.06.49.md

## 📝 Context Summary

You’re OR-ing in `.` matches almost every non-blank line, which is why it’s noisy. Drop that and tighten both the file set and the regexes.

### Clean, practical ripgrep

**Search JS/TS source only, ignore build/vendor junk, and flag CommonJS usage:**

* `-I` ignores binaries.
* `-g` filters away noisy dirs/files and limits to code extensions.
* The require regex uses a negative lookbehind so `foo.require(` or `required(` don’t match.

### If you also want to catch `.cjs` files (by filename, not content)

Ripgrep matches **content**, not filenames, so list `.cjs` files separately:

### CI/“assert empty” friendly (fails if any CJS is present)

If you want this permanent, put the `-g '!…'` rules into a repo-root `.rgignore` so you don’t repeat yourself.

Does this make sense, and do you want me to tailor the ignore globs to your exact repo layout e.g., `packages/`, `examples/`, `docs/` noise?

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























