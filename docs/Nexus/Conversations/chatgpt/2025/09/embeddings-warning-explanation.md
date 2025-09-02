---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Embeddings warning explanation"
conversation_id: 68b6346c-69fc-8330-98da-c85f02664d05
create_time: 09/01/2025 at 7:03 PM
update_time: 09/01/2025 at 7:04 PM
---

# Title: Embeddings warning explanation

Created: 09/01/2025 at 7:03 PM
Last Updated: 09/01/2025 at 7:04 PM
Chat URL: https://chat.openai.com/c/68b6346c-69fc-8330-98da-c85f02664d05


>[!nexus_user] **User** - 09/01/2025 at 7:03 PM
> ngs required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
> ollama-1 | init: embeddings required but some input tokens were not marked as outputs -> overriding
<!-- UID: 2107a3f0-e479-4381-bfdf-02b0887e59ed -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 7:04 PM
> Short version: it’s a noisy **warning** from the llama.cpp backend when a model is initialized in **embedding** mode. It’s telling you that some tokenizer “added tokens” weren’t flagged as “output-able,” so it’s flipping that flag so it can produce embeddings for them. **Safe to ignore unless your /embed calls are actually failing.** (You’ll see the exact same message in llama.cpp/llama-cpp-python logs.) citeturn1view0
> 
> If you want less spam and a quick sanity check:
> 
> # What to do (practical)
> 
> 1) Verify embeddings really work 
> Run a quick call and check you get non-zero vectors of the expected length.
> ```bash
> curl -s http://localhost:11434/api/embeddings \
>  -d '{"model":"nomic-embed-text","prompt":"hello world"}' | jq '.embedding | length'
> ```
> You should see the dimension (e.g., 768/1024/3072 depending on model). If it’s zero, NaN-ish, or throws, tell me which model you’re using and I’ll point at a clean alternative.
> 
> 2) Stop the log flood (Docker Compose) 
> Add both a lower log level and log rotation:
> 
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:latest
>  environment:
>  # trims noise; DEBUG is off by default
>  - OLLAMA_LOG_LEVEL=error
>  logging:
>  driver: json-file
>  options:
>  max-size: "10m"
>  max-file: "3"
> ```
> (Use rotation anyway; Docker keeps logs forever by default.) cite
> 
> 3) Prefer true embedding models 
> If you’re embedding into Chroma, stick to models built for embeddings (`nomic-embed-text`, `bge-micro`, etc.). Calling `/embed` on a chat model is possible but more brittle and tends to emit these init warnings more often. Also, ensure you set the embedding function **at collection creation** in Chroma (you already found this). If you mix functions per collection, you’ll fight weird shape/compat errors later.
> 
> 4) Optional: reduce parallel inits 
> If you’re kicking multiple pipelines at once, set:
> ```yaml
> environment:
>  - OLLAMA_NUM_PARALLEL=1
> ```
> so models don’t all cold-start simultaneously (cuts repeated init messages).
> 
> # When it’s *not* harmless
> - Your `/embed` returns zeros/NaNs, or dims don’t match what Chroma expects.
> - You converted a custom GGUF and the tokenizer is mangled (rare, but if you DIY-quantized a model and see crashes rather than warnings, that’s a different problem).
> 
> # Why this happens (blunt version)
> The tokenizer JSON/ggml metadata marks some special/added tokens as **not producing outputs**. Embedding mode needs outputs for every token used, so llama.cpp overrides that flag on load and prints this warning… repeatedly. It’s bookkeeping, not a functional error. citeturn1view0
> 
> If you want, I can give you a minimal TS snippet that (a) creates the Chroma collection with an `OllamaEmbeddingFunction`, (b) asserts vector length once, and (c) refuses to continue if dimensions mismatch—so you don’t discover it after a long run. #ollama #embeddings #chroma #devops #docker-logs
<!-- UID: 1b4978f0-db93-4e7d-942f-663803d5056f -->

---


