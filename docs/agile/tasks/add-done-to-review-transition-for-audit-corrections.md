---
title: 'Add done→review transition for audit corrections and quality control'
description: 'Enable moving tasks from done back to needs_review for audit corrections and quality control'
uuid: done-review-transition-001
labels:
  - kanban
  - fsm
  - transitions
  - audit
  - quality-control
priority: P2
status: done
created_at: '2025-01-08T22:50:00.000Z'
estimates:
  complexity: 3
  time_to_completion: '2 hours'
---

# Add Done→Review Transition for Audit Corrections and Quality Control

## Problem

Current kanban FSM only allows `done → icebox` transitions, preventing proper audit corrections:

- **70+ incomplete tasks** stuck in done column from recent audit
- **No path to review** tasks marked done in error
- **Forced icebox detour** requires manual reprocessing
- **Quality control limited** by one-way done transition

## Root Cause

FSM transition rules in `kanban-transitions.clj` don't include `done → needs_review` path:

```clojure
(case (column-key source-column)
  ("done" ["icebox"])  ; Only icebox allowed from done
  ...)
```

## Impact

- **Audit corrections difficult** - Must move to icebox then reprocess
- **Quality control limited** - Cannot review questionable completions
- **Process inefficiency** - Extra steps for proper corrections
- **Board integrity risk** - Incomplete tasks remain in done column

## Solution

### Phase 1: Add Transition Rule

1. **Update FSM rules** to allow `done → needs_review`
2. **Add validation** for audit correction scenarios
3. **Implement quality gate** for review transition
4. **Add audit trail** for corrections

### Phase 2: Quality Controls

1. **Add correction reason** requirement for done→review moves
2. **Implement correction logging** for audit tracking
3. **Add correction limits** to prevent abuse
4. **Create correction reporting** for governance

## Files to Change

- `docs/agile/rules/kanban-transitions.clj` - Add done→review transition
- `packages/kanban/src/lib/kanban.ts` - Add correction validation
- `packages/kanban/src/cli/command-handlers.ts` - Add reason requirement

## Acceptance Criteria

1. **FSM allows done→review** transition with proper validation ✅
2. **Correction reason required** when moving from done to review ✅
3. **Correction logged** for audit trail purposes ✅
4. **Quality gate prevents abuse** of correction mechanism ✅
5. **Clear error messages** guide proper correction usage ✅

## Implementation Plan

### Step 1: Update Transition Rules (30 min) ✅

```clojure
;; Added to valid-transitions-from function
("done" ["icebox" "review"])
```

### Step 2: Add Validation Logic (45 min) ✅

- ✅ Require correction reason for done→review moves
- ✅ Add correction logging to task metadata
- ✅ Implement correction limits (e.g., max 3 corrections per task)

### Step 3: Update CLI (30 min) ✅

- ✅ Add reason parameter to update-status command
- ✅ Add correction logging to output
- ✅ Add validation messages

### Step 4: Testing (15 min) ✅

- ✅ Test done→review transition with reason
- ✅ Test rejection without reason
- ✅ Verify correction logging works

## Technical Implementation

### FSM Rule Update ✅

```clojure
(defn correction-justified?
  "Task has valid reason for audit correction"
  [task board]
  (and (:correction-reason task)
       (< (get-in task [:corrections :count] 0) 3)))
```

### CLI Enhancement ✅

```bash
pnpm kanban update-status <uuid> review --reason "Audit: incomplete completion evidence"
```

### Correction Logging ✅

```yaml
corrections:
  count: 1
  history:
    - timestamp: '2025-01-08T22:50:00Z'
      from: 'done'
      to: 'review'
      reason: 'Audit: incomplete completion evidence'
```

### Files Changed ✅

1. **`docs/agile/rules/kanban-transitions.clj`**:

   - Added `done → review` transition to `valid-transitions-from`
   - Added `correction-justified?` validation function
   - Updated `evaluate-transition` with special validation for audit corrections

2. **`packages/kanban/src/lib/types.ts`**:

   - Added `corrections` field to Task type with count and history

3. **`packages/kanban/src/lib/kanban.ts`**:

   - Added `correctionReason` parameter to `updateStatus` function
   - Implemented correction logging with timestamp and reason
   - Updated `toFrontmatter` to serialize corrections history

4. **`packages/kanban/src/cli/command-handlers.ts`**:
   - Added `--reason` parameter parsing to `handleUpdateStatus`
   - Pass correction reason to `updateStatus` function

## Success Metrics

- **Done→review transitions work** with proper validation
- **Correction reasons captured** for all audit corrections
- **Correction logging provides** audit trail
- **Quality gates prevent** abuse of correction mechanism
- **Clear error messages** guide proper usage

## Verification Steps

1. **Test valid transition**: Move task from done to review with reason
2. **Test invalid transition**: Attempt move without reason (should fail)
3. **Test correction logging**: Verify correction metadata is saved
4. **Test correction limits**: Verify limits prevent abuse
5. **Test error messages**: Confirm clear guidance provided

## Risk Mitigation

- **Abuse prevention**: Correction limits and validation
- **Audit trail**: All corrections logged with reasons
- **Process integrity**: Quality gates maintain workflow standards
- **Backward compatibility**: Existing transitions unchanged

## Dependencies

- **FSM rule update** in kanban-transitions.clj
- **CLI enhancement** for reason parameter
- **Validation logic** implementation
- **Testing and deployment**

---

**Note**: This enhancement enables proper audit corrections while maintaining process integrity through validation and logging.
