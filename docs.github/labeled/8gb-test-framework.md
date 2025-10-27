---
uuid: 9628632f-7b55-4694-97f0-10c4c72b6927
created_at: '2025-10-07T22:58:08Z'
title: 2025.10.07.22.58.08
filename: 8gb-test-framework
description: >-
  A drop-in test framework for local tool-calling text models and VLMs that fits
  within 8 GB memory, using Ollama and benchmarking against OpenRouter and Z.ai.
  Includes benchmarks for tool-use (BFCL), coding (Aider Polyglot), and
  knowledge (MMLU) with runtime optimizations for low VRAM.
tags:
  - test-framework
  - ollama
  - 8gb
  - tool-calling
  - vlm
  - bfcl
  - aider
  - mmlu
related_to_uuid: []
related_to_title: []
references: []
---
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
  If you want to probe “thinking” vs “no-thinking” and low-bit quants, Unsloth’s docs show the GGUF export path and Modelfile flow for **Ollama**. That means your finetunes stay template-correct. ([Unsloth Docs][5])

* **Baselines that always fit**
  **SmolLM2** (1.7B / 360M / 135M) with tool schemas—useful for sanity checks and cold-start perf. ([Ollama][6])

---

# Benchmarks (don’t reinvent wheels)

* **Tool-use → BFCL** (Berkeley Function Calling). Use the `bfcl-eval` CLI against *any OpenAI-compatible endpoint* (Ollama’s `/v1`). Start with “prompt” categories `simple,parallel,multiple` for generic instruct models; if a model truly supports OpenAI tools natively, you can switch to FC tracks. ([PyPI][7])
* **Coding → Aider Polyglot** (225 Exercism tasks). The harness runs in Docker and **recommends `ollama_chat/<model>`** for hitting local models reliably. This is the eval many “dynamic GGUF” claims cite, so you’re reproducing—not guessing. ([Aider][8])
* **(Optional) Knowledge → MMLU** (Hendrycks test) if you care about general-knowledge regressions when you push quants hard. ([GitHub][9])

---

# Runtime knobs that actually help on 8 GB

* **Enable tools in Ollama** (added mid-2024) and talk to **`http://localhost:11434/v1`**. ([Ollama][10])
* **Default context length** — set once for the server:

  ```bash
  OLLAMA_CONTEXT_LENGTH=8192 ollama serve
  ```

  (Ollama’s default is small; Aider also calls this out. You can also set per-request `num_ctx`.) ([Ollama][11])
* **KV-cache quantization** — big memory saver (requires Flash-Attention).

  ```bash
  export OLLAMA_KV_CACHE_TYPE=q8_0   # or q4_0 if desperate
  export OLLAMA_FLASH_ATTENTION=1
  ollama serve
  ```

  Official FAQ documents `OLLAMA_KV_CACHE_TYPE`. Caveat: some users report **Gemma 3** regressions with KV-quant (if you see weirdness, flip back to `f16`). ([Ollama][11])

---

# Suite layout (flat pkgs, ESM, FP, AVA)

```
packages/
  bench-core/   # tiny SDK: providers (OpenAI-like), judgers, result schema
  bench-cli/    # CLI runner: reads YAML, shells Aider/BFCL, runs custom tasks
  bench-web/    # Web Components viewer for results
```

## Mermaid: flow of a run

```mermaid
flowchart LR
  cfg[config.yaml] --> CLI
  subgraph CLI[bench-cli]
    CLI -->|spawn| Aider[Polyglot Docker]
    CLI -->|spawn| BFCL[bfcl-eval]
    CLI --> Core
  end
  subgraph Core[bench-core]
    Core -->|/v1| Ollama[Ollama (local)]
    Core -->|/v1| Remote[OpenRouter / Z.ai]
    Core --> Judges[LLM Judges]
    Core --> Store[JSONL/CSV/MD]
  end
  Aider --> Store
  BFCL --> Store
  Judges --> Store
  Store --> Web[bench-web viewer]
```

---

## Config (targets your exact stack)

```yaml
# bench-cli/config.yaml
runs:
  - name: gemma3-tools-q3
    provider: ollama
    baseUrl: http://localhost:11434/v1
    model: orieg/gemma3-tools:4b-it-qat-q3_k_s
    categories: [tooluse, coding]

  - name: gemma3n-tools-e2b
    provider: ollama
    baseUrl: http://localhost:11434/v1
    model: mashriram/gemma3nTools:e2b
    categories: [tooluse]

  - name: minicpm-v-4.5
    provider: ollama
    baseUrl: http://localhost:11434/v1
    model: openbmb/minicpm-v4.5
    categories: [vision]

judges:
  openrouter:
    baseUrl: https://openrouter.ai/api/v1
    apiKeyEnv: OPENROUTER_API_KEY
    model: openai/gpt-4o-mini

  zai:
    baseUrl: https://open.bigmodel.cn/api/paas/v4
    apiKeyEnv: ZAI_API_KEY
    model: glm-4.6
```

* **Why these**:

  * `gemma3-tools:*` are community images that explicitly wire tool schemas/templates for Gemma 3. Pick Q2/Q3 quants for ≤ 8 GB rigs. ([Ollama][1])
  * **Gemma 3n Tools** models are built for low-resource devices. ([Ollama][3])
  * **MiniCPM-V 4.5** gives you a credible single-image VLM locally; the Ollama card + GH are current. ([Ollama][4])
  * **Judges**: OpenRouter (unified OpenAI-like API) and Zhipu’s GLM-4.x (OpenAI-style endpoints). ([OpenRouter][12])

---

## CLI behavior (what it actually runs)

* **Tool-use**: `bfcl-eval` prompt track → your local `/v1` (Ollama). You’ll get per-category scores for `simple,parallel,multiple`. ([PyPI][7])
* **Coding**: Aider Polyglot in Docker → `ollama_chat/<model>` with “whole” edit format (more robust locally). ([Aider][13])
* **Custom SDK task**: one minimal tool (e.g., `add`) to sanity-check tool selection/arguments; the **judge** (OpenRouter/Z.ai) returns a 0/1.

---

## Security & reproducibility

* **Don’t expose** `:11434` publicly—Ollama’s OpenAI endpoint is unauthenticated. Put it behind localhost/reverse-proxy if you need remote access. (This is standard guidance around Ollama’s API usage.) ([docs.dagger.io][14])
* **Pin decoding** across runs (temp/top-p/top-k) and **log system info** (GPU, Ollama version).
* **Context window**: set `OLLAMA_CONTEXT_LENGTH` server-wide; Aider warns that small defaults silently drop context. ([Ollama][11])
* **KV-cache quant**: official FAQ documents it; if Gemma 3 looks flaky with `q8_0`, revert to `f16`. ([Ollama][11])

---

## Judges (pragmatic)

Use **one** judge first (OpenRouter *or* Z.ai). If you see variance, do majority-of-3 with three cheap judges over OpenRouter—its API is OpenAI-like and easy to swap models. ([OpenRouter][12])

---

## Optional Unsloth track

When you get to training, export your finetune directly to GGUF and then **“Saving to Ollama”**—this preserves the template in a Modelfile, which kills 90% of “my export is gibberish” issues. Then re-run Polyglot + BFCL with the *same* harness. ([Unsloth Docs][5])

---

## Quick start

```bash
# 1) memory-friendly runtime
export OLLAMA_CONTEXT_LENGTH=8192
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q8_0   # if Gemma 3 misbehaves, unset this
ollama serve &                      # OpenAI-compatible at http://localhost:11434/v1
# Tool calling landed mid-2024; you’re good. :contentReference[oaicite:23]{index=23}

# 2) models that fit
ollama pull orieg/gemma3-tools:4b-it-qat-q3_k_s       # tools-enabled Gemma3 variant
ollama pull mashriram/gemma3nTools:e2b                # tiny tools
ollama pull openbmb/minicpm-v4.5                      # VLM
# (Optionally add smollm2:* as a sanity baseline.) :contentReference[oaicite:24]{index=24}

# 3) judges
export OPENROUTER_API_KEY=...   # or ZAI_API_KEY=...

# 4) run your suite via the CLI (config.yaml as above)
pnpm --filter bench-cli start config.yaml
```

---

## Why this is sane

* **You’re standing on** Ollama’s native **tool-calling** + OpenAI-compatible `/v1`, **Aider Polyglot** for coding, and **BFCL** for tools—each with current docs & CLIs. ([Ollama][10])
* **Gemma 3 tools** (community) and **Gemma 3n tools** (tiny) map exactly to your 8 GB requirement. You can swap tags without rewriting code. ([Ollama][2])
* **MiniCPM-V 4.5** gives you a real VLM locally, verified by both **Ollama** and **OpenBMB**. ([Ollama][4])
* **Unsloth** keeps the export→Ollama path clean (GGUF, Modelfile), so your finetunes can be measured the *same way* as the baselines. ([Unsloth Docs][5])

If you want, I’ll now scaffold the **pnpm workspace** files + minimal **AVA tests** + a tiny **Web Components** table that reads `bench_results/*.json` and renders sortable comparisons.

[1]: https://ollama.com/orieg/gemma3-tools?utm_source=chatgpt.com "orieg/gemma3-tools"
[2]: https://ollama.com/search?q=gemma3+tools&utm_source=chatgpt.com "gemma3 tools · Ollama Search"
[3]: https://ollama.com/mashriram/gemma3nTools?utm_source=chatgpt.com "mashriram/gemma3nTools"
[4]: https://ollama.com/openbmb/minicpm-v4.5?utm_source=chatgpt.com "openbmb/minicpm-v4.5"
[5]: https://docs.unsloth.ai/basics/running-and-saving-models/saving-to-gguf?utm_source=chatgpt.com "Saving to GGUF | Unsloth Documentation"
[6]: https://ollama.com/library/smollm2?utm_source=chatgpt.com "smollm2"
[7]: https://pypi.org/project/bfcl-eval/?utm_source=chatgpt.com "bfcl-eval"
[8]: https://aider.chat/docs/leaderboards/?utm_source=chatgpt.com "Aider LLM Leaderboards"
[9]: https://github.com/OpenBMB/MiniCPM-V?utm_source=chatgpt.com "MiniCPM-V 4.5: A GPT-4o Level MLLM for Single Image ..."
[10]: https://ollama.com/blog/tool-support?utm_source=chatgpt.com "Tool support · Ollama Blog"
[11]: https://docs.ollama.com/faq?utm_source=chatgpt.com "FAQ"
[12]: https://openrouter.ai/docs/api-reference/overview?utm_source=chatgpt.com "OpenRouter API Reference | Complete API Documentation"
[13]: https://aider.chat/docs/llms/ollama.html?utm_source=chatgpt.com "Ollama"
[14]: https://docs.dagger.io/reference/configuration/llm/?utm_source=chatgpt.com "LLM Providers"
