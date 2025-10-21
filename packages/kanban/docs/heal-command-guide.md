# Kanban Heal Command Guide

## Overview

The `heal` command provides intelligent healing operations for kanban boards with comprehensive git tag management and scar history tracking. It analyzes board state, identifies issues, and automatically applies fixes while maintaining a complete audit trail.

## Features

- **Intelligent Issue Detection**: Automatically identifies WIP violations, duplicate tasks, missing information, and board health issues
- **Git Tag Management**: Creates annotated git tags for each healing operation with full metadata
- **Scar History**: Maintains a persistent history of all healing operations for analysis and learning
- **Context Building**: Gathers comprehensive context including board state, task analysis, and git history
- **Recommendations**: Provides healing recommendations based on historical patterns
- **Dry Run Mode**: Preview healing operations before applying changes
- **Comprehensive Reporting**: Detailed logs and metrics for all healing operations

## Basic Usage

```bash
# Basic healing operation
kanban heal "Fix WIP limit violations"

# Dry run (no changes made)
kanban heal "Analyze board health" --dry-run

# Get healing recommendations
kanban heal "Board issues" --recommendations

# Analyze scar history
kanban heal "History analysis" --analyze-history
```

## Command Options

### Core Options

- `reason` (required): Description of why healing is needed
- `--dry-run`: Preview changes without applying them
- `--no-tags`: Skip git tag creation
- `--push-tags`: Push created tags to remote repository
- `--no-git`: Skip git history analysis

### Analysis Options

- `--git-depth <number>`: Maximum git history depth (default: 50)
- `--search <term>`: Search terms for finding relevant tasks (can be used multiple times)
- `--column <name>`: Filter analysis to specific columns (can be used multiple times)
- `--label <name>`: Filter analysis to specific labels (can be used multiple times)
- `--no-task-analysis`: Skip detailed task analysis
- `--no-metrics`: Skip performance metrics analysis

### Information Options

- `--recommendations`: Show healing recommendations without executing
- `--analyze-history`: Analyze scar history patterns

## Examples

### Basic Healing

```bash
# Heal WIP violations
kanban heal "Fix WIP limit violations in Todo column"

# Heal duplicate tasks
kanban heal "Remove duplicate tasks and consolidate"

# Heal missing task information
kanban heal "Complete missing task details and estimates"
```

### Advanced Healing with Filters

```bash
# Heal specific column with search terms
kanban heal "Fix backend bugs" \
  --column "In Progress" \
  --search "backend" \
  --search "bug" \
  --label "priority"

# Heal with custom git depth
kanban heal "Comprehensive board cleanup" \
  --git-depth 100 \
  --no-metrics
```

### Dry Run and Analysis

```bash
# Preview what would be healed
kanban heal "Board health check" --dry-run

# Get recommendations only
kanban heal "Board issues" --recommendations

# Analyze healing patterns
kanban heal "Pattern analysis" --analyze-history
```

### Git Integration

```bash
# Create tags and push to remote
kanban heal "Critical bug fixes" --push-tags

# Healing without git integration
kanban heal "Local cleanup" --no-tags --no-git
```

## Healing Operations

The heal command can automatically address various types of issues:

### WIP Limit Violations

- Detects columns exceeding their WIP limits
- Moves excess tasks to appropriate columns
- Updates task statuses to maintain flow

### Duplicate Tasks

- Identifies tasks with identical or similar titles
- Provides options to merge or remove duplicates
- Preserves important information from duplicates

### Missing Information

- Detects tasks missing titles, content, labels, or estimates
- Provides templates for completing missing information
- Suggests appropriate labels based on content

### Board Health Issues

- Analyzes overall board health score
- Identifies bottlenecks and stale tasks
- Suggests process improvements

## Git Tag Management

### Automatic Tag Creation

Each healing operation creates an annotated git tag with:

- **Tag Format**: `heal-YYYY-MM-DD-HH-MM-SS`
- **Tag Message**: Includes reason, metadata, and operation summary
- **Metadata**: Tasks modified, files changed, timing information

### Tag Examples

```bash
# List all heal tags
git tag --sort=-version:refname "heal-*"

# Show tag details
git show heal-2023-10-18-14-30-00

# Push tags to remote
git push origin --tags
```

### Tag Metadata

Tags include comprehensive metadata:

```json
{
  "reason": "Fix WIP limit violations",
  "contextBuildTime": 1250,
  "healingTime": 3400,
  "tasksModified": 3,
  "filesChanged": 2
}
```

## Scar History

### Scar Records

Each healing operation creates a scar record containing:

- **Git Range**: Start and end commit SHAs
- **Tag**: Associated git tag
- **Story**: Detailed narrative of what was healed
- **Timestamp**: When the healing occurred

### Scar Storage

Scars are stored in `.kanban/scars/scars.json`:

```json
[
  {
    "start": "a1b2c3d4e5f6...",
    "end": "f6e5d4c3b2a1...",
    "tag": "heal-2023-10-18-14-30-00",
    "story": "Healing operation: Fixed WIP limit violations...",
    "timestamp": "2023-10-18T14:30:00.000Z"
  }
]
```

### History Analysis

Analyze healing patterns over time:

```bash
kanban heal "Analysis" --analyze-history
```

Output includes:
- Total healing operations
- Success rate
- Most common healing reasons
- Frequently healed files
- Average healing time

## Healing Recommendations

The system provides intelligent recommendations based on:

### Current Board State

- WIP violations and their severity
- Duplicate task groups
- Tasks with missing information
- Board health score

### Historical Patterns

- Similar previous healing operations
- Frequently recurring issues
- Successful resolution strategies
- Files that often need healing

### Example Recommendations

```
🔍 Healing Recommendations:
   • Address 3 WIP limit violations
   • Complete 5 incomplete tasks
   • Resolve 2 duplicate task groups

⚠️  Critical Issues:
   🚨 Todo column exceeds WIP limit (5/3)
      Suggested action: Move 2 tasks to In Progress
   ⚡ 3 tasks have missing estimates
      Suggested action: Add time estimates for better planning

📚 Related Healing Operations:
   • heal-2023-10-15-10-30-00 (relevance: 85%)
     Found 3 related keywords, Similar issue pattern detected
```

## Integration with Workflows

### Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit
kanban heal "Pre-commit validation" --dry-run
if [ $? -ne 0 ]; then
  echo "Board issues detected. Commit aborted."
  exit 1
fi
```

### CI/CD Integration

```yaml
# .github/workflows/kanban-heal.yml
name: Kanban Board Health
on: [push, pull_request]

jobs:
  heal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install kanban
        run: npm install -g @promethean/kanban
      - name: Check board health
        run: kanban heal "CI health check" --recommendations
```

### Scheduled Healing

```bash
# Crontab entry for daily board health check
0 9 * * * cd /path/to/project && kanban heal "Daily health check" --dry-run --push-tags
```

## Configuration

### Environment Variables

- `KANBAN_BOARD_FILE`: Path to board file
- `KANBAN_TASKS_DIR`: Path to tasks directory
- `KANBAN_HEAL_AUTO_PUSH`: Automatically push tags (true/false)

### Configuration Files

Create `.kanban/config.json`:

```json
{
  "heal": {
    "autoCreateTags": true,
    "autoPushTags": false,
    "maxScarsRetained": 100,
    "defaultGitDepth": 50,
    "enableMetrics": true
  }
}
```

## Troubleshooting

### Common Issues

**Git repository not found**
```
Error: Not a git repository: /path/to/project
```
Solution: Initialize git repository or run from git repo root

**Permission denied creating tags**
```
Error: fatal: unable to create directory '.git/refs/tags/heal-...'
```
Solution: Check git repository permissions

**Scar history file corrupted**
```
Error: Failed to load scar history
```
Solution: Remove `.kanban/scars/scars.json` and rebuild

### Debug Mode

Enable debug logging:

```bash
DEBUG=kanban:heal kanban heal "Debug operation"
```

### Recovery

**Restore from scar**
```bash
# Find the scar tag
git tag --sort=-version:refname "heal-*"

# Reset to before the healing
git reset --hard heal-2023-10-18-14-30-00^
```

**Remove incorrect healing**
```bash
# Delete the tag
git tag -d heal-2023-10-18-14-30-00

# Remove scar record
rm .kanban/scars/heal-2023-10-18-14-30-00.*
```

## Best Practices

1. **Always use dry-run first** to preview changes
2. **Provide specific reasons** for better tracking
3. **Review recommendations** before executing healing
4. **Regularly analyze scar history** to identify patterns
5. **Push tags to remote** for team visibility
6. **Set up automated healing** for routine maintenance
7. **Monitor board health score** trends over time
8. **Document healing patterns** for team knowledge sharing

## API Reference

### HealCommandOptions

```typescript
interface HealCommandOptions {
  reason: string;
  dryRun?: boolean;
  createTags?: boolean;
  pushTags?: boolean;
  analyzeGit?: boolean;
  gitHistoryDepth?: number;
  searchTerms?: string[];
  columnFilter?: string[];
  labelFilter?: string[];
  includeTaskAnalysis?: boolean;
  includePerformanceMetrics?: boolean;
}
```

### ExtendedHealingResult

```typescript
interface ExtendedHealingResult extends HealingResult {
  scar?: {
    tag: string;
    startSha: string;
    endSha: string;
  };
  tagResult?: {
    success: boolean;
    tag: string;
    error?: string;
  };
  contextBuildTime?: number;
  healingTime?: number;
  totalTime?: number;
}
```

For more detailed API information, see the TypeScript definitions in the source code.