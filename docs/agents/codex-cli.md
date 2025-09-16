# Codex CLI Agent

## Baseline (if present)
- If `docs/reports/codex_cloud/latest/` exists, use its `{INDEX.md,summary.tsv,eslint.json}` as BASELINE.
- Do **not** run setup. You may run maintenance **only** if you need CURRENT artifacts and it’s fast:
  ```bash
  TIMEOUT_SECS=${TIMEOUT_SECS:-60} STRICT=0 bash run/codex_maintenance.sh
```

## While working

* TypeScript-first; new code under `packages/<name>`. Keep builds idempotent/cached.
* Quick lint on touched files (fast loop):

  ```bash
  git diff --name-only --diff-filter=ACMRTUXB origin/main...HEAD \
    | grep -E '\.(ts|tsx)$' \
    | xargs -r pnpm exec eslint --cache --max-warnings=0
  ```
* For builds, target only touched packages:

  ```bash
  pnpm --filter @promethean/<pkg> build
  ```

## Optional CURRENT artifacts

* If you need a delta versus baseline:

  ```bash
  TIMEOUT_SECS=${TIMEOUT_SECS:-60} STRICT=0 bash run/codex_maintenance.sh
  ```

  Then diff `eslint.json` sets and check `summary.tsv` RCs.

## Completion gates

* No **new** ESLint errors; touched packages build; no **new** test failures; `pnpm install` passes.
* Open PR referencing an issue; link `docs/reports/codex_cloud/latest/INDEX.md` if you ran maintenance.

