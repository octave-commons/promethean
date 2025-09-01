---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "BEG-micro-v2 vs Nomic-embed-text"
conversation_id: 6889924b-c548-8325-9ff9-03a721d91ce5
create_time: 07/29/2025 at 10:33 PM
update_time: 07/29/2025 at 10:42 PM
---

# Title: BEG-micro-v2 vs Nomic-embed-text

Created: 07/29/2025 at 10:33 PM
Last Updated: 07/29/2025 at 10:42 PM
Chat URL: https://chat.openai.com/c/6889924b-c548-8325-9ff9-03a721d91ce5


>[!nexus_user] **User** - 07/29/2025 at 10:33 PM
> How does BEG-micro-v2 stand upto nomic-embed-text?
<!-- UID: 0ad0ca95-9d2e-40ff-81a1-838cdfdaff1c -->




>[!nexus_agent] **Assistant** - 07/29/2025 at 10:33 PM
> Here’s what I found: as of mid‑2025, *bge‑micro‑v2* and *Nomic Embed Text v2* (often referred to as BEG‑micro‑v2 in shorthand) are different beasts. They diverge in architecture, scale, and purpose, and any comparison hinges on your use case.
> 
> ---
> 
> ## What is **bge‑micro‑v2**?
> 
> - A distilled version of *BAAI’s bge-small-en‑v1.5*, compressed into a 384‑dimension embedding. It's intended as a lightweight model for sentence‑level tasks and fast inference cite.
> - No public benchmark numbers on MTEB or multilingual tasks for this specific variant—but full‑scale BGE models (like bge‑base‑en) score ~84–85% top‑5 on BEIR style benchmarks (similar to the blog’s results) cite.
> - This is a compact model designed for speed and low memory use.
> 
> ---
> 
> ## What is **Nomic Embed Text v2**?
> 
> - A mixture‑of‑experts (MoE) model: 475M total parameters, ≈ 305M active at inference. Supports >100 languages with efficient routing citeturn0academia21.
> - On multilingual benchmarks like *MIRACL*, it scores ~65.8 average; on BEIR it scores ~52.9 (scaled per that benchmark’s metrics) cite.
> - An evolution of the v1.5 model, v2 improves across multilingual and retrieval tasks through MoE architecture.
> - Nomic (v1 and v1.5) consistently outperformed OpenAI’s Ada‑002 and other open models on MTEB and long‑context LoCo benchmarks at ~137M parameter size, but v2 is scaled up and focused on multilingual coverage cite.
> 
> ---
> 
> ## Comparison Summary
> 
> | Model | Size / Architecture | Embedding Dim | Benchmark Strength | Use Case |
> |-------------------|---------------------------|---------------|------------------------------|------------------------------------------------|
> | **bge‑micro‑v2** | Tiny distilled (~110 M → smaller) | 384 | Unknown (smaller than BGE base) | Fast sentence-level tasks, low compute usage |
> | **Nomic‑Embed‑v2** | 475 M with 305 M active MoE | 768 | High on MIRACL & BEIR; strong multilingual | Multilingual retrieval, RAG pipelines, long text |
> 
> ---
> 
> ## So how do they stack up?
> 
> - **Accuracy and benchmarks**: Nomic Embed v2 clearly outpaces bge‑micro‑v2, especially on multilingual retrieval and broader text tasks. v2 was trained with MoE and benchmarked on MIRACL and BEIR with strong performance citeturn0academia21. There’s no comparable public result for bge‑micro‑v2, but smaller distilled versions usually underperform base-sized models.
> - **Speed and footprint**: bge‑micro‑v2 is lightweight, ideal for CPU or edge use. Nomic v2, being larger, demands GPU for inference—even though MoE optimizes for latency by activating fewer experts.
> - **Context and languages**: Nomic v2 supports 100+ languages; bge‑micro is English-centric and suited for short context.
> 
> ---
> 
> ## Practical Advice for choosing
> 
> Think like a systems designer:
> 
> 1. **Define the task**: Are you embedding short English sentences (similarity, clustering, lightweight search)? Or are you embedding varied, multilingual, or longer text?
> 2. If **speed and low resource use** are key, go with **bge‑micro‑v2**.
> 3. If **accuracy, multilingual support, or long‑text embedding** matters, choose **Nomic Embed v2**.
> 4. Benchmark on your own data. Public scores give direction—but they don't replace testing with your query/document distributions.
> 
> ---
> 
> ## In summary
> 
> - bge‑micro‑v2 is a fast, resource‑frugal distilled model for English sentence embeddings.
> - Nomic Embed Text v2 is a larger, MoE‑based model built for multilingual, retrieval‑heavy, and embedding pipelines with stronger benchmark performance.
> - Choose based on accuracy vs latency tradeoffs—measure on your data rather than relying on leaderboard hype.
> 
> If you like, I can walk you through how to self‑benchmark both on MTEB, BEIR, or your own dataset. ফলে you can make a solid decision rather than trusting claims whole hog.
<!-- UID: 6a9742c4-863c-404f-81ae-e0192bd79184 -->

---




>[!nexus_agent] **Assistant** - 07/29/2025 at 10:36 PM
> Yeah, **Smart Connections** is one of the few LLM plugins for Obsidian that actually tries to **leverage your whole vault contextually**, not just answer prompts like a chatbot taped to a note.
> 
> ---
> 
> ### 🔍 Why it's better than most
> 
> Most other Obsidian plugins:
> 
> - Just pipe a note or prompt to ChatGPT / LocalGPT and call it a day
> - Rarely chunk and embed the whole vault
> - Don’t build a semantic graph or index across everything
> - Struggle with large notes or complex formats (code blocks, math, diagrams)
> 
> **Smart Connections**, on the other hand:
> 
> - **Embeds your vault** into a local vector database (Chromadb or Weaviate, depending on config)
> - **Chunking strategy** can be customized (paragraphs, headings, tokens)
> - Can **return ** to the actual files and sections of your vault
> - Works with **offline local models** (if set up right) or OpenAI-style APIs
> - Has some semantic understanding of Obsidian structure like tags, , and note hierarchy
> 
> It’s one of the few plugins that feels like it’s building a **“thinking layer”** on top of your second brain.
> 
> ---
> 
> ### ⚠️ Pain points with large/complex documents
> 
> That said, it **doesn’t always handle large markdown notes gracefully**, especially if:
> 
> - You’ve got longform documents with lots of nested headings
> - Notes are filled with `$$` math, Mermaid diagrams, or fenced code blocks
> - The embedding model it uses (default is likely `text-embedding-ada-002` or similar) chokes on those formats
> - The chunking algorithm doesn’t respect code blocks or math fences
> 
> You might get:
> - **Bad splits** mid-latex or mid-code block
> - **Useless vectors** that index only comments or partial expressions
> - Context windows exceeded if you try to summarize/search too much at once
> 
> ---
> 
> ### 💡 Tips for better results
> 
> Here’s what I’d suggest if you want to make it work with your kind of vault:
> 
> #### 1. **Pre-process for chunking**
>  - Use a custom chunking plugin or preprocessing script to:
>  - Keep ` ``` ` and `$$ ... $$` blocks whole
>  - Keep headings as delimiters
>  - Set a max token limit per chunk (e.g. 300–600 tokens is often ideal)
>  - Avoid default “paragraph-based” chunkers if your docs are structured with large fenced blocks
> 
> #### 2. **Consider switching embedding model**
>  - If it’s pluggable, try `nomic-embed-text-v2`, `bge-small-en`, or `e5-base-v2` for better domain-specific understanding (especially math/code-heavy)
>  - Use **384 or 768-dim models** for faster local inference if latency matters
> 
> #### 3. **Manually tag dense notes**
>  - Add `#dense`, `#needs-chunking`, or similar
>  - Have a background job that re-embeds only those files with custom logic
> 
> #### 4. **Post-processing filters**
>  - Build filters to exclude or downweight sections with very high code/math density unless explicitly searched for
>  - Or invert it—make a code/math-specific index only
> 
> #### 5. **Use embeddings for *routing*** not just search
>  - Once you can do decent chunking, use Smart Connections to:
>  - Suggest related notes
>  - Route LLM prompts to relevant files only
>  - Enrich your note templates (e.g., generate back, ideas, summaries, etc.)
> 
> ---
> 
> ### 🛠️ Optional enhancement: Hybrid semantic search
> 
> Use Smart Connections as a frontend, but swap its backend for your own embedding system:
> 
> - Keep Smart Connections for UI
> - Run your own script to:
>  - Chunk properly
>  - Embed with a better model
>  - Save to local vector DB
> - Override the search endpoints (or hot swap with something like [`llamaindex`](https://github.com/jerryjliu/llama_index))
> 
> ---
> 
> If you're game, I can help you write a chunker script that respects your formatting (math/code/mermaid), plugs into the Smart Connections indexer, or builds a better one yourself.
> 
> You’ve got a big enough vault and serious enough content that it’s worth going one layer deeper than default settings.
> 
> Want help building that chunker or search layer?
<!-- UID: d4a6c850-e674-4070-9ba7-3e1bf78c8442 -->

---




>[!nexus_user] **User** - 07/29/2025 at 10:36 PM
> I was looking at the smart connections plugin from obsidian. I've tired so many different LLm integrations for obsidian... This is one of the btter ones as far as like... actual usefulness.
> 
> It embeds my whole vault for search.
> 
> Some of my documents can be kinda large, it's all markdown. There is a lot of code/latex/mermaid stuff in there too.
<!-- UID: a11d96b8-6143-46b5-9b6e-b4e3d98fc760 -->




>[!nexus_user] **User** - 07/29/2025 at 10:38 PM
> I can configure it to use any of these with no outside provider:
> BGE-micro-v2
> BGE-small
> BGE-small-4K
> GTE-tiny
> Ivysaur
> Jina-v2-base-zh-8K
> Jina-v2-small-en
> Nomic-embed-text
> Nomic-embed-text-v1.5
> Snowflake Arctic Embed Medium
> Snowflake Arctic Embed Small
> Snowflake Arctic Embed XS
> 
> And I can connect it to ollama too. So I have options for it's embedding models.
> 
> It'll all run on a GPU. And I have a 4070ti.
<!-- UID: 18aeff52-a88b-4a12-8834-44cbfe731c96 -->




>[!nexus_agent] **Assistant** - 07/29/2025 at 10:38 PM
> You’re in a *very good position* for high-quality, **offline semantic search** across large, structured markdown—especially with a 4070 Ti. Let’s break this down and pick a **real embedding strategy** that’ll respect your vault's shape (code, LaTeX, Mermaid, etc.) without wasting GPU cycles or flattening your knowledge structure.
> 
> ---
> 
> ## 🧠 Your Goal
> 
> **Index and search a markdown vault that includes:**
> 
> - Large documents
> - Code blocks
> - $$ LaTeX $$
> - Mermaid diagrams
> - Dense structure (headings, tags, )
> 
> You want the embeddings to *retain semantic usefulness*, not break on formatting, and power search + retrieval in **Smart Connections** or a custom pipeline.
> 
> ---
> 
> ## 🧪 Embedding Models You Can Use (and How They Stack Up)
> 
> ### 🔹 Top Picks (best balance of quality and speed):
> 
> | Model | Dim | Strengths |
> |-----------------------------------|-----|---------------------------------------------------------------------------|
> | **Nomic-embed-text-v1.5** | 768 | Extremely strong in *natural language, structured text*, supports long docs |
> | **BGE-small-4K** | 512 | Handles longer inputs (4096 tokens); solid general-purpose English |
> | **Snowflake Arctic Embed Medium** | 1024| Best if you're embedding a *wide variety* of content, including code |
> 
> ---
> 
> ### 🟢 Decent/Lightweight Options:
> 
> | Model | Dim | Use When... |
> |-------------------|-----|-----------------------------------------------|
> | **GTE-tiny** | 384 | You want speed and low memory use |
> | **BGE-micro-v2** | 384 | For small chunks or fast approximate search |
> | **Ivysaur** | 768 | Multilingual and resilient, lesser known |
> | **Jina-v2-small-en**| 768 | Decent modern English encoder, small footprint|
> 
> ---
> 
> ### 🔴 Would skip for now (or very niche use):
> 
> | Model | Why to avoid |
> |------------------------|---------------------------------------------------------|
> | **Jina-v2-base-zh-8K** | Mainly for Chinese text |
> | **Nomic-embed-text** | Older version, v1.5 is better in every way |
> | **Snowflake XS / Small** | Subpar vs Medium for anything structured or code-heavy|
> 
> ---
> 
> ## ✅ **Recommended Embedding Configurations**
> 
> ### **🔷 Best Overall: Nomic-Embed-Text v1.5**
> - Trained on structured text, handles longform well
> - Good across **natural language + light code + math**
> - Handles 8K token contexts
> - Fast on GPU
> - Tested well in [[Smart Connections]] already
> 
> ### **🟡 Backup: BGE-small-4K**
> - Slightly faster
> - Lower dimensional (512) — more compact ChromaDB
> - Very good for *plain English markdown with headings*
> - Not as strong at complex structured text
> 
> ### **🟠 Bonus: Snowflake Arctic Embed Medium**
> - If your vault leans heavily on **code + math + diagrams**
> - Higher dim (1024), but more expressiveness
> - Worth benchmarking if you're doing dense research notes
> 
> ---
> 
> ## 🧩 Chunking Strategy (even more important than the model)
> 
> Use a chunker that:
> 
> - **Preserves blocks**:
>  - Don’t split inside ` ``` `, `$$ ... $$`, or ```mermaid```
> - **Favors heading-based structure**:
>  - Use headers as natural chunk delimiters
> - **Cleans up noise**:
>  - Remove excessive whitespace, frontmatter if unnecessary
> - **Max token count per chunk**: ~300–500 for dense vaults
> 
> I can help you write a **custom chunking script** (Node or Python) that preprocesses your markdown files before sending to Smart Connections’ embedding pipeline.
> 
> ---
> 
> ## 🚀 With Ollama in the mix
> 
> - You can run **Nomic v1.5** or **Snowflake** locally via Ollama (if you have models downloaded).
> - Combine Smart Connections' **embedding lookup** with a **local LLM completion step** from Ollama for:
>  - Semantic Q&A
>  - Note generation
>  - Relationship graph building
> 
> Let me know if you want:
> - A custom chunker that handles your vault’s structure
> - A benchmark harness to compare embeddings across a subset of your notes
> - Help wiring Ollama into the loop for follow-up reasoning/search refinement
> 
> ---
> 
> ### TL;DR
> 
> Run **Nomic-Embed-Text-v1.5** or **BGE-small-4K**, chunk smart, and you'll have one of the best semantic note search systems on a local vault *anyone’s running today*.
> 
> Want me to mock up a full vault indexing + retrieval pipeline using these components?
<!-- UID: 81718f26-0345-40ba-b00e-1658f5756ce6 -->

---




>[!nexus_agent] **Assistant** - 07/29/2025 at 10:41 PM
> Ahh—so you’re **locked into Smart Connections’ chunker** (which is probably paragraph-based or naive heading-split), but *you still have control over the embedding model*, including via Ollama. That means the **burden of understanding structure** shifts to the **model itself**.
> 
> So you're asking: *What’s the absolute best embedding model I could run locally through Ollama to handle complex, structured, code-heavy, math-annotated markdown documents?*
> 
> ---
> 
> ## 🧠 Criteria for State-of-the-Art Structured Embedding
> 
> To rank highly, the model must:
> 
> - Handle **structured documents**: headings, sections, code blocks, equations
> - Embed **code** + **text** + **math** without ignoring context
> - Work **without retraining** (zero-shot or open-domain)
> - Be **LLM-grade or better** at contextual encoding
> - Run locally via **Ollama** (ideally GPU accelerated)
> 
> ---
> 
> ## 🏆 Top Embedding Models *not* in your current list (but usable via Ollama or with some trickery):
> 
> ### 1. **`instructor-xl` / `instructor-large`**
> - 📌 Purpose-built to embed *task-aware* representations (e.g., "represent this for retrieval")
> - 🔥 Excellent at combining *natural language + code + structure*
> - 🧠 Embeds with instruction context like: 
>  `"Represent the document for semantic search:" + [text]`
> - ✅ Available via Hugging Face (`hkunlp/instructor-xl`) — can be wrapped for Ollama
> - ⚠️ Very large (~1.2B), but GPU-feasible on 4070 Ti
> 
> ---
> 
> ### 2. **`e5-large-v2` / `e5-mistral-7b`**
> - 🧪 Trained with contrastive objectives on code, scientific, and academic domains
> - 🧠 Uses prefix instructions similar to Instructor: 
>  `"query: ..."` / `"passage: ..."`
> - 📈 Consistently top-5 in MTEB benchmarks (multitask benchmark of text embeddings)
> - ✅ HuggingFace model (`intfloat/e5-large-v2`) — can be converted for Ollama
> - 🔍 Strong at *semantic code+text matching*, document similarity, and search
> 
> ---
> 
> ### 3. **`bge-large-en-v1.5`**
> - 🚀 From BAAI, massive uplift over `bge-small`
> - 🧠 Well-tuned for semantic search, including code snippets and structured formats
> - ✅ Available for Ollama via conversion
> - 🪶 Heavy (LLaMA-style) but feasible for your GPU
> 
> ---
> 
> ### 4. **`text-embedding-3-large` (OpenAI)** — *not local, but gold standard*
> - 📊 State-of-the-art for code/math hybrid documents
> - 🧠 3072-dim embeddings, best for long-context structured documents
> - ❌ You *don’t* want this unless you're OK with paying OpenAI
> - ✅ But if you're ever benchmarking your local Ollama setup, use this as a **baseline comparison**
> 
> ---
> 
> ### 5. **`codellama-embed` (experimental, from CodeLlama)**
> - 🧑‍💻 Tailored for **code structure understanding**
> - ❌ Not as strong on prose/markdown
> - ✅ But *very useful* in projects where code is dominant and you need **type, docstring, code snippet **
> - 🛠️ Currently needs custom conversion into Ollama format (unless they ship it officially soon)
> 
> ---
> 
> ## 🧠 Suggested Pipeline (Best Quality Setup You Could Run)
> 
> If you want best-in-class, **do this**:
> 
> ```
> Vault → [dumb chunking] → E5-Large-v2 or Instructor-XL → ChromaDB → Smart Connections
> ```
> 
> This way the **model compensates** for poor chunking by encoding based on intention and structural cues.
> 
> ---
> 
> ## 📦 Want to use these in Ollama?
> 
> None of these come *pre-baked* into Ollama right now, but you can:
> 
> 1. Convert HF models into GGUF → run via llama.cpp/Ollama
> 2. Use [`llm`](https://llm.datasette.io/) or [`text-embeddings-as-a-service`](https://github.com/hwchase17/text-embeddings) to wrap them
> 3. Or run a **separate embedding server** outside Smart Connections, and feed results back via note metadata
> 
> If you're willing to go a bit custom, I can help you:
> 
> - Convert `e5-large-v2` or `instructor-xl` into Ollama-compatible format
> - Build a sidecar script that preprocesses your vault better than Smart Connections
> - Or even replace Smart Connections with a smarter embedding frontend using LlamaIndex or LangChain (but still compatible with Obsidian notes)
> 
> ---
> 
> ### TL;DR — Best Models to Try via Ollama
> 
> | Model | Good For | GPU Feasible | Zero-shot |
> |------------------|-----------------------------------------------|--------------|-----------|
> | **Instructor-XL**| Structured, longform, task-aware embeddings | ✅ | ✅ |
> | **E5-Large-v2** | Code + text + structure | ✅ | ✅ |
> | **BGE-Large-en** | General English, heading-heavy content | ✅ | ✅ |
> | **CodeLlama-Embed**| Pure code understanding, not text | ⚠️ | ✅ |
> 
> ---
> 
> Want help prepping a `.modelfile` for Ollama from any of these? Or wiring them into a smart chunker?
<!-- UID: d9de6e7d-5ebb-4b58-bcee-02a9cd6f6852 -->

---




>[!nexus_user] **User** - 07/29/2025 at 10:41 PM
> Sadly I don't have control over its chunker.
> 
> So, let's say I wanted to do like state of the art, best possible embedding model through Ollama for a structured, code/math/diagram heavy codebase
> 
> What are some good options I've not already listed?
<!-- UID: 29360e60-60b6-4533-a66c-96276b4d5a96 -->


