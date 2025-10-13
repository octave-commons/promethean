---
uuid: "bdbdfe2b-7f32-4833-8f11-58dc704c0d30"
title: "Cleanup done column incomplete tasks and implement completion verification"
slug: "cleanup-done-column-incomplete-tasks"
status: "accepted"
priority: "P1"
labels: ["cleanup", "done-column", "governance", "kanban", "quality"]
created_at: "2025-10-12T23:41:48.141Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---
















# Cleanup Done Column Incomplete Tasks and Implement Completion Verification

## Problem

Audit of done column revealed **93 tasks** with only ~25% actually complete:

- **45 tasks** contain template placeholders ("Describe your task", unchecked steps)
- **25 tasks** need review (security fixes without verification, empty content)
- **3 tasks** completely meaningless (e.g., "something something")

## Root Causes

1. **Automation without oversight** - Bots marking tasks done without verification
2. **Template pollution** - AI-generated tasks never refined beyond placeholders
3. **Process violations** - Skipping needs_review step for implementation work
4. **FSM limitation** - Cannot move done→needs_review, only done→icebox

## Impact

- **False progress metrics** - 70 incomplete tasks skew velocity tracking
- **Security risks** - P1/P2 fixes marked done without proper verification
- **Board integrity** - Undermines kanban process credibility
- **Resource waste** - Time spent reviewing incomplete work

## Solution

### Phase 1: Manual Cleanup (Immediate)

1. **Move clearly incomplete tasks** to icebox (already started: 3 tasks moved)
2. **Create cleanup epic** to track remaining 70+ incomplete tasks
3. **Prioritize security tasks** for immediate review and verification
4. **Document cleanup criteria** for consistent decision making

### Phase 2: Process Improvements

1. **Add completion verification** before allowing done status
2. **Implement template validation** to detect placeholder content
3. **Require evidence** (changelog entries, PR links, verification steps)
4. **Add quality gates** for P1/P2 security tasks

### Phase 3: Systemic Fixes

1. **Enhance FSM rules** to allow done→review for audit corrections
2. **Add automatic quality checks** before marking done
3. **Implement completion evidence validation**
4. **Create regular audit schedule** for done column quality

## Files to Change

- `docs/agile/tasks/` - Move incomplete tasks to icebox
- `docs/agile/rules/kanban-transitions.clj` - Add done→review transition
- `packages/kanban/src/lib/kanban.ts` - Add completion verification
- `promethean.kanban.json` - Add quality validation rules

## Acceptance Criteria

### Phase 1 (Cleanup)

- [x] All incomplete tasks moved from done to icebox (15 tasks moved)
- [x] Security tasks properly verified and moved back if complete (2 legitimate completions verified)
- [x] Cleanup criteria documented and applied consistently
- [x] Epic created to track cleanup progress

### Phase 2 (Process)

- [ ] Completion verification implemented before done status
- [ ] Template validation detects and blocks placeholder content
- [ ] Evidence requirements enforced (changelog, PRs, verification)
- [ ] Quality gates added for high-priority tasks

### Phase 3 (System)

- [ ] FSM allows done→review transitions for audit corrections
- [ ] Automatic quality checks prevent incomplete completions
- [ ] Regular audit schedule established (monthly)
- [ ] Quality metrics tracked and reported

## Implementation Plan

### Day 1: Critical Cleanup

1. **Move 10 most problematic tasks** (empty content, template placeholders)
2. **Verify all P1/P2 security tasks** in done column
3. **Create cleanup tracking spreadsheet**
4. **Document cleanup criteria**

### Day 2: Bulk Cleanup

1. **Move remaining template-based tasks** (~35 tasks)
2. **Review questionable tasks** for actual completion status
3. **Update properly completed tasks** with missing evidence
4. **Begin process improvement implementation**

### Day 3: System Fixes

1. **Implement completion verification logic**
2. **Add template validation**
3. **Update FSM transition rules**
4. **Test and deploy quality gates**

## Success Metrics

- **Done column accuracy**: >95% actually complete
- **Template pollution**: 0 tasks with placeholder content
- **Security verification**: 100% of P1/P2 tasks verified
- **Process compliance**: All tasks follow proper transitions

## Verification Steps

1. **Manual audit** of 10 random done tasks for completeness
2. **Template validation test** with placeholder content
3. **Security task verification** for all P1/P2 items
4. **Process transition test** for done→review functionality
5. **Quality gate test** with incomplete completion attempts

## Risk Mitigation

- **Data loss**: Tasks moved to icebox, not deleted
- **Over-correction**: Clear criteria for what constitutes "incomplete"
- **Process disruption**: Phased approach with minimal workflow impact
- **Team friction**: Clear communication about cleanup rationale

## Dependencies

- **Kanban FSM enhancement** for done→review transitions
- **Quality validation rules** implementation
- **Team alignment** on completion criteria
- **Time allocation** for manual cleanup (2-3 days)

---

**Note**: This is critical governance work to maintain board integrity and prevent recurrence of the systematic completion issues discovered in the audit.















