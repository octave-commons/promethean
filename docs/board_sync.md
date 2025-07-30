# Board Sync Workflow

This document explains how to keep the local `kanban.md` board in sync with a GitHub Projects board using `scripts/github_board_sync.py`.

## Setup
1. Obtain a GitHub personal access token with `project` and `repo` scopes.
2. Export your project column ID as `GITHUB_PROJECT_ID`.
3. Set `GITHUB_TOKEN` in your environment.

## Usage
Run the script from the repository root:

```bash
python scripts/github_board_sync.py
```

By default the script reads `docs/agile/boards/kanban.md` and creates note cards in the specified project column. Without environment variables it performs a dry run.

## Column Mapping
Currently only the **To Do** column is synced. Each unchecked task becomes a new card in the target column. Future work will support more columns and two-way updates.

## Limitations
- Requires a PAT for write access
- Only creates cards; it does not update or delete existing items

See `docs/research/github_projects_api.md` for API details.

## Continuous Integration

A GitHub Action (`.github/workflows/sync_board.yml`) runs this script whenever changes are pushed to the `main` branch. The action uses repository secrets `PROJECT_PAT` and `PROJECT_COLUMN_ID` to authenticate and update the board automatically after pull requests are merged.

## Generate Kanban from Hashtags

You can regenerate `kanban.md` from the task files themselves. The
`hashtags_to_kanban.py` script scans every file in `docs/agile/tasks/` for a
status hashtag such as `#todo` or `#in-progress` and groups the tasks by those
hashtags.

Run the script and redirect the output to your board:

```bash
python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md
```

The resulting board uses the same layout as the existing `kanban.md` file,
placing each task under the column that matches its hashtag.

## Update Hashtags from the Board

When you move cards between columns, run `kanban_to_hashtags.py` to write the
new status hashtags back into each task file. The script reads
`kanban.md` and updates the linked documents:

```bash
python scripts/kanban_to_hashtags.py
```

This keeps the `#todo` or `#in-progress` tags inside the tasks synchronized with
their board position.
