# Kanban CLI — reference

> NOTE: Frontmatter **labels** are deprecated. Use **`tags:`** (lowercase) in YAML frontmatter.
> Generators (e.g., `generate-by-tags`) filter by **frontmatter `tags`** and do not read body "Tags:" headers.

## Common commands

- `pnpm kanban regenerate` — rebuilds `docs/agile/boards/generated.md` from task files.
- `pnpm kanban getColumn <name>` — prints column JSON for auditing.
- `pnpm kanban update <uuid> --content <markdown>` — append content to a task file.
- `pnpm kanban update-status <uuid> <column>` — FSM transition respecting WIP.
- `pnpm kanban enforce-wip-limits [--report|--fix]` — detect/fix WIP violations.
- `pnpm kanban generate-by-tags "<tag> [<tag> ...]" --kanban <out.md>` — write a filtered board view by tags.

# Kanban CLI Reference

Complete reference for all `@promethean/kanban` CLI commands.

## Installation & Setup

```bash
# The kanban CLI is available via pnpm workspace
pnpm kanban --help

# All commands work from any directory in the repository
# No setup required - paths are auto-detected
```

## Command Categories

### 📊 Board Operations

#### `regenerate`

Generate the kanban board from task files.

```bash
pnpm kanban regenerate
```

- Reads all task files from `docs/agile/tasks/`
- Applies WIP limits and FSM rules
- Writes to `docs/agile/boards/generated.md`

#### `sync`

Bidirectional sync between board and task files with conflict reporting.

```bash
pnpm kanban sync
```

#### `pull`

Sync board state from task frontmatter.

```bash
pnpm kanban pull
```

#### `push`

Project board columns back to task files.

```bash
pnpm kanban push
```

#### `count`

Show task counts by column with WIP limit status.

```bash
pnpm kanban count
# Output: {"count":778}
```

### 🔍 Task Discovery

#### `list`

List all tasks with detailed information.

```bash
pnpm kanban list [--verbose]
```

#### `search`

Search tasks by title or content.

```bash
pnpm kanban search <query>
pnpm kanban search "kanban" --verbose
```

#### `find`

Find task by UUID.

```bash
pnpm kanban find <uuid>
```

#### `find-by-title`

Find task by exact title match.

```bash
pnpm kanban find-by-title "Task Title"
```

### 📝 Column Operations

#### `getColumn`

Get tasks in specific column (JSON output).

```bash
pnpm kanban getColumn <column>
pnpm kanban getColumn in_progress
```

#### `getByColumn`

Get formatted tasks for column (markdown output).

```bash
pnpm kanban getByColumn <column>
pnpm kanban getByColumn todo
```

#### `move_up` / `move_down`

Move task up or down within a column.

```bash
pnpm kanban move_up <uuid>
pnpm kanban move_down <uuid>
```

### 🛠️ CRUD Operations

#### `create`

Create a new task.

```bash
pnpm kanban create <title> [options]

# Examples:
pnpm kanban create "Fix kanban bug" --priority P1 --status todo
pnpm kanban create "New feature" --content "Description here" --labels feature,backend
pnpm kanban create "Documentation" --status incoming --priority P2 --labels docs
```

**Options:**

- `--content <text>` - Task description/content
- `--priority <P0|P1|P2|P3>` - Task priority
- `--status <column>` - Initial status (default: incoming)
- `--labels <tag1,tag2>` - Comma-separated tags

#### `update`

Update existing task.

```bash
pnpm kanban update <uuid> [options]

# Examples:
pnpm kanban update abc-123 --title "New title"
pnpm kanban update abc-123 --priority P1 --status in_progress
pnpm kanban update abc-123 --content "Updated description"
```

**Options:**

- `--title <text>` - New title
- `--content <text>` - New content
- `--priority <P0|P1|P2|P3>` - New priority
- `--status <column>` - New status

#### `delete`

Delete a task (requires confirmation).

```bash
pnpm kanban delete <uuid>
pnpm kanban delete <uuid> --confirm  # Skip confirmation
```

### 🔄 Task State Management

#### `update-status`

Move task to different column (enforces WIP limits and FSM rules).

```bash
pnpm kanban update-status <uuid> <column>

# Examples:
pnpm kanban update-status abc-123 in_progress
pnpm kanban update-status abc-123 done
pnpm kanban update-status abc-123 "in progress"  # Spaces are normalized to underscores
pnpm kanban update-status abc-123 "in-progress"  # Hyphens are normalized to underscores
```

**Column Name Normalization:**

- Spaces and hyphens are automatically converted to underscores
- `"in progress"`, `"in-progress"`, and `"in_progress"` all access the same column
- Use quotes for column names with spaces or special characters

**Features:**

- Enforces WIP limits
- Validates FSM transitions
- Provides clear error messages for violations

### 🧠 Advanced Operations

#### `breakdown-task`

AI-powered task breakdown analysis.

```bash
pnpm kanban breakdown-task <uuid>
```

#### `prioritize-tasks`

Task prioritization analysis and suggestions.

```bash
pnpm kanban prioritize-tasks
```

#### `compare-tasks`

Compare two tasks side by side.

```bash
pnpm kanban compare-tasks <uuid1> <uuid2>
```

#### `generate-by-tags`

Generate filtered board for specific tags.

```bash
pnpm kanban generate-by-tags <tags>
pnpm kanban generate-by-tags "kanban,bug"
```

#### `indexForSearch`

Build search index for faster searching.

```bash
pnpm kanban indexForSearch
```

### ⚙️ Process & Workflow

#### `process`

Show workflow process diagram.

```bash
pnpm kanban process
```

#### `show-process`

Display detailed process information.

```bash
pnpm kanban show-process
```

#### `show-transitions`

Show valid transitions between columns.

```bash
pnpm kanban show-transitions
```

#### `enforce-wip-limits`

Check and report WIP limit violations.

```bash
pnpm kanban enforce-wip-limits
```

### 🌐 Development & UI

#### `ui`

Start web UI server for interactive board management.

```bash
pnpm kanban ui [--port <port>] [--host <host>]

# Examples:
pnpm kanban ui --port 3000
pnpm kanban ui --host localhost --port 8080
```

**Features:**

- Interactive drag-and-drop interface
- Real-time task management
- WIP limit visualization
- Mobile-responsive design

#### `dev`

Start development server with live reload.

```bash
pnpm kanban dev [--port <port>] [--host <host>]

# Features:
# - Live reload on file changes
# - WebSocket synchronization
# - Hot module replacement
# - Development tools
```

### 🔍 Audit & Maintenance

#### `audit`

Audit board for issues and inconsistencies.

```bash
pnpm kanban audit [--verbose]
```

**Checks for:**

- Duplicate tasks
- Invalid transitions
- Missing required fields
- Orphaned tasks
- WIP limit violations

#### `doccheck`

Check documentation consistency.

```bash
pnpm kanban doccheck
```

## Global Options

All commands support these global options:

```bash
pnpm kanban [--kanban path] [--tasks path] <command> [args...]

# --kanban path   - Custom board file path (default: docs/agile/boards/generated.md)
# --tasks path    - Custom tasks directory (default: docs/agile/tasks/)
```

## Path Resolution

The kanban CLI automatically resolves paths:

1. **Repo Root Detection**: Walks upward to find `.git` or `pnpm-workspace.yaml`
2. **Config Resolution**: `promethean.kanban.json` paths resolve relative to config file
3. **Working Directory**: Commands work from any subdirectory
4. **Override Support**: CLI flags and environment variables can override paths

## Error Handling

### Common Errors

**WIP Limit Violation:**

```
❌ Transition blocked: WIP limit violation: Cannot move task to 'in_progress' - column has 10 tasks (limit: 3)
```

**Invalid Transition:**

```
❌ Transition blocked: Invalid transition: todo → done is not a defined transition
💡 Suggested alternatives: Valid transitions from todo: in_progress, rejected
```

**Task Not Found:**

```
❌ Task not found: abc-123
```

**Path Issues:**

```
❌ Config file not found: promethean.kanban.json
💡 Run from within the git repository or specify --config path
```

## Configuration

### Config File (`promethean.kanban.json`)

```json
{
  "tasksDir": "docs/agile/tasks",
  "boardFile": "docs/agile/boards/generated.md",
  "wipLimits": {
    "todo": 20,
    "in_progress": 10,
    "testing": 8,
    "review": 6,
    "document": 4
  },
  "columns": [
    { "name": "icebox", "limit": 9999 },
    { "name": "incoming", "limit": 9999 },
    { "name": "accepted", "limit": 5 },
    { "name": "breakdown", "limit": 5 },
    { "name": "ready", "limit": 10 },
    { "name": "todo", "limit": 20 },
    { "name": "in_progress", "limit": 10 },
    { "name": "testing", "limit": 8 },
    { "name": "review", "limit": 6 },
    { "name": "document", "limit": 4 },
    { "name": "done", "limit": 500 },
    { "name": "blocked", "limit": 3 }
  ]
}
```

### Environment Variables

```bash
KANBAN_CONFIG=/path/to/config.json
KANBAN_TASKS_DIR=/path/to/tasks
KANBAN_BOARD_FILE=/path/to/board.md
```

## Examples & Workflows

### Daily Workflow

```bash
# 1. Check current status
pnpm kanban count

# 2. Find work to do
pnpm kanban search "bug" --verbose

# 3. Start working on task
pnpm kanban update-status abc-123 in_progress

# 4. When done
pnpm kanban update-status abc-123 testing

# 5. Regenerate board
pnpm kanban regenerate
```

### Task Creation

```bash
# Quick task
pnpm kanban create "Fix login bug" --priority P1

# Detailed task
pnpm kanban create "Add user authentication" \
  --content "Implement OAuth2 login with GitHub and Google" \
  --priority P1 \
  --status todo \
  --labels feature,auth,frontend
```

### Board Management

```bash
# Start interactive UI
pnpm kanban ui --port 3000

# Audit for issues
pnpm kanban audit --verbose

# Check WIP compliance
pnpm kanban enforce-wip-limits
```

## Integration with Other Tools

### Git Hooks

```bash
# Pre-commit hook to check WIP limits
#!/bin/sh
pnpm kanban enforce-wip-limits || exit 1
```

### CI/CD Pipeline

```bash
# Generate board in CI
- name: Update Kanban Board
  run: |
    pnpm kanban regenerate
    git add docs/agile/boards/generated.md
    git commit -m "Update kanban board [ci skip]"
```

### VS Code Tasks

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Kanban: Regenerate Board",
      "type": "shell",
      "command": "pnpm kanban regenerate"
    },
    {
      "label": "Kanban: Start UI",
      "type": "shell",
      "command": "pnpm kanban ui --port 3000"
    }
  ]
}
```

## Troubleshooting

### Debug Mode

Add `--verbose` or `--debug` to any command for detailed output:

```bash
pnpm kanban list --debug
pnpm kanban regenerate --verbose
```

### Common Issues

1. **Commands not found**: Ensure you're in the git repository
2. **Path resolution**: Check `promethean.kanban.json` exists and paths are correct
3. **Permission errors**: Ensure write access to tasks directory and board file
4. **WIP violations**: Move tasks to appropriate columns before proceeding

### Getting Help

```bash
pnpm kanban --help
pnpm kanban <command> --help  # Command-specific help
```
