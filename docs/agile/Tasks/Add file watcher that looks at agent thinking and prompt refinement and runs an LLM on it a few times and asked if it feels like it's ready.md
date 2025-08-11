# 🛠️ Description

Create a **file‑watcher service** that monitors project folders for:

* `#agent-thinking` notes (intent discovery)
* `#prompt-refinement` notes (solution sketch / integration outline)

When changes are detected, the service runs **multi‑pass LLM evaluations** (via Ollama) that:

1. Classify **readiness** for each note type.
2. Produce a **breakdown assessment** (size/complexity, coupling, potential parallelization).
3. Suggest **next actions** (promote to task, request clarifications, or split into subtasks).

Outputs are written back alongside the note (front‑matter + comment block), and optionally published to the **kanban** (create/update card + labels) and the **queue** (enqueue follow‑ups).

---

# 🎯 Goals

* Automate “readiness checks” so ideas flow from raw thought → actionable tasks with minimal friction.
* Keep **agent‑thinking** focused on **clear intent**.
* Keep **prompt‑refinement** focused on **connection to systems + a workable outline**.
* Standardize **breakdown heuristics** (too big? need split? can run in parallel?).
* Integrate with **Ollama** as the formal LLM engine for all passes.

---

# 📦 Requirements

* [ ] **Watcher** monitors configured paths; debounced on save; ignores noise (e.g., `node_modules`, cache, temp).
* [ ] Detect note type via **front‑matter tags** or heading markers (e.g., `#agent-thinking`, `#prompt-refinement`).
* [ ] **Prompt suite** with three passes: *Readiness*, *Breakdown*, *Next‑Actions*.
* [ ] **Policy checks**: forbid leaking secrets; flag risky ops; respect permissions (Circuit‑2 boundary).
* [ ] **Result persistence**:

  * Update note **front‑matter**: `readiness.status`, `readiness.score`, `breakdown.size`, `parallelizable`, `risk.level`.
  * Append **AI‑review** section with summaries & rationale.
  * Sync to **kanban**: status/labels and create or update card link.
* [ ] **CLI** + **daemon** modes; dry‑run flag.
* [ ] **Metrics/logs**: counts, latencies, pass/fail, FP hints.
* [ ] Config via `yaml/json`; hot‑reload.

---

# ✅ Acceptance Criteria

* **Agent Thinking (readiness=true)** when:

  * `intent.statement` present and unambiguous (<= 1 sentence primary intent).
  * `scope.boundary` captured (what’s explicitly out of scope).
  * `signals.why-now` captured (trigger/context).
  * Readiness score ≥ **0.8**.

* **Prompt Refinement (readiness=true)** when:

  * Contains a **system connection outline** (inputs, outputs, dependencies, side‑effects).
  * At least **one viable path** to implementation with 3–7 concrete steps.
  * Integration touchpoints identified (services, queues, permissions).
  * Readiness score ≥ **0.75**.

* **Breakdown** marks **too-big** when any of:

  * Estimated effort > **3 days** or involves > **2 independent services** *and* heavy coordination.
  * Coupling score > **0.7** to unrelated epics.
  * Critical unknowns ≥ **2**.

* When **too‑big**, the tool proposes **2–4 subtasks** with clear ownership & parallelization flags.

---

# 📋 Subtasks

* [ ] **Config & Watcher**

  * File globs, ignored paths, debounce, back‑off.
  * Tag detection strategy (front‑matter + in‑body tags).
* [ ] **Prompt Suite (Ollama)**

  * `pass/readiness`: classify + score + missing fields.
  * `pass/breakdown`: size, coupling, risks, parallelization.
  * `pass/next-actions`: subtasks, statuses, labels.
* [ ] **Persistence**

  * Front‑matter schema + in‑doc `AI-Review` block format.
  * Kanban integration (create/update card; labels: `needs-clarity`, `ready`, `split`, `blocked`).
* [ ] **CLI/Daemon**

  * `watch`, `scan-once`, `recheck`, `dry-run`, `--note <path>`.
* [ ] **Policy & Safety**

  * Secret redaction, permission checks, risky‑ops flagging.
* [ ] **Observability**

  * Structured logs; metrics export; dashboard hooks.

---

# 🧩 Data & Schemas

**Front‑matter fields (added/updated):**

```yaml
readiness:
  type: agent-thinking | prompt-refinement
  status: ready | needs-clarity | split | blocked
  score: 0.0-1.0
  rationale: "short justification"
breakdown:
  size: tiny | small | medium | large
  parallelizable: true | false
  dependencies: [ "service/x", "doc/y" ]
  risks:
    - id: R1
      level: low|med|high
      note: "summary"
next:
  actions:
    - title: "Subtask title"
      why: "value"
      effort: "S|M|L"
      parallel: true|false
```

**AI‑Review block (appended):**

```md
---
## AI-Review (auto)
### Readiness
- score: 0.82 — clear intent; missing explicit non-goals.

### Breakdown
- size: medium; coupling: low; parallel: true (split into ingest + api).

### Next Actions
1. Add non-goals.
2. Create task: implement ingest.
3. Create task: define API surface.
---
```

---

# 🔌 Integration Points

* **Ollama**: local model(s) for classification & drafting; model name from config; temperature ≤ 0.4 for determinism.
* **Kanban**: update YAML front‑matter in `agile/tasks/` and link card in `boards/kanban.md`.
* **Queue/Broker**: optional enqueue of follow‑up tasks with labels.

---

# 🧠 Prompt Snippets (concise)

**Pass: Readiness (agent‑thinking)**

```
System: You evaluate idea notes for intent clarity.
User: Note content + minimal metadata.
Assistant: Return JSON {intent, clarityScore, missing, decision}.
Decision in {ready, needs-clarity}.
```

**Pass: Readiness (prompt‑refinement)**

```
System: You evaluate solution outlines for system connectivity.
Return JSON {ioMap, steps[3..7], risks, score, decision}.
Decision in {ready, needs-clarity}.
```

**Pass: Breakdown**

```
System: Assess size, coupling, unknowns. Propose 2–4 subtasks with parallel flags.
Return JSON {size, coupling, unknowns, subtasks[]}.
```

---

# 🧪 Testing Strategy

* Golden‑notes fixtures for each state (clear/unclear, small/large).
* Snapshot tests on front‑matter mutations.
* E2E: save a note → watcher → LLM passes → kanban card update.

---

# 🧭 Non‑Goals (now)

* Perfect semantic dedup across the vault (basic similarity only).
* Heavyweight UI; start with in‑doc annotations + kanban labels.

---

# ⚠️ Risks & Mitigations

* **LLM drift** → Pin model/version; add regression tests.
* **Over‑automation** → human override tag `#manual-only`.
* **Write conflicts** → apply changes via front‑matter AST; retry with minimal diffs.

---

# 📈 Metrics

* Time from save → decision.
* % notes reaching ready on first pass.
* Avg subtasks per split; false‑split rate.

---

# 🔧 Config (example)

```yaml
watch:
  paths:
    - notes/**/**.md
  ignore:
    - "**/node_modules/**"
    - "**/.git/**"
detection:
  tag_keys: ["tags"]
  agent_tag: "agent-thinking"
  refine_tag: "prompt-refinement"
ollama:
  model: "qwen2.5:14b-instruct"
  temperature: 0.2
  max_tokens: 512
kanban:
  board_path: agile/boards/kanban.md
  tasks_dir: agile/tasks/
```

---

# 🔀 Flow Diagram

```mermaid
flowchart LR
  FW[File Watcher] -->|save| DET[Detect Type]
  DET -->|agent-thinking| P1[Pass: Readiness (intent)]
  DET -->|prompt-refinement| P2[Pass: Readiness (connections)]
  P1 --> BRK[Pass: Breakdown]
  P2 --> BRK
  BRK --> PERS[Persist: front-matter + AI-Review]
  PERS --> KB[Kanban Update]
  PERS --> Q[Queue (optional)]
```

---

tags: #framework-core #agent-thinking #prompt-refinement #ollama-integration #kanban #watcher #automation
