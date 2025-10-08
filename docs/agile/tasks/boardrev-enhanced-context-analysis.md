---
uuid: (uuidgen)
title: Enhance boardrev context analysis with weighted factors
status: icebox
priority: P2
labels: [enhancement, boardrev, analysis, accuracy]
created_at: 2025-10-06T12:00:00Z
---

# Enhance boardrev context analysis with weighted factors

## Description
Current simple semantic similarity doesn't account for temporal relevance, code activity, or dependency relationships. Need more sophisticated context matching.

## Proposed Solution
- Weight recent files higher in similarity calculations
- Boost files with recent git blame activity
- Consider file dependency relationships imports/requires
- Add commit message context for related changes
- Track task/code co-evolution patterns over time

## Benefits
- More accurate context matching for tasks
- Better understanding of what code is actively relevant
- Improved evaluation accuracy and confidence scores
- Reduced false positives in context suggestions
- Better temporal awareness of code changes

## Acceptance Criteria
- [ ] Temporal weighting algorithm implemented
- [ ] Git blame integration for activity scoring
- [ ] File dependency graph analysis
- [ ] Commit message semantic analysis
- [ ] Historical co-evolution pattern detection
- [ ] Configurable weighting factors
- [ ] Performance benchmarks showing improved accuracy

## Technical Details
- **Files to modify**: `src/04-match-context.ts`, `src/types.ts`, `src/utils.ts`
- **New types**: `ContextWeight`, `ActivityMetrics`, `DependencyGraph`
- **Algorithms**: Time decay functions, activity scoring, dependency analysis
- **Git integration**: Use `simple-git` for blame and history analysis

## Notes
Should maintain backward compatibility and allow configuration of weighting factors via command-line options or config file.