# Sentinel Nx Integration

## Intent

Allow Sentinel-driven workflows (watchers, git hooks, GitHub actions) to invoke Nx targets with minimal boilerplate, including affected-mode runs. Nx config (nx.json + project.json) stays the source of truth; Sentinel orchestrates calls.

## Defaults

- `:cache? true`, `:parallel? false`, job timeout default 900s.
- Log invoked Nx command and return Nx exit code.

## DSL

Top-level optional defaults:

```edn
{:nx {:root "." :default-targets [:lint :test] :cache? true :parallel? false}}
```

Action/step verb:

```edn
{:type :nx/run
 :target "lint"
 :projects [:api :web]   ; or :all or :auto
 :configuration "ci"
 :affected? true          ; compute affected projects
 :files ["packages/foo/src/index.ts"] ; override file set
 :parallel? true          ; optional override
 :cache? false            ; optional override
 :args ["--skip-nx-cache"]
 :timeout "600s"}
```

Helper in GH steps:

```edn
{:run-nx {:target "test" :affected? true :configuration "ci"}}
```

## Semantics

- `:affected? true` → use Nx to compute projects from base/head or provided `:files`.
  - Hooks: staged files (pre-commit) unless `:files` provided.
  - CI (push/PR): base/head from env (e.g., GITHUB_BASE_REF/GITHUB_SHA) if available; else fall back to all or explicit `:files`.
- `:projects :auto` → resolve via `nx show projects --affected --files ...` or `print-affected` using file list; `:all` runs on all.
- `:configuration` → `--configuration`.
- `:parallel?` → `--parallel`; `:cache? false` → `--skip-nx-cache`.
- `:timeout` enforced by runner (default 900s).

## Invocation model

- Shell out to `pnpm nx ...` (or `nx` in PATH) with constructed args.
- Output style: stream.
- Thresholds: propagate exit code; log command.

## Integration points

- Watchers: `:nx/run` actions on events (e.g., workspace-change → lint/test affected).
- Git hooks: pre-commit runs `:nx/run` with `:affected? true` using staged files.
- GitHub actions: steps use `:run-nx`; base/head from env for PR/push.

## Safety

- No mutation beyond Nx target behavior. Paths resolved from nx root.
- If base/head missing and `:affected? true`, fallback strategy should be defined (e.g., run all or warn and skip) — choose per config.

## Acceptance criteria

- Parser supports `:nx` defaults and `:nx/run` / `:run-nx` verbs.
- Affected resolution works for staged files and base/head when provided; graceful fallback on missing refs.
- Nx commands execute with options (target, projects, config, parallel/cache flags); timeouts enforced.
- Tests: DSL validation, command construction, affected resolution (mock git refs/files), success/failure handling.

## Touchpoints

- Action runner to construct/run Nx CLI commands.
- Helper to resolve affected projects from file lists via Nx.
- Docs: using `:nx/run` in watchers/hooks/CI, how refs/files derive.

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/nx/model.cljs`
- `services/sentinel/src/promethean/sentinel/nx/runner.cljs`
