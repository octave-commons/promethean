---
uuid: d6cc5dba-1d41-4351-a018-f5d4fd711f0d
created_at: '2025-10-07T22:07:13Z'
title: 2025.10.07.22.07.13
filename: bench_ollama_qwen.sh
description: >-
  Bash script for benchmarking Qwen3 models with Ollama, using EvalPlus for
  coding benchmarks and BFCL for tool-use benchmarks. Quantizes models and KV
  cache to optimize VRAM usage.
tags:
  - Qwen3
  - Ollama
  - EvalPlus
  - BFCL
  - quantization
  - VRAM
  - benchmarking
---
Love it. Let’s make this practical: build a few Qwen3 variants (quant + context tweaks), then run (1) a coding benchmark that’s respected and easy to run locally (HumanEval/MBPP via **EvalPlus**) and (2) a **tool-use** benchmark that’s become the default for function-calling (**BFCL**). I’m giving you a single Bash script that does the whole loop.

A couple of facts before the code (so you know I’m not hand-waving):

* **EvalPlus** has a native **Ollama backend**; you just point it at `http://localhost:11434/v1` and it works. ([GitHub][1])
* **BFCL** ships a `bfcl` CLI. It can talk to **pre-existing OpenAI-compatible endpoints** (skip server setup & set endpoint/port), which is exactly what Ollama exposes at `/v1`. We’ll run the “prompt” (non-native FC) track to avoid hard OpenAI‐style tool schemas, which Ollama doesn’t implement natively yet. ([PyPI][2])
* To squeeze more into VRAM: (a) quantize the *weights* when creating the model (`ollama create --quantize q4_K_M|q5_K_M|q8_0`), and (b) quantize the **KV cache** with `OLLAMA_KV_CACHE_TYPE` (e.g., `q8_0`), ideally with Flash Attention on. You can also bump default context with `OLLAMA_CONTEXT_LENGTH`. ([ollama.readthedocs.io][3])

---

# Quick prerequisites

* Ollama running locally (make sure you’re on a recent build).
* Python 3.10+ and `pip`.
* One-time installs:

  ```bash
  pip install evalplus bfcl-eval
  ```

  (BFCL will create a local project directory for results; we’ll set that in the script.) ([GitHub][1])

---

# The script

Save as `bench_ollama_qwen.sh` and `chmod +x bench_ollama_qwen.sh`.

```bash
#!/usr/bin/env bash
set -euo pipefail

# ---- Tunables ---------------------------------------------------------------
# Models to compare (you can comment one out if you only want 14B or 8B)
BASE_MODELS=("qwen3:14b" "qwen3:8b")

# Quantization levels for model weights (Ollama quantize flag)
QUANTS=("q4_K_M" "q5_K_M")   # add "q8_0" if it fits your VRAM
# Context sizes to bake into the Modelfile (also changeable at runtime)
CTX_SIZES=(8192 16384)

# Global KV cache quantization (reduces KV memory; requires Flash Attention)
# Valid values: f16 | q8_0 | q4_0
export OLLAMA_KV_CACHE_TYPE="${OLLAMA_KV_CACHE_TYPE:-q8_0}"   # adjust to taste

# If you run 'ollama serve' manually in this same shell, the env var above will apply.
# If Ollama runs as a system service, set this in the service env and restart it.

# Ollama OpenAI-compatible base URL for evals
OAI_BASE="http://localhost:11434/v1"

# Where to store all artifacts
ROOT_DIR="${PWD}/runs"
mkdir -p "${ROOT_DIR}"

# ---- Sanity checks ----------------------------------------------------------
command -v ollama >/dev/null || { echo "ollama not found in PATH"; exit 1; }
python - <<'PY'
import sys, importlib.util
missing=[]
for pkg in ["evalplus","bfcl_eval"]:
    if importlib.util.find_spec(pkg) is None: missing.append(pkg)
if missing:
    print("Missing python packages:", ", ".join(missing))
    sys.exit(1)
PY

# ---- Helper: build a model variant -----------------------------------------
build_variant () {
  local base="$1" quant="$2" ctx="$3"

  # tag name: replace colon in base (ollama tags can't contain colon in repo name)
  local base_sanitized="${base//:/-}"
  local tag="local/${base_sanitized}-${quant}-c${ctx}"

  local modelfile
  modelfile="$(mktemp)"
  cat > "${modelfile}" <<EOF
FROM ${base}
# Bake in context (you can still override via API/CLI)
PARAMETER num_ctx ${ctx}
# If you want to push more layers to GPU manually on some setups, uncomment ONE of these:
# PARAMETER num_gpu 50
# PARAMETER num_gpu_layers 50
EOF

  echo ">> Creating ${tag}"
  # Quantize model weights on creation
  ollama create "${tag}" -f "${modelfile}" --quantize "${quant}"
  rm -f "${modelfile}"

  echo "${tag}"
}

# ---- Helper: run EvalPlus (HumanEval + MBPP) -------------------------------
run_evalplus () {
  local tag="$1"
  echo ">> EvalPlus: HumanEval for ${tag}"
  evalplus.evaluate \
    --model "${tag}" \
    --dataset humaneval \
    --backend ollama \
    --base-url "${OAI_BASE}" \
    --greedy

  echo ">> EvalPlus: MBPP for ${tag}"
  evalplus.evaluate \
    --model "${tag}" \
    --dataset mbpp \
    --backend ollama \
    --base-url "${OAI_BASE}" \
    --greedy

  # Results are under evalplus_results/{humaneval|mbpp}/ by default
}

# ---- Helper: run BFCL (Prompt mode against OpenAI-compatible endpoint) -----
run_bfcl_prompt () {
  local tag="$1"
  local outdir="${ROOT_DIR}/${tag}/bfcl"
  mkdir -p "${outdir}"
  export BFCL_PROJECT_ROOT="${outdir}"

  # Minimal .env for BFCL to hit a local OpenAI-compatible server
  cat > "${BFCL_PROJECT_ROOT}/.env" <<ENV
LOCAL_SERVER_ENDPOINT=localhost
LOCAL_SERVER_PORT=11434
OPENAI_API_BASE=${OAI_BASE}
# If you enable the web_search category later, add your SERPAPI key here:
# SERPAPI_API_KEY=
ENV

  echo ">> BFCL: generating responses (prompt track) for ${tag}"
  # We use --skip-server-setup to tell BFCL not to spin up vLLM/sglang.
  # For prompt-mode (no native function-calling), we evaluate 'simple,parallel,multiple' categories first.
  # NOTE: BFCL maintains a registry of model descriptors. For "prompt mode" on an OAI-compatible endpoint,
  #       many releases include a generic openai-prompt wrapper. If your installed version lacks it,
  #       consult SUPPORTED_MODELS.md in bfcl-eval and pick the closest "Prompt" model, or add one.
  bfcl generate \
    --model openai-prompt \
    --test-category simple,parallel,multiple \
    --skip-server-setup \
    --num-threads 1 || {
      echo "BFCL generation failed for ${tag} (model alias may differ in this bfcl-eval version)."
      echo "Check SUPPORTED_MODELS.md in bfcl-eval and use an available '*-Prompt' alias."
      return 1
    }

  echo ">> BFCL: scoring for ${tag}"
  bfcl evaluate \
    --model openai-prompt \
    --test-category simple,parallel,multiple || {
      echo "BFCL evaluate failed for ${tag}."
      return 1
    }

  # Scores land under $BFCL_PROJECT_ROOT/score/
}

# ---- Matrix loop ------------------------------------------------------------
echo "== Using OLLAMA_KV_CACHE_TYPE=${OLLAMA_KV_CACHE_TYPE} (set OLLAMA_FLASH_ATTENTION=1 for best effect) =="
echo "== Results root: ${ROOT_DIR} =="

for base in "${BASE_MODELS[@]}"; do
  for quant in "${QUANTS[@]}"; do
    for ctx in "${CTX_SIZES[@]}"; do
      tag="$(build_variant "${base}" "${quant}" "${ctx}")"

      # Warm the model once (helps avoid first-token latency in evals)
      curl -sS "${OAI_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "{\"model\":\"${tag}\",\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}]}" >/dev/null || true

      run_evalplus "${tag}"

      # BFCL prompt track (best-effort; see notes in function)
      run_bfcl_prompt "${tag}" || echo "BFCL skipped/failed for ${tag} (see message above)."

      echo "== Done with ${tag} =="
    done
  done
done

echo "All variants processed."
echo "EvalPlus results in ./evalplus_results/{humaneval|mbpp}"
echo "BFCL results under ${ROOT_DIR}/<tag>/bfcl/{result,score}"
```

---

## How to run

```bash
# (optional) If you run ollama in this shell:
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q8_0     # trims KV memory with small quality hit
export OLLAMA_CONTEXT_LENGTH=8192    # server default context (still overridden per Modelfile)  # :contentReference[oaicite:4]{index=4}
ollama serve &                       # or ensure your service has these envs, then restart it

# one-time deps
pip install evalplus bfcl-eval

# pull the bases once (will be re-used by 'ollama create')
ollama pull qwen3:14b
ollama pull qwen3:8b

# run the matrix
./bench_ollama_qwen.sh
```

---

## What you’ll get

* **Weight quantization variants** (e.g., `local/qwen3-14b-q4_K_M-c8192`), created with `ollama create --quantize ...`. ([ollama.readthedocs.io][3])
* **Coding scores**: HumanEval + MBPP via EvalPlus’ Ollama backend (outputs live in `./evalplus_results/…`). ([GitHub][1])
* **Tool-use (function-calling) scores**: BFCL **prompt track** (simple / parallel / multiple) under `runs/<tag>/bfcl/score`. If your installed `bfcl-eval` release names the generic OpenAI-prompt model differently, swap `--model openai-prompt` for whatever `SUPPORTED_MODELS.md` lists in your version. The crucial switches are `--skip-server-setup` and the local endpoint/port in `.env`. ([PyPI][2])

---

## Why these choices (short + opinionated)

* **EvalPlus** is the most no-nonsense way to compare code gen locally; it adds extra tests over HumanEval/MBPP so you don’t get fake “passes.” It natively supports **Ollama** so you aren’t writing adapters. ([GitHub][1])
* **BFCL** is the de facto public leaderboard for **tool/function calling** now (V4 adds agentic stressors). Running its **prompt** track keeps you honest on argument formatting and function selection even without native OpenAI tool schemas. If/when Ollama exposes true function-calling over the `/v1` interface, you can switch to the **FC** track. ([PyPI][4])
* **Squeezing Qwen3:14B vs 8B**: your best knobs are (a) weight quant (`--quantize`) and (b) **KV cache quant** with Flash Attention. Default KV is `f16`; dropping to `q8_0` often halves KV memory with negligible quality hit; `q4_0` is more aggressive if you’re desperate. Try `q5_K_M + q8_0 KV` first. ([Ollama][5])

If you want, I can add a tiny TS wrapper (functional style) that shells this script, parses EvalPlus JSON, and emits a flat CSV/HTML table for Obsidian. But the core benchmarking loop above is ready to use.

[1]: https://github.com/evalplus/evalplus "GitHub - evalplus/evalplus: Rigourous evaluation of LLM-synthesized code - NeurIPS 2023 & COLM 2024"
[2]: https://pypi.org/project/bfcl-eval/ "bfcl-eval · PyPI"
[3]: https://ollama.readthedocs.io/en/import/?utm_source=chatgpt.com "Importing models - Ollama English Documentation"
[4]: https://pypi.org/project/nvidia-bfcl/?utm_source=chatgpt.com "nvidia-bfcl"
[5]: https://docs.ollama.com/faq "FAQ - Ollama"
