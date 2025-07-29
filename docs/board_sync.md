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

#tags: #docs
