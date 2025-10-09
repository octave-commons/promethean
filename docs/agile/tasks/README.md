# Kanban Tasks Index

This directory contains all kanban task documentation for the Promethean project. Each task file includes metadata, requirements, and status tracking.

## 📊 Task Statistics

- **Total Tasks**: 642
- **Last Updated**: 2025-10-08
- **Format**: Markdown with YAML frontmatter

## 🗂️ Task Organization

### By Status

Tasks are organized into the following kanban columns:

| Status          | Description                       | Count |
| --------------- | --------------------------------- | ----- |
| **icebox**      | Backlog items not yet prioritized | ~200  |
| **incoming**    | New tasks awaiting triage         | ~150  |
| **accepted**    | Approved and ready for breakdown  | ~20   |
| **breakdown**   | Tasks being refined and split     | ~15   |
| **blocked**     | Tasks with dependencies           | ~5    |
| **ready**       | Ready to start work               | ~30   |
| **todo**        | Planned work                      | ~80   |
| **in_progress** | Currently being worked on         | ~8    |
| **review**      | Awaiting review                   | ~2    |
| **document**    | Documentation tasks               | ~8    |
| **done**        | Completed tasks                   | ~120  |

### By Priority

| Priority | Description                               | Typical Tasks                          |
| -------- | ----------------------------------------- | -------------------------------------- |
| **P1**   | Critical - blockers, security issues      | Infrastructure fixes, security patches |
| **P2**   | High - important features, technical debt | Core features, refactoring             |
| **P3**   | Medium - enhancements, documentation      | New features, docs, improvements       |
| **P4**   | Low - nice to have, future work           | Research, experimental features        |

## 🔍 Task File Structure

Each task file follows this structure:

```markdown
---
uuid: 'unique-identifier'
title: 'Task Title'
slug: 'task-slug'
status: 'current-status'
priority: 'P1|P2|P3|P4'
labels: ['tag1', 'tag2']
created_at: 'YYYY-MM-DDTHH:MM:SSZ'
estimates:
  complexity: 'low|medium|high'
  scale: 'small|medium|large'
  time_to_completion: 'estimated-hours'
---

# Task Title

## Description

Detailed task description and context.

## Goals

- Specific objectives
- Success criteria

## Requirements

- [ ] Specific requirement 1
- [ ] Specific requirement 2

## Subtasks

- [ ] Subtask 1
- [ ] Subtask 2

## Related Work

Links to related tasks, PRs, or documentation.

## History

Status changes and significant updates.
```

## 🏷️ Common Labels

### Functional Labels

- `agents` - Agent-related work
- `documentation` - Documentation tasks
- `infrastructure` - Infrastructure and tooling
- `pipeline` - CI/CD and build pipelines
- `security` - Security-related tasks
- `testing` - Test development and fixes

### Process Labels

- `docops` - Documentation operations
- `kanban` - Kanban system improvements
- `refactor` - Code refactoring
- `enhancement` - Feature enhancements

### Technology Labels

- `typescript` - TypeScript-related work
- `audio` - Audio processing
- `discord` - Discord integration
- `web` - Web interfaces
- `database` - Database work

## 📋 Key Task Categories

### 🚀 Agent Development

Tasks related to agent creation, enhancement, and maintenance:

- Cephalon (Discord agent)
- Duck Web (Web interface)
- ENSO Gateway (Browser integration)
- SmartGPT Bridge

### 🏗️ Infrastructure

Core system infrastructure and tooling:

- Build systems and pipelines
- Package management
- Development tooling
- Process management

### 📚 Documentation

Documentation and knowledge management:

- Technical documentation
- API documentation
- Process guides
- User guides

### 🔧 Maintenance

System maintenance and improvements:

- Bug fixes
- Performance optimization
- Security updates
- Code quality

## 🔍 Finding Tasks

### By CLI

```bash
# List all tasks
pnpm kanban list

# Search tasks by keyword
pnpm kanban search "typescript"

# Get tasks by status
pnpm kanban getColumn todo

# Get tasks by priority
pnpm kanban search "p1"
```

### By File System

```bash
# Find tasks by label in filename
ls docs/agile/tasks/*typescript*

# Find recent tasks by date
ls docs/agile/tasks/202510*

# Find documentation tasks
ls docs/agile/tasks/*doc*
```

## 📝 Task Creation

New tasks are created using the template at `docs/agile/templates/task.stub.template.md`:

```bash
# Create new task (interactive)
pnpm kanban create "New task title"

# Create task with specific template
cp docs/agile/templates/task.stub.template.md docs/agile/tasks/my-task.md
```

## 🔄 Task Lifecycle

1. **Creation** → `incoming`
2. **Triage** → `accepted` or `rejected`
3. **Breakdown** → `breakdown`
4. **Ready** → `ready`
5. **Work** → `todo` → `in_progress`
6. **Review** → `review`
7. **Completion** → `done`

## 📊 Reporting

Generate reports on task status and progress:

```bash
# Task counts by column
pnpm kanban count

# Generate board
pnpm kanban regenerate

# Export task data
pnpm kanban export > tasks.json
```

## 🔗 Related Documentation

- [Kanban Process](../process/kanban-process-fundamentals.md)
- [Board Management](../boards/generated.md)
- [Task Template](../templates/task.stub.template.md)
- [CLI Reference](../../../packages/kanban/README.md)

## 📈 Recent Activity

### Completed This Week

- Board sync workflow documentation
- Agent ecosystem launch flows standardization
- Enso event family audit completion

### In Progress

- CommonJS artifact removal (inventory complete)
- Pipeline documentation review
- Kanban tasks index creation

### Upcoming

- Agent ecosystem health monitoring
- TypeScript build optimization
- Documentation site generation
