---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Using Codex with Ollama"
conversation_id: 68a724b0-f2d0-8328-9bc7-9c762a2f0a16
create_time: 08/21/2025 at 8:52 AM
update_time: 08/21/2025 at 10:51 AM
---

# Title: Using Codex with Ollama

Created: 08/21/2025 at 8:52 AM
Last Updated: 08/21/2025 at 10:51 AM
Chat URL: https://chat.openai.com/c/68a724b0-f2d0-8328-9bc7-9c762a2f0a16


>[!nexus_user] **User** - 08/21/2025 at 8:52 AM
> How have others used openai's codex cli tool to effectively generate code with open source models using ollama?
<!-- UID: 10ef6058-2fb2-4f0d-b9a5-29ef6210cdd2 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 8:53 AM
> Short answer: folks are getting good results by pointing Codex CLI at an OpenAI‑compatible local server (usually Ollama), choosing OSS models that handle tool/function‑calling well, and giving Codex enough repo context + autonomy to iterate (git + sandbox + approval modes). Here’s the distilled playbook from docs + community write‑ups:
> 
> # 1) Wire Codex to Ollama the “official” way
> Codex has first‑class OSS support. You can either use the one‑flag shortcut… 
> ```bash
> # Default to your local OpenAI‑compatible host on :11434
> codex --oss -m gpt-oss:20b
> # or pick your own model
> codex --oss -m "llama3.1:8b"
> ```
> …or define an Ollama provider once in `~/.codex/config.toml` and then use profiles:
> ```toml
> # ~/.codex/config.toml
> [model_providers.ollama]
> name = "Ollama"
> base_url = "http://localhost:11434/v1"
> 
> [profiles.ollama_llama8b]
> model_provider = "ollama"
> model = "llama3.1:8b"
> ```
> Then:
> ```bash
> codex --profile ollama_llama8b
> ```
> This is exactly how the Codex README shows using OSS providers & profiles, including the `--oss` fast‑path and how to point at a remote host. citeturn1view0
> 
> # 2) Pick models that actually support tools/function‑calling
> Codex relies on Chat Completions/Responses semantics with tools. Ollama’s OpenAI‑compat layer supports that, but not all model builds expose tool calling equally. Community reports + Ollama posts recommend picking models with tool support (e.g., Llama 3.1/3.2 variants, Qwen 2.5/3 coder builds, “gpt‑oss” images) and avoiding ones that ignore `tools` or respond unreliably. cite
> 
> If your chosen model struggles with tools, people often insert a compatibility layer like LiteLLM or switch to a model known to respect function calls; multiple HN/Reddit threads call out that tool‑calling support is the main “gotcha” with OSS backends. cite
> 
> # 3) Give Codex autonomy—but inside its sandbox—and keep it in git
> Typical working modes others use:
> 
> - **Read/write sandbox + on‑request approvals** during normal coding so Codex can run commands, write files, run tests, then ask before risky actions. 
>  ```bash
>  codex --sandbox workspace-write --ask-for-approval on-request
>  ```
> - **Read‑only + on‑request** when exploring unfamiliar repos. 
> - **Full‑auto in CI** for batch tasks (changelog updates, test fixes), but only inside a controlled workspace. Codex provides examples of these modes and a CI snippet. citeturn1view0
> 
> Because Codex produces diffs and shells out to run tests, keeping the folder under git is strongly recommended (and is how many blog/guide authors use it). citeturn1view0
> 
> # 4) Seed Codex with project guidance (`AGENTS.md`)
> People report better OSS‑model results when Codex can read a short “how this repo works” note:
> 
> - Put global guidance in `~/.codex/AGENTS.md`, project specifics at repo root, and feature‑level notes in subfolders—Codex merges them top‑down. citeturn1view0
> 
> For your Promethean setup, this is where you can declare things like “use @shared/ts/dist/… imports,” “prefer Hy/Sibilant pseudo first,” or “never touch PM2 config without approval.”
> 
> # 5) Concrete, community‑tested workflows
> 
> **A. “Make tests pass” loop (local model)** 
> ```bash
> # Use your Ollama profile
> codex --profile ollama_llama8b "Write unit tests for shared utils and iterate until they pass."
> ```
> This pattern—generate tests, run them, iterate—matches the official examples and the month‑long user reports. citeturn1view0
> 
> **B. Guided refactors with approvals** 
> ```bash
> codex --profile ollama_llama8b \
>  --sandbox workspace-write --ask-for-approval on-request \
>  "Refactor the broker client to support queue semantics; update docs and add AVA tests."
> ```
> Authors note better outcomes when you state acceptance criteria and test commands in the prompt. cite
> 
> **C. Non‑interactive batch use** 
> ```bash
> echo "Update CHANGELOG for next release" | codex exec --profile ollama_llama8b --ask-for-approval never
> ```
> Great for repetitive chores in CI (Codex shows a GitHub Actions example). citeturn1view0
> 
> # 6) If tools don’t fire reliably
> - **Verify your Ollama version supports tools** and that the model card says “tools.” cite 
> - **Try a different model build** (e.g., Llama 3.1 “instruct/coder” variants, Qwen 2.5/3 coder, Codestral, or the “gpt‑oss” family). Community threads show mixed tool‑calling behavior across builds. cite 
> - **Proxy via LiteLLM** if you need stricter OpenAI compatibility (it can normalize tool calls and structured outputs). cite
> 
> # 7) What “good” looks like (expectations)
> - With strong models (o4‑mini via cloud) Codex can do deep repo‑level tasks; with OSS via Ollama, you’ll usually get **solid local edits/test loops**, especially when you narrow scope and provide test commands. Community comparisons suggest OSS models may hallucinate repo structure more than top‑tier hosted models—keep prompts scoped and let tests drive. cite
> 
> ---
> 
> ## Quick starter checklist (Ollama)
> 1) Pull a tools‑capable model in Ollama (e.g., `ollama pull llama3.1:8b` or `ollama pull gpt-oss:20b`). cite 
> 2) Add the `model_providers.ollama` block in `~/.codex/config.toml` and create a `profiles.*` entry. citeturn1view0 
> 3) Add `AGENTS.md` (coding standards, commands to run, layout). citeturn1view0 
> 4) Run `codex --profile your_profile --sandbox workspace-write --ask-for-approval on-request "task…"`. citeturn1view0
> 
> If you want, I can draft an `AGENTS.md` tailored to Promethean (imports, repo layout, Hy/Sibilant prefs) and a `config.toml` with two ready‑to‑go profiles (one for Ollama Llama 3.1, one for a Qwen coder).
<!-- UID: 814b2fe0-ceec-4c80-bb70-531e95b25246 -->

---




>[!nexus_user] **User** - 08/21/2025 at 8:57 AM
> I noticed that the models don't seem to remember many details from previous turns like the official codex models do.
<!-- UID: 613fcc5e-8000-47f4-af19-2b7c0a4d6622 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 8:57 AM
> You're absolutely right to notice that the OSS-backed Codex via Ollama can seem less "remembering" of prior turn details compared to the official Codex models. Let's break down why—and how to address it.
> 
> ---
> 
> ### What's Going On: Context Window, Not “Memory”
> 
> #### 1. **Limited *Token* Context, Not Conversation Memory**
> Even though *gpt-oss* models (e.g., gpt-oss-120b or gpt-oss-20b) support very large context windows—up to **128K tokens** under Ollama (and reportedly up to **131,072 tokens** per local inference) citeturn0news21turn0news22—these are still token limits.
> 
> If your session (chat history, codebase, AGENTS.md, prior interactions) cumulatively exceeds that limit, older interactions simply fall out of view. Unlike cloud-based, proprietary Codex models (e.g. Codex-1), which are tuned for long-term thread coherence and can sustain memory over a long conversation, the OSS models are limited to what fits in the token window at any given moment.
> 
> #### 2. **Hardware & Performance Constraints**
> Practical resource constraints further limit this:
> - Larger context windows like 32K+ tokens may force inference onto CPU, slowing it dramatically; models like gpt-oss-20b may drop to **9 tokens/s**, compared to 82 tokens/s at 4K—demonstrating how expanding context can degrade performance citeturn0news22turn0news23.
> - Attempting to use the maximum 128K context window may cause environmental issues (e.g., running out of memory, misconfiguration errors like `InternalAgentDied`) citeturn0news22.
> 
> #### 3. **Cloud Models Might Use More Efficient Context Management**
> Codex-1 (official) was tested with up to **192K token** contexts on internal benchmarks, suggesting more aggressive and optimized context retention strategies cite.
> 
> ---
> 
> ### Community Voices That Reinforce This
> 
> From user experiences on platforms like Hacker News and Reddit:
> 
> > “My understanding is the models that run on the cloud have much greater context windows than what we can have running locally.” 
> > — A comment on local vs OpenAI inference context limits cite
> 
> ---
> 
> ### What You Can Do: Tips & Workarounds
> 
> If you're seeing that details from earlier turns fade quickly or aren’t referenced:
> 
> 1. **Manually re-inject key info** into your prompt chain (e.g., shortcuts, variable names, goals).
> 2. **Shorten turn history** to essentials—excess verbiage can consume tokens unnecessarily.
> 3. **Leverage `AGENTS.md` and prompt scaffolds** so Codex is repeatedly reminded of relevant conventions and intent—even if earlier chat "memory" has expired.
> 4. **Work in batch tasks**: If a conversation drifts too long, re-run the model with a summary of critical details ahead of new prompts.
> 5. **Optimize context usage**: Keep token usage low by trimming logs or large code dumps that aren't needed every turn.
> 
> ---
> 
> ### Summary Table
> 
> | Factor | OSS Codex (via Ollama) | Official Codex (Cloud) |
> |---------------------------|----------------------------------------------------|-----------------------------------------------------|
> | Max Context Window | Up to ~128K tokens—but slower and resource-heavy | Up to ~192K tokens, more optimized |
> | Performance | Drops significantly with context size | More consistent performance across long contexts |
> | Memory Retention | Loses earlier turns once they exceed token window | Better at holding frame across long conversations |
> | Practical Constraints | GPU/CPU limits, memory errors affect context use | Cloud infrastructure smooths these limitations |
> 
> ---
> 
> Let me know if you’d like help restructuring your prompts or AGENTS.md to improve context retention, or suggestions for tooling workflows that better simulate "conversation memory" for OSS models!
<!-- UID: d598766f-c1a5-4555-a379-95dc7f47aab3 -->

---




>[!nexus_user] **User** - 08/21/2025 at 8:59 AM
> Ok... so maybe I could get better results if I wrote a layer in front of ollama that did context management for my repo? I keep a chromadb database of my repo and update it on file change.
<!-- UID: 6ec1b6e9-5931-4469-9c87-be1f174aea33 -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 9:00 AM
> Yep — that’s exactly what teams do in practice: put a smart “context router” in front of Ollama that (a) retrieves the *right* code snippets from your repo, (b) composes them into the prompt within the token budget, and (c) keeps this up to date as files change. Think “mini‑Cody” for your repo. Below is a concrete blueprint you can implement on top of your existing ChromaDB.
> 
> # What the winning setups have in common
> - **OpenAI‑compatible gateway to Ollama** so your layer can call chat+tools cleanly. Ollama ships an OpenAI‑compatible API and tool/function‑calling support (e.g., Llama 3.1), which is the foundation for retrieval + tool use. cite 
> - **Code‑aware retrieval** (embeddings + keyword/search) rather than pure semantic search. This is how Sourcegraph Cody does it at scale: combine local cues with remote search/embeddings to pull only the most relevant bits. cite 
> - **Chunking tuned for code** plus re‑ranking. LlamaIndex/LangChain docs and write‑ups show that chunk size, overlap, and semantic chunkers matter a lot for code. cite
> 
> # Architecture (drop‑in over your ChromaDB)
> ```mermaid
> flowchart LR
>  subgraph Dev["Dev request (CLI/IDE/Codex)"]
>  Q["Task / question"]
>  end
>  Q --> CtxMgr["Context Manager (your layer)"]
> 
>  subgraph Store["Repo Knowledge Store"]
>  Chroma[(ChromaDB)]
>  FS["File watcher"]
>  end
> 
>  FS -- on change --> Embed["embed + upsert"]
>  Embed --> Chroma
> 
>  CtxMgr -->|vector + keyword| Chroma
>  CtxMgr -->|rank/dedup/budget| Pack["Prompt packer"]
>  Pack --> LLM["Ollama (OpenAI‑compat, tools)"]
>  LLM --> CtxMgr
>  CtxMgr --> Dev
> ```
> 
> ## Components to build
> 
> 1) **File watcher → embedder → ChromaDB** 
> - On save/rename/delete, re‑chunk the file and `upsert` embeddings into a collection. Chroma has first‑party docs for collections/embedding functions. cite 
> - Use **code‑aware chunking**: e.g., function/class‑level boundaries, fallback to semantic chunker for long files. LlamaIndex’s semantic chunking example is a good starting point. cite
> 
> 2) **Hybrid retrieval (recall first, then precision)** 
> - **Stage A (recall)**: vector similarity from Chroma **and** fast keyword/regex (ripgrep) for symbol/filename hits. Cody’s research and paper recommend prioritizing recall up front. cite 
> - **Stage B (precision)**: re‑rank by: 
>  - query–chunk similarity 
>  - file proximity (same package/module) 
>  - recency (changed recently) 
>  - test coverage (if you track it) 
>  These mirrors “anatomy of a coding assistant” guidance. cite
> 
> 3) **Prompt packer (budgeting + scaffolding)** 
> - Build a **fixed frame**: system prompt (repo rules), brief conversation **summary** (not full history), then top‑K chunks with source tags. 
> - Keep a **token budget** (e.g., 6–8K for context) and trim by chunk length and redundancy, as recommended by context‑engine write‑ups. cite 
> - Include **citations** (file:line) so the model can point back; this also reduces hallucinations (a common Cody/Copilot takeaway). cite
> 
> 4) **Tooling hooks (optional but powerful)** 
> Expose tools to the model via Ollama’s tool calling: 
> - `search_code(symbol|pattern)` → ripgrep/ctags 
> - `run_tests(target)` → your test command 
> - `read_file(path, span)` → authoritative source slice 
> Ollama supports tool/function calling through the OpenAI‑compat layer (and `llama.cpp` implements tools broadly), so your layer can broker safe, approved actions. cite
> 
> 5) **Memory: rolling summaries, not raw chat history** 
> - After each turn, summarize “decision‑relevant” facts (APIs chosen, constraints, accepted diffs) into a **session memory** block you prepend next time. This mirrors what production assistants do to fight token limits. cite
> 
> # Practical knobs that move the needle
> 
> - **Chunking**: start at 120–200 lines for code, 800–1200 tokens for prose docs; add ~10–20% overlap. Adjust based on retrieval quality; resources below discuss trade‑offs. cite 
> - **Hybrid search**: union of top‑N vector results and top‑M keyword hits; then re‑rank and dedup. (This “recall→precision” pipeline is standard in Cody’s literature.) cite 
> - **Model choice**: prefer tool‑capable builds (Llama 3.1/3.2 instruct/coder, Qwen coder, gpt‑oss). OpenAI’s cookbook shows running gpt‑oss on Ollama and using tools. cite 
> - **Guardrails**: **exactly one source of truth** for file contents (your `read_file` tool), and never paste extremely long files—fetch spans on demand.
> 
> # Minimal example (TypeScript-ish pseudocode)
> 
> ```ts
> // retrieval.ts
> export async function retrieveContext(q: string, k = 12) {
>  const vecHits = await chroma.query({ queryTexts: [q], nResults: k }); // vector
>  const kwHits = await ripgrepSearch(q, { max: k }); // keyword
>  const merged = rerankAndDedup([...vecHits, ...kwHits]); // precision stage
>  return budgeted(merged, { maxTokens: 6000, by: ["novelty","proximity"] }); // packer
> }
> 
> // prompt.ts
> export function buildPrompt({rules, mem, chunks, ask}: Frame) {
>  return {
>  system: [
>  "You are the repo assistant.",
>  rules, // AGENTS.md distilled
>  "Answer with file:line . Prefer existing patterns."
>  ].join("\n"),
>  messages: [
>  { role: "user", content: summarize(mem) + "\n\n" + ask },
>  { role: "system", content: formatChunks(chunks) }
>  ],
>  tools: [ search_code, read_file, run_tests ] // OpenAI tools schema
>  };
> }
> ```
> 
> # How this fixes your “it forgets” feeling
> - You **re‑inject** only the *most relevant* parts of the repo + a **running summary** every turn, instead of relying on the raw chat log to still be in window. This is exactly how industrial code assistants keep coherence over long sessions. cite
> 
> # Useful references while you implement
> - **Ollama OpenAI‑compat + tools**: official posts. cite 
> - **Cody architecture & context engine**: how context is found and packed. cite 
> - **RAG for codebases**: pipeline & scaling considerations. cite 
> - **Chunking strategies**: LlamaIndex/LangChain guides & semantic chunking. cite 
> - **ChromaDB how‑tos**: collections, embedding functions, upserts. cite 
> - **gpt‑oss on Ollama with tools** (nice for quick local experiments). cite
> 
> ---
> 
> If you want, I can sketch a tiny Node service that: watches the repo, (re)chunks changed files, updates Chroma, retrieves hybrid context, then calls Codex via Ollama’s OpenAI endpoint with tool schemas.
<!-- UID: a6a7b003-a131-45c8-98fd-5b92466ee3dd -->

---


