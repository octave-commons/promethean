# Sentinel Process Apps & PM2 Parity (Singular or Subset)

## Intent

Define a top-level `:apps` block to manage PM2-style processes, plus process verbs usable from actions. Avoid PM2 file watching; rely on Sentinel watchers to reduce watcher count. Keep PM2 modules/actions optional and minimal.

## Shape

- Top-level keys: `:apps` and `:watchers`.
- `:apps {<app-key> {...}}` describes PM2-like process specs.
- `:watchers` may reference apps via process verbs (`:process/start|ensure|restart|stop|run-once`) with optional `:env` selection.
- Defaults (implicit unless overridden): `instances 1`, `autorestart true`, `restart-delay 10000`, `kill-timeout 10000`, `merge-logs true`, `interpreter "/usr/bin/env"`, `cwd "."`, logs to `./logs/<name>` if not set.

Env precedence: action `:env` override > app `:env` block > defaults.

Example config:

```edn
{:apps {:autocommit {:name "autocommit"
                     :script "node" :args ["services/autocommit/dist/cli.js" "--path" "."]
                     :env {:NODE_ENV "production"}}
       :sentinel-client {:name "sentinel-client"
                         :script "node" :args ["services/sentinel-client/dist/index.js" ]}}
 :watchers {:workspace {:path "."
                        :synthetic [{:id :workspace-change
                                     :on :any
                                     :actions [{:type :process/restart :app :sentinel-client}]}]}}}
```

## Supported app fields (map to PM2)

- Identity & command: `:name`, `:script`, `:cwd`, `:args` (string or vector), `:interpreter`, `:interpreter-args`/`:node-args`.
- Process model: `:instances` (0/−1 = CPU max), `:exec-mode` (:fork|:cluster), `:instance-var`, `:append-env-to-name` (optional).
- Env: `:env` (default), `:env-<name>` blocks; action may pick `:env` via `:env :production`.
- Restart policy: `:autorestart`, `:max-restarts`, `:min-uptime`, `:restart-delay`, `:wait-ready`, `:listen-timeout`, `:kill-timeout`, `:shutdown-with-message`.
- Resource limits: `:max-memory-restart` (strings like "300M"), `:source-map-support?`.
- Logging: `:out-file` (defaults to `./logs/<app>` if absent), `:log-date-format`, `:time?`, `:pid-file`. (combine/merge implied by default; err/out coalesced)
- Scheduling: `:cron-restart`.
- Other toggles: `:force?`, `:vizion?` (default false), `:post-update` (command list) — optional.
- Not exposing: PM2 `watch`/`ignore-watch` (Sentinel handles watching).

Probes: informational only unless wired via actions; not enforced by PM2 in this spec.

## Process verbs (usable in actions)

- `:process/start` start a declared app (honors `:env`).
- `:process/ensure` idempotent start if not running.
- `:process/restart` restart an app.
- `:process/stop` stop an app.
- `:process/run-once` run a one-off command (optional; no PM2 tracking).

## Optional/advanced (gated)

- PM2 modules: add `:modules` only if `SENTINEL_ENABLE_PM2_MODULES` is set (default off).
- PM2 process RPC actions: allow `:process/rpc` only if `SENTINEL_ENABLE_PM2_RPC` (default off).
- `@pm2/io`: in-app usage only; no DSL surface.

## Safety & resolution

- Resolve `:script`, `:cwd`, log paths relative to config root; reject `..` escapes.
- Gate process management behind `SENTINEL_ENABLE_PROCESSES`. Timeouts/backoff for start/stop.
- Idempotent `ensure`; tag processes with config source for cleanup.

## Acceptance criteria

- Parse `:apps` and process verbs; start/ensure/restart/stop via PM2 API (mockable for tests).
- No PM2 `watch` usage; Sentinel remains the sole watcher.
- Env selection works; logging defaults apply; probes noted but non-blocking.
- Tests: DSL validation, PM2 bridge mock, env override precedence.

## Touchpoints

- DSL parser update to include `:apps`.
- PM2 bridge module (Node) with mockable API.
- Docs/samples showing `:apps` + process verbs from `:watchers`.

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/apps/model.cljs`
- `services/sentinel/src/promethean/sentinel/apps/pm2_bridge.cljs`
