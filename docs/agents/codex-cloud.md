# Codex Cloud Agent

## Initialization

- Read `docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}`
- Read `docs/agile/process.md`
- Scan `docs/agile/boards/kanban.md` for a tasks related to your current prompt.
  - read related tasks
  - either pick one of these tasks or create a new task to track your work this session

## While working

* Prefer TypeScript. New modules in `packages/<name>`. Keep scripts idempotent & cached.
* Use `gh` to find/create an issue; reference it in the PR.
* Lint touched files frequently:

  ```bash
  git diff --name-only --diff-filter=ACMRTUXB origin/main...HEAD \
    | grep -E '\.(ts|tsx)$' \
    | xargs -r pnpm exec eslint --cache --max-warnings=0
  ```
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

### Edit discipline
- If a path is missing or a file isn’t yet committed, do **not** rm/mv; write a new note under `docs/` and link it from the task.
- When you cannot complete the full request, check in partial artifacts (audit logs, inventories, findings) and reference them from the task so handoff is actionable.
- At session end, if no PR is ready, produce a **task update + artifacts** and use one of the safe transitions:
  - InProgress → Todo  (coherent next step; WIP allows)
  - InProgress → Breakdown  (slice needs re-plan)
  - Stay in InProgress with a minor blocker if WIP prevents movement.
