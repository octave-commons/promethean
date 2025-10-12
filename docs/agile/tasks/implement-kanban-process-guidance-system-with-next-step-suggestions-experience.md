---
uuid: "c3d4e5f6-a7b8-c901-def2-345678901234"
title: "Implement kanban process guidance system with next-step suggestions -experience"
slug: "implement-kanban-process-guidance-system-with-next-step-suggestions-experience"
status: "incoming"
priority: "P2"
labels: ["automation", "enhancement", "guidance", "kanban", "process", "user-experience"]
<<<<<<< HEAD
created_at: "2025-10-12T22:46:41.456Z"
=======
created_at: "2025-10-12T21:40:23.577Z"
>>>>>>> bug/kanban-duplication-issues
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
## Issue

Current kanban system enforces rules but doesn't provide proactive guidance. Users must:
- Manually determine which transitions are valid
- Guess what process steps are missing
- Navigate complex transition rules without assistance
- Understand process requirements through documentation only

## Proposed Solution

Create an intelligent guidance system that provides:
1. **Next-Step Suggestions**: Show valid transitions from current state
2. **Process Completion Status**: Highlight missing requirements for each step
3. **Interactive Checklists**: Guide users through 6-step process completion
4. **Contextual Help**: Provide process documentation at point of need
5. **Smart Recommendations**: Suggest optimal paths based on task properties

## Technical Requirements

### Core Guidance Features
1. **Transition Suggestion Engine**
   - Calculate valid next states from current position
   - Rank suggestions by process flow priority
   - Explain why each transition is valid/invalid

2. **Process Step Validation**
   - Check completion status for each of the 6 process steps
   - Identify missing acceptance criteria, estimates, documentation
   - Provide specific remediation guidance

3. **Interactive Checklists**
   - Dynamic checklists based on current task state
   - Real-time validation of checklist items
   - Progress tracking through process steps

4. **Contextual Help System**
   - Inline process documentation
   - Hover tooltips for complex transitions
   - Links to relevant process sections

## Acceptance Criteria

1. Implement transition suggestion algorithm with confidence scoring
2. Create process step validation with clear completion status
3. Build interactive checklist system for 6-step workflow
4. Add contextual help integration with process documentation
5. Provide smart recommendations based on task properties and history
6. Create CLI commands for guidance and suggestions
7. Add visual indicators for process completion status

## Files to Modify

- `packages/kanban/src/lib/guidance-engine.ts` (new guidance module)
- `packages/kanban/src/lib/transition-rules.ts` (extend for suggestions)
- `packages/kanban/src/cli/command-handlers.ts` (add guidance commands)
- `packages/kanban/src/lib/process-validator.ts` (new validation module)
- `promethean.kanban.json` (add guidance configuration)

## Implementation Plan

### Phase 1: Suggestion Engine (3 hours)
- Implement transition possibility calculation
- Add confidence scoring for suggestions
- Create recommendation ranking algorithm

### Phase 2: Process Validation (2 hours)
- Build step completion checking logic
- Implement requirement validation (acceptance criteria, estimates)
- Create missing requirement identification

### Phase 3: Interactive Checklists (2 hours)
- Design dynamic checklist system
- Implement real-time validation
- Add progress tracking features

### Phase 4: Contextual Help (1 hour)
- Integrate process documentation
- Add tooltip and help system
- Create contextual documentation links

### Phase 5: CLI Integration (1 hour)
- Add guidance commands to kanban CLI
- Implement suggestion display
- Test end-to-end user experience

### Phase 6: Visual Indicators (1 hour)
- Add process completion status to task display
- Implement visual progress indicators
- Create status overview commands

## User Experience Flow

### Before Transition
```
Current State: breakdown
Task: "Fix kanban type errors"

📋 Process Completion:
✅ Step 1: Intake & Associate - Complete
✅ Step 2: Clarify & Scope - Complete
❌ Step 3: Breakdown & Estimate - Missing Fibonacci score
❌ Step 4: Ready Gate - Cannot proceed until Step 3 complete

🔄 Suggested Next Steps:
1. breakdown → ready (Add Fibonacci estimate ≤5)
2. breakdown → accepted (Needs more clarification)
3. breakdown → rejected (If task is non-viable)

💡 To proceed to 'ready':
- Add estimates.complexity with Fibonacci score (1,2,3,5,8,13)
- Ensure acceptance criteria are documented
- Verify task is scoped for single session
```

### Command Interface
```bash
# Show guidance for current task
pnpm kanban guidance <task-id>

# Show suggested next states
pnpm kanban suggest <task-id>

# Show process completion checklist
pnpm kanban checklist <task-id>

# Show what's needed for specific transition
pnpm kanban requirements <task-id> <target-state>
```

## Success Metrics

- Users can identify valid next states without consulting documentation
- Process step completion status is clearly visible
- 90% reduction in process rule violations
- Improved user satisfaction with kanban workflow
- Faster task throughput due to better guidance

## Technical Architecture

### Guidance Engine
- Analyzes current task state and properties
- Calculates valid transitions using existing rules engine
- Ranks suggestions based on process flow and task properties
- Provides context-aware recommendations

### Process Validator
- Checks completion of each 6-step process requirement
- Validates specific artifacts (acceptance criteria, estimates, documentation)
- Identifies gaps and provides specific remediation steps
- Maintains state of process completion

### Interactive Checklist System
- Dynamic checklists based on current task state and target transitions
- Real-time validation of checklist items
- Progress tracking through multi-step processes
- Integration with guidance engine for next-step suggestions

## Verification Steps

1. Test guidance suggestions match expected process flow
2. Verify process validation correctly identifies missing requirements
3. Confirm interactive checklists update in real-time
4. Check contextual help provides relevant information
5. Validate CLI commands provide helpful guidance
6. Test visual indicators accurately reflect process completion








































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
