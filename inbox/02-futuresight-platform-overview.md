# fine tuning qwen 14b?

Yes—on AWS, fine-tuning Qwen 14B is realistic if you use LoRA or QLoRA, but it is much less attractive as a full-parameter fine-tune.  A practical starting point is a SageMaker `ml.g5.12xlarge`, which has 4 GPUs and 96 GB of total GPU memory at \$7.09 per hour, or about \$5,175.70 if you leave it running all month.[^2_1][^2_2]

## Practical setup

Qwen 2.5 includes a 14B size, and AWS has published deployment guidance for the Qwen 2.5 family on SageMaker and AWS AI chips.  A community hardware guide specifically notes that Qwen2.5 14B is well suited to 24 GB GPUs for LoRA and QLoRA, while full fine-tuning is a better fit for smaller models.[^2_3][^2_1]

That lines up well with `ml.g5.12xlarge`, because it gives you four GPUs and 96 GB of aggregate GPU memory, which is usually the kind of box people reach for when they want to fine-tune a 14B model with PEFT rather than train all weights.  For cost control, the main rule is simple: use short-lived training jobs and shut the instance down immediately after checkpoints are saved.[^2_2][^2_3][^2_1]

## Cost ranges

Here is the rough cost profile for a Qwen 14B PEFT run on `ml.g5.12xlarge` at \$7.09 per hour.[^2_2]


| Work pattern | Estimated compute cost |
| :-- | :-- |
| 6-hour tuning run | About \$42.54 [^2_2] |
| 12-hour tuning run | About \$85.08 [^2_2] |
| 24-hour tuning run | About \$170.16 [^2_2] |
| Left on for a full 30-day month | About \$5,175.70 [^2_2] |

Those numbers are only the training instance cost, so storage, checkpoints, logs, and any endpoint you keep alive afterward would add more.  If you run several experiments, the bill usually grows because hyperparameter search and retries matter more than the single best run.[^2_3][^2_2]

## Managed options

AWS also announced serverless model customization support for Qwen2.5 14B Instruct and Qwen3 14B, including supervised fine-tuning, DPO, and reinforcement fine-tuning, with usage-based billing.  That is attractive if you want less infrastructure management, but the public pricing material surfaced here does not show a clearly posted standalone Qwen 14B customization rate the way it does for some other models and imported custom model units.[^2_4][^2_3]

If you want Bedrock-style imported hosting instead of SageMaker training, AWS lists Qwen under Custom Model Import at \$0.05718 per custom model unit per minute in us-east-1/us-west-2, plus \$1.95 monthly storage per custom model unit, but the exact number of units for a given imported model is determined during import.  That means imported serving can be convenient, but it is harder to estimate precisely for Qwen 14B ahead of time than a plain hourly SageMaker training job.[^2_4][^2_2]

## Recommendation

For Qwen 14B on AWS, the cheapest sane path is usually QLoRA or LoRA on a rented GPU box for a few hours, not an always-on monthly instance and not full fine-tuning.  As a planning number, I would treat the first serious experiment cycle as roughly tens to a few hundreds of dollars in compute, and treat “monthly cost” as high only if you leave training or serving infrastructure running continuously.[^2_1][^2_2]

Do you want a more exact estimate for your dataset size, such as 100k, 1M, or 10M training examples?
<span style="display:none">[^2_10][^2_11][^2_12][^2_13][^2_14][^2_15][^2_16][^2_17][^2_5][^2_6][^2_7][^2_8][^2_9]</span>

<div align="center">⁂</div>

[^2_1]: https://kaitchup.substack.com/p/qwen25-qlora-lora-and-full-fine-tuning

[^2_2]: https://www.reddit.com/r/LocalLLaMA/comments/1mxhkss/how_much_would_it_cost_to_run_something_like_qwen/

[^2_3]: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-sagemaker-ai-serverless-additional-models/

[^2_4]: https://wring.co/blog/aws-ai-training-costs-guide

[^2_5]: https://docs.aws.amazon.com/bedrock/latest/userguide/fine-tuning-openai-apis.html

[^2_6]: https://www.reddit.com/r/LocalLLaMA/comments/1rn90hh/fine_tuning_qwen3_35b_on_aws/

[^2_7]: https://www.westloop.io/post/amazon-sagemaker-ai-now-supports-serverless-reinforcement-fine-tuning-for-12-additional-models

[^2_8]: https://www.datacamp.com/tutorial/qwen-alibaba-cloud

[^2_9]: https://calculator.holori.com/aws/sagemaker/ml.g5.12xlarge

[^2_10]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-qwen.html

[^2_11]: https://apxml.com/models/qwen2-5-14b

[^2_12]: https://calculator.holori.com/aws/sagemaker/ml.g5.12xlarge-Notebook

[^2_13]: https://aws.amazon.com/blogs/machine-learning/how-to-run-qwen-2-5-on-aws-ai-chips-using-hugging-face-libraries/

[^2_14]: https://www.kaggle.com/code/ksmooi/fine-tuning-qwen-2-5-coder-14b-llm-sft-peft

[^2_15]: https://cloudprice.net/aws/ec2/instances/g5.12xlarge

[^2_16]: https://huggingface.co/blog/deepseek-r1-aws

[^2_17]: https://www.reddit.com/r/LocalLLaMA/comments/1gmerve/fine_tuning_models_like_qwen2514b_for_specific/


---

# aight man I need to calm the fuck down and plan:

futuresight is looking to contract me to build out a domain aware knowledge management system with auto tranlation of content and the capacity for expert review of the final outputs to facilitate fine tuning of a model for corperate clients.
they mentioned openclaw but I think these are better places to start
[https://github.com/mojomast/openclawssy](https://github.com/mojomast/openclawssy)
[https://github.com/octave-commons/shibboleth](https://github.com/octave-commons/shibboleth)
[https://github.com/octave-commons/fork_tales](https://github.com/octave-commons/fork_tales)
[https://github.com/shuv1337/fork_tales](https://github.com/shuv1337/fork_tales)

I'mma need you to grok the hell out of these and the core concept

I need prior arts, I need examples of other people doin this shit in the real world.
They've got a WIIIDE variety of clients in all sorts of domains.

Here’s a structured read on how to think about this Futuresight thing and where it fits in the real world. The detailed report attached to this answer goes deep into prior art, architecture, and how Openclawssy/Fork Tales slot in.

## 1. What you’re actually being asked to build

Boiled down: they’re asking for a **multi-tenant, domain-aware RAG platform** that:

- Ingests each client’s internal knowledge (docs, wikis, tickets, etc.), normalizes it, and makes it searchable.[^3_1][^3_2]
- Handles **multilingual content** end‑to‑end (ingestion, retrieval, answers) via automatic translation.[^3_3][^3_1]
- Wraps that in an **expert-review UI** where SMEs score and correct answers so their corrections become training data for fine‑tuning / RLHF.[^3_4][^3_5]

That’s not just “a chatbot”; it’s closer to an **AI knowledge infrastructure product** that can be cloned per client.

## 2. How your existing pieces map

- **Openclawssy**: secure, single-binary AI harness with strict capability gating, HTTP/Discord triggers, and artifact-first runs. It’s a disciplined control plane around agents and jobs (ingestion, evals, tuning).[^3_6][^3_7]
- **Fork Tales**: physics-inspired semantic graph optimizer for knowledge graphs, designed to cluster, compact, and route over a graph using ACO-like particles and Datalog. That’s a great substrate for graph‑flavored RAG (GraphRAG) on top of vanilla vector search.[^3_2]
- **Shibboleth (your version)**: likely becomes the identity / boundary layer mapping SSO/SAML and tenant identities into “who can see what” inside the KB, mirroring how Shibboleth-based SAML IdPs wrap auth today.[^3_8][^3_9]

So: Openclawssy = **orchestrator + blast‑radius control**, Fork Tales = **semantic substrate**, Shibboleth‑ish = **tenant + auth boundary**.

## 3. Prior art: “other people doing this shit”

### 3.1 Enterprise RAG / Knowledge base platforms

- **AWS Bedrock Knowledge Bases**: fully managed RAG; AWS has explicit **multi-tenant patterns** (separate KB per tenant vs shared KB with `tenant_id` metadata and filtering).[^3_10][^3_11]
- **Generic enterprise RAG guides**: standard pattern of chunk → embed → vector store → retrieve → generate with citations; used for support, onboarding, compliance, R\&D, etc.[^3_12][^3_3][^3_1]

These validate the **core RAG engine** you’d build for each client.

### 3.2 Enterprise AI knowledge/search products

- **Glean**: “work AI” + enterprise search that builds an **enterprise knowledge graph** over docs, tickets, email, and more, then exposes AI search and assistants with strict permissioning and governance.[^3_13][^3_14][^3_15]
- **Notion AI + agents on top of Notion**: ingest a Notion workspace via API, chunk and embed pages, then serve a Slack/agent interface that answers from the wiki with citations and logs queries for continuous improvement.[^3_16][^3_17][^3_18]
- **RAGi / similar platforms**: position “enterprise internal knowledge base with RAG” as an out-of-the-box product, unifying scattered docs and letting employees query them in NL.[^3_19][^3_20][^3_21]

These are your “this is already a category” proof: searching across everything, permissions-aware, answer synthesis, multi-source.

### 3.3 Multi-tenant \& multi-domain patterns

- AWS and independent practitioners document **multi-tenant RAG** trade‑offs (per‑tenant KBs vs shared KBs, metadata filtering, separate KMS keys, different chunking/embedding models per tenant).[^3_11][^3_22][^3_10]
- There’s explicit work on **multi-domain RAG** with specialized KBs and AI agents that route questions to the right domain-specific base.[^3_23]

This is directly what you need for an agency with wildly different client domains.

### 3.4 Human‑in‑the‑loop and fine‑tuning

- HITL for LLMs is now standard: model pre‑labels, humans correct; active learning to label only the most important or uncertain examples; essential to get domain‑accurate models for medical, legal, finance, etc.[^3_24][^3_4]
- RLHF + HITL at enterprise scale: keep the model evolving via continuous human feedback instead of rare, huge retrains; reduces long‑term costs and keeps behavior aligned with changing business priorities.[^3_5]
- RAG evaluation workflows: Label Studio + RAGAS + LLM judges to grade RAG answers, then feed that data back into KB tuning and fine‑tuning.[^3_25][^3_26]

That’s the **expert-review loop** you’re being asked to institutionalize, not just “thumbs up/down”.

## 4. A mental model you can hang onto

When you feel yourself spiraling, anchor on this:

> “I’m building a **multi-tenant RAG + HITL fine‑tuning platform**.
> Each tenant gets its own knowledge base, retrieval config, and feedback loop.
> My unique leverage is **strict control planes (Openclawssy) + graph semantics (Fork Tales)**.”

Break it into legs:

1. **Ingest \& index**: adapt the standard enterprise RAG playbook (connectors → parsing → chunking → embeddings → vector DB).[^3_2][^3_1]
2. **Multi-tenant / multi-domain**: choose per‑tenant KBs as default (especially for regulated clients), and inside each tenant, optionally split by domain and connect them with Fork Tales.[^3_10][^3_11]
3. **Multilingual**: wire translation into ingest and answer paths with an explicit place for human review to rate and correct translations.[^3_4][^3_3][^3_1]
4. **Expert UI**: basic but solid web UI where SMEs see question, retrieved context, answer, translation, and can grade + correct. This is the main differentiator relative to pure search tools.[^3_25][^3_4]
5. **Training loop**: pipeline that turns graded examples into supervised fine‑tuning data, and later RLHF reward data, using the standard “HITL for LLMs / RLHF in enterprise” patterns.[^3_27][^3_5][^3_4]
6. **Harness \& governance**: use Openclawssy to run all of this inside a strict, auditable control plane and keep shell/network capabilities gated.[^3_7][^3_6]

You already have the right instincts with Fork Tales for GraphRAG-like behavior and with the “threat radar” / Sintel work for control and observability; this is just applying those muscles to corporate content.[^3_2]

## 5. Concrete first steps (to calm you down)

If you want a “do this next” list:

1. **Pick your reference architecture**: take the multi-tenant Bedrock KB pattern and the Glean/Notion AI mental model as your “this is the shape.”[^3_10][^3_16][^3_13]
2. **Define one pilot tenant**: small, low‑risk domain; list their sources (Confluence, Google Drive, tickets) and what languages they use.[^3_3][^3_12]
3. **Sketch the data model**: Tenants, Domains, Docs, Chunks, Embeddings, GraphNodes, Permissions, Interactions, Labels.
4. **Decide your isolation story**: per‑tenant indexes from day one; you can optimize later with metadata sharing if needed.[^3_22][^3_11][^3_10]
5. **Outer harness**: guarantee everything runs through Openclawssy; one mode per job type (ingest, evaluate, fine‑tune) so blast radius and logs are baked in.[^3_6][^3_7]

When you’re ready, we can zoom in on one slice (e.g., “expert review data model and pipeline” or “tenant isolation plan”) and design it like a system doc.

The full report attached goes deeper into architectures, examples, and phased rollout so you can treat it as a reference doc while you talk to FutureSight.
<span style="display:none">[^3_28][^3_29][^3_30][^3_31][^3_32][^3_33][^3_34][^3_35][^3_36][^3_37][^3_38][^3_39][^3_40][^3_41][^3_42][^3_43][^3_44][^3_45][^3_46][^3_47][^3_48][^3_49][^3_50][^3_51][^3_52][^3_53][^3_54][^3_55][^3_56][^3_57][^3_58][^3_59][^3_60][^3_61][^3_62][^3_63][^3_64][^3_65][^3_66][^3_67][^3_68][^3_69][^3_70][^3_71][^3_72][^3_73][^3_74][^3_75][^3_76][^3_77][^3_78]</span>

<div align="center">⁂</div>

[^3_1]: https://ussy.host/projects/openclawssy/

[^3_2]: https://aws.amazon.com/blogs/machine-learning/multi-tenant-rag-with-amazon-bedrock-knowledge-bases/

[^3_3]: https://neobram.ai/blog/rag-enterprise-knowledge-management

[^3_4]: https://smartdev.com/rag-implement-enterprise-kb-with-ai-qa/

[^3_5]: https://xenoss.io/blog/enterprise-knowledge-base-llm-rag-architecture

[^3_6]: https://keerok.tech/en/blog/enterprise-rag-building-an-ai-knowledge-base-in-2026/

[^3_7]: https://www.molt-pulse.com/agents/mojomast/openclawremoteussy

[^3_8]: https://dev.to/ryo_ariyama_b521d7133c493/multi-tenant-design-for-bedrock-knowledge-base-solving-the-account-limit-with-metadata-filtering-e6b

[^3_9]: https://blog.dataengineerthings.org/architecting-multi-tenant-rag-solution-the-one-vs-many-vector-database-dilemma-f52b7556cdba

[^3_10]: https://dev.to/torinmos/how-glean-leverages-hybrid-search-for-accurate-and-efficient-enterprise-ai-15jj

[^3_11]: https://www.glean.com/resources/guides/glean-ai-enterprise-search-knowledge-discovery

[^3_12]: https://www.gend.co/glean

[^3_13]: https://www.glean.com/blog/enterprise-ai-search-rag

[^3_14]: https://agentc2.ai/blog/notion-ai-agent-knowledge-base

[^3_15]: https://www.eesel.ai/blog/notion

[^3_16]: https://www.largitdata.com/en/use-cases/internal-knowledge/

[^3_17]: https://omnifact.ai/whitepapers/enterprise-rag-building-effective-ai-assistants

[^3_18]: https://www.annotera.ai/blog/human-in-the-loop-hitl-for-llm-fine-tuning-data/

[^3_19]: https://www.nextwealth.com/blog/rlhf-at-scale-building-enterprise-llms-with-human-in-the-loop-feedback/

[^3_20]: https://www.ninetwothree.co/blog/human-in-the-loop-for-llm-accuracy

[^3_21]: https://aws.amazon.com/blogs/machine-learning/evaluating-rag-applications-with-amazon-bedrock-knowledge-base-evaluation/

[^3_22]: https://www.youtube.com/watch?v=B7XbdC1JrWU

[^3_23]: https://www.linkedin.com/posts/lunguflorin_build-multi-domain-rag-systems-with-specialized-activity-7436996929626079232-iyfw

[^3_24]: https://github.com/collective/collective.shibboleth

[^3_25]: https://github.com/broadinstitute/shibboleth-service-provider

[^3_26]: https://logic2020.com/insight/enhancing-knowledge-base-interactions-with-rag-architecture/

[^3_27]: https://aws.amazon.com/blogs/machine-learning/scale-llm-fine-tuning-with-hugging-face-and-amazon-sagemaker-ai/

[^3_28]: https://fireworks.ai/blog/llm-fine-tuning

[^3_29]: https://github.com/octave-commons

[^3_30]: https://github.com/romangrothausmann/octave_scripts

[^3_31]: https://github.com/shuv1337

[^3_32]: https://github.com/rwl/octave-wasm

[^3_33]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow

[^3_34]: https://github.com/mojomast

[^3_35]: https://github.com/gnu-octave/octave_slides

[^3_36]: https://docs.github.com/en/rest/repos/forks

[^3_37]: https://github.com/openclaw/openclaw/blob/main/docs/index.md

[^3_38]: https://github.com/handnot2/samly_shibboleth

[^3_39]: https://github.com/gnu-octave/gnu-octave.github.io

[^3_40]: https://arxiv.org/html/2409.19894v2

[^3_41]: https://www.coursera.org/learn/retrieval-augmented-generation-rag

[^3_42]: https://www.glean.com/blog/enterprise-knowledge-management-guide

[^3_43]: https://www.notion.com/help/search

[^3_44]: https://www.stack-ai.com/blog/how-to-build-a-notion-knowledge-base-ai-agent

[^3_45]: https://www.youtube.com/watch?v=tFIgG-7RBvc

[^3_46]: https://aws.amazon.com/bedrock/pricing/

[^3_47]: https://wring.co/blog/aws-ai-training-costs-guide

[^3_48]: https://www.reddit.com/r/LocalLLaMA/comments/1mxhkss/how_much_would_it_cost_to_run_something_like_qwen/

[^3_49]: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-sagemaker-ai-serverless-additional-models/

[^3_50]: https://aws.amazon.com/sagemaker/ai/pricing/

[^3_51]: https://caylent.com/blog/amazon-bedrock-pricing-explained

[^3_52]: https://huggingface.co/docs/optimum-neuron/training_tutorials/qwen3-fine-tuning

[^3_53]: https://www.reddit.com/r/aws/comments/1e6exal/do_you_need_to_pay_every_hour_for_a_custom/

[^3_54]: https://www.getmaxim.ai/bifrost/llm-cost-calculator/provider/bedrock/model/qwen.qwen3-coder-next

[^3_55]: https://aws.amazon.com/blogs/aws/customize-models-in-amazon-bedrock-with-your-own-data-using-fine-tuning-and-continued-pre-training/

[^3_56]: https://docs.aws.amazon.com/bedrock/latest/userguide/rft-submit-job.html

[^3_57]: https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html

[^3_58]: https://www.cloudforecast.io/blog/aws-bedrock-pricing/

[^3_59]: https://www.cerebras.ai/pricing

[^3_60]: https://docs.aws.amazon.com/bedrock/latest/userguide/fine-tuning-openai-apis.html

[^3_61]: https://www.reddit.com/r/LocalLLaMA/comments/1rn90hh/fine_tuning_qwen3_35b_on_aws/

[^3_62]: https://www.westloop.io/post/amazon-sagemaker-ai-now-supports-serverless-reinforcement-fine-tuning-for-12-additional-models

[^3_63]: https://www.datacamp.com/tutorial/qwen-alibaba-cloud

[^3_64]: https://kaitchup.substack.com/p/qwen25-qlora-lora-and-full-fine-tuning

[^3_65]: https://calculator.holori.com/aws/sagemaker/ml.g5.12xlarge

[^3_66]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-qwen.html

[^3_67]: https://apxml.com/models/qwen2-5-14b

[^3_68]: https://calculator.holori.com/aws/sagemaker/ml.g5.12xlarge-Notebook

[^3_69]: https://aws.amazon.com/blogs/machine-learning/how-to-run-qwen-2-5-on-aws-ai-chips-using-hugging-face-libraries/

[^3_70]: https://www.kaggle.com/code/ksmooi/fine-tuning-qwen-2-5-coder-14b-llm-sft-peft

[^3_71]: https://cloudprice.net/aws/ec2/instances/g5.12xlarge

[^3_72]: https://huggingface.co/blog/deepseek-r1-aws

[^3_73]: https://www.reddit.com/r/LocalLLaMA/comments/1gmerve/fine_tuning_models_like_qwen2514b_for_specific/

[^3_74]: https://www.perplexity.ai/search/98f914ca-d271-4063-a403-36738b87b5e9

[^3_75]: https://www.perplexity.ai/search/0d1c0f87-8c4e-47e4-bf51-b7933c5a8928

[^3_76]: https://www.perplexity.ai/search/769261f4-1b35-41c2-8b3d-61d43b5413f3

[^3_77]: https://www.perplexity.ai/search/2d626d15-738e-431a-a059-0fbe0ab2baba

[^3_78]: https://www.perplexity.ai/search/dbc1574d-e2c4-4bc4-974a-af0500cec07a

