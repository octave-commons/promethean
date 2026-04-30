# Services Compose + Kubernetes dual-path spec

## Status
Draft

## Summary
Adopt a dual-path runtime contract for `services/*`:

- keep **Docker Compose** as the default local development and host-coupled runtime surface
- add a **Kubernetes** path for services that are sufficiently decoupled from the workstation and benefit from cluster deployment semantics
- keep the canonical deployment/runtime home in `services/*`, not in upstream source repos under `orgs/**`

This spec defines the first platform contract, service readiness gates, pilot order, and implementation phases.

## Problem statement
The current `services/` tree has outgrown the “small number of simple Compose stacks” stage.

A repository audit of real Compose surfaces under `services/` found:

- **20** real Compose files after collapsing the `services/open-hax-openai-proxy -> services/proxx` symlink
- **13** service homes with Compose runtime surfaces
- **70** service definitions
- about **60** host-like bind mounts
- **23** services using `host.docker.internal` / host gateway patterns
- **18** services exposing host-bound ports
- **10** Compose files depending on external Docker networks
- **3** services mounting `docker.sock`
- **36** services using `depends_on`
- **33** services with healthchecks
- **11** services using Compose profiles

That complexity is real, but it does **not** imply every stack should move to Kubernetes. It implies we need a clearer contract for which services are:

1. clusterable workloads
2. host-coupled development shells
3. operational bundles that need decomposition before they can be clusterized

## Reviewed internal sources
- `config/docker-stacks.json`
- `scripts/docker-stack.mjs`
- `services/mcp-stack/docker-compose.yml`
- `services/opencode-stack/docker-compose.yml`
- `services/proxx/docker-compose.yml`
- `services/openplanner/docker-compose.yml`
- `services/radar-stack/docker-compose.yml`
- `services/ollama-stack/docker-compose.yml`
- `services/cephalon-stack/docker-compose.yml`
- `services/voxx/compose.yaml`
- `services/routussy/docker-compose.yml`
- `services/depenoxx/docker-compose.yml`
- `services/*/README.md` for the current stack wrappers

## Reviewed external references
- Docker Docs — Use Compose in production
- Docker Docs — Compose Bridge overview
- Docker Docs — `docker compose bridge` CLI reference
- Kubernetes Docs — Declarative management of objects using Kustomize
- Kubernetes Docs — Translate a Docker Compose file to Kubernetes resources
- Kompose conversion matrix
- Skaffold deployer documentation
- kind project docs

## Goals
1. Preserve the existing Compose path for fast local workflows.
2. Create a canonical Kubernetes layout under `services/*`.
3. Make Kubernetes opt-in per service, based on readiness criteria.
4. Avoid repo-wide migration churn.
5. Produce one meaningful pilot that proves the workflow.
6. Enable later staging/prod overlays without forcing immediate GitOps adoption.

## Non-goals
- Replacing Compose everywhere.
- Treating Kubernetes as the only “real” runtime path.
- Making Kompose or generated bridge output the source of truth.
- Moving host PM2 switching, workspace shells, and editor-coupled stacks into Kubernetes immediately.
- Solving fleet-wide TLS, DNS, and ingress migration in the first wave.

## Architectural decisions

### 1. `services/*` remains the canonical runtime/deployment home
The existing workspace placement contract already makes `services/*` the runtime/devops home. The Kubernetes path will follow that contract.

Per-service manifests should live under the corresponding service wrapper, not under `orgs/**` source repos.

Example:

```text
services/openplanner/
  docker-compose.yml
  k8s/
    base/
    overlays/
      local-kind/
      staging/
      prod/
```

### 2. Compose remains canonical for the local inner loop
Compose stays the default when a service depends on one or more of the following:

- full workspace bind mounts
- host XDG/config/state mounts
- host PM2 switching
- direct editor or workstation integration
- `docker.sock`
- ad hoc host-gateway wiring that has not yet been abstracted

The existence of a Kubernetes path must not delete or degrade the Compose path for those workflows.

### 3. Kubernetes is for clusterable workloads, not workstation shells
A service is a Kubernetes candidate when it can run from an image with explicit config, explicit persistence, explicit networking, and no dependence on a live host checkout.

Kubernetes should be used where it buys us:

- service discovery
- rollout and restart semantics
- resource controls
- repeatable environment overlays
- eventual staging/prod promotion

### 4. Canonical manifest shape: Kustomize base + overlays
Per-service Kubernetes manifests will use **Kustomize** as the canonical layout:

```text
k8s/
  base/
    deployment.yaml
    service.yaml
    configmap.yaml
    pvc.yaml
    kustomization.yaml
  overlays/
    local-kind/
      kustomization.yaml
      patches-*.yaml
    staging/
      kustomization.yaml
      patches-*.yaml
    prod/
      kustomization.yaml
      patches-*.yaml
```

Rationale:

- bases/overlays map well to the workspace’s dev/staging/prod intent
- Kustomize keeps first-party manifests readable and patchable
- it works directly with `kubectl apply -k`
- it composes cleanly with Flux later if GitOps becomes worthwhile

### 5. Local cluster workflow: kind + Skaffold
The initial local Kubernetes toolchain is:

- **kind** for the local cluster
- **Skaffold** for image build/render/deploy/status loops
- **kubectl + Kustomize** as the baseline no-magic path

Rationale:

- kind aligns with the current Docker-heavy workstation environment
- Skaffold provides a workable dev/test loop without turning manifests into a hand-run script pile
- `kubectl apply -k` remains the minimal fallback path

### 6. Helm is optional, not default
Helm will be used only when it is genuinely the better packaging format, such as:

- third-party infrastructure installs
- reusable platform bundles shared across many services
- cases where chart distribution and values management are materially better than overlays

For first-party service manifests, the default remains Kustomize.

### 7. Compose Bridge / Kompose are bootstrap tools only
`docker compose bridge convert` and Kompose may be used to generate an initial starting point for a service, but the generated output must not become the long-term source of truth without curation.

Reasons:

- the current Compose surface relies heavily on patterns with poor or incomplete 1:1 translation (`depends_on`, `extra_hosts`, network aliases, external networks, docker socket mounts, workspace bind mounts)
- generated output is useful for acceleration, not for preserving architectural intent

### 8. Preserve existing host edge first
The initial Kubernetes path should **not** require moving the whole current edge stack into Kubernetes.

Phase 1 should assume:

- existing host-level edge/routing remains in place
- the cluster is introduced behind that edge where useful
- ingress migration is incremental, not a prerequisite

This avoids mixing “service migration” with “edge replacement” before the runtime model settles.

### 9. Secrets and config must become explicit
Kubernetes-targeted services must move toward an explicit config contract:

- environment variables documented in the service wrapper
- non-secret config in ConfigMaps or generated env config
- secrets in Kubernetes Secret resources at first, with a later path to External Secrets or a preferred secret manager if warranted

We should not carry forward implicit host file assumptions as hidden cluster dependencies.

### 10. Persistence must stop being accidental
Each Kubernetes-targeted service must explicitly classify its data as one of:

- stateless
- ephemeral cache
- durable PVC-backed data
- external managed dependency

Host-path persistence from Compose is not an acceptable long-term cluster default.

## Service classification

### Tier A — Pilot immediately
These are the best first candidates for proving the workflow.

#### `services/voxx`
Why:
- single primary service
- simple healthcheck
- named volume instead of deep host coupling
- clear port surface

Goal:
- use as a smoke-test pilot for base/overlay layout and Skaffold flow

#### `services/routussy`
Why:
- single primary service
- simple persistence model
- limited dependency surface

Goal:
- use as a second smoke-test pilot to validate repeatability across simple services

#### `services/openplanner`
Why:
- meaningful multi-component service
- already has clear health endpoints
- explicit storage directories
- optional dependency profile split
- represents a realistic app rather than a toy pilot

Goal:
- become the first maintained Kubernetes path with local-kind, staging, and prod overlays

### Tier B — Refactor before Kubernetes
These can move later, but only after design cleanup.

#### `services/proxx`
Blockers:
- `docker.sock` mount
- external Docker network reliance
- external named Postgres volume reuse
- host-oriented runtime assumptions
- multiple special-purpose compose variants

Needed before migration:
- separate cluster-safe runtime from host-fleet introspection features
- define secret and persistence contracts
- remove implicit local-only networking assumptions

#### `services/radar-stack`
Blockers:
- 10-service bundle in one stack
- multiple workspace bind mounts
- external network reliance
- mixed concerns across app, agent, vector store, MCP, and crawler surfaces

Needed before migration:
- split deployable workloads from dev/operator bundles
- define clear service boundaries and dependency ownership
- decide which components should remain external dependencies instead of bundled in one cluster app

#### `services/ollama-stack`
Blockers:
- GPU runtime assumptions
- host-specific model store mount
- node placement and GPU scheduling not yet specified

Needed before migration:
- GPU node policy
- storage policy for models
- operational contract for scheduling and upgrades

#### `services/knoxx`
Blockers:
- workspace bind dependence
- larger multi-service shape
- several host/gateway assumptions

Needed before migration:
- separate clusterable services from workspace-bound tooling

### Tier C — Compose-first / hold
These should remain Compose-first for now.

#### `services/opencode-stack`
Reasons:
- intentionally mounts the live workspace
- intentionally mounts host XDG config/data/cache/state
- behaves like a controlled dev shell/runtime wrapper

#### `services/mcp-stack`
Reasons:
- intentionally bundles many PM2-managed processes in one workspace-bound container
- large local integration surface
- better treated as a host-coupled tool runtime for now

#### `services/cephalon-stack`
Reasons:
- current shape is still workspace-bound and operationally coupled to local services

#### `services/depenoxx`
Reasons:
- explicit workspace bind mount and host-gateway assumptions

#### `services/our-gpus`
Reasons:
- hardware/special-ops surface, not a first-wave generic cluster service

#### `services/cephalon-hive`
Reasons:
- mixed operational bundle, not yet a clean cluster service boundary

## Kubernetes readiness gate
A service must satisfy the following before it is considered ready for a maintained Kubernetes path.

### Required
1. **Image-owned runtime**
   - no requirement for a live host checkout
2. **Explicit health endpoints**
   - readiness and liveness semantics are documented
3. **Explicit config contract**
   - env vars and files are documented
4. **Explicit persistence contract**
   - PVC, ephemeral, or external dependency is declared
5. **Explicit network contract**
   - no dependence on ad hoc Compose-only aliases or host-gateway tricks
6. **Secrets plan**
   - no hidden local files required for normal runtime
7. **Resource envelope**
   - baseline CPU/memory requests and limits can be declared

### Strongly preferred
1. No full-workspace bind mount
2. No `docker.sock`
3. No `host.docker.internal`
4. No reuse of opaque external named Docker volumes
5. Clear split between app container and local operator conveniences

If a service fails the required gate, it stays Compose-first.

## Target repository layout

### Shared platform home
```text
services/platform-k8s/
  README.md
  kind/
    cluster.yaml
  skaffold/
    skaffold.base.yaml
  ingress/
  storage/
  secrets/
  observability/
```

Purpose:
- cluster bootstrap
- shared overlays/helpers
- platform components used by multiple services

### Per-service layout
```text
services/<name>/
  README.md
  docker-compose.yml
  k8s/
    README.md
    base/
    overlays/
      local-kind/
      staging/
      prod/
```

## Delivery phases

### Phase 0 — Contract and classification
Deliverables:
- this spec
- a service tier map
- readiness gate checklist
- naming/layout conventions

Acceptance:
- every `services/*` runtime surface can be assigned to pilot, refactor-first, or hold
- the repo has a clear answer to “where do k8s manifests live?”

### Phase 1 — Platform bootstrap
Deliverables:
- `services/platform-k8s/`
- kind cluster config
- baseline Skaffold config
- base docs for local deploy/apply workflow

Acceptance:
- a developer can create the cluster and deploy at least one workload using documented commands

### Phase 2 — Smoke-test pilots
Deliverables:
- `services/voxx/k8s/**`
- `services/routussy/k8s/**`
- documented local-kind overlay behavior

Acceptance:
- both services deploy locally via Kubernetes
- Compose remains usable
- health checks pass for both paths

### Phase 3 — First meaningful pilot
Deliverables:
- `services/openplanner/k8s/base`
- `services/openplanner/k8s/overlays/local-kind`
- initial staging/prod overlay scaffolding
- operator README updates

Acceptance:
- OpenPlanner runs in kind with its dependency contract documented
- persistence and config are explicit
- Compose and k8s paths are both documented and intentionally supported

### Phase 4 — Shared dependency strategy
Deliverables:
- decision records for ingress, secrets, persistence, and dependency hosting
- shared patterns for Postgres/Redis/Chroma/Mongo where needed

Acceptance:
- complex services have a standard way to express dependencies instead of inventing per-stack rules

### Phase 5 — Refactor candidates
Deliverables:
- readiness breakouts for `proxx`, `radar-stack`, and other tier-B services
- decomposition notes where one Compose stack hides multiple eventual workloads

Acceptance:
- each complex service has a concrete path to either clusterability or long-term Compose-only status

### Phase 6 — Promotion workflow
Deliverables:
- staging/prod overlay contract
- image publishing contract
- optional GitOps evaluation

Acceptance:
- at least one service can move from local-kind conventions to real promoted overlays without redesigning the manifest model

## Local workflow contract
The baseline local workflow for Kubernetes-targeted services should be:

1. build image
2. load/publish image into the local cluster
3. render manifests
4. deploy overlay
5. wait for readiness
6. run smoke checks

A service is not “done” on Kubernetes until its README documents:

- local-kind apply path
- health check commands
- persistence notes
- config/secrets expectations
- rollback or fallback to Compose

## Acceptance criteria for the epic
1. A dual-path spec exists and is committed.
2. The workspace has a shared `services/platform-k8s/` contract.
3. At least one meaningful service (`openplanner`) has a maintained Kubernetes path.
4. Compose remains the supported path for services that are intentionally host-coupled.
5. New services can be classified early instead of defaulting into accidental complexity.

## Risks
- We may over-apply Kubernetes to services that are really local operator shells.
- We may under-spec secrets and persistence, creating fragile pseudo-cluster deployments.
- GPU and host-fleet workloads may tempt us into premature platform complexity.
- If we move edge and service migration together, scope could explode.

## Countermeasures
- enforce the readiness gate before adopting a maintained k8s path
- keep Compose as a first-class surface
- use smoke-test pilots first
- treat generation tools as scaffolding, not truth
- delay GitOps until at least one meaningful service proves the base/overlay model

## Open questions
1. Which ingress controller should be the shared default for the cluster path, if any, in phase 1?
2. Should cluster secrets stay as plain Kubernetes Secrets initially or go straight to an external secret manager?
3. For services that currently rely on local Proxx/Ollama, should early Kubernetes pilots depend on external host services or internal cluster services?
4. Do we want one shared development cluster for all pilots, or per-pilot clusters/configs?

## Immediate next move
Use `services/openplanner` as the first meaningful pilot, while `services/voxx` and `services/routussy` serve as low-risk smoke-test scaffolds.
