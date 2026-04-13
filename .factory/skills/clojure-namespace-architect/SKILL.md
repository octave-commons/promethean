---
name: clojure-namespace-architect
description: "Resolves Clojure namespace-path mismatches and classpath errors with definitive path conversion"
---

# Skill: Clojure Namespace Architect

## Goal
Resolve errors related to Clojure file paths, namespace declarations, and classpath mismatches. Agents often confuse the mapping between kebab-case namespaces and snake_case file paths. This skill provides the ground truth.

## Use This Skill When
- `FileNotFoundException` or `Could not locate ... on classpath` errors
- `java.lang.Exception: No namespace: ...` errors
- "Namespace mismatch" errors appear
- Creating new Clojure files or refactoring directory structures
- Renaming or moving Clojure source files

## Do Not Use This Skill When
- The error is unrelated to namespace/classpath issues
- Working with non-Clojure files
- The issue is a runtime code error (logic bugs, not loading errors)

## Key Rules (The "Agent Confusion" Fix)

### Rule 1: The Dash-Underscore Convention
- **Namespaces use dashes**: `(ns my-app.user-utils)` ✓
- **File paths use underscores**: `src/my_app/user_utils.clj` ✓
- Never put dashes in directory or filenames (except source root)
- Never put underscores in the namespace symbol

### Rule 2: The Source Root Rule
- `src`, `test`, `resources` are ROOTS. They do NOT appear in the namespace name.
- `src/com/example/core.clj` → `(ns com.example.core)` ✓
- NOT `(ns src.com.example.core)` ✗

### Rule 3: Segment Mapping
- Each namespace segment maps to one directory level
- `my-app.core-utils` → `my_app/core_utils.clj`
- Nested namespaces create nested directories

## Tools

### audit_clojure_ns
Audits a Clojure file to verify its namespace declaration matches its file path.

**Parameters:**
- `filePath` (required): Absolute or relative path to the .clj or .cljs file
- `sourceRoots` (optional): Array of known source root directories

**Returns:**
- `status`: 'ok' | 'mismatch' | 'warning' | 'file_not_found' | 'parse_error'
- `declaredNs`: The namespace found in the file
- `expectedNsFromPath`: What the namespace should be based on file location
- `fullExpectedPath`: Where the file should be if moved to match its namespace
- `recommendations`: Array of fix options with commands

## Workflow Steps

### When Diagnosing a "Could not locate" Error
1. Identify the expected namespace from the error message
2. Use `audit_clojure_ns` on the file you think should exist
3. If status is 'mismatch', choose the appropriate fix:
   - If the file is named incorrectly (dashes in filename): Move to correct path
   - If the `(ns ...)` declaration is wrong: Update the namespace symbol

### When Creating New Clojure Files
1. Determine the correct namespace first
2. Convert namespace to path: `my-app.core` → `my_app/core.clj`
3. Create directory structure if needed
4. Write `(ns my-app.core ...)` at the top of the file

### When Refactoring/Renaming
1. Calculate the new namespace from the new path
2. Update the `(ns ...)` declaration to match
3. Rename the file to match the new path convention

## Strong Hints

- When you see a path like `my-app/core.clj`, the namespace must be `my-app.core`
- When you see a namespace like `my-app.core`, the path must be `my_app/core.clj`
- Use the tool to verify before making changes - don't guess
- If both path and namespace seem wrong, prefer updating the namespace declaration
- Remember: dashes in namespace = underscores in path segments

## Output
- Status of namespace-path alignment
- Specific mismatches found (if any)
- Recommended commands to fix each issue
- Verification that the fix resolves the original error
