---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Specify OSS model URL"
conversation_id: 68a75713-75a0-8327-b488-5741784cdd6f
create_time: 08/21/2025 at 12:28 PM
update_time: 08/21/2025 at 2:48 PM
---

# Title: Specify OSS model URL

Created: 08/21/2025 at 12:28 PM
Last Updated: 08/21/2025 at 2:48 PM
Chat URL: https://chat.openai.com/c/68a75713-75a0-8327-b488-5741784cdd6f


>[!nexus_user] **User** - 08/21/2025 at 12:28 PM
> how do I specify the oss model url for @openai/codex to be something other than ollama?
<!-- UID: 13abad34-ff85-48a1-b757-62d3838bae62 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 12:28 PM
> By default `@openai/codex` assumes **Ollama** when you use the `--oss` flag, but it’s not actually hard-wired to only support Ollama. You can point it at any OpenAI-compatible OSS server (vLLM, LM Studio, LMDeploy, llama.cpp server, etc.) as long as it speaks the same API shape.
> 
> Here’s how you do it:
> 
> ### 1. Use the environment variable
> The CLI looks for `OPENAI_BASE_URL` (or sometimes `OPENAI_API_BASE` depending on version). 
> Example:
> 
> ```bash
> export OPENAI_BASE_URL=http://localhost:8000/v1
> codex --oss
> ```
> 
> Now instead of hitting `http://localhost:11434/v1` (Ollama’s default), it will talk to whatever URL you set.
> 
> ### 2. Pass it in the CLI
> If your version of codex has the override flag, you can do:
> 
> ```bash
> codex --oss --openai-base-url http://127.0.0.1:8080/v1
> ```
> 
> ### 3. Config file
> If you’re using a `~/.codex/config.toml` or `codex.toml` in your repo, you can pin it there:
> 
> ```toml
> [openai]
> base_url = "http://localhost:8080/v1"
> ```
> 
> ---
> 
> ### ⚠️ Important
> - The backend must be OpenAI-API compatible (`POST /v1/chat/completions`, `POST /v1/completions`, etc.). 
> - If you’re running `vllm` or `llama.cpp` server, check that you’re starting it with the OpenAI HTTP server flag. 
> - Some backends don’t implement the whole API surface (tools/function calls, SSE streaming, etc.), so codex may fail unless those endpoints exist.
> 
> ---
> 
> Do you want me to show you how to run, say, **vLLM** or **llama.cpp server** with the correct `--api` flags so you can plug that into codex instead of Ollama?
<!-- UID: 2b60c80e-a551-4f85-9dc2-adeffdafb8ae -->

---


