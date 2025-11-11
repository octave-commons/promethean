---
uuid: 'audit-single-task-001'
title: 'Implement Selective Task Auditing'
slug: 'implement-selective-task-auditing'
status: 'incoming'
priority: 'P1'
storyPoints: 5
lastCommitSha: 'pending'
labels: ['feature', 'auditing', 'security', 'validation', 'quality']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: 5
  scale: 'medium'
  time_to_completion: '3 sessions'
---

# Implement Selective Task Auditing

## Description

Implement command to audit individual tasks on-demand, detecting and automatically repairing common issues like malformed YAML, missing required fields, invalid data types, and security vulnerabilities.

## Acceptance Criteria

- [ ] `pnpm kanban audit <task-uuid>` command validates single task
- [ ] Detects malformed frontmatter/YAML syntax errors
- [ ] Validates required fields are present and correctly typed
- [ ] Auto-repairs common issues (missing storyPoints, malformed estimates)
- [ ] Leaves audit "scar" in task content documenting changes made
- [ ] Rejects tasks with unrepairable security issues
- [ ] Provides detailed audit report with validation errors and fixes applied

## Technical Requirements

- [ ] Use new safe-rule-evaluation.ts with Zod validation
- [ ] Support dry-run mode to preview changes without applying
- [ ] Log all audit actions with timestamps and reasoning
- [ ] Integrate with existing task operations (update-status, move, etc.)
- [ ] Fail fast on security vulnerabilities (quote injection, etc.)

## Security Considerations

- [ ] All task modifications must be validated before applying
- [ ] Audit trail must be tamper-evident
- [ ] No task operation can bypass validation
- [ ] Robots cannot skip auditing - enforced at operation level

## Implementation Notes

Priority: P1 - This is critical security infrastructure that prevents bypassing process controls. Every task operation should route through auditing to ensure compliance and data integrity.
