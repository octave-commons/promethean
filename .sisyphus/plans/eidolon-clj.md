# eidolon-clj: ECS-Based Eidolon Field Simulation

## TL;DR

> **Quick Summary**: Build a Clojure ECS-based "eidolon field" simulation library using the Brute ECS library, ingesting tool-loop events from Cephalon as "memories" in an event-sourced architecture with deterministic replay.
>
> **Deliverables**:
> - `orgs/octave-commons/eidolon-clj/` - Complete Clojure library with ECS simulation core
> - Event-sourced core with append-only `events.ednlog` per session
> - ECS components (Memory, Nexus, Nooi, Daimo) following Gates of Aker patterns
> - Systems (ingestion, field physics, lifecycle) with deterministic tick loop
> - Ollama `/api/embeddings` integration for memory embeddings
> - Embedding prompt templates for semantic indexing
> - TDD test suite with >80% coverage for core modules
> - Cephalon integration hook to ingest `runtime/emit-agent-debug` events
>
> **Estimated Effort**: Large (ECS architecture + event sourcing + embeddings + integration)
> **Parallel Execution**: YES - 3 waves (infrastructure, core systems, integration)
> **Critical Path**: Project setup → Event contract → ECS components → Ingestion system → Field physics → Cephalon integration

---

## Context

### Original Request
Build `orgs/octave-commons/eidolon-clj`, a Clojure ECS-based simulation of an "Eidolon field" that ingests tool-loop events from `cephalon-clj` as "memories." The field should treat "systems as simulations" with a clock/heartbeat driving ticks, state derived from an event log (not a chat log), and index what the agent *saw/did* (tool calls + results + messages) rather than files/websites directly.

### Interview Summary
**Key Discussions**:
- **Keep it simple**: User confirmed minimal viable implementation approach for v0
- **Deployment model**: Library embedded inside `cephalon-clj-brain` (not standalone service)
- **Embedding provider**: Ollama `/api/embeddings` endpoint with direct API calls
- **Event storage**: File-based `events.ednlog` per session (append-only, no database)
- **Test strategy**: TDD with RED-GREEN-REFACTOR workflow (user confirmed)

**Technical Decisions**:
- Event-sourced core: Append-only per-session stream + deterministic replay drives ECS + field simulation (projection)
- Embedding persistence: Store as materialized events (`embedding/materialized`) for deterministic replay (do NOT recompute during replay)
- ECS pattern: Brute library with data-oriented functional style (following Gates of Aker)
- Field per session: `{session-id -> eidolon field stream + ECS world projection}`
- Facets model: Adopt Gates of Aker "facets/describers + traces/associations + event logs" mental model
- Test framework: `clojure.test` with `cognitect-labs/test-runner` (following gates-of-aker pattern)

### Research Findings
- **ECS patterns**: Gates of Aker provides canonical implementation (`brute/brute 0.4.0`, components as `defrecord`s, tick loop with `global-state` atom)
- **Facets-as-describers**: Gates of Aker `spatial_facets.clj` shows embedding similarity patterns for semantic associations
- **Event log contract**: `lineara_conversation_export/docs/events-and-replay.md` defines `events.ednlog` format with `cap/call + cap/return` patterns
- **Cephalon integration**: `cephalon-clj-brain/src/cephalon/brain/admin_ws.clj` emits `runtime/emit-agent-debug` events that can be hooked for memory ingestion
- **Test infrastructure**: Both Gates of Aker and Cephalon use `clojure.test` with deps.edn `:test` aliases, providing consistent patterns to follow

### Metis Review
**Identified Gaps** (addressed):
- **Embedding persistence**: Materialized events confirmed as correct approach for deterministic replay (Mitigation: store vectors in events, monitor disk space)
- **ECS complexity**: Risk of over-engineering identified (Mitigation: start with minimal components, follow Gates of Aker patterns but simplify for MVP)
- **Integration coordination**: Library deployment in `cephalon-clj-brain` requires clear API boundaries (Mitigation: define explicit interfaces in plan)
- **Scope creep**: v0 exclusions explicit (full KG, HNSW, cross-session physics) with guardrails to prevent over-building

**Guardrails Applied**:
- MUST NOT implement full knowledge-graph integration (v0 excluded)
- MUST NOT build advanced ANN/HNSW indexing (v0 excluded)
- MUST NOT implement cross-session global nexus physics (v0 excluded)
- MUST NOT use database for event storage (file-based only)
- MUST NOT recompute embeddings during replay (must use materialized events)
- MUST NOT create acceptance criteria requiring "user manually tests..." (all verification must be agent-executable)

**Directives for Implementation**:
- Follow Gates of Aker patterns for defrecord components, entity creation, tick pipeline, facet registry
- Use TDD RED-GREEN-REFACTOR workflow for every task
- All acceptance criteria must be executable commands with exact expected outputs
- Test naming: `*_test.clj` files, structure mirroring `src/` directory
- deps.edn `:test` alias with `:extra-paths ["test"]` following Gates of Aker pattern

---

## Work Objectives

### Core Objective
Build a Clojure ECS-based eidolon field simulation library that ingests Cephalon tool-loop events as memories, with event-sourced state for deterministic replay, embedding-based semantic indexing, and field physics driving memory association.

### Concrete Deliverables
1. **Project scaffold**: `orgs/octave-commons/eidolon-clj/` with deps.edn, source structure, test infrastructure
2. **Event contract**: Domain events (`memory/appended`, `embedding/materialized`, `nexus/upserted`, etc.) defined with EDN schema
3. **ECS components**: Memory, Nexus, Nooi, Daimo components as defrecord structs following Brute patterns
4. **Core systems**: Event ingestion system (applies events to ECS world), field physics system (vector field dynamics), lifecycle system (spawn/expire)
5. **Tick loop**: Deterministic heartbeat with system orchestration and global-state atom management
6. **Storage layer**: Append-only `events.ednlog` per session with read/write utilities
7. **Embedding integration**: Ollama `/api/embeddings` API client with Qwen3-Embedding model
8. **Prompt templates**: Embedding prompt generation with system state, persistent/recent memories, latest memory, categories
9. **Cephalon integration**: Hook into `runtime/emit-agent-debug` event emission in `cephalon-clj-brain`
10. **Test suite**: Comprehensive TDD tests with >80% coverage for core modules

### Definition of Done
- [ ] All tests pass (`clojure -X:test` returns "0 failures, 0 errors")
- [ ] Coverage report shows >80% for core modules (`clojure -X:coverage`)
- [ ] Ollama embedding endpoint responds successfully with test embedding vector
- [ ] Event log can be appended and replayed deterministically (same events → same ECS state)
- [ ] Cephalon integration emits `memory/appended` events when `runtime/emit-agent-debug` fires
- [ ] Embedding prompt template generates valid prompts with placeholders replaced
- [ ] Field physics system advances memories with vector field forces
- [ ] All code follows Gates of Aker ECS patterns (defrecord components, Brute entities, tick pipeline)

### Must Have
- Event-sourced core with append-only per-session stream
- Deterministic replay engine driving ECS simulation
- ECS components (Memory, Nexus, Nooi, Daimo) as Brute entities
- Field physics system with vector field dynamics
- Ollama `/api/embeddings` integration (Qwen3-Embedding model)
- File-based `events.ednlog` storage per session
- Embedding prompt templating with system state + memory context + categories
- Cephalon integration hook for tool-loop event ingestion
- TDD test suite with RED-GREEN-REFACTOR workflow
- Test infrastructure: `clojure.test` + `cognitect-labs/test-runner`

### Must NOT Have (Guardrails)
- ❌ Full knowledge-graph integration (v0 excluded)
- ❌ Advanced ANN/HNSW indexing (v0 excluded)
- ❌ Cross-session global nexus physics (v0 excluded)
- ❌ Database storage for events (file-based only: `events.ednlog`)
- ❌ Recomputing embeddings during replay (must use materialized events)
- ❌ Acceptance criteria requiring manual user verification (all must be agent-executable)
- ❌ Standalone service deployment (library embedded in cephalon-clj-brain only)
- ❌ OpenAI-compatible abstraction layer for embeddings (Ollama direct API only)

---

## Verification Strategy (MANDATORY)

> This section follows the TDD decision confirmed during interview.
> The choice here affects ALL TODO acceptance criteria.

### Test Decision
- **Infrastructure exists in ecosystem**: YES (gates-of-aker and cephalon-clj both have clojure.test + deps.edn aliases)
- **User wants tests**: YES (TDD - RED-GREEN-REFACTOR workflow)
- **Framework**: `clojure.test` (standard across ecosystem)
- **Test runner**: `cognitect-labs/test-runner` (following gates-of-aker pattern, v0.5.1)
- **Coverage**: `cloverage/cloverage` (v1.2.4, optional but recommended)
- **QA approach**: TDD with RED-GREEN-REFACTOR cycle for every task

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test file: `test/eidolon/ecs/components_test.clj` (mirrors `src/` structure)
   - Test command: `clojure -X:test`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `clojure -X:test`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `clojure -X:test`
   - Expected: PASS (still)

**Test Setup Task (infrastructure setup in plan):**
- [ ] 1. Setup Test Infrastructure
  - Install: Add `cognitect-labs/test-runner` to deps.edn
  - Config: Create `:test` alias with `:extra-paths ["test"]` and `:exec-fn cognitect.test-runner.api/test`
  - Verify: `clojure -X:test --help` → shows help output
  - Example: Create `test/eidolon/core_test.clj` with simple test
  - Verify: `clojure -X:test` → 1 test passes

### If Automated Verification Only (NO User Intervention)

> **CRITICAL PRINCIPLE: ZERO USER INTERVENTION**
>
> **NEVER** create acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - "Ask user to verify..." / "사용자에게 확인 요청..."
> - ANY step that requires a human to perform an action
>
> **ALL verification MUST be automated and executable by the agent.**
> If a verification cannot be automated, find an automated alternative or explicitly note it as a known limitation.

Each TODO includes EXECUTABLE verification procedures that agents can run directly:

**By Deliverable Type:**

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **ECS Components** | clojure.test + Bash | Agent runs `clojure -X:test` with specific test namespace |
| **Event Log** | Bash file operations | Agent appends events, reads back, validates EDN parsing |
| **Ollama Integration** | curl via Bash | Agent sends HTTP request, validates JSON response |
| **Embedding Templates** | Bash + clojure REPL | Agent generates prompt, validates placeholder replacement |
| **Deterministic Replay** | clojure.test + Bash | Agent replays events twice, compares ECS state hashes |
| **Cephalon Integration** | clojure.test (integration test) | Agent simulates Cephalon event emission, validates eidolon ingestion |

**Evidence Requirements (Agent-Executable):**
- Test execution output captured and validated (exact strings like "0 failures, 0 errors")
- JSON response fields validated with specific assertions (embedding vector length > 0)
- EDN files validated with `clojure -M -e '(slurp "events.ednlog")'`
- Exit codes checked (0 = success)
- Hash/state comparisons for determinism verification

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 1 (Start Immediately):
├── Task 1: Project scaffold + test infrastructure
└── Task 2: Event contract definition

Wave 2 (After Wave 1):
├── Task 3: ECS components (Memory, Nexus, Nooi, Daimo)
├── Task 4: Storage layer (events.ednlog read/write)
└── Task 5: Ollama embedding client

Wave 3 (After Wave 2):
├── Task 6: Event ingestion system
├── Task 7: Field physics system
└── Task 8: Lifecycle system

Wave 4 (After Wave 3):
├── Task 9: Tick loop + heartbeat
└── Task 10: Embedding prompt templates

Wave 5 (After Wave 4):
└── Task 11: Cephalon integration hook

Critical Path: 1 → 2 → 3 → 6 → 7 → 9 → 11
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5 | None (foundation) |
| 2 | None | 3, 4, 5, 6 | 1 |
| 3 | 1, 2 | 6, 7, 8 | 4, 5 |
| 4 | 1, 2 | 6 | 3, 5 |
| 5 | 1, 2 | 10 | 3, 4 |
| 6 | 2, 3, 4 | 7, 8, 9 | None (critical) |
| 7 | 3, 6 | 9 | 8 |
| 8 | 3, 6 | 9 | 7 |
| 9 | 6, 7, 8 | 10, 11 | None (critical) |
| 10 | 5, 9 | 11 | None (critical) |
| 11 | 9, 10 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=["submodule-ops", "workspace-navigation"], run_in_background=true) |
| 2 | 3, 4, 5 | delegate_task(category="quick", load_skills=[], run_in_background=true) for each task |
| 3 | 6, 7, 8 | dispatch parallel after Wave 2 completes |
| 4 | 9, 10 | dispatch parallel after Wave 3 completes |
| 5 | 11 | final integration task |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [ ] 1. Project Scaffold + Test Infrastructure

  **What to do**:
  - Create repository: `orgs/octave-commons/eidolon-clj/`
  - Create `deps.edn` with dependencies: `org.clojure/clojure`, `brute/brute`, `cheshire/cheshire`, `cognitect-labs/test-runner`
  - Create directory structure: `src/eidolon/`, `test/eidolon/`
  - Configure test infrastructure in deps.edn `:test` alias following Gates of Aker pattern
  - Create `.gitignore` for Clojure (`.clj-kondo.cache/`, `target/`, etc.)
  - Create `README.md` with project overview and usage instructions
  - Create `CLJ-KONDO` or `.clj-kondo/config.edn` for linting (following Gates of Aker pattern)

  **Must NOT do**:
  - Do NOT implement any ECS logic yet (this is infrastructure only)
  - Do NOT create database schemas (file-based storage only)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Scaffold task is straightforward - create directories, files, and configuration
  - **Skills**: `["submodule-ops", "workspace-navigation"]`
    - `submodule-ops`: Needed for creating new repository under `orgs/octave-commons/`
    - `workspace-navigation`: Needed for understanding workspace submodule structure
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for initial file creation (commits happen later)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1 - foundation task)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/deps.edn` - Dependency configuration pattern (Brute, test-runner, cloverage)
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/deps.edn` - Test alias pattern with `:extra-paths ["test"]`
  - `orgs/octave-commons/gates-of-aker/.gitignore` - Clojure-specific ignore patterns

  **Project Structure References**:
  - `orgs/octave-commons/gates-of-aker/backend/` - Directory structure pattern (src/, test/, resources/)
  - `orgs/octave-commons/promethean-agent-system/` - Minimal Clojure project structure

  **Test Infrastructure References**:
  - `orgs/octave-commons/gates-of-aker/backend/deps.edn` - Test alias configuration (`:test`, `:coverage`)
  - `orgs/octave-commons/gates-of-aker/backend/test/fantasia/config_test.clj` - Standard clojure.test pattern

  **Documentation References**:
  - `orgs/octave-commons/gates-of-aker/README.md` - Project README structure and content

  **External References** (libraries and frameworks):
  - Brute ECS: `https://github.com/bruteforce/brute` - Brute ECS library documentation
  - Official docs: `https://clojure.org/guides/deps_and_cli` - deps.edn configuration guide

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/deps.edn`: Shows exact dependency versions and test alias configuration to replicate
  - `cephalon-clj-brain/deps.edn`: Confirms test infrastructure pattern used in ingestion source
  - `gates-of-aker/.gitignore`: Provides Clojure-specific patterns to avoid committing compiled artifacts
  - `gates-of-aker/backend/`: Shows directory structure organization for src/test separation
  - `gates-of-aker/backend/test/fantasia/config_test.clj`: Demonstrates standard `deftest`/`testing`/`is` pattern

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test infrastructure task written: test/project_setup_test.clj with simple `deftest` verifying file structure exists
  - [ ] Test fails initially (RED): `clojure -X:test` → 1 test failure (files don't exist yet)
  - [ ] Project scaffold implemented: deps.edn, src/, test/, .gitignore created
  - [ ] Test passes (GREEN): `clojure -X:test` → 1 test passes
  - [ ] deps.edn contains brute/brute dependency: grep deps.edn | grep "brute/brute"
  - [ ] deps.edn contains test alias with :extra-paths ["test"]: grep deps.edn | grep ":extra-paths"

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Project Scaffold** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  clojure -X:test --help
  # Assert: Output contains "cognitect.test-runner.api/test" (test-runner installed)
  
  clojure -M -e '(require (quote [clojure.java.io :as io])) (io/file "src/eidolon")'
  # Assert: Returns truthy (src/eidolon/ directory exists)
  
  clojure -M -e '(require (quote [clojure.java.io :as io])) (io/file "test/eidolon")'
  # Assert: Returns truthy (test/eidolon/ directory exists)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from `clojure -X:test --help` command
  - [ ] Directory listing showing src/, test/, deps.edn files

  **Commit**: YES
  - Message: `chore: scaffold project infrastructure and test setup`
  - Files: `deps.edn`, `.gitignore`, `README.md`, `CLJ-KONDO`, `.clj-kondo/config.edn`
  - Pre-commit: `clojure -X:test` (verify test infrastructure works)

---

- [ ] 2. Event Contract Definition

  **What to do**:
  - Define domain events in `src/eidolon/events.clj`:
    - `memory/appended` - tool-loop events from Cephalon (session-id, tool-call, result, timestamp)
    - `embedding/materialized` - embedding vectors with model metadata (memory-id, vector, model, timestamp)
    - `nexus/upserted` - shared attractor metadata (nexus-id, tags, centroid-policy, timestamp)
    - `nexus/merged` - nexus consolidation events (source-nexus-ids, target-nexus-id, timestamp)
    - `nooi/emitted` - ephemeral agent creation (nooi-id, origin-nexus-id, timestamp)
    - `nooi/expired` - ephemeral agent termination (nooi-id, reason, timestamp)
    - `daimo/formed` - cluster entanglement events (daimo-id, memory-ids, threshold, timestamp)
    - `daimo/dissolved` - cluster breakup events (daimo-id, reason, timestamp)
    - `sim/params-set` - simulation parameters (tick-rate, field-strength, decay-factor)
  - Create event schemas as `defrecord` structs for type safety
  - Add validation functions for each event type
  - Write docstrings explaining event semantics and intended usage
  - Create example event instances in docstrings for reference

  **Must NOT do**:
  - Do NOT implement event persistence logic yet (storage layer is task 4)
  - Do NOT implement event application to ECS yet (ingestion system is task 6)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Domain model definition is straightforward - define records and validation functions
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for basic Clojure record definition

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: None (can start after project scaffold)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/lineara_conversation_export/docs/events-and-replay.md` - Event log contract precedent (cap/call + cap/return format)
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/events/runtime.clj` - Event instance structure (mentions, traces shapes)
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj` - Cephalon event emission pattern (`runtime/emit-agent-debug`)

  **Domain Model References**:
  - `orgs/octave-commons/promethean/docs/design/overview.md` - Eidolon field / nooi / daimo concepts
  - `orgs/octave-commons/promethean/docs/design/nexus.md` - Nexus definition and semantics
  - `orgs/octave-commons/promethean/docs/design/field-node-lifecycle.md` - Field nodes → nexus promotion lifecycle

  **Event Sourcing References**:
  - `orgs/octave-commons/lineara_conversation_export/docs/events-and-replay.md` - Append-only event log format, replay keys

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/structs` - defrecord documentation and patterns

  **WHY Each Reference Matters** (explain the relevance):
  - `lineara_conversation_export/docs/events-and-replay.md`: Defines event log contract format (`events.ednlog`, EDN structure) to follow
  - `gates-of-aker/backend/src/fantasia/sim/events/runtime.clj`: Shows event instance structure and how events carry traces/mentions
  - `cephalon-clj-brain/src/cephalon/brain/admin_ws.clj`: Reveals Cephalon event emission patterns to mirror in `memory/appended` schema
  - `promethean/docs/design/overview.md`: Defines nooi/daimo concepts to encode in `nooi/emitted`/`nooi/expired` events
  - `promethean/docs/design/nexus.md`: Defines nexus semantics for `nexus/upserted`/`nexus/merged` events
  - `promethean/docs/design/field-node-lifecycle.md`: Explains lifecycle patterns for memory → nexus promotion

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/events_test.clj
  - [ ] Test covers: all 9 event types have valid defrecord structures
  - [ ] Test fails initially (RED): `clojure -X:test` → validation tests fail (records don't exist yet)
  - [ ] Event records implemented in src/eidolon/events.clj
  - [ ] Validation functions implemented for each event type
  - [ ] Test passes (GREEN): `clojure -X:test` → all event tests pass (9 event types validated)
  - [ ] Docstrings present: grep src/eidolon/events.clj | grep -c "defrecord" returns 9

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Event Contract** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  clojure -M -e '(require (quote [eidolon.events :as e])) (map? (e/map->memory/appended {}))'
  # Assert: Returns true (record constructor exists)
  
  clojure -M -e '(require (quote [eidolon.events :as e])) (count (filter #(clojure.string/starts-with? (str (type %)) "eidolon.events.event") (vals (ns-publics (find-ns (quote eidolon.events)))))'
  # Assert: Returns 9 (all event types defined)
  
  grep -c "defrecord" src/eidolon/events.clj
  # Assert: Returns 9 (9 event types)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from event type count validation
  - [ ] Code listing showing 9 defrecord definitions

  **Commit**: YES
  - Message: `feat: define domain events for eidolon field (memory, embedding, nexus, nooi, daimo, sim params)`
  - Files: `src/eidolon/events.clj`, `test/eidolon/events_test.clj`
  - Pre-commit: `clojure -X:test` (verify event schemas)

---

- [ ] 3. ECS Components (Memory, Nexus, Nooi, Daimo)

  **What to do**:
  - Create `src/eidolon/ecs/components.clj` following Gates of Aker defrecord pattern:
    - `Memory` component: Position (x, y), Velocity (vx, vy), Mass, BornAt, LastSeen, Embedding (vector), SessionId, ToolCall (metadata)
    - `Nexus` component: AttractorStrength, Tags (set), CentroidPolicy (function/id), AssociatedMemories (set), LastUpdated
    - `Nooi` component: OriginNexusId, LifeRemaining, Purpose, StateVector, AssociatedDaimos (set)
    - `Daimo` component: MemoryIds (set), CoherenceThreshold, CohesionStrength, FormedAt, LastActivity
  - Define component predicates for querying (e.g., `memory-component?`, `nexus-component?`)
  - Add docstrings explaining each component's role in the eidolon field
  - Ensure components are immutable (defrecord is immutable by default)
  - Follow Brute ECS pattern: components are data, no behavior in components

  **Must NOT do**:
  - Do NOT implement entity creation logic yet (that's in task 6)
  - Do NOT implement system logic (tasks 7, 8)
  - Do NOT add behavior methods to components (data-only, following ECS pattern)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Component definition is straightforward data structure creation following established patterns
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for defrecord component definition

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2 (project scaffold + event contract)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/components.clj` - Defrecord component pattern (Position, Velocity, Mass, etc.)
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/core.clj` - Brute entity creation patterns with components
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj` - Component usage for spatial queries

  **ECS Theory References**:
  - `orgs/octave-commons/gates-of-aker/HOME.md` - Facets/describers conceptual model (components as describers with traces)

  **Domain Model References**:
  - `orgs/octave-commons/promethean/docs/design/overview.md` - Eidolon field entity types (memory, nexus, nooi, daimo)
  - `orgs/octave-commons/promethean/docs/design/nexus.md` - Nexus component semantics
  - `orgs/octave-commons/promethean/docs/design/field-node-lifecycle.md` - Memory → Nexus lifecycle patterns

  **External References** (libraries and frameworks):
  - Brute ECS: `https://github.com/bruteforce/brute` - Component definition patterns in Brute
  - Official docs: `https://clojure.org/guides/structs` - defrecord documentation

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/src/fantasia/sim/ecs/components.clj`: Provides exact defrecord patterns for Position, Velocity, Mass, BornAt components to mirror
  - `gates-of-aker/backend/src/fantasia/sim/ecs/core.clj`: Shows how Brute uses components for entity creation (component maps)
  - `gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj`: Demonstrates component usage in spatial queries
  - `promethean/docs/design/overview.md`: Defines what memory/nexus/nooi/daimo components represent in the eidolon field
  - `promethean/docs/design/nexus.md`: Explains Nexus component semantics (AttractorStrength, Tags, CentroidPolicy)
  - `promethean/docs/design/field-node-lifecycle.md`: Describes lifecycle transitions encoded in components (BornAt, LastUpdated, LifeRemaining)

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/ecs/components_test.clj
  - [ ] Test covers: all 4 component types can be instantiated and queried
  - [ ] Test fails initially (RED): `clojure -X:test` → component tests fail (components don't exist yet)
  - [ ] Component records implemented: Memory, Nexus, Nooi, Daimo in components.clj
  - [ ] Component predicates implemented: `memory-component?`, `nexus-component?`, `nooi-component?`, `daimo-component?`
  - [ ] Test passes (GREEN): `clojure -X:test` → all component tests pass
  - [ ] Components are immutable: test checks that `(assoc memory-component :x 0)` returns new instance

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For ECS Components** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  clojure -M -e '(require (quote [eidolon.ecs.components :as c])) (c/memory-component? (c/map->Memory {}))'
  # Assert: Returns true (Memory component predicate exists)
  
  clojure -M -e '(require (quote [eidolon.ecs.components :as c])) (count (filter #(clojure.string/ends-with? (str (type %)) "eidolon.ecs.components.component") (vals (ns-publics (find-ns (quote eidolon.ecs.components)))))'
  # Assert: Returns 4 (Memory, Nexus, Nooi, Daimo components defined)
  
  grep -c "defrecord" src/eidolon/ecs/components.clj
  # Assert: Returns 4 (4 component types)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from component predicate tests
  - [ ] Code listing showing 4 defrecord definitions

  **Commit**: YES
  - Message: `feat: define ECS components (Memory, Nexus, Nooi, Daimo) following Brute pattern`
  - Files: `src/eidolon/ecs/components.clj`, `test/eidolon/ecs/components_test.clj`
  - Pre-commit: `clojure -X:test` (verify component schemas)

---

- [ ] 4. Storage Layer (events.ednlog Read/Write)

  **What to do**:
  - Create `src/eidolon/storage.clj` for append-only event log operations:
    - `append-event!` - Write event to `events.ednlog` with timestamp and session-id
    - `read-events` - Read and parse all events from `events.ednlog` for a session
    - `session-exists?` - Check if session's event log exists on disk
    - `create-session!` - Create new session directory with empty `events.ednlog`
    - `validate-event-log` - Validate EDN structure and event types
  - Use `spit` with `:append true` for efficient appends
  - Use `clojure.edn/read-string` for parsing EDN events
  - Add error handling for file I/O operations (file not found, invalid EDN)
  - Create directory structure: `sessions/{session-id}/events.ednlog`
  - Add docstrings explaining append-only semantics and replay safety
  - Include tests for concurrent append scenarios (simulate multiple event sources)

  **Must NOT do**:
  - Do NOT implement replay logic yet (that's task 6)
  - Do NOT implement event application to ECS (task 6)
  - Do NOT use database storage (file-based only, per decision)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: File I/O operations are straightforward - read/write EDN files with error handling
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for file I/O operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2 (project scaffold + event contract)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/lineara_conversation_export/docs/events-and-replay.md` - Event log contract format and replay semantics
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/core.clj` - File-based persistence patterns (if any)

  **EDN Serialization References**:
  - Official docs: `https://clojure.org/guides/dev_and_time#edn` - EDN read/write patterns

  **External References** (libraries and frameworks):
  - None (standard Clojure EDN library sufficient)

  **WHY Each Reference Matters** (explain the relevance):
  - `lineara_conversation_export/docs/events-and-replay.md`: Defines event log contract format (`events.ednlog`) and append-only semantics to implement
  - EDN documentation: Shows how to use `clojure.edn/read-string` and `spit` for event serialization

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/storage_test.clj
  - [ ] Test covers: append-event!, read-events, session-exists?, create-session!, validate-event-log
  - [ ] Test fails initially (RED): `clojure -X:test` → storage tests fail (functions don't exist yet)
  - [ ] Storage functions implemented: append-event!, read-events, session-exists?, create-session!, validate-event-log
  - [ ] Test passes (GREEN): `clojure -X:test` → all storage tests pass
  - [ ] Append works: test appends event, reads back, validates content matches
  - [ ] Concurrent append safe: test simulates 10 concurrent appends, verifies all written

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Storage Layer** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create test session and append event
  clojure -M -e '(require (quote [eidolon.storage :as s])) (s/create-session! "test-session") (s/append-event! "test-session" {:event/type :memory/appended :test true})'
  # Assert: Returns nil (success), file created
  
  # Read events back
  clojure -M -e '(require (quote [eidolon.storage :as s])) (count (s/read-events "test-session"))'
  # Assert: Returns 1 (1 event appended)
  
  # Check file exists
  test -f sessions/test-session/events.ednlog
  # Assert: Returns 0 (file exists)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from storage function tests
  - [ ] File listing showing sessions/test-session/events.ednlog

  **Commit**: YES
  - Message: `feat: implement append-only event log storage (events.ednlog) with read/write operations`
  - Files: `src/eidolon/storage.clj`, `test/eidolon/storage_test.clj`
  - Pre-commit: `clojure -X:test` (verify storage layer)

---

- [ ] 5. Ollama Embedding Client

  **What to do**:
  - Create `src/eidolon/embeddings.clj` for Ollama `/api/embeddings` integration:
    - `generate-embedding!` - Call Ollama API with prompt and model name
    - `generate-batch-embeddings!` - Batch multiple prompts in single API call (if supported)
    - `validate-embedding-response` - Validate API response structure (embedding vector, tokens, etc.)
    - `embedding-vector-size` - Extract vector size from response (e.g., 1536 for Qwen3-Embedding)
  - Use `clj-http-lite` or `clj-http` for HTTP POST requests
  - Configure API endpoint: `http://localhost:11434/api/embeddings` (Ollama default)
  - Configure model: `nomic-embed-text` or Qwen3-Embedding (verify availability)
  - Add error handling for network failures, API errors, invalid responses
  - Add docstrings explaining embedding generation and model configuration
  - Include tests for successful embedding generation, error handling, response validation

  **Must NOT do**:
  - Do NOT implement embedding prompt template rendering yet (task 10)
  - Do NOT implement embedding persistence (task 6 materializes as events)
  - Do NOT add OpenAI-compatible abstraction layer (Ollama direct API only, per decision)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: HTTP client integration is straightforward - POST request to Ollama endpoint
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed (HTTP client, not browser)
    - `dev-browser`: Not needed (API call, not browser interaction)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 10 (embedding prompt templates)
  - **Blocked By**: Tasks 1, 2 (project scaffold + event contract)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/` - Any existing HTTP client patterns or Ollama integration code

  **Ollama API References**:
  - Official docs: `https://github.com/ollama/ollama/blob/main/docs/api.md` - Ollama `/api/embeddings` endpoint specification
  - Model catalog: `https://ollama.com/library` - Available embedding models (nomic-embed-text, etc.)

  **HTTP Client References**:
  - clj-http: `https://github.com/dakrone/clj-http` - Clojure HTTP client library
  - clj-http-lite: `https://github.com/r0man/clj-http-lite` - Lightweight alternative

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/deps_and_cli` - Adding HTTP client deps to deps.edn

  **WHY Each Reference Matters** (explain the relevance):
  - `cephalon-clj-brain/`: May contain existing HTTP client patterns or Ollama integration to reference
  - `ollama/api.md`: Defines exact `/api/embeddings` endpoint format (POST, JSON body, response structure)
  - `clj-http`: Shows how to make HTTP POST requests with JSON bodies in Clojure

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/embeddings_test.clj
  - [ ] Test covers: generate-embedding!, validate-embedding-response, embedding-vector-size
  - [ ] Test fails initially (RED): `clojure -X:test` → embedding tests fail (API client doesn't exist yet)
  - [ ] HTTP client implemented: generate-embedding! with POST to Ollama endpoint
  - [ ] Response validation implemented: validate-embedding-response checks for embedding vector
  - [ ] Test passes (GREEN): `clojure -X:test` → all embedding tests pass (mock API or real call)
  - [ ] API endpoint configured: `http://localhost:11434/api/embeddings` in code

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Ollama Integration** (using Bash + curl):
  \`\`\`bash
  # Agent runs:
  curl -s http://localhost:11434/api/embeddings \
    -H 'content-type: application/json' \
    -d '{"model":"nomic-embed-text","prompt":"test embedding"}' \
    | jq '.embedding | length'
  # Assert: Output > 0 (embedding vector returned, Ollama is running)
  \`\`\`

  **For Ollama Client Test** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  clojure -M -e '(require (quote [eidolon.embeddings :as e])) (e/generate-embedding! "test prompt" "nomic-embed-text")'
  # Assert: Returns map with :embedding key containing vector (not nil)
  
  clojure -M -e '(require (quote [eidolon.embeddings :as e])) (e/embedding-vector-size {:embedding [1 2 3 4 5]})'
  # Assert: Returns 5 (vector size calculated correctly)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from curl command showing embedding vector length
  - [ ] Terminal output from clojure REPL embedding generation

  **Commit**: YES
  - Message: `feat: integrate Ollama /api/embeddings for embedding generation`
  - Files: `src/eidolon/embeddings.clj`, `test/eidolon/embeddings_test.clj`
  - Pre-commit: `clojure -X:test` (verify embedding client)

---

- [ ] 6. Event Ingestion System

  **What to do**:
  - Create `src/eidolon/ecs/systems/ingestion.clj` for applying events to ECS world:
    - `apply-event!` - Pattern match on event type and apply to ECS world:
      - `memory/appended`: Create Memory component entity with Position, Velocity, Embedding (if available), SessionId, ToolCall metadata
      - `embedding/materialized`: Update Memory entity's Embedding component with vector from event
      - `nexus/upserted`: Create or update Nexus component with Tags, AttractorStrength, AssociatedMemories
      - `nexus/merged`: Merge source Nexus entities into target, delete sources
      - `nooi/emitted`: Create Nooi component entity with OriginNexusId, LifeRemaining, StateVector
      - `nooi/expired`: Delete Nooi component entity (or mark as expired)
      - `daimo/formed`: Create Daimo component entity with MemoryIds, CoherenceThreshold
      - `daimo/dissolved`: Delete Daimo component entity
      - `sim/params-set`: Update simulation parameters (tick-rate, field-strength, decay-factor)
    - Use Brute ECS `create-entity` and `assoc-component` for entity/component creation
    - Use Brute ECS `get-component` and `get-entity` for component/entity queries
    - Maintain global-state atom for simulation parameters
    - Add docstrings explaining event application semantics
    - Handle invalid events gracefully (log warning, skip)
    - Include tests for each event type application

  **Must NOT do**:
  - Do NOT implement event replay logic (task 6 handles single event application, replay is task 9)
  - Do NOT implement field physics (task 7)
  - Do NOT implement lifecycle logic (task 8)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Event ingestion is straightforward pattern matching on event types and Brute ECS operations
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for ECS operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3 - critical task)
  - **Blocks**: Tasks 7, 8, 9
  - **Blocked By**: Tasks 1, 2, 3, 4 (project scaffold, event contract, components, storage)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/core.clj` - Brute entity creation patterns (create-entity, assoc-component)
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/tick.clj` - System orchestration and global-state atom pattern
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/systems/` - System pattern reference (if any)

  **Event Sourcing References**:
  - `orgs/octave-commons/lineara_conversation_export/docs/events-and-replay.md` - Event application patterns for deterministic state

  **ECS Theory References**:
  - Brute ECS: `https://github.com/bruteforce/brute` - Brute API documentation (create-entity, assoc-component, get-component)

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/destructuring` - Pattern matching on event types

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/src/fantasia/sim/ecs/core.clj`: Shows how to create Brute entities and associate components with them
  - `gates-of-aker/backend/src/fantasia/sim/ecs/tick.clj`: Demonstrates global-state atom management and system orchestration
  - `lineara_conversation_export/docs/events-and-replay.md`: Defines how events drive state transitions deterministically
  - Brute ECS docs: Provides exact API calls for create-entity, assoc-component, get-component operations

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be agent-executable
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/ecs/systems/ingestion_test.clj
  - [ ] Test covers: apply-event! for all 9 event types
  - [ ] Test fails initially (RED): `clojure -X:test` → ingestion tests fail (system doesn't exist yet)
  - [ ] Event ingestion system implemented: apply-event! with pattern matching for all event types
  - [ ] Brute ECS operations used: create-entity, assoc-component for Memory/Nexus/Nooi/Daimo creation
  - [ ] Test passes (GREEN): `clojure -X:test` → all ingestion tests pass
  - [ ] Memory entities created: test applies memory/appended, verifies Memory component exists

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Event Ingestion** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create world and apply memory/appended event
  clojure -M -e '
    (require (quote [brute.entity :as e])
    (require (quote [brute.entity :refer [create-entity assoc-component]]))
    (require (quote [eidolon.ecs.systems.ingestion :as i]))
    (def world (e/create-world))
    (def memory-event {:event/type :memory/appended :tool-call {:name "test"} :session-id "test"})
    (def world-after (i/apply-event! world memory-event))
    (e/get-component world-after 1 :eidolon.ecs.components/Memory)
  '
  # Assert: Returns Memory component record (Memory entity created and component associated)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from event ingestion test showing Memory component retrieved

  **Commit**: YES
  - Message: `feat: implement event ingestion system (apply events to ECS world for all domain types)`
  - Files: `src/eidolon/ecs/systems/ingestion.clj`, `test/eidolon/ecs/systems/ingestion_test.clj`
  - Pre-commit: `clojure -X:test` (verify ingestion system)

---

- [ ] 7. Field Physics System

  **What to do**:
  - Create `src/eidolon/ecs/systems/physics.clj` for vector field dynamics:
    - `update-positions!` - Apply Velocity to Position for all Memory entities (p = p + v * dt)
    - `apply-field-forces!` - Calculate and apply attraction forces from Nexus entities to Memory entities
      - Force magnitude based on AttractorStrength and inverse distance
      - Force vector from Nexus Position to Memory Position
      - Apply force to Memory Velocity: v = v + (F / Mass) * dt
    - `decay-velocities!` - Apply friction/decay to Memory Velocities over time
    - `update-coherence!` - Update Daimo cohesion strength based on associated Memory distances
    - `update-nooi-lifetimes!` - Decrease Nooi LifeRemaining, expire if 0
    - `tick-physics!` - Orchestrate all physics updates in correct order (forces → positions → decay → coherence → lifetimes)
  - Use vector math (reduce, map, distance calculations) for field dynamics
  - Follow vector field semantics: Nexus attractors pull Memories, field strength decays with distance
  - Add docstrings explaining physics model and force calculations
  - Include tests for force calculation, position update, decay behavior

  **Must NOT do**:
  - Do NOT implement tick loop orchestration (task 9)
  - Do NOT implement lifecycle system (task 8)
  - Do NOT add advanced physics (collision detection, complex fluid dynamics - v0 minimal)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Vector field physics is straightforward - attraction forces, position updates, decay
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for vector math and physics

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2, 3 (project scaffold, event contract, components)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/systems/` - System pattern reference (movement, position updates)
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj` - Embedding similarity and spatial query patterns

  **Vector Field Physics References**:
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj` - Vector field dynamics (if any)

  **Domain Model References**:
  - `orgs/octave-commons/promethean/docs/design/overview.md` - Eidolon field physics semantics (nexus attractors, memory particles)

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/learn/sequences` - Vector math with map/reduce

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/src/fantasia/sim/ecs/systems/`: Shows system pattern implementation (tick function, component queries, state updates)
  - `gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj`: Demonstrates vector field queries and embedding similarity calculations
  - `promethean/docs/design/overview.md`: Defines Nexus attractor semantics and Memory particle behavior in the eidolon field

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/ecs/systems/physics_test.clj
  - [ ] Test covers: update-positions!, apply-field-forces!, decay-velocities!, update-coherence!, update-nooi-lifetimes!, tick-physics!
  - [ ] Test fails initially (RED): `clojure -X:test` → physics tests fail (system doesn't exist yet)
  - [ ] Field physics implemented: update-positions!, apply-field-forces!, decay-velocities!, tick-physics!
  - [ ] Vector math used: force calculations, position updates, distance functions
  - [ ] Test passes (GREEN): `clojure -X:test` → all physics tests pass
  - [ ] Attraction works: test applies Nexus attractor force, verifies Memory Velocity changes correctly

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Field Physics** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create world with Nexus and Memory, apply physics tick
  clojure -M -e '
    (require (quote [brute.entity :as e]))
    (require (quote [brute.entity :refer [create-entity assoc-component get-component]]))
    (require (quote [eidolon.ecs.components :as c]))
    (require (quote [eidolon.ecs.systems.physics :as p]))
    (def world (e/create-world))
    (def nexus-id (create-entity world {:eidolon.ecs.components/Nexus {:attractor-strength 10.0 :tags #{"test"}}}))
    (def memory-id (create-entity world {:eidolon.ecs.components/Memory {:position [0 0] :velocity [1 0] :mass 1.0}}))
    (def world-after (p/tick-physics! world 1.0))
    (def memory-after (get-component world-after memory-id :eidolon.ecs.components/Memory))
    (:position memory-after)
  '
  # Assert: Returns vector different from [0 0] (position updated by velocity)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from physics tick showing position update

  **Commit**: YES
  - Message: `feat: implement field physics system (attraction forces, position updates, decay)`
  - Files: `src/eidolon/ecs/systems/physics.clj`, `test/eidolon/ecs/systems/physics_test.clj`
  - Pre-commit: `clojure -X:test` (verify physics system)

---

- [ ] 8. Lifecycle System

  **What to do**:
  - Create `src/eidolon/ecs/systems/lifecycle.clj` for entity lifecycle management:
    - `spawn-nooi!` - Create Nooi entity when Nexus emits new ephemeral agent (triggered by nooi/emitted event)
    - `expire-nooi!` - Delete Nooi entity when LifeRemaining <= 0 (triggered by nooi/expired event or physics tick)
    - `form-daimo!` - Create Daimo entity when Memories cohere above threshold
    - `dissolve-daimo!` - Delete Daimo entity when cohesion drops below threshold (triggered by daimo/dissolved event)
    - `merge-nexus!` - Consolidate nearby Nexus entities into single Nexus (optimization)
    - `promote-memory-to-nexus!` - Promote Memory to Nexus when it accumulates enough associated traces (field-node-lifecycle pattern)
    - `tick-lifecycle!` - Orchestrate all lifecycle operations in correct order (spawn → expire → form → dissolve → merge → promote)
  - Use Brute ECS `delete-entity` for entity removal
  - Use component queries to find entities meeting lifecycle criteria (e.g., Nooi with LifeRemaining <= 0)
  - Follow lifecycle patterns from field-node-lifecycle.md
  - Add docstrings explaining lifecycle transitions and thresholds
  - Include tests for each lifecycle operation

  **Must NOT do**:
  - Do NOT implement tick loop orchestration (task 9)
  - Do NOT implement Cephalon integration (task 11)
  - Do NOT add advanced lifecycle (cross-session, global optimization - v0 minimal)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Lifecycle management is straightforward - entity creation/deletion based on component thresholds
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for entity lifecycle operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2, 3 (project scaffold, event contract, components)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/systems/` - System pattern reference (spawn, delete operations)

  **Domain Model References**:
  - `orgs/octave-commons/promethean/docs/design/overview.md` - Nooi/Daimo lifecycle semantics
  - `orgs/octave-commons/promethean/docs/design/field-node-lifecycle.md` - Memory → Nexus promotion lifecycle

  **ECS Theory References**:
  - Brute ECS: `https://github.com/bruteforce/brute` - Brute API documentation (delete-entity, get-entity-with-component)

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/learn/sequences` - Filter/map for component queries

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/src/fantasia/sim/ecs/systems/`: Shows system pattern implementation and entity lifecycle operations
  - `promethean/docs/design/overview.md`: Defines Nooi spawn/expire and Daimo form/dissolve semantics
  - `promethean/docs/design/field-node-lifecycle.md`: Explains Memory → Nexus promotion thresholds and conditions
  - Brute ECS docs: Provides exact API calls for delete-entity and component query operations

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/ecs/systems/lifecycle_test.clj
  - [ ] Test covers: spawn-nooi!, expire-nooi!, form-daimo!, dissolve-daimo!, merge-nexus!, promote-memory-to-nexus!, tick-lifecycle!
  - [ ] Test fails initially (RED): `clojure -X:test` → lifecycle tests fail (system doesn't exist yet)
  - [ ] Lifecycle system implemented: all 6 lifecycle functions
  - [ ] Brute ECS operations used: delete-entity, entity-with-component for lifecycle operations
  - [ ] Test passes (GREEN): `clojure -X:test` → all lifecycle tests pass
  - [ ] Nooi expiry works: test spawns Nooi, ticks until LifeRemaining = 0, verifies entity deleted

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Lifecycle System** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create world with Nooi, tick lifecycle until expired
  clojure -M -e '
    (require (quote [brute.entity :as e]))
    (require (quote [brute.entity :refer [create-entity delete-entity get-component]]))
    (require (quote [eidolon.ecs.components :as c]))
    (require (quote [eidolon.ecs.systems.lifecycle :as l]))
    (def world (e/create-world))
    (def nooi-id (create-entity world {:eidolon.ecs.components/Nooi {:life-remaining 0 :origin-nexus-id 1}}))
    (def world-after (l/tick-lifecycle! world))
    (e/get-entity world-after nooi-id)
  '
  # Assert: Returns nil (Nooi entity deleted when LifeRemaining = 0)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from lifecycle tick showing Nooi deletion

  **Commit**: YES
  - Message: `feat: implement lifecycle system (spawn/expire Nooi, form/dissolve Daimo, merge/promote Nexus)`
  - Files: `src/eidolon/ecs/systems/lifecycle.clj`, `test/eidolon/ecs/systems/lifecycle_test.clj`
  - Pre-commit: `clojure -X:test` (verify lifecycle system)

---

- [ ] 9. Tick Loop + Heartbeat

  **What to do**:
  - Create `src/eidolon/tick.clj` for deterministic tick loop orchestration:
    - `tick!` - Apply all systems in order for one simulation step:
      1. Read events from queue (if available) and apply via ingestion system
      2. Tick physics system (forces, positions, decay)
      3. Tick lifecycle system (spawn, expire, form, dissolve, merge, promote)
      4. Increment tick counter
    - `tick-n-times!` - Run N ticks for testing/benchmarking
    - `replay!` - Load events from `events.ednlog` and apply deterministically:
      1. Clear ECS world
      2. Load all events via storage layer
      3. Apply events in order via ingestion system
      4. Tick systems for each tick step
    - `start-heartbeat!` - Start background heartbeat loop using `future` or `core.async`:
      - Tick every X ms (configurable via sim/params-set event)
      - Broadcast world state after each tick (optional, for observability)
      - Stop when stop-signal received
    - `stop-heartbeat!` - Send stop signal to heartbeat loop
  - Use `global-state` atom to track simulation parameters (tick-rate, tick-counter, running-state)
  - Follow Gates of Aker tick.clj pattern for system orchestration
  - Ensure determinism: same events → same world state
  - Add docstrings explaining tick loop and replay semantics
  - Include tests for tick ordering, deterministic replay, heartbeat start/stop

  **Must NOT do**:
  - Do NOT implement Cephalon integration hook (task 11)
  - Do NOT add real-time visualization (v0 minimal)
  - Do NOT implement advanced tick optimization (parallel execution, batching - v0 minimal)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Tick loop is straightforward orchestration - call systems in order, manage global state
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for system orchestration

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4 - critical task)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Tasks 6, 7, 8 (ingestion, physics, lifecycle systems)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/ecs/tick.clj` - Tick loop pattern + global-state atom
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/server.clj` - Heartbeat scheduler pattern (future, start-heartbeat, stop-heartbeat)
  - `orgs/octave-commons/promethean-agent-system/src/promethean/modules/core.clj` - Module tick pattern

  **Event Sourcing References**:
  - `orgs/octave-commons/lineara_conversation_export/docs/events-and-replay.md` - Deterministic replay patterns

  **External References** (libraries and frameworks):
  - core.async: `https://clojure.org/guides/core_async` - core.async for heartbeat loop (if used)
  - Official docs: `https://clojure.org/guides/learn/reflection_datalog` - Atom for global-state

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/src/fantasia/sim/ecs/tick.clj`: Shows exact tick loop pattern: call systems in order, manage global-state atom
  - `gates-of-aker/backend/src/fantasia/server.clj`: Demonstrates heartbeat scheduling with `future`, start/stop signals, broadcast after tick
  - `promethean-agent-system/src/promethean/modules/core.clj`: Shows module tick pattern (similar to system orchestration)
  - `lineara_conversation_export/docs/events-and-replay.md`: Defines deterministic replay semantics (clear world, apply events in order)

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/tick_test.clj
  - [ ] Test covers: tick!, tick-n-times!, replay!, start-heartbeat!, stop-heartbeat!
  - [ ] Test fails initially (RED): `clojure -X:test` → tick tests fail (tick loop doesn't exist yet)
  - [ ] Tick loop implemented: tick! calls ingestion, physics, lifecycle in order
  - [ ] Replay implemented: replay! loads events, applies deterministically
  - [ ] Heartbeat implemented: start-heartbeat!, stop-heartbeat! with future loop
  - [ ] Test passes (GREEN): `clojure -X:test` → all tick tests pass
  - [ ] Deterministic replay: test replays same events twice, compares world state hash (must match)

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Tick Loop** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create world, tick 5 times, verify tick counter
  clojure -M -e '
    (require (quote [eidolon.tick :as t]))
    (def world-result (t/tick-n-times! (t/create-world) 5))
    (:tick-counter (t/global-state world-result))
  '
  # Assert: Returns 5 (tick counter incremented 5 times)
  \`\`\`

  **For Deterministic Replay** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Create test events, replay twice, compare hashes
  clojure -M -e '
    (require (quote [eidolon.tick :as t]))
    (require (quote [eidolon.storage :as s]))
    (s/create-session! "determinism-test")
    (s/append-event! "determinism-test" {:event/type :memory/appended})
    (def world1 (t/replay! "determinism-test"))
    (def world2 (t/replay! "determinism-test"))
    (hash world1)
  '
  # Assert: Output equals (hash world2) - same events produce same world state
  \`\`\`

  **For Heartbeat** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Start heartbeat, wait, stop, verify state
  clojure -M -e '
    (require (quote [eidolon.tick :as t]))
    (def heartbeat (t/start-heartbeat! 100)) ; tick every 100ms
    (Thread/sleep 500) ; wait 5 ticks
    (t/stop-heartbeat! heartbeat)
    (:running? @t/global-state)
  '
  # Assert: Returns false (heartbeat stopped successfully)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from tick counter test showing 5 ticks
  - [ ] Terminal output from deterministic replay test showing matching hashes
  - [ ] Terminal output from heartbeat test showing stop signal processed

  **Commit**: YES
  - Message: `feat: implement tick loop and heartbeat (deterministic replay, system orchestration)`
  - Files: `src/eidolon/tick.clj`, `test/eidolon/tick_test.clj`
  - Pre-commit: `clojure -X:test` (verify tick loop)

---

- [ ] 10. Embedding Prompt Templates

  **What to do**:
  - Create `src/eidolon/prompts.clj` for embedding prompt generation:
    - `render-embedding-prompt` - Generate embedding prompt from template with placeholders:
      - `{system_defined_embedding_prompt}` - System-defined prompt prefix
      - `{persistent_memories}` - Long-term memories with high coherence
      - `{recent_memories}` - Recent memories (last N ticks)
      - `{agent_name}` - Agent identifier for context
      - `{latest_memory}` - Most recent memory (the one being embedded)
      - `{generated_tags}` - Categories/tags extracted from latest memory
    - `select-persistent-memories` - Query ECS for persistent memories (Daimo with high CoherenceStrength)
    - `select-recent-memories` - Query ECS for recent memories (BornAt in last N ticks)
    - `extract-categories` - Generate tags/categories from latest memory (simple NLP or keyword extraction)
    - `render-template` - Replace placeholders in template with actual content
  - Implement template string with placeholder markers (user-provided format)
  - Use ECS component queries to fetch memory context
  - Add docstrings explaining template structure and placeholder semantics
  - Include tests for template rendering with various memory states

  **Must NOT do**:
  - Do NOT implement Ollama embedding generation (task 5 handles API calls)
  - Do NOT implement embedding persistence (task 6 materializes as events)
  - Do NOT add advanced NLP for category extraction (v0 minimal - keyword extraction or simple tagging)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Prompt template rendering is straightforward - string interpolation with ECS queries
  - **Skills**: `[]`
    - No specialized skills needed for this task
  - **Skills Evaluated but Omitted**:
    - All skills evaluated - none needed for string manipulation and template rendering

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4 - critical task)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 3, 5, 9 (components, embedding client, tick loop)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj` - Template/rendering patterns (if any)

  **Domain Model References**:
  - User's embedding prompt template: Provided in original request (system_defined_embedding_prompt, persistent_memories, recent_memories, agent_name, latest_memory, generated_tags)
  - `orgs/octave-commons/promethean/docs/design/overview.md` - Embedding prompt semantics in eidolon field

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/learn/routing` - String template rendering with `clojure.string/replace`

  **WHY Each Reference Matters** (explain the relevance):
  - User's embedding prompt template: Defines exact placeholder format to implement ({system_defined_embedding_prompt}, {persistent_memories}, etc.)
  - `promethean/docs/design/overview.md`: Explains how embedding prompts include system state and memory context
  - `gates-of-aker/backend/src/fantasia/sim/spatial_facets.clj`: May contain template/rendering patterns to reference

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Test file created: test/eidolon/prompts_test.clj
  - [ ] Test covers: render-embedding-prompt, select-persistent-memories, select-recent-memories, extract-categories, render-template
  - [ ] Test fails initially (RED): `clojure -X:test` → prompt tests fail (functions don't exist yet)
  - [ ] Prompt template implemented: render-embedding-prompt with all placeholders
  - [ ] Memory selection implemented: select-persistent-memories, select-recent-memories
  - [ ] Category extraction implemented: extract-categories (simple keyword extraction or tagging)
  - [ ] Test passes (GREEN): `clojure -X:test` → all prompt tests pass
  - [ ] Template renders: test calls render-embedding-prompt, verifies all placeholders replaced

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Embedding Prompts** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/eidolon-clj
  
  # Render prompt with test data
  clojure -M -e '
    (require (quote [eidolon.prompts :as p]))
    (def prompt-result (p/render-embedding-prompt {
      :system-defined-prompt "System prompt"
      :persistent-memories ["old memory 1" "old memory 2"]
      :recent-memories ["recent memory"]
      :agent-name "test-agent"
      :latest-memory "current memory"
      :generated-tags "tag1, tag2"
    }))
    prompt-result
  '
  # Assert: Output contains "System prompt", "old memory 1", "recent memory", "test-agent", "current memory", "tag1, tag2"
  
  # Verify no placeholders remain
  clojure -M -e '
    (require (quote [eidolon.prompts :as p]))
    (def prompt-result (p/render-embedding-prompt {
      :system-defined-prompt "test"
      :persistent-memories []
      :recent-memories []
      :agent-name "test"
      :latest-memory "test"
      :generated-tags ""
    }))
    (clojure.string/includes? prompt-result "{")
  '
  # Assert: Returns false (no placeholder markers remain)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from prompt rendering showing all placeholders replaced

  **Commit**: YES
  - Message: `feat: implement embedding prompt templates (render placeholders with memory context)`
  - Files: `src/eidolon/prompts.clj`, `test/eidolon/prompts_test.clj`
  - Pre-commit: `clojure -X:test` (verify prompt templates)

---

- [ ] 11. Cephalon Integration Hook

  **What to do**:
  - Create integration point in `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/`:
    - Add dependency on `eidolon-clj` to `cephalon-clj-brain/deps.edn`
    - Modify `src/cephalon/brain/admin_ws.clj` to hook into `runtime/emit-agent-debug`:
      - Wrap `runtime/emit-agent-debug` to capture tool-loop events
      - Transform Cephalon event format to `eidolon-clj` `memory/appended` event format
      - Call `eidolon.ingestion/apply-event!` to ingest memory into eidolon field
      - Handle errors gracefully (log warning, don't crash Cephalon)
    - Create `src/cephalon/brain/eidolon_integration.clj`:
      - `init-eidolon-field!` - Initialize eidolon field for a session (create ECS world, start heartbeat)
      - `shutdown-eidolon-field!` - Stop heartbeat, cleanup resources
      - `tool-event->memory-event` - Transform Cephalon tool events to eidolon memory events
    - Integrate initialization into Cephalon session lifecycle (start/shutdown)
    - Add docstrings explaining integration hooks and event transformation
    - Include integration tests simulating Cephalon events flowing into eidolon field

  **Must NOT do**:
  - Do NOT modify Cephalon core behavior (only add eidolon ingestion hook)
  - Do NOT break existing Cephalon functionality (integration must be non-invasive)
  - Do NOT add full knowledge-graph integration (v0 minimal - just event ingestion)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Cephalon integration is straightforward - wrap event emission, transform to eidolon format
  - **Skills**: `["submodule-ops"]`
    - `submodule-ops`: Needed for navigating cephalon-clj submodule structure and understanding integration point
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for integration implementation (commits happen later)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5 - final integration task)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 9, 10 (tick loop, embedding prompts)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj` - Cephalon event emission point (`runtime/emit-agent-debug`)
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/deps.edn` - Dependency configuration to add `eidolon-clj`
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/test/cephalon/brain/admin_ws_test.clj` - Cephalon test patterns

  **Eidolon Integration References**:
  - `orgs/octave-commons/eidolon-clj/src/eidolon/ecs/systems/ingestion.clj` - Event ingestion system to call

  **External References** (libraries and frameworks):
  - Official docs: `https://clojure.org/guides/deps_and_cli` - Adding local deps to deps.edn

  **WHY Each Reference Matters** (explain the relevance):
  - `cephalon-clj-brain/src/cephalon/brain/admin_ws.clj`: Reveals exact location where `runtime/emit-agent-debug` is called - integration point to hook eidolon ingestion
  - `cephalon-clj-brain/deps.edn`: Shows how to add `eidolon-clj` as a local dependency
  - `eidolon-clj/src/eidolon/ecs/systems/ingestion.clj`: Provides `apply-event!` function to call from Cephalon integration
  - `cephalon-clj-brain/test/cephalon/brain/admin_ws_test.clj`: Shows test patterns for Cephalon integration

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool
  > - If you write "[placeholder]" - REPLACE IT with actual values based on task context

  **If TDD (tests enabled):**
  - [ ] Integration file created in cephalon-clj: src/cephalon/brain/eidolon_integration.clj
  - [ ] Test file created: test/cephalon/brain/eidolon_integration_test.clj
  - [ ] Test covers: init-eidolon-field!, shutdown-eidolon-field!, tool-event->memory-event
  - [ ] Test fails initially (RED): `clojure -X:test` → integration tests fail (functions don't exist yet)
  - [ ] Integration implemented: init, shutdown, event transformation functions
  - [ ] admin_ws.clj modified: hook into runtime/emit-agent-debug, call eidolon ingestion
  - [ ] deps.edn updated: eidolon-clj added as local dependency
  - [ ] Test passes (GREEN): `clojure -X:test` → all integration tests pass
  - [ ] Cephalon events flow: test simulates Cephalon tool event, verifies eidolon Memory entity created

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For Cephalon Integration** (using Bash + clojure REPL):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/cephalon-clj/cephalon-clj-brain
  
  # Initialize eidolon field, emit tool event, verify memory created
  clojure -M -e '
    (require (quote [cephalon.brain.eidolon-integration :as ei]))
    (require (quote [brute.entity :as e]))
    (require (quote [brute.entity :refer [get-component]]))
    (def eidolon-world (ei/init-eidolon-field! "test-session"))
    (def tool-event {:tool/name "test-tool" :result "success" :timestamp 1234567890})
    (def eidolon-world-after (ei/tool-event->memory-event eidolon-world tool-event))
    (def memory-component (get-component eidolon-world-after 1 :eidolon.ecs.components/Memory))
    (:tool-call memory-component)
  '
  # Assert: Returns map with :tool-name "test-tool" (Cephalon event transformed to eidolon Memory)
  
  # Cleanup
  clojure -M -e '
    (require (quote [cephalon.brain.eidolon-integration :as ei]))
    (ei/shutdown-eidolon-field! "test-session")
  '
  # Assert: Returns nil (cleanup successful)
  \`\`\`

  **For deps.edn Update** (using Bash + grep):
  \`\`\`bash
  # Agent runs:
  cd orgs/octave-commons/cephalon-clj/cephalon-clj-brain
  
  grep "eidolon-clj" deps.edn
  # Assert: Output contains local path to eidolon-clj (dependency added)
  \`\`\`

  **Evidence to Capture:**
  - [ ] Terminal output from Cephalon integration test showing Memory component created
  - [ ] deps.edn output showing eidolon-clj dependency

  **Commit**: YES
  - Message: `feat: integrate eidolon field ingestion into Cephalon (hook runtime/emit-agent-debug)`
  - Files: `cephalon-clj-brain/src/cephalon/brain/eidolon_integration.clj`, `cephalon-clj-brain/src/cephalon/brain/admin_ws.clj` (modified), `cephalon-clj-brain/deps.edn` (modified), `cephalon-clj-brain/test/cephalon/brain/eidolon_integration_test.clj`
  - Pre-commit: `clojure -X:test` (verify integration in both eidolon-clj and cephalon-clj)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: scaffold project infrastructure and test setup` | deps.edn, .gitignore, README.md, CLJ-KONDO, .clj-kondo/config.edn | clojure -X:test |
| 2 | `feat: define domain events for eidolon field (memory, embedding, nexus, nooi, daimo, sim params)` | src/eidolon/events.clj, test/eidolon/events_test.clj | clojure -X:test |
| 3 | `feat: define ECS components (Memory, Nexus, Nooi, Daimo) following Brute pattern` | src/eidolon/ecs/components.clj, test/eidolon/ecs/components_test.clj | clojure -X:test |
| 4 | `feat: implement append-only event log storage (events.ednlog) with read/write operations` | src/eidolon/storage.clj, test/eidolon/storage_test.clj | clojure -X:test |
| 5 | `feat: integrate Ollama /api/embeddings for embedding generation` | src/eidolon/embeddings.clj, test/eidolon/embeddings_test.clj | clojure -X:test |
| 6 | `feat: implement event ingestion system (apply events to ECS world for all domain types)` | src/eidolon/ecs/systems/ingestion.clj, test/eidolon/ecs/systems/ingestion_test.clj | clojure -X:test |
| 7 | `feat: implement field physics system (attraction forces, position updates, decay)` | src/eidolon/ecs/systems/physics.clj, test/eidolon/ecs/systems/physics_test.clj | clojure -X:test |
| 8 | `feat: implement lifecycle system (spawn/expire Nooi, form/dissolve Daimo, merge/promote Nexus)` | src/eidolon/ecs/systems/lifecycle.clj, test/eidolon/ecs/systems/lifecycle_test.clj | clojure -X:test |
| 9 | `feat: implement tick loop and heartbeat (deterministic replay, system orchestration)` | src/eidolon/tick.clj, test/eidolon/tick_test.clj | clojure -X:test |
| 10 | `feat: implement embedding prompt templates (render placeholders with memory context)` | src/eidolon/prompts.clj, test/eidolon/prompts_test.clj | clojure -X:test |
| 11 | `feat: integrate eidolon field ingestion into Cephalon (hook runtime/emit-agent-debug)` | cephalon-clj-brain/src/cephalon/brain/eidolon_integration.clj, cephalon-clj-brain/src/cephalon/brain/admin_ws.clj (modified), cephalon-clj-brain/deps.edn (modified), cephalon-clj-brain/test/cephalon/brain/eidolon_integration_test.clj | clojure -X:test (both projects) |

---

## Success Criteria

### Verification Commands

```bash
# Run all tests
cd orgs/octave-commons/eidolon-clj && clojure -X:test
# Expected: 0 failures, 0 errors

# Check test coverage
cd orgs/octave-commons/eidolon-clj && clojure -X:coverage
# Expected: Coverage report generated with >80% for core modules

# Verify Ollama integration
curl -s http://localhost:11434/api/embeddings \
  -H 'content-type: application/json' \
  -d '{"model":"nomic-embed-text","prompt":"test"}' | jq '.embedding | length'
# Expected: > 0 (embedding vector returned)

# Verify event log persistence
cd orgs/octave-commons/eidolon-clj
echo '[:event/type :memory/appended]' > test-session/events.ednlog
clojure -M -e '(require (quote [eidolon.storage :as s])) (s/read-events "test-session")'
# Expected: List with 1 memory/appended event

# Verify deterministic replay
cd orgs/octave-commons/eidolon-clj
clojure -M -e '
  (require (quote [eidolon.tick :as t]))
  (require (quote [eidolon.storage :as s]))
  (s/create-session! "replay-test")
  (s/append-event! "replay-test" {:event/type :memory/appended})
  (def world1 (t/replay! "replay-test"))
  (def world2 (t/replay! "replay-test"))
  [(= (hash world1) (hash world2))]
'
# Expected: [true] (same events produce same world state)

# Verify Cephalon integration
cd orgs/octave-commons/cephalon-clj/cephalon-clj-brain
clojure -M -e '
  (require (quote [cephalon.brain.eidolon-integration :as ei]))
  (ei/init-eidolon-field! "integration-test")
  (ei/shutdown-eidolon-field! "integration-test")
'
# Expected: nil (successful init/shutdown)
```

### Final Checklist

- [ ] All "Must Have" present (event-sourced core, deterministic replay, ECS components, field physics, Ollama integration, event storage, embedding prompts, Cephalon integration, TDD test suite)
- [ ] All "Must NOT Have" absent (no full knowledge-graph, no HNSW indexing, no cross-session physics, no database storage, no embedding recomputation, no manual verification criteria, no standalone service, no OpenAI abstraction)
- [ ] All tests pass (`clojure -X:test` returns "0 failures, 0 errors")
- [ ] Coverage >80% for core modules (`clojure -X:coverage`)
- [ ] Ollama embedding endpoint responds successfully
- [ ] Event log can be appended and replayed deterministically
- [ ] Cephalon integration emits `memory/appended` events successfully
- [ ] Embedding prompt templates render with all placeholders replaced
- [ ] Field physics system advances memories with vector field forces
- [ ] All code follows Gates of Aker ECS patterns (defrecord components, Brute entities, tick pipeline)
- [ ] Project integrated into workspace as submodule under `orgs/octave-commons/`
