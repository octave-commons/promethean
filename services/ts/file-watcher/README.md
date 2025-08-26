# File Watcher Service

This service monitors the local kanban board and task files, and now also
watches the entire repository for file changes to keep the SmartGPT bridge
index up to date.

- When `docs/agile/boards/kanban.md` changes it runs `kanban_to_hashtags.py` to
  update the task files.
- When any document under `docs/agile/tasks/` changes it runs
  `hashtags_to_kanban.py` and writes the output back to the board.
- When a new task is created the service calls the LLM HTTP endpoint to
  generate a starter task stub.

Additionally, the repo watcher:

- Watches all files under the repo root except those ignored by `.gitignore`
  (and a small default exclude set like `.git/`, `node_modules/`, `dist/`).
- On file add/change: POSTs `{ path }` to `POST /indexer/index` on the
  SmartGPT bridge (URL configurable via `SMARTGPT_BRIDGE_URL`).
- On file delete: POSTs `{ path }` to `POST /indexer/remove` on the SmartGPT
  bridge.
- If auth is enabled on the bridge, include a static bearer token via
  `SMARTGPT_BRIDGE_TOKEN` (or `BRIDGE_AUTH_TOKEN`/`AUTH_TOKEN`) — requests send
  `Authorization: Bearer <token>`.

Environment variables:

- `REPO_ROOT` (optional) – override repository root (defaults to `process.cwd()`).
- `SMARTGPT_BRIDGE_URL` (optional) – base URL of the bridge (default
  `http://127.0.0.1:3210`).
- `FILE_WATCHER_DEBOUNCE_MS` (optional) – debounce delay before sending
  index/remove requests (default `2000`). Higher values reduce request volume.
- `SMARTGPT_BRIDGE_TOKEN` (optional) – bearer token for SmartGPT Bridge.

Run the service with `./run.sh` (requires `pnpm`); the script checks for the
package manager and prints setup instructions if it's missing. Use
`pnpm run start:dev` during development to watch TypeScript files.
