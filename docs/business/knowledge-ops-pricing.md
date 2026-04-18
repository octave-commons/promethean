# Knowledge Ops Platform — Pricing & Deal Structure

## The Product

A multi-tenant domain-aware knowledge management platform:
- Ingests client knowledge (docs, wikis, tickets)
- Auto-translates content
- Expert review UI for SME corrections
- Feeds labeled data back into fine-tuning pipeline
- Multi-layer: public assistant, CMS, knowledge worker, coding agent, SME review

## Open Source Business Model

**Open source** (individual tools):
- OpenPlanner — event lake, search, semantic compaction
- Shibboleth — labeling DSL, HITL UI
- @workspace/chat-ui — shared chat component library
- Document ingestion scripts
- Spec schemas, data models, API contracts

**Proprietary** (the integration):
- Wiring pieces together for specific client domains
- Deployment, monitoring, maintenance
- Tenant onboarding, training data pipelines
- The "how it all fits together" knowledge

The value is the integration, the ops, and the fact that you're the one who knows how it breathes. Nobody reverse-engineers a running system from 6 open-source repos.

## Deal Structure

| Phase | What | When | Amount |
|-------|------|------|--------|
| Phase 1: Blueprint | Architecture doc, roadmap, working demo with 1 pilot tenant. Covers time, inference, infra. | Now | ~$10K |
| Phase 2: Build | Fixed scope: full MVP with 1 pilot tenant (ingest, RAG, CMS, review, translation, export) | After demo, when they say "we want this" | $60-120K |
| Phase 3: Deploy | Per-client platform revenue share | Ongoing | 20-25% of per-tenant revenue |
| Phase 4: Maintain | Architecture, tuning, new features | Optional, after MVP | $4-8K/month (1-2 days/week) |

## Revenue Scenarios

| Scenario | Monthly to FutureSight | Your cut (20-25%) |
|----------|----------------------|-------------------|
| 5 tenants at $3K/month | $15K | $3-3.75K/month |
| 10 tenants at $5K/month | $50K | $10-12.5K/month |
| 20 tenants at $5K/month | $100K | $20-25K/month |

## Pitch Sequence

1. Show the demo (working system, not slides)
2. Don't negotiate yet. Let them see it work.
3. Next conversation: "Here's what I built. If you want it to be yours, here's the structure."
4. Present open-source model as a *feature*: auditable, no vendor lock-in, community contributions

## The $10K Phase 1

This is not a deposit — it's the first deliverable. It covers architecture, a working demo, inference costs, and infrastructure. If they won't invest $10K to see a working system, they won't invest $80K to build it. It filters tire-kickers and signals that you value your work.

## Market Context

- Senior independent AI consultants: $200-350/hr
- Custom AI platform builds: $60-200K
- Enterprise RAG platforms: $150-500K
- SaaS knowledge management (Glean, Notion AI): $10-30/seat/month
- Your platform at $3-5K/tenant/month is competitive and defensible
