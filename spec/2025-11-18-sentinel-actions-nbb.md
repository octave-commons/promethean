# Sentinel Actions: Embedded Forms vs Handler Files (Phase 2)

## Goal

Add actions to Sentinel configs with two paths: (1) embedded, declarative actions in EDN for simple flows; (2) dedicated handler files (NBB/Sci) for richer logic without compiling shadow-cljs. Actions stay auditable; heavy logic lives in handler files.

## Defaults & limits

- Embedded actions: default timeout 30s; concurrency unbounded but sequential per action list.
- Handler actions: default timeout 60s; max concurrent handler invocations default 4 (configurable); warm NBB context reused per config.
- Shell/http are OFF by default; enable via env flag. Provide an allowlist/glob for shell commands when enabled.

## Streams in scope

- Applies to watcher-level `:actions` and synthetic-rule `:actions`.
- Keeps current event-first producer unchanged; actions run after events are matched.

## Embedded actions (EDN-only)

- Audience: simple, safe operations configured inline.
- Built-ins (guarded by env/flag):
  - `:publish` topic payload merge
  - `:log` level msg ctx
  - `:http` request (optional, allowlisted)
  - `:shell` command (optional, allowlisted)
- DSL sketch:

```edn
{:watchers {:workspace {:path "."
                        :synthetic [{:id :workspace-change
                                     :on :any
                                     :glob "**/*"
                                     :actions [{:type :log :level :info :msg "workspace change"}
                                               {:type :publish :topic "sentinel.synthetic.workspace-change"}]}]
                        :actions [{:type :publish :topic "sentinel.watch.loaded"}]}}}
```

- Execution: in-process, no external code load. Failures logged, do not crash loop. Per-action timeout.

## Handler files (NBB/Sci)

- Audience: richer logic with Node deps. Handlers live in `.cljs/.cljc` files resolved relative to config root.
- DSL sketch:

```edn
{:watchers {:workspace {:path "."
                        :synthetic [{:id :workspace-change
                                     :on :change
                                     :glob "**/*.md"
                                     :actions [{:type :invoke
                                                :handler "actions/workspace.cljs"
                                                :fn workspace/handle}]}]}}}
```

- Runtime: keep a warm NBB context; load handler file once, resolve var, call `(fn [{:keys [event watcher log publish]}])`.
- Capabilities: can `js/require`/ESM import workspace deps; provided APIs: `log`, `publish`, maybe `http` wrapper. Per-invoke timeout and error/reporting.

## Resolution & security

- Handler paths resolved from config root; reject `..` escapes.
- `:shell`/`:http` gated by env/flag; default deny. Per-action timeout and concurrency caps.
- Logging: structured per action with source (embedded vs handler) and file path.

## Acceptance criteria

- Sentinel parses `:actions` and runs embedded built-ins and handler-file invocations.
- Failure isolation: one action failure does not stop watcher loop.
- Handler invocations pass event context and can publish follow-ups.
- Limits enforced (timeouts, max concurrent handlers), shell/http only when enabled.
- Tests: DSL parsing, builtin actions, handler invocation (NBB), timeout/error paths.

## Touchpoints

- `services/sentinel/src/promethean/sentinel/core.cljs` (parse + dispatch actions)
- NBB bridge module (new) for handler load/exec
- Samples: `services/sentinel/examples/actions/*.cljs`
- Docs: README update for actions + handler authoring

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/actions/embedded.cljs`
- `services/sentinel/src/promethean/sentinel/actions/handler_nb.cljs`
- `services/sentinel/src/promethean/sentinel/actions/runner.cljs`
- `services/sentinel/src/promethean/sentinel/defaults.cljs`
