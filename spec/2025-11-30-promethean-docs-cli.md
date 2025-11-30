# Promethean docs CLI + semantic search scaffold

## Context

- Need a Promethean CLI surface: `promethean docs <action>` to view/search/manage docs with actors (semantic/keyword/fuzzy/regex) and categories (docs, packages, agile, adr, etc.).
- User goal: agent-friendly output (markdown/JSON), template runner, searchable (eventual ES + vectors). Obsidian-friendly (retain Dataview blocks).
- Existing related pieces:
  - `cli/obsidian-export` converts vaults to GitHub-ready markdown.
  - No existing `promethean docs` command yet.
  - Docs live under `docs/` with Dataview, wikilinks; instructions now cover them via `opencode.json`.

## Definition of done

- Spec + plan ready; initial CLI scaffolding proposed.
- Config describing categories/actions/actors/sources checked in (stub OK).
- CLI entrypoint skeleton for `promethean docs search/view/index/template` wired to pluggable providers.
- Local search fallback (keyword/regex) demonstrated; semantic hook interface defined (can be stubbed if backend unavailable).
- Example command-line output that mirrors Dataview-style queries for agile tasks frontmatter.

## Plan (phases)

1. **Discovery**: Confirm CLI package target (likely new subpackage under `cli/` or extend existing monorepo CLI). Identify minimal deps (fast-glob, gray-matter, maybe elastic client stub).
2. **Config**: Add `docs.config.mjs` (or similar) defining categories → sources (globs) + allowed actors; defaults: docs, packages, agile, adr.
3. **CLI wiring**: Add command module `docs` with actions `search`, `view`, `index`, `template run`. Output markdown by default, `--format json` optional. Keep Dataview blocks intact on view.
4. **Providers**: Implement local text search (rg/keyword/regex) and stub interfaces for semantic/ES (inject embedding + ES client later). Parse frontmatter via gray-matter for metadata columns.
5. **Examples**: Provide sample script or command that emits Dataview-like tables for agile tasks (status/priority/P0-P1 list) to stdout.
6. **Docs/README**: Brief usage in relevant README (pending once wiring exists).

## Open questions / risks

- Which package hosts the command (`packages/promethean-cli` vs new `cli/docs`)? Need repository convention confirmation.
- Embedding/ES backend selection (existing docops/symdocs stack?)—leave interface only.
- Performance of full docs glob; may need cache/incremental index.
- Output format for agents: markdown table vs JSON (support both).

## Notes

- Keep Obsidian features (Dataview blocks, wikilinks) untouched in `view` output.
- Favor local search first; semantic only when backend configured.
