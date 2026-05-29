---
title: "Spec (draft): ημ mounts for docs knowledge graph (Promethean)"
status: draft
created_at: "2026-03-15"
tags: [knowledge, eta-mu, mounts, docs]
uuid: "orgs-octave-commons-promethean-docs-kanban-orgs-octave-commons-promethean-docs-specs-drafts-eta-mu-mounts-md"
priority: P3
labels: ["specs", "migrated-spec"]
source: "orgs/octave-commons/promethean/docs/specs/drafts/eta-mu-mounts.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/docs/specs/drafts/eta-mu-mounts.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/docs/kanban/drafts/eta-mu-mounts.md`
# ημ mounts for docs knowledge graph (Promethean)

## Intent
Define *graph scope* independently from the substrate directories (`.ημ/`, `.Π/`, `.opencode/runtime/*`).

This avoids the Fork Tales failure mode: *treating a directory as identity*. Directories are locators; identities live in registries/IDs.

## Requirements
- Add an explicit mounts config describing which trees are scanned for the docs knowledge graph.
- `.ημ/` remains an **inbox** (optional capture funnel), not “the vault”.

## Plan
1. Add `.opencode/runtime/eta_mu_mounts.v1.json`.
2. Initial mounts:
   - `promethean-docs` → `docs/**.md`

## Definition of Done
- Mount config exists and is committed.
- No indexing behavior changes yet (this is only scope/config).
