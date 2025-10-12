---
uuid: "97882551-2991-46e3-91b4-ba85a3135bd1"
title: "markdown-types-refactoring-2"
slug: "markdown-types-refactoring-2"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.425Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/markdown-types-refactoring-2.md

## 📝 Context Summary

---

title: 2025.09.19.16.04.44

  Refactor `@promethean/docops` to use shared markdown types from
  `@promethean/markdown` by introducing barrel exports and type files. This
  reduces implementation drift and simplifies imports by replacing direct dist
  file references with index exports.
tags:
  - refactor
  - types
  - barrel
  - markdown
  - docops
  - implementation-drift
  - import

references: []
---
@codex factor out markdown.d.ts from `@promethean/docops` , by adding an index.ts as a barrel export and a types.ts to `@promethean/markdown`
refactor docops can import import the types directly eg `import type {MarkdownChunk} from "@promthean/markdown/types" `, to avoid implementation drift.

Afterwards, update all import statements targeting targeting a markdown dist file directly and replace it with an the exported index file instead.
$e.g. replace `import {parseMarkdownChunks} from "@promethean/markdown/dist/chunking.js"` with  `import {parseMarkdownChunks} from "@promethean/markdown"`
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































