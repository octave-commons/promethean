# File Watcher Service

This service monitors the local kanban board and task files.

- When `docs/agile/boards/kanban.md` changes it runs `kanban_to_hashtags.py` to
  update the task files.
- When any document under `docs/agile/tasks/` changes it runs
  `hashtags_to_kanban.py` and writes the output back to the board.

Use `npm run start:dev` while developing to watch TypeScript files.
