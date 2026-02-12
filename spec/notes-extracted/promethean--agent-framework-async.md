---
title: "Agent framework"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-framework-async.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Agent framework

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-framework-async.md`
- Category: `promethean`

## Draft Requirements
- Derive concrete implementation tasks from source note.

## Summary Snippets
- Ok, this is the part I want to zoom out a bit and think about our agent framework. # Agent framework I want async sub agents. The whole framework should be async first, I usually use JS, so I'd be trying promises/futures, but they may not be the best way to get concurrency going in clojure I want an agent mode that is like... hierarchical? I want it to start with a very powerful model, and it has tools to create a bunch of agents in paralell. the top level agent will sleep, and periodicly start back up while there are still sub agents. And it can go multiple levels deep, but increasingly restricting the ability of the model allowed to be used.
- Parent agents will decide a system prompt (potentially from a library of existing ones, or create and manage prompts it's self.), a tool set (from a list of existing tools)

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
