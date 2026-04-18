# openplanner k8s

Kubernetes manifests for the `services/openplanner` runtime wrapper.

This is the first meaningful pilot for the workspace `services/*` dual-path runtime:

- **Compose** remains the primary local inner loop
- **Kubernetes** is added as a second deployment surface

## Layout

```text
services/openplanner/k8s/
  README.md
  base/
  overlays/
    local-kind/
    local-kind-mongodb/
  bin/
    prepare-local-kind.sh
    local-kind-up.sh
    prepare-local-kind-mongodb.sh
    local-kind-mongodb-up.sh
```

## Local kind flow

From the workspace root, the recommended active path is now the MongoDB overlay:

```bash
pnpm k8s:deps:check
pnpm k8s:kind:bootstrap
pnpm k8s:openplanner:up
```

Or directly:

```bash
bash services/openplanner/k8s/bin/local-kind-up.sh
```

MongoDB-backed rolling-update candidate:

```bash
bash services/openplanner/k8s/bin/local-kind-mongodb-up.sh
```

Status and continuity verification:

```bash
bash services/openplanner/k8s/bin/status.sh
bash services/openplanner/k8s/bin/verify-rolling-update.sh
```

Legacy lake import handoff script:

```bash
pnpm k8s:openplanner:import:legacy-lake -- --dry-run
```

Storage cleanup / next-step plan:

- `services/openplanner/k8s/blob-job-storage-externalization.md`
- `services/openplanner/k8s/direct-consumer-cutover-notes.md`

Legacy DuckDB/Chroma overlay remains available as a compatibility path:

```bash
pnpm k8s:openplanner:up:local-kind
```

The local-kind scripts will:

1. detect the current kind Docker-network gateway IP
2. write local ignored secret material for Kustomize generation
3. write a generated EndpointSlice that exposes the host Proxx runtime inside the cluster as `proxx-host`
4. build the OpenPlanner image
5. load it into the `kind` cluster
6. apply the selected overlay
7. wait for the deployments to become ready

## Access

- ingress URL: `http://openplanner.127.0.0.1.nip.io:8080`
- health check: `curl -H 'Host: openplanner.127.0.0.1.nip.io' http://127.0.0.1:8080/v1/health`

## Zero-downtime note

The **base** deployment is structured for future rolling-update semantics with readiness probes and graceful shutdown hooks.

However, the current `local-kind` overlay intentionally uses:

- `OPENPLANNER_STORAGE_BACKEND=duckdb`
- a single-writer local PVC-backed data directory

That means **true zero-downtime rebuilds are not safe in this overlay** because two OpenPlanner pods should not concurrently open the same DuckDB-backed runtime lake.

So for correctness, the `local-kind` overlay patches the app deployment to **`Recreate`** strategy.

True zero-downtime rebuilds will require at least:

1. a non-DuckDB primary runtime backend for Kubernetes, likely MongoDB mode
2. shared or externalized blob/job storage
3. at least two safe app replicas behind the Service

## Local kind MongoDB overlay

The `local-kind-mongodb` overlay is now the recommended active path while the wider data lake moves off DuckDB/Chroma.

It changes the runtime shape to:

- `OPENPLANNER_STORAGE_BACKEND=mongodb`
- MongoDB Community Server in single-node replica-set mode
- `mongot` for community search/vector search wiring
- `openplanner` replicas scaled to `2`
- rolling update strategy on the app deployment

Important constraint:

- the app still keeps blob/job files under `OPENPLANNER_DATA_DIR`, mounted from a shared PVC

So this overlay is the **best current local rolling-update candidate**, but the remaining filesystem-backed blob/job paths mean the long-term zero-downtime story is still not fully clean until those paths are externalized or moved into a cluster-safe backend.

Observed local result on this workstation:

- a `kubectl rollout restart deployment/openplanner -n openplanner` completed while 40 consecutive ingress health probes returned HTTP `200`

You can replay that check with:

```bash
pnpm k8s:openplanner:verify:rolling-update
```

If you need to recover from a failed first MongoDB bootstrap on local kind, rerun with:

```bash
RESET_MONGODB_BOOTSTRAP=1 bash services/openplanner/k8s/bin/local-kind-mongodb-up.sh
```

## Local-only generated files

The `local-kind` overlay expects these ignored generated files:

- `services/openplanner/k8s/overlays/local-kind/secret.env`
- `services/openplanner/k8s/overlays/local-kind/host-proxx-endpointslice.generated.yaml`

The `local-kind-mongodb` overlay expects these ignored generated files:

- `services/openplanner/k8s/overlays/local-kind-mongodb/openplanner-secret.env`
- `services/openplanner/k8s/overlays/local-kind-mongodb/mongodb-secret.env`
- `services/openplanner/k8s/overlays/local-kind-mongodb/host-proxx-endpointslice.generated.yaml`
- `services/openplanner/k8s/overlays/local-kind-mongodb/generated/mongodb-keyfile`
- `services/openplanner/k8s/overlays/local-kind-mongodb/generated/mongot-password`

They are written by the corresponding `prepare-*` scripts.
