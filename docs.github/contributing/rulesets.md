# Rulesets (Repo)

This repo enforces rules at two layers:

1. **GitHub Rulesets** — branch protections via API
2. **Code Rulesets** — ESLint (flat config), AVA, Prettier, EditorConfig

## GitHub Rulesets
Created via API for:
- `refs/heads/main` — requires PRs and the `Docs Guard` status check.
- `refs/heads/docs/duck-revival` — same as above.

> Future: add stricter review counts and CODEOWNERS once owners are finalized.

## Code Rulesets
- `eslint.config.mjs` — ESM flat config with TypeScript and functional-style nudges.
- `ava.config.mjs` — Node ESM test runner setup.
- `.editorconfig` — line endings/indentation.
- `.prettierrc.json` — minimal formatting defaults.

## PR Template
- `.github/pull_request_template.md` — checklist includes docs/diagrams requirement.

## Policy
- See `docs/contributing/docs-policy.md` for mandatory docs coupling.
