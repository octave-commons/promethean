---
$$
uuid: 4beb36b0-7cc5-4116-a516-3927615031be
$$
title: Pin versions in configs
status: todo
priority: P3
labels: []
$$
created_at: '2025-09-15T02:02:58.517Z'
$$
---
Got it. Here’s a practical expansion you can paste into the board and hand to Codex. It’s opinionated, deterministic, and aims to stop every “oops it upgraded” class of failure.

# Pin versions in configs
$$
**Owner:** Codex / Agent
$$
$$
**Status:** Planned
$$
**Labels:** #ops #codex-task #release-engineering #ci #sre #supply-chain #promethean

---

## 🛠️ Task

Ensure Promethean and Codex configs **explicitly pin** model, image, tool, and library versions. No floating tags, no implicit latest, no wildcard ranges.

---

## Why this matters (short and blunt)

* Silent upgrades = ghost bugs.
* Reproducibility > vibes.
* If CI and prod don’t resolve to the **same** artifacts, your incident postmortems write themselves.

---

## 🎯 Goals

* All services resolve dependencies and models to **exact** versions/digests.
* A **single source of truth** (matrix) lives in git for human review.
* CI **fails** when an unpinned ref sneaks in.

---

## 📦 Requirements

* [ ] **Exact semver** for JS/TS (`"1.2.3"`), **no** `^`, `~`, `*`, ranges, or `latest`.
* [ ] **Python locked** with `uv` $project uses `uv` + in-repo `.venv`$: `pyproject.toml` + committed `uv.lock`. No bare `requirements.txt` without hashes.
* [ ] **Docker images pinned** by **digest** (`image: node:22.5.1@sha256:...`). No floating majors/minors.
* [ ] **GitHub Actions pinned** to **commit SHAs**, not `@v4` tags.
* [ ] **Ollama/OpenVINO/Whisper/TTS/Embed** models pinned to **explicit tags or artifact hashes**. No “latest” or unqualified model names.
* [ ] **System packages** pinned $`apt-get install pkg=1.2.3-*`$ or vendor apt repo with version pin + `apt-mark hold`.
* [ ] **Lockfiles committed** $`package-lock.json` or `pnpm-lock.yaml`, `uv.lock`, etc.$.
* [ ] **Engines/toolchains** declared and enforced $Node, Python, `uv`, `npm`/`pnpm`$ across dev/CI.
* [ ] **Version Matrix** doc $human-readable$ committed and referenced by CI.

---

## 📋 Subtasks

* [ ] **Inventory & Audit**

  * [ ] Locate all dependency surfaces:

    * JS/TS: `package.json`, lockfiles, `pnpm-workspace.yaml`
    * Python: `pyproject.toml`, `uv.lock`, any `requirements*.txt`
    * Docker: `Dockerfile`, `docker-compose.yml`, k8s manifests
    * CI: `.github/workflows/*.yml` actions refs
    * System: any `apt`, `apk`, `dnf` invocations
    * Models: Ollama model lists, OpenVINO IRs, Whisper/TTS configs
    * Tools: PM2 ecosystem, Makefile/Hy wrappers $`tools/build.hy`$, `ecosystem.config.js`
  * [ ] Produce a quick diffable list of offenders (floating tags, ranges, latest).
* [ ] **Define the Version Matrix**

  * [ ] Create `docs/ops/VERSION_MATRIX.md` with sections:

    * **Runtimes** (Node, Python, uv)
    * **JS/TS deps** (critical libs pinned)
    * **Python deps** (critical libs pinned)
    * **Containers** $base image + digest$
    * **System packages**
    * **Models** $Ollama, OpenVINO IR/ops-set, Whisper/TTS, Embeddings$
    * **CI actions** $action\@commit SHA$
  * [ ] Add rationale/compatibility notes (e.g., OpenVINO opset vs model).
* [ ] **Pin Everything**

  * [ ] JS/TS: replace `^`/`~` with exact; run `npm i --package-lock-only` $or `pnpm install --frozen-lockfile`$ and commit.
  * [ ] Python: lock with `uv lock`; commit `uv.lock`; forbid bare `pip install`.
  * [ ] Docker: switch to digests (`FROM node:22.5.1@sha256:...`); update compose/manifests.
  * [ ] CI: replace `uses: actions/checkout@v4` → `@<full SHA>`; document how to bump.
  * [ ] Models:

    * **Ollama**: use explicit tags $`qwen2.5-coder:7b-instruct-q5_K_M`$, capture with `ollama show <model> --modelfile` and record source SHA if available.
    * **OpenVINO**: pin IR artifacts (store under versioned path), record framework/opset.
    * **Whisper/TTS/Embeddings**: pin to model filename or release ID; store checksums.
  * [ ] System packages: set explicit versions and `apt-mark hold` where feasible.
* [ ] **Guardrails**

  * [ ] Add `scripts/ci/check-pins.{js,py}` (pick one) that scans for:

    * `latest`, unqualified `FROM`, `uses: ...@v\d+`, semver ranges, unpinned apt, unqualified model names.
  * [ ] Add a pre-commit hook + CI step that **fails** on violations.
* [ ] **Docs & Runbooks**

  * [ ] `docs/ops/VERSIONING_POLICY.md`: how to bump + verify + roll back.
  * [ ] Update `README`/`CONTRIBUTING` with “No floating versions” rule.
* [ ] **Commit**

  * [ ] Batch the change by service to keep diffs reviewable.
  * [ ] Include matrix + lockfiles in each PR.

---

## 🧩 Design Notes / Conventions

* **JS/TS**

  * Use exact semver: `"1.2.3"`.
  * Enforce with `npm ci`/`pnpm fetch` in CI; never `npm install` without a lockfile.
* **Python**

  * `pyproject.toml` → `uv lock` → commit `uv.lock`.
  * For any `requirements.txt`, include `--require-hashes` + pinned hashes or delete in favor of uv.
* **Docker**

  * Always pin base images to **digest** and specific tag (both).
  * Avoid multi-stage using different floating parents; pin all stages.
* **CI**

  * Pin each `uses:` to full SHA; add a comment with the tag for humans:

    ```yaml
    uses: actions/checkout@b4ffde... # v4.1.7
    ```
* **Models**

  * Treat models like binaries: versioned path, checksum file (`.sha256`), and provenance (download URL or commit).
  * Keep a `models/README.md` describing each model’s intent and compatibility.
* **Tools & Engines**

  * Add `"engines": { "node": "22.5.1" }` to root `package.json`; enforce with `engine-strict` in `.npmrc`.
  * Record Python `3.x.y` in `VERSION_MATRIX.md` and enforce in CI image.

---

## ✅ Acceptance Criteria

* [ ] No floating versions in **any** config $JS/TS, Python, Docker, CI, models, system$.
* [ ] Lockfiles committed and verified by CI $`npm ci`/`pnpm install --frozen-lockfile`, `uv sync --frozen`$.
* [ ] All Docker/compose/k8s images use **tag+digest**.
* [ ] All GitHub Actions pinned to **commit SHAs**.
* [ ] “Pins linter” runs in CI and **fails** on violations.
* [ ] `docs/ops/VERSION_MATRIX.md` and `docs/ops/VERSIONING_POLICY.md` exist and are referenced from the repo root docs.
* [ ] Rollback procedure documented (how to revert a pin bump safely).

---

## 🧪 Suggested Automation $safe one-liners$

> These are guardrails. Use them to find offenders; don’t blindly apply.

* **Find semver ranges $JS/TS$:**

  ```bash
  jq -r '.dependencies + .devDependencies | to_entries[] | select(.value|test("^[~^]")) | "\(.key): \(.value)"' package.json
  ```
* **Detect `latest` & unpinned images:**

  ```bash
  rg -n 'FROM .*:latest|image: .*:latest|FROM [^@]+:[^@]+$' --glob '!node_modules'
  ```
* **Find unpinned GH Actions:**

  ```bash
  rg -n 'uses:\s+\S+@v\d+(\.\d+)?$' .github/workflows
  ```
* **Find apt installs without version:**

  ```bash
  rg -n 'apt(-get)?\s+install(?!.*=)' --glob '!node_modules'
  ```
* **Flag unqualified model names (Ollama et al.):**

  ```bash
  rg -n '\bollama (run|pull)\s+\w+(:\S+)?$' services | rg -v ':'
  ```

---

## 🗂️ Deliverables / Files to touch

* `docs/ops/VERSION_MATRIX.md` (new)
* `docs/ops/VERSIONING_POLICY.md` (new)
* `.github/workflows/*` $pin to SHAs + add check step$
* `Dockerfile`, `docker-compose.yml`, k8s manifests (digests)
* `package.json` $+ lockfile$ across services
* `pyproject.toml`, `uv.lock` across Python services
* Model manifests: `models/**/manifest.json`, checksums
* Pre-commit / CI linter: `scripts/ci/check-pins.js` (or `.py`)
* Makefile / `tools/build.hy`: add frozen installs and version guards

---

## Commit template

```
chore(versions): pin runtimes, deps, images, models; add pins linter

- Pin JS/TS deps to exact versions; commit lockfiles
- Lock Python with uv; commit uv.lock
- Pin Docker images to tag+digest
- Pin GitHub Actions to commit SHAs
- Add scripts/ci/check-pins and wire into CI
- Add docs/ops/VERSION_MATRIX.md + VERSIONING_POLICY.md
```

---

## 🔗 Related Epics

* \#ops
* \#codex-task

---

## ⛓️ Blocked By

* Nothing

## ⛓️ Blocks

* Reproducible CI/CD
* Deterministic perf testing
* Supply-chain controls

---

## ⚠️ Pitfalls & Guardrails

* **Digest drift**: when bumping a tag, always update the digest; never rely on tag alone.
* **Actions confusion**: tags can be force-moved; use SHAs and annotate with the tag in a comment.
* **Model ambiguity**: different quantizations ≠ same model; record quantization and build flags.
* **Local vs CI**: enforce engines; otherwise “works on my machine” syndrome returns.
* **Hidden installers**: scripts that call `pip install`/`npm i` at runtime undo reproducibility—purge them or freeze.

\#tags #promethean #versioning #pinning #ci #docker #uv #ollama #openvino #sre #supplychain

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 5
$$
#in-progress
$$
