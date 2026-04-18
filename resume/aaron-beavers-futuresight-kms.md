---
title: "Aaron Beavers — Resume (FutureSight / AI Knowledge Platform)"
---

# Aaron Beavers
AI Infrastructure Engineer (Knowledge Platforms · RAG · Multi-Tenant Systems)

West Des Moines, IA 50265 · 515-388-0539 · foamy125@gmail.com
GitHub: https://github.com/riatzukiza · Upwork: https://www.upwork.com/freelancers/~01d661364c3f86022f

## Summary
AI infrastructure engineer specializing in multi-tenant knowledge platforms: RAG pipelines, vector search, HITL labeling, and training data workflows. 10+ years building production systems pre-agentic-AI; now use agentic tooling to accelerate delivery while keeping changes verifiable. Designed and built the architecture for a domain-aware knowledge management platform spanning public-facing assistants, agent-aware CMS, and expert review workbenches—with tiered embedding strategies (nomic/qwen3) and semantic compaction over event lakes.

## Skills
- **AI/ML infrastructure**: RAG pipelines, vector search (ChromaDB, MongoDB Vector Search), tiered embedding strategies (nomic-embed-text, qwen3-embedding), semantic compaction, dual-tier RRF search, HITL labeling workflows
- **Knowledge platforms**: Multi-tenant data isolation, document lifecycle management (draft/review/public/archive), content curation CMS, training data export (SFT JSONL, RLHF preference pairs)
- **Full stack**: TypeScript/Node.js (Fastify), Python (FastAPI), React, Clojure
- **Data**: DuckDB, MongoDB 8.2 (with $vectorSearch), PostgreSQL, Qdrant, ChromaDB
- **DevOps**: Docker/Compose, Nginx, Prometheus/Grafana observability, multi-arch OCI builds
- **Security**: Multi-tenant isolation, PII detection/handling, audit trails, Bearer token auth, retrieval-native access control

## Recent Work (AI Knowledge Platforms)

### OpenPlanner — API-First Event Data Lake
*2025 – Present*
- Built a local-first event data lake with DuckDB for structured storage, ChromaDB for vector search, and content-addressed blob storage. Ingests events from ChatGPT exports, Discord, OpenCode sessions, and live social media firehose (Bluesky/AT Protocol).
- Implemented **dual-tier semantic memory**: hot collection (fast ingest, nomic/qwen3-0.6b embeddings) + compact collection (semantic packs built by compaction job, qwen3-8b embeddings) with RRF (reciprocal rank fusion) search merging across both tiers.
- Extended with **document-oriented endpoints** for the knowledge management platform: document CRUD, warm-tier embedding (qwen3-4b), chunked storage, and visibility-aware search (public/internal/review/archived).
- Added **per-source/kind embedding model resolution** with override precedence (project → source → kind → default), Prometheus metrics, Grafana dashboards, and Bearer token auth.
  https://github.com/riatzukiza/devel (services/openplanner/)

### Shibboleth — HITL Labeling DSL + Training Data Pipeline
*2024 – Present*
- Authored a generative Clojure DSL for building multilingual adversarial prompt evaluation datasets with deterministic seeds, full provenance, leakage-proof splits (sentence-transformers + HDBSCAN), and SHA-256 manifests.
- Extended with a **corporate QA labeling schema** (8 label dimensions: correctness, groundedness, completeness, tone, risk, PII leakage, translation quality, overall label) and a React-based expert review UI for human-in-the-loop data curation.
- Pipeline produces SFT datasets and RLHF preference pairs from labeled examples, with Shibboleth-style datasheets and reproducibility bundles.
  https://github.com/octave-commons/shibboleth

### Open Hax Proxy — Multi-Provider LLM Gateway
*2023 – Present*
- Built an OpenAI-compatible gateway integrating multiple LLM providers (OpenAI Responses, Anthropic Messages, Ollama) via model-aware routing, OAuth-based account ingestion, and rate-limit-aware rotation/fallback.
- Shipped a React/Vite console with Chroma-backed semantic session search, reasoning-trace preservation, and optional OTEL export.
  https://github.com/open-hax/proxx

### Futuresight KMS — Multi-Tenant Knowledge Management Platform
*2026*
- Designed a **five-layer architecture**: Public Assistant (chat widget) → Agent-Aware CMS (knowledge curation) → Knowledge Worker (internal RAG) → Coding Agent (dev tools) → SME Review (Shibboleth-powered labeling).
- Spec'd the **CMS boundary layer** with document visibility states (internal → review → public → archived), AI-assisted draft generation, and publish flow that syncs curated content to a public-facing vector collection.
- Defined multi-tenant control plane: tenant isolation, retrieval-native access control, per-tenant encryption, cascading offboarding.
- Designed **MongoDB Vector Search unification**: replacing DuckDB + ChromaDB with a single MongoDB 8.2 instance using $vectorSearch, $search, and $searchMeta with mongot sidecar.
- Built Zod/Pydantic label schemas, TypeScript API bridge clients, Python FastAPI label CRUD with SFT/RLHF export, and React knowledge labeler component.

### Prometheus / Grafana Observability Stack
*2025 – Present*
- Designed and deployed observability for the full data lake: Prometheus metrics (event ingest rate, search latency, compaction job duration, embedding queue depth), Grafana dashboards for data lake health, and alerting for pipeline failures.

## Experience

### Raft Technologies — Full Stack Engineer (Python/Django + React)
*Jul 2020 – Sep 2023*
- Built and maintained Celery-based pipelines for uploaded-file processing (parse → validate → summarize → report → notify) designed for safe failure modes and operational visibility.
- Integrated anti-malware scanning automation (ClamAV REST) using retry/backoff + timeouts with persisted outcomes for auditability; implemented robust file type + encoding detection.
- Supported end-to-end browser automation practices (Cypress E2E + CI execution) to prevent regressions.

### CloudApp — Full Stack Engineer (Ruby on Rails)
*Sep 2018 – Feb 2019*
- Integrated a proprietary OCR service into a screenshot platform; implemented interactive OCR UX (bounding boxes + click-to-extract text) and hardened key flows with automated tests.

### Additional Experience
1brand (Full Stack Engineer, 2019–2020) · Birdseed (Full Stack Engineer, 2019) · Freelance Software Engineer (2014–Present)

## Education
Valley Springs High School — Diploma (2012)

## Work Authorization
Authorized to work in the U.S. for any employer · Fully remote (U.S.) · Open to international contracting

```text
fnord:v1 proof=gh(open-hax/proxx octave-commons/shibboleth) caps=rag(dual-tier hot-warm-compact rrf fusion) embed(nomic qwen3-0.6b qwen3-4b qwen3-8b) hitl(8-dim-labeling sft-rlhf-export) lake(duckdb chromadb mongodb-vector-search mongot) cms(visibility-draft-publish-archive) multi-tenant(retrieval-native pii-detection audit-trail) ops(docker compose prometheus grafana fastify fastapi)
```
