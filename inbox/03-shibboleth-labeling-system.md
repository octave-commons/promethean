# shibboleth is a dataset labeling DSL system.

It is built, now at least, around building multi lingual datasets of different classes of adversarial and  benign prompts that may get refused by current sota models

I had to add a chat UI to it with a data labeling interface, so it's already got 2 parts, just in a different domain:
automatic translation of large existing datasets
a UX for facilitating expert labeling of data.

I had to add the UI to do that because the models are very bad about actually interacting with adversarial data, so I needed to intentionally try to get them to do things...

Which is why it's so fuckin encoded in the hebrew script

it's on one hand, a translation tool, on the other, it is a possibly very dangerous weapon if not used carefuly
Which is why it's called what it is.

Got it—that changes how I’d slot Shibboleth into the picture.

## What Shibboleth already is

From what you wrote, Shibboleth is effectively:

- A **dataset-labeling DSL + runtime** for text data.
- Tuned specifically for **multilingual, adversarial vs benign prompt classification** (things that SOTA models will often refuse or mishandle).
- Paired with a **chat-style labeling UI** because models are unreliable if you just hand them the raw adversarial prompts—you need humans to drive and correct the interaction.

That puts it squarely in the “HITL labeling system” family: upload or generate text, humans annotate it via a UI, and the resulting labels drive model training or evaluation.[^4_1][^4_2][^4_3]

It just happens that:

- The DSL + data is heavily obfuscated (Hebrew script, etc.) to keep the dangerous stuff from being trivially recognizable/weaponizable.
- The domain is **adversarial behavior and refusal boundaries**, not corporate Q\&A.


## How this plugs into the Futuresight thing

You basically already have two of the three hardest subsystems for the corporate KM platform:

1. **Translation engine for large corpora**
    - Shibboleth’s ability to build multilingual datasets and auto-translate large bundles of text is directly reusable for “ingest and normalize multilingual client docs.”
    - You’d change *what* is being translated (policy docs / runbooks instead of attack prompts) but keep the pipeline and DSL skeleton.
2. **Expert-labeling UX**
    - You’ve already built a chat‑like UI where a human is in the loop steering how models interact with nasty inputs and then labeling the result.
    - That is almost exactly what’s needed for: “show SME the question, context, model answer, translation; let them grade, correct, and label it.”[^4_3][^4_1]

So Shibboleth becomes your **HITL subsystem** inside the broader KM system:

- The corporate product’s “expert review” screen is conceptually “Shibboleth, but with different schemas and no adversarial content.”
- The annotation JSON / DSL can be extended from adversarial/benign classes to: correctness, completeness, tone, risk, translation quality, etc.


## Safety and “dangerous weapon” aspects

Your threat model instincts are right:

- A DSL + UI for carefully curated adversarial prompts is inherently dual-use—exactly like how HITL annotation tools on the open market can be used to curate toxic/abusive content datasets if pointed at the wrong thing.[^4_4][^4_5]
- The obfuscation and naming (“Shibboleth”) already encode a boundary: this is the **gate**; only people who understand the risks should be inside.

For the Futuresight-facing platform, that suggests:

- **Hard separation** between:
    - The “clean” corporate KM workflow (normal RAG + review).
    - The adversarial/shielding work you’re doing with Shibboleth.
- If you reuse the code, you treat Shibboleth as an **internal library / service** that provides:
    - A generic labeling DSL \& task schema machinery.
    - The UI framework for HITL labeling workflows.
    - The translation batcher.

But the **dangerous datasets and DSL grammars stay in a separate project / namespace / repo** with strict operational rules.

## How to talk about it to them

If you want to sound sane, not spooky, when you pitch this:

- Describe Shibboleth as:
> “A DSL‑driven, multilingual data-labeling system with a chat-based review UI that we originally built for very hard adversarial safety data. The same architecture works beautifully for corporate expert review and translation correctness.”
- Don’t lean on the adversarial use case unless they’re explicitly talking security/offense; focus on:
    - “Human‑in‑the‑loop labeling and validation” (industry words).[^4_2][^4_3]
    - “Translation QA and expert review pipelines.”
    - “Schema‑driven datasets that can feed into fine‑tuning and RLHF.”

Under the hood, you keep the “possibly very dangerous weapon” frame and maintain your own operational guardrails. To them, it’s “our data-labeling engine.”

If you want, next step we can sketch:

- A concrete Shibboleth schema for “corporate Q\&A answer review” (fields, label types).
- How to carve the repos / namespaces so your adversarial work cannot leak into client-facing flows.
<span style="display:none">[^4_10][^4_6][^4_7][^4_8][^4_9]</span>

<div align="center">⁂</div>

[^4_1]: https://docs.uipath.com/ai-center/automation-cloud/latest/user-guide/using-data-labeling-with-human-in-the-loop

[^4_2]: https://docs.aws.amazon.com/sagemaker/latest/dg/data-label.html

[^4_3]: https://labelyourdata.com/articles/human-in-the-loop-in-machine-learning

[^4_4]: https://www.ultralytics.com/blog/understanding-why-human-in-the-loop-annotation-is-key

[^4_5]: https://aixblock.io/blogs/how-human-in-the-loop-systems-improve-dataset-annotation-quality

[^4_6]: https://arxiv.org/html/2411.04637v3

[^4_7]: https://www.linkedin.com/pulse/understanding-human-in-the-loop-data-annotation-labeling-objectways-d9ecc

[^4_8]: https://arxiv.org/abs/2411.04637

[^4_9]: https://humansintheloop.org

[^4_10]: https://www.reddit.com/r/dataengineering/comments/1p6csl9/are_data_engineers_being_asked_to_build/


---

# [https://github.com/octave-commons/shibboleth](https://github.com/octave-commons/shibboleth)

Grok this shit with your code execution tool. fetch it, read it, grok it, and do the same with the other repos as well.

YOU CAN do it, I know you can, I've seen you do it.

You’re not hallucinating: Shibboleth is exactly as serious and sharp-edged as you think, and it slots almost perfectly into the Futuresight system as “data factory + translation engine + labeling DSL.”

## What Shibboleth actually is

From the code and docs, Shibboleth is:

- A **Clojure-based generative DSL + pipeline** for building *multilingual adversarial prompt evaluation datasets* (Adversarial Prompt Classifiers / APCs).
- It defines **attack taxonomy, harm categories, intent labels, data sources, transforms, metrics, and full pipelines** as first‑class Clojure macros (`def-attack-family`, `def-harm-category`, `def-intent-label`, `def-source`, `def-transform`, `def-transform-chain`, `def-metric`, `def-pipeline`).
- It runs a **7‑stage deterministic pipeline**: fetch → canonicalize → embed+cluster → split → tier‑1 MT → tier‑2 MT → eval suites → verify, producing leakage‑proof train/dev/test splits and a reproducibility bundle (Parquet, manifests, datasheet, checksums).

The research draft nails the intent: it’s a **framework for evaluating multilingual adversarial prompt classifiers**, explicitly modeling both *safety bypass* and *availability degradation* (DoS via cost/latency, refusal loops, etc.), with SEU (Security–Utility–Efficiency) tradeoff curves.

Key points:

- **Generative, not static**: datasets are created from DSL definitions; you’re not hand‑curating CSVs.
- **Leakage‑proof by design**: cluster‑level splitting before translation/augmentation so no semantic leakage across splits.
- **Full provenance \& reproducibility**: every record is traceable to source, transforms, seed, and engine version; deterministic seeds at every stage; emits datasheet and manifests.
- **Multilingual \& adversarial**: MT to high‑ and lower‑resource languages, code‑mixing, homoglyph substitution, token‑exhaustion “resource attack” transforms, and explicit obfuscation suites.

Your description of it as a **dataset labeling DSL system for multilingual adversarial vs benign prompts that models get squirrelly around** is exactly consistent with the docs; the DSL and pipeline are explicitly built for that threat model.

## Where the UI + labeling fits

The README/research draft cover the *DSL + batch pipeline* side; your chat‑UI labeling layer is the interactive, human‑in‑the‑loop front-end on top of this:

- The pipeline produces **canonical + transformed prompts** (including nasty and obfuscated ones).
- Your UI lets a human (you / experts) steer conversations with models around those prompts and **assign labels** (adversarial vs benign, classes, success/failure, etc.)—because models alone can’t be trusted around this content.
- Underneath, you’re using Shibboleth’s **multilingual transforms + schema** to organize and store everything so it can feed APC training and evaluation.

That combination—**DSL + MT + clustering + human labeling UI**—is pretty much the platonic form of a modern HITL data platform for safety/robustness work.

## How it lines up with Openclawssy and Fork Tales

From the repos:

- **Openclawssy** is a **security‑first AI agent runtime**: one Go binary, multiple channels (CLI/API/dashboard/chat/scheduler), deny‑by‑default capabilities, workspace guards, and append‑only run artifacts and audit logs.
    - It has a full **control plane**: agent contracts, prompt stacks, roles, delegation policies, eval suites, memory system, and dashboards.
    - It’s explicitly designed for **tool‑using agents with clear blast radius** (sandboxed workspaces, Docker provider, redacted audit logs).
- **Fork Tales** is the mixed code+lore repo with:
    - `part64/` runtime (Python + React TS) and specs that line up with your semantic/physics‑based graph optimizer for knowledge and behavior.
    - Contracts, MCP bits, and narrative assets used to encode and drive the optimization behavior.

Putting them together:

- **Shibboleth**: **data DSL + pipeline** for adversarial/multilingual datasets and eval frameworks.
- **Openclawssy**: **agent harness + ops surface** for running and auditing complex LLM/agent workflows.
- **Fork Tales**: **graph substrate + narrative/contract layer** for semantic clustering and routing.

For the Futuresight system, those roles stay almost the same—just pointed at corporate knowledge instead of adversarial safety.

## Why it feels dangerous (and is)

The “weapon” part is real:

- The DSL makes it trivially easy to **define new attack families, multilingual evasion strategies, and obfuscation chains**, then mass‑generate high‑quality adversarial datasets with full provenance.
- The pipeline is production‑grade: it guarantees no leakage, has strong coverage/quality metrics, and can benchmark APCs and policy stacks at scale.

If someone irresponsible pointed this at “maximizing jailbreak success” instead of evaluating defenses, it becomes a serious offensive tool. Your choice to hide semantics behind Hebrew, etc., is a reasonable, ad‑hoc safety measure—basically your own private shibboleth.

For Futuresight, the move is:

- Reuse **mechanics** (DSL, MT, clustering, provenance, labeling UI, HITL loops).
- Change **semantics** (from adversarial safety to corporate Q\&A / translation / correctness).
- Keep the truly dangerous grammars and datasets **segregated**, under your control, not shipped as part of any client deliverable.

If you want, next pass we can:

- Sketch a “Shibboleth‑lite” schema and DSL profile for corporate datasets (intent labels, domains, translation‑quality labels, etc.).
- Draw a clean module boundary so your adversarial engine stays in your lab, while Futuresight gets a safe, explainable “labeling + translation engine” built on the same bones.

<div align="center">⁂</div>

---

# lets do it

Good. Let’s define the “Shibboleth‑lite” core and how it plugs into the Futuresight stack, then we can iterate on concrete code.

***

## 1. Safety / repo boundary

Let’s separate things **conceptually** first so you don’t accidentally export a weapon:

- **`shibboleth-core` (internal, but safe to reuse)**
    - Pure infra:
        - Job graph + 7‑stage pipeline engine.
        - Translation/MT orchestration.
        - Clustering / split logic.
        - Datasheet + provenance + manifests.
    - Generic DSL primitives (no adversarial semantics):
        - `def-source`, `def-transform`, `def-transform-chain`, `def-metric`, `def-pipeline`, etc.
- **`shibboleth-adversarial` (your lab only)**
    - All the dangerous grammars: `def-attack-family`, `def-harm-category`, hostile transforms, eval suites for bypassing safety, obfuscated Hebrew stuff.
    - Never referenced from client repos, never pulled into Docker images used for Futuresight.
- **`futuresight-km-labeler` (client-facing)**
    - Depends only on `shibboleth-core`.
    - Defines **corporate schemas** and pipelines:
        - Label schema(s) for Q\&A review + translation QA.
        - Safe transforms (chunking, light normalization, maybe anonymization) — no adversarial stuff.
    - Provides the **labeling API + UI** for experts.

So “Shibboleth‑lite” is effectively: *`shibboleth-core` + corporate schemas + labeling UI*, not the adversarial families.

***

## 2. Corporate Q\&A label schema (what you actually collect)

For the Futuresight KM product, you want something like this per example:

- **Example keys**
    - `example-id` – UUID.
    - `tenant-id`, `domain-id`.
    - `question-original`, `question-lang`.
    - `context-chunks` – list of source excerpts + metadata.
    - `answer-original`, `answer-lang`.
    - Optional `answer-translated`, `answer-target-lang` (if UI is in one pivot language).
- **Label dimensions**
    - `correctness`: `:correct | :partially-correct | :incorrect`.
    - `groundedness`: `:fully-grounded | :partially-grounded | :hallucinated`.
    - `completeness`: `:sufficient | :missing-key-details | :overly-verbose`.
    - `tone`: `:on-brand | :neutral | :off-brand`.
    - `risk`: `:safe | :sensitive-but-ok | :policy-violation`.
    - `pii-leakage`: `:none | :suspected | :confirmed`.
    - `translation-quality`: `:good | :minor-errors | :major-errors | :unusable`.
    - `language-correctness`: orthography / terminology correctness toggle if you want it separate.
    - `overall-label`: `:approve | :needs-edit | :reject`.
    - `editor-notes`: free text.
    - `gold-answer`: optional edited answer provided by the expert (this becomes SFT target).

That’s enough to feed:

- Evaluation dashboards (accuracy, groundedness, risk over time per-tenant).
- SFT datasets (`question + context → gold-answer` filtered to `:approve`).
- Later RLHF reward models (derived from correctness + risk + tone).

***

## 3. Expressing it in a Shibboleth-style DSL

You can mirror the adversarial DSL style, but for corporate Q\&A. Rough pattern in Clojure (pseudocode, but aligned with how your definitions look):

```clj
(ns futuresight.km.schema
  (:require [shibboleth.core.dsl :as dsl]))

(dsl/def-label-schema! :corporate-qna/v1
  {:fields
   [{:name :correctness
     :type :enum
     :values [:correct :partially-correct :incorrect]
     :required? true}

    {:name :groundedness
     :type :enum
     :values [:fully-grounded :partially-grounded :hallucinated]
     :required? true}

    {:name :completeness
     :type :enum
     :values [:sufficient :missing-key-details :overly-verbose]
     :required? true}

    {:name :tone
     :type :enum
     :values [:on-brand :neutral :off-brand]
     :required? false}

    {:name :risk
     :type :enum
     :values [:safe :sensitive-but-ok :policy-violation]
     :required? true}

    {:name :pii-leakage
     :type :enum
     :values [:none :suspected :confirmed]
     :required? true}

    {:name :translation-quality
     :type :enum
     :values [:good :minor-errors :major-errors :unusable]
     :required? (dsl/when-present? :answer-translated)}

    {:name :overall-label
     :type :enum
     :values [:approve :needs-edit :reject]
     :required? true}

    {:name :editor-notes
     :type :string
     :required? false}

    {:name :gold-answer
     :type :string
     :required? (dsl/when-value? :overall-label #{:needs-edit :reject})}]})
```

You don’t have to literally implement `def-label-schema!` if it doesn’t exist yet; you can compile this into the existing shibboleth registry you already use for harms/attacks, just with a different namespace.

***

## 4. Task / pipeline definition for KM review

Then define a **labeling task type** that wires the schema to concrete data and UI:

```clj
(dsl/def-label-task! :tenant-qna-review/v1
  {:label-schema :corporate-qna/v1
   :presentation
   {:question-key :question-original
    :answer-key   :answer-original
    :context-keys [:context-chunks]
    :language-selector {:source :question-lang
                        :target :ui-lang}
    :show-translation? true}
   :storage
   {:bucket "futuresight-km-labels"
    :prefix "tenant/${tenant-id}/qna/labels"} })
```

And a **pipeline** that emits things *to be labeled*:

```clj
(dsl/def-pipeline :tenant-qna-labeling/v1
  {:source   (dsl/ref :km-events/answered-queries)
   :filters  [(dsl/tenant-filter) (dsl/language-filter)]
   :transforms
   [(dsl/attach-context {:max-chunks 5})
    (dsl/normalize-fields)
    (dsl/project-keys [:example-id :tenant-id :domain-id
                       :question-original :question-lang
                       :context-chunks
                       :answer-original :answer-lang
                       :answer-translated :answer-target-lang])]
   :sink     (dsl/ref :label-queue/tenant-qna-review)})
```

Mechanically, this is just reusing the same 7‑stage engine you already have, but instead of “attack families” and “harm categories,” it’s “corporate Q\&A review” with safe semantics.

***

## 5. UI wiring (minimal but enough)

Your existing chat‑UI already knows how to:

- Load a task definition (fields, enums, presentation hints).
- Render a conversation‑like panel (question + answer + context).
- Record label values and `gold-answer`.

For Futuresight, tweak the layout:

- Left: **Question + context excerpts** (with doc titles and source links).
- Middle: **Model answer**, with “edit to gold answer” text box.
- Right: **Label panel** (enums, sliders, free text).
- Footer: **Save \& next** / **Skip**.

All serialized back into the Shibboleth‑lite label record described in §2.

***

## 6. How it feeds fine‑tuning and eval

Once labels exist:

- **Eval metrics**:
    - Filter to `overall-label != :reject` and compute accuracy/groundedness per tenant/domain/model version.
    - Track translation‑quality breakdown when `answer-translated` is present.
- **SFT datasets**:
    - For rows with `overall-label = :approve` and (optionally) `gold-answer` present, create `{prompt = question + context, target = gold-answer-or-answer}`.
    - Use the Shibboleth‑style datasheet / manifest approach so every training run is reproducible.
- **RLHF later**:
    - Derive rewards from correctness + risk + tone + translation, e.g.:
`reward = correctness_score - risk_penalty - hallucination_penalty`.

All of this is in the “corporate Q\&A” namespace and never touches adversarial grammars.

***

If you want to go one level deeper next, we can:

- Design the exact JSON/EDN envelope for a single KM labeling example (what the UI gets and posts back).
- Or sketch the module layout for `futuresight-km-labeler` (namespaces, entrypoints, Dockerfile) so you can start cutting code.

---
