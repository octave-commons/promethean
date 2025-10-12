# Kanban Stress Test - Initial Findings

## Baseline Measurements (Session Start)
- **Task files**: 1348 → 1376 (+28 new files created during test)
- **Kanban count**: Started 1277, fluctuated to 1305
- **Regenerate count**: Reports 1330 (inconsistent with count)
- **Test task UUID**: 7cfffd5e-b20a-44fe-a1de-749dedde94d9
- **Test task current status**: accepted (stuck due to WIP limits)

## Critical Issues Discovered
1. **Counting discrepancies**: Different commands report different numbers
2. **Mysterious file generation**: 28+ new task files created during operations
3. **UUID placeholder issues**: 9 files with (uuidgen) placeholders causing partial failures
4. **Missing cache directory**: /docs/agile/boards/.cache/event-log.jsonl missing
5. **WIP limit violations**: Multiple columns over limits

## Next Steps Needed
1. Check WIP status of all columns
2. Remove duplicates in over-limit columns
3. Move test task through valid transitions to done
4. Continuously monitor file counts vs reported counts