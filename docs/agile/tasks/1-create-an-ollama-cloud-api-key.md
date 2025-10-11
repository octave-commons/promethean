---
uuid: "dce433a8-1c85-4418-a9c4-98ca5b8702c2"
title: "1) Create an Ollama Cloud API key"
slug: "1-create-an-ollama-cloud-api-key"
status: "icebox"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.370Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.08.01.04.18.md

## 📝 Context Summary

Yep—this is doable. You’ve got two clean ways to use **gpt-oss** via **Ollama Cloud** with Aider:

* **Direct Cloud API** (recommended): point Aider at `https://ollama.com` with an API key and use `ollama_chat/gpt-oss:20b` or `:120b`. ([Ollama][1])
* **Local CLI that offloads to cloud**: stay on `127.0.0.1:11434` and run the `*-cloud` tags (`gpt-oss:20b-cloud`, `gpt-oss:120b-cloud`) after `ollama signin`. ([Ollama][1])

Below is a practical setup for the **Direct Cloud API** path (less hassle, works great with Aider’s `ollama_chat/...` provider).

---

# 1) Create an Ollama Cloud API key

Generate a key on ollama.com and export it for Aider to use:
`export OLLAMA_API_KEY=your_api_key` (or put it in an `.env` file; see step 3). ([Ollama][1])

# 2) Configure Aider to use Ollama Cloud

Aider supports Ollama via `OLLAMA_API_BASE` and `OLLAMA_API_KEY`, and recommends `ollama_chat/<model>`. ([Aider][2])

**.aider.conf.yml**

**.aider.model.settings.yml** (optional but smart: larger context)

(Aider warns Ollama’s default context is small and can silently drop input; this avoids that.) ([Aider][2])

# 3) Use an env file for Cloud

**.env.ollama-cloud**

Ollama Cloud’s API host is `https:/

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
