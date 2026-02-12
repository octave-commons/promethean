---
title: "Core idea"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/discord-architecture.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Core idea

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/discord-architecture.md`
- Category: `promethean`

## Draft Requirements
- **prototypes** = *maps with behavior + defaults*
- **tools** = *instances* that can inherit/override/mix from prototypes
- **servers** = *composed runtime objects* built from prototypes + tool sets
- **hooks** = first-class middleware on *tools and servers*
- resolving prototype chain
- merging defaults
- applying mixins
- wrapping behavior with hooks
- merge chain defaults
- merge mixins defaults
- merge methods
- merge hooks

## Summary Snippets
- Yesss. Thinking in **prototypes + mixing + hooks** is the right mental model for “agents + tools as living objects”.
- Instead of “class inheritance”, we’ll do:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
