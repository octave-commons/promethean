---
uuid: "7c508df7-4463-461a-8549-0ac8dd256192"
title: "create base readme md templates for each service md"
slug: "create_base_readme_md_templates_for_each_service"
status: "Archive"
priority: "P3"
labels: ["create", "each", "readme", "service"]
created_at: "2025-10-11T19:23:08.664Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🧠 Description

Each service in `services/` should include a minimal `README.md` explaining its purpose, how to start it, and any dependencies. This task enforces that standard.

Most directories currently lack a README, so we need to create them using a common template.

## 🎯 Goals / Outcomes
- Ensure every service directory has a `README.md`
- Document launch commands and environment variables
- Provide links to related `AGENT.md` files

## 🧩 Related Concepts
- process_board_flow$../process_board_flow.md
- [docs/agile/agents|agents.md]
- [service directory conventions]../service%20directory%20conventions.md
- #doc-this #framework-core #ritual

## 🛠 Requirements
- Add `README.md` if missing
- Confirm each has:
  - Overview
  - Launch instructions
  - Related AGENT.md or spec file link

## ✅ Tasks
- [ ] Create `services/cephalon/README.md`
- [ ] Create `services/discord-embedder/README.md`
- [ ] Create `services/discord-indexer/README.md`
- [ ] Create `services/stt/README.md`
- [ ] Create `services/tts/README.md`

## 🔗 Links
- [docs/agile/agents|agents.md]



#archive
