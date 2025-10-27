# Board Sync Workflow

This document describes the synchronization workflow between the local kanban system and GitHub Issues/Projects.

## Overview

The Promethean project uses a bidirectional sync system to keep:

- Local kanban board (`docs/agile/boards/generated.md`)
- GitHub Issues
- Pull Request labels and checklists

All synchronized through task files in `docs/agile/tasks/`.

## Architecture

### Local → GitHub

1. **Task Files** → **Kanban Board** (via `pnpm kanban regenerate`)
2. **Kanban Board** → **GitHub Issues** (via GitHub Actions)
3. **Task Status** → **PR Labels** (via process sync)

### GitHub → Local

Manual updates to GitHub Issues can be pulled back to local task files using the kanban CLI.

## Automated Sync Workflows

### 1. Daily Kanban Sync

**Trigger**: Daily at 09:00 UTC  
**Workflow**: `.github/workflows/kanban-sync.yml`

```bash
# Regenerates board from tasks
pnpm kanban regenerate

# Syncs task statuses to PR labels/checklists
pnpm kanban process-sync
```

### 2. GitHub Issues Sync

**Trigger**: Push to main (when board/tasks change)  
**Workflow**: `.github/workflows/sync-kanban-to-github.yml`

Creates/updates GitHub Issues based on kanban tasks.

## Manual Sync Operations

### Generate Board from Tasks

```bash
# From any directory in the repo
pnpm kanban regenerate
```

### Sync Task Status to PR Labels

```bash
# Requires process config file (default: docs/agile/process/duck-revival.yaml)
pnpm kanban process-sync
```

### Pull Changes from GitHub Issues

```bash
# Sync board from task frontmatter
pnpm kanban sync

# Or pull specific column changes
pnpm kanban pull
```

### Push Local Changes to GitHub

```bash
# Project board columns back to tasks
pnpm kanban push
```

## Configuration

### Environment Variables

| Variable              | Description      | Required                        |
| --------------------- | ---------------- | ------------------------------- |
| `GITHUB_TOKEN`        | GitHub API token | Yes                             |
| `GITHUB_OWNER`        | Repository owner | Yes                             |
| `GITHUB_REPO`         | Repository name  | Yes                             |
| `KANBAN_BOARD_FILE`   | Board file path  | No (default: detected)          |
| `KANBAN_TASKS_DIR`    | Tasks directory  | No (default: detected)          |
| `KANBAN_PROCESS_FILE` | Process config   | No (default: duck-revival.yaml) |

### Process Configuration

The sync process is configured via YAML files in `docs/agile/process/`:

```yaml
# Example: duck-revival.yaml
pr_rules:
  '123': ['docs/agile/tasks/task1.md', 'docs/agile/tasks/task2.md']
  '456': ['docs/agile/tasks/task3.md']

label_map:
  'in_progress': ['work-in-progress']
  'done': ['completed']
  'review': ['needs-review']

pr_checklists:
  '123': 'review-checklist'
  '456': 'merge-checklist'

checklists:
  'review-checklist':
    - 'Code reviewed'
    - 'Tests passing'
    - 'Documentation updated'
  'merge-checklist':
    - 'All approvals received'
    - 'CI checks passing'
```

## Column Mappings

| Kanban Column | GitHub Label       | Description               |
| ------------- | ------------------ | ------------------------- |
| `icebox`      | `icebox`           | Backlog items             |
| `incoming`    | `incoming`         | New tasks                 |
| `accepted`    | `accepted`         | Approved work             |
| `breakdown`   | `breakdown`        | Tasks needing refinement  |
| `ready`       | `ready`            | Ready to start            |
| `todo`        | `todo`             | Planned work              |
| `in_progress` | `work-in-progress` | Currently being worked on |
| `review`      | `needs-review`     | Awaiting review           |
| `done`        | `completed`        | Finished work             |

## Required GitHub Permissions

The sync workflows require these GitHub permissions:

```yaml
permissions:
  contents: write # Commit board updates
  issues: write # Create/update issues
  pull-requests: write # Update PR labels/checklists
```

## Usage Examples

### Setting up Local Development

1. **Clone and install**:

   ```bash
   git clone <repo>
   cd promethean
   pnpm install
   ```

2. **Generate initial board**:

   ```bash
   pnpm kanban regenerate
   ```

3. **Create a new task**:

   ```bash
   # Uses template in docs/agile/templates/task.stub.template.md
   pnpm kanban create "My new task"
   ```

4. **Update task status**:
   ```bash
   pnpm kanban update-status <uuid> in_progress
   ```

### Syncing After Local Changes

```bash
# 1. Update task files as needed
# 2. Regenerate board
pnpm kanban regenerate

# 3. Commit changes
git add docs/agile/
git commit -m "Update kanban tasks"

# 4. Push to trigger GitHub sync
git push
```

### Manual GitHub Issues Sync

```bash
# Dry run (see what would change)
gh workflow run sync-kanban-to-github.yml -f dry_run=true

# Full sync
gh workflow run sync-kanban-to-github.yml -f dry_run=false
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure `GITHUB_TOKEN` has required permissions
2. **Missing Tasks**: Check `KANBAN_TASKS_DIR` points to correct location
3. **Sync Conflicts**: Use `pnpm kanban sync --verbose` to see conflict details
4. **Process Config Not Found**: Verify `KANBAN_PROCESS_FILE` path exists

### Debug Commands

```bash
# Check kanban configuration
pnpm kanban list --debug

# Verify path resolution
pnpm kanban regenerate --verbose

# Test GitHub connection
pnpm kanban process-sync --dry-run
```

## Best Practices

1. **Commit Task Changes First**: Always regenerate board after task changes
2. **Use Descriptive PR Labels**: Configure meaningful label mappings
3. **Regular Sync**: Daily automation keeps boards aligned
4. **Review Sync Reports**: Check GitHub Actions logs for issues
5. **Backup Before Bulk Changes**: Export board state before major reorganizations

## File Locations

- **Board**: `docs/agile/boards/generated.md`
- **Tasks**: `docs/agile/tasks/*.md`
- **Process Configs**: `docs/agile/process/*.yaml`
- **Kanban Config**: `promethean.kanban.json`
- **Templates**: `docs/agile/templates/task.stub.template.md`

## Related Documentation

- [Kanban CLI Reference](../packages/kanban/README.md)
- [Task Template Guide](templates/task.stub.template.md)
- [Process Configuration](process/duck-revival.yaml)
- [GitHub Actions Workflows](../../.github/workflows/)
