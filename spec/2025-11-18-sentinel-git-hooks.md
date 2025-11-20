# Sentinel Git Hooks (nbb-backed)

## Intent

Provide a top-level `:git-hooks` in sentinel configs to define local Git hook behaviors without mixing them into file watchers. Support simple embedded actions and richer nbb/Sci handlers. Keep default execution fast, safe, and opt-in.

## Shape

Top-level key: `:git-hooks {:pre-commit {...} :commit-msg {...} :pre-push {...} ...}`

Example:

```edn
{:git-hooks
 {:pre-commit {:actions [{:type :shell
                          :cmd ["pnpm" "lint" "--filter" "@promethean-os/sentinel"]
                          :timeout "20s"}
                         {:type :invoke
                          :handler "hooks/pre_commit.cljs"
                          :fn hooks/run}
                         {:type :log :level :info :msg "pre-commit done"}]}
  :commit-msg {:actions [{:type :invoke
                          :handler "hooks/commit_msg.cljs"
                          :fn commit-msg/validate}]}}}
```

## Actions supported

- Embedded (guarded): `:log`, `:shell` (allowlist + timeout, default 30s), `:publish` (optional), `:http` (guarded).
- Handler: `:invoke` with `:handler` path (relative to repo root) and `:fn` var; executed via nbb/Sci; receives hook context.

## Hook context

Passed to handlers as a map:

- `:hook` keyword (e.g., :pre-commit)
- `:repo-root` string
- `:branch` string
- `:staged-files` vector of paths (when applicable)
- `:commit-message` string (commit-msg)
- `:args` vector raw hook args

## Safety & execution

- Opt-in via `SENTINEL_ENABLE_GIT_HOOKS`; shims installed to call runner.
- Default deny `:shell`/`:http` unless enabled by env flag; allowlist required when enabled.
- Default shell timeout 30s; handlers 60s. Clear failure messaging to stdout/stderr; non-zero exit stops the hook.
- Paths resolved relative to repo root; reject `..` escapes.
- Fast path: warm nbb context reused per hook.
- Skip via `SKIP_SENTINEL_HOOKS=1`.

## Acceptance criteria

- Parse `:git-hooks` and execute actions for standard hooks (pre-commit, commit-msg, pre-push, etc.).
- Handler invocation works with provided context; failures abort hook with message.
- Timeouts enforced; allowlist/guards for shell/http; skip flag works.
- Tests: validation of DSL, handler invocation (mock nbb), shell allowlist/timeout behavior.

## Touchpoints

- Hook runner (new) that reads sentinel config and dispatches for a given hook name.
- nbb bridge reuse from actions spec.
- Installation helper to place git hook shims that call the runner.
- Docs: how to enable, skip, and author hook handlers.

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/git/hooks_runner.cljs`
- `services/sentinel/src/promethean/sentinel/git/nbb_hooks.cljs`
