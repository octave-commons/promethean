---
uuid: "6b149d5b-93a2-4de6-94f3-2d06b46d425c"
title: "What we’ll test (tight to 8 GB)"
slug: "what-well-test-tight-to-8-gb"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.10.07.22.58.08.md

## 📝 Context Summary

Perfect—let’s turn all of this into a concrete, **drop-in test framework** you can run on your 8 GB box and compare against remote judges (OpenRouter, Z.ai). I’m going to be blunt about what’s proven vs. vibes, and I’ll anchor each moving part to solid docs.

---

# What we’ll test (tight to 8 GB)

* **Local tool-calling text models**
  Pull a *tools-enabled* Gemma 3 build that fits in ≤ 8 GB. Good starting points:

  * `orieg/gemma3-tools` (multiple sizes/quant tags), built specifically to expose function/tools. ([Ollama][1])
  * Search “gemma3 tools” on Ollama for other maintained tags (e.g., `aliafshar/gemma3-it-qat-tools`, `Hituzip/gemma3-tools`). ([Ollama][2])
  * If you’re *really* tight on VRAM, try **Gemma 3n Tools** (e2b/e4b). ([Ollama][3])

* **Local VLM**
  **MiniCPM-V 4.5** has an Ollama model page and official repo; it’s explicitly positioned for efficient *end-side* use. Expect to lean on CPU RAM and downscale images. ([Ollama][4])

* **(Optional) Unsloth dynamic GGUF** for coding sweeps
  If you want to probe “thinking” vs “no-thinking” and low-bit quants, Unsloth’s docs show the GGUF export path and Modelfile flow for **Ollama**. That means your finetunes stay templ

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
