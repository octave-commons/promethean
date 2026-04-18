---
name: clojure-quality
description: "Auto-fix Clojure delimiters and validate syntax with OpenCode tools."
---

# Skill: Clojure Code Quality and Structural Editing

## Goal
Automatically fix malformed Clojure expressions, balance delimiters, and validate syntax using local OpenCode tools.

## Use This Skill When
- Clojure/ClojureScript files report unmatched delimiters or EOF errors.
- You need a safe pre-flight check before running Shadow-CLJS builds.
- You want to normalize delimiter structure after refactors.

## Do Not Use This Skill When
- The task is unrelated to Clojure or ClojureScript.
- The error is a runtime logic error (use the app-specific debugging flow).

## Tools
- (Deprecated/Removed) `fix_clojure_delimiters`
- (Deprecated/Removed) `validate_clojure_syntax`

## Workflow
1. Use `clojure-syntax-rescue` to identify and fix syntax errors manually.
2. If available, use `cljstyle` or `zprint` from the command line if configured.


## Output
- Balanced delimiters in the target file.
- clj-kondo lint passes for the file.

## Strong Hints
- **Constraint**: Only run `cljstyle` if the CLI is installed and available in PATH.
- **Tip**: Start with Parinfer indent mode; only use paren mode when indent mode fails.

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[clojure-syntax-rescue](../clojure-syntax-rescue/SKILL.md)**
