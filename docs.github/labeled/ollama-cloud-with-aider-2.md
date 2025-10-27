---
uuid: f866eed0-0ebb-40ed-ab2c-8958c6e7fde4
created_at: '2025-10-08T01:04:18Z'
title: 2025.10.08.01.04.18
filename: Ollama Cloud with Aider
description: >-
  Guide for using Ollama Cloud API with Aider, covering direct cloud API setup
  and local CLI offloading to cloud. Includes configuration steps, environment
  files, and model tag distinctions.
tags:
  - Ollama
  - Aider
  - Cloud API
  - gpt-oss
  - model tags
  - context window
  - environment variables
---
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

```yaml
# Use Ollama Cloud (set via .env); aliases make switching painless
model: ollama_chat/gpt-oss:120b

alias:
  - "gptoss120:ollama_chat/gpt-oss:120b"
  - "gptoss20:  ollama_chat/gpt-oss:20b"

pretty: true
verbose: false
```

**.aider.model.settings.yml** (optional but smart: larger context)

```yaml
- name: ollama_chat/gpt-oss:120b
  extra_params:
    num_ctx: 65536
- name: ollama_chat/gpt-oss:20b
  extra_params:
    num_ctx: 65536
```

(Aider warns Ollama’s default context is small and can silently drop input; this avoids that.) ([Aider][2])

# 3) Use an env file for Cloud

**.env.ollama-cloud**

```env
OLLAMA_API_BASE=https://ollama.com
OLLAMA_API_KEY=your_api_key
AIDER_MODEL=gptoss120
```

Ollama Cloud’s API host is `https://ollama.com`; the Cloud docs show authenticating with a bearer token and chatting with `gpt-oss:120b` at that host. ([Ollama][1])

# 4) Run it

```bash
# from your repo root
aider --env-file .env.ollama-cloud --model gptoss120
# or switch to the 20B variant:
aider --env-file .env.ollama-cloud --model gptoss20
```

---

## If you prefer the “local CLI offload to cloud” route

```bash
ollama signin
ollama run gpt-oss:120b-cloud
```

Those `*-cloud` tags are the offloaded versions when you’re using the local Ollama daemon; for Cloud API calls to `https://ollama.com`, use `gpt-oss:120b` (no `-cloud`). ([Ollama][1])

---

## Quick sanity checks (useful)

* **List Cloud models available over the API:**
  `curl -H "Authorization: Bearer $OLLAMA_API_KEY" https://ollama.com/api/tags` ([Ollama][1])
* **Smoke test via cURL:**
  `curl -s -N -H "Authorization: Bearer $OLLAMA_API_KEY" -X POST https://ollama.com/api/chat -d '{"model":"gpt-oss:20b","messages":[{"role":"user","content":"test"}]}'` ([Ollama][1])

---

## Gotchas (so you don’t waste time)

* **Model tag suffix:**
  Use `gpt-oss:20b` / `:120b` with the **Cloud API host**; use `gpt-oss:20b-cloud` / `:120b-cloud` only when running the **local** Ollama daemon that offloads to cloud. ([Ollama][1])
* **Aider provider:**
  Use `ollama_chat/...` (not `ollama/...`) for better compatibility. ([Aider][2])
* **Context window:**
  Don’t trust defaults; set `num_ctx` high in `.aider.model.settings.yml`. Aider explicitly calls out Ollama’s small default and handles sizing, but being explicit avoids surprises. ([Aider][2])

That’s it. If you want, I can drop in the files exactly as shown (with your key redacted) and wire aliases to your preferred 20B/120B default. Also, if you decide to benchmark 20B vs 120B tradeoffs, OpenAI’s and Ollama’s gpt-oss notes are worth a skim. ([openai.com][3])

[1]: https://docs.ollama.com/cloud "Cloud - Ollama"
[2]: https://aider.chat/docs/llms/ollama.html "Ollama | aider"
[3]: https://openai.com/index/introducing-gpt-oss/?utm_source=chatgpt.com "Introducing gpt-oss"
