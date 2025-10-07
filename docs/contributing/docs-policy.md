# Documentation Policy (All Packages)

Every package must be tied to documentation. Changes to package source **must** include a docs update (or an explicit bypass label).

## How it works
- A GitHub Action `docs-guard.yml` runs on every PR.
- If files under `packages/<slug>/src/**` change (excluding tests), the action checks for a docs change in one of these locations (first match wins):
  - `docs/packages/<slug>/**`
  - `docs/services/<slug>/**`
  - `docs/libraries/<slug>/**`
  - `docs/apps/<slug>/**`
- If no docs changed, the check **fails**.

## Bypass (rare)
- Maintainers can apply the `skip-docs` label to the PR to bypass the guard (e.g., refactors with no externally visible changes).

## Recommended structure per package
- `README.md` – high-level overview what/why.
- `API.md` – public surface, examples.
- `DIAGRAMS.md` – Mermaid diagrams where helpful.

## Quickstart for new packages
1. Create folder: `docs/packages/<slug>/`
2. Add `README.md` with an "Overview" and "API" skeleton.
3. Link to it from the package README or `package.json` `homepage`.

## CI Details
- Workflow: `.github/workflows/docs-guard.yml`
- Tooling: `@promethean/kanban` CLI subcommand `doccheck`

## Philosophy
Docs are part of the contract. If it’s worth changing in `src/`, it’s worth mentioning in docs.
