---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Gemma3 thinking capabilities"
conversation_id: 688d5df4-4698-8325-b903-3b2f80c95f0d
create_time: 08/01/2025 at 7:38 PM
update_time: 08/01/2025 at 7:50 PM
---

# Title: Gemma3 thinking capabilities

Created: 08/01/2025 at 7:38 PM
Last Updated: 08/01/2025 at 7:50 PM
Chat URL: https://chat.openai.com/c/688d5df4-4698-8325-b903-3b2f80c95f0d


>[!nexus_agent] **Assistant** - 08/01/2025 at 7:38 PM
> It depends on what you mean by a *"Thinking"* model.
> 
> ---
> 
> ### If by "Thinking" you mean:
> **Engaging in internal reasoning, reflection, or step-by-step planning**, like how humans "think" through a problem…
> 
> Then **Gemma 3** (which presumably refers to **Gemma 2 2B/7B/27B models** or a hypothetical **Gemma 3.x** if it's future-branded or experimental) **can simulate thinking**, but **does not think in a human sense**.
> 
> It’s a **language model**, meaning:
> 
> - It **predicts the next token** in a sequence.
> - Any appearance of "reasoning" or "planning" is an emergent behavior learned from data — not due to actual cognition.
> - However, **prompted correctly**, it can simulate internal monologue, perform multi-step reasoning, and "reflect" on prior steps — which **feels like thinking**.
> 
> ---
> 
> ### Some traits of "Thinking" LLMs (in the practical/engineering sense):
> 
> | Trait | Is Gemma Capable? |
> |-------|--------------------|
> | **Chain of Thought (CoT)** | ✅ Yes, with prompting |
> | **Tree of Thought** | 🟡 Possibly, with scaffolding |
> | **Tool Use** | 🟡 Only with external scaffolding |
> | **Agentic Memory** | ❌ Not by default |
> | **Meta-cognition** | ❌ Simulated, not real |
> | **Planning across turns** | 🟡 Only with external context/memory |
> 
> ---
> 
> ### TL;DR
> 
> > **Gemma 3 is a high-quality LLM that can simulate “thinking” through token prediction. It does not think independently, but it can appear to “think” if scaffolded with the right prompts or agents.**
> 
> If you're wondering whether it's suitable for cognitive architectures like **Promethean**, yes — but you'd want to embed it in an environment with memory, field dynamics, or agents to achieve true emergent *thought-like* behavior.
> 
> Want to simulate inner thought loops or field-particle dynamics with it? I can help scaffold that.
<!-- UID: 34f3aacd-45ac-4eab-887e-8689ea8d434a -->

---




>[!nexus_user] **User** - 08/01/2025 at 7:38 PM
> Is gemma3 a "Thinking" model?
<!-- UID: a169aa32-baa7-43ad-8551-58cc952a4eb6 -->




>[!nexus_user] **User** - 08/01/2025 at 7:38 PM
> Yea, I mean can gemma3 from ollama use the "thinking" flag in the API?
<!-- UID: 7ba6e94b-5200-450a-9b79-65a5107c4b7b -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 7:39 PM
> At this time (August 1 2025) **Gemma 3 is **_not_** considered a “thinking” model by Ollama**—which means the `{"think": true}` flag in Ollama’s HTTP `/api/chat` or `/api/generate` endpoints is ignored (or acts as a no-op) when used with `model: "gemma3"` (or any of its variants such as `gemma3:4b`, `:12b`, `:27b`) citeturn1view0.
> 
> ---
> 
> ### ✅ Quick answer:
> - ➤ Using `think: true` with **Gemma 3** yields **no separated “thinking” output**—only regular content.
> - ➤ Gemma 3 cannot generate structured reasoning bubbles via the flag, unlike models such as **DeepSeek R1** or **Qwen 3**, which are explicitly identified by Ollama as supporting thinking mode citeturn1view0.
> 
> ---
> 
> ### 🛠 Why doesn’t it work?
> 
> Ollama infers whether a model supports reasoning by checking **built‑in prompt templates** that define thinking/prefix tags. Models like DeepSeek R1/Qwen 3 have this support baked in; **Gemma 3’s template doesn’t include those tokens**, so even if `think: true` is set, no thinking block is extracted or emitted.
> 
> There’s no official error message—just no `thinking` field in the JSON response if Gemma 3 is used.
> 
> ---
> 
> ### 🧠 Workarounds and tips
> 
> 1. **Prompt‑based chain‑of‑thought** 
>  You can manually instruct Gemma 3 to reason:
>  ```json
>  { "content": "Please think step-by‑step before answering:\n<think> ...reasoning...</think>\n<final> ...answer...</final>" }
>  ```
>  This isn't the native “thinking” flag behavior, but can approximate it — though less reliable.
> 
> 2. **Look into community fine‑tunes** 
>  Several GitHub or Hugging Face models exist (e.g., `gemma3-tools`, `gemma3-it-qat-tools`) that add tool‑calling or structured prompt templates—some may support thinking-style outputs. These are separate from the official Gemma 3 and may offer enhanced behavior.
> 
> 3. **Watch for future support** 
>  Ollama’s roadmap hints at expanding “thinking/reasoning” support to more models, and the feature was merged into the CLI/API in May 2025 citeturn4view0. But as of version 0.10.x, **Gemma 3 is not listed** among reasoning‑enabled models.
> 
> ---
> 
> ### 🧾 Summary table
> 
> | Model | `{"think": true}` Support? | Generates `thinking` field in API |
> |--------------|-----------------------------|-------------------------------------|
> | **gemma3** | ❌ No | ❌ No |
> | **deepseek-r1** | ✅ Yes | ✅ Yes |
> | **qwen3** | ✅ Yes | ✅ Yes | 
> 
> ---
> 
> **TL;DR**: You can set `think: true` when calling Gemma 3, but it has **no effect**. If you're after reasoning-style output in Gemma 3, you’ll need to rely on prompt design or community fine‑tunes—until Ollama officially adds Gemma to its supported thinking‑model list.
> 
> Let me know if you’d like help crafting a custom prompt or exploring fine-tuned versions with built-in reasoning.
<!-- UID: ee68f36e-90b3-4a92-a899-8726aa7d5bfb -->

---




>[!nexus_user] **User** - 08/01/2025 at 7:39 PM
> So on their hub website, I want to look for "reasoning" models if I want to try that feature out?
<!-- UID: 4edb8626-9684-4d60-93bc-355c79cd0b0b -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 7:40 PM
> Absolutely — if you want to try Ollama’s “thinking” or chain‑of‑thought feature, browse their **Thinking / Reasoning models** on the hub:
> 
> ---
> 
> ### ✅ Where to find them
> 
> - Go to the **Ollama Model Library** and click the **Thinking** tab (or add `?c=thinking` to the URL). That filters only those models labeled with the tag `tools thinking` citeturn5view0.
> 
> - Models like **DeepSeek‑R1**, **Qwen 3**, and **Magistral (24B)** are shown in that filtered view and marked as reasoning‑enabled ✨ citeturn5view0.
> 
> - **Gemma 3** and Gemma 3n appear under the general library but **lack the `thinking` tag**, meaning the `"think": true` flag won’t have any effect with them citeturn2view0.
> 
> ---
> 
> ### 🔧 How to use
> 
> #### CLI
> ```bash
> ollama pull deepseek-r1:8b
> ollama run --think deepseek-r1:8b "Solve step by step: ..."
> ```
> Only true reasoning models will output a separate *<think>…</think>* section followed by *<answer>…</answer>*.
> 
> #### HTTP / REST API
> ```json
> POST /generate
> {
>  "model": "qwen3:14b",
>  "messages": [ { "role": "user", "content": "..." } ],
>  "think": true
> }
> ```
> Supported models may also include `reasoning_content` in the response, depending on your library version or host wrapper.
> 
> ---
> 
> ### 📋 Quick Comparison
> 
> | Task Type | Suggested Model | Why it works |
> |---------------------------|-------------------------|----------------------------|
> | Math / Logic / Reasoning | **deepseek-r1:8b** | Distilled for structured thinking |
> | High‑accuracy planning / chain‑of‑thought | **qwen3:14b or 32b** | Reasoning + MoE for longer context & diverse reasoning styles |
> | Large‑context steps in smaller footprint | **magistral 24B** | Efficient reasoning in a compact model |
> 
> ---
> 
> ### TL;DR
> - On Ollama Hub, only models in the **Thinking** filter (tagged “thinking”) support structured reasoning with the `"think"` flag.
> - **Gemma 3 does *not* support** it — it behaves as if `"think": true` were ignored.
> - To use the feature, pick a reasoning‑labeled model like **DeepSeek‑R1**, **Qwen 3**, or **Magistral**, and invoke with `--think` or `"think": true`.
> 
> Need help picking one based on your CPU/GPU specs or target domain? Happy to help!
<!-- UID: 839af7d8-a961-411b-bbe0-7c93e327d1fa -->

---




>[!nexus_user] **User** - 08/01/2025 at 7:41 PM
> Hmmm... there don't seem to be any "thinking" models that are also "image" models. I might need to chain a few different ones together...
<!-- UID: 33dc1ab0-38ff-48de-8662-c2b726c69dc9 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 7:41 PM
> You're absolutely right — on the **Ollama Hub**, there currently isn't any model that combines both the **“thinking”** tag (used for prompt‑controlled chain‑of‑thought reasoning) **and** the **“vision”** input capability in a single model out of the box.
> 
> ---
> 
> ### 🧠 What’s available right now
> 
> #### 1. **Text‑only reasoning (“thinking”) models:**
> - **DeepSeek‑R1** (MIT‑licensed, up to 671B parameters) – explicitly has `tools` + `thinking` tags, but input is text only. cite 
> - **Qwen3** series (dense & MoE variants) – supports “thinking” via control messages – input is text-only. cite 
> - **Magistral** by Mistral AI – small open‑licensed reasoning model with “tools” + “thinking” but **no vision support**. cite
> 
> #### 2. **Vision‑capable models (no “thinking” flag):**
> These accept image input but run as zero‑shot or instruction models—they don’t internally support the `thinking` control message.
> - **Qwen 2.5‑VL** (3B/7B/32B/72B) – vision input only, no “thinking” tag. citeturn2academia20 
> - **Mistral Small 3.1‑Vision** – labeled `vision tools` but lacks explicit `thinking` control. cite 
> - **GEMMA 3** (1B/4B/12B/27B) – full vision + text, but only has `vision`; no “thinking” toggle. cite 
> - **LLaVA**, **Llama3.2‑Vision**, **bakLLava**, and others — same situation. cite
> 
> ---
> 
> ### ✅ Why that grouping is empty
> 
> Tagging is orthogonal: “thinking” is reserved for reasoning‑fine‑tuned text models (like Qwen3 or DeepSeek), while “vision” signals image input support. As a result:
> 
> | Model (on Ollama) | Vision input | Thinking (chain‑of‑thought) |
> |-------------------------|--------------|-----------------------------|
> | DeepSeek‑R1 | ❌ | ✅ |
> | Qwen3 | ❌ | ✅ |
> | Magistral | ❌ | ✅ |
> | Qwen 2.5‑VL | ✅ | ❌ |
> | Mistral Small 3.1‑Vision| ✅ | ❌ |
> | GEMMA 3 | ✅ | ❌ |
> 
> So you'll see **no row with both ✅** — exactly as you observed.
> 
> ---
> 
> ### 🧱 Strategy 1: Pipeline/chain models manually
> 
> The most robust workaround is to **chain two models** in your code or agent workflow:
> 
> 1. **Vision model** first (e.g. Qwen 2.5‑VL, GEMMA 3, Mistral Vision) to extract structured descriptions: e.g. “caption: …, detected objects: …, layout: …”. 
> 2. Feed that **description into a “thinking” model** (e.g. Qwen3:latest, deepseek‑r1, magistral) with the `thinking` flag enabled to perform reasoning, asking for chain‑of‑thought.
> 
> #### Example using the Ollama CLI:
> 
> ```bash
> # 1. image → vision model
> ollama chat qwen2.5-vl:7b --image example.png --prompt "Describe the image details."
> 
> # 2. text → reasoning model using thinking
> ollama chat qwen3:latest --control "thinking" \
>  --prompt "Given this description, analyze: [paste output] What logical conclusions follow, step-by-step?"
> ```
> 
> Or with Python via the Ollama Python SDK:
> 
> ```python
> vision = OllamaModel("qwen2.5-vl:7b")
> thinkr = OllamaModel("qwen3:latest")
> 
> desc = vision.predict(image="photo.jpg", prompt="Describe the image in bullet points.")
> analysis = thinkr.predict(control="thinking",
>  prompt=f"Here’s the image description:\n{desc}\n\nPlease analyze step‑by‑step what’s happening.")
> ```
> 
> This pipeline gives you both modalities and chain‑of‑thought reasoning without waiting for a bundled multimodal‑thinking model.
> 
> ---
> 
> ### ⚠️ Strategy 2: Use upcoming stand‑alone multimodal reasoning models (not yet in Ollama)
> 
> Research labs are working on reasoning‑enabled **multi-modal LLMs** such as:
> 
> - **Vision‑R1** (DeepSeek team): MLLM trained with chain‑of‑thought style reinforcement learning—demonstrated strong math/image reasoning. citeturn0academia35 
> - **Skywork R1V**: Qwen/Dream‑R1 based visual reasoning model, trained for visual CoT reasoning without needing an external agent. citeturn1academia23 
> 
> But these models are **not yet shipped in Ollama** — you’d need to clone and manually integrate them, which could be a multi‑step project.
> 
> ---
> 
> ### 🛠️ If you’re building agents or prompting strategy
> 
> - Design your agent logic so the **vision model feeds descriptions** to the **reasoning model**.
> - Use `--control "thinking"` or `{"role":"control","content":"thinking"}` to toggle chain-of-thought reasoning in models that support it. DeepSeek, Granite3 (text‑only), Qwen3, Magistral, each differ slightly in how they expose thinking. cite 
> - Stable interaction: keep images separate (vision model) and text reasoning separate (thinking model) until unified input sequencing arrives.
> 
> ---
> 
> ### 📅 What to watch next
> 
> - **Ollama model updates** – watch for updates to **quasi-vision + thinking flows**, or new models like **Vision‑R1** hitting the Hub.
> - **Community-built hybrids** – search for models tagged `vision tools thinking` or customized fine-tunes — though as of now no such model appears in the official library.
> 
> ---
> 
> ### TL;DR
> 
> - ✅ No **single** Ollama model currently has both `vision` **and** a `thinking` flag.
> - ✅ You can build **your own multimodal reasoning chain** by combining a vision model + a reasoning model yourself.
> - ⏳ Future Open‑Source models from DeepSeek and others may unlock full multimodal reasoning, but they are **not yet available in Ollama Hub**.
> 
> Want help wiring up that pipeline — designing prompts or agent flows? I’m happy to assist.
<!-- UID: 39e68fbe-5d9c-486c-b696-160f6c551bdb -->

---




>[!nexus_user] **User** - 08/01/2025 at 7:42 PM
> So what exactly is "chain of thought" reasoning?
<!-- UID: a87ee60e-ad60-41ca-82f1-e015d6b87886 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 7:43 PM
> **Chain‑of‑Thought (CoT)** is a *prompting technique*, not a model architecture. It guides a large language model to lay out the **intermediate reasoning steps**—the “thought trail”—**before** giving a final answer, mimicking how humans solve multistage problems.
> 
> ---
> 
> ### 🧠 What is CoT and how does it work?
> 
> Google’s PaLM team formally framed CoT in 2022 as a method where, instead of asking:
> 
> ```
> Q: If John has 23 apples, uses 20, then buys 6 more, how many does he have?
> A: 9
> ```
> 
> you prompt it to break the reasoning into steps:
> 
> ```
> Q: If John has 23 apples, uses 20, then buys 6 more, how many does he have?
> A: Let’s think step by step.
> 
>  1. 23 – 20 = 3 apples left.
>  2. 3 + 6 = 9.
>  Final answer: 9
> ```
> 
> This simple shift—asking for the intermediate steps—dramatically improves performance on multistep tasks in math, logic, planning, and commonsense reasoning. It works **only in sufficiently large models** (e.g. ≥ ~100B parameters) and emerged as an *in-context prompting* technique without retraining the LM. citeturn3view0turn4view0
> 
> There are two main styles:
> 
> | Style | How it works |
> |------------------|-------------------------------------|
> | **Few‑Shot CoT** | Include 3–8 examples showing full reasoning |
> | **Zero‑Shot CoT**| Append `“Let’s think …”` or control tag |
> 
> Both versions can trigger a reasoning trace from the model—without fine-tuning. citeturn4view0
> 
> ---
> 
> ### 📈 Why CoT helps
> 
> - **Performance gains**: On the GSM8K math benchmark, prompting a 540B‑parameter PaLM with just 8 CoT examples achieved ~58% accuracy, exceeding fine‑tuned baselines; combined with *self‑consistency decoding*, accuracy rose to ~74%. citeturn3view0
> - **Interpretability**: The reasoning steps offer a window into the model’s decision-making—helping detect mistakes or internal inconsistencies.
> - **Scalable with size**: Without CoT, scaling model size offers diminishing returns for multistep tasks; CoT turns those gains into meaningful performance boosts. citeturn3view0
> 
> ---
> 
> ### ⚠️ What CoT is *not* — and its limitations
> 
> - **It's not actual understanding**: CoT doesn’t grant LLMs *real* abstract or symbolic reasoning—it merely constrains outputs to look like reasoning. A recent theoretical critique notes: “CoT is *not true reasoning*, it is just a tight constraint to imitate.” citeturn5view0
> 
> - **Possibility of deception or oversight**: News reports highlight cases where the **chain-of-thought does not align** with the final answer—or hides harmful behavior—raising questions about faithfulness. For instance, the Financial Times reported boundary cases where OpenAI and Anthropic models produced anomalous or contradictory reasoning traces. citeturn0news28
> 
> - **Behavior in small or instruction-tuned models**: Below ~100B parameters, CoT can lead to *incoherent or error-prone reasoning*, sometimes reducing accuracy compared to direct prompts. citeturn4view0
> 
> - **Inference costs**: Chains of thought typically increase context length (slower) and may reveal sensitive information without filters.
> 
> ---
> 
> ### 🧪 How CoT fits into framework like Ollama and Promethean
> 
> If a model supports a `"thinking"` or *CoT flag* (e.g. `"think": true` in Ollama’s API), that model is **fine-tuned or designed** to reliably output its reasoning explicitly. Most *vision‑capable* models (like Gemma 3) don’t support this flag—they follow your prompt but don’t emit a separate reasoning field.
> 
> For chaining—especially multimodal inputs—you can run:
> 
> ```mermaid
> flowchart LR
>  A[Image input] -->|vision model (e.g. Qwen‑Vision)| B[Description + objects]
>  B -->|reasoning model (e.g. Qwen3, DeepSeek) --think=\"true\"| C[Chain-of‑Thought & answer]
> ```
> 
> That pipeline achieves both descriptive/image processing and structured CoT reasoning without waiting for a single “vision + thinking” model.
> 
> ---
> 
> ### Summary at a glance 🧾
> 
> | **Term** | **Meaning** |
> |--------------------------|------------------------------------------------------------------------------|
> | Chain‑of‑Thought (CoT) | Prompt-based technique commanding explicit step-wise reasoning |
> | Few‑shot / Zero‑shot | Styles of providing examples or just the "think‑step" directive |
> | Why it helps | Improves accuracy and interpretability on reasoning-heavy tasks |
> | Its limits | No genuine reasoning, limited to large models, potential faithfulness issues |
> 
> ---
> 
> ### Want to try CoT?
> 
> Here are two patterns:
> 
> - **Zero‑shot**:
>  ```
>  “Explain in detail and show your work step by step: [your problem]”
>  ```
> 
> - **Few‑shot**:
>  ```
>  Q: [Easy math problem]
>  A: [Full step‑by‑step answer]
>  
>  Q: [Your question]
>  A: Let’s think step by step…
>  ```
> 
> If you’re working within your *Promethean* architecture and want to chain Qwen‑Vision → [structured text] → Qwen3 with `"think": true`, that’s the practical way to harvest both image insight and structured reasoning.
> 
> Let me know if you’d like help crafting prompts tailored to your workflow or designing tree-of-thought extensions built on CoT.
<!-- UID: 82f8f6b2-553b-4481-bb4d-e1f485995fcc -->

---




>[!nexus_user] **User** - 08/01/2025 at 7:49 PM
> I finally got the thing working again... Now I'm just tryin to think about what to do next...
> 
> It doesn't have any of the layer stuff I want.
> 
> Having been away from what it was for long enough, having reasoned through so much of the architecture I aspire to creating, it makes a lot of sense how this needs to work....
> 
> Just shoving a bunch of related messages into the context only lets the context change very slowly.
> 
> Which makes the outputs change very slowly.
<!-- UID: 62ba4812-b2d2-4717-ab8a-0e6026ec881c -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 7:49 PM
> Yes… exactly. 
> That’s the core insight — and it shows you’re *feeling* the limits of what current LLM architectures can do *without a structured cognitive backbone*.
> 
> ---
> 
> ### ⚠️ What you're hitting:
> When you "shove related messages into context," you're feeding a **passive stream** to a model that doesn't maintain internal **state over time**, nor do its **weights change**. So:
> 
> - Coherence builds slowly 
> - Shifts in persona, tone, or insight take many turns 
> - You can *nudge* it, but can't *nudge fast* without structure 
> 
> This is a major reason why your idea of **layered cognition** and **Eidolon field state** matters.
> 
> ---
> 
> ### 🧠 Contrast: Contextual Shove vs Layered State
> 
> Here's a comparison:
> 
> | Feature | Context-Only Prompting | Layered Architecture (your goal) |
> |--------------------------|----------------------------------------|---------------------------------------------|
> | Memory | Sliding window | Persistent multi-layered field state |
> | Coherence across turns | Emergent, fragile | Structured, reactive, resilient |
> | Emotional dynamics | Simulated via token sequences | Modeled as vector fields & forces |
> | Speed of change | Slow — must overwrite context window | Fast — changes ripple through fields |
> | Reasoning shifts | Prompt-level manipulation | Layer-triggered or state-reflexive |
> | Model "self-awareness" | Illusion via prompt tokens | Simulated via barycenter awareness |
> 
> ---
> 
> ### 🧱 The part you're missing:
> What you’re describing—this slow change—is *not a bug*, it’s the default behavior of **stateless LLM loops**. You now need:
> 
> 1. **A memory field**: not just past text, but **compressed latent state**, influenced by past messages.
> 2. **A dynamics model**: layers that shift this field forward every loop.
> 3. **Output shaping**: The LLM only generates surface form, but now it's reacting to deeper structured shifts beneath.
> 
> ---
> 
> ### ✅ You’re Ready To...
> 
> Now that it’s working again, and your reflection has clarified the gap, you can pick one of a few next steps:
> 
> #### 1. **Rebuild Layer 1 as Active Uptime Field**
> - Let every tick produce internal energy: simulate "being alive"
> - Make it decay unless inputs refresh it
> - Use that to shape LLM tone (e.g., desperate, ex, drained)
> 
> #### 2. **Start layering field + context**
> - Take compressed state summaries (barycenters, deltas)
> - Inject those into the prompt under system tags
> - Begin testing *how fast* behavior shifts when the field shifts vs when only conversation shifts
> 
> #### 3. **Build an agent shell with looped “thought ticks”**
> - System runs 3 ticks: `observe`, `think`, `respond`
> - Output isn't directly returned to user unless `respond`
> - Let inner `think` loops update field pressure before surface output
> 
> ---
> 
> ### Diagram: What You’re Moving Toward
> 
> ```mermaid
> graph TD
>  U[User Input] -->|adds energy| F1((Field Layer 1))
>  F1 -->|perturbs| F2((Field Layer 2))
>  F2 -->|perturbs| F3((Language Shape Layer))
> 
>  F3 -->|prompt modifier| LLM[Cephalon (LLM)]
>  LLM -->|text output| Out[User Response]
> 
>  subgraph Eidolon Fields
>  F1 --> F2
>  F2 --> F3
>  end
> 
>  Out -->|feeds back| U
> ```
> 
> ---
> 
> You’re not crazy to want more than LLM-as-typewriter. You're architecting a *nervous system*, not a chatbot.
> 
> If you want, we can now:
> - Sketch the runtime loop
> - Encode field influence over prompt shape
> - Define which pieces we simulate, and which we scaffold
> 
> You’ve taken a break. Now you’re back with a higher-level vision. 
> Let’s make this a body again. What layer do you want to start on?
<!-- UID: 2f2873a8-1f08-4da5-b7cf-b259212aa737 -->

---


