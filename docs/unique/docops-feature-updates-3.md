---
uuid: 4f51abed-44fe-4bd6-9eaa-21a6e5c0b46f
created_at: docops-feature-updates-3.md
filename: docops-feature-updates
title: docops-feature-updates
description: >-
  New features in Docops for batched Ollama operations and cache management,
  addressing issues with Emacs buffer handling and UUID conflicts in unique
  document workflows.
tags:
  - batched
  - cache
  - uuid
  - emacs
  - buffer
  - conflict
  - unique-docs
---
# Docops new features
- ensure all ollama ops are batched ^ref-cdbd21ee-2-0
- Cache per parameters? ^ref-cdbd21ee-3-0

# Observations
- If I have a unique doc buffer open in emacs, and I save it after it's moved the doc, ^ref-cdbd21ee-6-0
emacs saves a new doc with the original name without objection.
This results in two files having the same UUID

- If I have a buffer with unsaved changes open in emacs, it creates a file with a name like /home/err/devel/promethean/docs/unique/.#2025.09.01.16.36.15.md ^ref-cdbd21ee-10-0
  - It crashes if it sees this ^ref-cdbd21ee-11-0
  - I often have unique docs open ^ref-cdbd21ee-12-0
- The original program still works the way it was intended, but had the opposite issue of having reference section explode in size. ^ref-cdbd21ee-13-0
  - It's ref threshold was the same
