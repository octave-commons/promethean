---
uuid: "287b9607-3a44-409a-8194-58a1ed3d3a3f"
title: "Enhance kanban process validation with acceptance criteria and Fibonacci scoring"
slug: "enhance-kanban-process-validation"
status: "superseded"
priority: "P2"
labels: ["automation", "enhancement", "kanban", "process", "superseded", "validation"]
created_at: "2025-10-11T19:23:08.664Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---





















## ⚠️ Task Superseded

This task has been **superseded** and consolidated into:

- **New Task**: [Process Governance Cluster - Quality Gates & Workflow Enforcement](2025.10.09.22.15.00-process-governance-cluster.md)
- **UUID**: process-governance-cluster-001
- **Reason**: Consolidated into strategic cluster for better focus and coordination

### Migration Details

- All work and context transferred to new cluster
- Current status and progress preserved
- Assignees notified of change
- Dependencies updated accordingly

### Next Steps

- Please refer to the new cluster task for continued work
- Update any bookmarks or references
- Contact cluster lead for questions

## Original Issue

The kanban package has excellent technical foundations for transition rules but lacks enforcement of critical process steps:

1. **Step 2 (Clarify & Scope)**: No validation of acceptance criteria or outcome documentation
2. **Step 3 (Breakdown & Estimate)**: No Fibonacci score validation (1,2,3,5,8,13)
3. **Step 4 (Ready Gate)**: No ≤5 complexity requirement enforcement
4. **Global Rules**: WIP limits are disabled despite configuration

## Technical Analysis

### Current State

- ✅ Transition rules engine fully implemented
- ✅ All FSM transitions from process.md are defined
- ✅ Clojure DSL available for custom logic
- ❌ Global WIP rules disabled in configuration
- ❌ Custom checks too permissive (e.g., just checking title exists)
- ❌ No validation of acceptance criteria, outcomes, or uncertainty documentation

### Root Cause

The process validation logic exists but the rules are too weak to enforce the 6-step workflow effectively.

## Acceptance Criteria

1. Enable global WIP limit enforcement in configuration
2. Implement acceptance criteria validation for Breakdown → Ready transition
3. Add Fibonacci score validation (only 1,2,3,5,8,13 allowed)
4. Enforce ≤5 complexity requirement for Ready → Todo transition
5. Add process step completion validation (outcomes, uncertainties documented)
6. **Implement completion verification before allowing done status**
7. **Add template validation to detect placeholder content**
8. **Require evidence for completion (changelog, PR links, verification steps)**
9. Provide clear error messages with process guidance
10. Create process compliance dashboard/reporting

## Files to Modify

- `promethean.kanban.json` (enable global rules, enhance custom checks)
- `docs/agile/rules/kanban-transitions.clj` (add validation functions)
- `packages/kanban/src/lib/transition-rules.ts` (improve error messages)

## Implementation Plan

1. **Phase 1** (30 min): Enable global WIP rules
2. **Phase 2** (1 hour): Enhance custom checks for process validation
3. **Phase 3** (2 hours): Add comprehensive acceptance criteria checks
4. **Phase 4** (1 hour): **Implement completion verification and template validation**
5. **Phase 4.5** (1 hour): **Add evidence requirements for done status**
6. **Phase 5** (1 hour): Implement process compliance reporting
7. **Phase 6** (1 hour): Add process guidance and educational features

## Success Metrics

- All tasks moving to Ready must have acceptance criteria
- All tasks in Todo must have Fibonacci scores ≤5
- WIP limits automatically enforced across all columns
- **All tasks marked done have completion evidence and no template placeholders**
- **Template pollution eliminated from done column**
- **P1/P2 security tasks require verification before done status**
- Clear error messages guide users to complete missing process steps
- Process compliance dashboard shows workflow health

## Verification Steps

1. Test transition that should be blocked (e.g., task without acceptance criteria to Ready)
2. Verify WIP limits are enforced when columns reach capacity
3. Confirm Fibonacci scoring validation rejects invalid scores
4. Check error messages provide helpful process guidance
5. Validate process compliance reporting shows accurate metrics




















