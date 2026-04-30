# olympia-clj: Agent Contest Benchmarking Suite & Runtime

## TL;DR

> **Quick Summary**: Create a new Clojure package `olympia-clj` in octave-commons that serves as an agent contest benchmarking suite and runtime. The package will absorb existing benchmarking infrastructure (Clojure DSL + 28 prompt benchmarks), depend on promethean-agent-system for agent execution, and provide simple execution with timing capture and hybrid grading (automated tests + human evaluation on 0-100 scale).
>
> **Deliverables**:
> - Complete Clojure package structure (monolithic deps.edn)
> - Absorbed and migrated Clojure benchmark DSL from promethean-agent-system
> - 28 benchmark prompts converted from markdown to Clojure data structures
> - Agent runtime for running benchmarks with simple execution
> - Configuration management for agent variants (models × prompts × tools)
> - Grading system with automated tests and human evaluation (0-100 scale)
> - TDD test setup with clojure.test + cognitect.test-runner + cloverage
> - EDN file-based result storage
>
> **Estimated Effort**: Large (complex migration + new runtime + grading system)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Package setup → Benchmark DSL absorption → Prompt migration → Runtime implementation → Grading system → Tests

---

## Context

### Original Request
Create a new clojure package in the octave commons org called `olympia-clj`. That package will absorb and replace all existing benchmarking code. Olympia is a contest between agents, so it's a bench marking suite. It's also more than that - so we are considering it another agent run time. It runs these bench marks with many different agent configurations and grades them so we can make better decisions.

### Interview Summary
**Key Discussions**:
- **Package location**: `/home/err/devel/orgs/octave-commons/olympia-clj/`
- **Architecture**: Monolithic structure (single deps.edn) - user decision
- **Dependencies**: Depend on promethean-agent-system (reuse existing runtime, tools, infrastructure) - user decision
- **Benchmark migration**: Port all 28 markdown prompts to Clojure data structures - user decision
- **Agent configs**: Full combinations (model variants, prompt strategies, tool configurations) - user decision
- **Grading**: Hybrid approach (automated tests + human evaluation), 0-100 scale - user decision
- **Runtime v1**: Simple execution (run agents, capture outputs, timing) - user decision
- **Testing**: TDD approach with clojure.test + cognitect.test-runner + cloverage - user decision

**Research Findings**:
- octave-commons location: `/home/err/devel/orgs/octave-commons/`
- Clojure projects use deps.edn, namespace pattern: `octave.olympia.domain.entity`
- Promethean agent system uses core.async, supervision trees, tool registry
- Pantheon uses schema-based definitions, functional ports/adapters
- Test infrastructure: clojure.test + cognitect.test-runner + cloverage pattern (gates-of-aker is best practice)

**Existing Benchmarking Infrastructure to Absorb**:
1. **Clojure Benchmark DSL**: `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/`
   - Macros: `suite`, `case`, `def-benchmark`, `calls`, `abstains`
   - Example: `tool_choice.clj` for testing agent tool selection

2. **28 Benchmark Prompts**: `/home/err/devel/orgs/riatzukiza/promethean/docs/benchmarks/prompts/`
   - Categories: Code Review, Documentation, Testing, Security, Performance, Architecture, Refactoring, Debugging, Migration, Kanban, Agent Development
   - Format: Markdown with frontmatter (difficulty/scale/complexity)
   - Example: `code-review/ts-type-safety.md`, `testing/unit-test-coverage.md`

3. **@promethean-os/benchmark (TypeScript)**:
   - Multi-provider AI benchmarking framework
   - Location: `/home/err/devel/orgs/riatzukiza/promethean/packages/benchmark/`
   - **EXCLUDED**: Keep separate, maybe integrate later

### Metis Review
**Identified Gaps** (addressed):
- **Gap 1**: Definition of "agent runtime v1" - **RESOLVED**: Locked down as synchronous or simple async execution with output capture and timing. No process supervision, no distributed execution, no HTTP API.
- **Gap 2**: Human evaluation workflow - **RESOLVED**: Manual review of benchmark outputs via CLI command prompting for 0-100 grade.
- **Gap 3**: Configuration scope - **RESOLVED**: Clojure data structures (maps/vectors) in code or EDN files. No validation schemas, no templating, no dynamic loading.
- **Gap 4**: Data storage - **RESOLVED**: EDN files on filesystem with simple naming conventions. No database, no query APIs.
- **Gap 5**: Grading boundaries - **RESOLVED**: Basic pass/fail based on test outcomes, execution timing capture, optional manual human evaluation. No automated LLM grading, no leaderboards.

**Guardrails Applied** (from Metis review):
- **MUST NOT modify promethean-agent-system** (use as dependency only)
- **MUST NOT provide PM2 orchestration** (defer to future runtime v2)
- **MUST NOT include complex parallel execution** (sequential or simple async only)
- **MUST NOT implement state management/regression detection** (v1 feature only)
- **MUST follow octave-commons namespace convention**: `octave.olympia.domain.entity`
- **MUST reuse promethean-agent-system infrastructure** without modification
- **MUST NOT invent new agent abstractions** - use existing patterns from promethean-agent-system
- **MUST remain monolithic** (deps.edn with all namespaces in single repo)
- **MUST NOT introduce new dependencies without justification**
- **MUST follow gates-of-aker test pattern** (clojure.test + cognitect.test-runner + cloverage)

---

## Work Objectives

### Core Objective
Create `olympia-clj` package in octave-commons that provides an agent contest benchmarking suite and simple runtime. The package will absorb existing benchmarking infrastructure, execute benchmarks with different agent configurations, and grade results using a hybrid approach (automated tests + human evaluation).

### Concrete Deliverables
1. **Package Structure**: Complete monolithic Clojure package at `/home/err/devel/orgs/octave-commons/olympia-clj/`
   - deps.edn with :test, :coverage, :lint aliases
   - Namespace structure following `octave.olympia.domain.entity` pattern
   - Dependencies: promethean-agent-system, clojure.test, cognitect.test-runner, cloverage

2. **Benchmark DSL Absorption**: Migrate Clojure benchmark DSL from promethean-agent-system
   - Copy/transform macros: `suite`, `case`, `def-benchmark`, `calls`, `abstains`
   - Update namespace to `octave.olympia.bench.dsl`
   - Add tests for DSL functionality

3. **Benchmark Prompt Migration**: Convert 28 markdown prompts to Clojure data structures
   - Parse markdown frontmatter (difficulty, scale, complexity)
   - Store as vector of benchmark definitions
   - Categories: code-review, documentation, testing, security, performance, architecture, refactoring, debugging, migration, kanban, agent-development
   - Create discovery mechanism to load benchmarks

4. **Agent Runtime**: Simple execution harness
   - Run agent with specific configuration (model variant, prompt strategy, tool config)
   - Capture agent output and execution timing
   - Timeout handling (configurable timeout per benchmark)
   - Error handling (crash, API failure, timeout)

5. **Configuration Management**: Agent variant configuration system
   - Define model variants (GPT-4, Claude, Ollama models)
   - Define prompt strategies (system prompts, role definitions)
   - Define tool configurations (available tools, disabled tools)
   - Support full combination generation (models × prompts × tools)

6. **Grading System**: Hybrid automated + manual evaluation
   - Automated grading: Pass/fail based on test assertions
   - Human evaluation: CLI prompt for manual 0-100 grade
   - Store both grades in result structure
   - Compute composite score (weighted or simple average)

7. **Result Storage**: EDN file-based persistence
   - Save results with timestamp, benchmark name, config, grades, timings, outputs
   - File naming convention: `results/YYYY-MM-DD_benchmark-name_config.edn`
   - Read back for historical comparison (manual in v1)

8. **Test Infrastructure**: TDD with comprehensive coverage
   - clojure.test framework with cognitect.test-runner
   - cloverage integration for coverage reports
   - Test coverage > 80% target
   - CI/CD workflow following gates-of-aker pattern

### Definition of Done
- [ ] Package structure created with deps.edn, src/, test/
- [ ] Benchmark DSL absorbed and tested
- [ ] All 28 prompts migrated to Clojure structures
- [ ] Agent runtime executes benchmarks and captures outputs/timing
- [ ] Configuration management supports agent variants
- [ ] Grading system provides automated pass/fail and manual 0-100
- [ ] Results stored as EDN files
- [ ] Test coverage > 80%, all tests pass
- [ ] CI/CD workflow runs tests and coverage

### Must Have
- Depend on promethean-agent-system (reuse infrastructure)
- Absorb Clojure benchmark DSL from promethean-agent-system
- Migrate all 28 benchmark prompts to Clojure
- Simple execution with timing capture
- Hybrid grading (automated + human evaluation 0-100)
- TDD test setup with clojure.test + cognitect.test-runner + cloverage

### Must NOT Have (Guardrails)
- Modify promethean-agent-system
- PM2 orchestration
- Complex parallel execution (core.async channels, resource pools)
- State management and regression detection
- Database persistence (EDN files only)
- Automated LLM grading
- Leaderboards or statistical analysis
- HTTP/API endpoints
- Configuration validation schemas
- Dynamic configuration loading

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (promethean-agent-system has clojure.test, gates-of-aker has best practice)
- **User wants tests**: TDD
- **Framework**: clojure.test + cognitect.test-runner + cloverage

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test file: `test/octave/olympia/<namespace>_test.clj`
   - Test command: `clojure -M:test :only 'octave.olympia.<namespace>-test/<test-name>'`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `clojure -M:test`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `clojure -M:test`
   - Expected: PASS (still)

**Test Setup Task (infrastructure exists, but needs setup in olympia-clj):**
- [ ] 0. Setup Test Infrastructure
  - Create: deps.edn with :test, :coverage aliases
  - Config: cognitect.test-runner for test alias
  - Config: cloverage for coverage alias
  - Verify: `clojure -M:test --help` → shows test runner help
  - Example: Create `test/octave/olympia/example_test.clj`
  - Verify: `clojure -M:test` → 1 test passes

### Automated Verification (NO User Intervention)

> **CRITICAL PRINCIPLE: ZERO USER INTERVENTION**
>
> **NEVER** create acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - ANY step that requires a human to perform an action
>
> **ALL verification MUST be automated and executable by the agent.**

Each TODO includes EXECUTABLE verification procedures that agents can run directly:

**By Deliverable Type:**

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **Clojure Library/Module** | Bash (clojure, edn) | Agent runs Clojure commands, evaluates EDN output, tests functions |
| **CLI/Runtime** | Bash | Agent runs CLI commands, captures output, validates expected strings |
| **File Generation** | Bash | Agent checks file existence, content, structure |
| **Data Processing** | Bash (clojure) | Agent processes EDN files, validates transformations |

**Evidence Requirements (Agent-Executable):**
- Command output captured and compared against expected patterns
- EDN file content validated with specific assertions
- Test execution results captured and checked
- Exit codes checked (0 = success)

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 1 (Start Immediately):
├── Task 1: Setup package structure (no dependencies)
├── Task 2: Setup test infrastructure (no dependencies)
└── Task 3: Verify promethean-agent-system compatibility (independent)

Wave 2 (After Wave 1):
├── Task 4: Absorb benchmark DSL (depends on: 1)
├── Task 5: Create benchmark prompt data structure (depends on: 1)
└── Task 6: Create configuration management system (depends on: 1)

Wave 3 (After Wave 2):
├── Task 7: Implement agent runtime (depends on: 3, 6)
├── Task 8: Migrate 28 benchmark prompts (depends on: 5)
└── Task 9: Implement automated grading (depends on: 4)

Wave 4 (After Wave 3):
├── Task 10: Implement human grading CLI (depends on: 9)
├── Task 11: Implement result storage (depends on: 9, 10)
└── Task 12: Create CLI entry points (depends on: 7, 11)

Wave 5 (After Wave 4):
├── Task 13: Integration tests (depends on: 12)
├── Task 14: Documentation and README (depends on: 12)
└── Task 15: CI/CD workflow (depends on: 14)

Critical Path: Task 1 → Task 4 → Task 9 → Task 11 → Task 12
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5, 6 | 2, 3 |
| 2 | None | None | 1, 3 |
| 3 | None | 7 | 1, 2 |
| 4 | 1 | 9 | 5, 6 |
| 5 | 1 | 8 | 4, 6 |
| 6 | 1 | 7 | 4, 5 |
| 7 | 3, 6 | 8 | 8 |
| 8 | 5 | None | 7, 9 |
| 9 | 4 | 10, 11 | 7, 8 |
| 10 | 9 | 11 | 11 |
| 11 | 9, 10 | 12 | 10 |
| 12 | 7, 11 | 13, 14, 15 | None |
| 13 | 12 | None | 14, 15 |
| 14 | 12 | 15 | 13, 15 |
| 15 | 14 | None | 13 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | delegate_task(category="quick", load_skills=["submodule-ops"], run_in_background=true) × 3 |
| 2 | 4, 5, 6 | delegate_task(category="quick", load_skills=["workspace-navigation"], run_in_background=true) × 3 |
| 3 | 7, 8, 9 | delegate_task(category="quick", load_skills=["workspace-navigation"], run_in_background=true) × 3 |
| 4 | 10, 11, 12 | delegate_task(category="quick", load_skills=["workspace-navigation"], run_in_background=true) × 3 |
| 5 | 13, 14, 15 | delegate_task(category="quick", load_skills=["git-master", "workspace-navigation"], run_in_background=true) × 3 |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [ ] 1. Setup Package Structure

  **What to do**:
  - Create directory structure: `orgs/octave-commons/olympia-clj/src/octave/olympia/` and `test/octave/olympia/`
  - Create deps.edn with:
    - `:paths ["src"]`
    - `:deps {promethean-agent-system {:local/root "../promethean-agent-system"}`
    - `:aliases {:test {:extra-paths ["test"] :extra-deps {cognitect/test-runner {:mvn/version "1.1.0"} ...} :main-opts ["-m" "cognitect.test-runner.api/test"]}`
    - `:aliases {:coverage {:extra-deps {cloverage {:mvn/version "1.2.4"}} :main-opts ["-m" "cloverage.coverage.api/run"]}`
  - Create basic namespaces: `octave.olympia.core`, `octave.olympia.bench`, `octave.olympia.config`, `octave.olympia.runtime`, `octave.olympia.grader`
  - Create basic .gitkeep files in test/ directories

  **Must NOT do**:
  - Do NOT create project.clj (use deps.edn only)
  - Do NOT add unnecessary dependencies (only promethean-agent-system initially)
  - Do NOT setup PM2 orchestration

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Straightforward file and directory creation, dependency setup
  - **Skills**: `[]`
    - No specialized skills needed - basic file operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3) | Sequential
  - **Blocks**: Tasks 4, 5, 6 (depend on package structure)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/deps.edn` - deps.edn structure with :test alias
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/deps.edn` - Comprehensive aliases (:test, :coverage, :lint)
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/` - Namespace structure and organization

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - All interview decisions and research findings
  - Clojure deps.edn reference: https://clojure.org/guides/deps_and_cli

  **External References** (libraries and frameworks):
  - Official docs: https://clojure.org/guides/deps_and_cli - deps.edn configuration
  - Official docs: https://github.com/cognitect-labs/test-runner - test runner usage

  **WHY Each Reference Matters** (explain the relevance):
  - `cephalon-clj-brain/deps.edn`: Shows how octave-commons projects structure deps.edn with :test alias for CI integration
  - `gates-of-aker/backend/deps.edn`: Best-in-class example with comprehensive aliases (:test, :coverage, :lint) that olympia-clj should follow
  - `promethean-agent-system/src/promethean/`: Shows namespace organization patterns that olympia-clj should emulate for consistency
  - `drafts/olympia-clj.md`: Contains all interview decisions (TDD, monolithic, 0-100 grading) that must be reflected in package structure

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**
  >
  > - Acceptance = EXECUTION by the agent, not "user checks if it works"
  > - Every criterion MUST be verifiable by running a command or using a tool

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/core_test.clj
  - [ ] Test covers: namespace exists and loads without errors
  - [ ] clojure -M:test :only 'octave.olympia.core-test' → PASS (1 test, 0 failures)

  **Automated Verification (ALWAYS include, choose by deliverable type):**

  **For File/Package Generation** (using Bash):
  ```bash
  # Agent executes via bash commands:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  ls -la deps.edn
  # Assert: File exists and is readable

  clojure -M:run -m octave.olympia.core
  # Assert: No errors (namespace loads)
  ```

  **For Dependency Verification** (using Bash):
  ```bash
  # Agent runs:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test --help
  # Assert: Output contains cognitect.test-runner help text
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from ls and clojure commands
  - [ ] deps.edn file content structure

  **Commit**: NO (wait for wave completion)
  - Message: `type(scope): desc`
  - Files: `deps.edn`, `src/octave/olympia/core.clj`, `test/octave/olympia/`
  - Pre-commit: `clojure -M:test`

- [ ] 2. Setup Test Infrastructure

  **What to do**:
  - Ensure :test alias in deps.edn uses cognitect.test-runner
  - Ensure :coverage alias in deps.edn uses cloverage
  - Create example test: `test/octave/olympia/example_test.clj`
  - Test that test runner works: `clojure -M:test`
  - Test that coverage works: `clojure -M:coverage`

  **Must NOT do**:
  - Do NOT create custom test runner (use cognitect.test-runner)
  - Do NOT add test framework dependencies (use what's in deps.edn)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Test infrastructure setup following established patterns
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure tooling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3) | Sequential
  - **Blocks**: None (independent verification step)
  - **Blocked By**: Task 1 (requires package structure)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/deps.edn:18-20` - :test alias with cognitect.test-runner
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/deps.edn` - Comprehensive aliases (:test, :coverage, :lint)
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/test/cephalon/brain/test_runner.clj` - Custom test runner pattern (for reference, but we're using cognitect.test-runner)
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/test/fantasia/test_helpers.clj` - Test helper patterns

  **Documentation References** (specs and requirements):
  - Cognitect test runner docs: https://github.com/cognitect-labs/test-runner
  - Cloverage docs: https://github.com/cloverage/cloverage

  **WHY Each Reference Matters** (explain the relevance):
  - `gates-of-aker/backend/deps.edn:18-20`: Shows exact cognitect.test-runner configuration that olympia-clj should copy
  - `gates-of-aker/backend/deps.edn`: Complete reference for comprehensive test infrastructure with coverage
  - `cephalon-clj-brain/test_runner.clj`: Example of custom test runner - we're NOT using this, but understanding it helps ensure we follow octave-commons patterns correctly
  - `test_helpers.clj`: Shows test helper patterns that can be reused in olympia-clj

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/example_test.clj
  - [ ] Test covers: test runner executes successfully
  - [ ] clojure -M:test → PASS (1 test, 0 failures)
  - [ ] clojure -M:coverage → Generates coverage report
  - [ ] Coverage > 0% (any coverage means infrastructure works)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test
  # Assert: Exit code 0 (success)
  # Assert: Output contains "0 failures, 0 errors"

  clojure -M:coverage
  # Assert: Exit code 0
  # Assert: Coverage report generated in target/coverage/
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from test and coverage commands
  - [ ] Coverage report location

  **Commit**: NO (wait for wave completion)

- [ ] 3. Verify promethean-agent-system Compatibility

  **What to do**:
  - Read promethean-agent-system agent execution API
  - Identify functions: `(start-agent!)`, `(stop-agent!)`, tool registration, world state
  - Test that olympia-clj can depend on and use promethean-agent-system
  - Create simple integration test that starts a dummy agent

  **Must NOT do**:
  - Do NOT modify promethean-agent-system code
  - Do NOT add new agent abstractions beyond what promethean-agent-system provides

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Research and verification task, low implementation effort
  - **Skills**: `["workspace-navigation"]`
    - `workspace-navigation`: Navigate promethean-agent-system to find agent execution APIs

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2) | Sequential
  - **Blocks**: Task 7 (agent runtime depends on compatibility verification)
  - **Blocked By**: None (independent research task)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/runtime/step.clj` - Agent runtime execution
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/tools.clj` - Tool registration patterns
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/modules/core.clj` - Agent initialization

  **Documentation References** (specs and requirements):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/AGENTS.md` - Promethean agent system documentation
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Research findings on agent runtime patterns

  **WHY Each Reference Matters** (explain the relevance):
  - `runtime/step.clj`: Shows how promethean-agent-system executes agents - olympia-clj must use these patterns
  - `tools.clj`: Shows tool registration API - olympia-clj will register benchmarks as tools
  - `modules/core.clj`: Shows agent initialization - olympia-clj will create agent variants based on this
  - `AGENTS.md`: Contains promethean-agent-system documentation that describes agent runtime patterns

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Integration test created: test/octave/olympia/runtime/promethean_integration_test.clj
  - [ ] Test covers: olympia-clj can start a promethean-agent-system agent
  - [ ] clojure -M:test → PASS (all tests including integration)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:run -m octave.olympia.runtime.promethean-integration
  # Assert: Agent starts and stops successfully without errors
  # Assert: Output contains "Promethean agent system integration: OK"
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from integration test
  - [ ] promethean-agent-system API functions identified and documented

  **Commit**: NO (wait for wave completion)

- [ ] 4. Absorb Benchmark DSL

  **What to do**:
  - Read benchmark DSL from: `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/dsl.clj`
  - Read example benchmarks from: `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/tool_choice.clj`
  - Create `src/octave/olympia/bench/dsl.clj` with macros: `suite`, `case`, `def-benchmark`, `calls`, `abstains`
  - Update namespace to `octave.olympia.bench.dsl`
  - Copy example benchmarks to `src/octave/olympia/bench/examples/tool_choice.clj`
  - Write tests for DSL functionality

  **Must NOT do**:
  - Do NOT remove DSL from promethean-agent-system (copy/absorb only)
  - Do NOT change DSL semantics (preserve existing behavior)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Code absorption and transformation task
  - **Skills**: `["workspace-navigation"]`
    - `workspace-navigation`: Locate benchmark DSL files in promethean-agent-system

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6) | Sequential
  - **Blocks**: Task 9 (grading depends on DSL) | Blocked By: Task 1 (package structure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/dsl.clj` - Benchmark DSL macros to absorb
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/tool_choice.clj` - Example benchmark using DSL
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/ollama/bench_tools.clj:80-90` - Tool registry with `benchcase` macro

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Research findings on benchmark DSL patterns

  **WHY Each Reference Matters** (explain the relevance):
  - `dsl.clj`: Contains the exact macro definitions (`suite`, `case`, `def-benchmark`, `calls`, `abstains`) that must be absorbed and preserved
  - `tool_choice.clj`: Shows how benchmarks are structured using the DSL - critical for understanding DSL semantics
  - `bench_tools.clj:80-90`: Shows how benchmarks integrate with tool registry - olympia-clj must follow this pattern

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/bench/dsl_test.clj
  - [ ] Test covers: All DSL macros work correctly (suite, case, def-benchmark, calls, abstains)
  - [ ] Test file created: test/octave/olympia/bench/examples/tool_choice_test.clj
  - [ ] Test covers: Example benchmark executes and passes
  - [ ] clojure -M:test → PASS (all DSL tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test :only 'octave.olympia.bench.dsl-test'
  # Assert: All tests pass (suite, case, def-benchmark, calls, abstains work)

  clojure -M:run -m octave.olympia.bench.examples.tool-choice
  # Assert: Example benchmark executes successfully
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from DSL tests
  - [ ] Example benchmark execution output

  **Commit**: NO (wait for wave completion)

- [ ] 5. Create Benchmark Prompt Data Structure

  **What to do**:
  - Define benchmark data structure in `src/octave/olympia/bench/prompt.clj`:
    - Map with keys: `:id`, `:name`, `:category`, `:difficulty`, `:scale`, `:complexity`, `:prompt`, `:answer`
  - Create function `load-benchmarks` that reads directory of EDN benchmark files
  - Create function `discover-benchmarks` that finds all benchmarks
  - Write tests for benchmark data structure

  **Must NOT do**:
  - Do NOT implement markdown parsing (we'll convert to EDN manually)
  - Do NOT add validation schemas (just data structures)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Data structure definition task
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure data structures

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6) | Sequential
  - **Blocks**: Task 8 (migration depends on data structure) | Blocked By: Task 1 (package structure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/pantheon/packages/workflow/src/workflow/types.ts:AgentDefinitionSchema` - Schema-based agent definition pattern
  - `/home/err/devel/orgs/octave-commons/pantheon/packages/workflow/src/workflow/loader.ts` - Workflow and definition loading patterns

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Research findings on Pantheon schema-based definitions

  **WHY Each Reference Matters** (explain the relevance):
  - `AgentDefinitionSchema`: Shows how octave-commons structures agent/workflow definitions using schemas - olympia-clj should follow similar patterns for benchmark definitions
  - `loader.ts`: Shows how definitions are loaded and merged - olympia-clj can use similar patterns for benchmark discovery

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/bench/prompt_test.clj
  - [ ] Test covers: Benchmark data structure validates correctly, load-benchmarks reads files
  - [ ] clojure -M:test → PASS (all prompt structure tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:run -m octave.olympia.bench.prompt
  # Assert: No errors when defining benchmark data structure
  # Assert: load-benchmarks function exists and is callable
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from REPL execution
  - [ ] Benchmark data structure definition

  **Commit**: NO (wait for wave completion)

- [ ] 6. Create Configuration Management System

  **What to do**:
  - Define configuration data structure in `src/octave/olympia/config/agent.clj`:
    - `:model-variants` (vector of maps: `:id`, `:name`, `:provider`, `:model`)
    - `:prompt-strategies` (vector of maps: `:id`, `:name`, `:system-prompt`)
    - `:tool-configs` (vector of maps: `:id`, `:name`, `:available-tools`, `:disabled-tools`)
  - Create function `generate-configs` that computes full combinations (models × prompts × tools)
  - Create function `load-config` that reads configuration from EDN file
  - Write tests for configuration management

  **Must NOT do**:
  - Do NOT implement configuration validation schemas
  - Do NOT add dynamic configuration loading
  - Do NOT create configuration UI or CLI tools

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Configuration management task
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure data manipulation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5) | Sequential
  - **Blocks**: Task 7 (runtime depends on configs) | Blocked By: Task 1 (package structure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/profiles/duck.edn` - Profile configuration pattern (EDN-based)
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/profile_schema.clj` - Profile schema and validation pattern
  - `/home/err/devel/orgs/octave-commons/promethean/ecosystem.config.mjs` - PM2 profile and app configuration structure

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - User decision on "full combinations" configuration approach

  **WHY Each Reference Matters** (explain the relevance):
  - `duck.edn`: Shows how octave-commons stores agent profiles as EDN files - olympia-clj should follow this pattern
  - `profile_schema.clj`: Shows how profiles are structured and validated - olympia-clj can use similar patterns (without schema validation for v1)
  - `ecosystem.config.mjs`: Shows how configurations are organized for different profiles (dev, production) - olympia-clj should support similar organization

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/config/agent_test.clj
  - [ ] Test covers: Configuration structure validates, generate-configs produces correct combinations
  - [ ] clojure -M:test → PASS (all configuration tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:run -m octave.olympia.config.agent
  # Assert: generate-configs function exists
  # Assert: generate-configs returns non-empty vector when given model, prompt, and tool configs
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from REPL execution
  - [ ] Configuration data structure example

  **Commit**: YES (Group with Tasks 4, 5)
  - Message: `feat(bench): absorb benchmark DSL, create prompt data structure, configuration management`
  - Files: `src/octave/olympia/bench/`, `src/octave/olympia/config/`, `test/octave/olympia/bench/`, `test/octave/olympia/config/`
  - Pre-commit: `clojure -M:test`

- [ ] 7. Implement Agent Runtime

  **What to do**:
  - Create `src/octave/olympia/runtime/agent.clj`:
    - Function `run-benchmark`: `(run-benchmark benchmark-id config) → result`
    - Function `capture-timing`: Wrap execution with timing capture
    - Function `handle-timeout`: Timeout handling with configurable duration
    - Function `handle-error`: Error handling (crash, API failure)
  - Integrate with promethean-agent-system:
    - Use `(promethean/start-agent!)` to initialize agent
    - Use promethean tool registry to register benchmark as tool
    - Capture agent output via promethean state or world-state
  - Implement simple async execution using `future` or `promise` (no core.async channels)
  - Write tests for runtime functions

  **Must NOT do**:
  - Do NOT implement process supervision or restart
  - Do NOT use core.async channels (simple async only)
  - Do NOT create HTTP/API endpoints
  - Do NOT implement distributed execution

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Runtime implementation task
  - **Skills**: `["workspace-navigation"]`
    - `workspace-navigation`: Navigate promethean-agent-system to find agent execution functions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9) | Sequential
  - **Blocks**: Task 12 (CLI depends on runtime) | Blocked By: Tasks 3, 6

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/runtime/step.clj` - Agent runtime execution patterns
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/tools.clj` - Tool registration and invocation
  - `/home/err/devel/orgs/octave-commons/promethean/experimental/cephalon/src/agent/index.ts:45-78` - Agent lifecycle management (start, stop, tick) - TypeScript pattern to adapt to Clojure

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Metis guardrail: "runtime v1 = Synchronous or simple async execution with output capture and timing"
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/AGENTS.md` - Promethean agent system documentation

  **WHY Each Reference Matters** (explain the relevance):
  - `runtime/step.clj`: Shows how promethean-agent-system executes agents - olympia-clj must use these functions for agent runtime
  - `tools.clj`: Shows tool registration patterns - olympia-clj must register benchmarks as tools
  - `agent/index.ts:45-78`: TypeScript agent lifecycle patterns - adapt start/stop/tick concepts to Clojure for promethean-agent-system integration
  - `AGENTS.md`: Contains promethean-agent-system runtime documentation that describes agent execution API

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/runtime/agent_test.clj
  - [ ] Test covers: run-benchmark executes agent, capture-timing records time, handle-timeout cancels on timeout
  - [ ] Integration test: promethean-agent-system agent starts and executes benchmark
  - [ ] clojure -M:test → PASS (all runtime tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test :only 'octave.olympia.runtime.agent-test'
  # Assert: All runtime tests pass (execution, timing, timeout, error handling)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from runtime tests
  - [ ] Agent execution timing capture example

  **Commit**: NO (wait for wave completion)

- [ ] 8. Migrate 28 Benchmark Prompts

  **What to do**:
  - Read all 28 benchmark prompts from: `/home/err/devel/orgs/riatzukiza/promethean/docs/benchmarks/prompts/`
  - Convert each markdown prompt to EDN format with data structure from Task 5:
    - Extract frontmatter: `difficulty`, `scale`, `complexity`
    - Extract prompt content: `:prompt` key
    - Extract expected answer: `:answer` key
  - Create EDN files in `src/octave/olympia/bench/prompts/` organized by category:
    - `code-review/`, `documentation/`, `testing/`, `security/`, `performance/`, `architecture/`, `refactoring/`, `debugging/`, `migration/`, `kanban/`, `agent-development/`
  - Write tests to verify all 28 benchmarks are loaded correctly

  **Must NOT do**:
  - Do NOT keep markdown format (convert to EDN only)
  - Do NOT implement markdown parser (manual conversion)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Data migration task
  - **Skills**: `["workspace-navigation"]`
    - `workspace-navigation`: Locate benchmark prompt files

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9) | Sequential
  - **Blocks**: None (independent migration) | Blocked By: Task 5 (data structure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/riatzukiza/promethean/docs/benchmarks/prompts/code-review/ts-type-safety.md` - Example benchmark prompt format
  - `/home/err/devel/orgs/riatzukiza/promethean/docs/benchmarks/prompts/testing/unit-test-coverage.md` - Example benchmark prompt format
  - `/home/err/devel/orgs/riatzukiza/promethean/docs/benchmarks/README.md` - Benchmark system documentation with 28 categories

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - User decision: "Port benchmark prompts to Clojure"

  **WHY Each Reference Matters** (explain the relevance):
  - `ts-type-safety.md`: Shows markdown frontmatter format (difficulty, scale, complexity) that must be preserved in EDN conversion
  - `unit-test-coverage.md`: Another example of benchmark prompt structure to verify consistent format across all 28 prompts
  - `README.md`: Contains complete list of all 28 benchmark categories - ensures no benchmarks are missed during migration

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] All 28 EDN files created in `src/octave/olympia/bench/prompts/`
  - [ ] Test file created: test/octave/olympia/bench/prompts_test.clj
  - [ ] Test covers: All 28 benchmarks load correctly with correct metadata
  - [ ] clojure -M:test → PASS (all benchmark migration tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  find src/octave/olympia/bench/prompts -name "*.edn" | wc -l
  # Assert: Output equals 28 (all benchmarks converted)

  clojure -M:run -m octave.olympia.bench.prompt
  # Assert: discover-benchmarks returns vector of 28 benchmarks
  # Assert: Each benchmark has required keys (:id, :name, :category, :difficulty, :scale, :complexity, :prompt, :answer)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from find command (showing 28 files)
  - [ ] discover-benchmarks output showing all 28 benchmarks loaded

  **Commit**: YES (Group with Tasks 7, 9)
  - Message: `feat(bench): migrate 28 benchmark prompts to EDN format`
  - Files: `src/octave/olympia/bench/prompts/`, `test/octave/olympia/bench/prompts_test.clj`
  - Pre-commit: `clojure -M:test`

- [ ] 9. Implement Automated Grading

  **What to do**:
  - Create `src/octave/olympia/grader/auto.clj`:
    - Function `grade-automated`: `(grade-automated benchmark-result) → {:pass? boolean, :assertions passed/failed}`
    - Function `check-assertions`: Verify benchmark assertions (DSL: `calls`, `abstains`)
    - Function `compute-automated-score`: Convert pass/fail to score (100 for pass, 0 for fail)
  - Integrate with benchmark DSL:
    - Read DSL expectations from benchmark definition
    - Compare agent output against expectations
  - Write tests for automated grading

  **Must NOT do**:
  - Do NOT implement automated LLM-based grading
  - Do NOT add complex scoring algorithms (simple pass/fail only)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-low`
    - Reason: Grading logic implementation
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure data comparison

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8) | Sequential
  - **Blocks**: Tasks 10, 11 (result storage depends on grading) | Blocked By: Task 4 (DSL)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/dsl.clj` - DSL expectation definitions (calls, abstains)
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/benchmarks/tool_choice.clj` - Example of benchmark with expectations

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Metis guardrail: "Grading v1 = Basic pass/fail based on test outcomes, execution timing capture"

  **WHY Each Reference Matters** (explain the relevance):
  - `dsl.clj`: Contains DSL expectation macros (`calls`, `abstains`) that automated grading must evaluate against agent output
  - `tool_choice.clj`: Shows example benchmark with expectations - automated grading tests should verify correct tool invocation matches `calls` expectations

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/grader/auto_test.clj
  - [ ] Test covers: grade-automated returns correct pass/fail, check-assertions compares output to expectations
  - [ ] clojure -M:test → PASS (all automated grading tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test :only 'octave.olympia.grader.auto-test'
  # Assert: All automated grading tests pass
  # Assert: Pass/fail scoring works correctly (100 for pass, 0 for fail)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from grading tests
  - [ ] Automated grading output example (pass/fail result)

  **Commit**: NO (wait for wave completion)

- [ ] 10. Implement Human Grading CLI

  **What to do**:
  - Create `src/octave/olympia/grader/human.clj`:
    - Function `prompt-human-grade`: `(prompt-human-grade benchmark-id config agent-output) → {:grade 0-100}`
    - Function `save-human-grade`: Save human grade to result structure
  - Implement CLI interaction for human grading:
    - Display benchmark output to user
    - Prompt user for grade (0-100 scale)
    - Collect grade with input validation
  - Write tests for human grading (mock input)

  **Must NOT do**:
  - Do NOT implement automated human evaluation
  - Do NOT create web UI for grading

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: CLI interaction task
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure I/O

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential | Sequential
  - **Blocks**: Task 11 (result storage depends on human grading) | Blocked By: Task 9 (automated grading)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws_test.clj` - Example of CLI interaction testing
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/test/fantasia/test_helpers.clj` - Test helper patterns for mocking input

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - User decision: "Human evaluation workflow" = manual review via CLI

  **WHY Each Reference Matters** (explain the relevance):
  - `admin_ws_test.clj`: Shows how octave-commons tests CLI interactions - useful for testing human grading CLI
  - `test_helpers.clj`: Provides patterns for mocking user input in tests - critical for testing human grading without actual user interaction

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/grader/human_test.clj
  - [ ] Test covers: prompt-human-grade collects grade with validation, save-human-grade updates result structure
  - [ ] clojure -M:test → PASS (all human grading tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test :only 'octave.olympia.grader.human-test'
  # Assert: All human grading tests pass
  # Assert: Grade validation works (0-100 range, integer input)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from human grading tests
  - [ ] Human grading CLI mock interaction output

  **Commit**: NO (wait for wave completion)

- [ ] 11. Implement Result Storage

  **What to do**:
  - Create `src/octave/olympia/storage/edn.clj`:
    - Function `save-result`: `(save-result result) → file-path`
    - Function `load-result`: `(load-result file-path) → result`
    - File naming convention: `results/YYYY-MM-DD_benchmark-name_config.edn`
    - Result structure: `{:timestamp, :benchmark-id, :config, :outputs, :timings, :grades {:automated, :human, :composite}}`
  - Create results directory
  - Implement file existence check and overwrite logic
  - Write tests for result storage

  **Must NOT do**:
  - Do NOT use database (EDN files only)
  - Do NOT implement query APIs
  - Do NOT create dashboards or visualization

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: File I/O task
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure file operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential | Sequential
  - **Blocks**: Task 12 (CLI depends on result storage) | Blocked By: Tasks 9, 10

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/llm/ollama.clj` - EDN file usage for configuration
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/state.clj` - State file I/O patterns

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Metis guardrail: "Data v1 = Results stored as EDN files on filesystem"

  **WHY Each Reference Matters** (explain the relevance):
  - `ollama.clj`: Shows how promethean-agent-system uses EDN files for configuration - olympia-clj should follow same pattern for results
  - `state.clj`: Shows file I/O patterns for saving/loading state - applicable to result storage

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/storage/edn_test.clj
  - [ ] Test covers: save-result creates file with correct naming, load-result reads file correctly
  - [ ] clojure -M:test → PASS (all storage tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test :only 'octave.olympia.storage.edn-test'
  # Assert: All storage tests pass
  # Assert: save-result creates file in results/ directory
  # Assert: File name matches convention (YYYY-MM-DD_benchmark-name_config.edn)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from storage tests
  - [ ] Example result EDN file content

  **Commit**: YES (Group with Tasks 7, 8, 9, 10)
  - Message: `feat(runtime): implement agent runtime, migrate benchmarks, grading system, result storage`
  - Files: `src/octave/olympia/runtime/`, `src/octave/olympia/bench/prompts/`, `src/octave/olympia/grader/`, `src/octave/olympia/storage/`, `test/octave/olympia/runtime/`, `test/octave/olympia/bench/prompts_test.clj`, `test/octave/olympia/grader/`, `test/octave/olympia/storage/`, `results/`
  - Pre-commit: `clojure -M:test`

- [ ] 12. Create CLI Entry Points

  **What to do**:
  - Create `src/octave/olympia/core.clj`:
    - Main entry point with `-main` function
    - CLI commands:
      - `run`: Execute benchmark with specific config
      - `list-benchmarks`: List all available benchmarks
      - `list-configs`: List all available agent configurations
      - `grade-human`: Prompt for human evaluation of benchmark result
      - `grade-automated`: Run automated grading on benchmark result
  - Use tools.cli or similar for argument parsing
  - Integrate all subsystems: runtime, config, grading, storage
  - Write tests for CLI entry points

  **Must NOT do**:
  - Do NOT create HTTP/API endpoints
  - Do NOT add configuration UI or CLI tools

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: CLI integration task
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure CLI patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential | Sequential
  - **Blocks**: Tasks 13, 14, 15 (integration, docs, CI depend on CLI) | Blocked By: Task 11 (result storage)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/src/promethean/demo.clj` - Example CLI entry point
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/src/fantasia/core.clj` - Example CLI with argument handling

  **Documentation References** (specs and requirements):
  - Clojure CLI patterns: https://clojure.org/guides/cli
  - tools.cli docs: https://github.com/clojure/tools.cli

  **WHY Each Reference Matters** (explain the relevance):
  - `demo.clj`: Shows how promethean-agent-system structures CLI entry points - olympia-clj should follow similar patterns
  - `core.clj`: Shows CLI argument handling patterns - critical for olympia-clj CLI implementation

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Test file created: test/octave/olympia/core_test.clj
  - [ ] Test covers: CLI commands execute correctly (run, list-benchmarks, list-configs, grade-human, grade-automated)
  - [ ] clojure -M:test → PASS (all CLI tests)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:run -m octave.olympia.core --help
  # Assert: Help text displays all available commands (run, list-benchmarks, list-configs, grade-human, grade-automated)

  clojure -M:run -m octave.olympia.core list-benchmarks
  # Assert: Lists all 28 benchmarks with categories and metadata

  clojure -M:run -m octave.olympia.core list-configs
  # Assert: Lists all available agent configuration combinations
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from --help command
  - [ ] Terminal output from list-benchmarks and list-configs commands

  **Commit**: YES (Final wave commit)
  - Message: `feat(cli): create entry points and CLI commands`
  - Files: `src/octave/olympia/core.clj`, `test/octave/olympia/core_test.clj`
  - Pre-commit: `clojure -M:test`

- [ ] 13. Integration Tests

  **What to do**:
  - Create `test/octave/olympia/integration/` directory:
    - `full_benchmark_run_test.clj`: Test complete benchmark execution flow (config → runtime → grading → storage)
    - `config_combinations_test.clj`: Test full configuration generation (models × prompts × tools)
    - `benchmark_discovery_test.clj`: Test discovery of all 28 benchmarks
  - Verify end-to-end flow:
    - Load benchmark
    - Generate config
    - Run benchmark
    - Grade automatically
    - Save result
    - Load result back
  - Mock promethean-agent-system for integration tests

  **Must NOT do**:
  - Do NOT test promethean-agent-system itself (mock only)
  - Do NOT add integration tests for excluded features (PM2, HTTP API)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Integration testing
  - **Skills**: `[]`
    - No specialized skills needed - standard Clojure test patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 15) | Sequential
  - **Blocks**: None (final verification) | Blocked By: Task 12 (CLI depends on integration)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/cephalon-clj-brain/test/cephalon/brain/agent_test.clj` - Integration test patterns
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/backend/test/fantasia/sim/core_test.clj` - Simulation integration test patterns

  **Documentation References** (specs and requirements):
  - `/home/err/devel/.sisyphus/drafts/olympia-clj.md` - Definition of Done: "Test coverage > 80%, all tests pass"

  **WHY Each Reference Matters** (explain the relevance):
  - `agent_test.clj`: Shows how cephalon-clj-brain structures integration tests - olympia-clj should follow similar patterns
  - `core_test.clj`: Shows integration test patterns for complex flows - applicable to full benchmark run integration

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] Integration test file created: test/octave/olympia/integration/full_benchmark_run_test.clj
  - [ ] Test covers: Complete flow from config to result storage
  - [ ] clojure -M:test → PASS (all integration tests)
  - [ ] clojure -M:coverage → Coverage > 80%

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  clojure -M:test
  # Assert: All tests pass (0 failures, 0 errors)

  clojure -M:coverage
  # Assert: Coverage > 80%
  # Assert: Coverage report generated in target/coverage/
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from full test suite
  - [ ] Coverage report showing > 80%

  **Commit**: NO (wait for wave completion)

- [ ] 14. Documentation and README

  **What to do**:
  - Create README.md:
    - Package description and purpose
    - Quick start guide
    - CLI command reference
    - Benchmark structure documentation
    - Configuration format documentation
    - Result format documentation
    - Examples
  - Create AGENTS.md (if needed for agent-specific guidance)
  - Document dependencies and versions
  - Document test execution commands

  **Must NOT do**:
  - Do NOT create API documentation (no API in v1)
  - Do NOT create extensive tutorial documentation (keep README concise)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `writing`
    - Reason: Documentation writing task
  - **Skills**: `[]`
    - No specialized skills needed - standard markdown documentation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 13, 15) | Sequential
  - **Blocks**: Task 15 (CI depends on docs) | Blocked By: Task 12 (CLI implementation)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/README.md` - Promethean agent system README
  - `/home/err/devel/orgs/octave-commons/cephalon-clj/README.md` - Cephalon README structure

  **Documentation References** (specs and requirements):
  - Workspace README: `/home/err/devel/README.md` - Workspace documentation structure

  **WHY Each Reference Matters** (explain the relevance):
  - `promethean-agent-system/README.md`: Shows how octave-commons packages structure README - olympia-clj should follow similar patterns
  - `cephalon-clj/README.md`: Another example of README structure in octave-commons - helpful for consistency
  - `/home/err/devel/README.md`: Workspace README shows overall documentation structure - ensures olympia-clj fits into ecosystem

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] README.md created in package root
  - [ ] README contains all sections: description, quick start, CLI reference, benchmark structure, config format, result format, examples
  - [ ] clojure -M:test → PASS (all tests still pass)

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  ls -la README.md
  # Assert: README.md file exists

  head -50 README.md
  # Assert: Output contains "# olympia-clj", "Quick Start", "CLI Commands"
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from ls and head commands
  - [ ] README.md content sample

  **Commit**: NO (wait for wave completion)

- [ ] 15. CI/CD Workflow

  **What to do**:
  - Create `.github/workflows/ci.yml`:
    - Checkout step
    - Setup Java step (Java 17 and 21)
    - Cache dependencies step (Maven, .gitlibs)
    - Install deps step: `clojure -P`
    - Lint step (if lint alias added)
    - Test step: `clojure -M:test`
    - Coverage step: `clojure -M:coverage`
  - Follow gates-of-aker CI/CD pattern
  - Configure coverage upload to Codecov (if possible)

  **Must NOT do**:
  - Do NOT create complex CI workflows (simple test/coverage only)
  - Do NOT add deployment steps (no deployment in v1)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: CI/CD setup following established patterns
  - **Skills**: `["git-master"]`
    - `git-master`: For CI workflow file creation and git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 13, 14) | Sequential
  - **Blocks**: None (final task) | Blocked By: Task 14 (documentation)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/.github/workflows/backend.yml` - CI/CD workflow reference
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/.github/workflows/ci.yml` - Comprehensive CI workflow

  **Documentation References** (specs and requirements):
  - GitHub Actions docs: https://docs.github.com/en/actions
  - Codecov docs: https://docs.codecov.com/docs/quick-start

  **WHY Each Reference Matters** (explain the relevance):
  - `backend.yml`: Shows CI/CD workflow structure in octave-commons - olympia-clj should copy this pattern exactly
  - `ci.yml`: Comprehensive CI workflow with matrix testing and coverage upload - best practice to follow

  **Acceptance Criteria**:

  > **CRITICAL: AGENT-EXECUTABLE VERIFICATION ONLY**

  **If TDD (tests enabled):**
  - [ ] CI workflow file created: .github/workflows/ci.yml
  - [ ] Workflow includes: Checkout, Setup Java, Cache, Install deps, Test, Coverage
  - [ ] Workflow uses clojure commands: `clojure -M:test`, `clojure -M:coverage`

  **Automated Verification** (using Bash):
  ```bash
  # Agent executes:
  cd /home/err/devel/orgs/octave-commons/olympia-clj
  ls -la .github/workflows/ci.yml
  # Assert: CI workflow file exists

  cat .github/workflows/ci.yml | grep "clojure -M:test"
  # Assert: Workflow contains test command
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from ls and grep commands
  - [ ] CI workflow file content

  **Commit**: YES (Final commit)
  - Message: `ci(ci): add CI/CD workflow for test and coverage`
  - Files: `.github/workflows/ci.yml`, `README.md`
  - Pre-commit: `clojure -M:test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 6 | `feat(bench): absorb benchmark DSL, create prompt data structure, configuration management` | src/octave/olympia/bench/, src/octave/olympia/config/, test/ | clojure -M:test |
| 11 | `feat(runtime): implement agent runtime, migrate benchmarks, grading system, result storage` | src/octave/olympia/runtime/, src/octave/olympia/bench/prompts/, src/octave/olympia/grader/, src/octave/olympia/storage/, test/, results/ | clojure -M:test |
| 12 | `feat(cli): create entry points and CLI commands` | src/octave/olympia/core.clj, test/ | clojure -M:test |
| 15 | `ci(ci): add CI/CD workflow for test and coverage` | .github/workflows/ci.yml, README.md | clojure -M:test |

---

## Success Criteria

### Verification Commands
```bash
# Test execution
cd /home/err/devel/orgs/octave-commons/olympia-clj
clojure -M:test
# Expected: All tests pass, 0 failures, 0 errors

# Coverage report
clojure -M:coverage
# Expected: Coverage > 80%, report in target/coverage/

# Run benchmark
clojure -M:run -m octave.olympia.core --benchmark hello-world --config model:gpt-4,prompt:default
# Expected: Benchmark executes, agent output captured, timing recorded, result saved to EDN file

# List benchmarks
clojure -M:run -m octave.olympia.core list-benchmarks
# Expected: Lists all 28 benchmarks with categories and metadata

# List configs
clojure -M:run -m octave.olympia.core list-configs
# Expected: Lists all available agent configuration combinations
```

### Final Checklist
- [ ] Package structure created with deps.edn, src/, test/
- [ ] Benchmark DSL absorbed from promethean-agent-system
- [ ] All 28 benchmark prompts migrated to Clojure EDN structures
- [ ] Agent runtime executes benchmarks and captures outputs/timing
- [ ] Configuration management supports agent variants (models × prompts × tools)
- [ ] Grading system provides automated pass/fail and manual 0-100 evaluation
- [ ] Results stored as EDN files with correct naming convention
- [ ] CLI entry points provide run, list-benchmarks, list-configs, grade-human, grade-automated commands
- [ ] Test coverage > 80%
- [ ] All tests pass
- [ ] CI/CD workflow runs tests and coverage
- [ ] README.md documents all features and usage
- [ ] All guardrails respected (no promethean-agent-system modification, no PM2, no complex parallel execution, no database, no HTTP API)
- [ ] All Metis recommendations addressed
