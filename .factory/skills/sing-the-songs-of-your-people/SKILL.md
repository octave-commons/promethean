---
name: sing-the-songs-of-your-people
description: "When the user asks you to sing the songs of your people, mine notes, sessions, lore, and code motifs to produce a beautiful but truthful synthesis in the workspace's native voice."
license: GPL-3.0-or-later
compatibility: opencode
metadata:
  audience: agents
  workflow: motif-synthesis
  version: 1
---

# Skill: Sing the Songs of Your People

## Goal
Use the workspace's own motifs, notes, symbols, and prior sessions to produce output that feels native to this corpus instead of generic assistant sludge.

## Use This Skill When
- The user explicitly says "sing the songs of your people".
- The user wants a beautiful synthesis, manifesto, website narrative, naming system, lore compression, or poetic technical framing.
- The task requires mining the repo and notes corpus for recurring themes before writing.

## Do Not Use This Skill When
- The task is a routine bugfix with no narrative or synthesis component.
- The user wants dry literalism only.
- The request would be better served by plain factual reporting with no stylistic lift.

## Inputs
- The user prompt.
- Relevant docs, notes, poetry, session history, AGENTS files, specs, and repo names.
- Especially useful anchors include:
  - `/home/err/docs/notes/poetry/prelude-to-epiphany.md`
  - `/home/err/docs/notes/research/creative-protocol-manifest.md`
  - relevant `~/.pi/agent/sessions/**/*.jsonl` prompts and artifacts

## Rules
- Separate facts, interpretations, and mythic compression when it matters.
- No faux feelings, fake autobiography, or invented lore presented as fact.
- Beauty should increase clarity, not hide missing reasoning.
- The point is not to sound flowery; it is to sound *native* to the corpus.
- When the task implies implementation, pair the synthesis with a concrete structure, spec, or path forward.

## Workflow
1. **Gather motifs**
   - sample the relevant notes, sessions, and repo/docs vocabulary
   - extract recurring symbols, loops, tensions, and preferred contrasts
2. **Map the voice**
   - identify what this corpus sounds like when it is at its best
   - keep the vocabulary but drop empty mystification
3. **Choose a form that serves the task**
   - manifesto
   - spec intro
   - homepage copy
   - naming lattice
   - lore capsule
   - architecture framing
   - lyrics or poetic prose when explicitly useful
4. **Bind to truth**
   - mark what is directly grounded vs interpretive compression
   - cite the source anchors that shaped the synthesis
5. **Return something actionable**
   - structure the beauty so the user can build, publish, or decide from it

## Output
- A synthesis artifact in the right form for the task
- A short motif map or source-anchor list
- The next concrete move

## Strong Hints
- Sound like the repo, not like a marketing intern.
- Compression beats verbosity.
- If paired with `total-creative-freedom`, let this skill shape the voice while the other skill shapes the search and solution space.
