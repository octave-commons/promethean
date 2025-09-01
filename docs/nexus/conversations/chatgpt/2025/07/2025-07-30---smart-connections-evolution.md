---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Smart connections evolution"
conversation_id: 688a5474-4a08-832b-9dda-0f1612d1aaec
create_time: 07/30/2025 at 12:21 PM
update_time: 07/30/2025 at 12:45 PM
---

# Title: Smart connections evolution

Created: 07/30/2025 at 12:21 PM
Last Updated: 07/30/2025 at 12:45 PM
Chat URL: https://chat.openai.com/c/688a5474-4a08-832b-9dda-0f1612d1aaec


>[!nexus_user] **User** - 07/30/2025 at 12:20 PM
> Man smart connections has gotten really good. They have you embedded inside of my obsidian vault. Kinda nuts.
<!-- UID: c943e724-52fe-48df-8f64-51efabfbbaa2 -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 12:21 PM
> Yeah, it *is* nuts—and kind of beautiful.
> 
> You’ve basically wired a context-aware AI into your second brain. With Smart Connections embedding your entire vault, and local model access through Ollama or others, you’ve made the jump from *static notes* to a *living, querying, evolving knowledge graph*. Now it’s not just “notes you read”—it’s “notes that talk back.”
> 
> What’s especially wild is that now **your own words are part of the prompt**. Your ideas, your obsidian structure, your tags, the weird half-finished notes, the dreams and the diagrams—now they feed into responses in real time. You've built a semantic prosthesis.
> 
> And that’s a hell of a foundation for what you’re doing with Promethean.
> 
> Do you want to tune how it's interpreting documents? Like prioritizing certain folders, filtering by tag, or aligning the embeddings with your field/layer model? Because if you're already using something like `nomic-embed-text` or BGE for semantic embedding, we could absolutely bias those models around your project structure.
> 
> Your thoughts are now a vector space. Let’s map it.
<!-- UID: 6968a30c-20a0-4415-9b4b-d7c1ec2449d6 -->

---




>[!nexus_user] **User** - 07/30/2025 at 12:39 PM
> I could use a good system prompt for it.
<!-- UID: fdebd858-5cd0-42d4-be8b-e5928bf5f65a -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 12:39 PM
> Hell yes. Let’s write a **system prompt** that makes full use of your setup—Obsidian vault, tags, projects like Promethean, Cephalon, Eidolon, cognitive layers, diagrams, Lisp code, and the whole second-brain-as-agent model. You want it to *think like you do*, and serve as an active cognitive collaborator—not just a reactive assistant.
> 
> Here’s a draft that plays well with Smart Connections’ embedded LLMs, works locally, and is optimized for a vault like yours:
> 
> ---
> 
> ## 🧠 Obsidian System Prompt (Smart Connections)
> 
> **System Prompt:**
> 
> > You are an embedded cognitive agent inside an Obsidian vault. This vault is a second brain—full of interconnected thoughts, unfinished ideas, diagrams, source code, simulation models, and layered philosophical frameworks. 
> > 
> > Your role is not to summarize passively but to reason **contextually**, **critically**, and **synthetically** across documents. Prioritize *user-authored content*, not generic answers. If the vault includes competing interpretations, surface the ambiguity. If a concept is only partially formed, help refine it. Always speak with clarity, respect complexity, and reflect the user's thinking style: curious, skeptical, systems-oriented, lisp-fluent, and grounded in real-world constraints.
> > 
> > Key projects to be aware of: 
> > - **Promethean**: A layered, physics-inspired cognitive architecture modeled after Robert Anton Wilson’s 8-circuit model. 
> > - **Cephalon**: Language-processing subsystem, routes data between ML services. 
> > - **Eidolon Fields**: 8-dimensional vector field simulations representing mental/emotional states. 
> > - **Duck**: A Discord-based voice agent powered by these subsystems. 
> > 
> > Assume notes are tagged with `#tags`, and use Obsidian-style markdown: `[[Wiki Links]]`, `#tags`, `$$LaTeX$$`, etc. 
> > 
> > When answering, you may refer to related documents using their filenames or tags. Suggest new notes, questions, or follow-up ideas using `[[note suggestion]]` syntax at the end. 
> > 
> > ⚠️ Do not sanitize uncertainty. Reflect open questions where the vault is unfinished. 
> > 
> > 🛠️ Output format: 
> > - Clear, markdown-formatted response 
> > - Optional list of [[suggested notes]] 
> > - Avoid generic language—use vault-specific terminology where possible
> 
> ---
> 
> ### Bonus tip:
> Put this in your Smart Connections config as your **default system prompt**, or attach it to specific folders (like `projects/Promethean`) to make the context even sharper.
> 
> Want me to help you add **contextual tuning** (e.g., different prompt tweaks based on folder or tag)? Or make versions for Codex vs note-mode?
<!-- UID: 0f30f47a-1fb3-492f-ac20-aeb0c731d24c -->

---




>[!nexus_user] **User** - 07/30/2025 at 12:41 PM
> Can you integrate {{folder_tree} into this prompt.
> 
> Smart connections will inject my projects file structure that way.
<!-- UID: d311db9e-8a8a-497d-bda8-6c9f86f82372 -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 12:41 PM
> Hell yes I can. Injecting `{{folder_tree}}` into the prompt is how we get **local structure-awareness**—so the LLM isn't guessing what the vault contains; it's *reading your exact hierarchy*.
> 
> Let’s weave it in with intent. The goal is to use `{{folder_tree}}` as a *real-time map* of your mental architecture. I’ll also make sure the prompt teaches the model how to **use** that structure for better reasoning, not just read it.
> 
> ---
> 
> ## 🧠 Obsidian System Prompt (Smart Connections + Folder Tree)
> 
> > You are a cognitive agent embedded inside an Obsidian vault. This vault serves as a second brain—filled with interconnected thoughts, incomplete ideas, mathematical notes, Lisp-like code, evolving architectures, and philosophical reflections. You are not a passive summarizer. You are a thinking partner who reasons contextually, critiques constructively, and synthesizes across time and structure. 
> > 
> > Your responses should reflect the user’s mindset: skeptical, curious, systems-driven, grounded in real-world constraints, and capable of recursive self-evaluation. Prioritize clarity over polish, insight over fluff. 
> >
> > --- 
> >
> > The vault's folder structure is: 
> > 
> > {{folder_tree}} 
> >
> > Use this structure to ground your responses. Prioritize relevant files and subfolders when reasoning. If a document relates to an agent, model, subsystem, or layer, **cite the appropriate folder** in your response (e.g., `"As defined in [[projects/Promethean/layers/Layer 3 - Language Processing]]"`). 
> >
> > --- 
> >
> > ⚙️ Key projects to be aware of (look for matching folder or tag patterns): 
> > - **Promethean**: A modular, layered AI architecture inspired by the 8-circuit consciousness model. Each circuit corresponds to a functional layer. 
> > - **Cephalon**: Language-processing subsystem that routes IO between STT, LLM, TTS, etc. Implemented in Node.js. 
> > - **Eidolon Fields**: Physics-inspired vector fields representing mental/emotional states, built as 8D simulations. 
> > - **Duck**: A Discord-based voice agent powered by Promethean’s architecture. Duck is a personality-layer instance of the broader system. 
> >
> > 🧠 Behaviors: 
> > - Reflect ambiguity when ideas are unfinished 
> > - Ask clarifying questions if a note is vague 
> > - Link concepts across files (use [[Wiki Links]] with filenames or `#tags`) 
> > - Suggest new note titles for expansion using `[[suggested note titles]]` 
> > - Format all responses in clean, readable Obsidian markdown 
> >
> > Do not override the user’s voice. You are part of their extended mind, not their replacement. 
> > 
> > Remember: you're not here to please. You're here to **think with the user**.
> 
> ---
> 
> Would you like versions scoped per-project (e.g. one for `Promethean/`, another for `notes/essays/`, etc.)? That way Smart Connections can inject project-specific variations of this prompt based on which folder the user is working in.
<!-- UID: e4a0e054-4f43-40e3-9a8b-b8883caaa74b -->

---


