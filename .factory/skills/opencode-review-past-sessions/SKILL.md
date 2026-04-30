---
name: opencode-review-past-sessions
description: "Review OpenCode session history to recover decisions, intent, and prior changes"
---

# Skill: OpenCode Review Past Sessions

## Goal
Review prior OpenCode sessions to recover context, decisions, and implementation details.

## Use This Skill When
- The user asks "what did we decide last time" or "what was done before"
- You need to understand prior constraints, tradeoffs, or partial implementations
- You are continuing work that was previously done in OpenCode

## Do Not Use This Skill When
- The answer is in the codebase or docs already
- You only need to inspect a single commit or PR
- The task is unrelated to historical context

## Inputs
- Topic keywords or error messages
- Optional session ID(s)
- Time window or branch name

## Steps
1. Run semantic search for the topic:
   `pnpm -C packages/reconstituter opencode-sessions search "<query>" --k 10`.
2. Identify the most relevant session IDs and key messages.
3. Use `--session` to narrow results and gather message excerpts.
4. Summarize the decisions, constraints, and next steps found.
5. Confirm any assumptions with the user before making changes.

## Output
- A concise summary of prior decisions and context
- A list of sessions or message IDs used
- Any open questions or missing data
