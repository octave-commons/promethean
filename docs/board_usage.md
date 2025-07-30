# Kanban Board Usage Guide

This page explains how to work with the Promethean Kanban board located at
[`docs/agile/boards/kanban.md`](agile/boards/kanban.md). The board is designed
for the Obsidian Kanban plugin but renders fine on GitHub.

## Adding and linking tasks

1. Create a new markdown file in `docs/agile/Tasks/` using the task template.
2. Include a status hashtag such as `#todo` or `#in-progress` at the top.
3. Link the file from the appropriate column on the board using a relative
   markdown link.
4. Run the sync scripts (`hashtags_to_kanban.py` or `kanban_to_hashtags.py`) if
   you reorganise tasks outside Obsidian.

Tasks should always be linked on the board before moving to **Ready** or beyond.
The board manager agent checks this linkage and can create stubs when needed.

## Typical workflow

The board columns map to the stages in
[`docs/agile/Process.md`](agile/Process.md). A common flow is:

`Ice Box → Accepted → Breakdown → Ready → To Do → In Progress → In Review → Done`

Refer to [`docs/agile/AGENTS.md`](agile/AGENTS.md) for details on how the board
manager enforces this process.

## WIP limits

Some column headings include numbers like `In Progress (4)`. These numbers store
WIP (work in progress) limits used by the Kanban plugin. Avoid editing them
manually. Moving cards beyond the limit will highlight the column in Obsidian.

## Tips

- Keep filenames short and use kebab case.
- Use relative links so the board works on GitHub as well as in Obsidian.
- When a task is complete, ensure its file links to resulting code or docs before
  moving it to **Done**.

See [`docs/board_sync.md`](board_sync.md) for information about syncing with a
GitHub Projects board.
