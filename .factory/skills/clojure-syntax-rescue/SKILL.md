---
name: clojure-syntax-rescue
description: "Protocol to recover from Clojure/Script syntax errors, specifically bracket mismatches and EOF errors."
---

# Skill: Clojure Syntax Rescue

## Goal
To efficiently fix "Unmatched delimiter", "Unexpected EOF", and "Invalid token" errors in Clojure files without falling into a guessing loop.

## Use This Skill When
- You get a build error like `Unmatched delimiter )`, `Unexpected EOF`, or `reading string`.
- You have tried to fix a bracket issue once and failed.
- You are confused by nested maps or threading macros (`->`, `->>`).

## Do Not Use This Skill When
- The error is a logic error or runtime exception (use `shadow-cljs-debug` instead).

## Steps
1. **Stop Guessing**: Do not just add/remove a parenthesis at the end of the line/file.
2. **Locate with Linter**:
   - Run `pnpm lint` or `clj-kondo --lint <file>` to get the exact line/column of the mismatch.
   - The build tool often reports the end of the file (EOF), but the linter finds the start of the mismatch.
3. **Isolate the Form**:
   - Identify the top-level form (function or def) containing the error.
   - If the form is complex, copy it to a scratch buffer or rewrite it from scratch.
   - It is often faster to re-type a function correctly than to debug a 5-level deep bracket mismatch.
4. **Check Macros**:
   - Threading macros (`->`, `->>`) implicitly insert arguments. Ensure you aren't double-nesting.
   - `case`, `cond`, and `let` require exact pairing. Check those first.
5. **Verify**:
   - Run the linter again before running the full build.

## Output
- A syntactically valid file.

## Strong Hints
- **Constraint**: Never try to fix a LISP bracket error by eye-balling it if it's nested more than 2 levels deep. Use a tool/linter.
- **Tip**: Unexpected EOF almost always means a missing closing parenthesis `)` or brace `}` somewhere above, rarely at the actual end.
- **Tip**: Vectors `[]` and Maps `{}` are common culprits. Check them first.

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[shadow-cljs-debug](../shadow-cljs-debug/SKILL.md)**
