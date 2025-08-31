# codex-orchestrator (MVP)

Minimal loop to pair a **reasoning model (planner)** with **local tools**:
- open files
- search repo (ripgrep)
- apply unified diffs (git apply 3-way)
- run tests (AVA pattern)

Designed to be dropped into your Promethean mono-repo or used standalone.

## Quick start

```bash
cd codex-orchestrator
pnpm i   # or npm i
# (Optional) create the planner wrapper in Ollama:
ollama create promethean-planner -f Modelfile

# run once for a task:
node --loader ts-node/esm src/index.ts "Add AVA test for broker reconnection"
# or compile first:
pnpm build && node dist/index.js "Add AVA test for broker reconnection"
```

> You can also point `PLANNER_MODEL` at any existing model (e.g., `qwen3:8b-instruct`).

## Environment

- `OLLAMA_HOST` (default: http://localhost:11434)
- `REPO_ROOT` (default: cwd)
- `PLANNER_MODEL` (default: promethean-planner)
- `TEST_CMD` (default: `pnpm -w test`)
- `TEST_PATTERN_FLAG` (default: `-m`)  # AVA's match flag

## Action schema

The planner must return **one JSON object** per turn with one of:
- `open_file { "path": string, "hint"?: string }`
- `search_repo { "query": string }`
- `run_tests { "pattern"?: string }`
- `write_patch { "path": string, "diff": string }`
- `ask_user { "question": string }`
- `done { "reason"?: string }`

Tool outputs are fed back to the planner as *summaries* to keep context tight.

## Notes

- Patches are applied using `git apply -3` with whitespace fix. Keep diffs small.
- If `git apply` fails, the tool returns the error and the planner must try again.
- Use your own prelude rules (imports, AVA, @shared/ts/dist/...) in `plannerPreamble`.
