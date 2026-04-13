# platform-k8s

Shared Kubernetes bootstrap home for the `services/*` dual-path runtime contract.

This directory is the workspace-local platform home for the first Kubernetes wave.
It does **not** replace the existing Compose path. It provides the common local-cluster toolchain, kind bootstrap config, and shared conventions that per-service `k8s/` manifests will build on.

## Current scope

Phase 1 focuses on the local development dependency chain:

- `kubectl`
- `kind`
- `skaffold`
- `helm`

Helm is included in the workstation toolchain even though the current manifest default for first-party services remains Kustomize.

## Layout

```text
services/platform-k8s/
  README.md
  bin/
    check-local-toolchain.sh
    install-local-toolchain.sh
    bootstrap-kind.sh
  kind/
    cluster.yaml
```

## Local setup

From the workspace root:

```bash
pnpm k8s:deps:install
pnpm k8s:deps:check
pnpm k8s:kind:bootstrap
```

These scripts install binaries into `~/.local/bin`, which is already on the path on this workstation.

## What `bootstrap-kind` does

- creates a local `kind` cluster named `devel`
- uses `services/platform-k8s/kind/cluster.yaml`
- enables host port mappings on `0.0.0.0:8080`, `0.0.0.0:8443`, `0.0.0.0:8789`, `127.0.0.1:1455`, and `0.0.0.0:5174`
- labels the control-plane node as ingress-ready for future ingress-nginx use

By default it also installs the official ingress-nginx manifest for kind so later service pilots can use an Ingress surface without reworking the cluster bootstrap.

Because the ingress and mapped service ports now listen on the host, other local Docker/Compose containers can reach cluster-backed services through:

- `http://host.docker.internal:8080` for OpenPlanner ingress
- `http://host.docker.internal:8789` for Proxx API
- `http://host.docker.internal:5174` for Proxx web UI

## Why Helm is installed even though Kustomize is the default

- Kustomize remains the canonical first-party manifest layout for this workspace.
- Helm is still worth having because many third-party Kubernetes dependencies ship primarily as charts.
- Having Helm installed keeps the local platform toolchain complete and avoids reworking the bootstrap later when a chart-backed dependency appears.

## Notes

- Compose remains the default inner loop for host-coupled stacks.
- This directory is shared platform glue, not the canonical home for any one service's manifests.
- Per-service Kubernetes manifests should live under `services/<name>/k8s/`.
