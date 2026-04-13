# Cloud Deployment

## Status
Draft

## Summary
Make Open Hax Proxy cloud-ready for durable hosted environments (starting with Render-like deployment targets, then extensible to other platforms) with clear operational contracts around persistence, secrets, networking, callbacks, and observability.

This is a focused companion to `specs/drafts/open-hax-openai-proxy-multitenancy-user-model.md`; hosted deployment constraints are a prerequisite for making multi-tenant and federated operation trustworthy.

## Current state
Already present:
- Dockerfile and docker-compose runtime
- Postgres-backed credentials/config for local parity with hosted deployments
- environment-driven configuration
- Render-aware notes in `README.md`

Still cloud-fragile:
- some state remains file-backed (`data/request-logs.jsonl`, session history, prompt affinity, proxy settings fallback)
- OAuth callback/base URL handling is primarily local/dev oriented
- no formal deployment blueprint/spec for staging/prod
- no documented externalization strategy for Chroma/session/search components

## Goals
- Stateless or mostly-stateless app containers.
- Durable managed Postgres as the primary system of record.
- Explicit treatment of request-log/session/analytics persistence.
- Clean secret management and environment contract.
- Repeatable deployment blueprint for staging/prod.
- Health/readiness/migration discipline suitable for hosted rollouts.

## Open questions
- Target platforms: Render first only, or also Fly/K8s/etc.? Proposed v1: Render-first with portable container contract.
- Keep file-backed request/session stores in production, or move all durable state to DB/object storage? Proposed v1: move primary state to DB; object storage optional for larger artifacts.
- Should Chroma remain external optional infrastructure or be replaced by SQL/native search for hosted simplicity? Open.

## Risks
- File-backed state on ephemeral disks will silently disappear during restarts/redeploys.
- OAuth redirect/callback correctness depends on stable public base URLs and trusted proxy headers.
- Federation and multi-tenancy will increase deployment complexity if baseline cloud contracts stay implicit.

## Implementation phases

### Phase 1: Hosted deployment contract
- Document required env vars for hosted deployment.
- Define canonical public base URL handling and callback construction.
- Add deployment-mode assumptions to README/specs.

### Phase 2: Durable state externalization
- Move request logs / sessions / prompt affinity / settings to DB or another durable backend.
- Reduce or eliminate required writable local disk.
- Make startup resilient to missing local files.

### Phase 3: Operational readiness
- Ensure migrations run predictably.
- Strengthen health/readiness checks.
- Define backup/restore expectations for DB-backed runtime state.
- Clarify OTEL/log shipping expectations.

### Phase 4: Platform blueprint
- Add deployment blueprint(s), starting with Render.
- Capture service topology: web/API container, Postgres, optional Chroma, secret/env wiring.
- Define staging/prod promotion flow.

### Phase 5: Verification
- Verify deploy from clean environment with only env + DB + secrets.
- Verify restart/redeploy does not lose critical runtime state.
- Verify OAuth/browser console works behind hosted URLs.

## Affected areas
- `README.md`
- `Dockerfile`
- `docker-compose.yml`
- persistence stores currently falling back to files
- OAuth base URL/callback handling
- deployment manifests/blueprints

## Definition of done
- The proxy can run in a hosted environment without relying on fragile local disk state.
- Deployment steps and required infrastructure are documented and reproducible.
- Hosted runtime behavior matches local expectations closely enough for confident iteration.
