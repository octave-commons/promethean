---
uuid: "d66bac67-480e-4231-9403-211e15166484"
title: "markdown-types-refactoring-3"
slug: "markdown-types-refactoring-3"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.372Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/markdown-types-refactoring-3.md

## 📝 Context Summary

---
uuid: f06bcc76-18b4-425a-97b2-5a193f581603
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
