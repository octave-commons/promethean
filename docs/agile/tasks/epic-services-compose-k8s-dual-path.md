# Epic: Services Compose + Kubernetes Dual Path

## Vision
Add a Kubernetes path for cluster-friendly workloads under `services/` without removing the existing Compose path that currently powers local development, host-coupled runtimes, and single-node operational wrappers.

Long term, `services/` should support a tiered runtime model:

- **Compose** for local development, host-bound workflows, and single-node wrappers
- **Kubernetes** for clusterable workloads that benefit from standardized deployment, service discovery, rollouts, and promotion
- **Shared platform glue** in `services/*` so source repos in `orgs/**` do not become the workspace runtime home

## Why now
The `services/` tree is no longer a small set of isolated Compose stacks. It now contains multiple multi-service runtimes, cross-stack networking, host PM2/container switching, host-mounted workspace flows, and production-adjacent deployment wrappers.

A Kubernetes path is now worth adding, but only as a second deployment surface. Several current stacks are not yet clean Kubernetes workloads and should remain Compose-first until they are refactored.

## Goals
1. Preserve the current Compose path for fast local iteration and host-coupled workflows.
2. Introduce a workspace-canonical Kubernetes layout under `services/*`.
3. Define readiness gates so only appropriate workloads move to Kubernetes.
4. Establish local cluster tooling for repeatable development and smoke tests.
5. Pilot the approach with one meaningful service instead of attempting a repo-wide migration.
6. Create a promotion path that can eventually support staging and production.

## Non-goals
- Replace every Compose stack.
- Force host-coupled dev shells into Kubernetes.
- Make generated Compose→Kubernetes output the long-term source of truth.
- Move all edge routing, TLS, and fleet operations into Kubernetes in the first phase.
- Introduce GitOps controllers before the deployment contract is stable.

## Scope
This epic covers runtime/deployment material that belongs in `services/*`, including:

- Kubernetes layout and conventions
- local cluster workflow
- pilot service selection
- migration readiness criteria
- shared platform dependencies for future services

This epic does **not** require immediate code migration for every service.

## Proposed delivery tracks

### Track 1 — Contract and platform bootstrap
- [x] Write the dual-path spec and service classification.
- [x] Create a shared `services/platform-k8s/` home for cluster bootstrap artifacts.
- [x] Choose local cluster tooling and a default manifest workflow.
- [x] Define base/overlay layout for per-service manifests.
- [ ] Define secrets, persistence, ingress, and promotion contracts.

### Track 2 — Low-risk Kubernetes smoke pilots
- [ ] Scaffold Kubernetes manifests for `services/voxx`.
- [ ] Scaffold Kubernetes manifests for `services/routussy`.
- [ ] Validate the local cluster workflow with simple single-service deployments.
- [ ] Capture the reusable manifest patterns extracted from those pilots.

### Track 3 — First meaningful pilot
- [x] Migrate `services/openplanner` to a maintained Kubernetes base + overlays layout.
- [x] Prove local-kind deployment, dependency wiring, persistence, and ingress.
- [x] Keep Compose and Kubernetes paths in parity for health checks and operator docs.

### Track 4 — Readiness refactors for complex stacks
- [ ] Break out service readiness blockers for `services/proxx`.
- [ ] Break out service readiness blockers for `services/radar-stack`.
- [ ] Identify which `services/*` homes should remain Compose-only for the foreseeable future.
- [ ] Separate deployable cluster services from host-coupled operator shells.

### Track 5 — Promotion and operations
- [ ] Define staging/prod overlay conventions.
- [ ] Define image build/publish flow for Kubernetes deployments.
- [ ] Add promotion automation only after pilot overlays are stable.
- [ ] Evaluate whether GitOps is warranted after the first successful pilots.

## Initial service classification

### Pilot now
- `services/voxx`
- `services/routussy`
- `services/openplanner`

### Refactor before Kubernetes
- `services/proxx`
- `services/radar-stack`
- `services/ollama-stack`
- `services/knoxx`

### Compose-first / host-coupled for now
- `services/opencode-stack`
- `services/mcp-stack`
- `services/cephalon-stack`
- `services/depenoxx`
- `services/our-gpus`
- `services/cephalon-hive`

## Success criteria
- A written dual-path contract exists for `services/*`.
- A local Kubernetes workflow exists and can deploy at least one meaningful service.
- `services/openplanner` has a maintained Kubernetes path without removing Compose.
- New services have a clear decision rule: Compose-only, Kubernetes-ready, or refactor-first.
- Platform conventions exist for ingress, config, secrets, and persistence.

## Spec
Primary design document: [`docs/reference/services-compose-k8s-dual-path-spec.md`](../reference/services-compose-k8s-dual-path-spec.md)

## Notes
- Compose remains the fast inner loop.
- Kubernetes is an additional deployment target, not a moral upgrade.
- The right first win is a stable pilot, not a blanket migration.
- Phase 1 bootstrap now includes `services/platform-k8s/` plus root scripts for installing/checking the local toolchain and bootstrapping a `kind` cluster.
