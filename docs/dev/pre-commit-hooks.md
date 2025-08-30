Pre-commit Hook Layout (Stabilized)
===================================

Overview
- TS typecheck detached from Hy/Make:
  - Runs `pnpm exec tsc -p tsconfig.json --noEmit`
  - Avoids Makefile.hy and Hy runtime in hooks
- Topic/schema lints:
  - Runs `pnpm exec tsx scripts/lint-topics.ts` directly
- Python tests:
  - Keep imports lazy; avoid eager imports in `shared/py/__init__.py`
  - Pre-commit runs a minimal smoke suite in `tests/smoke/` to avoid legacy test drift
- Prettier:
  - Ignores logs, dist/build/coverage, and intentionally broken fixtures

Rationale
- Hy→bb drift made Make targets import Hy modules during hooks, causing `ModuleNotFoundError`. Hooks now call pnpm/tsx directly.
- Python import-time crashes were triggered by eager package imports; `__init__.py` now does no eager re-exports.
- One intentionally broken TS fixture previously crashed Prettier; it’s excluded along with large log directories.

What to run locally
- Quick sweep: `pre-commit run -a`
- TS only: `pre-commit run tsc-no-emit -a`
- Python tests only: `pre-commit run pytest -a`
- Prettier only: `pre-commit run prettier -a`

Notes
- Use pnpm (Corepack enforced). npm is blocked by `preinstall` guard.
- Prefer service‑specific setup (`make setup-quick SERVICE=<name>`) to avoid monorepo-wide installs.
- Requirements policy: declare direct deps in each service’s `requirements.*.in` and use `-c ../../../constraints.txt` for pins.
 - Mypy is temporarily lenient for `shared.py.*` and `services.py.*` legacy paths during the Hy→bb transition. Tighten once modules settle.
