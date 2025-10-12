# Kanban Column Normalization Bug

## Issue Identified
There's a bug in the transition validation logic where column name normalization is inconsistent:

- **Error shows**: `todo → inprogress is not a defined transition`
- **Valid transitions show**: `todo → in_progress` 
- **Root cause**: The `column-key` function in Clojure DSL removes underscores: `(str/replace #"[\s_-]" "")`
- **Result**: `in_progress` becomes `inprogress` for comparison, but validation logic expects exact match

## Evidence
1. `show-transitions` correctly shows `todo → in_progress` as valid
2. Transition attempt fails with `inprogress` (no underscore) in error message
3. Suggested alternatives show `in_progress` (with underscore)

## Impact
- Blocks all transitions to columns with underscores in names
- Affects: `in_progress`, `time_to_completion` fields, etc.
- Makes the kanban system partially non-functional

## Files Affected
- `docs/agile/rules/kanban-transitions.clj` (column-key function)
- Transition validation logic in TypeScript code

## Workaround Options
1. Fix column normalization consistency
2. Use column names without underscores
3. Patch validation logic to handle normalization properly

## Status
Critical bug preventing stress test continuation from `todo` → `in_progress`