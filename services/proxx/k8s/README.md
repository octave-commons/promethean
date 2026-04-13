# proxx k8s

Kubernetes manifests for the `services/proxx` runtime wrapper.

This is the cluster-backed replacement path for the local Compose Proxx stack.

## Layout

```text
services/proxx/k8s/
  README.md
  base/
  overlays/
    local-kind/
  bin/
    prepare-local-kind.sh
    local-kind-up.sh
    import-compose-postgres-to-k8s.sh
```

## Recommended local path

From the workspace root:

```bash
pnpm k8s:deps:check
pnpm k8s:kind:bootstrap
pnpm k8s:proxx:up
```

## Local addresses

- API: `http://127.0.0.1:8789`
- OAuth callback compatibility port: `http://127.0.0.1:1455`
- Web UI: `http://127.0.0.1:5174`
- Optional ingress host: `http://proxx.127.0.0.1.nip.io:8080`

The local kind cluster maps those host ports through NodePort services.

## Data migration

Import the existing Compose PostgreSQL data into the k8s PostgreSQL instance:

```bash
pnpm k8s:proxx:import:postgres
```

This uses the currently running Compose database container as the source and restores into the k8s PostgreSQL pod.

## Current scope

- PostgreSQL is migrated into k8s.
- Proxx API and web companion run from the container image in k8s.
- Runtime file data remains on a PVC mounted at `/app/data`.

## Known limitation

The host fleet dashboard path in Proxx expects direct Docker socket/runtime-repo access.
That feature is not carried forward in the local-kind k8s deployment yet.
The main proxy, auth, routing, and UI surfaces are the current migration target.

## Compose deprecation note

The Compose stack is now a legacy/bootstrap source for migration and fallback only.
The active local target should be the k8s path once data import is complete.