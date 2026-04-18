# The Fork Tax Business Model

A generalized framework for platform-oriented consulting relationships.

---

## Core Concept

**The Fork Tax** is the cost of branching from a shared reality.

In git, you pay the fork tax when multiple agents work the same tree and you must snapshot without clobbering concurrent work.
In business, the fork tax is the commitment required to branch a shared platform into a client-specific deployment.

You don't negotiate the fork tax. You **pay it** — or you stay on main.

---

## The Pattern

### What You're Selling

| Open Source | Proprietary |
|-------------|-------------|
| Individual tools, libraries, schemas | The integration that makes them breathe |
| Spec documents, data models | Deployment, ops, and domain-specific wiring |
| API contracts, reference implementations | Training data pipelines and SME workflows |
| Community-auditable components | The "how it all fits together" knowledge |

**Value anchor:** The platform, not your hours.

### The Five Layers (Generalized)

```
Layer 1: Public Interface (customer-facing, constrained access)
    ↓
Layer 2: Curation Layer (knowledge boundary management)
    ↓
Layer 3: Internal Knowledge (employee-facing, full corpus)
    ↓
Layer 4: Agent Layer (automation, coding agents, optional)
    ↓
Layer 5: Expert Review (human-in-the-loop, labeling, translation)
```

---

## Deal Structure Template

| Phase | What | When | Amount |
|-------|------|------|--------|
| **Phase 1: Blueprint** | Architecture doc, roadmap, working demo with pilot tenant. Covers time, inference, infra. | Now | `$MIN_COMMITMENT` |
| **Phase 2: Build** | Fixed scope: full MVP with pilot tenant (ingest, RAG, CMS, review, export) | After demo, when they say "we want this" | `$BUILD_RANGE` |
| **Phase 3: Deploy** | Per-client platform revenue share | Ongoing | `REVENUE_SHARE%` of tenant revenue |
| **Phase 4: Maintain** | Architecture, tuning, new features | Optional, after MVP | `$RETAINER_RANGE`/month |

### Parameters

| Parameter | FutureSight Values | General Range |
|-----------|-------------------|---------------|
| `MIN_COMMITMENT` | $10K | $5-25K |
| `BUILD_RANGE` | $60-120K | $40-200K |
| `REVENUE_SHARE` | 20-25% | 15-30% |
| `RETAINER_RANGE` | $4-8K | $3-15K |

---

## The Fork Tax (Phase 1)

The minimum commitment is **not a deposit** — it's the first deliverable.

### What It Covers
- Architecture documentation
- Working demo with pilot tenant
- Inference costs
- Infrastructure setup

### Why It Exists
1. **Filters tire-kickers** — If they won't invest to see a working system, they won't invest to build it.
2. **Signals value** — You anchor on the platform, not on time.
3. **Reduces risk** — They see the product before the big commitment.
4. **Creates alignment** — Both parties have skin in the game.

### The Sequence
1. Show the demo (working system, not slides)
2. Don't negotiate yet. Let them see it work.
3. Next conversation: "Here's what I built. If you want it to be yours, here's the structure."
4. Present open-source model as a *feature*: auditable, no vendor lock-in, community contributions

---

## Revenue Scenarios Template

| Scenario | Monthly to Client | Your Cut (`REVENUE_SHARE`) |
|----------|-------------------|---------------------------|
| 5 tenants at `$TIER_1`/month | `$TIER_1 * 5` | `REVENUE_SHARE%` of above |
| 10 tenants at `$TIER_2`/month | `$TIER_2 * 10` | `REVENUE_SHARE%` of above |
| 20 tenants at `$TIER_2`/month | `$TIER_2 * 20` | `REVENUE_SHARE%` of above |

### FutureSight Example
| Scenario | Monthly to FutureSight | Your cut (20-25%) |
|----------|----------------------|-------------------|
| 5 tenants at $3K/month | $15K | $3-3.75K/month |
| 10 tenants at $5K/month | $50K | $10-12.5K/month |
| 20 tenants at $5K/month | $100K | $20-25K/month |

---

## Market Benchmarks

| Service Type | Price Range |
|--------------|-------------|
| Senior independent AI consultants | $200-350/hr |
| Custom AI platform builds | $60-200K |
| Enterprise RAG platforms | $150-500K |
| SaaS knowledge management (Glean, Notion AI) | $10-30/seat/month |

**Your positioning:** `$TIER_1-$TIER_2`/tenant/month is competitive and defensible.

---

## Relationship Notes

### Preferred Arrangement
- Flexible structure
- Show product first, negotiate after
- Open source individual pieces, proprietary integration/deployment
- Revenue share creates ongoing alignment

### Red Flags
- Client has history of undervaluing technical contributors
- Unwilling to pay minimum commitment
- Wants to negotiate before seeing the product
- Treats your time as the primary value anchor

### Green Flags
- Understands platform value vs. hourly consulting
- Has client base ready for multi-tenant deployment
- Values open-source components as transparency/auditability
- Willing to commit to pilot before demanding full build

---

## Client Profile Template

| Detail | Value |
|--------|-------|
| Company name | |
| Website | |
| Founded | |
| Size | |
| Revenue | |
| Countries/regions | |
| Core founder(s) | |
| Positioning | |
| Partner status | |

### Services They Offer
- [ ] UX/UI design
- [ ] Web & software development
- [ ] Project management, QA & testing
- [ ] AI & custom integrations
- [ ] Other: ___________

### Industries They Serve
- [ ] Manufacturing & Engineering
- [ ] Defense & Security
- [ ] Science & Tech
- [ ] B2B & Enterprise
- [ ] Other: ___________

### Known Clients (anchor names)
1. 
2. 
3. 

### What They Need
- [ ] Multi-tenant platform
- [ ] Domain-aware knowledge management
- [ ] Auto translation
- [ ] Expert review workflow
- [ ] Fine-tuning pipeline
- [ ] Other: ___________

---

## The Integration Moat

**Why they can't just take the open-source pieces:**

1. **Wiring knowledge** — Which pieces connect where, with what configuration
2. **Domain adaptation** — The fine-tuning data, the SME workflows, the curation patterns
3. **Operational expertise** — Monitoring, maintenance, incident response
4. **Ecosystem fluency** — How the pieces evolve, what breaks when versions change

You're not selling software. You're selling **the ability to keep it running in their domain**.

---

## When to Apply This Model

### Good Fit
- Client is a consultancy or agency with multiple end-clients
- Client wants to offer "AI services" as a new capability
- Client has technical team but lacks AI/platform expertise
- Problem domain benefits from multi-tenant architecture

### Poor Fit
- Single-tenant, single-use application
- Client wants to own and operate everything themselves
- No ongoing revenue potential (one-and-done project)
- Client insists on work-for-hire IP transfer

---

## Summary

| Principle | Implication |
|-----------|-------------|
| Anchor on platform, not time | Minimum commitment, revenue share |
| Open source pieces, proprietary integration | Defensible moat, transparent components |
| Show first, negotiate after | Fork tax filters, demo convinces |
| Multi-tenant, multi-client | Scalable revenue, repeatable deployment |
| Ongoing relationship, not handoff | Retainer, maintenance, tuning |

**The fork tax is the commitment that proves they're ready to branch.**
