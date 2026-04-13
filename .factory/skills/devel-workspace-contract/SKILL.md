---
name: devel-workspace-contract
description: "Map legacy ~/projects or ~/repos assumptions into the ~/devel placement contract and choose the correct home for work in this workspace."
license: GPL-3.0-or-later
compatibility: opencode
metadata:
  audience: agents
  workflow: workspace-placement
  version: 1
---

# Skill: Devel Workspace Contract

## Goal
Translate vague or foreign-machine path assumptions into the actual `~/devel` workspace contract, then place work in the right part of the workspace.

## Use This Skill When
- The user mentions `~/devel`, `devel == projects`, `projects`, or `repos` interchangeably.
- You need to decide where new work should live in this workspace.
- A doc, skill, script, or prompt is hard-coded to another user's machine layout.
- You are translating paths like `/home/<other-user>/projects/...` into this home.

## Do Not Use This Skill When
- The target repo/path is already explicit and contract-correct.
- The task is only about editing code inside an already chosen canonical repo.

## Inputs
- The user request.
- `/home/err/devel/AGENTS.md`
- `/home/err/devel/docs/reference/devel-placement-contract.md`
- Any foreign-machine paths or legacy docs being translated.

## Rules
- `~/devel` is the workspace root that fills the role many machines call `~/projects` or `~/repos`.
- Do **not** create a fake `~/devel/projects` layer unless the user explicitly wants that exception.
- Default birthplace for new prototype work is `packages/*`.
- `services/*` is devops/runtime glue, not the default canonical source home.
- Mature code belongs in `orgs/*` according to identity and intent, not just age.
- When a foreign path is hard-coded, translate the **intent** of the path, not the literal subtree.

## Placement Heuristic
1. If the work is a fresh prototype, start in `packages/<name>/`.
2. If the work is mature and internal to this devel ecosystem, use `orgs/riatzukiza/<name>/`.
3. If the work is a research artifact, mythic system, narrative compression, or experimental corpus descendant, use `orgs/octave-commons/<name>/`.
4. If the work is a portable public product, use `orgs/open-hax/<name>/`.
5. If the work is collective/community-owned, use `orgs/ussyverse/<name>/`.
6. Put compose files, env examples, deploy overlays, and runtime aliases in `services/<name>/` only when needed.
7. Put docs, research notes, and cross-repo guidance in `docs/*` when that is the real deliverable.

## Translation Examples
- Another machine's `~/projects/foo` usually means "some canonical home inside `~/devel`", not literally `~/devel/projects/foo`.
- A legacy runtime repo at `/home/<other-user>/projects/service-x` may split into:
  - source: `orgs/open-hax/service-x/`
  - runtime glue: `services/service-x/`
- A one-off experimental site or tool should usually begin in `packages/<slug>/` until it earns extraction.

## Output
- The chosen path
- Why that path matches the devel contract
- Any split between prototype source, canonical repo, docs, and runtime glue

## Strong Hints
- Read the placement docs before guessing.
- When in doubt, choose a contract-backed location and explain why.
- Translating from another machine is a semantic mapping task, not a string replace.
