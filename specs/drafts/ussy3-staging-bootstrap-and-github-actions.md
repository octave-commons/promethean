# ussy3 staging bootstrap + GitHub Actions deploy gates

## Status
Draft

## Summary
Bootstrap a staging deployment for `orgs/open-hax/proxx` on `error@ussy3.promethean.rest`, then add GitHub Actions workflows that enforce a staging-first promotion model:

- merges into `staging`
  - must pass unit tests + typecheck
  - then deploy to `ussy3.promethean.rest`
  - then run the full live e2e suite against staging
- PRs into `main`
  - must pass linting/typecheck/tests/builds
  - must prove the candidate commit already deployed successfully to staging
  - if no successful staging deployment exists for that commit, merge is blocked
- merges into `main`
  - deploy to `error@ussy.promethean.rest`
  - verify production health after deploy

## Current state
- Production deployment exists and is operational on `ussy.promethean.rest`, but was established manually.
- Repo now has prepared project-local deployment/CI assets for staging + production automation:
  - `.github/workflows/staging-pr.yml`
  - `.github/workflows/deploy-staging.yml`
  - `.github/workflows/main-pr-gate.yml`
  - `.github/workflows/deploy-production.yml`
  - `scripts/ci-lint.sh`
  - `scripts/deploy-remote.sh`
  - `deploy/docker-compose.ssl.yml`
  - `deploy/Caddyfile.template`
- Existing live validation scripts are:
  - `scripts/e2e-test.sh` — broad provider/live route exercise, still environment-sensitive
  - `scripts/e2e-multitenancy-smoke.sh` — focused tenant-policy + tenant-key smoke, green locally against a live DB-backed instance
- Current local SSH access state:
  - `ssh error@ussy.promethean.rest` works
  - `ssh error@ussy3.promethean.rest` now works and was used to bootstrap the staging host
- `ussy3.promethean.rest` now serves the staging proxy over HTTPS and the API health endpoint is live.
- Remaining CI hardening includes removing Node 20-based GitHub Action runtimes before GitHub's June 2026 Node 24 cutoff affects `checkout`, `setup-node`, and the SSH bootstrap path.
- Production automation also has to account for the existing hand-built `ussy.promethean.rest` compose project name (`open-hax-openai-proxy`) and intermittent GitHub-runner DNS failures for that hostname.

## Goals
1. Get a staging instance running on `ussy3.promethean.rest`.
2. Make staging deploy reproducible from repository automation.
3. Make `main` promotion depend on a prior successful staging deployment for the same commit.
4. Make production deploy reproducible from repository automation.

## Non-goals
- Replacing the current production runtime topology with a completely different platform.
- Secret rotation strategy beyond wiring deploy-time secrets into Actions.
- Full branch-protection configuration via API (repo settings still need a human to require the checks, unless a separate admin automation exists).

## Risks
- Staging bootstrap is complete; remaining work is to wire the new staging host into the repository automation and branch protection.
- The broad live e2e suite is provider/environment sensitive; gating on it requires either a stable staging runtime or a more deterministic suite.
- GitHub-hosted runners need deploy secrets and SSH keys that are not currently stored in the repo.
- Staging/prod drift is likely if runtime files remain hand-managed outside the repo.
- GitHub runner deprecation windows can break otherwise healthy workflows if core JavaScript actions are left on Node 20-era major versions.
- Production verification can fail even after a healthy deploy if a GitHub-hosted runner cannot resolve `ussy.promethean.rest`; workflow verification should support an explicit IP resolve override while still validating the public hostname and TLS endpoint.

## Open questions
1. What exact runtime path should staging use on the remote host? Proposed: `~/devel/services/proxx-staging`.
2. Should staging use TLS on `ussy3.promethean.rest` immediately? Proposed: yes, mirror production via a dedicated Caddy overlay.
3. Which check name should gate `main` PRs? Proposed: a dedicated `staging-promotion-gate` job that verifies successful staging deploy + live e2e on the PR head SHA.
4. How should secrets be supplied in Actions? Proposed minimum:
   - `STAGING_SSH_PRIVATE_KEY`
   - `STAGING_PROXY_AUTH_TOKEN`
   - `STAGING_ENV_FILE`
   - optional `STAGING_MODELS_JSON`
   - `PRODUCTION_SSH_PRIVATE_KEY`
   - `PRODUCTION_PROXY_AUTH_TOKEN`

## Phases

### Phase 1: Remote access + staging bootstrap
- Confirm remote runtime continuity and codify deploy automation for `error@ussy3.promethean.rest`.
- Create remote runtime directories.
- Sync deployable runtime files.
- Start staging compose stack.
- Verify health.

### Phase 2: Repository deploy scripts
- Add repo-local deploy scripts that can sync files and restart remote staging/prod safely.
- Add repo-local validation scripts suitable for CI.

### Phase 3: GitHub Actions
- Add `staging` PR checks.
- Add `staging` branch deploy workflow.
- Add `main` PR gate workflow.
- Add `main` branch production deploy workflow.

### Phase 4: Documentation + verification
- Document required GitHub secrets and required branch-protection checks.
- Record the staging/prod promotion contract in repo docs/specs.

## Immediate blocker
`error@ussy3.promethean.rest` is reachable with the current local SSH key and now hosts the staging deployment.

Evidence gathered:
- `ssh error@ussy.promethean.rest` succeeds.
- `ssh error@ussy3.promethean.rest` now works and was used to bootstrap the staging host.
- `https://ussy3.promethean.rest/health` now answers successfully with the staging auth token.

## Required repository secrets / vars
### Staging secrets
- `STAGING_SSH_PRIVATE_KEY`
- `STAGING_ENV_FILE`
- `STAGING_PROXY_AUTH_TOKEN`
- optional `STAGING_MODELS_JSON`

### Production secrets
- `PRODUCTION_SSH_PRIVATE_KEY`
- `PRODUCTION_PROXY_AUTH_TOKEN`

### Recommended repo/environment vars
- `STAGING_SSH_HOST` = `104.130.31.144` for SSH transport to the staging box
- `STAGING_SSH_USER` = `error`
- `STAGING_DEPLOY_PATH` = `~/devel/services/proxx-staging`
- `STAGING_COMPOSE_PROJECT_NAME` = `proxx-staging`
- `STAGING_PUBLIC_HOST` = `ussy3.promethean.rest`
- `STAGING_BASE_URL` = `https://ussy3.promethean.rest`
- `STAGING_SOURCE_SSH_HOST` = `104.130.31.129`
- `STAGING_SOURCE_SSH_USER` = `error`
- `STAGING_SOURCE_DEPLOY_PATH` = `~/devel/services/proxx`
- `STAGING_SOURCE_COMPOSE_PROJECT_NAME` = `open-hax-openai-proxy`
- `PRODUCTION_SSH_HOST` = `104.130.31.129`
- `PRODUCTION_SSH_USER` = `error`
- `PRODUCTION_DEPLOY_PATH` = `~/devel/services/proxx`
- `PRODUCTION_COMPOSE_PROJECT_NAME` = `open-hax-openai-proxy`
- `PRODUCTION_PUBLIC_HOST` = `ussy.promethean.rest`
- `PRODUCTION_BASE_URL` = `https://ussy.promethean.rest`
- `PRODUCTION_VERIFY_RESOLVE_ADDRESS` = `104.130.31.129` when GitHub-hosted runners cannot resolve `ussy.promethean.rest`

## Required branch-protection checks
### `staging`
- `staging-typecheck`
- `staging-unit-tests`

### `main`
- `main-lint`
- `main-typecheck`
- `main-unit-tests`
- `main-build`
- `main-web-build`
- `staging-promotion-gate`
