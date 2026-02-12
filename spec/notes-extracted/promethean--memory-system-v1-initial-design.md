---
title: "embedding flow"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/memory-system-v1-initial-design.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# embedding flow

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/memory-system-v1-initial-design.md`
- Category: `promethean`

## Draft Requirements
- thinker - the thinker thinks about the context, it forms beliefs, creates theories
- proover - the proover prooves what the thinker is thinking
- collaborator - consider's it's self with relation to a social network to influence, understand, facilitate, question, consider mutual self interests, and work for/with it's peers.
- planner - Creates objectives from context which are executed, or documented, by the actor
- actor - effects the world outside of it, sends messages, writes files, generally takes actions
- learner - a model that is actively self training, labeling. It is optimizing it's self as a process of global system optimization.
- trainer - orchestrates training of models for specific purposes
- observer - a larger model who selectively processes event logs the sensor has prioritized to understand the signal
- sensor - a small simple model that quickly processes event logs to make snap decisions about sudden changes in state

## Summary Snippets
- There has to be a better way to persist memories than leaving a trail of markdown files The annoying part would be how to make it readable and committable
- Maybe it is okay to just use those files, but you also keep a json index? only those can get really big... so you only keep that to rebuild the index on another machine you keep a more optimized version of the index that works fast

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
