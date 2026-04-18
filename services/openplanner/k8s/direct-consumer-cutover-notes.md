# OpenPlanner direct consumer cutover notes

## Status
Draft

## Purpose
Track which `services/*` consumers now default to the Kubernetes-backed OpenPlanner endpoint and which stacks still bundle their own OpenPlanner runtime.

## Canonical local consumer endpoint
For Docker/Compose consumers on this workstation, the canonical OpenPlanner URL is now:

```text
http://host.docker.internal:8080
```

Why this works now:

- the `kind` ingress ports are mapped on `0.0.0.0:8080` / `0.0.0.0:8443`
- the OpenPlanner ingress now includes a hostless rule
- Compose containers can reach the host through `host.docker.internal`
- the local `devel` kind cluster was recreated with the widened ingress listener so this is true for the current running cluster, not just future config

## Direct consumers updated to the k8s endpoint
These service wrappers now default to the Kubernetes-backed OpenPlanner ingress instead of the old host Compose port `7777`.

### Updated
- `services/mcp-stack/docker-compose.yml`
- `services/mcp-stack/ecosystem.container.config.cjs`
- `services/cephalon-stack/docker-compose.yml`
- `services/cephalon-stack/ecosystem.container.config.cjs`
- `services/opencode-stack/docker-compose.yml`
- `services/opencode-stack/ecosystem.container.config.cjs`
- `services/knoxx/docker-compose.yml`
- `services/knoxx/README.md`

## Verified local reachability
A throwaway Docker container was able to fetch:

```text
http://host.docker.internal:8080/v1/health
```

without a custom Host header, confirming that local Docker consumers can now reach the cluster-backed OpenPlanner runtime.

The OpenPlanner rollout continuity check also still passes after the ingress exposure change.

## Consumers not switched yet
These still package or assume an internal OpenPlanner service rather than consuming the new cluster-backed one.

### Bundled OpenPlanner stacks
- `services/radar-stack`
- `services/cephalon-hive`

These need a separate refactor path because they do not merely point at OpenPlanner; they embed or assume their own OpenPlanner runtime inside a larger stack.

## Recommended next moves
1. smoke-test `mcp-stack` against the new default endpoint
2. smoke-test `cephalon-stack` against the new default endpoint
3. smoke-test `opencode-stack` and `knoxx` against the new default endpoint
4. then break down `radar-stack` and `cephalon-hive` as bundle-separation work rather than simple URL rewrites
