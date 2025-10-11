---
uuid: "544d7cf1-0745-47a3-b573-3a9f705dfdf6"
title: "gptel-native-tools-4"
slug: "gptel-native-tools-4"
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

- Path: docs/labeled/gptel-native-tools-4.md

## 📝 Context Summary

---
uuid: e98bbb9e-5da1-400b-98d5-34ee7519264c
created_at: '2025-10-03T22:24:31Z'
title: 2025.10.03.22.24.31
filename: gptel-native-tools
description: >-
  A minimal Emacs toolkit for gptel that provides filesystem and process
  operations with plain strings and JSON outputs. Includes guardrails for
  destructive operations and follows gptel's tool specification.
tags:
  - emacs
  - gptel
  - filesystem
  - processes
  - json
  - guardrails
---
Love it. Let’s wire up a sane, minimal-but-powerful “native Emacs” toolbox for gptel. I’m keeping the surface area small, returning plain strings for content-heavy ops (so models don’t have to unescape JSON) and JSON for structured results (lists, trees, search hits). Where something is potentially destructive, I’ve put (lightweight) guardrails.

Below is a drop-in `init.el` snippet that defines **all 10 tools** you asked for and registers them. After evaluating it, enable them via `M-x gptel-menu → tools` or set `gptel-tools` globally as shown.

> Notes up front
> • This follows gptel’s tool spec `gptel-make-tool`, `:args` plist, etc.. See the project’s “Defining gptel tools” section for the canonical shape. ([GitHub][1])
> • For `apply_pat

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
