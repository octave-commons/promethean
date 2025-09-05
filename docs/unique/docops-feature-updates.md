---
uuid: 4c59307f-a143-4272-85e6-abc35e14b95c
created_at: docops-feature-updates.md
filename: Docops Feature Updates
title: Docops Feature Updates
description: >-
  Introducing new batch processing for Ollama operations and parameter-specific
  caching to enhance efficiency and performance in document handling workflows.
tags:
  - batch processing
  - Ollama
  - caching
  - document workflows
---

---
uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2 ^ref-2792d448-3-0
created_at: 2025.09.01.16.36.15.md
filename: Docops Feature Updates
description: >-
  Introducing new batch processing for Ollama operations and parameter-specific
  caching to enhance efficiency and performance in document handling workflows.
tags:
  - batch processing ^ref-2792d448-10-0
  - Ollama ^ref-2792d448-11-0
  - caching ^ref-2792d448-12-0
  - document workflows ^ref-2792d448-13-0
related_to_uuid: []
related_to_title: []
references: []
---
# Docops new features
- ensure all ollama ops are batched ^ref-2792d448-19-0
- Cache per parameters? ^ref-2792d448-20-0

# Observations
- If I have a unique doc buffer open in emacs, and I save it after it's moved the doc, ^ref-2792d448-23-0
emacs saves a new doc with the original name without objection.
This results in two files having the same UUID

- If I have a buffer with unsaved changes open in emacs, it creates a file with a name like /home/err/devel/promethean/docs/unique/.#2025.09.01.16.36.15.md ^ref-2792d448-27-0
  - It crashes if it sees this ^ref-2792d448-28-0
  - I often have unique docs open ^ref-2792d448-29-0
- The original program still works the way it was intended, but had the opposite issue of having reference section explode in size. ^ref-2792d448-30-0
  - It's ref threshold was the same
