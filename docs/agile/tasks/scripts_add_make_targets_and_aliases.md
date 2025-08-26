Scripts: Add Make targets and aliases

Goal: Provide Make targets for common script flows (kanban sync, WIP sheriff, docs fixes) for consistent local/CI usage.

Scope:
- Add Makefile targets:
  - `kanban.sync` → python scripts/kanban/hashtags_to_kanban.py --write
  - `kanban.backsync` → python scripts/kanban/kanban_to_hashtags.py --write
  - `kanban.wip` → pnpm ts-node scripts/kanban/wip-sheriff.ts --write
  - `docs.links.wiki` → python scripts/docs/convert_markdown_links_to_wiki.py
  - `docs.links.md` → python scripts/docs/convert_wikilinks.py
- Document targets in scripts/README.md and CONTRIBUTING notes.

Exit Criteria:
- Targets exist and work from repo root; CI can call them.

#incoming #scripts #make #dx

