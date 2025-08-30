Scripts: Group documentation utilities under scripts/docs

Goal: Move all documentation-maintenance utilities into `scripts/docs/` with a README and stable usage.

Scope:
- Create `scripts/docs/` and move:
  - convert_markdown_links_to_wiki.py
  - convert_wikilinks.py
  - lowercase_links.py
  - generate_orphan_docs.py
  - chunk_unique_docs.py
  - strip-file-extensions.ts
- Add `scripts/docs/README.md` describing each tool, inputs/outputs, and examples.
- Update any references in docs/ and CI.

Exit Criteria:
- All docs utilities live under `scripts/docs/` and run from repo root.
- README exists with usage and env notes.

#scripts #docs #organization #accepted

