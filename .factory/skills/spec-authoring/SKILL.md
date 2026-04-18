# Spec Authoring Skill

This skill provides guidelines for creating and managing technical specification documents within the repository.

## Front Matter

All spec files (typically in `spec/*.md` or `docs/agile/tasks/*.md`) MUST begin with YAML front matter to track metadata and status.

```yaml
---
title: <Clear, Descriptive Title>
status: draft | proposed | approved | active | deprecated
owner: <github-username-or-agent>
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
tags: [tag1, tag2]
---
```

## Status Definitions

Matches the Kanban board columns (from `docs/agile/process/*.yaml`):

- **icebox**: Future ideas, not yet prioritized.
- **backlog**: Accepted work waiting for scheduling.
- **todo**: Prioritized and ready for pickup.
- **in-progress**: Currently being worked on.
- **review**: In pull request or peer review.
- **document**: Feature complete, updating documentation.
- **done**: Completed and merged.

## Structure

A good spec should include:
1.  **Overview/Executive Summary**: High-level problem and solution.
2.  **Problem Statement**: Detailed analysis of the issue.
3.  **Proposed Solution**: Technical design, architecture, or refactoring plan.
4.  **Action Plan**: Concrete steps or Todo list items.
5.  **Risks/Alternatives**: What could go wrong? What else did we consider?

## Usage

When asked to "create a spec" or "plan a feature":
1.  Create a file in `spec/` (for technical debt/architecture) or `docs/agile/tasks/` (for feature work).
2.  Apply the front matter.
3.  Fill in the sections.
4.  Add a Todo item to track the spec's implementation.
