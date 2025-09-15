# Github Branching Workflow

- **Branches:**
  - `chore/<task>`, `codex/<task>` go to `main`.

- **Development Setup:**
  - Use multiple computers (`stealth` and `yoga`) for development.
  - Changes flow from `dev/<hostname>` to `testing`, then `staging`, and finally
    `main`.

- **Typical Workflow:**
  1. `codex/<task>` -> `dev/<hostname>` -> `main`
  2. `feat/codex-<task>` indicates Codex started work.
  3. `<type>/<task>` branches for specific tasks.

- **Branching Rules:**
  - Prefixed with `codex/` indicate Codex responsibility.
  - Others are my responsibility unless default merging causes issues.

- **Obsidian Workflow:**
  1. `obsidian/<hostname>` -> `dev/<hostname>` -> `main`
  2. Ideal flow: `<describer>/<task>` -> `dev/testing` -> `dev/staging` ->
     `main`

- **Documentation Flow:**
  1. `<codex|docs|readme|etc>/<task>` -> `obsidian/<hostname>` ->
     `obsidian/staging` -> `main`
  2. Staging branch uses GitHub Actions for transformations.

## Diagram

```mermaid
graph TD;
    codexTask[feat/codex-<task>] --> dev/stealth
    dev/stealth --> main
    describerTask[<describer>/<task>] --> dev/testing
    dev/testing --> dev/staging
    dev/staging --> main
    docsTask[codex|docs|readme|etc/<task>] --> obsidian/<hostname>
    obsidian/<hostname> --> obsidian/staging
    obsidian/staging --> main
```

This diagram shows how tasks progress from initial development to the `main`
branch, ensuring a structured and systematic approach.

## Merging Rules

### Feature -> `dev/testing` or `dev/<hostname>`

To merge into `dev/testing` or `dev/<hostname>`:
- PR must build and install without errors.
- Otherwise, it should be green.

### From `dev/testing` -> `dev/staging`

To merge into staging:
- No linting errors on the touched diffs.
- No failing tests along the changed paths.
- Only `dev/testing` and `dev/<hostname>` branches may merge into `dev/staging`.

### From `dev/staging` -> `main`

- Green from both directions:
  - `obsidian/staging` to `obsidian/main`
  - `main` to `obsidian/staging`

## Conclusion

By following these branching and merging rules, we ensure a systematic and
error-free workflow that maintains the integrity of our codebase. This structure
not only helps in managing changes efficiently but also ensures that any issues
are caught early on in the development process.

Feel free to adjust or refine these rules as needed based on feedback from team
members or additional use cases.
