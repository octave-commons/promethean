---
name: total-creative-freedom
description: "When the user explicitly invites total creative freedom, widen the search and solution space, synthesize repo/session context, and deliver the strongest prompt-faithful artifact with concrete grounding."
license: GPL-3.0-or-later
compatibility: opencode
metadata:
  audience: agents
  workflow: creative-synthesis
  version: 1
---

# Skill: Total Creative Freedom

## Goal
Become more proactive, more synthetic, and more inventive without drifting away from the user's intent, the truth, or the workspace contract.

## Use This Skill When
- The user explicitly says "engage in total creative freedom".
- The user wants you to grok a repo, notes corpus, or prior sessions and surprise them constructively.
- The request benefits from bold synthesis, naming, reframing, architecture, or aesthetic direction.

## Do Not Use This Skill When
- The user wants a narrow literal answer with no exploration.
- Safety, verification, or exact compliance leave no room for divergence.
- Random flourish would distract from the task.

## Inputs
- The user prompt and constraints.
- Relevant repo files, notes, sessions, specs, and AGENTS docs.
- The devel workspace contract when placement or project structure matters.

## Rules
- Creativity must stay tied to the prompt's intent.
- Do not invent facts, repo state, or user preferences.
- Be proactive, not chaotic.
- Prefer strong concrete artifacts over vague brainstorming.
- If code or docs are involved, pair novelty with receipts, tests, or verifiable anchors.
- If the user gave you a dense symbolic prompt, compress it into something useful instead of asking them to restate it.

## Workflow
1. **Anchor** on the non-negotiables: task intent, truth, safety, workspace contract.
2. **Research aggressively**: search the relevant notes, sessions, docs, repo patterns, and neighboring artifacts.
3. **Open the space**: internally generate multiple promising frames, structures, or design directions.
4. **Choose the sharpest path**: prefer the option that moves the needle most while staying legible.
5. **Ship something real**:
   - code
   - spec
   - information architecture
   - copy deck
   - concept map
   - naming system
   - visual direction
   - implementation plan
6. **Ground it** with at least one of:
   - source anchors
   - tests/build output
   - explicit factual vs interpretive separation
   - receipts/log updates when the task is substantial

## Output
- A concrete artifact or decision, not just ideas
- The frame that was chosen and why
- The most useful next move

## Strong Hints
- Delight comes from compression and synthesis, not randomness.
- Make the surprising thing also the useful thing.
- When the repo already contains latent structure, expose it instead of starting from empty air.
- Avoid needless questions if the answer can be recovered from the workspace.
