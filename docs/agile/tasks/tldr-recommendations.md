---
uuid: "5eabc953-f95c-47ae-940f-14ec84f1a745"
title: "tl;dr recommendations"
slug: "tldr-recommendations"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.426Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/2025.10.07.22.13.53.md

## 📝 Context Summary

love this direction. unsloth gives you three wins that map to your goals:

1. dynamic GGUFs that actually hold up on serious coding evals (Polyglot/Aider), not just toy scores. vendor-claimed, but it’s exactly the benchmark you wanted to run yourself. ([Unsloth Docs][1])
2. a clean Docker path for local fine-tuning/RL without dependency hell. ([Unsloth Docs][2])
3. one-click(ish) export to **GGUF** + auto **Modelfile** for **Ollama**, which fixes the #1 cause of “my finetune is gibberish in Ollama”: wrong chat template. ([Unsloth Docs][3])

below is a compact, practical pipeline that’s unsloth-native, runs **Aider Polyglot** for coding, and (optionally) **BFCL** for tool-use. it assumes you’ll start from Unsloth’s prebuilt GGUFs (Qwen3-8B/14B, Qwen3-Coder, DeepSeek-V3.1) and/or export your own with Unsloth.

---

# tl;dr recommendations

* If your rig can’t comfortably host 14B, start with **Unsloth Qwen3-8B GGUF** (UD Q5_K_M) and compare to **14B UD Q5_K_M**—same template, same ctx. ([Hugging Face][4])
* For serious coding, add **Qwen3-Coder-30B A3B (UD)** if RAM allows; it’s what multiple third-party runs (AMD/Cline) found to be the first “reliably agentic” local coder tier. ([Cl

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































