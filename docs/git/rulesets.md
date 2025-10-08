# Repository Rulesets — Enforcement Map

This doc enumerates the **active GitHub Repository Rulesets** and maps them onto our branching strategy. Use it alongside **docs/git/branching.md** (the intent) — this file is the **mechanics** (what is actually enforced by GitHub).

> Source of truth pulled via the GitHub API at generation time.

---

## Summary table

| Ruleset | Applies to | PR required | Required checks | Other rules |
```
|---|---|---|---|---|
```
| **release** | `~DEFAULT_BRANCH` (current default) | Yes | `build`, `test`, `lint` (strict) | Protects deletion, non-fast-forward; requires review threads resolved; merge-only |
| **dev** | `refs/heads/dev/*` | Yes | `build` (not strict on create) | Protects deletion, non-fast-forward; CodeQL; Copilot review enabled |
| **dev/staging** | `refs/heads/dev/staging` | Yes | `test`, `build` (strict) | Protects deletion, non-fast-forward; CodeQL |
| **Main branch guard (minimum)** | `refs/heads/main` | Yes | `Docs Guard` (strict) | — |
| **Duck Revival branch guard** | `refs/heads/docs/duck-revival` | Yes | `Docs Guard` (strict) | — |

---

## Detailed rules

### `release` (id: 8280204)
**Scope:** `~DEFAULT_BRANCH` (the repo default branch).

- PR gate: required.
- Required status checks (strict): **build**, **test**, **lint**.
- Review threads: **must be resolved**.
- Merge methods: **merge** only.
- Protected ops: no deletion; no non-fast-forward.
- Security: CodeQL scanning alerts ≥ high; errors block.
- Copilot code review: enabled on push.

### `dev` (id: 8095976)
**Scope:** `refs/heads/dev/*` (all dev workspaces).

- PR gate: required.
- Required status checks: **build** non-strict on branch creation.
- Review threads: not required to resolve.
- Merge methods: merge, squash, rebase allowed.
- Protected ops: no deletion; no non-fast-forward.
- Security: CodeQL scanning.
- Copilot code review: **enabled** auto-review on push.
- Bypass actors: repo role id=5 (admin) may bypass (always).

### `dev/staging` (id: 8280259)
**Scope:** `refs/heads/dev/staging`.

- PR gate: required.
- Required status checks (strict): **test**, **build**.
- Merge methods: merge, squash, rebase allowed.
- Protected ops: no deletion; no non-fast-forward.
- Security: CodeQL scanning.

### `Main branch guard (minimum)` (id: 8595943)
```
**Scope:** `refs/heads/main`.
```
- PR gate: required.
- Required status checks (strict): **Docs Guard**.
- Merge methods: merge, squash, rebase allowed.

### `Duck Revival branch guard` (id: 8595967)
**Scope:** `refs/heads/docs/duck-revival`.

- PR gate: required.
- Required status checks (strict): **Docs Guard**.
- Merge methods: merge, squash, rebase allowed.

---

## How rules apply to branch transitions

Use this with the flow in **docs/git/branching.md**. The table below lists common transitions and the rulesets that will participate.

| Transition | Rulesets that apply | Practical effect |
```
|---|---|---|
```
| `feature/* → dev/testing` | **dev** (wildcard) | PR required; **build** must pass; CodeQL runs; deletion/FF blocked. |
| `dev/testing → dev/staging` | **dev/staging** | PR required; **build** + **test** must pass (strict); CodeQL runs. |
| `dev/staging → main` | **release** (if default branch is `main`) **and** **Main branch guard** | All of: PR required; **build/test/lint** must pass; review threads resolved; plus **Docs Guard** must pass. |
| `docs/* → docs/duck-revival` | **Duck Revival branch guard** | PR required; **Docs Guard** must pass (ensures docs coupling). |

> Note: The `release` ruleset targets `~DEFAULT_BRANCH`. If the default branch is changed away from `main`, the `Main branch guard` continues to enforce Docs Guard on `main`, but `release` moves with the default branch.

---

## Gaps & planned tightenings

- Move `Main branch guard` to require at least 1 approving review and code owner review once CODEOWNERS lands.
- Consider making `dev/staging` squash-only to keep history tight.
- Add `Docs Guard` to `release` once we’re confident it won’t block urgent hotfixes.

---

**See also:** [Branching Strategy]./branching.md.
