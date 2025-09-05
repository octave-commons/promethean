---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Expand task mock broker"
conversation_id: 68acf5e2-b7c4-832a-97c7-b8ce5e3bbc02
create_time: 08/25/2025 at 6:46 PM
update_time: 08/25/2025 at 9:52 PM
---

# Title: Expand task mock broker

Created: 08/25/2025 at 6:46 PM
Last Updated: 08/25/2025 at 9:52 PM
Chat URL: https://chat.openai.com/c/68acf5e2-b7c4-832a-97c7-b8ce5e3bbc02


>[!nexus_user] **User** - 08/25/2025 at 6:46 PM
> expand this task:
> ## 🛠️ Description
> 
> Mock the broker for tests
> 
> ---
> 
> ## 🎯 Goals
> 
> - Allow tests to pass for modules which require the broker to function with out needing to access the network
> 
> ---
> 
> ## 📦 Requirements
> 
> - [ ] Detail requirements.
> 
> ---
> 
> ## 📋 Subtasks
> 
> - [ ] Outline steps to implement.
> 
> ---
> 
> ## 🔗 Related Epics
> 
> #framework-core
> 
> ---
> 
> ## ⛓️ Blocked By
> 
> Nothing
> 
> ## ⛓️ Blocks
> 
> Nothing
> 
> ---
> 
> ## 🔍 Relevant Links
> 
> - [[kanban.md]]
> #incoming
<!-- UID: 0e00bcb7-1c35-4634-bc8b-c90e747a47c0 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 6:46 PM
> Here’s a no-nonsense expansion that you can drop into your board. I’ve treated this like a mini-spec + work plan so Codex (or you) can just execute.
> 
> # Mock the Broker for Tests
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #framework-core #testing #infra #typescript #fastify #websockets #mongodb #chroma #promethean
> 
> ---
> 
> ## 🛠️ Description
> Create a fully in-memory **Broker Mock** that mirrors the public contract of the real broker (publish / subscribe / unsubscribe now; queue semantics later), so any module that currently depends on the broker can be tested without network access. Provide deterministic hooks (time, ordering, error/latency injection), and a simple adapter so services can swap “real vs mock” via DI or env at test boot.
> 
> ---
> 
> ## 🎯 Goals
> - Run unit + integration tests for broker-dependent modules **without** opening sockets or requiring an external broker process. 
> - Deterministic tests: control time, event ordering, retries, backpressure, and failure modes. 
> - Zero network usage. Zero flakiness. 
> - Minimal friction: drop-in `BrokerClient` replacement with identical surface.
> 
> ---
> 
> ## 📦 Requirements
> - [ ] **Interface parity:** Expose the same TypeScript interface used by real clients (`subscribe`, `unsubscribe`, `publish`, `request/response?` if present, and the current message envelope shape). 
> - [ ] **In-memory topic bus:** Maintain per-topic subscriber lists; deliver messages synchronously by default; support async delivery when latency is injected. 
> - [ ] **Deterministic scheduler:** A tiny scheduler to control “ticks” for delivery to avoid race conditions in tests. 
> - [ ] **Failure/latency injection:** Configurable drop %, fixed/variable latency, forced disconnects, backpressure overflow policy (drop/newest/block), and ordered/unordered modes. 
> - [ ] **Fake time:** Optional fake clock (advance time manually in tests) for retry/timeout logic. 
> - [ ] **Backpressure simulation:** Bounded per-subscriber queue with metrics; configurable overflow strategy. 
> - [ ] **Metrics & hooks:** Counters for published / delivered / dropped / retried; test-side hooks to assert what happened. 
> - [ ] **No global leaks:** Independent instances per test; auto-teardown; no retained static state. 
> - [ ] **Test utils:** Fixtures, spies, and helpers to assert “message X reached subscriber Y with payload Z in order N”. 
> - [ ] **Env-switchable:** Respect existing env selection (`BROKER_IMPL=mock|real`) or DI token to swap at process start. 
> - [ ] **Docs:** Short README with examples; guidance for common failure scenarios. 
> - [ ] **CI-safe:** Runs on CI with no network and no ports. 
> - [ ] **Future-proof for queues:** Stub queue API surface (`declare`/no-op) with TODOs so it’s easy to wire later, without breaking tests today. 
> - [ ] **Imports:** Use existing namespace rules (e.g., **@shared/ts/dist/**… where applicable). Don’t invent aliases.
> 
> ---
> 
> ## 📋 Subtasks
> - [ ] **Define the contract**: Extract the minimal `BrokerClient` interface from current code (pub/sub/unsub + message envelope), place an interface file in `@shared/ts` and ensure it’s the single source of truth. 
> - [ ] **Mock implementation**: 
>  - [ ] Implement `InMemoryBroker` (per-instance): topic → subscribers (ordered Set). 
>  - [ ] Implement `publish(topic, message, opts?)`: immediate or scheduled dispatch. 
>  - [ ] Implement `subscribe(topic, handler, opts?)`: returns `unsubscribe()` cleanup. 
>  - [ ] Delivery semantics: default **in-order** per topic; optional “shuffle” to simulate out-of-order. 
>  - [ ] Backpressure: per-subscriber ring buffer with size limit and policy (drop/head, drop/tail, throw, block with promise). 
>  - [ ] Failure injection: 
>  - [ ] `latencyMs` (fixed or range) 
>  - [ ] `dropRate` (0–1) 
>  - [ ] `disconnectAfter(N)` / `disconnectNow()` 
>  - [ ] `fault(topicPattern, predicate)` to selectively fail. 
>  - [ ] Fake clock (optional): tiny clock you can `advance(ms)` for timeout/retry tests. 
>  - [ ] Metrics: counters + event log for assertions. 
> - [ ] **Adapter / DI**: 
>  - [ ] Add `createBrokerClient()` factory that returns real or mock based on env or an injected token. 
>  - [ ] Keep API identical so services don’t branch. 
> - [ ] **Test Utilities** (`@shared/ts/dist/test/broker-utils`): 
>  - [ ] `expectDelivered({topic, times, predicate})` 
>  - [ ] `awaitNextMessage(topic)` / `drain(topic)` 
>  - [ ] `recordingSubscriber()` to capture payloads with timestamps/seq ids. 
>  - [ ] `withMockBroker(config, fn)` fixture wrapper (handles setup/teardown). 
> - [ ] **Refactor touch points**: 
>  - [ ] Replace direct imports of the real broker with the shared `BrokerClient` interface + factory in services that have tests. 
>  - [ ] Ensure no module reaches for WebSocket/HTTP transport directly during tests. 
> - [ ] **Initial conversions** (pick high-value services first): 
>  - [ ] `services/ts/cephalon` (contextManager / collectionManager) 
>  - [ ] `services/ts/smartgpt-bridge` (router/tools that publish events) 
>  - [ ] `services/ts/heartbeat` (where it emits broker pings) 
> - [ ] **Add example tests** (vitest): 
>  - [ ] Happy path pub/sub ordering. 
>  - [ ] Unsubscribe stops delivery. 
>  - [ ] Latency/drops/backpressure behavior. 
>  - [ ] Timeout/retry logic using fake clock. 
>  - [ ] Fault injection by topic/predicate. 
> - [ ] **Docs**: `docs/testing/broker-mock.md` showing usage patterns and common pitfalls. 
> - [ ] **CI**: Ensure test command uses mock by default (`BROKER_IMPL=mock`).
> 
> ---
> 
> ## 🧩 Design Notes (keep it simple, deterministic)
> **Message envelope (mirror what you already use):**
> ```ts
> type BrokerMessage<T = unknown> = {
>  id: string; // uuid
>  topic: string;
>  ts: number; // epoch ms (fake clock if enabled)
>  payload: T;
>  headers?: Record<string, string>;
> };
> ```
> 
> **Interface (shared, single source of truth):**
> ```ts
> export interface BrokerClient {
>  publish<T>(topic: string, msg: T, opts?: PublishOpts): Promise<void>;
>  subscribe<T>(topic: string, handler: (msg: BrokerMessage<T>) => Promise<void> | void, opts?: SubOpts): Unsubscribe;
>  unsubscribe(topic: string, handler: Function): void; // convenience
>  close(): Promise<void>;
> }
> ```
> 
> **Mock config (for tests):**
> ```ts
> export type MockBrokerConfig = {
>  latencyMs?: number | { min: number; max: number };
>  dropRate?: number; // 0..1
>  ordering?: 'in-order' | 'shuffle';
>  bufferSize?: number; // per-subscriber
>  overflow?: 'drop-oldest' | 'drop-newest' | 'throw' | 'block';
>  useFakeClock?: boolean;
>  faults?: Array<{ match: RegExp; when?: (m: BrokerMessage) => boolean; action: 'drop' | 'error' | 'delay' }>;
> };
> ```
> 
> **Deterministic scheduler:** 
> - Default: synchronous inline delivery (fast unit tests). 
> - When latency or async mode is on, enqueue to a per-topic microtask queue controlled by the fake clock or a test-owned tick: `await broker.tick()` or `clock.advance(10)`.
> 
> **Backpressure:** 
> - Per handler, a ring buffer (size N). When full, follow `overflow` policy. Expose counters so tests can assert dropped vs delivered.
> 
> **Failure injection patterns:** 
> - Global `dropRate`. 
> - Topic-pattern faults: `faults: [{ match: /^voice\./, action: 'drop' }]`. 
> - `disconnectNow()` to simulate transport death; further publish/subscribe throws.
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] Tests can run with **no network** and **no external broker**. 
> - [ ] The mock implements the same **public interface** as the real broker client; swapping impl requires **no test code changes** beyond factory usage. 
> - [ ] Deterministic ordering by default; controllable non-determinism (shuffle) when requested. 
> - [ ] Configurable latency, drops, disconnects, and backpressure; each is **assertable via metrics**. 
> - [ ] No global state leaks across tests; parallel test runs are isolated. 
> - [ ] Minimal docs + examples committed and referenced from `README` or `docs/testing/broker-mock.md`. 
> - [ ] CI uses the mock by default and passes on a clean tree.
> 
> ---
> 
> ## 🔗 Related Epics
> - #framework-core
> 
> ---
> 
> ## ⛓️ Blocked By
> - Nothing
> 
> ## ⛓️ Blocks
> - Enables reliable tests for services coupled to broker messages (cephalon, heartbeat, smartgpt-bridge, etc.).
> 
> ---
> 
> ## 🔍 Relevant Links
> - [[kanban.md]]
> - #incoming
> 
> ---
> 
> ## 🧪 Example Test Sketches (vitest-style)
> ```ts
> it('delivers messages in order by default', async () => {
>  const broker = createMockBroker({ ordering: 'in-order' });
>  const seen: number[] = [];
>  const unsub = broker.subscribe<number>('ctx.update', m => { seen.push(m.payload); });
>  await broker.publish('ctx.update', 1);
>  await broker.publish('ctx.update', 2);
>  expect(seen).toEqual([1, 2]);
>  unsub();
> });
> 
> it('can inject latency and drop messages', async () => {
>  const broker = createMockBroker({ latencyMs: 10, dropRate: 0.5 });
>  const rec = recordingSubscriber<number>();
>  broker.subscribe('voice.frame', rec.handler);
>  for (let i = 0; i < 10; i++) await broker.publish('voice.frame', i);
>  await broker.tickAll(); // drain scheduler
>  expect(rec.count()).toBeLessThan(10);
>  expect(broker.metrics().published).toBe(10);
>  expect(broker.metrics().delivered + broker.metrics().dropped).toBe(10);
> });
> ```
> 
> ---
> 
> ## ⚠️ Pitfalls & Guardrails
> - Don’t let tests **implicitly depend on real time**; use the fake clock or explicit ticks. 
> - Keep the mock **simple**: avoid re-implementing transport layers. We only mimic **observable behavior**, not internal sockets. 
> - Mirror the **envelope shape** exactly to prevent brittle adapter code. 
> - No new TS path aliases. Use existing **@shared/ts/dist/** import patterns if/when this lands in shared. 
> - Resist feature creep: queue semantics can be stubbed behind an interface but implemented later.
> 
> ---
> 
> ## 🗂️ Proposed File Layout (suggest—adapt to your structure)
> - `shared/ts/src/broker/types.ts` — `BrokerClient`, envelopes, opts 
> - `shared/ts/src/broker/mock.ts` — `InMemoryBroker`, scheduler, metrics 
> - `shared/ts/src/broker/fakeClock.ts` — tiny controllable clock 
> - `shared/ts/src/test/broker-utils.ts` — fixtures & assertions 
> - `services/ts/*/test/*.spec.ts` — conversions to use factory 
> - `docs/testing/broker-mock.md` — usage + patterns
> 
> ---
> 
> ## 📣 Definition of Done
> - Mock broker shipped in shared code, exported through **@shared/ts/dist**. 
> - At least **two** broker-dependent services converted to use the factory in tests, with flaky tests removed. 
> - CI green with network disabled for those suites. 
> - Docs + examples merged.
> 
> #tags #promethean #broker #mock #testing #vitest #typescript #di #inmemory #deterministic
<!-- UID: 50c186b2-0d57-4fa3-8967-02532f8ee9b1 -->

---




>[!nexus_user] **User** - 08/25/2025 at 6:51 PM
> And this one:
> ## 🛠️ Task: Pin versions in configs
> 
> Ensure Promethean and Codex configurations explicitly pin model and dependency versions to prevent silent upgrades.
> 
> ---
> 
> ## 🎯 Goals
> - Lock model versions across services
> - Document pinned versions in version control
> 
> ---
> 
> ## 📦 Requirements
> - [ ] Update relevant config files with exact versions
> - [ ] Commit changes with accompanying notes
> 
> ---
> 
> ## 📋 Subtasks
> - [ ] Identify configs lacking explicit versions
> - [ ] Add version pins
> 
> ---
> 
> ## 🔗 Related Epics
> #ops #codex-task
> 
> ---
> 
> ## ⛓️ Blocked By
> Nothing
> 
> ## ⛓️ Blocks
> Nothing
> 
> ---
> 
> ## 🔍 Relevant Links
> - [kanban](../boards/kanban.md)
> #accepted
<!-- UID: dd8cedd4-ad6e-4d3e-bf49-1cd90eb39565 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 6:51 PM
> Got it. Here’s a practical expansion you can paste into the board and hand to Codex. It’s opinionated, deterministic, and aims to stop every “oops it upgraded” class of failure.
> 
> # Pin versions in configs
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #ops #codex-task #release-engineering #ci #sre #supply-chain #promethean
> 
> ---
> 
> ## 🛠️ Task
> Ensure Promethean and Codex configs **explicitly pin** model, image, tool, and library versions. No floating tags, no implicit latest, no wildcard ranges.
> 
> ---
> 
> ## Why this matters (short and blunt)
> - Silent upgrades = ghost bugs. 
> - Reproducibility > vibes. 
> - If CI and prod don’t resolve to the **same** artifacts, your incident postmortems write themselves.
> 
> ---
> 
> ## 🎯 Goals
> - All services resolve dependencies and models to **exact** versions/digests.
> - A **single source of truth** (matrix) lives in git for human review.
> - CI **fails** when an unpinned ref sneaks in.
> 
> ---
> 
> ## 📦 Requirements
> - [ ] **Exact semver** for JS/TS (`"1.2.3"`), **no** `^`, `~`, `*`, ranges, or `latest`. 
> - [ ] **Python locked** with `uv` (project uses `uv` + in-repo `.venv`): `pyproject.toml` + committed `uv.lock`. No bare `requirements.txt` without hashes. 
> - [ ] **Docker images pinned** by **digest** (`image: node:22.5.1@sha256:...`). No floating majors/minors. 
> - [ ] **GitHub Actions pinned** to **commit SHAs**, not `@v4` tags. 
> - [ ] **Ollama/OpenVINO/Whisper/TTS/Embed** models pinned to **explicit tags or artifact hashes**. No “latest” or unqualified model names. 
> - [ ] **System packages** pinned (`apt-get install pkg=1.2.3-*`) or vendor apt repo with version pin + `apt-mark hold`. 
> - [ ] **Lockfiles committed** (`package-lock.json` or `pnpm-lock.yaml`, `uv.lock`, etc.). 
> - [ ] **Engines/toolchains** declared and enforced (Node, Python, `uv`, `npm`/`pnpm`) across dev/CI. 
> - [ ] **Version Matrix** doc (human-readable) committed and referenced by CI.
> 
> ---
> 
> ## 📋 Subtasks
> - [ ] **Inventory & Audit**
>  - [ ] Locate all dependency surfaces:
>  - JS/TS: `package.json`, lockfiles, `pnpm-workspace.yaml`
>  - Python: `pyproject.toml`, `uv.lock`, any `requirements*.txt`
>  - Docker: `Dockerfile`, `docker-compose.yml`, k8s manifests
>  - CI: `.github/workflows/*.yml` actions refs
>  - System: any `apt`, `apk`, `dnf` invocations
>  - Models: Ollama model lists, OpenVINO IRs, Whisper/TTS configs
>  - Tools: PM2 ecosystem, Makefile/Hy wrappers (`tools/build.hy`), `ecosystem.config.js`
>  - [ ] Produce a quick diffable list of offenders (floating tags, ranges, latest).
> - [ ] **Define the Version Matrix**
>  - [ ] Create `docs/ops/VERSION_MATRIX.md` with sections:
>  - **Runtimes** (Node, Python, uv)
>  - **JS/TS deps** (critical libs pinned)
>  - **Python deps** (critical libs pinned)
>  - **Containers** (base image + digest)
>  - **System packages**
>  - **Models** (Ollama, OpenVINO IR/ops-set, Whisper/TTS, Embeddings)
>  - **CI actions** (action@commit SHA)
>  - [ ] Add rationale/compatibility notes (e.g., OpenVINO opset vs model).
> - [ ] **Pin Everything**
>  - [ ] JS/TS: replace `^`/`~` with exact; run `npm i --package-lock-only` (or `pnpm install --frozen-lockfile`) and commit.
>  - [ ] Python: lock with `uv lock`; commit `uv.lock`; forbid bare `pip install`.
>  - [ ] Docker: switch to digests (`FROM node:22.5.1@sha256:...`); update compose/manifests.
>  - [ ] CI: replace `uses: actions/checkout@v4` → `@<full SHA>`; document how to bump.
>  - [ ] Models:
>  - **Ollama**: use explicit tags (`qwen2.5-coder:7b-instruct-q5_K_M`), capture with `ollama show <model> --modelfile` and record source SHA if available.
>  - **OpenVINO**: pin IR artifacts (store under versioned path), record framework/opset.
>  - **Whisper/TTS/Embeddings**: pin to model filename or release ID; store checksums.
>  - [ ] System packages: set explicit versions and `apt-mark hold` where feasible.
> - [ ] **Guardrails**
>  - [ ] Add `scripts/ci/check-pins.{js,py}` (pick one) that scans for:
>  - `latest`, unqualified `FROM`, `uses: ...@v\d+`, semver ranges, unpinned apt, unqualified model names.
>  - [ ] Add a pre-commit hook + CI step that **fails** on violations.
> - [ ] **Docs & Runbooks**
>  - [ ] `docs/ops/VERSIONING_POLICY.md`: how to bump + verify + roll back.
>  - [ ] Update `README`/`CONTRIBUTING` with “No floating versions” rule.
> - [ ] **Commit**
>  - [ ] Batch the change by service to keep diffs reviewable.
>  - [ ] Include matrix + lockfiles in each PR.
> 
> ---
> 
> ## 🧩 Design Notes / Conventions
> - **JS/TS**
>  - Use exact semver: `"1.2.3"`. 
>  - Enforce with `npm ci`/`pnpm fetch` in CI; never `npm install` without a lockfile.
> - **Python**
>  - `pyproject.toml` → `uv lock` → commit `uv.lock`. 
>  - For any `requirements.txt`, include `--require-hashes` + pinned hashes or delete in favor of uv.
> - **Docker**
>  - Always pin base images to **digest** and specific tag (both).
>  - Avoid multi-stage using different floating parents; pin all stages.
> - **CI**
>  - Pin each `uses:` to full SHA; add a comment with the tag for humans:
>  ```yaml
>  uses: actions/checkout@b4ffde... # v4.1.7
>  ```
> - **Models**
>  - Treat models like binaries: versioned path, checksum file (`.sha256`), and provenance (download URL or commit).
>  - Keep a `models/README.md` describing each model’s intent and compatibility.
> - **Tools & Engines**
>  - Add `"engines": { "node": "22.5.1" }` to root `package.json`; enforce with `engine-strict` in `.npmrc`.
>  - Record Python `3.x.y` in `VERSION_MATRIX.md` and enforce in CI image.
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] No floating versions in **any** config (JS/TS, Python, Docker, CI, models, system). 
> - [ ] Lockfiles committed and verified by CI (`npm ci`/`pnpm install --frozen-lockfile`, `uv sync --frozen`). 
> - [ ] All Docker/compose/k8s images use **tag+digest**. 
> - [ ] All GitHub Actions pinned to **commit SHAs**. 
> - [ ] “Pins linter” runs in CI and **fails** on violations. 
> - [ ] `docs/ops/VERSION_MATRIX.md` and `docs/ops/VERSIONING_POLICY.md` exist and are referenced from the repo root docs. 
> - [ ] Rollback procedure documented (how to revert a pin bump safely).
> 
> ---
> 
> ## 🧪 Suggested Automation (safe one-liners)
> > These are guardrails. Use them to find offenders; don’t blindly apply.
> 
> - **Find semver ranges (JS/TS):**
>  ```bash
>  jq -r '.dependencies + .devDependencies | to_entries[] | select(.value|test("^[~^]")) | "\(.key): \(.value)"' package.json
>  ```
> - **Detect `latest` & unpinned images:**
>  ```bash
>  rg -n 'FROM .*:latest|image: .*:latest|FROM [^@]+:[^@]+$' --glob '!node_modules'
>  ```
> - **Find unpinned GH Actions:**
>  ```bash
>  rg -n 'uses:\s+\S+@v\d+(\.\d+)?$' .github/workflows
>  ```
> - **Find apt installs without version:**
>  ```bash
>  rg -n 'apt(-get)?\s+install(?!.*=)' --glob '!node_modules'
>  ```
> - **Flag unqualified model names (Ollama et al.):**
>  ```bash
>  rg -n '\bollama (run|pull)\s+\w+(:\S+)?$' services | rg -v ':'
>  ```
> 
> ---
> 
> ## 🗂️ Deliverables / Files to touch
> - `docs/ops/VERSION_MATRIX.md` (new) 
> - `docs/ops/VERSIONING_POLICY.md` (new) 
> - `.github/workflows/*` (pin to SHAs + add check step) 
> - `Dockerfile`, `docker-compose.yml`, k8s manifests (digests) 
> - `package.json` (+ lockfile) across services 
> - `pyproject.toml`, `uv.lock` across Python services 
> - Model manifests: `models/**/manifest.json`, checksums 
> - Pre-commit / CI linter: `scripts/ci/check-pins.js` (or `.py`) 
> - Makefile / `tools/build.hy`: add frozen installs and version guards
> 
> ---
> 
> ## Commit template
> ```
> chore(versions): pin runtimes, deps, images, models; add pins linter
> 
> - Pin JS/TS deps to exact versions; commit lockfiles
> - Lock Python with uv; commit uv.lock
> - Pin Docker images to tag+digest
> - Pin GitHub Actions to commit SHAs
> - Add scripts/ci/check-pins and wire into CI
> - Add docs/ops/VERSION_MATRIX.md + VERSIONING_POLICY.md
> ```
> 
> ---
> 
> ## 🔗 Related Epics
> - #ops 
> - #codex-task
> 
> ---
> 
> ## ⛓️ Blocked By
> - Nothing
> 
> ## ⛓️ Blocks
> - Reproducible CI/CD 
> - Deterministic perf testing 
> - Supply-chain controls
> 
> ---
> 
> ## ⚠️ Pitfalls & Guardrails
> - **Digest drift**: when bumping a tag, always update the digest; never rely on tag alone. 
> - **Actions confusion**: tags can be force-moved; use SHAs and annotate with the tag in a comment. 
> - **Model ambiguity**: different quantizations ≠ same model; record quantization and build flags. 
> - **Local vs CI**: enforce engines; otherwise “works on my machine” syndrome returns. 
> - **Hidden installers**: scripts that call `pip install`/`npm i` at runtime undo reproducibility—purge them or freeze.
> 
> #tags #promethean #versioning #pinning #ci #docker #uv #ollama #openvino #sre #supplychain
<!-- UID: 0fd52ecc-ace9-4dea-b53b-95ae50fee69d -->

---




>[!nexus_user] **User** - 08/25/2025 at 6:54 PM
> # Description
> 
> Remove all python code from our repo, replace it with hy.
> Set up hy modules like ts and sibilant. Have the python compile to dist, and make sure the ./dist folder is ignored.
> 
> Add a pre commit hook which explicitly scans the non ignored files for .py extensions, rejects the commit, and unstages those files.
> 
> Make sure it's clearly documented in as many places as seems reasonable that python is forbidden.
> 
> If I am going to have to deal with that world, it may as well be in a lisp.
> 
> ## Requirements/Definition of done
> 
> - If it doesn't have this, we can't accept it
> 
> ## Tasks 
> 
> - [ ] Step 1
> - [ ] Step 2
> - [ ] Step 3
> - [ ] Step 4
> 
> ## Relevent resources
> 
> You might find [this] useful while working on this task
> 
> ## Comments
> 
> Useful for agents to engage in append only conversations about this task.
<!-- UID: cc35570e-a835-45ec-9b01-3cf276fdc034 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 6:54 PM
> Alright, here’s a hard-line plan you can paste into the board. It bans Python source from the repo, moves all existing Python logic to **Hy**, compiles Hy to **`./dist`** (mirroring your TS/Sibilant pattern), and enforces the rule with a pre-commit hook that **rejects** any `.py` in tracked files outside `dist/`.
> 
> # Ban Python; Migrate to Hy; Compile to `./dist`
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #architecture #lang #hy #python-ban #build #ci #tooling #promethean
> 
> ---
> 
> ## 🧨 Rationale (short + blunt)
> - One language family per runtime. If we’re in CPython land, it’ll be **Lisp (Hy)**. 
> - No more “accidental Python” sneaking into commits. 
> - Reproducible build: Hy sources → compiled Python in `./dist`, **ignored by git**.
> 
> ---
> 
> ## Requirements / Definition of Done
> - **No `.py` files** committed anywhere outside `./dist`. 
> - All former Python services/libs are **ported to Hy** (`.hy`), with identical public APIs. 
> - Hy build produces **importable Python** under `./dist` that mirrors source layout. 
> - **Pre-commit hook** blocks and un-stages any tracked `.py` outside `./dist`. 
> - Repo docs explicitly state **“Python source forbidden”**; multiple touchpoints. 
> - CI runs **only** from Hy sources (compiled in job), never from stray `.py`. 
> - `./dist` is **git-ignored**; local/CI builds deterministic.
> 
> ---
> 
> ## High-Level Plan
> 1. **Quarantine:** add guardrails (hook, gitignore, CI) before changes. 
> 2. **Module Layout:** standardize Hy source roots (mirroring TS/Sibilant). 
> 3. **Build:** compile Hy → Python into `./dist` with preserved package structure. 
> 4. **Ports:** convert Python modules to Hy with 1:1 APIs. 
> 5. **Entrypoints:** run from compiled outputs (or `hy -m` during dev). 
> 6. **Docs & Enforcement:** loud policy + CI checks.
> 
> ---
> 
> ## 📋 Tasks
> 
> ### 0) Repo Guardrails (do this first)
> - [ ] **.gitignore** 
>  - Add/confirm:
>  ```
>  dist/
>  **/__pycache__/
>  **/*.pyc
>  ```
> - [ ] **Pre-commit hook** (blocks & un-stages `.py` outside `dist/`) 
>  Create `.githooks/pre-commit` and wire via `.git/config` or `core.hooksPath=.githooks`:
>  ```bash
>  #!/usr/bin/env bash
>  set -euo pipefail
> 
>  # Find staged .py files not under dist/
>  offenders=$(git diff --cached --name-only --diff-filter=ACMR | rg '\.py$' | rg -v '^dist/')
> 
>  if [[ -n "${offenders}" ]]; then
>  echo "❌ Python source is forbidden. Unstaging offending files:"
>  echo "${offenders}" | sed 's/^/ - /'
>  # Unstage each offender
>  while read -r f; do
>  [[ -z "$f" ]] && continue
>  git restore --staged "$f" || true
>  done <<< "${offenders}"
>  echo "Commit blocked. Convert to .hy or place generated code under dist/."
>  exit 1
>  fi
>  ```
>  - [ ] Add `scripts/dev/install-hooks.sh`:
>  ```bash
>  git config core.hooksPath .githooks
>  chmod +x .githooks/pre-commit
>  ```
>  - [ ] CI job step that **fails** if any tracked `.py` exists outside `dist/`:
>  ```bash
>  rg -n --glob '!dist/**' --glob '!**/*.pyc' --glob '!**/__pycache__' '\.py$' . \
>  | grep -v '^dist/' && { echo "Python source detected"; exit 1; } || true
>  ```
> 
> ### 1) Hy Tooling + Build Skeleton
> - [ ] Add Hy runtime to **`pyproject.toml`** (kept because we still run on CPython):
>  ```toml
>  [project]
>  name = "promethean"
>  requires-python = ">=3.11"
>  dependencies = ["hy>=1.0.0"] # pin exact later per versioning policy
>  ```
> - [ ] Build script: **compile Hy → Python files** into `./dist`. Prefer `hy2py` for readable `.py`. 
>  `tools/build.hy` (invoked by Makefile/uv) should:
>  - [ ] Walk **Hy source roots** (see next task).
>  - [ ] For each `.hy`, run `hy2py` and write path-mirrored `.py` into `./dist`.
>  - [ ] Emit `__init__.py` in each `dist` package dir for importability.
>  - [ ] Preserve package namespace (e.g., `services/py/tts/foo.hy` → `dist/services/py/tts/foo.py`).
> 
> - [ ] Make targets:
>  ```Makefile
>  .PHONY: hy-build hy-clean
>  hy-build:
>  	uv run hy tools/build.hy
> 
>  hy-clean:
>  	rm -rf dist
>  ```
>  (Per your workflow: Makefile shells out to `hy tools/build.hy`.)
> 
> ### 2) Source Layout & Conventions
> - [ ] Create Hy roots mirroring TS/Sibilant style:
>  ```
>  shared/hy/ # shared libs (analogue to @shared/ts)
>  services/hy/<svc>/ # service-specific Hy
>  tools/hy/ # build/dev scripts in Hy
>  ```
> - [ ] **Import discipline:** Python modules **must not exist** under source; only `.hy`. 
> - [ ] Generated `.py` lives only under `dist/` with identical package layout.
> 
> ### 3) Entrypoints & Runtime
> - [ ] For dev: allow `uv run hy -m services.hy.cephalon.main` style commands. 
> - [ ] For prod/CI: run compiled entrypoints from `./dist`, e.g.:
>  ```bash
>  uv run python -m services.hy.cephalon.main # with PYTHONPATH=dist
>  ```
>  - [ ] Add `export PYTHONPATH=dist:${PYTHONPATH}` to service runners/PM2 env.
>  - [ ] Replace any old `python path/to/*.py` with **Hy or dist imports**.
> 
> ### 4) Port Python → Hy (incremental, API-stable)
> - [ ] **Inventory** all Python modules/services and their public APIs. 
> - [ ] Port order (highest leverage first):
>  - [ ] `services/py/stt` (if present), `tts`, any model handlers
>  - [ ] `shared/py/**` utility libraries
>  - [ ] Remaining Python scripts under `tools/` 
> - [ ] For each module:
>  - [ ] Re-implement in Hy with **same function/class names**, same inputs/outputs.
>  - [ ] Delete original `.py` (or move aside), compile `.hy` → `dist/*.py`.
>  - [ ] Unit tests updated to import via package name (works for both dev/prod).
>  - [ ] No direct path imports to `.py` anywhere.
> 
> ### 5) Testing & CI
> - [ ] Update test bootstrap to set `PYTHONPATH=dist`. 
> - [ ] Add a **pre-test build** step:
>  ```bash
>  make hy-build
>  uv run pytest -q
>  ```
> - [ ] CI pipeline:
>  - [ ] `make hy-build`
>  - [ ] Verify **no `.py` outside `dist/`** (same grep as in guardrail).
>  - [ ] Run tests.
>  - [ ] (Optional) publish `dist` as artifact for downstream jobs.
> 
> ### 6) Documentation (repeat it loudly)
> - [ ] `README.md`: **“Python source is forbidden. Use Hy.”** 
> - [ ] `CONTRIBUTING.md`: coding standard, examples, build, and the pre-commit rule. 
> - [ ] `docs/architecture/languages.md`: why Hy, how to import, where compiled code lives. 
> - [ ] Service READMEs: update run commands (dev via `hy`, prod via `dist`). 
> - [ ] Codeowners/review checklist: reject PRs with `.py` outside `dist`.
> 
> ### 7) Linters/Formatters
> - [ ] Remove Python linters that parse `.py` sources in the tree. 
> - [ ] Add Hy formatting guidance (Hy doesn’t have a de facto formatter; keep style doc simple). 
> - [ ] Keep Ruff/Black **off** the repo or scope them to `dist/` only if needed (read-only).
> 
> ### 8) Final Sweep
> - [ ] Repo-wide search for `.py` references in scripts, docs, Dockerfiles. 
> - [ ] Ensure Docker images copy **Hy sources** then build, or copy **`dist/`** if using multi-stage.
> 
> ---
> 
> ## Acceptance Criteria (checkable)
> - [ ] Running `rg -n '\.py$' --glob '!dist/**'` returns **no results**. 
> - [ ] `make hy-build` regenerates `./dist` with importable packages and `__init__.py` files. 
> - [ ] All Python-runtime services start via **Hy or compiled outputs** with no `.py` under source. 
> - [ ] Pre-commit hook blocks & un-stages `.py` placed anywhere but `dist`. 
> - [ ] CI fails on any tracked `.py` outside `dist`. 
> - [ ] Documentation updated in **at least** README + CONTRIBUTING + languages page. 
> - [ ] At least **two** previously-Python services fully ported to Hy and green in CI.
> 
> ---
> 
> ## Step-by-Step Milestone Checklist (you asked for “Step 1..4”)
> - [ ] **Step 1 — Guardrails:** add `.gitignore`, pre-commit hook, CI check; set `PYTHONPATH=dist`. 
> - [ ] **Step 2 — Build:** implement `tools/build.hy` + `make hy-build`; lay out `shared/hy`, `services/hy/*`. 
> - [ ] **Step 3 — Ports:** migrate highest-value Python modules to `.hy`; remove originals; fix tests. 
> - [ ] **Step 4 — Docs/Enforce:** update docs; remove Python linters; repo-wide sweep; close out.
> 
> ---
> 
> ## Relevant Resources
> - You might find [this] useful while working on this task 
>  *(link your internal Hy style guide or a reference note with macros/patterns you like; keep it local to the vault/repo)*
> 
> ---
> 
> ## Comments
> Append-only thread for agents. Note blockers, weird Hy interop, or macro decisions here.
> 
> ---
> 
> ## Notes / Gotchas
> - **hy2py limitations:** Generated Python may differ stylistically; that’s fine—it’s an artifact. Source of truth is `.hy`. 
> - **Dynamic imports:** If any code used `importlib` tricks, you’ll need to replicate behavior in Hy or adjust the API. 
> - **Packaging:** If you distribute wheels later, you can package from `dist/` while keeping the repo source pure Hy. 
> - **Performance:** Hy compiles to Python AST; runtime perf should be on par with equivalent Python once compiled.
> 
> #tags #promethean #hy #lisp #python #build #ci #git #precommit #policy #docs
<!-- UID: a1aae25b-faf9-4cf0-8b0f-653ba279b718 -->

---




>[!nexus_user] **User** - 08/25/2025 at 7:22 PM
> Write a task for setting up and documenting a proper mongodb/chroma migration pipeline
<!-- UID: cd59cb35-8459-4360-9ab7-d60677a8cf31 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 7:22 PM
> Here’s a straight-shooting, repo-ready task you can drop into the board. It sets up an **online** MongoDB ⇄ Chroma migration pipeline with backfill, dual-write, CDC tailing, integrity checks, and a clean cutover. No hand-wavy fluff—this is the plan agents can execute.
> 
> # MongoDB ⇄ Chroma Migration Pipeline (setup + docs)
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #data #migrations #mongodb #chroma #etl #ci #observability #promethean
> 
> ---
> 
> ## 🛠️ Description
> Build a **proper** migration pipeline to move/search data consistently across **MongoDB** (canonical source of truth) and **Chroma** (vector store). Support one-time **backfill**, ongoing **change data capture** (CDC) for **online** migration, **dual-write** during cutover, and a reversible **rollback**. Ship docs and runbooks. No silent data drift.
> 
> ---
> 
> ## 🎯 Goals
> - Deterministic, resumable **backfill** from Mongo → Chroma with dedupe and checkpoints. 
> - **CDC** tailing from Mongo change streams to keep Chroma consistent until cutover. 
> - **Dual-write** flag to write to both stores during transition. 
> - Strong **integrity checks** (counts, checksums, embedding dimension, orphan detection). 
> - Clear **runbooks** to cut over and to roll back.
> 
> ---
> 
> ## 📦 Requirements
> - [ ] **Idempotent** migration jobs (safe to re-run). 
> - [ ] **Checkpoints** persisted in Mongo (or a `migrations` collection) per collection/phase. 
> - [ ] **Dimension safety**: embedding model + dims pinned and verified in code. 
> - [ ] **Integrity report** (markdown + JSON) after each phase. 
> - [ ] **Observability**: metrics + logs with job ids and per-phase stats. 
> - [ ] **No new TS path aliases**. Use existing **@shared/ts/dist/** imports.
> 
> ---
> 
> ## 📋 Subtasks
> 
> ### 1) Design & Contracts
> - [ ] **Schema snapshot**: Document Mongo collections that map to Chroma collections (name, id fields, text fields, metadata). 
> - [ ] **Embedding spec**: Pin model (e.g., `qwen2.5-embed:...`), dimension (e.g., `1536`), normalizer, chunker, and language. 
> - [ ] **Collection contract** (example):
>  ```ts
>  type CanonicalDoc = {
>  _id: string; // canonical id
>  text: string; // raw content
>  meta?: Record<string, any>; // metadata to mirror
>  updatedAt: string; // ISO
>  deleted?: boolean;
>  };
> 
>  type ChromaUpsert = {
>  id: string; // same as _id
>  embedding: number[]; // fixed dim
>  metadata: Record<string, any>;
>  document: string;
>  };
>  ```
> 
> ### 2) Shared Migration Lib (TS)
> - [ ] New module `shared/ts/src/migrations/` exporting:
>  - [ ] **CheckpointStore** (Mongo-backed) — `get`, `set`, `advancePhase`, `resumeToken`. 
>  - [ ] **Embedder** (pluggable) — wraps local/remote model; asserts dim. 
>  - [ ] **Chunker** (optional) — deterministic chunking with content hashing (Merkle leaf ids). 
>  - [ ] **ChromaClient** wrapper — upsert/delete/batch APIs, collection bootstrap with **embedding dimension** check. 
>  - [ ] **Integrity** helpers — count checks, orphans, checksum (e.g., sha256 of `[id, text, meta, embed_dim]`), sample spot-checks. 
>  - [ ] **CDC** tailer — Mongo change stream → normalized events; supports resume tokens; backpressure. 
>  - [ ] **Metrics** — counters/timers via your existing logger/metrics sink.
> 
> ### 3) Services & Jobs
> - [ ] **Backfill job** `services/ts/migrations/backfill.ts` 
>  - Scans source collections pagewise by `_id` or `updatedAt`. 
>  - Idempotent **upserts** to Chroma; dedupe by `id`. 
>  - Checkpoints after each page/batch. 
>  - Emits integrity report (counts, failures, retry list). 
> - [ ] **CDC job** `services/ts/migrations/cdc.ts` 
>  - Tails Mongo change streams (insert/update/delete). 
>  - Debounces/coalesces updates; re-embeds on text change only. 
>  - Persists **resumeToken**; restarts cleanly. 
> - [ ] **Dual-write toggle** in relevant write paths (e.g., cephalon collectionManager): 
>  - Env flags: `DUAL_WRITE_ENABLED=true`, `CDC_ENABLED=true`. 
>  - Writes go to Mongo **and** Chroma; failures surface metrics + retry queue. 
> - [ ] **Cutover switch** `services/ts/migrations/cutover.ts` 
>  - Flip read path to Chroma where applicable (or maintain hybrid search). 
>  - Freeze CDC after final sync window; validate integrity; switch traffic. 
> - [ ] **Rollback switch** `services/ts/migrations/rollback.ts` 
>  - Revert read path; optionally purge last delta in Chroma based on checkpoint window.
> 
> ### 4) Config & Envs
> - [ ] **Environment variables** (documented):
>  ```
>  MONGO_URI=...
>  CHROMA_URL=...
>  CHROMA_COLLECTION_PREFIX=promethean_
>  EMBEDDING_MODEL=qwen2.5-embed:2025-08-01
>  EMBEDDING_DIM=1536
>  BATCH_SIZE=128
>  MAX_INFLIGHT=8
>  DUAL_WRITE_ENABLED=false
>  CDC_ENABLED=false
>  ```
> - [ ] **Version guard**: assert `EMBEDDING_DIM` and model id on startup against Chroma collection metadata; exit hard on mismatch.
> 
> ### 5) Observability & Integrity
> - [ ] **Metrics**: `backfill_total`, `backfill_failed`, `cdc_events_total`, `cdc_errors_total`, `embed_latency_ms`, `chroma_upsert_latency_ms`. 
> - [ ] **Integrity report** (JSON + Markdown under `docs/data/reports/`): 
>  - Counts (mongo vs chroma), orphan ids, checksum sample deltas, dimension. 
>  - Append run id, git sha, model id. 
> - [ ] **Dashboards/alerts**: wire simple thresholds (error rate, backlog size).
> 
> ### 6) CI & Safety Rails
> - [ ] **Dry-run** mode: compute embeddings and diffs, but **do not commit** to Chroma. 
> - [ ] CI job can run a **small fixture** backfill (local Mongo/Chroma or mocked) and assert integrity contract. 
> - [ ] Guard: fail pipeline if **model id/dim mismatch** or Chroma collection mis-configured.
> 
> ### 7) Docs & Runbooks
> - [ ] `docs/data/migration-pipeline.md` — architecture, flags, phases, and troubleshooting. 
> - [ ] `docs/data/runbooks/mongo-to-chroma-cutover.md` — checklist with strict order. 
> - [ ] `docs/data/runbooks/rollback.md` — immediate steps + validation.
> 
> ---
> 
> ## 🧩 Phases (zero-downtime path)
> 
> 1. **Prepare**
>  - Enable pipeline code behind flags. 
>  - Create Chroma collections with the **final** metadata and dim. 
>  - Verify embedder & dim consistency.
> 
> 2. **Backfill**
>  - Run `backfill` until 100% of current data mirrored. 
>  - Record integrity report; fix orphans/dimension issues.
> 
> 3. **CDC**
>  - Start `cdc` tailer; keep Chroma caught up. 
>  - Monitor lag and error counters.
> 
> 4. **Dual-write**
>  - Turn on `DUAL_WRITE_ENABLED=true`. 
>  - Verify no deltas after sustained period (e.g., 30–60 min).
> 
> 5. **Cutover**
>  - Brief freeze window (seconds). 
>  - Final integrity check; switch readers to Chroma. 
>  - Keep CDC for safety window; then disable.
> 
> 6. **Decommission**
>  - If stable, disable dual-write/CDC; archive reports. 
>  - Optional: backfill back from Chroma → Mongo for embeddings cache if desired.
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] **Backfill** completes with 0 hard failures; integrity report committed. 
> - [ ] **CDC** processes live updates with resume support; backlog < configured threshold. 
> - [ ] **Dual-write** verified in logs/metrics; no divergence in integrity spot-checks. 
> - [ ] **Cutover** runbook executed; search paths read from Chroma (or hybrid documented). 
> - [ ] **Rollback** runbook tested in staging (toggle works, data safe). 
> - [ ] Docs exist: pipeline architecture + both runbooks; from root README. 
> - [ ] CI minimal fixture passes and enforces model/dim guard.
> 
> ---
> 
> ## 🗂️ Proposed Files/Paths
> - `shared/ts/src/migrations/checkpoints.ts` 
> - `shared/ts/src/migrations/embedder.ts` 
> - `shared/ts/src/migrations/chroma.ts` 
> - `shared/ts/src/migrations/integrity.ts` 
> - `services/ts/migrations/backfill.ts` 
> - `services/ts/migrations/cdc.ts` 
> - `services/ts/migrations/cutover.ts` 
> - `services/ts/migrations/rollback.ts` 
> - `docs/data/migration-pipeline.md` 
> - `docs/data/runbooks/mongo-to-chroma-cutover.md` 
> - `docs/data/runbooks/rollback.md` 
> - `docs/data/reports/*.json` and `*.md`
> 
> *(Export through **@shared/ts/dist/**; do not invent new aliases.)*
> 
> ---
> 
> ## 🔧 CLI Sketches (for humans and CI)
> ```bash
> # Dry run backfill (no writes)
> NODE_ENV=staging CDC_ENABLED=false DUAL_WRITE_ENABLED=false \
>  MIGRATION_DRY_RUN=true \
>  uv run node services/ts/migrations/backfill.js --collection messages --since 2024-01-01
> 
> # Normal backfill
> uv run node services/ts/migrations/backfill.js --collection messages --batch 128
> 
> # Start CDC tailer
> uv run node services/ts/migrations/cdc.js --collections messages,attachments
> 
> # Cutover
> uv run node services/ts/migrations/cutover.js --confirm "I know what I'm doing"
> 
> # Rollback
> uv run node services/ts/migrations/rollback.js --reason "elevated error rate"
> ```
> 
> ---
> 
> ## ⚠️ Pitfalls & Guardrails
> - **Embedding dim mismatch** is the #1 silent killer → assert hard on startup. 
> - **Chunking changes** will invalidate checksums; pin chunker version and include it in checksum salt. 
> - **Upsert semantics**: always idempotent; use same `id` across stores. 
> - **Delete semantics**: honor soft deletes (`deleted=true`) and real deletes consistently. 
> - **Backpressure** in CDC: batch updates; drop/retry policy must be explicit; never lose resume token. 
> - **Search path drift**: ensure readers reference **one** store at a time or a clearly defined hybrid adapter.
> 
> ---
> 
> ## Step 1–4 (your minimal milestone format)
> - [ ] **Step 1 — Contracts & Guards:** schema map, embedder pin, dim guard, create Chroma collections. 
> - [ ] **Step 2 — Backfill:** implement idempotent backfill with checkpoints + integrity report. 
> - [ ] **Step 3 — CDC & Dual-write:** change streams tailer + write-path toggle; soak test. 
> - [ ] **Step 4 — Cutover & Docs:** execute cutover in staging → prod; finalize docs + rollback tested.
> 
> ---
> 
> ## Commit Template
> ```
> feat(migrations): add Mongo→Chroma pipeline (backfill, CDC, dual-write, cutover)
> 
> - Shared migration lib: checkpoints, embedder, chroma client, integrity
> - Backfill + CDC jobs with resume tokens and metrics
> - Dim/model guards and integrity reports
> - Runbooks: cutover and rollback
> - CI: fixture test + dry-run mode
> ```
> 
> #tags #promethean #mongodb #chroma #migration #etl #cdc #backfill #idempotent #observability #runbooks #ci
<!-- UID: a36cc4ff-dde3-4b98-8a37-73492efc9af9 -->

---




>[!nexus_user] **User** - 08/25/2025 at 7:29 PM
> Write a task to cleanly maintain testing/working databases seperately so migrations can be tested against a contract
<!-- UID: e41c0ab1-73e5-4e3c-aa7d-3f0e36a86a24 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 7:29 PM
> Here’s a repo-ready task you can paste into the board. It carves a bright line between **testing** and **working** (dev/staging/prod) databases and enforces a **migration contract** that every migration must satisfy before touching working data.
> 
> # Maintain Testing vs Working Databases w/ Migration Contract
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #data #migrations #contracts #mongodb #chroma #testing #ci #promethean
> 
> ---
> 
> ## 🛠️ Description
> Set up clean, isolated **testing databases** for MongoDB and Chroma that can be brought up, seeded, migrated, verified against a **formal contract**, and torn down—without ever touching **working** databases. Enforce this separation in code, config, and CI. Make migrations refuse to run if the contract doesn’t hold.
> 
> ---
> 
> ## 🎯 Goals
> - Deterministic, ephemeral **test DBs** for migration authoring and verification. 
> - A **migration contract** (schema + indexes + invariants + collection/embedding metadata) that is validated **pre** and **post** migration. 
> - Guardrails so working DBs cannot be mutated from test paths (and vice versa). 
> - CI path that spins Mongo+Chroma locally, runs migrations, validates, and publishes a report.
> 
> ---
> 
> ## 📦 Requirements (DoD — if missing, reject PR)
> - [ ] Distinct **URIs and names** for testing vs working DBs. No shared prefixes. 
> - [ ] **Contract file(s)** committed (JSON/YAML) for Mongo (collections, indexes, required fields) and Chroma (collections, embedding dim/model, metadata). 
> - [ ] **Preflight contract check** blocks migrations when actual ≠ declared. 
> - [ ] **Safety interlocks:** migrations require an explicit `MIGRATION_TARGET=test|working`, refuse on mismatch, and require a second confirm var for working. 
> - [ ] **Spin-up/tear-down** scripts for ephemeral test DBs, including seed + snapshots. 
> - [ ] CI job that runs a full **contract → migrate → verify** loop using the test DBs. 
> - [ ] No new TS path aliases; exports via **@shared/ts/dist/** only.
> 
> ---
> 
> ## 📋 Subtasks
> 
> ### 1) Naming, URIs, and Safety Interlocks
> - [ ] Add envs (documented; sample `.env.example`):
>  ```
>  # Working (dev/staging/prod)
>  MONGO_URI_WORKING=mongodb://...
>  MONGO_DB_WORKING=promethean_working
>  CHROMA_URL_WORKING=http://...
>  CHROMA_PREFIX_WORKING=promethean_working_
> 
>  # Testing (ephemeral)
>  MONGO_URI_TEST= mongodb://localhost:37017
>  MONGO_DB_TEST= prom_test_${RUN_ID}
>  CHROMA_URL_TEST= http://localhost:38000
>  CHROMA_PREFIX_TEST= prom_test_${RUN_ID}_
>  MIGRATION_TARGET= test|working
>  MIGRATION_CONFIRM= I_ACKNOWLEDGE_WORKING_MUTATION
>  ```
> - [ ] In shared config `@shared/ts/dist/config/db.ts`, expose a **resolver**:
>  ```ts
>  export function resolveDbTarget(target: 'test'|'working') { /* returns URIs, names, prefixes */ }
>  ```
> - [ ] Hard fail if `MIGRATION_TARGET=working` without `MIGRATION_CONFIRM` exact match. 
> - [ ] Hard fail if any test runner tries to connect to a `*_WORKING` URI. 
> 
> ### 2) Contract Definition (source of truth)
> - [ ] Add `docs/data/contracts/mongo.schema.json`:
>  - Collections (name), **primary key field**, required fields, types (JSON Schema), **indexes** (fields, unique, partial filter). 
> - [ ] Add `docs/data/contracts/chroma.schema.json`:
>  - Collections (name), **embedding_dim**, **embedding_model id**, required metadata keys. 
> - [ ] Add contract loader/validator: `shared/ts/src/migrations/contract.ts`
>  - `validateMongoContract(db): Promise<Report>` 
>  - `validateChromaContract(client): Promise<Report>` 
>  - Emits actionable diffs (missing index, wrong dim, missing collection).
> 
> ### 3) Test DB Lifecycle (spin/seed/teardown)
> - [ ] Docker/Testcontainers helper under `scripts/db/`:
>  - `db-test-up`: start Mongo (@ 37017) + Chroma (@ 38000) locally (compose or Testcontainers). 
>  - `db-test-down`: stop and prune. 
>  - `db-test-seed`: load minimal seed fixtures (`fixtures/*.json`) to Mongo; create empty Chroma collections with correct dim/model. 
>  - All commands must respect `RUN_ID=$(date +%s)` to isolate parallel runs.
> - [ ] Seed data factories in TS: `shared/ts/src/migrations/fixtures.ts` for testable content.
> 
> ### 4) Migration Runner + Contract Gates
> - [ ] Migration CLI `services/ts/migrations/run.ts`:
>  - `--target test|working`, `--up <version>`, `--down <version>`, `--dry-run`. 
>  - **Preflight:** load target, run `validateMongoContract` & `validateChromaContract` **before** migration; **fail on diff** unless `--allow-contract-drift` explicitly provided (only for working with approval). 
>  - Execute migration scripts from `services/ts/migrations/steps/*.ts` (versioned, idempotent). 
>  - **Post-flight:** rerun validators; write JSON+MD report under `docs/data/reports/`.
> - [ ] Keep applied versions in per-DB collection `migrations_applied` (contains `env`, `version`, `git_sha`, `run_id`, timestamps).
> 
> ### 5) CI Integration
> - [ ] Job `migrations-contract-check` steps:
>  1. `db-test-up` → `db-test-seed` 
>  2. `node services/ts/migrations/run.js --target test --up latest` 
>  3. `node services/ts/migrations/run.js --target test --verify-only` 
>  4. Upload report artifacts (`*.json`, `*.md`). 
> - [ ] CI must **fail** on any contract deviation or validator failure.
> 
> ### 6) Docs & Runbooks
> - [ ] `docs/data/contracts/README.md` — how contracts are authored, reviewed, and bumped. 
> - [ ] `docs/data/runbooks/test-migrations.md` — spin up test DBs, run a migration, view reports, tear down. 
> - [ ] `CONTRIBUTING.md` — “Never point tests at working DBs; use `MIGRATION_TARGET=test`.”
> 
> ### 7) Guardrails & Linting
> - [ ] Pre-commit check: forbid `MONGO_URI=` literals or hardcoded URIs in code. 
> - [ ] Script `scripts/ci/check-db-targets.ts`: greps for working URIs in test code and fails if found. 
> - [ ] Runtime banner logs: print **Target=TEST/WORKING**, URIs redacted; capture in reports.
> 
> ---
> 
> ## 🧩 Design Notes
> - **Contracts are law.** Migrations that change schema must **update the contract** in the same PR. 
> - **Dim/model pinning**: Chroma must refuse collection creation when `embedding_dim` or `embedding_model` mismatches contract. 
> - **Idempotency**: every step checks existing state and only mutates when truly needed. 
> - **Isolation by RUN_ID** prevents cross-test bleed and enables parallel CI. 
> - **No new aliases**: exports available via **@shared/ts/dist/migrations/**.
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] `db-test-up`/`db-test-down` works locally; seeds load; isolated by `RUN_ID`. 
> - [ ] `run.ts --target test` performs **preflight contract check**, migrates, and emits **success report**. 
> - [ ] CI job passes on green contract; **fails** on any deviation. 
> - [ ] Attempting `--target working` without `MIGRATION_CONFIRM` hard-fails. 
> - [ ] Working and testing DBs **never share** database names or collection prefixes. 
> - [ ] Docs exist (contracts README, runbook) and are from root README.
> 
> ---
> 
> ## 🗂️ Proposed Files/Paths
> - `shared/ts/src/migrations/contract.ts` 
> - `shared/ts/src/migrations/report.ts` 
> - `shared/ts/src/migrations/index.ts` (barrel export) 
> - `services/ts/migrations/run.ts` 
> - `services/ts/migrations/steps/NNNN_name.ts` (versioned steps) 
> - `scripts/db/db-test-up.sh`, `db-test-down.sh`, `db-test-seed.sh` 
> - `scripts/ci/check-db-targets.ts` 
> - `docs/data/contracts/mongo.schema.json` 
> - `docs/data/contracts/chroma.schema.json` 
> - `docs/data/contracts/README.md` 
> - `docs/data/runbooks/test-migrations.md` 
> - `docs/data/reports/*.json`, `*.md`
> 
> ---
> 
> ## CLI Sketches
> ```bash
> # Local: spin ephemeral test DBs
> RUN_ID=$(date +%s) ./scripts/db/db-test-up.sh && ./scripts/db/db-test-seed.sh
> 
> # Run all pending migrations against test target, with contract verification
> MIGRATION_TARGET=test node services/ts/migrations/run.js --up latest
> 
> # Verify only (no changes), output report
> MIGRATION_TARGET=test node services/ts/migrations/run.js --verify-only
> 
> # (Danger) Working target requires explicit confirm
> MIGRATION_TARGET=working MIGRATION_CONFIRM=I_ACKNOWLEDGE_WORKING_MUTATION \
>  node services/ts/migrations/run.js --up 2025_08_25_001
> ```
> 
> ---
> 
> ## Step 1–4 Milestones
> - [ ] **Step 1 — Separation & Safety:** envs/URIs, resolver, interlocks, naming. 
> - [ ] **Step 2 — Contracts:** author `mongo.schema.json` + `chroma.schema.json`, validator code. 
> - [ ] **Step 3 — Lifecycle & Runner:** test DB scripts, seed, migration CLI w/ pre/post contract checks. 
> - [ ] **Step 4 — CI & Docs:** CI pipeline, reports, runbooks; enforce in pre-commit.
> 
> ---
> 
> ## Commit Template
> ```
> feat(migrations): isolate test DBs and enforce migration contracts
> 
> - Separate testing vs working URIs/names with safety interlocks
> - Add Mongo/Chroma contract schemas + validators
> - Test DB lifecycle scripts (spin/seed/teardown)
> - Migration runner with pre/post contract verification and reports
> - CI job for contract->migrate->verify loop
> - Docs: contracts README + runbook
> ```
> 
> #tags #promethean #mongodb #chroma #migration #contracts #testing #ci #safety #idempotent
<!-- UID: c82528c6-1065-4b97-8cb6-1ab14f0023ba -->

---




>[!nexus_user] **User** - 08/25/2025 at 7:35 PM
> Expand this task:
> # Description
> 
> Create an agent which crawls the web and generates a hyperlink graph, uses an LLM in seperate passes to summarize, #tagged, and their summaries searchable via chroma DB using the dual sink type
> 
> ## Requirements/Definition of done
> 
> - If it doesn't have this, we can't accept it
> 
> ## Tasks 
> 
> - [ ] Step 1
> - [ ] Step 2
> - [ ] Step 3
> - [ ] Step 4
> 
> ## Relevent resources
> 
> You might find [this] useful while working on this task
> 
> ## Comments
> 
> Useful for agents to engage in append only conversations about this task.
<!-- UID: 876694cd-14e8-472f-ab78-d7c5473279fe -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 7:35 PM
> Here’s a concrete, repo-ready expansion you can paste into the board. It’s opinionated, modular, and slotted to your stack (Fastify, WS, Mongo, Chroma, Ollama/local LLMs, dual-sink).
> 
> # Web Crawler Agent → Hyperlink Graph → LLM Summaries/#Tags → Chroma Search (Dual-Sink)
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #agents #crawler #llm #summarization #chroma #mongodb #etl #dual-sink #search #observability #promethean
> 
> ---
> 
> ## 🛠️ Description
> Create an agent that:
> 1) **Crawls** the web (seeded) and builds a **hyperlink graph** (nodes = pages, edges = hyper). 
> 2) Runs **separate LLM passes** per document for: a) concise summaries, b) #tag extraction (Obsidian-style). 
> 3) Indexes summaries + tags into **Chroma** for semantic search while persisting canonical docs/graph to **Mongo** (**dual-sink**). 
> 4) Ships a minimal **search API** and report dashboards.
> 
> No magic. Deterministic where it matters. Respect robots.txt. Idempotent by URL+content hash.
> 
> ---
> 
> ## 🎯 Goals
> - Crawl N domains with polite rate-limits and **full robots compliance**. 
> - Build **Mongo-backed** hyperlink graph with normalized URLs + content hashes. 
> - Produce **LLM summaries** (≤ ~200–300 tokens) + **#tags** (3–12 concise tokens, no spaces; use kebab_case if needed). 
> - Persist to **Mongo (canonical)** and **Chroma (embeddings)** via **dual-sink** path with consistent IDs. 
> - Provide **Fastify** endpoints for query, node/edge retrieval, and health/metrics. 
> - Ship **runbooks + configs**. No internet writes in tests.
> 
> ---
> 
> ## 📦 Requirements / Definition of Done (non-negotiable)
> - **Robots**: agent obeys `robots.txt` (disallow, crawl-delay, sitemap parsing) and honors per-host concurrency ≤ 1 unless `crawl-delay` permits. 
> - **Politeness**: global QPS + per-domain throttles, retry/backoff, and user-agent string configurable. 
> - **Safety**: block private IP ranges, login/checkout forms, and obvious traps (`calendar`, infinite params via URL canonicalizer & deny-lists). 
> - **Idempotency**: dedupe by **canonical_url** and **content_sha256**. Re-crawls only when ETag/Last-Modified or max-age expires. 
> - **Dual-sink**: Mongo = source of truth (docs, graph, summaries, tags, embeddings meta). Chroma = embeddings (search). Atomic-ish write (2-phase best-effort + retry). 
> - **LLM passes separated**: summary pass ≠ tag pass (distinct prompts, reproducible seeds/temperature=0 where possible). 
> - **Search**: cosine/inner-product over summaries in Chroma; metadata filterable by domain, tags. 
> - **Observability**: metrics, structured logs, integrity reports (counts, orphans, embedding dim/model). 
> - **No new TS path aliases**. Use **@shared/ts/dist/** only. 
> - **Docs + runbooks** checked in. 
> - **CI**: fully offline mocked tests; no network calls.
> 
> ---
> 
> ## 🧱 Architecture (high-level)
> - **services/ts/crawler** — polite fetcher + HTML parser + link extractor + robots manager. 
> - **services/ts/graph** — Mongo persistence for `pages`, `edges`, dedupe, versioning. 
> - **services/ts/summarizer** — LLM summaries (Ollama/Qwen3 etc.), deterministic prompts, batch-safe. 
> - **services/ts/tagger** — LLM tag extraction (Obsidian-style `#tags`), policy checks. 
> - **services/ts/indexer** — dual-sink upserts → Mongo (canonical record) + Chroma (embeddings of summaries). 
> - **services/ts/search** — Fastify API for semantic + filter search, node/edge fetch. 
> - **shared/ts/** — URL canonicalizer, robots client, fetch middleware, content hashing, retry, backoff, instrumentation, dual-sink helpers.
> 
> **Data flow**: `seed → crawl(page) → parse → normalize+hash → store page → extract → store edges → enqueue LLM summary → enqueue tags → index to Chroma → searchable`.
> 
> ---
> 
> ## 🗃️ Data Model (Mongo; sketch)
> ```ts
> // pages
> {
>  _id: "<canonical_url_sha1>",
>  url: "https://example.com/a?b=1#c",
>  canonical_url: "https://example.com/a?b=1",
>  domain: "example.com",
>  first_seen_at: ISODate,
>  last_crawled_at: ISODate,
>  http: { status: 200, etag: "...", last_modified: "...", content_type: "text/html" },
>  content_sha256: "<hex>",
>  lang: "en",
>  title: "Page title",
>  text_excerpt: "First N chars...",
>  summary: { text: "...", model: "qwen3-xxx", version: "yyy", ts: ISODate },
>  tags: ["#ai", "#ethics", "#promethean"],
>  embedding: { dim: 1536, model: "qwen2.5-embed:2025-08-01", sha256: "<vec-hash>" }, // optional cache
>  flags: { blocked_by_robots: false, error: false, dynamic: false },
>  meta: { ... },
>  version: 3 // bump when schema changes
> }
> 
> // edges
> {
>  _id: "<from_sha1>-><to_sha1>",
>  from: "<page._id>",
>  to: "<page._id>",
>  rel: "a[href]",
>  anchor_text: "read more",
>  first_seen_at: ISODate,
>  last_seen_at: ISODate
> }
> ```
> 
> **Chroma** collection (e.g., `promethean_web_summaries`): 
> - `id` = `page._id` 
> - `document` = `summary.text` 
> - `metadata` = `{ url, domain, tags, lang, title }` 
> - `embedding` = vector for `summary.text` (pin dim/model).
> 
> ---
> 
> ## 🔧 Configuration (envs)
> ```
> SEEDS=https://example.com,https://news.ycombinator.com
> USER_AGENT=PrometheanCrawler/1.0 (+https://your.site)
> GLOBAL_QPS=0.5
> PER_HOST_CONCURRENCY=1
> TIMEOUT_MS=15000
> MAX_PAGES=20000
> MAX_DEPTH=5
> ALLOW_DOMAINS=example.com,another.org
> DENY_PATTERNS=/logout,/signin,/cart,*.pdf,*.zip
> CRAWL_CACHE_TTL_H=72
> SUMMARY_MODEL=qwen3:instruct
> TAGGER_MODEL=qwen3:instruct
> EMBED_MODEL=qwen2.5-embed:2025-08-01
> EMBED_DIM=1536
> DUAL_WRITE_ENABLED=true
> CDC_ENABLED=false
> ```
> 
> ---
> 
> ## 📋 Tasks & Subtasks
> 
> ### A) Foundations
> - [ ] **URL Normalization & Hashing** (`@shared/ts/dist/web/url`): strip fragments, sort query keys, drop tracking params (`utm_*`), punycode, lower-host, collapse slashes. `content_sha256(buf|text)` helper. 
> - [ ] **Robots** (`@shared/ts/dist/web/robots`): fetch/cache robots per host; `allowed(url)`, `crawlDelay(host)`, `sitemaps(host)`. 
> - [ ] **Fetcher** (`@shared/ts/dist/web/fetcher`): HTTP(S) with retries, backoff, gzip/br, size caps, mime sniff, charset decode, ETag/Last-Modified handling, disallow private IPs. 
> - [ ] **Parser** (`@shared/ts/dist/web/html`): JSDOM/cheerio; extract title, text (readability), (absolute hrefs), lang, meta robots.
> 
> ### B) Crawler Service (`services/ts/crawler`)
> - [ ] Frontier queue w/ politeness: per-domain token bucket; persistent frontier in Mongo for crash-safe resume. 
> - [ ] Seed loader (SEEDS + sitemaps). 
> - [ ] Visit loop: `fetch → parse → normalize+hash → upsert page shell → upsert edges → enqueue LLM jobs`. 
> - [ ] Dedup guard: skip if `content_sha256` unchanged and TTL not expired. 
> - [ ] Backoff on 4xx/5xx; classify 3xx, update canonical. 
> - [ ] Metrics: pages_fetched, pages_skipped, robots_blocked, bytes_downloaded, per-host timings.
> 
> ### C) Graph Persistence (`services/ts/graph`)
> - [ ] Upsert `pages` + `edges` with unique indexes. 
> - [ ] Track `first_seen_at`/`last_crawled_at`. 
> - [ ] Simple node degree stats for sanity.
> 
> ### D) LLM Passes
> - [ ] **Summarizer** (`services/ts/summarizer`):
>  - Deterministic prompt (temperature 0). Include safety: “no private data; cite URL domain if needed.” 
>  - Truncate long texts (head+tail windows) with ellipsis policy. 
>  - Store `summary.text`, model id, ts.
> - [ ] **Tagger** (`services/ts/tagger`):
>  - Extract 3–12 topic tags; single tokens (kebab_case if multiword). 
>  - Enforce `#` prefix in Mongo; store also without `#` in metadata for Chroma filter. 
>  - Validate against deny-list (e.g., `#login`, `#home`).
> - [ ] **Batching & Retries**; dead-letter queue for persistent failures; metrics.
> 
> ### E) Indexer (Dual-Sink) (`services/ts/indexer`)
> - [ ] Verify `EMBED_MODEL` + `EMBED_DIM` against Chroma collection metadata (hard fail on mismatch). 
> - [ ] Compute embedding of `summary.text` (not full page body). 
> - [ ] Upsert **Mongo** summary/tag/embedding metadata **first**; then Chroma upsert. 
> - [ ] Retry policy; reconciliation job to re-sync any `id`s missing in Chroma.
> 
> ### F) Search API (`services/ts/search`)
> - [ ] `/search?q=...&tags=...&domain=...` → semantic results from Chroma with Mongo hydration (title,url,tags). 
> - [ ] `/page/:id` → page doc, edges (in/out), neighbors minimal. 
> - [ ] `/metrics`, `/healthz`.
> 
> ### G) Observability & Integrity
> - [ ] Counters/histograms: fetch latency, LLM latency, embed latency, queue sizes, failures. 
> - [ ] **Integrity report** job: Mongo count vs Chroma count, orphan detection, dim/model verification, top domains, degree distro. 
> - [ ] Reports saved under `docs/data/reports/*.json|.md`.
> 
> ### H) Safety/Abuse Prevention
> - [ ] Disallow forms by default; ignore `POST` ; skip URLs with session tokens. 
> - [ ] Block `.onion`, local/CGI, cloud metadata IP ranges. 
> - [ ] Strict size cap (e.g., 5MB) and content-type allow-list (text/html, text/plain, application/xhtml+xml). 
> - [ ] Respect `noindex`, `nofollow` (configurable). Default: **follow** unless `nofollow`.
> 
> ### I) CI & Tests
> - [ ] Mock HTTP server + snapshots of pages; robots fixtures; crawl 10 pages; assert graph, summaries, tags. 
> - [ ] No external network. 
> - [ ] Pre-commit/CI lint to forbid unpinned models and floating configs (leverages your pins linter).
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] **Robots-compliant** crawl of a seeded test domain producing ≥ 100 pages & ≥ 300 edges with < 1% duplicate nodes by `canonical_url`. 
> - [ ] **Summaries** exist for ≥ 95% `text/html` pages; average length 60–200 tokens; **temperature=0**. 
> - [ ] **Tags** present (3–12 each), all prefixed `#`, kebab_case if multiword. 
> - [ ] **Dual-sink**: Mongo pages count == Chroma ids count (± exclusions like robots-blocked). Integrity report saved. 
> - [ ] **Search API** returns relevant results for sample queries, filterable by tag/domain. 
> - [ ] **Observability**: metrics endpoints live; latency histograms populated. 
> - [ ] **Safety**: crawler never requests private networks in tests; rate limits enforce ≤ configured QPS; denies dangerous paths. 
> - [ ] **Docs**: architecture doc + runbooks committed and .
> 
> ---
> 
> ## 📂 Proposed Files/Paths
> - `shared/ts/src/web/url.ts` — canonicalization, hash, deny-patterns 
> - `shared/ts/src/web/robots.ts` — robots client/cache 
> - `shared/ts/src/web/fetcher.ts` — retries, backoff, caps, MIME, safety 
> - `shared/ts/src/web/html.ts` — parse, readability, link extraction 
> - `shared/ts/src/dual_sink/index.ts` — helpers for Mongo+Chroma atomic-ish upserts 
> - `services/ts/crawler/main.ts` — frontier, politeness, crawl loop 
> - `services/ts/graph/store.ts` — Mongo upserts, indexes 
> - `services/ts/summarizer/main.ts` — summary jobs 
> - `services/ts/tagger/main.ts` — tag extraction jobs 
> - `services/ts/indexer/main.ts` — embed + chroma upsert 
> - `services/ts/search/server.ts` — Fastify endpoints 
> - `docs/agents/web-crawler.md` — architecture & config 
> - `docs/runbooks/crawler-ops.md` — operations, scaling, pause/resume 
> - `docs/data/reports/*.md|*.json` — integrity outputs
> 
> *(Export via **@shared/ts/dist/**, no new aliases.)*
> 
> ---
> 
> ## 🔌 Broker & Queues (optional but recommended)
> - Topics: 
>  - `crawler.page.fetched`, `crawler.page.parsed`, `crawler.page.error` 
>  - `llm.summary.requested|completed`, `llm.tags.requested|completed` 
>  - `indexer.upsert.requested|completed|error` 
> - Backpressure with bounded queues; dead-letter for failures.
> 
> ---
> 
> ## 🧪 Prompt Sketches (deterministic)
> **Summary (temperature 0):** 
> “Summarize the page at {url} concisely (<= 8 sentences). No marketing fluff. Include key claims, entities, and any numbers. Output plain text.”
> 
> **Tags (temperature 0):** 
> “Extract 3–12 topic tags for the page at {url}. Single tokens only; use kebab_case for multiword (e.g., `ai-safety`). Return as a comma-separated list with leading `#`.”
> 
> ---
> 
> ## 🪪 Rate-Limit & Politeness
> - Token bucket per domain; adjustable via robots crawl-delay if present. 
> - Global max concurrency; graceful pause/resume via control topic or REST.
> 
> ---
> 
> ## 🧯 Runbooks
> - `seed → dry-run crawl (10 pages) → full crawl → LLM passes → index → integrity report → search smoke test`. 
> - Rollback: disable indexer; mark summaries stale; re-embed with corrected model; re-index.
> 
> ---
> 
> ## 🧱 Step 1–4 Milestones (your minimal format)
> - [ ] **Step 1 — Foundations**: URL canonicalizer, robots client, fetcher, parser; Mongo schemas & indexes; integrity skeleton. 
> - [ ] **Step 2 — Crawl & Graph**: frontier, dedupe, edges, persistence, metrics; seed crawling against fixtures. 
> - [ ] **Step 3 — LLM Passes & Dual-Sink**: summarizer, tagger, embedder, Chroma upserts, reconciliation, integrity report. 
> - [ ] **Step 4 — Search & Ops**: Fastify search API, dashboards/metrics, docs/runbooks, CI offline tests.
> 
> ---
> 
> ## 🔍 Relevant Resources
> - You might find [this] useful while working on this task 
>  *(point to your internal notes on URL canonicalization/robots and your existing dual-sink helpers)*
> 
> ---
> 
> ## Comments
> Append-only thread: record domain-specific deny-lists, prompt tweaks, and any integrity anomalies (# of orphans, dim mismatches, etc).
> 
> #tags #promethean #agent #crawler #hyper #summarization #tags #obsidian #chroma #mongodb #dual-sink #fastify #ollama #qwen #readability #robots #search #observability
<!-- UID: ed027ed5-6b39-4fd3-b350-7616cdc20fb4 -->

---




>[!nexus_user] **User** - 08/25/2025 at 8:31 PM
> Expand this one now:
> # Description
> 
> We want our websockets broker api to be at parity with the gptbridge, and ultimately for the gpt bridge to just be a light wrapper around the websocket interface to ensure that the system isn't overloaded, since our broker works to keep the health of the system good.
> 
> ## Requirements/Definition of done
> 
> - If it doesn't have this, we can't accept it
> 
> ## Tasks 
> 
> - [ ] Step 1
> - [ ] Step 2
> - [ ] Step 3
> - [ ] Step 4
> 
> ## Relevent resources
> 
> You might find [this] useful while working on this task
> 
> ## Comments
> 
> Useful for agents to engage in append only conversations about this task.
<!-- UID: 542949a4-436f-4d88-8954-4de300565a98 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 8:31 PM
> Here’s a full expansion that you can paste into your board. It lines up with your existing broker → service → bridge architecture and makes the WebSocket broker the **canonical API**, with the GPT bridge reduced to a thin load-shedding wrapper. 
> 
> ---
> 
> # WebSocket Broker API Parity with GPT Bridge 
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #broker #ws #api #gptbridge #parity #promethean #ops 
> 
> ---
> 
> ## 🛠️ Description 
> Bring the **WebSocket broker API** up to full parity with the existing **GPT Bridge HTTP interface**. Once parity is achieved, the GPT Bridge becomes a **thin wrapper** that proxies requests into the broker (adding load control, queueing, and overload protection). This ensures that the broker, which already manages system health and backpressure, becomes the **source of truth** for all messaging and tool calls. 
> 
> ---
> 
> ## 🎯 Goals 
> - Match **all GPT Bridge features** in the WebSocket broker (chat, tool calls, streaming, metadata, etc.). 
> - Expose a **stable, documented schema** for broker events and actions. 
> - Ensure GPT Bridge wrappers proxy to broker seamlessly, adding only: 
>  - **Rate limiting** 
>  - **Load shedding** 
>  - **Request shaping** (timeouts, retries, queue management) 
> - Make **broker → service → client** the canonical path for all communication. 
> - Guarantee CI verifies feature parity between broker and GPT Bridge. 
> 
> ---
> 
> ## 📦 Requirements / Definition of Done 
> - [ ] Broker supports **all GPT Bridge endpoints** as WebSocket actions/events. 
> - [ ] JSON schema defined for broker requests/responses (validated at runtime). 
> - [ ] GPT Bridge code reduced to a wrapper around broker client. 
> - [ ] Load shedding (queue caps, timeouts, backpressure) **only** happens in GPT Bridge. 
> - [ ] Broker metrics exported (active connections, queue depth, dropped, latency). 
> - [ ] CI runs **side-by-side tests** ensuring parity between GPT Bridge and broker responses. 
> - [ ] Documentation updated: GPT Bridge labeled **deprecated entrypoint** in future, with WS broker as canonical API. 
> 
> ---
> 
> ## 📋 Tasks 
> 
> ### Step 1 — Inventory & Schema 
> - [ ] List **all GPT Bridge APIs** currently in use: 
>  - Chat completions (sync/stream) 
>  - Embedding calls 
>  - Tool calling / structured outputs 
>  - File queries (if any) 
>  - Health/metrics endpoints 
> - [ ] Define **WebSocket equivalents** for each: 
>  - `action: "chat.completion"` 
>  - `action: "embedding.query"` 
>  - `action: "tool.invoke"` 
>  - `action: "system.health"` 
> - [ ] Create JSON schema contracts (`shared/ts/src/broker/schemas/*.json`). 
> - [ ] Add runtime validation (Ajv or zod). 
> 
> ### Step 2 — Broker Implementation 
> - [ ] Implement **WebSocket handlers** for each GPT Bridge feature. 
> - [ ] Add **request IDs** + correlation so responses can be tracked. 
> - [ ] Support **streaming events** (`delta` chunks for chat). 
> - [ ] Integrate with existing broker publish/subscribe system (reuse topics). 
> - [ ] Add **backpressure** handling in broker (pause/resume signals, per-connection limits). 
> - [ ] Export broker metrics: 
>  - Connected clients 
>  - Requests/sec 
>  - Queue depth 
>  - Dropped / errored 
> 
> ### Step 3 — GPT Bridge Wrapper 
> - [ ] Replace GPT Bridge implementations with a **broker client**. 
> - [ ] Add **overload protection**: 
>  - Connection pooling 
>  - Per-user rate limits 
>  - Queue caps with fail-fast 
> - [ ] Keep identical API surface (so clients don’t break). 
> - [ ] Mark GPT Bridge code paths as **deprecated** in docs, but keep for now. 
> 
> ### Step 4 — Testing, CI, and Docs 
> - [ ] Write **side-by-side parity tests**: 
>  - Given same input → broker vs GPT Bridge → outputs match. 
>  - Streaming responses chunk identically. 
> - [ ] CI runs parity suite on every PR. 
> - [ ] Add **integration tests** with actual services (chat, embeddings, tool calls). 
> - [ ] Document: 
>  - Broker API schemas (with examples). 
>  - Migration path: “new clients should connect directly to broker.” 
>  - GPT Bridge purpose: “thin wrapper for load shedding only.” 
> 
> ---
> 
> ## 🔧 Example Broker Messages 
> 
> **Request:** 
> ```json
> {
>  "id": "req-123",
>  "action": "chat.completion",
>  "payload": {
>  "model": "qwen3:14b-instruct",
>  "messages": [
>  { "role": "system", "content": "You are a helpful assistant." },
>  { "role": "user", "content": "Explain Promethean." }
>  ],
>  "stream": true
>  }
> }
> ``` 
> 
> **Response (streaming chunks):** 
> ```json
> {
>  "id": "req-123",
>  "event": "chat.delta",
>  "delta": "Promethean is a modular, multi-agent system..."
> }
> ``` 
> 
> **Final Response:** 
> ```json
> {
>  "id": "req-123",
>  "event": "chat.complete",
>  "output": {
>  "text": "Promethean is a modular..."
>  },
>  "usage": { "prompt_tokens": 42, "completion_tokens": 133, "total_tokens": 175 }
> }
> ``` 
> 
> ---
> 
> ## ✅ Acceptance Criteria 
> - [ ] Every GPT Bridge endpoint has a **1:1 broker action**. 
> - [ ] GPT Bridge wrapper proxies requests to broker only, adding load shedding. 
> - [ ] Parity suite passes in CI (outputs identical across both paths). 
> - [ ] Docs state broker is **canonical API**. 
> - [ ] Metrics visible for broker connections and GPT Bridge load shedding. 
> 
> ---
> 
> ## 📂 Proposed Files/Paths 
> - `shared/ts/src/broker/schemas/*.json` — JSON schemas 
> - `shared/ts/src/broker/client.ts` — WS client wrapper 
> - `services/ts/broker/handlers/*.ts` — action handlers 
> - `services/ts/gptbridge/main.ts` — reduced wrapper 
> - `tests/parity/broker-vs-bridge.spec.ts` — parity suite 
> - `docs/api/broker.md` — schema + examples 
> - `docs/migration/broker-vs-bridge.md` — migration notes 
> 
> ---
> 
> ## 🧱 Step 1–4 Milestones 
> - [ ] **Step 1 — Inventory & Schema**: List GPT Bridge APIs, define broker equivalents, write schemas. 
> - [ ] **Step 2 — Broker Implementation**: Implement handlers, events, metrics. 
> - [ ] **Step 3 — GPT Bridge Wrapper**: Proxy to broker client, add load shedding, keep surface. 
> - [ ] **Step 4 — Testing & Docs**: Parity suite, CI, documentation, migration path. 
> 
> ---
> 
> ## 🔍 Relevant Resources 
> - You might find [this] useful while working on this task 
>  *(link internal GPT Bridge API reference + broker design docs)* 
> 
> ---
> 
> ## Comments 
> Append-only thread for agents to log discovered gaps, schema changes, or overload handling notes. 
> 
> ---
> 
> Want me to also draft the **side-by-side parity test plan** (cases + expected outputs) so you can drop that directly into CI?
<!-- UID: 7d95e084-a81b-410c-8733-a5da08d49830 -->

---




>[!nexus_user] **User** - 08/25/2025 at 8:33 PM
> yes
<!-- UID: 6803e8f4-eabf-4f33-a713-c193fcfaeefc -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 8:33 PM
> Awesome. Here’s a drop-in **side-by-side parity test plan** you can wire into CI so the **WebSocket Broker** and **GPT Bridge** must behave identically (modulo allowed, explicitly-documented deltas).
> 
> # Broker ↔ GPT Bridge Parity Test Plan
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #broker #gptbridge #testing #parity #ws #http #ci #observability #promethean
> 
> ---
> 
> ## 🎯 Scope
> Compare, for the same inputs, that **outputs, streaming behavior, errors, timings, and metadata** are equivalent between:
> - **Broker (WS)** canonical actions/events, and 
> - **GPT Bridge (HTTP/WS)** wrapper that proxies + sheds load.
> 
> We normalize outputs so harmless differences (timestamps, ids) don’t fail the suite.
> 
> ---
> 
> ## 🔑 Preconditions
> - Deterministic models & prompts: **temperature=0**, pinned models (#versioning). 
> - Fixed chunking rules for streaming (server sends stable deltas). 
> - Same tool/plugin catalog visible to both sides. 
> - Same env, routing, and auth claims. 
> - Dual sinks off for tests unless specifically under “overload/backpressure”.
> 
> ---
> 
> ## 🧪 Test Matrix
> 
> | Area | Case | What we assert |
> |---|---|---|
> | Chat (sync) | small, medium, long prompts | identical `text`, `usage`, `finish_reason` |
> | Chat (stream) | delta chunking | same **chunk boundaries**, bytes, order, terminal `complete` |
> | Embeddings | single/batch inputs | vector length, numeric closeness (ULP / 1e-6), same metadata |
> | Tools | 1-tool, multi-tool, parallel tool calls | same tool selection, JSON args, tool result merge |
> | Errors | invalid schema, bad model, 401/403, 5xx | same error class/code/message class |
> | Timeouts | model, tool, end-to-end | fail shape + elapsed within tolerance |
> | Rate limits | per-user & global | bridge sheds, broker returns backpressure; identical HTTP status & WS close codes |
> | Backpressure | queue caps reached | same `overloaded` semantics and retry-after hints |
> | Cancellation | client abort mid-stream | both stop within Δ≤200ms; consistent terminal event |
> | Metadata | request_id, model, usage | identical after normalization |
> | Multi-tenant | org/user scopes | identical policy enforcement & audit trail |
> | Ordering | concurrent requests | per-request ordering preserved |
> | Large I/O | 1–2MB input (allowed) | no truncation; same tokenization & usage |
> | Binary edge | non-text MIME guarded | both reject with same code |
> | Health | health/metrics parity | counters increase consistently after a run |
> 
> ---
> 
> ## 🧱 Normalization Rules
> Before diffing:
> - Strip or canonicalize: `request_id`, timestamps, `queue_position`, transient URLs, floating latency fields (we check them separately with tolerances).
> - Round floats in embeddings to **6 decimals** and compare with **absolute tolerance 1e-6**.
> - Normalize whitespace in text: collapse multiple spaces, unify `\r\n` → `\n`.
> 
> ---
> 
> ## 📦 Fixtures
> - `tests/parity/fixtures/`:
>  - `chat/*.json` (prompts, system msgs)
>  - `tools/catalog.json` (stable tool set + deterministic mock backends)
>  - `embeddings/texts.jsonl` (50 cases, multilingual + emojis)
>  - `errors/*.json` (invalid payloads)
>  - `overload/profile.json` (synthetic load profile)
> - Test doubles for tools: deterministic side-effects, seeded RNG, or pure functions.
> 
> ---
> 
> ## 🧰 Harness & Helpers (TypeScript / Vitest)
> **Paths**
> - `shared/ts/src/parity/normalizers.ts` — text/usage/embedding normalizers 
> - `shared/ts/src/parity/runner.ts` — runs both paths and returns comparable outputs 
> - `tests/parity/*.spec.ts` — suites 
> - `tests/parity/utils/matchers.ts` — custom expect matchers (embeddings≈, streamEqual)
> 
> **Runner sketch**
> ```ts
> // shared/ts/src/parity/runner.ts
> import { brokerClient } from "@shared/ts/dist/broker/client";
> import { bridgeClient } from "@shared/ts/dist/bridge/client";
> import { normalizeChat, normalizeEmbed, normalizeError, normalizeStream } from "./normalizers";
> 
> export async function runChatBoth(payload) {
>  const [b, h] = await Promise.all([
>  brokerClient.chat(payload),
>  bridgeClient.chat(payload),
>  ]);
>  return { broker: normalizeChat(b), http: normalizeChat(h) };
> }
> 
> export async function runChatStreamBoth(payload, onChunk?) {
>  const acc = { broker: [], http: [] };
>  await Promise.all([
>  brokerClient.chatStream(payload, (c)=> { acc.broker.push(c); onChunk?.("broker", c); }),
>  bridgeClient.chatStream(payload, (c)=> { acc.http.push(c); onChunk?.("http", c); }),
>  ]);
>  return normalizeStream(acc);
> }
> 
> export async function runEmbBoth(inputs) {
>  const [b, h] = await Promise.all([
>  brokerClient.embed(inputs),
>  bridgeClient.embed(inputs),
>  ]);
>  return { broker: normalizeEmbed(b), http: normalizeEmbed(h) };
> }
> 
> export async function runToolBoth(payload) {
>  const [b, h] = await Promise.all([
>  brokerClient.toolCall(payload),
>  bridgeClient.toolCall(payload),
>  ]);
>  return { broker: b, http: h }; // tool result is deterministic, normalize later
> }
> ```
> 
> **Custom matchers**
> ```ts
> // tests/parity/utils/matchers.ts
> export function expectVectorsClose(a: number[], b: number[], tol=1e-6) {
>  expect(a.length).toBe(b.length);
>  for (let i = 0; i < a.length; i++) {
>  expect(Math.abs(a[i]-b[i])).toBeLessThanOrEqual(tol);
>  }
> }
> ```
> 
> ---
> 
> ## 🧪 Representative Test Cases
> 
> ### 1) Chat — Sync
> ```ts
> import { runChatBoth } from "@shared/ts/dist/parity/runner";
> 
> it("chat sync: medium prompt parity", async () => {
>  const payload = { model: "qwen3:14b-instruct", messages: [...], temperature: 0 };
>  const { broker, http } = await runChatBoth(payload);
>  expect(broker.text).toEqual(http.text);
>  expect(broker.finish_reason).toEqual(http.finish_reason);
>  expect(broker.usage).toEqual(http.usage);
> });
> ```
> 
> ### 2) Chat — Streaming
> ```ts
> import { runChatStreamBoth } from "@shared/ts/dist/parity/runner";
> import { expectStreamEqual } from "./utils/stream";
> 
> it("chat stream: chunk-by-chunk parity", async () => {
>  const payload = { model: "qwen3:14b-instruct", stream: true, messages: [...], temperature: 0 };
>  const acc = await runChatStreamBoth(payload);
>  expectStreamEqual(acc.broker, acc.http); // same chunk boundaries & content
> });
> ```
> 
> ### 3) Embeddings
> ```ts
> import { runEmbBoth } from "@shared/ts/dist/parity/runner";
> import { expectVectorsClose } from "./utils/matchers";
> 
> it("embeddings: batch parity", async () => {
>  const inputs = ["a", "b", "c"];
>  const { broker, http } = await runEmbBoth(inputs);
>  expect(broker.vectors.length).toBe(http.vectors.length);
>  broker.vectors.forEach((v,i)=> expectVectorsClose(v, http.vectors[i]));
>  expect(broker.dim).toBe(http.dim);
> });
> ```
> 
> ### 4) Tool Calls
> ```ts
> import { runToolBoth } from "@shared/ts/dist/parity/runner";
> import { normalizeToolResult } from "@shared/ts/dist/parity/normalizers";
> 
> it("tools: multi-tool selection parity", async () => {
>  const payload = { tools: [...], messages: [...], tool_choice: "auto", temperature: 0 };
>  const { broker, http } = await runToolBoth(payload);
>  expect(normalizeToolResult(broker)).toEqual(normalizeToolResult(http));
> });
> ```
> 
> ### 5) Error Equivalence
> ```ts
> import { brokerClient, bridgeClient } from "@shared/ts/dist/...";
> 
> it("errors: invalid schema yields same code", async () => {
>  const bad = { action: "chat.completion", payload: { model: "", messages: [] } };
>  const b = await brokerClient.request(bad).catch(e=>e);
>  const h = await bridgeClient.request(bad).catch(e=>e);
>  expect(normalizeError(b)).toEqual(normalizeError(h));
> });
> ```
> 
> ### 6) Overload / Rate Limit
> - Drive synthetic load from `tests/parity/overload.spec.ts` using worker threads. 
> - Expect **bridge** to shed (`429`, `retry_after_ms`) while **broker** signals backpressure (`overloaded`, server close code `1013` or app-level event). 
> - Verify documented mapping parity (wrapper must translate broker overload → HTTP 429 consistently).
> 
> ---
> 
> ## ⏱️ Timing Tolerances
> - Stream cancellation delta ≤ **200ms**. 
> - Timeout parity within **±10%** of configured timeout or **±250ms** (whichever larger). 
> - Queueing delay parity within **±1s** under load (bridge may add shaping).
> 
> ---
> 
> ## 📊 Metrics & Artifacts
> After each parity run, capture:
> - **Parity score**: passed / total, broken down by feature. 
> - **Drift report**: first mismatch diff (redacted), histograms for chunk counts, embedding drift stats. 
> - **Performance**: latency distributions (p50/p95) for both paths. 
> Artifacts under: `docs/data/reports/parity/<run-id>/*`.
> 
> ---
> 
> ## 🧯 CI Wiring
> **Workflow steps**
> 1. Spin local broker & bridge (compose or PM2). 
> 2. Seed tool registry (deterministic mocks). 
> 3. Run parity suites with `NODE_ENV=test PARITY=1`. 
> 4. Upload artifacts (reports + logs). 
> 5. Gate: **block merge** if any parity test fails.
> 
> **Minimal job**
> ```yaml
> - name: Start stack
>  run: docker compose -f docker-compose.test.yml up -d broker bridge tools
> 
> - name: Parity tests
>  run: |
>  pnpm i --frozen-lockfile
>  pnpm test --filter parity
> 
> - name: Upload parity artifacts
>  uses: actions/upload-artifact@v4
>  with:
>  name: parity-reports
>  path: docs/data/reports/parity/**
> ```
> 
> ---
> 
> ## ⚠️ Known Edge Cases & Guards
> - **Chunk boundaries**: ensure both sides use the same tokenizer/chunker. If not feasible, assert **content equality** with flexible chunk counts but require terminal framing parity. 
> - **Usage accounting**: minor differences from transport wrappers → normalize by rounding & asserting within ±1–2 tokens if exact matching is impossible. Prefer exact. 
> - **Request IDs**: compare after stripping UUIDs. 
> - **Clock**: use a **fake clock** for timeout tests to avoid flake.
> 
> ---
> 
> ## ✅ Acceptance Criteria (for this plan)
> - [ ] Suites exist for **chat (sync/stream)**, **embeddings**, **tools**, **errors**, **timeouts**, **overload**, **cancellation**, **metadata**. 
> - [ ] Normalizers & helpers implemented and reused by all cases. 
> - [ ] CI enforces parity gate on every PR. 
> - [ ] Reports are generated and stored per run with pass/fail summary. 
> - [ ] Documented **allowed deltas** (timing/rounding) are the only tolerated differences.
> 
> ---
> 
> ## 📂 Proposed Files/Paths
> - `shared/ts/src/parity/normalizers.ts` 
> - `shared/ts/src/parity/runner.ts` 
> - `tests/parity/chat.sync.spec.ts` 
> - `tests/parity/chat.stream.spec.ts` 
> - `tests/parity/embeddings.spec.ts` 
> - `tests/parity/tools.spec.ts` 
> - `tests/parity/errors.spec.ts` 
> - `tests/parity/overload.spec.ts` 
> - `tests/parity/cancellation.spec.ts` 
> - `tests/parity/metadata.spec.ts` 
> - `docs/data/reports/parity/*` 
> - `.github/workflows/parity.yml` (or folded into existing)
> 
> ---
> 
> ## Commit Template
> ```
> test(parity): add broker↔bridge parity suites + normalizers + CI gate
> 
> - Chat (sync/stream), embeddings, tools, errors, timeouts, overload, cancellation
> - Shared parity runner & normalizers
> - CI workflow and artifact reports
> ```
> 
> #tags #broker #gptbridge #parity #ws #http #testing #ci #observability #promethean
<!-- UID: 7ec8edb6-8c5b-4e3b-8023-1e3ddd2efe71 -->

---




>[!nexus_user] **User** - 08/25/2025 at 8:37 PM
> Ok now expand this one:
> # Description
> periodicly the embedding service will get disconnected from the broker and not die, blocking other processes who require embeddings. incoming
> I think it's just getting overloaded, but it should be killed by the hearbeat service I don't know why it isn't.
> 
> ## Related Epics
> - [[Import other projects.md]]
> ## Requirements/Definition of done
> 
> - If it doesn't have this, we can't accept it
> 
> ## Tasks 
> 
> - [ ] Step 1
> - [ ] Step 2
> - [ ] Step 3
> - [ ] Step 4
> 
> ## Relevent resources
> 
> You might find [this] useful while working on this task
> 
> ## Comments
> 
> Useful for agents to engage in append only conversations about this task.
<!-- UID: c016d053-f505-406f-8484-381289567c73 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 8:37 PM
> Here’s a surgical expansion you can drop into the board. Goal: make the **embedding service** fail fast, get killed when it’s unhealthy, and stop blocking dependents. No vibes—just guards, telemetry, and hard interlocks.
> 
> # Embedding service sometimes disconnects from broker and hangs → detect, shed, kill, recover
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #embeddings #broker #heartbeat #healthchecks #overload #resilience #promethean
> 
> ---
> 
> ## 🛠️ Problem recap (plain)
> Periodically the **embedding** service loses its broker connection and doesn’t die. It keeps the process “alive” enough to dodge current liveness checks, which **blocks requesters** that require embeddings. You suspect overload. If the heartbeat service worked end-to-end, it should have killed it; it didn’t.
> 
> ---
> 
> ## 🎯 Outcomes
> - The embedding service **refuses work** under overload (admission control) instead of zombifying.
> - When **broker connectivity is lost** or the **work loop stalls**, the service **exits** (SIGTERM → SIGKILL) quickly.
> - The **heartbeat** reliably detects unresponsive or disconnected state and kills the process within the configured window.
> - We have **metrics, logs, and repro** (chaos test) that prove this.
> 
> ---
> 
> ## 📦 Requirements / Definition of Done (non-negotiable)
> - [ ] **Explicit liveness** and **readiness** semantics:
>  - Liveness: event loop + worker pool making forward progress in the last `LIVENESS_MAX_STALL_MS`.
>  - Readiness: **broker connected** AND **model ready** AND **queue < MAX_QUEUE**.
> - [ ] **Broker-aware watchdog**: if `broker.disconnected_for > DISCONNECT_KILL_MS` → `process.exit(70)` (distinct code).
> - [ ] **Admission control**: reject new jobs once `inflight + queue ≥ MAX_QUEUE`, emit backpressure signal (+ metrics).
> - [ ] **Heartbeat** enriched:
>  - Sends `connected: true|false`, `queue_depth`, `inflight`, `last_job_latency_ms`, `last_progress_ts`.
>  - Server enforces kill if `now - last_progress_ts > HEARTBEAT_TIMEOUT` OR `connected=false for > DISCONNECT_KILL_MS`.
> - [ ] **Graceful shutdown**: stop intake, drain for `DRAIN_MS`, then hard exit if still busy.
> - [ ] **Chaos test** that severs broker and floods load → process is killed/restarted; dependents observe fail-fast (not hang).
> - [ ] **Alarms** on repeating death loops (>N restarts / 10 min) with log hint to raise capacity or lower concurrency.
> - [ ] **Docs** with clear thresholds and how to tune them.
> 
> ---
> 
> ## 📋 Tasks
> 
> ### Step 1 — Instrument & define health truth
> - [ ] Add **progress ticker** in the embed loop: update `last_progress_ts` whenever a batch completes (success or error).
> - [ ] Implement **readiness** and **liveness** endpoints (HTTP or broker health topic):
>  - `/health/ready` returns 200 only if `{ broker: connected, model: ready, queue < MAX_QUEUE }`.
>  - `/health/live` returns 200 only if `now - last_progress_ts < LIVENESS_MAX_STALL_MS`.
> - [ ] Extend **HeartbeatClient** payload (you already have it) to include:
>  ```json
>  {
>  "pid": 1234,
>  "name": "embeddings",
>  "connected": true,
>  "queue": 42,
>  "inflight": 8,
>  "last_progress_ts": 1724612345678,
>  "avg_job_ms": 37
>  }
>  ```
> - [ ] Update heartbeat server policy:
>  - If `connected=false` continuously for `DISCONNECT_KILL_MS`, kill.
>  - If `now - last_progress_ts > HEARTBEAT_TIMEOUT`, kill.
>  - Log structured reason: `reason="no_progress"` or `reason="broker_disconnected"`.
> 
> ### Step 2 — Fail fast: admission control & overload hygiene
> - [ ] Add **MAX_QUEUE** and **MAX_INFLIGHT** envs with sane defaults (and per-model overrides).
> - [ ] On intake:
>  - If `queue ≥ MAX_QUEUE` → **reject immediately** with `overloaded=true`, `retry_after_ms`.
>  - Publish **backpressure** metric and broker signal (bridges can shed load earlier).
> - [ ] Implement **work-budget** per request (deadline in ms). If budget exceeded while waiting → cancel.
> - [ ] Add **latency guard**: if `avg_job_ms × inflight > SLAM_LIMIT_MS` → temporarily pause intake.
> 
> ### Step 3 — Watchdog & exit semantics
> - [ ] Add a small **watchdog** in the embedding service (same process, separate timer):
>  - Checks every `WATCHDOG_INTERVAL_MS`:
>  - If broker state `disconnected` for `> DISCONNECT_KILL_MS` → `process.exit(70)`.
>  - If `now - last_progress_ts > LIVENESS_MAX_STALL_MS` → `process.exit(71)`.
> - [ ] Ensure **SIGTERM** handler: stop intake, set `readiness=false`, drain up to `DRAIN_MS`, then `process.exit(0)`.
> - [ ] PM2 / supervisor: restart on exit codes 70/71; **alert** if restart count threshold exceeded.
> 
> ### Step 4 — Reproduce, test, and document
> - [ ] **Chaos script** to simulate:
>  1) broker disconnect (kill socket / firewall rule),
>  2) load spike (burst 10× queue),
>  3) slow model (inject sleep).
>  Expect: fast rejection, watchdog exit, heartbeat kill if watchdog disabled.
> - [ ] **Parity tests** for fail-fast semantics: callers get `429`/`overloaded` vs hanging.
> - [ ] Dashboards: queue depth, inflight, job latency, disconnect duration, kill reasons.
> - [ ] Docs: tuning guide (`MAX_QUEUE`, `MAX_INFLIGHT`, `HEARTBEAT_TIMEOUT`, `DISCONNECT_KILL_MS`, `DRAIN_MS`), and the “Why we exit on disconnect” note.
> 
> ---
> 
> ## 🔧 Config (envs)
> ```
> EMBED_MAX_INFLIGHT=8
> EMBED_MAX_QUEUE=256
> EMBED_LIVENESS_MAX_STALL_MS=30000
> EMBED_DISCONNECT_KILL_MS=10000
> EMBED_WATCHDOG_INTERVAL_MS=1000
> EMBED_DRAIN_MS=5000
> HEARTBEAT_TIMEOUT=45000
> ```
> 
> ---
> 
> ## 🧩 Code sketches (tight & minimal)
> 
> **Admission control**
> ```ts
> function admit(): boolean {
>  return queue.length + inflight < EMBED_MAX_QUEUE;
> }
> 
> function enqueue(job) {
>  if (!admit()) return failFast(job, { overloaded: true, retry_after_ms: 250 });
>  queue.push(job);
> }
> ```
> 
> **Progress + watchdog**
> ```ts
> let lastProgress = Date.now();
> broker.on('connected', () => state.connected = true);
> broker.on('disconnected', () => state.connected = false);
> 
> async function workLoop() {
>  while (running) {
>  const job = queue.shift();
>  if (!job) { await sleep(5); continue; }
>  inflight++;
>  try {
>  await handle(job);
>  } finally {
>  inflight--;
>  lastProgress = Date.now();
>  }
>  }
> }
> 
> setInterval(() => {
>  const now = Date.now();
>  if (!state.connected && now - state.lastDisconnectAt > EMBED_DISCONNECT_KILL_MS) {
>  log.error('watchdog', { reason: 'broker_disconnected' }); process.exit(70);
>  }
>  if (now - lastProgress > EMBED_LIVENESS_MAX_STALL_MS) {
>  log.error('watchdog', { reason: 'no_progress' }); process.exit(71);
>  }
> }, EMBED_WATCHDOG_INTERVAL_MS);
> ```
> 
> **Heartbeat payload**
> ```ts
> heartbeatClient.send({
>  pid: process.pid, name: 'embeddings',
>  connected: state.connected, queue: queue.length, inflight,
>  last_progress_ts: lastProgress, avg_job_ms: metrics.avgJobMs()
> });
> ```
> 
> **Graceful shutdown**
> ```ts
> process.on('SIGTERM', async () => {
>  ready = false; running = false; const t0 = Date.now();
>  while (inflight > 0 && Date.now() - t0 < EMBED_DRAIN_MS) await sleep(50);
>  process.exit(0);
> });
> ```
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] Under forced broker disconnect, embedding service exits within **≤ EMBED_DISCONNECT_KILL_MS + WATCHDOG_INTERVAL_MS** (watchdog path).
> - [ ] If progress stalls **> EMBED_LIVENESS_MAX_STALL_MS**, service exits; heartbeat can also kill if watchdog disabled.
> - [ ] When **MAX_QUEUE** is reached, new requests are **rejected immediately** (no hang), and dependents observe `overloaded` with `retry_after_ms`.
> - [ ] Heartbeat dashboard shows `connected`, `queue`, `inflight`, `last_progress_ts`; kills occur when policies fire; kill reason logged.
> - [ ] Chaos test proves: no zombie state; dependents recover; system keeps breathing.
> - [ ] Docs present with tuning guidance and thresholds; PM2/supervisor configured to restart and alert on loops.
> 
> ---
> 
> ## 📂 Proposed Files/Paths
> - `services/ts/embeddings/worker.ts` — admission control + progress ticker
> - `services/ts/embeddings/watchdog.ts` — broker/liveness watchdog
> - `services/ts/embeddings/health.ts` — live/ready endpoints or broker health topic
> - `shared/ts/src/heartbeat/client.ts` — payload extended (connected/queue/inflight/last_progress_ts)
> - `services/ts/heartbeat/server.ts` — kill policies for new fields
> - `tests/chaos/embeddings.disconnect.spec.ts` — disconnect/overload chaos tests
> - `docs/runbooks/embeddings-health.md` — tuning, failure modes, ops actions
> 
> ---
> 
> ## 🔍 Debug checklist (use before/after)
> - Broker logs show **disconnect** → embedding logs show **watchdog exit** within bound.
> - Heartbeat shows **stalled progress** → kill → supervisor restart.
> - Dependents receive **fail-fast** responses, not timeouts (inspect bridge logs).
> - No request spends > budgeted time in queue; queues drop after kill/restart.
> 
> ---
> 
> ## 🧯 Pitfalls & guardrails
> - Don’t rely only on **socket events**—TLS stalls can leave a half-open connection; the **progress ticker** is your truth.
> - **Slow model** ≠ dead process: measure *progress*, not just *connection*.
> - Avoid “graceful drain forever”: enforce **hard DRAIN_MS cap**.
> - Watch for **restart storms**: cap concurrency and consider exponential backoff on reconnect.
> 
> ---
> 
> ## Step 1–4 (your minimal milestone format)
> - [ ] **Step 1 — Health Semantics:** implement live/ready; progress ticker; heartbeat payloads; server kill rules.
> - [ ] **Step 2 — Admission Control:** MAX_QUEUE/MAX_INFLIGHT + fail-fast + deadlines.
> - [ ] **Step 3 — Watchdog & Shutdown:** broker/liveness watchdog; graceful drain; supervised restarts; alerts.
> - [ ] **Step 4 — Chaos & Docs:** disconnect + overload chaos tests; dashboards; runbook; finalize thresholds.
> 
> ---
> 
> ## Commit template
> ```
> fix(embeddings): kill-on-disconnect/stall + admission control + heartbeat kill policies
> 
> - Add progress-based liveness and broker-aware readiness
> - Enforce MAX_QUEUE/MAX_INFLIGHT with fail-fast overload responses
> - Watchdog exits on broker disconnect or no-progress conditions
> - Heartbeat payloads & server policies updated; kill reasons logged
> - Chaos tests for disconnect/overload; docs & tuning guide
> ```
> 
> #tags #embeddings #reliability #heartbeat #watchdog #overload #backpressure #chaos #pm2 #broker #promethean
<!-- UID: 3eec3e66-fd0b-4f5c-9c62-55fd3228fbc4 -->

---




>[!nexus_user] **User** - 08/25/2025 at 9:06 PM
> Now this one
> # Description
> 
> I want a mirror of the pythagoras custom gpt which use the /v1 smartgpt-bridge endpoints to perform tool calls 
> 
> ## Requirements/Definition of done
> 
> - There is a chat client that uses the LLM worker via ws
> - The LLM worker accepts tool calls
> - tool call specs are automaticly generated from openapi spec available at [v1 openapi.json](https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/v1/openapi.json)
> - The v1 openapi spec has descriptions which are clear enough to clearly communicate to a model what they are for
> 
> ## Tasks 
> 
> - [ ] Step 1
> - [ ] Step 2
> - [ ] Step 3
> - [ ] Step 4
> 
> ## Relevent resources
> 
> You might find [this] useful while working on this task
> 
> ## Comments
> 
> Useful for agents to engage in append only conversations about this task.
<!-- UID: c397c618-9f51-4eae-8384-67b37d7f7487 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 9:06 PM
> Here’s a concrete, repo-ready expansion you can drop into your board. It builds a **Pythagoras-mirror custom GPT** that talks to your **LLM worker over WS** and performs **tool calls** against **/v1 smartgpt-bridge** using **auto-generated specs from the OpenAPI**.
> 
> # Pythagoras GPT Mirror (WS chat + OpenAPI-driven tool calls via /v1)
> **Owner:** Codex / Agent 
> **Status:** Planned 
> **Labels:** #agents #ws #openapi #tools #smartgpt-bridge #prompts #promethean
> 
> ---
> 
> ## 🛠️ Description
> Create a “Pythagoras-mirror” agent that:
> 1) runs a **chat client** over the **broker/WebSocket LLM worker**, 
> 2) supports **tool calls** selected by the model, 
> 3) **auto-generates tool specs** from the **/v1/openapi.json** for smartgpt-bridge, and 
> 4) ensures the **OpenAPI op descriptions** are clear and model-usable.
> 
> ---
> 
> ## 🎯 Goals
> - Model-driven tool selection (no brittle routing). 
> - No HTTP coupling in the chat client—**WS to LLM worker** only; the worker executes tools by calling **smartgpt-bridge /v1**. 
> - Tool catalog stays in sync with the OpenAPI spec automatically.
> 
> ---
> 
> ## 📦 Requirements / Definition of Done (strict)
> - [ ] **Chat client** uses **WS** to talk to the **LLM worker** (broker path). 
> - [ ] **LLM worker** accepts OpenAI-style tool calls (function-calling / tool_choice=auto). 
> - [ ] **Tool catalog auto-generated** from **/v1/openapi.json** (names, descriptions, JSON schemas for params). 
> - [ ] **OpenAPI op descriptions** are present, unambiguous, and concise enough that a model can choose the correct tool. 
> - [ ] **E2E demo:** user asks a question that requires a tool → model chooses tool → worker calls **smartgpt-bridge** → result streamed back. 
> - [ ] **Parity tests** for at least 5 representative endpoints. 
> - [ ] No new TS path aliases. Export via **@shared/ts/dist/**.
> 
> ---
> 
> ## Architecture (minimal)
> - **services/ts/llm-worker** 
>  - WS in → tool-aware chat loop → tool exec adapter → calls **smartgpt-bridge /v1** → WS out. 
> - **services/ts/pythagoras-mirror** (agent wrapper) 
>  - Prompts + policies specific to “Pythagoras” persona (math-first, stepwise). 
> - **shared/ts/openapi-tools** 
>  - Fetches/loads **/v1/openapi.json** → generates: 
>  - **tool specs** (name, description, parameters JSON schema), 
>  - **client stubs** for executing tools.
> 
> ---
> 
> ## Data contracts (concise)
> 
> ### Tool spec (fed to model)
> ```ts
> type ToolSpec = {
>  type: "function";
>  function: {
>  name: string; // opId or normalized path+method
>  description: string; // from OpenAPI; trimmed & edited
>  parameters: Record<string, any>; // JSON Schema for body/query
>  };
> };
> ```
> 
> ### WS message (worker)
> ```ts
> // request -> worker
> { id, action: "chat.completion", payload: { model, messages, tools: ToolSpec[], tool_choice: "auto", stream: true } }
> 
> // worker events
> { id, event: "chat.delta", delta }
> { id, event: "tool.call", name, arguments } // model-selected
> { id, event: "tool.result", name, content } // bridge response snippet
> { id, event: "chat.complete", output, usage }
> ```
> 
> ---
> 
> ## 📋 Tasks & Subtasks
> 
> ### Step 1 — OpenAPI ingestion → tools & client
> - [ ] Create **openapi fetch/loader**: `shared/ts/src/openapi-tools/loader.ts` 
>  - Fetch JSON from `/v1/openapi.json` (configurable URL). 
>  - Cache & hash (ETag) to avoid churn.
> - [ ] Build **spec → tools generator**: `shared/ts/src/openapi-tools/generateTools.ts` 
>  - Map each **operationId** (or path+method) to a **ToolSpec**. 
>  - Merge **parameters** (path/query/body) into a single JSON Schema object. 
>  - **Normalize names**: `v1.files.search` → `files_search`. 
>  - **Descriptions**: prefer `operation.summary || operation.description`; trim, remove HTML, imperative voice. 
>  - Add **guard rails**: skip ops without descriptions or with ambiguous names; emit report.
> - [ ] Build **typed client stubs**: `shared/ts/src/openapi-tools/client.ts` 
>  - Given `{name, args}`, resolve to `{method, url, body/query}` and call **smartgpt-bridge** (with auth if needed). 
>  - Return normalized result `{ content, status, headers? }`. 
>  - Handle streaming endpoints by accumulating chunks or relaying partials as `tool.result` deltas.
> 
> ### Step 2 — Tool-aware LLM worker over WS
> - [ ] Extend **LLM worker** WS handler: `services/ts/llm-worker/handlers/chat.ts` 
>  - Accept `tools` and `tool_choice`. 
>  - When model returns a tool call: 
>  1) emit `tool.call`, 
>  2) execute via **openapi client**, 
>  3) stream `tool.result` (if large) or single result, 
>  4) feed the result back into the model as a `tool` message, continue. 
> - [ ] Admission control & timeouts for tools (per op SLA, default 10s). 
> - [ ] Metric hooks: `tool_invocations_total{tool=...}`, `tool_latency_ms_bucket`, `tool_errors_total`. 
> - [ ] Error policy: deliver short, model-friendly error (`tool_name`, `code`, `message`), then allow model to recover or ask clarifying q.
> 
> ### Step 3 — Pythagoras mirror agent wrapper
> - [ ] Agent config `services/ts/pythagoras-mirror/config.ts`: 
>  - **System prompt** (math-first, stepwise reasoning, prefer tools). 
>  - Tool selection guidance: “Use a tool whenever external data is needed; don’t hallucinate API results.” 
>  - Default `tool_choice: "auto"`, `temperature=0`.
> - [ ] Bootstrap script `services/ts/pythagoras-mirror/start.ts`: 
>  - Loads **ToolSpec[]** from generator. 
>  - Establishes WS to **llm-worker**. 
>  - Provides a tiny CLI or HTTP shim to post messages and stream replies (dev UX).
> 
> ### Step 4 — Make OpenAPI descriptions model-ready & test
> - [ ] **Lint OpenAPI**: `scripts/ci/check-openapi-descriptions.ts` 
>  - Assert description/summary exists, ≤ 200 chars, starts with a verb, contains required input hints. 
>  - Fail CI if any op is missing or ambiguous. 
> - [ ] **Goldens**: write **5–10 parity tests** that require tool use, e.g.: 
>  - file search, directory tree, policy check, status/health, small content read. 
>  - For each, assert: model picks correct tool, args schema validated, result returned, final answer integrates tool data. 
> - [ ] **Docs**: `docs/agents/pythagoras-mirror.md` explaining configuration, how tool specs are auto-generated, and how to add/rename an op without breaking the model.
> 
> ---
> 
> ## 🔧 Config (envs)
> ```
> OPENAPI_URL=https://.../v1/openapi.json
> PYTHAGORAS_MODEL=qwen3:instruct
> LLM_WORKER_WS=ws://broker/llm
> TOOL_TIMEOUT_MS=10000
> TOOL_MAX_RESULT_KB=256
> ```
> 
> ---
> 
> ## 🧪 Test plan (essentials)
> - **Tool discovery:** generator produces ≥ N tools; none without description. 
> - **Schema parity:** sampling ops: generated JSON Schema matches OpenAPI for required/optional fields. 
> - **Round-trip:** prompt → tool call → bridge result → model reply (no hangs). 
> - **Error cases:** missing arg → schema error; 404/500 from bridge → worker reports succinct error; model recovers. 
> - **Load:** concurrent tool calls ×10; WS remains stable; timeouts enforced. 
> - **Docs linter:** CI fails if an op lacks a usable description.
> 
> ---
> 
> ## ✅ Acceptance Criteria
> - [ ] WS chat client ↔ **llm-worker** end-to-end streaming works. 
> - [ ] **Tool calls accepted and executed**; arguments validated against generated JSON Schema. 
> - [ ] Tool catalog **auto-generated** on boot (and cached); human report lists skipped/ambiguous ops. 
> - [ ] **OpenAPI descriptions** lint-clean; ops are understandable to a model (imperative, concise). 
> - [ ] Green **golden tests** covering at least 5 representative tools. 
> - [ ] Docs explain how to add/rename an OpenAPI op and re-generate tools.
> 
> ---
> 
> ## 📂 Proposed Files/Paths
> - `shared/ts/src/openapi-tools/loader.ts` 
> - `shared/ts/src/openapi-tools/generateTools.ts` 
> - `shared/ts/src/openapi-tools/client.ts` 
> - `services/ts/llm-worker/handlers/chat.ts` (tool-aware) 
> - `services/ts/pythagoras-mirror/config.ts` 
> - `services/ts/pythagoras-mirror/start.ts` 
> - `tests/e2e/pythagoras/tools.spec.ts` 
> - `scripts/ci/check-openapi-descriptions.ts` 
> - `docs/agents/pythagoras-mirror.md`
> 
> ---
> 
> ## CLI sketches (for humans/dev)
> ```
> # 1) Generate tool catalog from OpenAPI
> pnpm run generate:tools
> 
> # 2) Start worker + agent mirror
> pnpm --filter services/ts/llm-worker start
> pnpm --filter services/ts/pythagoras-mirror start
> 
> # 3) Chat (dev)
> curl -N -X POST localhost:3210/pythagoras/chat -d '{"text":"Search files for \"embedding\" and summarize."}'
> ```
> 
> ---
> 
> ## Step 1–4 (your minimal milestone format)
> - [ ] **Step 1 — OpenAPI → Tools:** loader, generator, typed client, report on skipped ops. 
> - [ ] **Step 2 — Worker Tooling:** WS chat handler supports tool calls; execute via bridge; metrics & timeouts. 
> - [ ] **Step 3 — Agent Mirror:** system prompt, boot logic, dev shim. 
> - [ ] **Step 4 — Lint & Tests:** description linter, goldens, load test, docs.
> 
> ---
> 
> ## Commit template
> ```
> feat(agent): Pythagoras-mirror via WS with OpenAPI-driven tools (/v1 smartgpt-bridge)
> 
> - Auto-generate tool specs from /v1/openapi.json
> - LLM worker accepts tool calls and executes via smartgpt-bridge
> - OpenAPI description linter; goldens for 5 representative ops
> - Docs & dev bootstrap
> ```
> 
> #tags #promethean #pythagoras #ws #llm-worker #smartgpt-bridge #openapi #tool-calling #testing #docs
<!-- UID: 909ca094-ce1f-42c7-bebb-91ebe764090a -->

---


