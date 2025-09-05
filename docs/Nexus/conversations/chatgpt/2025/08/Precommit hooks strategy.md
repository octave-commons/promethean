---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Precommit hooks strategy"
conversation_id: 68ada76a-4fcc-8328-b785-1fdf6958b3f3
create_time: 08/26/2025 at 7:24 AM
update_time: 08/26/2025 at 7:46 AM
---

# Title: Precommit hooks strategy

Created: 08/26/2025 at 7:24 AM
Last Updated: 08/26/2025 at 7:46 AM
Chat URL: https://chat.openai.com/c/68ada76a-4fcc-8328-b785-1fdf6958b3f3


>[!nexus_user] **User** - 08/26/2025 at 7:24 AM
> brain storm precommit hooks that will help me enforce convention, and prevent regression
<!-- UID: a0bcbb71-ee67-4513-9fde-88cff9b59cc2 -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 7:24 AM
> love this. here’s a battle-tested, low-friction plan for git hooks that catch regressions and enforce your Promethean conventions without slowing you down.
> 
> # Strategy (fast → heavier)
> - **pre-commit (≤2s):** formatting, lint, typecheck-on-staged, tiny repo hygiene, obvious foot-guns.
> - **pre-push (heavier, selective):** API/spec diffs, schema checks, generated-artifacts parity, targeted tests.
> - **CI (full):** e2e, load, multi-service integration.
> 
> # Core pre-commit hooks (fast)
> 1. **Whitespace & end-of-file**: strip trailing space, ensure newline at EOF.
> 2. **Prettier on staged** (JS/TS/JSON/MD/YAML).
> 3. **ESLint on staged TS/JS** with your rules.
> 4. **TypeScript fast typecheck**: `tsc -p tsconfig.json --noEmit --skipLibCheck`.
> 5. **Ruff (Python) + isort**: quick lint/import order.
> 6. **ShellCheck** for `.sh`.
> 7. **JSON/YAML validity** (ajv/yamllint).
> 8. **Secret scan (fast rule set)**: fail on obvious keys/tokens.
> 9. **File size guard**: block LFS-scale binaries creeping into repo.
> 10. **Commit message lint** (Conventional Commits or your schema).
> 
> # Promethean-specific pre-commit hooks
> 11. **Shared TS import policy** 
>  Fail if imports violate your rule:
>  - ✅ `@shared/ts/dist/...`
>  - 🚫 anything like `@shared/js` or un-namespaced aliases
> 12. **Module format guard** 
>  In `type: "module"` packages, block `require()`/`.cjs` in src unless whitelisted.
> 13. **Sibilant/Hy quick compile smoke test** 
>  - Compile **only staged** `.sibilant`/`.hy` and ensure no compiler error.
>  - For Sibilant, verify generated JS diff is **added** if you check in transpiled output (or prove it’s ignored).
> 14. **OpenAPI `/v1/openapi.json` validation** 
>  `swagger-cli validate` (syntax + schema).
> 15. **SmartGPT Bridge tool spec freshness** 
>  If `openapi.json` changed, assert regenerated tool stubs are staged (no drift).
> 16. **API diff gate (light)** 
>  On commit to `services/ts/smartgpt-bridge` or `openapi.json`, run a **breaking-change detector** (e.g., `openapi-diff` against `origin/dev:openapi.json`) and:
>  - add `BREAKING:` tag requirement in commit message if breaking
>  - otherwise allow.
> 17. **DualStore schema sync** 
>  Quick script that loads `cephalon`’s `collectionManager.ts` + `contextManager.ts` types and checks:
>  - keys and shapes match the DualStore layer where required,
>  - or a migration file exists in `migrations/dualstore/` referencing the change.
> 18. **Obsidian tag hygiene** 
>  Check `.md`: warn if `#tags` appear **inside** code fences. (Your preference.)
> 19. **Mermaid sanity** 
>  Validate fenced ```mermaid blocks via `mmdc --check` (no render, just parse).
> 20. **Board generators** 
>  If board/task markdown patterns are touched, run the light generator and ensure the **derived** files are staged:
>  - Kanban snapshots
>  - AGENTS index
>  - (Keep the heavy graph builds for pre-push/CI.)
> 21. **PM2 ecosystem & Makefile.hy guard** 
>  - Parse `ecosystem.config.js` for obvious typos/dup names.
>  - If `Makefile.hy` updated, regenerate any declared artifacts (only the ones touched) and assert they’re staged.
> 22. **Systemd unit lint** (for repo-tracked units): basic `systemd-analyze verify` in a sandbox (syntax only).
> 
> # Pre-push hooks (heavier but targeted)
> 1. **Targeted test runner** 
>  Map changed paths → affected test sets:
>  - `services/ts/**` → `pnpm -w test:ts -w`
>  - `services/py/**` → `pytest -k 'changed_modules'`
>  - snapshot tests: require `--update-snapshots` flag in commit if snapshots changed.
> 2. **OpenAPI breaking-change enforcement** 
>  If breaking diff detected, require commit message trailer `!BREAKING-API` or block push.
> 3. **Generated code parity** 
>  Re-generate Sibilant/Hy/clients and fail if working tree changes (forces devs to commit generated results when required).
> 4. **Security pass (deeper)** 
>  gitleaks full ruleset; npm/pip audit with severity threshold.
> 5. **DB migration presence** 
>  If types in `cephalon` storage or DualStore changed, ensure a new migration file exists and compiles.
> 
> # CI gates (mention for completeness)
> - Full test matrix, integration across services.
> - End-to-end “broker online/kill/recover” scenario to catch your “process didn’t die after disconnect” regressions.
> - Load test on embeddings queue saturation (your noted pain point).
> 
> # Minimal example configs
> 
> ## `.pre-commit-config.yaml`
> ```yaml
> repos:
>  - repo: https://github.com/pre-commit/pre-commit-hooks
>  rev: v4.6.0
>  hooks:
>  - id: end-of-file-fixer
>  - id: trailing-whitespace
>  - id: check-merge-conflict
>  - id: check-yaml
>  - id: check-json
> 
>  - repo: local
>  hooks:
>  - id: prettier
>  name: prettier
>  entry: pnpm exec prettier --write
>  language: system
>  files: "\\.(ts|tsx|js|jsx|json|md|yaml|yml)$"
>  stages: [commit]
> 
>  - id: eslint
>  name: eslint
>  entry: pnpm exec eslint
>  args: ["--max-warnings=0"]
>  language: system
>  files: "\\.(ts|tsx|js|jsx)$"
> 
>  - id: tsc-noemit
>  name: tsc --noEmit
>  entry: pnpm exec tsc --noEmit --skipLibCheck
>  language: system
>  pass_filenames: false
> 
>  - id: ruff
>  name: ruff
>  entry: ruff check
>  language: system
>  types: [python]
> 
>  - id: shellcheck
>  name: shellcheck
>  entry: shellcheck
>  language: system
>  files: "\\.sh$"
> 
>  - id: secret-scan-fast
>  name: secret-scan-fast
>  entry: pnpm exec gitleaks detect --no-banner --redact --staged
>  language: system
>  pass_filenames: false
> 
>  - id: shared-import-policy
>  name: shared import policy
>  entry: node scripts/hooks/check-shared-imports.mjs
>  language: system
>  files: "\\.(ts|tsx|js|jsx)$"
> 
>  - id: sibilant-hy-compile
>  name: sibilant/hy compile check
>  entry: node scripts/hooks/compile-dsl-staged.mjs
>  language: system
>  files: "\\.(sibilant|hy)$"
> 
>  - id: openapi-validate
>  name: openapi validate
>  entry: pnpm exec swagger-cli validate services/ts/smartgpt-bridge/public/v1/openapi.json
>  language: system
>  files: "services/ts/smartgpt-bridge/public/v1/openapi.json"
> 
>  - id: obsidian-tag-hygiene
>  name: obsidian tag hygiene
>  entry: node scripts/hooks/check-obsidian-tags.mjs
>  language: system
>  files: "\\.md$"
> 
>  - id: mermaid-parse
>  name: mermaid parse
>  entry: node scripts/hooks/check-mermaid.mjs
>  language: system
>  files: "\\.md$"
> ```
> 
> ## `.husky` (for pre-push)
> `./.husky/pre-push`:
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # Only run on relevant changes
> CHANGED=$(git diff --name-only --cached || true)
> 
> # API diff & breaking-change signal
> if echo "$CHANGED" | grep -q 'services/ts/smartgpt-bridge/public/v1/openapi.json'; then
>  pnpm exec openapi-diff --fail-on-changed \
>  origin/dev:services/ts/smartgpt-bridge/public/v1/openapi.json \
>  services/ts/smartgpt-bridge/public/v1/openapi.json \
>  || {
>  echo "Breaking API change detected."
>  echo "Add '!BREAKING-API' to commit message trailer or update versioning/migrations."
>  exit 1
>  }
> fi
> 
> # Targeted tests (TS)
> if echo "$CHANGED" | grep -q '^services/ts/'; then
>  pnpm -w test:ts
> fi
> 
> # Python tests if needed
> if echo "$CHANGED" | grep -q '^services/py/'; then
>  pytest -q
> fi
> 
> # Regenerate code and ensure clean tree
> pnpm run gen:clients && pnpm run gen:dsl
> if ! git diff --quiet; then
>  echo "Generated artifacts changed; commit them before pushing."
>  exit 1
> fi
> ```
> 
> # Tiny custom hook stubs you’ll want
> - `scripts/hooks/check-shared-imports.mjs`: grep AST for import sources; fail if not `@shared/ts/dist/...`.
> - `scripts/hooks/compile-dsl-staged.mjs`: compile staged `.sibilant`/`.hy` files; print readable compiler errors.
> - `scripts/hooks/check-obsidian-tags.mjs`: detect `#tag` inside triple-backticks; fail with file:line hints.
> - `scripts/hooks/check-mermaid.mjs`: extract ```mermaid blocks and run `mmdc --check`.
> 
> # Nice extras (optional)
> - **Dead code detector** (ts-prune) in pre-push.
> - **Forbidden deps** guard (no `devDeps` in runtime code, no circulars).
> - **License headers (SPDX)** required for new files.
> - **Large file blocklist** (zips/tars outside approved dirs).
> - **Dockerfile lints** (hadolint) for service images.
> 
> ---
> 
> If you want, I can generate the exact `scripts/hooks/*.mjs` and a repo-ready `.pre-commit-config.yaml` that respects your `@shared/ts/dist/...` rule and the SmartGPT Bridge OpenAPI flow.
<!-- UID: 23fe15da-dd8d-4840-abd0-5e0f81b208ec -->

---


