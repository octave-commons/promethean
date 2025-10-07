---
project: Promethean
hashtags: [#agents, #taxonomy, #promethean]
---

# 🧩 Agent Taxonomy (Draft)

Promethean distinguishes **three major classes of agents**:

## 1. Developer Agents
- [docs/agents/pythagoras/AGENTS.md|Pythagoras] → Repo navigator & governance enforcer.
- [docs/agents/codex/agents.md|Codex] → Automation agent make/test/build.
- [docs/agents/codex-gui/AGENTS.md|Codex GUI] → Workflow + Kanban sync agent.

Governance doc: [docs/agents/developer/AGENTS.md]

---

## 2. Resident Cognitive Agents
- [docs/agents/duck/AGENTS.md|Duck] → WIP, embodied perception-action agent.
- Future residents TBD.

Governance doc: [docs/agents/residents/AGENTS.md]

---

## 3. Infrastructure & Support Agents
- [docs/agents/board-manager/AGENTS.md|Board Manager] → Kanban + Agile sync.
- [docs/agents/synthesis-agent/AGENTS.md|Synthesis-Agent] → Transforms raw thought → docs.
- [docs/agents/embedding-agents/AGENTS.md|Embedding / Index Agents] → Manage semantic search.

Governance doc: [docs/agents/infrastructure/AGENTS.md]

---

## 🌐 Graph

```mermaid
graph TD
  Root[Root AGENTS.md]

  subgraph Developer Agents
    Pythagoras[[docs/agents/pythagoras/AGENTS.md]]
    Codex[[docs/agents/codex/agents.md]]
    CodexGUI[[docs/agents/codex-gui/AGENTS.md]]
  end

  subgraph Resident Agents
    Duck[[docs/agents/duck/AGENTS.md]]
    FutureResidents[Future Residents]
  end

  subgraph Infrastructure Agents
    BoardManager[[docs/agents/board-manager/AGENTS.md]]
    SynthesisAgent[[docs/agents/synthesis-agent/AGENTS.md]]
    EmbeddingAgents[[docs/agents/embedding-agents/AGENTS.md]]
  end

  Root --> Developer Agents
  Root --> Resident Agents
  Root --> Infrastructure Agents
```

---

## ✅ Next Steps
- Flesh out governance docs for each agent.
- Add semantic cross-links to Agile boards, unique/, and reports.
- Draft contradictions reporting workflow under [docs/reports/].
