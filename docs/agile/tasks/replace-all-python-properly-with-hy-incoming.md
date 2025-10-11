---
uuid: "991b27c3-0b63-49a5-acd3-d730b28e31fc"
title: "Ban Python; Migrate to Hy; Compile to `./dist`"
slug: "replace-all-python-properly-with-hy-incoming"
status: "done"
priority: "P3"
labels: ["ban", "dist", "migrate", "python"]
created_at: "2025-10-11T03:39:14.523Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Ban Python; Migrate to Hy; Compile to `./dist`
```
**Owner:** Codex / Agent
```
```
**Status:** continue coding
```
**Labels:** #architecture #lang #hy #python-ban #build #ci #tooling #promethean

---

## 🧨 Rationale short + blunt

* One language family per runtime. If we’re in CPython land, it’ll be **Lisp (Hy)**.
* No more “accidental Python” sneaking into commits.
* Reproducible build: Hy sources → compiled Python in `./dist`, **ignored by git**.

---

## Requirements / Definition of Done

* **No `.py` files** committed anywhere outside `./dist`.
* All former Python services/libs are **ported to Hy** (`.hy`), with identical public APIs.
* Hy build produces **importable Python** under `./dist` that mirrors source layout.
* **Pre-commit hook** blocks and un-stages any tracked `.py` outside `./dist`.
* Repo docs explicitly state **“Python source forbidden”**; multiple touchpoints.
* CI runs **only** from Hy sources (compiled in job), never from stray `.py`.
* `./dist` is **git-ignored**; local/CI builds deterministic.

---

## High-Level Plan

1. **Quarantine:** add guardrails (hook, gitignore, CI) before changes.
2. **Module Layout:** standardize Hy source roots mirroring TS/Sibilant.
3. **Build:** compile Hy → Python into `./dist` with preserved package structure.
4. **Ports:** convert Python modules to Hy with 1:1 APIs.
5. **Entrypoints:** run from compiled outputs or `hy -m` during dev.
6. **Docs & Enforcement:** loud policy + CI checks.

---

## 📋 Tasks

### 0) Repo Guardrails (do this first)

* [ ] **.gitignore**

  * Add/confirm:

    ```
    dist/
    **/__pycache__/
    **/*.pyc
    ```
* [ ] **Pre-commit hook** blocks & un-stages `.py` outside `dist/`
  Create `.githooks/pre-commit` and wire via `.git/config` or `core.hooksPath=.githooks`:

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  # Find staged .py files not under dist/
  offenders=(git diff --cached --name-only --diff-filter=ACMR | rg '\.py' | rg -v '^dist/')

  if [[ -n "{offenders}" ]]; then
    echo "❌ Python source is forbidden. Unstaging offending files:"
    echo "{offenders}" | sed 's/^/   - /'
    # Unstage each offender
    while read -r f; do
      [[ -z "f" ]] && continue
      git restore --staged "f" || true
    done <<< "{offenders}"
    echo "Commit blocked. Convert to .hy or place generated code under dist/."
    exit 1
  fi
  ```

  * [ ] Add `scripts/dev/install-hooks.sh`:

    ```bash
    git config core.hooksPath .githooks
    chmod +x .githooks/pre-commit
    ```
  * [ ] CI job step that **fails** if any tracked `.py` exists outside `dist/`:

    ```bash
    rg -n --glob '!dist/**' --glob '!**/*.pyc' --glob '!**/__pycache__' '\.py' . \
      | grep -v '^dist/' && { echo "Python source detected"; exit 1; } || true
    ```

### 1) Hy Tooling + Build Skeleton

* [ ] Add Hy runtime to **`pyproject.toml`** (kept because we still run on CPython):

  ```toml
  [project]
  name = "promethean"
  requires-python = ">=3.11"
  dependencies = ["hy>=1.0.0"]  # pin exact later per versioning policy
  ```

* [ ] Build script: **compile Hy → Python files** into `./dist`. Prefer `hy2py` for readable `.py`.
  `tools/build.hy` invoked by Makefile/uv should:

  * [ ] Walk **Hy source roots** (see next task).
  * [ ] For each `.hy`, run `hy2py` and write path-mirrored `.py` into `./dist`.
  * [ ] Emit `__init__.py` in each `dist` package dir for importability.
  * [ ] Preserve package namespace e.g., `services/py/tts/foo.hy` → `dist/services/py/tts/foo.py`.

* [ ] Make targets:

  ```Makefile
  .PHONY: hy-build hy-clean
  hy-build:
  	uv run hy tools/build.hy

  hy-clean:
  	rm -rf dist
  ```

  Per your workflow: Makefile shells out to `hy tools/build.hy`.

### 2) Source Layout & Conventions

* [ ] Create Hy roots mirroring TS/Sibilant style:

  ```
  shared/hy/            # shared libs (analogue to @shared/ts)
  services/hy/<svc>/    # service-specific Hy
  tools/hy/             # build/dev scripts in Hy
  ```
* [ ] **Import discipline:** Python modules **must not exist** under source; only `.hy`.
* [ ] Generated `.py` lives only under `dist/` with identical package layout.

### 3) Entrypoints & Runtime

* [ ] For dev: allow `uv run hy -m services.hy.cephalon.main` style commands.
* [ ] For prod/CI: run compiled entrypoints from `./dist`, e.g.:

  ```bash
  uv run python -m services.hy.cephalon.main  # with PYTHONPATH=dist
  ```

  * [ ] Add `export PYTHONPATH=dist:{PYTHONPATH}` to service runners/PM2 env.
  * [ ] Replace any old `python path/to/*.py` with **Hy or dist imports**.

### 4) Port Python → Hy incremental, API-stable

* [ ] **Inventory** all Python modules/services and their public APIs.
* [ ] Port order (highest leverage first):

  * [ ] `services/py/stt` (if present), `tts`, any model handlers
  * [ ] `shared/py/**` utility libraries
  * [ ] Remaining Python scripts under `tools/`
* [ ] For each module:

  * [ ] Re-implement in Hy with **same function/class names**, same inputs/outputs.
  * [ ] Delete original `.py` (or move aside), compile `.hy` → `dist/*.py`.
  * [ ] Unit tests updated to import via package name works for both dev/prod.
  * [ ] No direct path imports to `.py` anywhere.

### 5) Testing & CI

* [ ] Update test bootstrap to set `PYTHONPATH=dist`.
* [ ] Add a **pre-test build** step:

  ```bash
  make hy-build
  uv run pytest -q
  ```
* [ ] CI pipeline:

  * [ ] `make hy-build`
  * [ ] Verify **no `.py` outside `dist/`** (same grep as in guardrail).
  * [ ] Run tests.
  * [ ] (Optional) publish `dist` as artifact for downstream jobs.

### 6) Documentation (repeat it loudly)

* [ ] `README.md`: **“Python source is forbidden. Use Hy.”**
* [ ] `CONTRIBUTING.md`: coding standard, examples, build, and the pre-commit rule.
* [ ] `docs/architecture/languages.md`: why Hy, how to import, where compiled code lives.
* [ ] Service READMEs: update run commands (dev via `hy`, prod via `dist`).
* [ ] Codeowners/review checklist: reject PRs with `.py` outside `dist`.

### 7) Linters/Formatters

* [ ] Remove Python linters that parse `.py` sources in the tree.
* [ ] Add Hy formatting guidance (Hy doesn’t have a de facto formatter; keep style doc simple).
* [ ] Keep Ruff/Black **off** the repo or scope them to `dist/` only if needed read-only.

### 8) Final Sweep

* [ ] Repo-wide search for `.py` references in scripts, docs, Dockerfiles.
* [ ] Ensure Docker images copy **Hy sources** then build, or copy **`dist/`** if using multi-stage.

---

## Acceptance Criteria (checkable)

* [ ] Running `rg -n '\.py' --glob '!dist/**'` returns **no results**.
* [ ] `make hy-build` regenerates `./dist` with importable packages and `__init__.py` files.
* [ ] All Python-runtime services start via **Hy or compiled outputs** with no `.py` under source.
* [ ] Pre-commit hook blocks & un-stages `.py` placed anywhere but `dist`.
* [ ] CI fails on any tracked `.py` outside `dist`.
* [ ] Documentation updated in **at least** README + CONTRIBUTING + languages page.
* [ ] At least **two** previously-Python services fully ported to Hy and green in CI.

---

## Step-by-Step Milestone Checklist (you asked for “Step 1..4”)

* [ ] **Step 1 — Guardrails:** add `.gitignore`, pre-commit hook, CI check; set `PYTHONPATH=dist`.
* [ ] **Step 2 — Build:** implement `tools/build.hy` + `make hy-build`; lay out `shared/hy`, `services/hy/*`.
* [ ] **Step 3 — Ports:** migrate highest-value Python modules to `.hy`; remove originals; fix tests.
* [ ] **Step 4 — Docs/Enforce:** update docs; remove Python linters; repo-wide sweep; close out.

---

## Relevant Resources

* You might find \[this] useful while working on this task
  *link your internal Hy style guide or a reference note with macros/patterns you like; keep it local to the vault/repo*

---

## Comments

Append-only thread for agents. Note blockers, weird Hy interop, or macro decisions here.

---

## Notes / Gotchas

* **hy2py limitations:** Generated Python may differ stylistically; that’s fine—it’s an artifact. Source of truth is `.hy`.
* **Dynamic imports:** If any code used `importlib` tricks, you’ll need to replicate behavior in Hy or adjust the API.
* **Packaging:** If you distribute wheels later, you can package from `dist/` while keeping the repo source pure Hy.
* **Performance:** Hy compiles to Python AST; runtime perf should be on par with equivalent Python once compiled.

\#tags #promethean #hy #lisp #python #build #ci #git #precommit #policy #docs

#archive
