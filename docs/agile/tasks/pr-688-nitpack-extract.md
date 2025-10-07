---
uuid: 63e44f3d-fc18-4caf-85b7-08936527317e
title: pr 688 nitpack extract
status: testing
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.518Z'
---
### `docs/agile/tasks/pr-688-nitpack-extract.md`

**Title:** PR #688 — extract & dedupe review nits into actionable tasks
```
**Status:** #ready
```
**Actor:** #agent-mode #codex-task
```
**Epic:** #merge-hygiene #docops
```
```
**Priority:** P0
```
```
**Links:** PR #688
```
#### Intent

Pull every review comment on PR #688 via API, **normalize + deduplicate** the tiny nits, cluster them into 1–2 **repo-wide tasks** codemods + policy, and write the tasks out as markdown checklists with exact globs and instance counts. No UI scraping, no page loads.

---

### Deliverables

1. **Task A — Codemods batch repo-wide**

   * A checklist of deduped rules, each with:

     * **Pattern name** (e.g., “Append `.js` to relative TS imports”)
     * **Count** of instances found
     * **Glob(s)** where they appear
     * **One-liner fix strategy** ts-morph/jscodeshift
   * Saved to `docs/agile/tasks/pr-688-nitpack-codemods.md`.

2. **Task B — Policy/Config follow-ups**

   * Lint/format/pre-commit rule tweaks that prevent reoccurrence (e.g., ESLint import rules, markdownlint exceptions, `.prettierignore` for dumps).
   * Saved to `docs/agile/tasks/pr-688-nitpack-policy.md`.

3. A short comment on **PR #688** linking both tasks and stating “review nits have been consolidated; follow these two tasks.”

---

### Agent playbook (how to do it without touching the UI)
```
1. **Fetch comments (both kinds)**
```
   * Review comments: `GET /repos/{owner}/{repo}/pulls/688/comments`
   * Conversation comments: `GET /repos/{owner}/{repo}/issues/688/comments`
   * If `gh` CLI available:

     * `gh api repos/{owner}/{repo}/pulls/688/comments > .cache/pr688_review.json`
     * `gh api repos/{owner}/{repo}/issues/688/comments > .cache/pr688_issue.json`
```
2. **Normalize**
```
   * Lowercase
   * Strip code fences/blocks and quoted snippets
   * Remove line/file prefixes like `packages/x/src/foo.ts:123`
   * Collapse whitespace
   * Keep **rule tokens** e.g., “use .js suffix”, “no TS paths”, “native esm”, “no default export”, “order imports”, “prefer immutable”, “avoid mutation”, “license gpl-3.0-only”, “@fastify/static”, “don’t embed html”, “ava test”, etc.
```
3. **Cluster / dedupe**
```
   * First pass: regex map common nits → canonical keys, e.g.:

     * `REL_JS_SUFFIX`: add `.js` to relative TS imports
     * `NO_TS_PATHS`: remove TS path aliases
     * `NATIVE_ESM`: `"type":"module"`, NodeNext, no CJS
     * `NO_DEFAULT_EXPORT`: switch to named exports
     * `IMPORT_ORDER`: consistent import grouping
     * `IMMUTABLE_FP`: no `let`, no mutation in utils
     * `GPL_ONLY`: package.json `"license":"GPL-3.0-only"`
     * `NO_EMBED_HTML`: backend must not embed HTML; serve via `@fastify/static`
     * `AVA_TESTS`: add/rename AVA tests to pattern
     * (Add more keys found in comments)
   * Second pass: fuzzy dedupe Levenshtein/Jaccard to merge same-meaning comments.
```
4. **Locate occurrences in repo**
```
   * For each key, compute candidate globs and counts using ripgrep:

     * e.g., `REL_JS_SUFFIX` → `rg -n "from '\"[./]" packages/**/src/**/*.{ts,tsx}`
     * `NO_TS_PATHS` → check `tsconfig.*.json` for `paths`
     * `NO_EMBED_HTML` → `rg -n "<html|<!doctype|res.send\\(" packages/**/src/**/*.ts`
   * Record **count** and **top offending files** (cap to first 10 per key).
```
5. **Emit the two tasks**
```
   * **Task A**: for each key with `count > 0`, add a checklist item:

     * `- [ ] REL_JS_SUFFIX — 87 matches — packages/**/src/**/*.{ts,tsx} — Fix: codemod to append ".js" on relative imports`
   * **Task B**: propose minimal, enforceable config/rule changes:

     * ESLint rules e.g., `import/extensions`, `no-restricted-imports` for TS paths
     * `markdownlint` exceptions for dumps
     * `.prettierignore` lines to keep huge exports untouched
     * `ava` test naming/concurrency defaults
     * Pre-commit hooks ordering
```
6. **Save files**
```
   * `docs/agile/tasks/pr-688-nitpack-codemods.md`
   * `docs/agile/tasks/pr-688-nitpack-policy.md`
```
7. **Post summary to PR**
```
   * Comment with a short note and links to the two files.

---

### Acceptance criteria

* Both task files exist with **≤ 15** total checklist items, each deduped and concrete.
* Each checklist item has **counts + globs + one-line fix**.
* No lockfile or code changes made by this task—just the task files.
* A single comment posted on PR #688 linking the tasks.

---

### Guardrails (Promethean law)

* Flat `packages/` only; **no nested** package folders.
* **Native ESM** everywhere (NodeNext), **no TS paths**.
* All **relative imports end with `.js`** in TS source.
* **GPL-3.0-only** in every package.json.
* **Never** embed HTML in backend; use `@fastify/static`.

---

#### Optional: Implementation hint the agent can use (no UI)

If the agent needs to auto-fill counts/globs:

* Use `gh` + `ripgrep` only; no browser access.
* Build a tiny in-memory classifier: map regex → key, else fuzzy-hash to nearest key.
* Output markdown with sections: `## Codemods`, `## Policy`, each checklist item = one nit family.

