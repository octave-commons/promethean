---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Ollama GPU on Windows"
conversation_id: 688ce766-7f54-8326-85ea-8d8d3953e9d6
create_time: 08/01/2025 at 11:12 AM
update_time: 08/01/2025 at 11:17 AM
---

# Title: Ollama GPU on Windows

Created: 08/01/2025 at 11:12 AM
Last Updated: 08/01/2025 at 11:17 AM
Chat URL: https://chat.openai.com/c/688ce766-7f54-8326-85ea-8d8d3953e9d6


>[!nexus_user] **User** - 08/01/2025 at 11:12 AM
> Ollama on windows never seems to use my gpu, though it occupies Vram.
<!-- UID: 01d59b27-18a0-4574-99a9-6f3a3a933221 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 11:12 AM
> Yeah, this is one of those frustrating gray areas in AI tooling right now. Here's the deal, bluntly:
> 
> ---
> 
> ### 🚫 Ollama doesn't use GPU on Windows — officially.
> 
> As of now (August 2025), **Ollama does not support GPU acceleration on Windows**. Even if you see VRAM being occupied, it's not actually running inference on your GPU cores — it's likely due to memory-mapped operations, shared memory pools, or upstream libraries pre-allocating VRAM even though they compute on CPU.
> 
> Here’s what’s likely happening:
> - Ollama uses GGML/LLM-based models under the hood (like llama.cpp).
> - On **Linux/macOS**, it supports GPU acceleration via CUDA/Metal.
> - On **Windows**, it **falls back to CPU-only inference**, even if it allocates memory on your GPU. It's misleading and wastes RAM/VRAM without giving you the speed boost you'd expect.
> 
> ---
> 
> ### 🛠️ What Can You Do About It?
> 
> #### 1. **Switch to WSL + CUDA (If You Have an NVIDIA GPU)**
> You can get actual GPU acceleration on Windows by:
> - Installing **WSL2 + Ubuntu**
> - Setting up the **NVIDIA CUDA toolkit for WSL**
> - Running Ollama from Linux under WSL
> 
> This works. It’s fiddly but gets the job done. VRAM is actually used *for compute*.
> 
> #### 2. **Use llama.cpp with cuBLAS manually**
> If you're comfortable ditching Ollama’s cozy UX:
> - Compile `llama.cpp` yourself with `LLAMA_CUBLAS=1` on Windows using MSVC or WSL.
> - Run models directly using the llama CLI or API.
> - You’ll get **real GPU acceleration**, but lose Ollama’s model server & chat niceties.
> 
> #### 3. **Wait for Ollama to add Windows GPU support**
> There have been hints from the team that **DirectML or CUDA on Windows** support is on their roadmap, but no ETA.
> 
> You can track this on their GitHub: https://github.com/ollama/ollama/issues
> 
> ---
> 
> ### 🧪 How to Confirm It's *Not* Using Your GPU
> 
> Use tools like:
> - **Process Explorer** or **Task Manager → Performance → GPU** tab
> - **nvidia-smi** (in WSL or native)
> - Look for **compute utilization > 0%**. If it’s idle but VRAM is used, that’s your sign: it's all CPU inference.
> 
> ---
> 
> ### ✅ TL;DR (for Obsidian-style tagging)
> 
> #ollama #windows #gpu #ai-acceleration #llama #wsl #cpu-vs-gpu
> 
> - Ollama on Windows does **not** use GPU for inference.
> - VRAM usage is misleading and doesn't mean actual GPU compute.
> - For real GPU use, run in **WSL2 + CUDA**, or use **llama.cpp with cuBLAS** directly.
> - Native Windows GPU support might come later, but it’s not here yet.
> 
> ---
> 
> If you're down to explore the WSL setup, I can walk you through a scriptable way to do it clean. Or help you spin up a llama.cpp service with CUDA on your 4070 Ti.
<!-- UID: 26ec4b78-11d4-47aa-afda-8fc93fc2abb1 -->

---




>[!nexus_user] **User** - 08/01/2025 at 11:14 AM
> gah, ok. Kinda wanted to have this chat interface and provide a pathway to users on all these platforms.
> 
> I don't know exactly why I chose to start using ollama over other providers.... maybe it was just the one I got to work?
> 
> How do different local llm providers stack up?
> 
> You know maybe all my tooling should just be stuff I roll on my own with transformers.
> 
> Unless some other service like maybe llama.cpp can run them faster?
<!-- UID: 2b7c9850-a8fe-4fb8-b0be-0df2e76f0997 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 11:14 AM
> Yeah, this is the core tension right now between *ease of use* vs *full control*. You’re not alone in starting with Ollama — a lot of people do — because:
> 
> > It Just Works™… until you want to control the damn thing.
> 
> Let’s step through this methodically and actually **map out the tradeoffs** between the local LLM options you're probably orbiting: `Ollama`, `transformers`, `llama.cpp`, and others like `LM Studio`, `lmdeploy`, etc.
> 
> ---
> 
> ## 🧰 Local LLM Inference Options – Compared
> 
> ### 1. **Ollama**
> - **✅ Pros**:
>  - One-line install, dead simple.
>  - Runs a model server you can hit over HTTP or CLI.
>  - Model registry (like Docker) makes switching easy.
> - **❌ Cons**:
>  - **No GPU on Windows** (yet).
>  - Limited model tweaking.
>  - No quantization tuning, no batching control, no token streaming out of the box.
>  - No direct access to transformer internals.
> 
> ### 2. **`transformers` + `transformers.gg` / `bitsandbytes`**
> - **✅ Pros**:
>  - **Full control** of everything.
>  - You get batching, attention mask tweaks, custom KV caches, even fine-tuning and LoRA.
>  - Integrates well into a real ML pipeline (like your Cephalon).
>  - Has GPU support on all OSes (via PyTorch/CUDA).
> - **❌ Cons**:
>  - Heavy. Really heavy. Even quantized models still need a solid GPU to be performant.
>  - Memory leaks, weird version conflicts, CUDA hell.
>  - You have to manage weights, configs, and prompts manually.
> 
> ### 3. **llama.cpp**
> - **✅ Pros**:
>  - Fast **quantized inference** (Q4_K_M, Q6_K, etc.) that runs on CPU/GPU.
>  - Hugely customizable.
>  - Compiles on everything (Mac/Linux/Win/WSL).
>  - Real-time token streaming, prompt cache, grammar parsing, etc.
> - **❌ Cons**:
>  - Models must be converted to GGUF format.
>  - GPU support is… finicky on Windows unless you compile with DirectML or go WSL.
>  - No “batteries included” interface; you roll your own chat interface or use llama.cpp’s very basic one.
> 
> ### 4. **LM Studio / GPT4All / OpenWebUI**
> - **✅ Pros**:
>  - GUI on top of llama.cpp or GGUF models.
>  - Great for demoing or onboarding less technical users.
> - **❌ Cons**:
>  - Not ideal for programmatic access or custom architecture integration.
>  - Limited config control (unless you dig into the backend).
> 
> ---
> 
> ## 🧠 If You're Building a Custom System Like Promethean…
> 
> You're already way past the "click-to-chat" phase.
> 
> You want:
> - Token streaming
> - KV cache management
> - Context window tuning
> - Embedding control
> - Native integration with your memory/agent system
> - Predictable performance across platforms (Windows/Linux/WSL)
> 
> **Rolling your own with `transformers`** (maybe layering in `gguf` or `llama.cpp` behind a WebSocket server for fast inference) is probably the direction you want to go **if you want maximum control**.
> 
> But the intermediate route is solid too:
> 
> ---
> 
> ### 🧱 Hybrid Stack Proposal (for Promethean)
> 
> | Layer | Tool | Why |
> |-------|------|-----|
> | Inference | `llama.cpp` + `gguf` | Lightweight, streamable, quantized. Put it behind a WebSocket. |
> | Training / Fine-tuning | `transformers` | Full stack control for retraining and experimentation. |
> | Glue | Your own server (Node or Python) | Pipe requests, handle batching/context/chunking. |
> | Frontend Chat UI | Sibilant/TS + WebSocket | Chat UI hooked into your memory + agent loop. |
> | Dev Playground | Ollama or LM Studio | Quick experimentation, prototyping. |
> 
> You could keep Ollama around as a fallback or onboarding layer. But don’t tie your system to it. It’s a tool, not a foundation.
> 
> ---
> 
> ### 💡 TL;DR
> 
> #llama #transformers #local-llm #gpu #ollama #system-design
> 
> - **Ollama** is great for getting started but poor for control/performance.
> - **transformers** gives you full control and PyTorch/CUDA support but is heavier and requires more setup.
> - **llama.cpp** is blazing fast for quantized models and great for embedded agents, especially if you build your own serving layer.
> - You're right to consider building your own tooling stack. If you're managing your own inference loop, **combine llama.cpp (for inference) + transformers (for training/debug)**.
> 
> ---
> 
> Want a sample `llama.cpp` WebSocket server for use in Cephalon? Or something to bridge Ollama API compatibility into your agent loop so you can swap backends? I can sketch those out.
<!-- UID: 3d9569cf-720f-4b88-9624-e92e48570f51 -->

---




>[!nexus_user] **User** - 08/01/2025 at 11:16 AM
> Right... I already decoupled the cephalon from it by putting it into a seperate service I hosted that was step one.
> 
> Step two is setting up a driver system to let me swap them in and out.
<!-- UID: 651274c5-130c-49a3-8ec2-9895dacc558c -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 11:16 AM
> Perfect. You're already playing the game on hard mode — and winning — by isolating the inference layer as a **pluggable service**. That’s the move most serious AI systems never make early enough.
> 
> ---
> 
> ## 🧩 Step Two: Driver System for Swappable LLM Backends
> 
> Let’s get concrete and design the driver interface:
> 
> ---
> 
> ### 🧱 **Abstraction Goals**
> 
> You want:
> - **Interchangeable backends** (`ollama`, `llama.cpp`, `transformers`, `remote`)
> - Streamed or batch inference support
> - Unified config: model name, temperature, max tokens, etc.
> - Compatible with your message/state system (e.g. Cephalon)
> 
> ---
> 
> ### 📐 Driver Interface
> 
> Let's call it `CephalonDriver`. The interface should support:
> 
> ```js
> // pseudocode / TypeScript-style
> interface CephalonDriver {
>  readonly name: string
>  supportsStreaming(): boolean
>  infer(prompt: string, options?: GenerationOptions): Promise<string> | AsyncIterable<string>
>  embed(texts: string[]): Promise<number[][]> // optional
>  abortRequest(requestId: string): void // optional
> }
> ```
> 
> ```ts
> type GenerationOptions = {
>  temperature?: number
>  maxTokens?: number
>  stop?: string | string[]
>  model?: string
>  requestId?: string // for streaming aborts
> }
> ```
> 
> This means all you have to do is:
> 
> - Implement a driver for:
>  - 🟡 **Ollama** (HTTP API)
>  - 🔵 **llama.cpp** (custom WebSocket or subprocess)
>  - 🔴 **Transformers** (local model with direct function call)
>  - 🟢 **Remote API** (OpenAI, Claude, etc., if needed)
> - Have a driver selector that injects the right one into the Cephalon pipeline.
> 
> ---
> 
> ### 🔁 Hot-Swapping Logic
> 
> Here’s a basic dynamic loader you can mount inside your server:
> 
> ```js
> function loadDriver(config): CephalonDriver {
>  switch (config.backend) {
>  case 'ollama': return new OllamaDriver(config)
>  case 'llama.cpp': return new LlamaCppDriver(config)
>  case 'transformers': return new TransformersDriver(config)
>  case 'openai': return new OpenAIDriver(config)
>  default: throw new Error(`Unknown backend: ${config.backend}`)
>  }
> }
> ```
> 
> You can either:
> - Pass `config.backend` as an ENV var (e.g. `LLM_BACKEND=ollama`)
> - Or dynamically swap in real time via an admin endpoint/UI toggle if you're wild
> 
> ---
> 
> ### ⚡ Recommended Transport Layer
> 
> If you build your own:
> - Use **WebSockets** or **Server-Sent Events (SSE)** for streaming responses
> - JSON over HTTP for non-streamed requests
> - Have Cephalon abstract streaming vs batch to a common format
> 
> ```js
> // Unified stream handler
> for await (const token of driver.infer(...)) {
>  cephalon.sendToken(token)
> }
> ```
> 
> ---
> 
> ### 🧠 Bonus: Driver Capability Detection
> 
> ```ts
> driver.supportsStreaming() // true/false
> driver.supportsEmbeddings() // optional
> driver.getAvailableModels() // optional metadata fetch
> ```
> 
> Useful when you want the system to auto-adjust based on what's available.
> 
> ---
> 
> ## 🧠 TL;DR
> 
> #llm-driver #pluggable-inference #cephalon #agent-architecture #streaming #modular
> 
> - You’re doing it right by decoupling inference as a pluggable service.
> - Define a clean driver interface (supportsStreaming, infer, embed).
> - Implement adapters for Ollama, llama.cpp, and transformers.
> - Add hot-swapping based on ENV or runtime config.
> - Use WebSockets or async iterables to unify streaming behavior.
> 
> ---
> 
> Want a working reference `llama.cpp` WebSocket driver spec? Or an Ollama wrapper that supports token streaming through Node/TypeScript's async generator interface? I can sketch one for your current Cephalon pipeline.
<!-- UID: 7fdfa55c-7858-4f2e-b348-7d4ecd947fae -->

---


