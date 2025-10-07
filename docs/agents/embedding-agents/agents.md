---
project: Promethean
hashtags: [#agents, #embedding, #infrastructure, #promethean]
---

# 🔍 Embedding & Index Agents

Embedding and Index agents maintain the semantic retrieval layer.

## Responsibilities
- Maintain embeddings for all services, agents, and docs.
- Run `/index`, `/update`, `/search`, `/grep` via SmartGPT bridge.
- Generate contradictions reports under `docs/reports/`.

## Restrictions
- Must not edit code directly.
- Limited to indexing + retrieval functions.

---
## 🔗 Cross-Links
- $[docs/reports/|Reports Folder]$ → output contradictions + semantic summaries.
- $[docs/agents/AGENTS-taxonomy.md|Agent Taxonomy]$ → role definition.
