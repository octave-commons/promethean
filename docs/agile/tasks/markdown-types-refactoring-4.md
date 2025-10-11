---
uuid: "aca56ad3-d28b-4642-826f-23afe57a82ab"
title: "markdown-types-refactoring-4"
slug: "markdown-types-refactoring-4"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/markdown-types-refactoring-4.md

## 📝 Context Summary

---
uuid: 52167fa7-5f98-4f7e-a478-f6d78b26aa75
created_at: '2025-09-19T16:04:44Z'
title: 2025.09.19.16.04.44
filename: markdown-types-refactoring
description: >-
  Refactor `@promethean/docops` to use a dedicated `@promethean/markdown`
  package for markdown types, introducing barrel exports and type definitions to
  improve import clarity and prevent implementation drift.
tags:
  - refactor
  - markdown
  - types
  - barrel
  - import
  - implementation-drift
---
@codex factor out markdown.d.ts from `@promethean/docops` , by adding an index.ts as a barrel export and a types.ts to `@promethean/markdown`
refactor docops can import import the types directly eg `import type {MarkdownChunk} from "@promthean/markdown/types" `, to avoid implementation drift.

Afterwards, update all import statements targeting targeting a markdown dist file directly and replace it with an the exported index file instead.
$e.g. replace `import {parseMarkdownChunks} from "@promethean/markdown/dist/chunking.js"` with  `import {parseMarkdownChunks} from "@promethean/markdown"`

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























