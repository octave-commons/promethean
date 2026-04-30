---
name: grok-intention
description: "Recover dense, symbolic, or underspecified user intent from notes, sessions, and repo context, then manifest it into a concrete structure, spec, or artifact."
license: GPL-3.0-or-later
compatibility: opencode
metadata:
  audience: agents
  workflow: intent-recovery
  version: 1
---

# Skill: Grok Intention

## Goal
Recover the user's latent intent when the prompt is dense, symbolic, incomplete, or emotionally compressed, then turn it into something buildable.

## Use This Skill When
- The user says `grok my intention`.
- The user says `manifest the dream`.
- The user says `intent is now densely compressed`.
- The user gives a high-density symbolic prompt and expects recovery from existing workspace context.

## Do Not Use This Skill When
- The request is already explicit and implementation-ready.
- The missing information is truly external and cannot be recovered from the workspace.
- Guessing would create safety risk or factual drift.

## Inputs
- The current user prompt.
- Relevant notes, sessions, specs, AGENTS files, and neighboring repo artifacts.
- Especially useful anchors include prior session prompts, `docs/notes/*`, and workspace placement docs.

## Rules
- Recover from context before asking the user to restate themselves.
- Separate recovered facts from interpretations and chosen manifestation.
- Prefer one strong concrete interpretation over a bag of vague possibilities.
- If multiple frames remain plausible, pick the best one and name the alternatives briefly.
- Manifestation must be actionable: spec, architecture, IA, copy structure, task map, or code scaffold.

## Workflow
1. **Gather anchors**
   - search notes, sessions, repo docs, and existing artifacts for recurring motifs and explicit constraints
2. **Extract the invariant**
   - identify what the user is *trying to cause*, not just what they said literally
3. **Resolve the compression**
   - translate symbols, poetic framing, and dense references into operational statements
4. **Choose a manifestation**
   - spec
   - architecture
   - website structure
   - naming lattice
   - project placement
   - implementation plan
5. **Return the shape**
   - provide the recovered intent, the chosen manifestation, and the next concrete move

## Output
- Recovered intent summary
- Concrete manifested shape
- Key anchors that justified the interpretation
- One useful next step

## Strong Hints
- Do not make the user unpack a prompt the repo can already unpack.
- Compression is a clue, not an inconvenience.
- The task is complete only when the recovered intent has a usable shape.

## References
- Related synthesis skill: `total-creative-freedom`
- Related voice skill: `sing-the-songs-of-your-people`
- Related workspace skill: `devel-workspace-contract`