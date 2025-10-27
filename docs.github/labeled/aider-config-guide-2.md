---
uuid: 02eabf61-9d8f-4a21-ae97-87163c0ddf86
created_at: '2025-10-07T22:06:28Z'
title: 2025.10.07.22.06.28
filename: Aider Config Guide
description: >-
  Explains the structure and key settings for Aider's configuration file,
  including common keys, sample configuration, and pitfalls to avoid.
tags:
  - Aider
  - config
  - configuration
  - yaml
  - model
  - api
  - pitfalls
---
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
| `model`                                        | The main LLM model to use (e.g. `openai/gpt-4o`)          | If not set, you have to specify each time or rely on default                       |
| `openai-api-key` / `anthropic-api-key`         | For storing API keys for those providers                  | You can also set via env or `.env` file. ([Aider][6])                              |
| `edit-format`                                  | How edits are made (diff, whole, editor type)             |                                                                                    |
| `weak-model`                                   | A “weaker” model for tasks like summarization, etc.       |                                                                                    |
| `timeout`                                      | Timeout (seconds) for API calls                           |                                                                                    |
| `chat-history-file`, `input-history-file`      | Files to store chat history / input history               |                                                                                    |
| `dark-mode`, `light-mode`, `pretty`, `verbose` | Output / UI styling / verbosity                           |                                                                                    |
| `read`                                         | Files that Aider should always load (for conventions etc) | You can list markdown or config files you want it to always consider. ([Aider][7]) |

You can also configure “model settings” (for advanced usage) via `.aider.model.settings.yml`, to override e.g. token limits or extra parameters for specific models. ([Aider][8])

---

## Sample `.aider.conf.yml`

Here’s a minimal but practical starter you can tweak:

```yaml
# .aider.conf.yml

# Which model to use by default
model: openai/gpt-4o

# API key for OpenAI (if you prefer it here rather than .env)
openai-api-key: YOUR_OPENAI_API_KEY

# Use a weaker model for some tasks
weak-model: openai/gpt-3.5-turbo

# How edits should be formatted
edit-format: diff

# Files to always read (for conventions, doc, style guide)
read:
  - CONVENTIONS.md
  - STYLE_GUIDE.md

# Output / UI settings
pretty: true
verbose: false
dark-mode: false

# History & cache
chat-history-file: .aider.chat.history.md
input-history-file: .aider.input.history
```

You’d put that in your home or in the root of your project.

---

## Pitfalls & tips (because I don’t want you to hit surprises)

* **Must use `.yml` extension** — `.yaml` might not be recognized. ([GitHub][1])
* If you override settings via CLI args or environment, those typically take higher precedence.
* Don’t mix too many sources of truth — environment variables, config file, CLI — or it can get confusing.
* If your project has specific coding conventions (e.g. style, patterns), include a `CONVENTIONS.md` or equivalent and put it in the `read:` list so Aider always loads it. ([Aider][7])
* For custom LLMs (or ones Aider doesn’t know about), you may want to define them in `.aider.model.settings.yml`. ([Aider][8])
* Be cautious storing secrets (API keys) in files under version control. Prefer `.env` or environment variables for keys when possible.

---

If you tell me which model(s) you’ll use (OpenAI, Anthropic, Azure, etc.), and what your project stack is (TypeScript, web components, etc.), I can generate a tailored config for your setup. Do you want me to generate that for you now?

[1]: https://github.com/Aider-AI/aider/issues/3974?utm_source=chatgpt.com "Aider fails to discover .aider.conf.yaml, requires .aider.conf.yml #3974"
[2]: https://aider.chat/docs/config/aider_conf.html?utm_source=chatgpt.com "YAML config file | aider"
[3]: https://aider.chat/docs/config/options.html?utm_source=chatgpt.com "Options reference | aider"
[4]: https://aider.chat/docs/config/dotenv.html?utm_source=chatgpt.com "Config with .env | aider"
[5]: https://aider.chat/docs/config.html?utm_source=chatgpt.com "Configuration - Aider"
[6]: https://aider.chat/docs/config/api-keys.html?utm_source=chatgpt.com "API Keys - Aider"
[7]: https://aider.chat/docs/usage/conventions.html?utm_source=chatgpt.com "Specifying coding conventions | aider"
[8]: https://aider.chat/docs/config/adv-model-settings.html?utm_source=chatgpt.com "Advanced model settings | aider"
