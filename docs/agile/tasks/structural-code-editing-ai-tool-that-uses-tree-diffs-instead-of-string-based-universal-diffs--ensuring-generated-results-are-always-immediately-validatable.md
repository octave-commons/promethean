---
uuid: cbc70baa-3202-4eb0-a4ef-aec84d3e3bbf
title: >-
  Task: Structural code editing AI tool tree-diffs, not text-diffs — with
  immediate validation
status: testing
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.521Z'
---
# Task: Structural code editing AI tool tree-diffs, not text-diffs — with immediate validation

**Slug:** `structural-code-editing-ai-tool-that-uses-tree-diffs-instead-of-string-based-universal-diffs--ensuring-generated-results-are-always-immediately-validatable`
```
**Type:** Feature / R\&D spike → MVP
```
```
**Status:** Proposed
```
```
**Owner:** Err
```
```
**Priority:** High
```
**Context:** We need robust, deterministic edits that don’t explode at compile time. Stop letting agents “guess-and-pray” with string diffs. Operate on ASTs, emit structural patches, and refuse to output anything that can’t be validated immediately.

---

## Problem statement

String-based diffs are brittle. They break on formatting, comments, or tiny layout changes, and they’re impossible to validate mid-generation. We want an AI-driven **structural editor** that (1) plans edits at the AST level, (2) applies them via language-aware transforms, (3) formats, **type-checks**, and **test-checks** the result, and (4) only returns a patch if it’s **immediately validatable** parse clean, passes formatter, passes lints, and at least compiles/types. If validation fails, the tool iterates or aborts with a structured failure report.

---

## Outcome / definition of done

* A **CLI + library** Node/TS that:

  * Accepts an **edit intent** (JSON) or natural-language instruction.
  * Produces an **AST patch plan** insert/replace/move/rename using language adapters.
  * Applies the patch to a repo **in an overlay/worktree**, then runs:

    * Parser round-trip parse → print → parse = stable.
    * Prettier format pass = clean (no diff after second run).
    * ESLint (configurable) = no new errors beyond baseline.
    * TypeScript `tsc --noEmit` = no new type errors beyond baseline.
    * Optional: test shard selection e.g., Vitest/Jest on impacted files = green or no worse than baseline.
  * Emits:

    * A **structural diff** (AST ops, JSON).
    * A **text patch** git-applyable.
    * A **validation report** machine-readable + human summary.
* MVP supports **TypeScript/JavaScript first** with **ts-morph**/**TypeScript Compiler API**. Hooks exist for adding Python (LibCST), and others later.
* All generated outputs are **deterministic** given the same repo state + instruction.
* Clear **failure modes**: when validation fails, the CLI exits non-zero and prints a minimal repro (why it failed, where).

---

## Non-goals (for MVP)

* Full multi-language parity. Start with TS/JS.
* Fancy refactors spanning mixed-language graphs. Keep boundaries clean.
* LSP server implementation. (We can integrate with one later.)
* In-IDE UX. Ship a CLI/library first.

---

## Approach skeptical + practical
```
1. **Language adapter (TS/JS)**
```
   * Use **ts-morph** for AST ops rename symbol, move declaration, change signature, add import/export, insert call, wrap/unwrap node.
   * Export a minimal **AST Patch Schema** with idempotent ops:

     * `InsertNode(parentSelector, position, nodeSpec)`
     * `ReplaceNode(selector, nodeSpec)`
     * `DeleteNode(selector)`
     * `MoveNode(selector, newParentSelector, position)`
     * `RenameSymbol(symbolSelector, newName)`
     * `UpdateImport(from, add: [], remove: [])`
   * **Selectors** are structural: by symbol name + file + kind + path e.g., file glob + top-level function named X. Avoid brittle character offsets.
```
2. **Patch planner**
```
   * Natural-language → constrained plan via small rules engine:

     * Map common intents (“rename function,” “extract method,” “move to file,” “convert default export to named”) into **canonical AST ops**.
   * Refuse ambiguous plans: if multiple targets match a selector, abort with disambiguation hints.
```
3. **Application + round-trip**
```
   * Apply ops to an **ephemeral worktree** git worktree or memfs → write to temp dir.
   * **Print → parse → print** check on touched files to ensure AST stability.

4. **Validation pipeline must-pass gates**

   * Prettier → eslint (no new errors) → `tsc --noEmit` → impacted tests.
   * Gate policy configurable, but default is strict: fail-fast on any new error.
```
5. **Outputs**
```
   * `*.astpatch.json` (structural ops)
   * `*.diff` (git patch)
   * `validation.json` + short human summary
   * Optional: **explain** file: why these ops, affected symbols, risk notes.
```
6. **Safety rails**
```
   * Never touch working tree by default. Require `--apply` to write real changes.
   * Provide `--baseline` capture, then compare post-state to baseline.
```
7. **Metrics**
```
   * Track plan attempts, validation failures, time per gate, final outcome. Useful for improving the planner.

---

## CLI sketch

```
sceet  # structural code editing tool

Usage:
  sceet plan --repo . --intent intent.json --out outdir
  sceet apply --repo . --patch outdir/plan.astpatch.json --validate
  sceet validate --repo . --since HEAD --report outdir/validation.json
  sceet all --repo . --intent intent.json --emit-patch --validate
```

* Flags:

  * `--strict` (default): fail on any new lint/type error.
  * `--tests impacted|none|all` (default: impacted).
  * `--formatter prettier` (default).
  * `--overlay worktree|tempdir` (default: tempdir).
  * `--emit {text|structural|both}`.

---

## Minimal AST Patch Schema (JSON)

```json
{
  "version": "1",
  "language": "typescript",
  "ops": [
    {
      "op": "RenameSymbol",
      "selector": { "file": "src/utils/math.ts", "kind": "Function", "name": "sum" },
      "newName": "add"
    },
    {
      "op": "UpdateImport",
      "file": "src/index.ts",
      "from": "./utils/math",
      "add": ["add"],
      "remove": ["sum"]
    }
  ]
}
```

* **Invariant:** After applying ops, parse+format+typecheck must succeed or the plan is rejected.

---

## Acceptance criteria (must all pass)

* [ ] Running `sceet all` on a sample repo to **rename a public function** across multiple files:

  * Emits a structural patch with `RenameSymbol` + `UpdateImport` ops.
  * Text patch applies cleanly with `git apply`.
  * `prettier --check` shows no changes after a second run.
  * `eslint` yields **no new** errors vs baseline.
  * `tsc --noEmit` yields **no new** errors vs baseline.
  * Impacted tests pass (or unchanged vs baseline).
* [ ] A second scenario: **move function to a new module** update imports/exports, adjust references passes the same gates.
* [ ] A third scenario: **wrap function return type** (e.g., add `Result<T, E>`) demonstrates failure handling with a clear validation report when downstream types aren’t updated.
* [ ] Clear **failure report** includes selectors and suggested next steps.
* [ ] Tool never mutates the working tree unless `--apply` is provided.

---

## Milestones
```
1. **MVP TS/JS adapter**
```
   * ts-morph transforms rename/move/update imports/exports
   * AST Patch Schema v1
   * Overlay filesystem + round-trip parse check
```
2. **Validation pipeline**
```
   * Prettier + ESLint + TSC baseline comparison
   * Impacted test detection (simple: glob by import graph via tsconfig paths)
```
3. **Planner v0**
```
   * Map a fixed set of intents to ops
   * Ambiguity detection + fail with hints
```
4. **CLI + reports**
```
   * Human + JSON reports
   * Emit both structural + text patches
```
5. **Hardening**
```
   * Idempotency tests, snapshot tests, repo-agnostic E2E suite

---

## Risks & mitigations

* **Selector brittleness:** If names collide, selectors match too much.
  → Add disambiguators file path, symbol kind, export-ness and abort on multi-match.
* **Formatter churn hides real diffs:**
  → Enforce format-first, diff after format.
* **Type cascades make small edits “big”:**
  → Start with low-blast-radius ops rename/move/import updates. Gate more invasive ops behind a flag.
* **Cross-project TS config weirdness (path aliases, project refs):**
  → Resolve via the TS compiler API using the repo’s real `tsconfig.json` to mirror build.

---

## Deliverables

* `/tools/sceet/` (TypeScript package)

  * `src/adapter/ts/…` ts-morph
  * `src/planner/…`
  * `src/patch/…` schema + apply
  * `src/validate/…` (prettier, eslint, tsc, tests)
  * `src/cli.ts`
* `examples/` repo with 3 scenarios and golden snapshots.
* `docs/STRUCTURAL_DIFFS.md` schema + invariants + examples.

---

## Nice-to-haves post-MVP

* Python adapter with **LibCST** (safe codemods).
* Language-server bridge expose as MCP/LSP tool.
* Graph-aware impact analysis (tsserver, project references).
* “Self-repair” loop: collect validator errors → plan additional ops → re-validate (bounded retries).

---

## How we’ll judge success (blunt criteria)

* **Zero** new parser/type/lint errors on successful runs.
* **Deterministic**: same input → same patch.
* **Human-reviewable**: structural diff readable, text patch minimal.
* **Abort early** on ambiguity or validation failure, with useful hints.

---

## Example intents (for planner tests)

* “Rename function `sum` to `add` across the project; keep exports intact.”
* “Move `parseConfig` from `src/util/config.ts` to `src/config/index.ts` and update imports.”
* “Convert default export in `src/api/client.ts` to named export `createClient` and update consumers.”

---

## Integration hooks

* Pre-commit optional: `sceet validate --since HEAD`
* CI job: run on PRs to block text-only AI diffs without structural equivalence.

---

#promethean #cephalon #devtools #codemod #ast #typescript #ts-morph #validation #prettier #eslint #tsc #testing #mcp #cli #task #architecture #refactor #agent-mode

```smart-connections
{
  "expanded_view": false,
  "render_markdown": true,
  "show_full_path": false,
  "exclude_blocks_from_source_connections": false,
  "exclude_frontmatter_blocks": true,
  "results_limit": "20",
  "exclude_inlinks": false,
  "exclude_outlinks": false
}
```

