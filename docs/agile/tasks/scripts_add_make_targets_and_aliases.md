---
uuid: 06dc563d-0b7e-415a-a435-5061b690aa97
title: scripts add make targets and aliases
status: incoming
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.519Z'
---
Scripts: Add Make targets and aliases

Goal: Provide Make targets for common script flows (kanban sync, WIP sheriff, docs fixes) for consistent local/CI usage.

Scope:
- Add Makefile targets:
  - `kanban.sync` → pnpm kanban sync
  - `kanban.backsync` → pnpm kanban push
  - `kanban.wip` → pnpm tsx packages/kanban/src/scripts/wip-sheriff.ts --write
  - `docs.links.wiki` → python scripts/docs/convert_markdown_links_to_wiki.py
  - `docs.links.md` → python scripts/docs/convert_wikilinks.py
- Document targets in scripts/README.md and CONTRIBUTING notes.

Exit Criteria:
- Targets exist and work from repo root; CI can call them.

#incoming #scripts #make #dx


