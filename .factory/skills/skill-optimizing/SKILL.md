---
name: skill-optimizing
description: "Improve existing or new skills using the workspace optimization guide and template checks for clarity, scope, and reliability"
---

# Skill: Skill Optimizing

## Goal
Improve an existing or new skill using the workspace optimization guide and template checks.

## Use This Skill When
- A skill needs clarity, scope, or reliability improvements.
- You are creating a new skill and want to validate quality.
- Multiple skills show inconsistent structure or guidance.

## Do Not Use This Skill When
- You are making a one-line or trivial edit to a skill.
- The change is unrelated to skill quality or structure.

## Inputs
- Target skill file path.
- Optimization goals (clarity, completeness, maintainability).
- Related skills and references.

## Steps
1. Read the target skill and compare it to the standard template.
2. Apply the checklist in `docs/skill-optimization-guide.md`.
3. Tighten Use/Do Not Use gates to avoid overlap.
4. Replace vague steps with explicit actions and constraints.
5. Ensure output is testable and references are accurate.
6. Update `AGENTS.md` if the skill name or scope changes.

## Output
- Optimized skill document aligned with workspace conventions.
- Updated references and cross-links if needed.

## References
- Skill optimization guide: `docs/skill-optimization-guide.md`
- Skill authoring template: `.opencode/skills/skill-authoring.md`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[skill-authoring](../skill-authoring/SKILL.md)**
