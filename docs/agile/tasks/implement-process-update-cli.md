---
uuid: "task-implement-cli-2025-10-15"
title: "Implement Process Update CLI"
slug: "implement-process-update-cli"
status: "incoming"
priority: "P1"
labels: ["kanban", "cli", "process-update", "user-interface"]
created_at: "2025-10-15T13:58:00Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.288Z"
    action: "Bulk commit tracking initialization"
---

# Implement Process Update CLI

## 🎯 Task Overview

Create the command-line interface for the kanban process update system with plan/execute modes, comprehensive output, and user-friendly interaction patterns.

## 📋 Acceptance Criteria

- [ ] Create `kanban process update <status-name>` command
- [ ] Implement plan mode with read-only analysis
- [ ] Build execute mode with confirmation prompts
- [ ] Add verbose output and progress reporting
- [ ] Create help system and usage examples

## 🔧 Implementation Details

### CLI Command Structure

#### Main Command

```bash
pnpm kanban process update <status-name> [options]
```

#### Options

```bash
--plan              # Show what would be changed without executing
--execute           # Execute the migration (requires confirmation)
--force             # Skip confirmation prompts
--verbose, -v       # Detailed output
--quiet, -q         # Minimal output
--dry-run           # Alias for --plan
--backup-dir <path> # Custom backup directory
--config <path>     # Custom config file
```

### Core CLI Components

#### 1. Command Parser

```typescript
class ProcessUpdateCommand {
  async parse(args: string[]): Promise<CommandOptions>;
  async validate(options: CommandOptions): Promise<ValidationResult>;
  async execute(options: CommandOptions): Promise<CommandResult>;
}
```

#### 2. Plan Mode Handler

```typescript
class PlanModeHandler {
  async generatePlan(statusName: string): Promise<MigrationPlan>;
  async displayPlan(plan: MigrationPlan): Promise<void>;
  async exportPlan(plan: MigrationPlan, format: 'json' | 'markdown'): Promise<void>;
}
```

#### 3. Execute Mode Handler

```typescript
class ExecuteModeHandler {
  async requestConfirmation(plan: MigrationPlan): Promise<boolean>;
  async executeMigration(plan: MigrationPlan): Promise<MigrationResult>;
  async displayResults(result: MigrationResult): Promise<void>;
}
```

### User Experience Design

#### 1. Plan Mode Output

```
🔍 Kanban Process Update Plan
================================

Target Status: "todo" → "backlog"
Migration ID: mig-2025-10-15-todo-backlog

📊 Impact Analysis:
- Tasks affected: 47
- Files to update: 3
- Estimated time: 2-3 minutes

📁 Files to be modified:
1. promethean.kanban.json
   - Update statusValues array
   - Modify transition rules
   - Update WIP limits

2. docs/agile/process.md
   - Update FSM diagram
   - Modify transition documentation
   - Update mermaid flowchart

3. docs/agile/rules/kanban-transitions.clj
   - Update status references
   - Modify transition functions
   - Update column-key normalization

⚠️  Warnings:
- 47 tasks will need status migration
- Agent tool conflicts will be resolved
- Backward compatibility maintained for 30 days

💡 Next Steps:
Run with --execute to apply these changes
Use --verbose for detailed impact analysis
```

#### 2. Execute Mode Interaction

```
🚀 Ready to Execute Migration
==============================

Migration ID: mig-2025-10-15-todo-backlog
Target: "todo" → "backlog"
Impact: 47 tasks, 3 files updated

⚠️  This will modify your kanban configuration.
A backup will be created automatically.

Do you want to proceed? [y/N] y

🔄 Executing migration...
[████████████████████] 100% Complete

✅ Migration completed successfully!
📊 Results:
- 3 files updated
- 47 tasks migrated
- 0 errors encountered
- Backup created: .kanban-backup-2025-10-15-13-58-00

🔗 Next Steps:
- Run 'pnpm kanban regenerate' to refresh the board
- Test agent workflows with new status names
- Monitor for any issues over the next 24 hours
```

### Error Handling & Recovery

#### 1. Validation Errors

```
❌ Validation Failed
===================

Error: Status "invalid" not found in current configuration

Valid statuses:
- icebox, incoming, accepted, breakdown
- blocked, ready, todo, in_progress
- testing, review, document, done, rejected

💡 Use 'pnpm kanban process list' to see all available statuses
```

#### 2. Conflict Resolution

```
⚠️  Conflicts Detected
======================

Migration cannot proceed due to conflicts:

1. File conflict: docs/agile/process.md
   - Local changes detected
   - Please commit or stash changes first

2. Dependency conflict: agents-workflow integration
   - Active workflows using "todo" status
   - Wait for workflows to complete or use --force

💡 Resolution Options:
- Commit/stash conflicting changes
- Use --force to override (not recommended)
- Wait for active workflows to complete
```

## 🧪 Testing Requirements

### Unit Tests

- Command parsing and validation
- Plan generation and display
- Execute mode workflow
- Error handling scenarios

### Integration Tests

- End-to-end CLI workflows
- File system integration
- User interaction patterns
- Backup and recovery procedures

### User Experience Tests

- Command discovery and help system
- Output clarity and formatting
- Error message usefulness
- Progress reporting accuracy

## 🎯 Definition of Done

Implementation complete with:

1. Fully functional CLI command with all options
2. Intuitive plan mode with comprehensive impact analysis
3. Safe execute mode with confirmation and rollback
4. Clear, actionable output and error messages
5. Complete help system and usage examples
6. Comprehensive test coverage for all scenarios

---

_Created: 2025-10-15T13:58:00Z_
_Epic: Kanban Process Update & Migration System_
