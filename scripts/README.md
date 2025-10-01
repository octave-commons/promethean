Scripts Overview

This folder contains utility scripts grouped by purpose. Most scripts are safe to run locally; read each subfolder README for environment assumptions and options.

- kanban/: Board and task automation for docs/agile/boards and docs/agile/tasks.
- docs/: Documentation maintenance utilities (links, orphans, unique chunks).
- audio/: STT/TTS helpers and quick benches.
- indexing/: Helpers for file and embedding indexing.
- sibilant/: Build helpers for Sibilant-based sources.
- misc/: One-off or experimental tools not yet categorized.

Use make targets or pnpm/python directly as indicated in subfolder READMEs.

### Markdown automation helpers

Scripts that touch our kanban or task markdown should prefer the utilities in
`@promethean/markdown`. The package exposes helpers for parsing and persisting
board and task structures (`MarkdownBoard`, `MarkdownTask`), manipulating
frontmatter metadata, and chunking markdown bodies for downstream processing.

```ts
import { MarkdownBoard } from "@promethean/markdown/kanban.js";

const board = await MarkdownBoard.fromPath("docs/agile/boards/kanban.md");
// ... mutate board.columns/tasks as needed ...
await board.write();
```

When authoring or updating scripts, lint them with the directory specific
instructions and format documentation using:

```bash
pnpm exec prettier --write scripts/README.md
```
