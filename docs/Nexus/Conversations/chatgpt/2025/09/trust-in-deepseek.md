---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Trust in DeepSeek"
conversation_id: 68b6056c-f740-832b-8264-d9bed6a6e01d
create_time: 09/01/2025 at 3:43 PM
update_time: 09/01/2025 at 4:05 PM
---

# Title: Trust in DeepSeek

Created: 09/01/2025 at 3:43 PM
Last Updated: 09/01/2025 at 4:05 PM
Chat URL: https://chat.openai.com/c/68b6056c-f740-832b-8264-d9bed6a6e01d


>[!nexus_user] **User** - 09/01/2025 at 3:43 PM
> Why don't I trust deepseek?
<!-- UID: 35f53238-7a29-4379-9e36-5dfc20c7c4a5 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:43 PM
> You probably don’t trust DeepSeek because the incentives and context around it trip your internal alarms. Let’s break it down:
> 
> ---
> 
> ## 1. Origin and Incentives
> DeepSeek isn’t some small hacker collective — it’s a Chinese company backed by serious funding. That automatically means:
> - **Geopolitical leverage**: AI companies in China don’t operate independently of the state. Even if they *want* to, the government can intervene at any time.
> - **Profit pressure**: The company’s incentives are to grow, scale, and monetize. That usually means promises about "open" or "free" come with strings.
> 
> ---
> 
> ## 2. The "Too Good to Be True" Effect
> DeepSeek has been hyped for:
> - High-performance models at a fraction of the cost of OpenAI/Anthropic.
> - Claims of efficiency and breakthroughs that seem almost magical compared to competitors.
> 
> If something feels *too cheap, too powerful, too fast*, the natural instinct is suspicion:
> - Where are the trade-offs?
> - What’s the hidden cost (data, telemetry, restrictions, lock-in)?
> 
> ---
> 
> ## 3. Narrative and Opacity
> Unlike open projects (say, Hugging Face or EleutherAI), DeepSeek doesn’t have a long history of transparent community collaboration. It popped into the Western discourse almost overnight. That kind of sudden visibility feels engineered rather than organic.
> 
> ---
> 
> ## 4. Your Personal Context
> From what I know about how you think:
> - You’ve been working hard to build **systems you can own end-to-end**, without hidden SaaS hooks.
> - You value **transparency, local control, and decentralization**.
> - You’re skeptical of “world-changing AI” narratives because they tend to consolidate power rather than spread it.
> 
> DeepSeek *violates all three instincts*: it’s centralized, not transparent, and the hype around it is being used as a geopolitical and capitalist play.
> 
> ---
> 
> ## 5. Trust is Earned
> At the end of the day:
> - DeepSeek hasn’t earned your trust through consistent openness, transparency, and alignment with your values.
> - Instead, it feels like another player in the arms race — and your gut tells you that if you rely on it, you’ll eventually be at the mercy of forces outside your control.
> 
> ---
> 
> ### TL;DR
> You don’t trust DeepSeek because:
> - It’s tied to geopolitical power structures.
> - The hype feels too convenient and too good to be true.
> - It doesn’t align with your principles of local ownership and transparency.
> - Trust is earned, and DeepSeek hasn’t earned it yet.
> 
> ---
> 
> Do you want me to do a **fresh dive into how DeepSeek is being received right now** (media, developer forums, technical audits), so we can see if your instincts are matched by what others are uncovering?
<!-- UID: 212946e5-bcac-47bd-adf1-efe861729b99 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:45 PM
> How is it licensed?
<!-- UID: a582388f-0139-4ba6-8c2c-cd1c6e3b2fe3 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:45 PM
> You're asking a smart, practical question — and that's good. Let’s cut through the noise and break down how **DeepSeek is licensed**, model by model, in a way that's clear, critical, and useful to you:
> 
> ---
> 
> ## License Breakdown by DeepSeek Version
> 
> ### **DeepSeek-R1** (released Jan 2025)
> - **License**: **MIT License** 
> - **What that means**: Very permissive. You’re free to use, modify, redistribute—even commercially—without paying royalties. 
> - **Highlights**: The weights are open; API outputs are usable for fine-tuning and distillation.citeturn0news23
> 
> ---
> 
> ### **DeepSeek-V3** (notably models like V3-0324, V3.1)
> - Released March 24 and August 21, 2025.
> - **License**: Also **MIT License**.cite
> 
> ---
> 
> ### **DeepSeek-V2, V2.5, Coder, LLM series**
> - Under what’s known as the **“DeepSeek License”** or “DeepSeek Model License.”
> - This is more deliberately crafted:
>  - Grants **perpetual, worldwide, royalty-free** rights for copyright **and patent** usage. 
>  - But with **“use-based restrictions”** — e.g., banning illegal or hazardous purposes (see Attachment A of the license).cite
>  - If you distribute derivatives, you must preserve these use-based restrictions in those derivatives’ licenses.cite
> 
> ---
> 
> ### **DeepSeek-Coder (the code-specific models)**
> - Released earlier.
> - **License**: MIT — as per the permissive code-release.citeturn0academia29
> - Note: The underlying **model license** appears to fall under the DeepSeek License umbrella (i.e., with use-based restrictions).cite
> 
> ---
> 
> ## TL;DR — Snapshot Table
> 
> | Model / Version | License Type | Key Characteristics |
> |-----------------------------|---------------------------|-------------------------------------------------------------------|
> | DeepSeek-R1 | MIT License | Fully permissive—use, modify, redistribute, commercial allowed. |
> | DeepSeek-V3 (V3-0324, V3.1) | MIT License | Also fully permissive. |
> | DeepSeek-V2 / Coder / LLM | DeepSeek License | Permissive + use-based restrictions (must carry forward). |
> 
> ---
> 
> ## No Bull: What You Should Watch
> 
> - **MIT License = freedom—but stay alert** 
>  It’s permissive, but if you're dealing with risk-sensitive or regulated contexts, you still need to assess compliance—especially for geopolitical, privacy, or data concerns.
> 
> - **DeepSeek License = more cautious approach** 
>  A hybrid: open on the surface, but still carries guardrails. You can't ignore the use-based restrictions.
> 
> - **Derivative works matter** 
>  If you build something based on a V2/Coder/LLM model, the same use-based limits should appear in your downstream licenses.
> 
> - **What about the rest (training code, data)?** 
>  Seemingly not open-sourced. The code that runs the training and the dataset aren't publicly licensed.cite So there’s still a black box element lurking.
> 
> ---
> 
> Let’s put this in your framing: You're building systems that you (or your users) can fully understand, own, and control. You’d want something with **transparent licensing, no hidden traps, and freedom to pivot their use**. R1 and V3 check those boxes under MIT. V2 and the rest are semi-transparent—they’re open but tethered by policy constraints.
> 
> ---
> 
> If you want, we can dig deeper into *what exactly* those use-based restrictions are (what kinds of “hazardous purposes” they forbid), or scan for community reactions to how restrictive or enforceable those are. Just say the word.
> 
> Let’s stay sharp. #DeepSeekLicense #PracticalTrust #OpenUse
<!-- UID: e4b0ba01-cd70-4b7c-855e-280dc40ad121 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:46 PM
> yes, what exactly are these constraints.
<!-- UID: efa99044-2438-4d50-8e61-475520e10df9 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:46 PM
> You're asking the right question—what exactly are the “use-based restrictions” in DeepSeek’s model license? Let’s strip away the fluff and lay it out clearly.
> 
> ---
> 
> ## What the DeepSeek Model License *Actually* Says
> 
> ### The Formal Clause
> Section 5 of the license (DeepSeek-V3 model, for example) states:
> > Use-based restrictions—the restrictions laid out in *Attachment A*—are binding. You may *not* use the model or its derivatives for those restricted purposes. Permissible uses (like finetuning, running, evaluating, etc.) must still align with the license terms. cite
> 
> So there *are* specific activities you're barred from—but the license itself doesn't list them directly. You have to refer to Attachment A.
> 
> ---
> 
> ## What’s in Attachment A?
> 
> I couldn't find the full text of Attachment A readily posted online. But multiple secondary sources give us enough to sketch out the gist:
> 
> - Reporting confirms that the restrictions are about **illegal or hazardous activities**. cite
> - BytePlus’s detailed summary reinforces this: the license lets you use the model—even commercially—but specifically *limits harmful or illegal uses*. cite
> - Another source reinforces that the core restriction is on “illegal or hazardous activities.” cite
> 
> ---
> 
> ## Summary Table — DeepSeek Model License Use-Based Constraints
> 
> | **Aspect** | **Details** |
> |-----------------------|-------------|
> | **What’s Restricted** | Use in unspecified illegal or harmful applications. |
> | **Where Specified** | Attachment A of the model license (not publicly quoted). |
> | **What You Need to Do** | When distributing derivatives, **you must include those same restrictions** under your own license. cite |
> | **Uncertain Territory** | Without seeing Attachment A, we don't know *exactly* what's banned—just the category (illegal/hazardous). |
> 
> ---
> 
> ## Practically: What Does This Mean for You?
> 
> - You’re **allowed** to use the models (like V2, Coder, or any LLM variant), including for commercial use—*as long as you avoid those restricted categories*.
> - If you create a derivative model, **you can license it differently**, *but must carry over those use-based restrictions*. So nobody downstream can legally use what you produce for those banned purposes. cite
> 
> Looks straightforward, but here’s the kicker: **“illegal or hazardous” is vague.** That ambiguity can be turned into liability if someone decides your use violates their subjective interpretation. Not ideal if you're building systems meant to be resilient, self-owned, and audit-friendly.
> 
> ---
> 
> ## Next Steps (if you're game)
> 
> You might want to track down the actual Attachment A in a few places:
> 
> - The repository or model card on Hugging Face (it typically a `LICENSE-MODEL` with attachments).
> - Any downloadable `.zip` or `.tar` that includes license attachments.
> - The GitHub or official licensing documentation that came with the model files.
> 
> Let me know if you want help hunting it down—or if you’d rather build a framework for handling ambiguous licensing without digging deeper.
> 
> ---
> 
> Bottom line: *DeepSeek’s model license* gives you broad play—but with a caveat: you can’t use the model for "illegal or hazardous" things. You also must pass those same restrictions onward if you share or modify the model.
> 
> It's functional but leaves room for interpretation. If you're designing systems to be solid and clear, you may want to push them toward truly permissive models—or draft your deployment policies to assume the worst-case interpretation of those restrictions.
> 
> What’s your gut telling you—worth the risk, or should we keep peeling back the layers?
<!-- UID: c441fc29-56fb-4917-87e9-071271a2e0a4 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:52 PM
> yea that is sketch... if they are talking about chinese law, there is a lot of baggage that could carrry...
<!-- UID: b4d43a46-7fd4-4b13-a505-7247344ffa15 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:52 PM
> Exactly — that’s the part that makes it sketchy. 
> 
> When a license says “illegal or hazardous uses,” but doesn’t pin it to a specific jurisdiction, the default interpretation is **the laws of the country where the licensor operates**. Since DeepSeek is Chinese, that effectively means **Chinese law** could define what’s restricted. And that’s a moving target:
> 
> - **Broad censorship laws** — things like criticism of the CCP, references to Tiananmen, Falun Gong, Tibet, Xinjiang, Hong Kong protests, etc., are “illegal” speech under PRC law. 
> - **Expansive “national security” scope** — the PRC defines security threats very broadly, covering not just weapons or terrorism, but also speech, organizing, or tech uses that could be seen as undermining state interests. 
> - **Cross-border enforcement risk** — even if *you* are outside China, the license could technically bind you to those definitions if you build on their models. That creates a vector for legal/political pressure downstream. 
> 
> So yeah — compared to MIT (crystal clear, permissive), the **DeepSeek License is ambiguous by design**. That ambiguity allows it to look “open” internationally, but still bind usage to the home country’s legal regime if challenged.
> 
> This is why it feels dangerous in your context: you’re building systems that need to be **ownable, forkable, and resistant to coercion**. A license tethered to a state with aggressive control policies is the opposite of that. 
> 
> ---
> 
> Do you want me to dig up the **actual Attachment A text** from their Hugging Face repos or GitHub so we can see word-for-word what’s banned? That way we’re not guessing how much Chinese law is baked in.
<!-- UID: 7d3ef133-8cc0-46ef-9533-2af27506f21b -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:52 PM
> yes try to find attachment A
<!-- UID: f99593a7-384d-4d50-bfbd-352c7149b5f6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:52 PM
> You're absolutely right to feel skeptical—this *is* sketchy. Diving into the actual **Attachment A** from the DeepSeek Model License clarifies what “use-based restrictions” really entails—so let's get real with the literal text:
> 
> ---
> 
> ## DeepSeek Model License — *Attachment A: Use Restrictions*
> 
> According to the license (found on DeepSeek-V3’s Hugging Face repository), **Attachment A** explicitly bans these uses:
> 
> - Any use that **violates applicable national or international laws** or infringes on third-party rights.
> - **Military use** in any form.
> - Exploiting or harming minors.
> - Generating or spreading **verifiably false information** intended to harm others.
> - Generating or distributing **inappropriate content** as regulated.
> - Sharing **personally identifiable information** without proper authorization or in unreasonable ways.
> - **Defaming, disparaging, or harassing** individuals.
> - Fully automated decision-making that **adversely affects legal rights** or creates binding obligations.
> - Discrimination or harm based on social behavior, personal traits, or personality.
> - Exploiting vulnerabilities of certain groups (age, social, physical, or mental) to manipulate behavior, causing physical or psychological harm.
> - Any use that discriminates against individuals based on **legally protected characteristics**. 
> cite
> 
> ---
> 
> ### Why This Matters
> 
> - It confirms your gut suspicion: *these aren’t abstract ethical guidelines—they're explicit, enforceable limits baked into the license itself.*
> - It’s heavy-handed, and again, **jurisdiction matters**: the license is governed under PRC law and subject to PRC courts in Hangzhou. What counts as “inappropriate,” “protected characteristics,” or “harassment” could broaden or shift under Chinese interpretation. cite
> - That means if you deploy, modify, or distribute a DeepSeek derivative, you're not just bound by broad ethical norms—you’re bound by a potentially opaque legal regime.
> 
> ---
> 
> ### TL;DR Snapshot
> 
> | Prohibited Use Category | What It Means (Plain-Speak) |
> |-------------------------------|-------------------------------------------------------------|
> | Illegal activity | Any act deemed unlawful under any jurisdiction |
> | Military uses | No weaponization, no defense systems, none of it |
> | Harm to minors | Absolutely off-limits |
> | Disinformation | No false content meant to harm |
> | Sensitive content | Subject to local regulatory standards—vague and broad |
> | PII misuse | Cannot mishandle personal data |
> | Harassment/Defamation | No targeting or insulting individuals |
> | Unfair automated decisions | No purely algorithmic decisions that legally bind |
> | Discrimination | No bias or targeting of individuals based on traits |
> | Exploitation of vulnerabilities | No psychological or social manipulation of vulnerable groups |
> | Protected categories | Must avoid use that discriminates based on protected statuses|
> 
> ---
> 
> ## The System-Designer's Lens—Why This Feels Like a Tripwire
> 
> You wanted systems where _ownership_, _clarity_, and _autonomy_ are built in—not dependency on a shifting and opaque legal standard. This license:
> 
> - **Adds unpredictability**: Terms like “inappropriate content” or “protected characteristics” can vary in legal interpretation—especially in PRC law.
> - **Imposes compliance costs**: Downstream users must carry forward these restrictions, complicating license propagation and auditability.
> - **Increases coercion risk**: If authorities demand you comply with interpretations you're uncomfortable with, it becomes a real constraint—even outside China.
> 
> ---
> 
> ## Next Moves—Choose Your Path
> 
> 1. **Extract and preserve Attachment A**: Keep the full text firmly around if you’re evaluating use or building derivatives.
> 2. **Define your internal policy baseline**: If your standards are stricter than Attachment A, document them up front.
> 3. **Plan for alternates**: If you need true sovereignty in your systems, consider fully permissive models (MIT, Apache) with no strings, or build your own under known terms.
> 
> ---
> 
> Let me know if you want to explore permissive alternatives that avoid ambiguity—or build a policy-first wrapper to insulate your stack from these legal traps. Stay sharp. #LicenseTransparency #ControlYourOwnStack
<!-- UID: 50b45586-e43d-4998-b3fb-c4167dcccb7a -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:54 PM
> Can you dig up performance benchmarks for all 3 models?
<!-- UID: f753bab8-f3b7-4e2d-b6b1-6aadf4856470 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:54 PM
> Here’s what I dug up on performance benchmarks for **DeepSeek-V2/V2.5, DeepSeek-V3** (and V3.1), and **DeepSeek-R1**—let’s cut through the marketing gloss and look at the real, data:
> 
> ---
> 
> ## DeepSeek-V2 / V2.5 Performance
> 
> - **DeepSeek-V2.5** (released September 2024 under the MIT License) shows meaningful gains: 
>  - **AlpacaEval 2.0**: Overall accuracy ~50.5%, improved from 46.6% (DeepSeek-V2-0628) and 44.5% (Coder-V2-0724). 
>  - **HumanEval (Python coding)**: Score of 89. 
>  - In Chinese evaluations, it reportedly surpassed GPT-4o mini and GPT-4o. 
>  - In a later update (V2.5-1210), **MATH-500** accuracy rose from 74.8% to **82.8%**, and **LiveCodeBench** from 29.2% to **34.38%**. 
>  cite
> 
> ---
> 
> ## DeepSeek-V3 (Including V3.1)
> 
> - **Model architecture**: MoE (Mixture-of-Experts), using 671B total parameters with ~37B activated per token; efficient design with MLA and other innovations. 
>  cite
> 
> - **Benchmark performance**: 
>  - Excels in educational/factual benchmarks— 
>  - **MMLU**: 88.5 
>  - **MMLU-Pro**: 75.9 
>  - **GPQA**: 59.1 
>  - Performs strongly on SimpleQA, including Chinese variants, ranking among top (close to GPT-4o, Claude Sonnet-3.5). 
>  cite
> 
> - **V3.1 upgrades**: Released August 2025 under MIT again; hybrid thinking/non-thinking modes; claims over **40% improvement** on benchmarks such as SWE-bench and Terminal-bench compared to prior versions. 
>  cite
> 
> ---
> 
> ## DeepSeek-R1 (and R1-0528)
> 
> - Compared to competitors:
>  - **Mathematics**: 
>  - **AIME 2024**: DeepSeek-R1 scored **79.8%**, slightly above OpenAI o1-1217 at 79.2%. 
>  - **MATH-500**: **97.3%** vs. OpenAI o1-1217's 96.4%. 
>  - **Coding & Reasoning**: 
>  - Comparable Codeforces percentile (~96.3 vs 96.6 on o1-1217); **SWE-Verified**: 49.2% vs 48.9%. 
>  - Other reasoning benchmarks (MMLU, MMLU-Pro, GPQA Diamond): 
>  - **MMLU**: 90.8% (R1) vs 88.5% (V3) 
>  - **MMLU-Pro**: 84.0% 
>  - **GPQA Diamond**: 71.5% 
>  cite
> 
> - **Coding-specific scores** (R1 vs GPT-o1, Claude Sonnet 3.5): 
>  - **LiveCodeBench (Pass@1-COT)**: 65.9 (R1) vs 34.2–53.8. 
>  - **Codeforces percentile**: 96.3 
>  - **Codeforces rating**: 2029 
>  - **Debugging accuracy**: 90% (R1) vs 80% (GPT-o1) & 75% (Claude). 
>  cite
> 
> - **R1-0528 version** (May 2025): 
>  - Intelligence Index ~68 (up from ~60), on par or slightly ahead of Claude 4 Sonnet (~68.2). 
>  - Provides cost advantage—much cheaper to run per token vs Anthropic models. 
>  cite
> 
> - **Domain-specific**: 
>  - In bilingual complex ophthalmology reasoning tasks: highest accuracy among peers: 
>  - Chinese MCQs: 0.862 (R1) vs 0.715 (Gemini), 0.685 (o1), 0.692 (o3-mini) 
>  - English MCQs: 0.808 (R1) vs 0.746 (Gemini), 0.723 (o1), 0.577 (o3-mini). 
>  citeturn0academia24
> 
> - **Inference speed** (ophthalmology): 
>  - DeepSeek-R1: slowest at ~40.4 seconds per sample; Gemini fastest at 6.7s. 
>  citeturn0academia25
> 
> ---
> 
> ## At a Glance: Benchmark Summary
> 
> | Model / Version | Key Strengths |
> |----------------------|---------------------------------------------------------|
> | **V2.5** | Solid general reasoning (AlpacaEval ~50%), strong math and code (HumanEval 89); improvements in MATH-500 and LiveCodeBench. |
> | **V3** | Advanced fraught reasoning knowledge (MMLU ~88.5, GPQA ~59.1), closer to GPT-4 quality on factual tasks. |
> | **V3.1** | ~40% improvement over V3 on code/reasoning benchmarks. |
> | **R1** | SOTA in math (AIME, MATH-500), reasoning (MMLU), coding (LiveCodeBench), debugging, and domain-specific tasks like ophthalmology. Slightly slower inference. |
> | **R1-0528** | Higher intelligence index (~68), cost-efficient, and competitive with Claude 4, but still slower. |
> 
> ---
> 
> ### Bottom Line (with a skeptical lens)
> 
> - **V2.5** feels like a strong mid-tier model—capable, efficient, but not groundbreaking.
> - **V3** approaches closed-source frontrunners on factual reasoning benchmarks—but unless you need that upper tier, its value is incremental.
> - **R1** (and R1-0528) looks like the real star: it beats or matches closed-source leaders in reasoning, math, and code. Worth your attention if you're pushing for top-end autonomy.
> - **Performance has trade-offs**: R1 is slower; if your system values low-latency, that matters.
> 
> You’ve got the data—now it’s about whether you prefer the cost-effective high-reasoning R1 or the leaner V2.5/V3 setups. Want to explore alternatives or cost-performance modeling next?
> 
> navlistMore on DeepSeek's market impactturn0news19,turn0news20,turn0news22
<!-- UID: 3b35a123-282f-46c1-87d7-debd396897a7 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:56 PM
> so all these models are huge?
<!-- UID: db6f5c92-c0ca-4d2b-a85d-b366b74e218f -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:56 PM
> Yeah — they’re all **big** by any normal standard, though they’re not all in the same league. Let’s break it down:
> 
> ---
> 
> ## ⚙️ DeepSeek-V2 / V2.5
> - **Architecture**: dense transformer. 
> - **Parameter scale**: ~**236B parameters**, fully dense (all parameters active at inference). 
> - **Implication**: brute force power, but expensive to run compared to MoE designs. 
> - **Takeaway**: still a monster, closer in size to GPT-3.5 / early GPT-4-class models.
> 
> ---
> 
> ## ⚙️ DeepSeek-V3
> - **Architecture**: **Mixture-of-Experts (MoE)**. 
> - **Total params**: **671B** parameters. 
> - **Active per token**: ~**37B**. 
> - **Implication**: You get the punch of a massive model but only pay runtime costs for ~37B. 
> - **Takeaway**: extremely large, but efficient — it’s their “we can scale bigger than OpenAI but run leaner” play.
> 
> ---
> 
> ## ⚙️ DeepSeek-R1 (and R1-0528)
> - **Architecture**: also MoE. 
> - **Training scale**: ~**671B** parameters, like V3. 
> - **Active per token**: ~**37B** (same ballpark). 
> - **Focus**: optimized for **reasoning** tasks, especially math and coding. 
> - **Takeaway**: Huge like V3, but fine-tuned for deep thinking rather than general chit-chat.
> 
> ---
> 
> ## 📊 Context Against Others
> - **GPT-3**: 175B dense. 
> - **GPT-4**: widely believed to be MoE with ~1.8T total, ~280B active. 
> - **Claude 3.5 Sonnet**: parameter counts unpublished, but estimated ~50–100B dense. 
> - **Gemini Ultra**: also in the ~hundreds of billions scale.
> 
> So yeah — **all DeepSeek’s models are in the “frontier” range**. Even their “small” ones (V2.5) are huge compared to most open-source models like LLaMA-3-8B or Mistral-7B. 
> 
> ---
> 
> ## 💡 The Real Hook
> - They market **R1/V3 as cheap to run**, but that’s only true because MoE activates a subset per token. 
> - Under the hood, training still required **huge compute budgets** (thousands of GPUs or NPUs). 
> - Which ties back to your earlier point: this isn’t grassroots open-source — it’s **state-backed scale AI**.
> 
> ---
> 
> Do you want me to chart out a **parameter-size vs. benchmark-performance curve** so you can see whether DeepSeek’s scale really buys them an advantage compared to GPT-4, Claude, and smaller open models?
<!-- UID: 3d7e9261-45f3-403c-9185-af38026254f6 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:58 PM
> I would never be able to run these on my systems, even if the mixture of experts model thing actually meant that was all I had to fit into ram.
> 
> I couldn't even fit them on my cpu. They'd never run.
<!-- UID: 271798ff-09fd-4abb-9ccd-32791fa72a05 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:58 PM
> Yep, that’s the truth of it — these DeepSeek models aren’t hobbyist-friendly. Even though they’re using **Mixture of Experts (MoE)** tricks to keep the *active* parameter count around ~37B, that’s still **far beyond what a CPU or even a modest GPU can handle locally**.
> 
> ### Why You Can’t Run Them
> - **RAM footprint**: 37B parameters, even at 4-bit quantization, is ~74 GB VRAM. You’d need multi-GPU setups or specialized accelerators.
> - **CPU inference**: Forget it — the bandwidth and parallelism aren’t there. You’d get tokens per *minute*, if it even fit into system RAM.
> - **Training scale**: They’re trained with *thousands* of GPUs/NPUs. That sets the bar for even inference hardware absurdly high.
> 
> ### Compare to “local-friendly” models
> - **LLaMA-3 8B** or **Mistral 7B**: these can run on a single decent GPU (16 GB VRAM, maybe 32 GB if you want speed). 
> - **Qwen2.5-14B**: with quantization, fits on 24–32 GB cards. 
> - **Gemma-2 9B**: also tuned for efficiency, runs well on mid-range GPUs. 
> 
> Those are the kinds of models you can *actually* run on your system and integrate into Promethean without selling your kidneys for an H100 cluster.
> 
> ---
> 
> 💡 **Bottom line:** DeepSeek’s MIT licensing looks attractive, but the compute requirements make them practically unusable for personal/local deployment. They’re in the same “only big labs or data centers can run this” class as GPT-4. For your purposes, you’re better off focusing on the 7B–14B class open models that can be *owned end-to-end*.
> 
> ---
> 
> Want me to map out the **sweet spot models (sub-20B) you *could* run locally** that still give you strong reasoning/coding chops — so you can sidestep the DeepSeek hype but keep similar functionality?
<!-- UID: 9eed6bb1-39d7-4dc7-82e9-83740c8fba90 -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:59 PM
> they have to fit in 7.4~gb of vram to be useful as auto complete.
<!-- UID: 3aeac350-ee4a-491e-ad32-e111c833bd62 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:59 PM
> Fair. If you’ve only got ~7.4 GB VRAM available, you need **7–8B-class models quantized to 4-bit**, plus tight runtime settings so the **KV cache** doesn’t blow your budget. Here’s the straight dope.
> 
> # What actually fits (and works) for autocomplete
> 
> ## Good bets (code-aware, fast enough)
> - **Qwen2.5-Coder-7B (Q4\_K\_M)** 
>  Strong code priors, decent English. Good latency at batch=1.
> - **Mistral-7B-Instruct v0.3 (Q4\_K\_M)** 
>  Solid general assistant; completion style is predictable.
> - **Llama-3.1-8B-Instruct (Q4\_K\_M)** 
>  Slightly heavier than 7B, but still doable if you keep ctx small.
> - **DeepSeek-Coder-6.7B-Instruct (Q4\_K\_M)** 
>  Capable for code; license caveats you already called out.
> 
> ## If you need ultra-snappy
> - **Phi-3.5-mini / small (Q4)** (≈3–4B) 
>  Lower ceiling, but *great* latency for inline suggestions.
> - **Gemma-2-2B (Q4)** 
>  Lightweight fallback; pair with a 7B for “on hold” completions.
> 
> # Memory math (rule-of-thumb)
> 
> - **7B Q4\_K\_M weights**: ~4.2–4.6 GB 
> - **8B Q4\_K\_M weights**: ~4.8–5.2 GB 
> - **KV cache** (token/dir): ~0.8–1.2 MB per 1k tokens per layer (varies by arch) 
> - **Safe working set**: keep **context (num_ctx)** at **1024–2048**, **batch=1**, to stay **<7.4 GB** total.
> 
> > Translation: 7B-class Q4 fits fine with **num_ctx=2048**. 8B Q4 fits if you **cap num_ctx to ~1536** and avoid big parallel batches.
> 
> # Practical Ollama configs (autocomplete-friendly)
> 
> Use **low temp + small ctx + batch=1**. Examples you can drop in `~/.ollama/models/Modelfile` or set per-request:
> 
> ```ini
> # Example: Qwen2.5-Coder-7B, Q4_K_M
> FROM qwen2.5-coder:7b-q4_K_M
> PARAMETER temperature 0.2
> PARAMETER top_p 0.9
> PARAMETER top_k 40
> PARAMETER num_ctx 1536
> PARAMETER num_batch 1
> PARAMETER num_gpu 1
> ```
> 
> ```ini
> # Example: Llama-3.1-8B, Q4_K_M (tighter ctx to fit 7.4GB)
> FROM llama3.1:8b-instruct-q4_K_M
> PARAMETER temperature 0.2
> PARAMETER num_ctx 1400
> PARAMETER num_batch 1
> ```
> 
> If you see OOMs:
> - Drop **num_ctx** by 256 steps.
> - Ensure **batch=1**.
> - Prefer **Q4\_K\_M** over heavier Q5/Q6.
> - Disable speculative/parallel draft decoding if your stack turns it on.
> 
> # Editor/LS integration tips (to keep latency down)
> 
> - **Streaming, not chat**: Use *completion* endpoints; no unnecessary chat wrappers. 
> - **Short prompts**: Send only the current file’s **left context + small right window** (e.g., 200–400 right tokens). 
> - **Stop tokens**: Define language-appropriate stops (`\n\n`, `;`, `}`) to cut rambling. 
> - **Cache prefixes**: Reuse the same system/preamble across calls (Ollama does prompt caching; keep it stable). 
> - **Debounce**: Trigger on pauses (150–300 ms) and on delimiters, not every keystroke.
> 
> # Recommended pairings (fast + smart)
> 
> If you want both speed and quality on 7.4 GB:
> - **Primary (fast)**: **Phi-3.5-mini (Q4)** for instant ~10–30-token hints. 
> - **Fallback (strong)**: **Qwen2.5-Coder-7B (Q4\_K\_M)** when the small model stalls or confidence is low.
> 
> Route by heuristic: if the last token was an opening brace/paren/keyword, try small; if it’s mid-logic or docstring → escalate to 7B.
> 
> # What to skip
> 
> - **>8B models** (9B/13B/22B): even in Q4 you’ll starve VRAM once KV grows. 
> - **High-ctx configs** (4k–8k) on 7–8B: KV cache will kill you. 
> - **Batch >1** for autocomplete: wastes VRAM without improving the UX.
> 
> ---
> 
> If you tell me your exact GPU (model + driver) and whether you’re locked to Ollama vs llama.cpp, I’ll give you dialed-in **ctx/batch** settings per model and a minimal Emacs/Spacemacs completion pipeline that won’t thrash. #local-first #autocomplete #7B-sweet-spot
<!-- UID: 7bd259b8-cbd8-44b2-b21b-57a3335d49d7 -->

---




>[!nexus_user] **User** - 09/01/2025 at 4:02 PM
> I have to be careful of processes competing over the GPU if I use stuff outside of ollama.
<!-- UID: 18b5901c-5b9d-441b-90b2-46d6adfb2abc -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 4:02 PM
> Yep — GPU contention will wreck your autocomplete latency. Here’s a **practical, low-footgun** way to keep Ollama in the driver’s seat and force everything else to play nice.
> 
> # Ground rules (don’t skip)
> 1. **Single GPU runtime**: route *everything* through **Ollama’s HTTP API**. Don’t run extra GPU runtimes (PyTorch, vLLM, llamafile) unless you *explicitly* intend to.
> 2. **Quantized, small ctx** in Ollama so its VRAM use is predictable (e.g., 7–8B Q4, `num_ctx≈1536`, `batch=1`).
> 3. **Default other tools to CPU/NPU** unless you’re in a controlled window.
> 
> # Hard controls (what actually keeps others off your GPU)
> 
> ## 1) Environment-level locks
> Put this in your shell/profile for everything **except** the Ollama service:
> ```bash
> # Default: no CUDA for random processes
> export CUDA_VISIBLE_DEVICES=""
> 
> # If you *must* allow GPU for a single shell:
> # export CUDA_VISIBLE_DEVICES=0
> ```
> For Docker containers that shouldn’t touch the GPU:
> ```bash
> docker run --runtime=runc ... # i.e., no nvidia runtime, no --gpus flag
> # OR explicitly isolate:
> docker run -e NVIDIA_VISIBLE_DEVICES=none ...
> ```
> 
> ## 2) Make Ollama the only GPU client (systemd)
> Enable persistence (warms up driver, avoids perf jitter) and keep a predictable footprint.
> 
> ```bash
> sudo nvidia-smi -pm 1 # persistence mode on (survives until reboot)
> ```
> 
> Create/verify an override for Ollama:
> ```
> sudo systemctl edit ollama
> ```
> ```ini
> [Service]
> Environment=CUDA_VISIBLE_DEVICES=0
> Environment=OLLAMA_NUM_GPU=1
> # Keeps VRAM steady; adjust to your 7.4 GB budget
> Environment=OLLAMA_NUM_CTX=1536
> Environment=OLLAMA_NUM_BATCH=1
> Environment=OLLAMA_KV_CACHE=1
> ```
> Then:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> ```
> 
> ## 3) Use **llama.cpp/ollama knobs** to cap VRAM
> If a model still spikes:
> - Lower `num_ctx` (drop by 256 until stable).
> - Use **Q4_K_M** (avoid Q5/Q6).
> - Keep `num_batch=1`.
> - Prefer fewer GPU layers if using llamafile/llama.cpp directly (`--n-gpu-layers`), but since you’re on Ollama, stick to the Modelfile params.
> 
> # Soft controls (detect & kill offenders fast)
> 
> ## 4) Kill switch for unknown GPU users
> Drop this as a root cron/systemd timer; it kills any non-Ollama process over a VRAM threshold.
> 
> ```bash
> #!/usr/bin/env bash
> # /usr/local/bin/gpu-police.sh
> set -euo pipefail
> 
> THRESHOLD_MB=512 # any stray > 512MB is suspicious
> ALLOW_PIDS=$(pgrep -x ollama || true)
> 
> nvidia-smi --query-compute-apps=pid,used_memory --format=csv,noheader,nounits \
> | while IFS=, read -r PID MB; do
>  PID=$(echo "$PID" | xargs); MB=$(echo "$MB" | xargs)
>  if ! echo "$ALLOW_PIDS" | grep -qw "$PID"; then
>  if [ "${MB:-0}" -gt "$THRESHOLD_MB" ]; then
>  echo "Killing PID $PID using ${MB}MB (not Ollama)"
>  kill -9 "$PID" || true
>  fi
>  fi
> done
> ```
> 
> Systemd timer (runs every 20s):
> ```
> sudo tee /etc/systemd/system/gpu-police.service >/dev/null <<'EOF'
> [Unit]
> Description=Kill non-Ollama GPU hogs
> 
> [Service]
> Type=oneshot
> ExecStart=/usr/local/bin/gpu-police.sh
> EOF
> 
> sudo tee /etc/systemd/system/gpu-police.timer >/dev/null <<'EOF'
> [Unit]
> Description=Run gpu-police every 20s
> 
> [Timer]
> OnBootSec=30s
> OnUnitActiveSec=20s
> Unit=gpu-police.service
> 
> [Install]
> WantedBy=timers.target
> EOF
> 
> sudo systemctl daemon-reload
> sudo systemctl enable --now gpu-police.timer
> ```
> 
> ## 5) Fast visibility when things feel “sticky”
> - Live utilization:
>  ```bash
>  watch -n 0.5 nvidia-smi
>  ```
> - Per-process VRAM over time:
>  ```bash
>  nvidia-smi dmon -s pucvmet
>  ```
> 
> # Optional (use only if your card supports it)
> - **Exclusive process mode**:
>  ```bash
>  sudo nvidia-smi -c EXCLUSIVE_PROCESS
>  ```
>  Caveat: often only on data-center SKUs; consumer cards may ignore/limit this.
> - **MPS partitioning** (multi-process service): useful to time-slice a *single* framework; not great across mixed runtimes and often not worth the complexity for your use case.
> 
> # Integration policy (so you don’t shoot your own foot)
> - **One GPU runtime**: enforce a rule in Promethean—*all* LLM/STT/TTS GPU calls go through Ollama (or your single blessed runtime). Everything else sets `CUDA_VISIBLE_DEVICES=""`.
> - **NPU/CPU offload for the rest**: point OpenVINO/Whisper/etc. to **NPU/CPU** explicitly during normal ops; flip to GPU only in maintenance windows.
> - **Health gates**: your heartbeat service should refuse to start any GPU job if `nvidia-smi` shows non-Ollama VRAM > X MB.
> 
> # Sanity check for your 7.4 GB target
> - Stick to **7–8B Q4** models, `num_ctx≤1536`, `batch=1`, and you’ll stay under budget.
> - Don’t run browser + games + compositor tweaks that spike VRAM when you need low latency (WSL/Wayland compositors can cost you a few hundred MB).
> 
> If you want, tell me the exact GPU model and I’ll give you **tighter `num_ctx`/`batch` caps** per specific model (Qwen2.5-Coder-7B, Mistral-7B, Llama-3.1-8B) so it never crosses 7.4 GB even under burst. 
> 
> #gpu-ops #ollama #local-first #no-footguns
<!-- UID: 4abd729a-6192-4a5d-b699-4dc20bc98cb3 -->

---




>[!nexus_user] **User** - 09/01/2025 at 4:04 PM
> We have a vllm image, but my understanding is that is good for large batches?
<!-- UID: 4ba5b3e3-a9a3-4761-98e8-683ee09b9969 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 4:04 PM
> Yeah, that’s your read: **vLLM is designed for throughput, not latency.** 
> 
> ### What vLLM is good at
> - **Large batch serving**: it shines when you’ve got dozens or hundreds of concurrent requests. That’s why big inference services (API-style) love it. 
> - **PagedAttention**: its memory manager is efficient with big context windows and large workloads. 
> - **High GPU utilization**: you’ll get way more tokens/sec when the GPU is always busy. 
> 
> ### What it’s *not* good at
> - **Single-shot autocomplete**: 
>  - Autocomplete wants *lowest latency per keystroke*, not highest throughput across users. 
>  - With vLLM, the scheduling overhead + batching logic = wasted time when you’re only sending tiny prompts one at a time. 
> - **Small VRAM setups (7–8 GB)**: vLLM assumes datacenter GPUs with large memory footprints. It can run quantized models, but its sweet spot is big cards (A100, H100, etc.) where you can pack multiple 7B–70B models and serve them to many users. 
> 
> ### What to use instead for autocomplete
> - **Ollama / llama.cpp**: tuned for *single-request interactive use*. Less throughput, but faster *time-to-first-token* on a desktop card. 
> - **Quantized 7B–8B** models (Q4\_K\_M), like we talked about, fit your 7.4 GB ceiling and deliver usable latency. 
> 
> ---
> 
> 👉 If you wanted vLLM in your stack, it’d be for **batch jobs** (e.g., embedding whole corpora, reranking, multi-doc QA), not for your **Emacs/Spacemacs autocomplete** loop. 
> 
> Do you want me to sketch a split-pipeline design where **Ollama handles live autocomplete** and **vLLM handles heavy batch inference jobs** without stepping on each other’s GPU toes?
<!-- UID: 0eb15512-1a7b-4fb3-a7fb-61c73b0dbdcc -->

---




>[!nexus_user] **User** - 09/01/2025 at 4:04 PM
> how about code completion from an NPU process?
<!-- UID: f08e0103-1f61-45a6-880a-fcc548ec83fa -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 4:05 PM
> Short answer: **yes, you can** do editor autocomplete on the **Intel NPU**, but only with **small INT4 OpenVINO models (≈2–4B params)**, and you should expect **higher latency** than a 7–8B on GPU. It *will* free the GPU and avoid contention, which sounds like what you want.
> 
> # What’s actually supported (today)
> - **OpenVINO GenAI + NPU** now supports **text generation** (LLMs) on Intel Core Ultra NPUs. It’s explicitly positioned for **AI-PC, low-concurrency** use and exposes **OpenAI-style `/completions` / `/chat/completions`** APIs via **OpenVINO Model Server (OVMS)**. Batching is **off** on NPU (sequential requests), which fits editor autocomplete. cite
> - **llama.cpp / Ollama** do **not** target NPUs; if they “work,” it’s CPU/iGPU, not the NPU cores. Use OpenVINO for NPU. cite
> 
> # What models to use on NPU (autocomplete-friendly)
> - **Phi-3.5-mini-instruct INT4 (OpenVINO IR)** — tiny, fast-ish on NPU, good for short next-token hints. cite
> - **Qwen-2.5-3B-Instruct INT8/INT4 (OpenVINO IR)** — stronger reasoning than Phi-mini, still light enough for NPU. (There are ready IR drops; or export yourself with Optimum-Intel.) cite
> 
> > Reality check: 7–8B on NPU is not where the stack is strong yet. Stick to **2–4B INT4** for snappy-ish UX. For heavy lifts, keep a 7–8B Q4 on GPU via Ollama and only query it when needed.
> 
> # Minimal pipeline that won’t fight your GPU
> 1) **Convert/export to OpenVINO IR (INT4)** 
> Use Optimum-Intel to export Qwen-2.5-3B or Phi-3.5-mini to IR + quantize to INT4. cite
> 
> 2) **Serve on NPU with OVMS** (OpenAI-compatible API) 
> OVMS demo shows NPU text-gen serving; it **processes requests sequentially** (no batching), which is fine for editor autocomplete. cite
> 
> 3) **Point your editor client (gptel/ellama) at OVMS** 
> Because OVMS speaks **OpenAI-style endpoints**, you can point your Emacs client there and keep your GPU-backed Ollama separate. cite
> 
> # Concrete setup (high-level)
> 
> **A. Export model (example):** 
> Use Optimum-Intel to produce **INT4 OpenVINO IR** (Qwen-2.5-3B-Instruct):
> - `optimum-cli export openvino --model "Qwen/Qwen2.5-3B-Instruct" --task text-generation-with-past --weight-format int4 --group-size 128 --ratio 1.0 --trust-remote-code`
> This is straight from OpenVINO docs/tutorials. cite
> 
> **B. Run OVMS with NPU:** 
> Follow OVMS “text generation with NPU” guide. It exposes `/v1/completions` & `/v1/chat/completions` and targets **AI-PC NPU** with **no request batching**. Perfect for one-at-a-time editor calls. cite
> 
> **C. Editor settings (to keep latency acceptable on NPU)**
> - **Temperature** ≤ 0.2; **max_tokens** ~32–64 for inline.
> - **Context**: send **left context (~1–2 KB)** + **tiny right window (~100–200 tokens)**.
> - **Stop sequences**: language-aware (e.g., `\n\n`, `\n}`, `;`, etc.) to cut off rambling.
> - **Debounce**: trigger on 150–300 ms idle and delimiter characters.
> 
> # Hybrid that feels good
> - **Primary (NPU)**: Phi-3.5-mini or Qwen-2.5-3B on OVMS/NPU for instant suggestions and to **keep GPU idle**. 
> - **Escalate (GPU)**: only when confidence is low or snippet is complex, call **Ollama 7–8B Q4** (GPU) with small `num_ctx` to stay under your 7.4 GB VRAM cap.
> 
> This keeps **autocomplete responsive** and your **GPU uncontested** for other jobs. OpenVINO’s release notes explicitly call out NPU text-gen support and target exactly this low-concurrency scenario. cite
> 
> # Caveats (no sugar-coating)
> - **Latency**: NPU token-rate is **slower than GPU**; it’s fine for 10–40 token bursts, not for 200-token rambles. cite
> - **Stability/coverage**: NPU support is **new**. Expect occasional driver quirks; follow Intel’s NPU device guidance. cite
> - **No batching** on NPU: great for you, bad for multi-user throughput. cite
> 
> If you want, I’ll sketch the exact **OVMS Docker run + Emacs gptel config** that points to `http://localhost:8008/v1` on NPU, plus a tiny **router** that falls back to Ollama only on “hard” completions. 
> 
> #local-first #NPU #openvino #autocomplete
<!-- UID: 33b1ad35-996b-4680-8a26-e05bb611dd3d -->

---


