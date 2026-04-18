# Contributing to Proxx

Thanks for contributing.

This repository uses a **staging-first promotion flow**. The most important rule is simple:

- **Normal work lands in `staging` first.**
- **`main` only accepts promotion PRs from the canonical `staging` branch.**
- **Do not open feature, fix, or experimental PRs directly against `main`.**

## Branch and PR policy

### Normal changes
For features, fixes, refactors, docs, and workflow changes:

1. Branch from `staging`
2. Open your PR against `staging`
3. Merge into `staging`
4. Let the staging deploy + live validation run
5. Promote `staging` into `main` with a dedicated promotion PR

### Promotion to main
The only allowed PR shape into `main` is:

- base: `main`
- head: the canonical `open-hax/proxx:staging` branch

If a PR targets `main` from any other branch, it is out of policy and may be automatically retargeted back to `staging`.

## Local setup

```bash
pnpm install
cp .env.example .env
cp keys.example.json keys.json
cp models.example.json models.json
```

Then configure real credentials through one of:

- `keys.json`
- `PROXY_KEYS_JSON` / `UPSTREAM_KEYS_JSON`
- SQL-backed runtime state via `DATABASE_URL`

Unless you are explicitly doing local unauthenticated debugging, set:

```bash
PROXY_AUTH_TOKEN=...
```

## Useful local commands

### Core development
```bash
pnpm run typecheck
pnpm test
pnpm run build
pnpm run web:build
```

### Local runtime
```bash
pnpm dev
pnpm web:dev
```

### Lint / workflow checks
```bash
./scripts/ci-lint.sh
actionlint .github/workflows/*.yml
```

### Live / environment-sensitive checks
These hit a real running proxy and are usually most relevant for deploy, auth, tenancy, routing, or end-to-end changes:

```bash
./scripts/e2e-test.sh
./scripts/e2e-multitenancy-smoke.sh
```

## What CI expects

### PRs into `staging`
Lightweight PR gate:

- `staging-typecheck`
- `staging-unit-tests`

### Pushes to `staging`
Promotion-prep and live validation:

- `staging-preflight`
- `deploy-staging`
- `staging-live-e2e`

### PRs into `main`
Only valid for canonical `staging -> main` promotion PRs. These run the heavier gate:

- `main-lint`
- `main-typecheck`
- `main-unit-tests`
- `main-build`
- `main-web-build`
- `staging-promotion-gate`

### Pushes to `main`
Production deployment path:

- `production-preflight`
- `deploy-production`
- `verify-production`

## Contributor checklist

Before opening a PR to `staging`, try to ensure:

- the branch was created from current `staging`
- `pnpm run typecheck` passes
- `pnpm test` passes
- docs are updated if behavior changed
- no secrets were committed
- workflow changes were checked with `actionlint`
- deploy/runtime changes include the smallest realistic verification path

## Workflow changes

If you change anything under `.github/workflows/`:

- keep the `staging -> main` promotion contract intact
- prefer safe metadata-only automation for PR retargeting/policy
- do **not** check out untrusted fork code from `pull_request_target`
- validate with `actionlint`

## Secrets and credentials

Never commit:

- API keys
- OAuth tokens
- SSH private keys
- session secrets
- production/staging env files

Use GitHub Actions secrets, local ignored files, or runtime environment variables instead.

## Notes on scope

Prefer small, atomic PRs. If a change affects routing, auth, tenancy, deployments, or CI policy, say so clearly in the PR description and include the exact commands or checks you used to verify it.
