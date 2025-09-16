
# Codex Cloud Agent

## Baseline
- Read `docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}` as BASELINE.
- If `latest/` missing or older than ~8h, you MAY run:
  ```bash
  TIMEOUT_SECS=${TIMEOUT_SECS:-90} STRICT=0 bash run/codex_maintenance.sh
```

(never run `run/setup_codex_dev_env.sh`)

## While working

* Prefer TypeScript. New modules in `packages/<name>`. Keep scripts idempotent & cached.
* Use `gh` to find/create an issue; reference it in the PR.
* Lint touched files frequently:

  ```bash
  git diff --name-only --diff-filter=ACMRTUXB origin/main...HEAD \
    | grep -E '\.(ts|tsx)$' \
    | xargs -r pnpm exec eslint --cache --max-warnings=0
  ```

## Create CURRENT artifacts (optional, time-boxed)

* To compare your changes:

  ```bash
  TIMEOUT_SECS=${TIMEOUT_SECS:-90} STRICT=0 bash run/codex_maintenance.sh
  ```

  This writes a timestamped run and updates `docs/reports/codex_cloud/latest/`.

## Compare vs baseline

* NEW/FIXED ESLint by set-diff on `file:line:col:ruleId` from `eslint.json`.
* Build/Test RCs from `summary.tsv` rows:

  * build: `nx-affected-build|pnpm-build`
  * test:  `nx-affected-test`
* Gates before completion:

  * No **new** ESLint errors.
  * Touched packages pass `pnpm --filter @promethean/<pkg> build`.
  * No **new** test failures.
  * `pnpm install` succeeds.

## PR

* Reference the issue and link `docs/reports/codex_cloud/latest/INDEX.md`.
