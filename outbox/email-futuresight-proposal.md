# Email to FutureSight — Knowledge Platform Proposal

**To:** FutureSight (via Calendly/direct contact)
**Subject:** What I built — a platform for your clients' AI infrastructure
**Attachment:** aaron-beavers-futuresight-kms-ats.md (resume)

---

Hi,

I've been building the foundation for this for two years — a data lake, a labeling pipeline, a multi-tenant search engine, and an internet-scale AI exposure scanner, all as open-source infrastructure. What I did this week was pull it all together into a coherent platform and spec the architecture for your use case. It solves a real problem for your clients — and opens multiple new revenue lines for FutureSight.

## What I built

A multi-tenant knowledge management platform. The short version:

- Your clients' internal knowledge (docs, wikis, specs, tickets) gets ingested, indexed, and made searchable with AI
- Content is auto-translated with expert review for quality control
- A CMS layer lets your clients curate what's public vs internal — their knowledge workers draft content with AI assistance, review it, publish it
- Everything runs per-tenant, so Teledyne's data never touches ITC's data
- Labeled review data flows back into fine-tuning pipelines, so the system gets smarter over time

It's not a chatbot. It's the infrastructure layer that sits between your clients' raw knowledge and the AI experiences you build for them on Optimizely.

## What's already working

I have working code — not a slide deck:

- **Data lake** with tiered vector search (fast recall + deep semantic search with result fusion)
- **Document lifecycle** — draft, review, publish, archive with visibility controls
- **Expert review interface** — 8-dimension labeling that feeds training data exports
- **Multi-tenant isolation** — retrieval-native access control, not just API filtering
- **Chat widget** — embeddable on any site, scoped to curated public knowledge only

I built this on top of infrastructure I've been developing as open-source projects for the past two years. Which brings me to how I want to structure this.

## The deal

I want to keep the individual components open source. Every tool, library, and pipeline stays publicly available — auditable, no vendor lock-in for your clients, community contributions over time.

What's commercial is the **integration**: wiring these pieces together for specific client domains, deploying them, maintaining the systems, and being the person who knows how it all works. That's the product. Not the code — the expertise.

Here's what I'm proposing:

**Phase 1 — Blueprint (2-3 weeks)**
Architecture doc, roadmap, risk model, and a working demo with one pilot tenant. This covers my time, inference costs, and infrastructure to get a real system running that you can evaluate. ~$10K.

**Phase 2 — Build (8-12 weeks)**
Fixed fee for the full MVP with one pilot tenant fully wired (ingest, RAG, CMS, review UI, translation, training data export). Let's scope this together once you've seen the demo.

**Phase 3 — Deploy**
Per-client platform revenue share (20-25%) as you roll this out to your existing clients. You own the client relationships. I own the infrastructure. Your Teledyne clients, ITC, e2v — they all become tenants on the same platform, each with their own domain, their own knowledge base, their own review workflows.

**Phase 4 — Maintain**
Optional monthly retainer for ongoing architecture, tuning, and new feature work. Something like 1 day/week.

## Why me

I've built every layer of this stack myself — the data lake, the search engine, the labeling pipeline, the multi-tenant control plane, the UI. I'm not hiring a team to figure it out. I am the team, and the architecture is done.

I'm also genuinely excited about what this means for your clients. A manufacturing company with 10,000 technical documents in 6 languages doesn't need a chatbot. They need the infrastructure layer I've built. That's what I can give you.

There's a second product in the same platform: an **exposure monitor** that scans the internet for exposed AI infrastructure (Ollama instances, OpenAI proxies, misconfigured endpoints), resolves the owners' contact information, and generates outreach queues for responsible disclosure. Your clients are probably deploying AI services right now — some of them are probably exposed without knowing it. This tool finds them.

Happy to jump on a call and show you both systems running. No slides, no mocks — the actual things.

Talk soon,
Aaron

515-388-0539
foamy125@gmail.com
https://github.com/riatzukiza
