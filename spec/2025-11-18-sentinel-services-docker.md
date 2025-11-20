# Sentinel Services (Docker subset)

## Intent

Add a top-level `:services` block to manage lightweight containerized dependencies (DBs, queues, etc.) without YAML/compose. Provide verbs to ensure/restart/stop services. Keep scope to an 80% subset: image, env, ports, volumes, health, restart. Optional and guarded; no file watching or build contexts.

## Shape

- Top-level keys: `:services`, `:apps`, `:watchers`.
- `:services {<svc-key> {...}}` declares a container spec.
- Actions from `:watchers` (or CLI) can reference services via verbs: `:service/ensure|restart|stop|run-once`.

Example:

```edn
{:services
 {:db {:image "postgres:16"
       :env {:POSTGRES_PASSWORD "devpass" :POSTGRES_USER "dev"}
       :ports ["5432:5432"]
       :volumes ["./.data/pg:/var/lib/postgresql/data"]
       :health {:cmd ["pg_isready" "-U" "dev"] :interval "10s" :timeout "3s" :retries 5}
       :restart :unless-stopped}
  :redis {:image "redis:7" :ports ["6379:6379"] :restart :unless-stopped}}
 :apps {...}
 :watchers {...}}
```

## Supported service fields (subset of compose/docker)

- Identity: `:name` (optional; default derived from key + config source)
- Image & command: `:image` (required), `:command` (vec/string), `:entrypoint` (optional), `:cwd` (host working dir)
- Env: `:env` map
- Ports: `:ports` vector of strings `"host:container"` or maps {:host 5432 :container 5432}
- Volumes: `:volumes` vector of strings `"host:container"` or maps {:host "..." :container "/path" :ro true}
- Health: `:health {:cmd [...] :interval "10s" :timeout "3s" :retries 5}`
- Restart policy: `:restart` one of [:no :on-failure :always :unless-stopped] (default :unless-stopped)
- Resources: `:memory` (e.g., "512m"), `:cpus` (e.g., "1.0") — optional
- Networking: `:network` name (optional; default bridge); `:depends-on` vector of service keys — start-order only (no health gating in v1)
- Pull policy (optional): `:pull` one of [:always :missing :never] (default :missing)

Excluded initially

- Build contexts, Dockerfiles
- Compose profiles/secrets/configs
- Advanced networking (static IPs), swarm/k8s features

## Verbs (actions or CLI)

- `:service/ensure` ensure service is running (create if missing, start if stopped)
- `:service/restart` restart a running service
- `:service/stop` stop service
- `:service/run-once` run a one-off container (no restart tracking) with same spec; auto-remove on exit

## Safety & guardrails

- Gate behind `SENTINEL_ENABLE_SERVICES`; fail fast if Docker not available.
- Resolve host paths relative to config root; reject `..` escapes; honor `:ro` if set.
- Log pulls loudly; obey `:pull` policy (default :missing).
- Name prefixing to avoid collisions (e.g., `sentinel-<config-hash>-<key>`).

## Acceptance criteria

- Parse `:services` and process verbs; manage containers via Docker API/CLI (bridge module, mockable for tests).
- Support image/env/ports/volumes/health/restart; ensure idempotent `ensure`.
- No PM2 watch or Docker file watch; Sentinel remains sole watcher.
- Tests: DSL validation + bridge mock; integration stub (skipped if no Docker).

## Touchpoints

- DSL parser to include `:services` and service verbs.
- Docker bridge (Node) for ensure/restart/stop/run-once, mockable.
- Docs: how to declare services, guard flags, and examples.

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/services/model.cljs`
- `services/sentinel/src/promethean/sentinel/services/docker_bridge.cljs`
