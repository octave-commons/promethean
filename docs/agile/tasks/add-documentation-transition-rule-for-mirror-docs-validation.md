---
uuid: "doc-transition-rule-001"
title: "Add documentation transition rule for mirror docs validation"
slug: "add-documentation-transition-rule-for-mirror-docs-validation"
status: "incoming"
priority: "P1"
labels: ["kanban", "documentation", "quality-control", "transition-rules", "validation", "process"]
created_at: "2025-10-13T16:45:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Overview

Implement a transition rule for the documentation step that validates mirror documentation completeness before allowing task completion. This ensures all code changes are properly documented in the docs/:code-change directory before tasks can move to Done status.

## Current Gap

The kanban workflow includes a "Document" step in the process, but there's no validation to ensure:
- Mirror documentation was created in docs/:code-change directory
- Documentation completeness matches the implemented changes
- Documentation quality meets project standards

## Requirements

### 1. Transition Rule Enhancement
- Add new validation function `documentation-mirror-complete?` to `docs/agile/rules/kanban-transitions.clj`
- Integrate with existing `document → done` transition rule
- Check for mirror docs existence in `docs/:code-change/` directory structure

### 2. Validation Logic
The transition rule should verify:
- Mirror documentation file exists for the task/code changes
- Documentation follows established frontmatter structure
- Documentation content matches the scope of implemented changes
- Documentation includes proper sections (overview, implementation, testing, etc.)

### 3. Integration Points
- Modify `promethean.kanban.json` transition rules to use new validation
- Ensure compatibility with existing kanban CLI commands
- Maintain backward compatibility with current workflow

## Implementation Plan

### Phase 1: Create Validation Function (45 minutes)
1. Add `documentation-mirror-complete?` function to `kanban-transitions.clj`
2. Implement file system check for docs/:code-change directory
3. Add frontmatter validation for mirror docs
4. Test validation logic with sample tasks

### Phase 2: Update Transition Rules (30 minutes)
1. Modify `document → done` transition in `promethean.kanban.json`
2. Update `documentation-complete?` function to call new validation
3. Ensure proper error messages for failed validation
4. Test transition enforcement

### Phase 3: Testing & Validation (45 minutes)
1. Create test scenarios for various documentation states
2. Verify transition blocking when docs are missing
3. Confirm transition allows completion when docs are present
4. Test error message clarity and helpfulness

## Acceptance Criteria

1. **Mirror Doc Detection**: Transition rule detects missing mirror documentation in docs/:code-change
2. **Quality Validation**: Validates frontmatter structure and content completeness
3. **Clear Error Messages**: Provides specific guidance when documentation is incomplete
4. **Workflow Integration**: Seamlessly integrates with existing kanban transition system
5. **Backward Compatibility**: Doesn't break existing task workflows

## Technical Details

### Files to Modify
- `docs/agile/rules/kanban-transitions.clj` - Add validation function
- `promethean.kanban.json` - Update transition rule configuration

### New Function Signature
```clojure
(defn documentation-mirror-complete?
  "Check if mirror documentation exists and is complete for task changes"
  [task board]
  ;; Implementation details
  )
```

### Validation Checklist
- [ ] Mirror doc file exists in docs/:code-change/
- [ ] Frontmatter contains required fields (title, uuid, status, etc.)
- [ ] Documentation content matches task scope
- [ ] Documentation follows project template structure
- [ ] No template placeholders remain in documentation

## Success Metrics

- 100% of tasks moving to Done have corresponding mirror documentation
- Zero tasks with incomplete or missing documentation reach Done status
- Clear, actionable error messages guide users to complete documentation
- No regression in existing kanban workflow functionality

## Dependencies

- Existing kanban transition rule system
- File system access to docs/:code-change directory
- Frontmatter parsing utilities (already available in project)

## Risk Mitigation

- **False Positives**: Ensure validation doesn't block legitimate completions
- **Performance**: Keep file system checks efficient
- **Flexibility**: Allow for different documentation patterns while maintaining quality

## Testing Strategy

1. **Unit Tests**: Test validation function with various scenarios
2. **Integration Tests**: Test transition rule enforcement end-to-end
3. **User Acceptance**: Verify error messages are helpful and actionable
4. **Regression Tests**: Ensure existing workflows remain functional

## Rollout Plan

1. Implement in development environment
2. Test with sample tasks and documentation
3. Gradual rollout with monitoring
4. Full deployment after validation

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- Task: "Implement automated documentation review system" (depends on this validation foundation)
