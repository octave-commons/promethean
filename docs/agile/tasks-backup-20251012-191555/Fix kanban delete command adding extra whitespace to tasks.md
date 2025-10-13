---
uuid: "d449c0ad-d206-43d2-987c-8a8b342906de"
title: "Fix kanban delete command adding extra whitespace to tasks"
slug: "Fix kanban delete command adding extra whitespace to tasks"
status: "ready"
priority: "P2"
labels: ["kanban", "delete", "command", "extra"]
created_at: "2025-10-12T23:41:48.142Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## Issue Description

The kanban delete command is currently adding extra whitespace to many tasks when they are processed. This is causing formatting issues and making the task files harder to read and maintain.

## Root Cause Analysis Needed

- Investigate the kanban delete command implementation
- Identify where extra whitespace is being introduced
- Check if this affects task frontmatter, content, or both
- Determine if this is a systematic issue or affects specific scenarios

## Tasks to Complete

### 1. Investigation Phase
- [ ] Examine the kanban delete command source code in `@promethean/kanban` package
- [ ] Create test cases to reproduce the whitespace issue
- [ ] Identify the exact conditions that trigger extra whitespace addition
- [ ] Document the scope of the problem (which files/sections are affected)

### 2. Fix Implementation
- [ ] Implement proper whitespace handling in the delete command
- [ ] Ensure task file formatting is preserved during deletion operations
- [ ] Add safeguards to prevent future whitespace issues
- [ ] Test the fix with various task formats and edge cases

### 3. Testing & Validation
- [ ] Write comprehensive tests for the delete command
- [ ] Test with tasks containing different frontmatter structures
- [ ] Verify no whitespace is added to remaining tasks after deletion
- [ ] Test edge cases (empty tasks, tasks with special formatting, etc.)

### 4. Cleanup & Documentation
- [ ] Clean up any existing tasks that have extra whitespace from this issue
- [ ] Update documentation if needed
- [ ] Add regression tests to prevent future occurrences

## Definition of Done

- [ ] Kanban delete command no longer adds extra whitespace to any task files
- [ ] All existing tests pass and new tests are added
- [ ] Manual testing confirms the fix works across different scenarios
- [ ] No regression in other kanban commands
- [ ] Documentation is updated if necessary

## Technical Notes

- Focus on the `@promethean/kanban` package implementation
- Pay special attention to file writing operations and string manipulation
- Consider using proper YAML/Markdown parsing libraries to avoid manual string operations
- Ensure the fix doesn't impact performance significantly

## Priority

This is a **P2** priority issue as it affects the core functionality of the kanban system and impacts user experience when managing tasks.

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing










