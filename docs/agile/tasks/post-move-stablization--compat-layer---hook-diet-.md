---
uuid: "f40d381b-9c48-4dfc-9f89-51577c10c024"
title: "<verb> <thing> <qualifier> :auto :ts"
slug: "post-move-stablization--compat-layer---hook-diet-"
status: "testing"
priority: "p3"
tags: ["board", "lang"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







# Task: Post-move stabilization compat layer + hook diet

## Objective

Get `pre-commit run -a` green **without** undoing the refactor, by:

1. adding a thin compatibility layer for moved modules,
2. tightening hook scope stop linting logs/fixtures,
3. pinning TypeScript/Python import roots,
4. fixing the two real code issues surfaced.

---

## What to do step-by-step

### 0) Create a stabilization branch

* `git switch -c refactor/stabilize-precommit`

### 1) Generate a move map (so you’re fixing facts, not vibes)

* `git show --name-status HEAD > /tmp/move-map.txt`
* skim for `R100/R9x` lines → that’s your old → new paths.
* keep this file; you’ll use it to build shims.

### 2) TypeScript: lock imports to workspace roots

* In the **root** `tsconfig.base.json` (or `tsconfig.json`):

  * ensure:

    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@shared/*": ["shared/ts/*"],
          "@services/*": ["services/js/*"]
        }
      }
    }
    ```
* Add **temporary re-export shims** for the most commonly imported moved modules (from the move map). Example:

  * If `shared/ts/voice/src/voice-recorder.ts` moved to `shared/ts/voice/src/recorder/index.ts`, create:

    ```
    shared/ts/voice/src/voice-recorder.ts
    -------------------------------------
    export * from "./recorder/index";
    ```
  * Do *not* overdo it; hit only what the build/tests currently import.

### 3) Prettier/ESLint: stop linting the trash heap

* Create/update `.prettierignore` at repo root:

  ```
  # generated & logs
  **/dist/**
  **/build/**
  **/coverage/**
  **/.output/**
  shared/ts/smartgpt-bridge/logs/**
  **/*.lock
  # intentionally broken fixture(s)
  shared/ts/smartgpt-bridge/src/tests/fixtures/broken.ts
  ```
* In `.pre-commit-config.yaml`, scope prettier/eslint hooks with `files:`/`exclude:` so they don’t traverse logs/fixtures:

  ```yaml
  - id: prettier
    files: '\.(ts|tsx|js|mjs|cjs|json|md|yaml|yml)'
    exclude: '(logs/|fixtures/broken\.ts)'
  ```

### 4) Kill Hy from hook paths (this was the top failure)

* Your `tsc-no-emit` and `lint-topics` hooks are shelling into `make` → `Makefile.hy` → `mk.generator` (now missing).
* In `.pre-commit-config.yaml`, rewrite those hooks to call tools **directly**:

  ```yaml
  - id: tsc-no-emit
    name: TypeScript compile check (no emit)
    entry: bash -lc 'pnpm -w -r exec tsc --noEmit'
    language: system
    pass_filenames: false

  - id: lint-topics
    name: Topic/Schema lints
    entry: node scripts/lint-topics.mjs
    language: system
    pass_filenames: false
  ```
* In your `Makefile`, change `ts-type-check` to the same `pnpm … tsc --noEmit` and **remove** any Hy imports from that target. Don’t delete Hy globally yet—just stop calling it.

### 5) Python: stop import-time explosions

* Your import chain dies because `shared/py/__init__.py` eagerly imports a module that moved (`permissions`).
* Make `shared/py/__init__.py` minimal (no eager imports):

  ```python
  # shared/py/__init__.py
  __all__ = []
  ```
* Add a **compat shim** so callers don’t faceplant:

  * Create `shared/py/permissions.py`:

    ```python
    # Temporary forwarder after moves. Remove once call sites updated.
    try:
        # point this to the new location:
        from shared.py.auth.permissions import PermissionLayer, PermissionRule  # noqa: F401
    except Exception as e:  # pragma: no cover
        raise ImportError(
            "shared.py.permissions moved; update imports to shared.py.auth.permissions"
        ) from e
    ```
  * If the new path is different, adjust the import accordingly.
* Fix missing names flagged by flake8:

  * `shared/py/ml/hf_embeddings.py`: `from sentence_transformers import SentenceTransformer`
  * `shared/py/speech/transcriber.py`:
    `from scipy.io import wavfile`; `from urllib.parse import urlencode`; `import requests`
  * `shared/py/speech/voice_synth.py`: `import requests`

### 6) Requirements check: align with constraints & reality

* The hook complains about `requirements.{gpu,cpu}.in` paths that don’t exist. Options:

  * **Preferred:** update the checker config to only validate files that exist.
  * **Pragmatic:** add stub files with only a constraints include:

    ```
    -c ../../../constraints.txt
    ```
* Remove any `-r` shared includes; per your policy, each service lists **direct** deps + `-c constraints.txt`.

### 7) Re-run hooks in isolation (quick loops)

```sh
pre-commit clean && pre-commit install

pre-commit run tsc-no-emit -a
pre-commit run flake8 -a
pre-commit run pytest -a     # should collect; if tests fail, fine—pre-commit just needs to run them
pre-commit run prettier -a
pre-commit run check-requirements-includes -a
pre-commit run lint-topics -a

pre-commit run -a            # full sweep
```

### 8) If TS still screams, it’s path fallout—not Hy

* Use TS to tell you which imports are broken now that Hy is out of the way.
* For any high-fanout import that moved, prefer **one** re-export shim (Step 2) over churning 200 call sites in this PR.

### 9) Commit + PR

* Commit message:

  ```
  chore(stabilize): pre-commit green after repo moves
  - drop Hy from hook path
  - add TS path mapping & re-export shims
  - python compat shim for permissions
  - tighten prettier scope; ignore logs/fixtures
  - fix flake8 missing imports
  - reconcile requirements includes with constraints
  ```

---

## Follow-ups (new tasks, separate PRs)

* **Rip shims**: migrate call sites to new paths, then delete TS/Python shims.
* **Delete Hy** if it’s truly dead.
* **CI gate**: add a required job that runs `pre-commit run -a` on clean checkout.
* **Codemod**: use a simple jscodeshift/ts-morph + a Python script to rewrite imports using your move map keep it opt-in.

---

## philosophy (because this is how it stays fixed)

* Don’t chase every broken import today—**stabilize** the tooling so it stops fighting you.
* Use **compat shims** to decouple refactor velocity from hook health.
* Keep hooks pointed at **first-party tools** pnpm/node/python, not Makefile wrappers that can drag in dead ecosystems.

#precommit #refactor #typescript #python #imports #compat #monorepo #tooling #stabilization
#accepted






