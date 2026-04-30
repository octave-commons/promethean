---
name: opencode-semantic-find-session
description: "Find relevant OpenCode sessions using semantic search and filtering"
---

# Skill: OpenCode Semantic Find Session

## Goal
Locate the most relevant OpenCode sessions for a topic using semantic search and filters.

## Use This Skill When
- You need to identify which sessions contain a specific implementation or discussion
- The user asks to find where a topic was previously discussed
- You want to bootstrap recovery or reconstitution workflows

## Do Not Use This Skill When
- You already know the exact session ID
- The information is in code or docs and does not require historical context

## Inputs
- Search query
- Optional session ID constraints
- Desired number of results (k)

## Steps
1. Run semantic search:
   `pnpm -C packages/reconstituter opencode-sessions search "<query>" --k 10`.
2. Inspect the highest-scoring results for session IDs and paths.
3. If needed, re-run search with a narrower query or `--session` filter.
4. Record the sessions to review or recover.

## Output
- A ranked list of relevant sessions
- Suggested follow-up sessions to review
