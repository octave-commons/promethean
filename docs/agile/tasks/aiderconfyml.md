---
uuid: "8b545588-4d92-48c8-888a-da7097d4eb2d"
title: ".aider.conf.yml"
slug: "aiderconfyml"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.817Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.07.22.06.28.md

## 📝 Context Summary

Do you mean **Aider** (the AI-pair programming tool) and want a sample config file or help writing one? If so, here’s a breakdown + example and things you should watch out for (no sugarcoating).

---

## What is the Aider config file

* It’s named `.aider.conf.yml` (must use `.yml`, not `.yaml`). ([GitHub][1])

* Aider will look for it (in order):

  1. Home directory
  2. Root of the git repo
  3. Current directory
     ([Aider][2])

* You can also pass `--config <filename>` to force loading only a specific file. ([Aider][3])

* Many settings can also be set via environment variables (prefixed with `AIDER_…`) or via `.env` file. ([Aider][4])

---

## What you can configure / common keys

Here are some of the useful settings you might want in your config. (These are from Aider docs.) ([Aider][5])

| Key                                            | Purpose                                                   | Notes / default behavior                                                           |
| ---------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
