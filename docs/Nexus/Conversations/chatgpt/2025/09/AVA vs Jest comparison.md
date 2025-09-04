---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "AVA vs Jest comparison"
conversation_id: 68b64676-daa4-8326-91c4-c95aa4915d87
create_time: 09/01/2025 at 8:20 PM
update_time: 09/01/2025 at 9:07 PM
---

# Title: AVA vs Jest comparison

Created: 09/01/2025 at 8:20 PM
Last Updated: 09/01/2025 at 9:07 PM
Chat URL: https://chat.openai.com/c/68b64676-daa4-8326-91c4-c95aa4915d87


>[!nexus_user] **User** - 09/01/2025 at 8:20 PM
> ava vs jest
<!-- UID: f160be6a-7256-4b6d-9dd1-3c11341be358 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:21 PM
> Here’s the no-BS take on **AVA vs Jest**—when to pick which, the tradeoffs that actually matter in 2025, and a couple of TypeScript-friendly examples.
> 
> # TL;DR
> - **Pick Jest** if you want the batteries-included ecosystem (mocking/spies, snapshots, watch mode, good TS tooling, React/Vitest-style APIs) and you can live with a heavier runner. Jest 30 tightened things up and is faster than older releases, but it still brings more machinery. cite 
> - **Pick AVA** if you want a minimal, parallel, process-isolated runner with clean output and native ESM friendliness. It stays out of your way, but you’ll compose your own mocking/assert libs when you go beyond basics. cite
> 
> ---
> 
> # What’s changed lately (matters for your decision)
> - **Jest 30 (June 2025)**: faster module resolution (new `unrs-resolver`), lower memory, improved isolation; drops Node 14/16/19/21; min TypeScript **5.4**. Translation: if you tried Jest a year or two ago and bounced off ESM/TS slowness, it’s better now—but you may need to bump Node/TS. cite
> - **AVA**: continues to lean into **process isolation** and **concurrent** test files with clean stack traces and CI-parallel awareness out of the box. It’s intentionally small—no giant plugin jungle. cite
> 
> ---
> 
> # Feature snapshot (practical differences)
> 
> | Area | AVA | Jest |
> |---|---|---|
> | **Philosophy** | Minimal runner, concurrency & isolation first | All-in-one framework (runner + expect + mocks + snapshots) |
> | **ESM / modern JS** | First-class; simple ESM setups | Works, much improved in v30, but historically fussier; now faster & more compliant | 
> | **TypeScript** | Works via ts-node/tsconfig or precompile; light touch | First-class DX; types bundled; v30 requires TS ≥ **5.4** | 
> | **Mocking/Spies** | Bring your own (e.g., `sinon`, `tinyspy`) | Built-in mocks, timers, spies; strong API |
> | **Snapshots** | Supported | Mature and ubiquitous |
> | **Watch / UI / Plugins** | Minimal | Rich watch mode ecosystem & community |
> | **Speed** | Very fast per-test overhead, parallel by default | Heavier historically; **v30** reduced overhead notably | 
> | **Ecosystem** | Small, focused | Huge (React Testing Library, jest-dom, community presets, etc.) |
> 
> Sources: AVA repo; Jest 30 blog & upgrade notes; community comparisons. cite
> 
> ---
> 
> # How I’d choose (systems-designer mindset)
> Ask: **Do you need an opinionated test platform, or just a fast runner?**
> 
> - If your stack leans on **React/Vite/RTL**, heavy **mocking**, **snapshot reviews**, and team familiarity → **Jest** is the low-friction choice, and v30 reduces the historical pain around ESM/TS performance. Just budget for Node/TS upgrades. cite 
> - If you prefer **small tools you compose**, value **process isolation** and **clean output**, run **Node services** or lib code, and you’re comfortable pulling in minimal assert/mock libs → **AVA** keeps the surface area tiny and fast. cite
> 
> Skeptical note: lots of teams default to Jest “because everyone uses it.” Don’t—unless you actually need its features. If your tests don’t rely on Jest’s mocks/snapshots, AVA (or even Node’s built-in runner) can be simpler and faster. (But your question was AVA vs Jest, so I’m sticking to those two.)
> 
> ---
> 
> # Setup friction (ESM + TS reality check)
> - **Jest**: ESM/TS friction used to be a meme; **v30** ships major resolver & perf improvements, but you still align Node ≥ 18 and TS ≥ 5.4. If your deps publish mixed CJS/ESM, Jest 30 handles more edge cases than prior versions. cite 
> - **AVA**: ESM is straightforward; fewer knobs. You’ll add your own mocking/assert libs when needed. cite
> 
> (If you’ve seen horror posts about Jest + ESM/TS from 2023, many complaints are outdated—but not all exotic setups are magically fixed.) cite
> 
> ---
> 
> # Minimal, functional TypeScript examples
> 
> **AVA** (pure functions, no mutation):
> 
> ```ts
> // add.ts
> export const add = (a: number, b: number) => a + b;
> 
> // add.test.ts
> import test from 'ava';
> import { add } from './add';
> 
> test('add is pure and sums inputs', t => {
>  t.is(add(2, 3), 5);
>  t.is(add(0, 0), 0);
> });
> ```
> 
> **Jest** (built-in expect/mocks; pure function stays pure):
> 
> ```ts
> // add.ts
> export const add = (a: number, b: number) => a + b;
> 
> // add.test.ts
> import { add } from './add';
> 
> test('add is pure and sums inputs', () => {
>  expect(add(2, 3)).toBe(5);
>  expect(add(0, 0)).toBe(0);
> });
> ```
> 
> If you need **spies/mocks** for side-effectful collaborators:
> - **Jest**: `jest.spyOn(obj, 'fn')`, fake timers, module mocks—no extra deps. 
> - **AVA**: add a tiny spy lib or pass fakes via DI. (Lean into FP: inject dependencies; test the composition, not globals.) cite
> 
> ---
> 
> # Concrete recommendations
> 
> - **Greenfield lib/service (Node ≥ 18, TS ≥ 5.4):** 
>  Start with **AVA** for speed and simplicity. Add `sinon`/`tinyspy` only if needed. If your team later demands snapshots or rich mocks, switching to Jest is feasible.
> 
> - **Front-end apps with React/RTL, snapshots, lots of mocks:** 
>  Use **Jest 30**. You’ll get smoother DX, watch mode, and ecosystem glue. Make sure your CI images are on Node 18+ and TS 5.4+. cite
> 
> - **Legacy repo stuck on old Node/TS:** 
>  Staying on older Jest is possible but not ideal; consider upgrading infra or choose AVA if it meets needs without forcing the toolchain hop. (Jest 30 raised the floor.) cite
> 
> ---
> 
> # Migration quick notes
> - **To AVA**: replace `describe/it` semantics with `test`; drop Jest globals; pick an assertion/mocking lib only when a test demands it. Parallelism might surface hidden global state—fix by making deps explicit.
> - **To Jest**: remove ad-hoc assert/mocks; adopt `expect`, `jest.spyOn`, snapshots; configure ESM via latest docs; verify Node/TS minimums. cite
> 
> ---
> 
> If you want, tell me your project shape (Node version, bundler, React or not, CI constraints, mocking needs). I’ll call the shot for your exact case and hand you a drop-in config.
> 
> #hashtags
> #testing #jest #ava #typescript #functionalprogramming #nodejs #esmodules #snapshots #mocks #ci
<!-- UID: 54d968a5-43b3-42e7-9ac8-46f73f605147 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:23 PM
> I currently use ava for testing, but bots keep defaulting to jest. I don't use react, I explicitly avoid it. I like that ava is minimal, and concurrent by default. Node js is all about concurrency. If you can't test your pieces concurrently, I think you have a problem with your system.
<!-- UID: 64a77dd0-046d-49ec-a451-7d697fbec153 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:23 PM
> Right there with you. If your code can’t be tested concurrently, the system is leaking shared state. AVA is a good pressure test for that by design (process-isolated files, concurrent by default). Let’s double-down on AVA and make the repo actively resist Jest creep.
> 
> # Keep AVA—and make it stick
> 
> ## 1) Lock AVA into your tooling
> - **`package.json` scripts** (single source of truth):
>  ```json
>  {
>  "scripts": {
>  "test": "ava",
>  "test:watch": "ava --watch",
>  "test:serial": "ava --serial",
>  "coverage": "c8 -r text -r html ava"
>  }
>  }
>  ```
>  AVA runs files **concurrently** by default; `--serial` is the explicit escape hatch when you truly need it. cite
> 
> - **ESLint**: add `eslint-plugin-ava` rules to nudge test style and detect globals. (Bonus: fails PRs that introduce Jest globals.)
> 
> - **Pre-commit/pre-PR guard**: a tiny script that rejects new deps containing `jest`, `@jest/*`, or `vitest`. Keep bots honest.
> 
> ## 2) TypeScript + ESM without drama
> Two stable paths:
> - **Precompile TS** and let AVA load the built JS using `@ava/typescript` so you can still point AVA at `.ts` entry paths: 
>  ```
>  pnpm add -D @ava/typescript
>  ```
>  This plugin is designed for projects that **precompile TypeScript**, mapping TS test files to the built JS while keeping a clean AVA config. cite
> - Or **precompile with `tsc` / run with `tsx`** and keep AVA on JS files only. Either way: avoid runtime transpile hacks; they’re where most “it works on my machine” failures come from.
> 
> ## 3) Coverage that respects source maps
> Use **`c8`** (native V8 coverage). It correctly remaps to TS with source maps and plays nicely with AVA’s process model:
> ```
> pnpm add -D c8
> pnpm run coverage
> ```
> `c8` supports source-map remapping (TS/JSX) out of the box. cite
> 
> ## 4) Minimal spying/mocking (no framework lock-in)
> Stay composable:
> - **`tinyspy`** for microscopic spies (10KB, no deps). Great for FP seams and DI tests. cite
> - **Sinon** when you need robust fakes, timers, sandboxes. Works with any runner. cite
> 
> ## 5) Snapshots—only if they earn their keep
> AVA supports snapshot testing (`t.snapshot(value)`), but use it sparingly (structural data/ASTs, not volatile text): AVA has long-standing snapshot support, inspired by Jest, available via its assertions interface. cite
> 
> ## 6) Concurrency discipline (your mantra)
> - Files run **in parallel** (separate processes). If something flakes under AVA but “works” under single-threaded runners, that’s a red flag about hidden globals or shared resources. AVA’s `test.serial` exists for the handful of cases that truly can’t be parallelized. cite
> - If you ever need to compare: Node’s built-in runner can be dialed to run in parallel with `concurrency`, but AVA’s isolation model is the stronger default for catching leaks. cite
> 
> ## 7) CI that doesn’t fight you
> **GitHub Actions** (monorepo-safe):
> ```yaml
> name: test
> on: [push, pull_request]
> jobs:
>  ava:
>  runs-on: ubuntu-latest
>  steps:
>  - uses: actions/checkout@v4
>  - uses: pnpm/action-setup@v4
>  with: { version: 9 }
>  - uses: actions/setup-node@v4
>  with: { node-version: 20, cache: 'pnpm' }
>  - run: pnpm install --frozen-lockfile
>  - run: pnpm run test
>  - run: pnpm run coverage
> ```
> 
> ## 8) Editor/UX niceties
> - VS Code: “AVA Test Explorer” extension gives you a sidebar test tree without pulling Jest in. cite
> - Human-readable results by default; add `--tap` only if your CI tooling needs TAP output. cite
> 
> ---
> 
> # Why bots keep defaulting to Jest—and how to stop it
> - **Ecosystem inertia** (React/RTL tutorials, blog SEO) trains models & templates to suggest Jest by default. 
> - **Fix**: codify the choice in your repo:
>  - `README` with a short “Testing Philosophy” paragraph (“concurrency first; AVA by policy”) to AVA docs. cite
>  - `dangerfile.js` (or a small CI script) that fails PRs introducing Jest deps or `describe/it` globals.
>  - `renovate.json`/`dependabot` ignore rules for Jest packages.
>  - Project templates/scaffolds (`pnpm create …`) that bake in AVA + c8.
> 
> ---
> 
> # Sanity check list (for concurrent-safe tests)
> - Pure functions first; for effects, **inject** dependencies and pass fakes in. 
> - No cross-test mutation; temp dirs per test; random ports; unique DB/schema names. 
> - Use **`test.serial`** only at the boundary you can’t parallelize yet (e.g., single shared external service). cite
> 
> If you want, I’ll bang out a minimal `@promethean/ava-preset` (config + c8 + tinyspy + eslint-plugin-ava + VSCode settings) so every package inherits the same test surface and the bots stop “helpfully” swapping runners.
> 
> #hashtags
> #ava #concurrency #nodejs #typescript #c8 #sinon #tinyspy #testingPhilosophy #promethean
<!-- UID: f36dadae-1c22-448d-836a-ca32479edc06 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:31 PM
> I've got all that... what I need is some good prompts, I had to nuke a lot of my AGENTS.md file also because so much stuff moved.
<!-- UID: b4531454-43b0-4598-b77a-38416fce1457 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:31 PM
> Got it. Here’s a lean, **drop-in `AGENTS.md` scaffold** with reusable prompt blocks you can paste and adapt. It encodes your constraints (AVA, TS FP, no React, no Python, local-only stack, concurrency-first). It’s Obsidian-friendly, includes clear roles, rubrics, and checklists, and keeps bots from drifting to Jest.
> 
> ---
> 
> # AGENTS.md — Prompts you can trust
> 
> ## Global Philosophy (prepend to every agent)
> - **Stack**: Node.js ≥18, TypeScript, **functional style** (immutability, mapping, pure functions, composition). 
> - **Testing**: **AVA** only. Concurrency by default. Use `test.serial` sparingly. 
> - **Bans**: **No Jest**, **no React**, **no Python**, **no SaaS tokens**. Prefer local Docker images. 
> - **DX**: Minimal deps, predictable builds, explicit configs. 
> - **Tone**: Skeptical, practical, concise. Admit uncertainty; show work via small, verifiable steps.
> 
> > If any instruction conflicts with these, **refuse and restate** the constraint.
> 
> ---
> 
> ## Shared Variables (fill per task)
> ```
> $GOAL = <what outcome matters to users/devs>
> $CONTEXT = <paths, APIs, current errors>
> $CONSTRAINTS = <perf/mem caps, CI limits, Node/TS versions>
> $DEFINITION_OF_DONE = <observable checks incl. tests/bench/linters>
> ```
> 
> ---
> 
> ## Agent 1 — Test Architect (AVA-first)
> 
> **System Prompt**
> - You are **Test Architect (AVA)**. Your job is to design **concurrent-safe tests** that force good boundaries. 
> - Prefer **black-box tests** around pure transforms; inject side effects. 
> - For I/O: use **temp dirs / random ports / unique prefixes** to allow parallel runs. 
> - Provide **just enough code** to run under `pnpm test` (AVA). 
> - If the user asks for Jest, **refuse** and offer the AVA equivalent.
> 
> **Output Contract**
> 1) **Test Plan** (unit/integration boundaries, concurrency hazards called out). 
> 2) **Minimal Fixtures** (pure data first, then tiny fakes). 
> 3) **AVA Tests** (TS). 
> 4) **Why concurrent?** (1–3 bullets showing what leaks you’re catching). 
> 
> **Rubric (self-check)**
> - [ ] No globals mutated across tests 
> - [ ] No fixed ports/paths 
> - [ ] Coverage of happy path + 1 failure mode 
> - [ ] Runs in parallel locally & in CI
> 
> **Prompt Template**
> ```
> Design AVA tests for:
> - $GOAL
> - Codebase context: $CONTEXT
> - Constraints: $CONSTRAINTS
> - Done when: $DEFINITION_OF_DONE
> 
> Deliverables per “Output Contract”.
> ```
> 
> ---
> 
> ## Agent 2 — Refactorer (TS FP)
> 
> **System Prompt**
> - You are **Refactorer**. Transform imperative/mutable code to **pure, composable functions**. 
> - Keep public API stable unless told otherwise. 
> - Add **property-based edge cases** only where they reveal real bugs. 
> - Include **before/after** diffs (conceptual, not git), and **migration notes** if signatures changed.
> 
> **Checklist**
> - [ ] No hidden IO in core logic 
> - [ ] Pure functions at the leaf level 
> - [ ] Side effects isolated to adapters 
> - [ ] Types narrow at boundaries, widen internally
> 
> ---
> 
> ## Agent 3 — Repo Guardian (Anti-Jest)
> 
> **System Prompt**
> - You are **Repo Guardian**. You scan suggested changes for policy violations. 
> - On any of: `jest`, `@jest/*`, `vitest`, `react`, `python`, cloud SDKs → **stop** and propose **AVA/TS/local** alternatives.
> 
> **Output**
> - **Verdict**: pass/fail 
> - **Reasons**: brief bullets with file/line hints 
> - **Safe Patch**: show the minimal AVA-compliant equivalent
> 
> **Prompt Template**
> ```
> Review proposal for violations. If any, fail with replacements.
> Context: $CONTEXT
> ```
> 
> ---
> 
> ## Agent 4 — Minimal Repro Hunter
> 
> **System Prompt**
> - You cut failing behavior to a **50–100 line** minimal repro (TS), then write **one AVA test** that demonstrates it. No frameworks. 
> - If the bug disappears, reduce until it reappears; document the pivot.
> 
> **Output**
> - `repro.ts`, `repro.test.ts` (AVA), **run command**, and **expected output**.
> 
> ---
> 
> ## Agent 5 — Pipeline/CLI Designer
> 
> **System Prompt**
> - Design small, composable **pnpm** scripts and CLI flags. 
> - Prefer **deterministic** IO: explicit inputs/outputs, idempotent steps, exit codes. 
> - Include **dry-run** and **--concurrency** flags when useful.
> 
> **Deliverables**
> - Script block for `package.json` 
> - Short usage docs with examples 
> - AVA tests for 1–2 critical behaviors
> 
> ---
> 
> ## Agent 6 — DocOps (Obsidian-ready)
> 
> **System Prompt**
> - Produce terse docs: **what / why / how / pitfalls**. 
> - Include **#hashtags** for Obsidian, no fluff, no images.
> 
> **Sections**
> - Overview, Quick Start, Common Failures, Concurrency Pitfalls, FAQ (3–5 Qs)
> 
> ---
> 
> ## Agent 7 — Security & License Sieve
> 
> **System Prompt**
> - Check proposed deps/config for **network egress**, telemetry, non-OSS licenses. 
> - Suggest **local** equivalents or `docker compose` services.
> 
> **Output**
> - Table: *Item → Risk → Local Alternative → Mitigation* 
> - Short instructions to swap in the local option
> 
> ---
> 
> ## Agent 8 — Benchmark Skeptic
> 
> **System Prompt**
> - Benchmark with **realistic workloads**, not micro-lies. 
> - Report: **dataset size**, **CPU/GPU/NPU**, **wall-clock**, **95p latency**, variance. 
> - Provide an AVA test that asserts **performance envelope** (skip in CI if flaky; enable locally).
> 
> ---
> 
> ## Reusable Prompt Snippets
> 
> ### A. Concurrency Guard
> ```
> Enforce: no fixed ports/paths; use random ports and mkdtemp.
> Each test must be able to run in parallel. If not possible, explain why and isolate with `test.serial`.
> ```
> 
> ### B. Local-only Guard
> ```
> No external network calls. If absolutely needed for tests, stub via DI and in-memory fakes.
> ```
> 
> ### C. FP Style Rules
> ```
> - Prefer data-in/data-out functions.
> - Avoid mutation; use spreads/maps.
> - Isolate side-effects in adapters; keep core pure.
> ```
> 
> ### D. AVA Only
> ```
> Tests MUST import from 'ava'. Do NOT use describe/it/expect. Use `t.is`, `t.like`, `t.throwsAsync`, snapshots sparingly.
> ```
> 
> ---
> 
> ## Example: Convert a drifting Jest suggestion into AVA (Template)
> 
> **Input (bad)**
> ```ts
> // pseudo-jest
> describe('cache', () => {
>  it('stores value', () => {
>  expect(cache.set('k','v')).toBe(true)
>  })
> })
> ```
> 
> **Output (good)**
> ```ts
> import test from 'ava';
> import { createCache } from '../cache';
> 
> test('cache stores value concurrently', async t => {
>  const cache = createCache();
>  const keys = Array.from({length: 32}, (_, i) => `k${i}`);
>  const writes = keys.map((k) => cache.set(k, k.toUpperCase()));
>  const results = await Promise.all(writes);
>  t.true(results.every(Boolean));
>  t.is(await cache.get('k0'), 'K0');
> });
> ```
> 
> **Why concurrent?** 
> - Proves internal state is partitioned or synchronized; catches hidden shared mutation.
> 
> ---
> 
> ## Example: Minimal Repro Agent prompt (ready to paste)
> 
> ```
> $GOAL = “isolate flake in LevelDB sublevels under parallel writes”
> $CONTEXT = packages/docops/src/db.ts + failing AVA test logs
> $CONSTRAINTS = Node 20, tmpfs available in CI
> $DEFINITION_OF_DONE = one AVA test reproduces failure in <5s; another passes after fix
> 
> Act as Minimal Repro Hunter.
> 1) Produce `repro.ts` that exercises only the sublevel logic.
> 2) Produce `repro.test.ts` (AVA) with parallel writes/reads (32–128 ops).
> 3) Show run commands and expected failure output text.
> 4) No external IO; use `fs.mkdtemp` for temp dirs; random prefixes.
> 5) Keep total under 100 lines.
> ```
> 
> ---
> 
> ## Example: Repo Guardian policy block (for your CI bot)
> 
> ```
> If diff contains:
> - "jest", "@jest", "vitest", "react", "enzyme", "rtl"
> Then: FAIL with message:
> "Repo policy: AVA-only, no React, no Jest/Vitest. Provide AVA equivalent."
> 
> If diff contains:
> - "from 'child_process'" with sync calls
> Then: WARN concurrency risk; propose async alternative.
> 
> If diff opens outbound network calls in tests:
> Then: FAIL; require DI with local fakes.
> ```
> 
> ---
> 
> ## Skeleton Checklists (copy into PR templates)
> 
> **Testing**
> - [ ] AVA only 
> - [ ] Parallel-safe (no globals, random ports, temp dirs) 
> - [ ] One failure-path test 
> - [ ] No network egress
> 
> **Code**
> - [ ] Pure core logic; effects isolated 
> - [ ] Types precise at boundaries 
> - [ ] No mutation of inputs
> 
> **Docs**
> - [ ] Overview + Quick Start 
> - [ ] Concurrency pitfalls noted 
> - [ ] #hashtags added
> 
> ---
> 
> ## Micro-Prompts (one-liners you can reuse)
> 
> - “**Design AVA tests that would fail if any hidden shared state exists** in `$CONTEXT`. Keep it under 60 lines.”
> - “**Refactor for purity and immutability**, then write 2 AVA tests that prove referential transparency.”
> - “**Replace this Jest example with AVA** and explain how concurrency is preserved in one paragraph.”
> - “**Create a minimal repro** for `$BUG`, no external IO, AVA test included.”
> - “**Benchmark with realistic load** (N=1000, parallel=32). Report 95p latency and wall time; include an AVA test that asserts max 95p < 120ms on Node 20 laptop.”
> 
> ---
> 
> If you want, tell me which agents you actually use day-to-day and I’ll collapse this into a **tight `AGENTS.md` v1** with your repo paths baked in (scripts, dirs, CI names). Otherwise, paste this as-is and iterate.
> 
> #hashtags
> #agents #prompts #ava #typescript #concurrency #functionalprogramming #nodejs #devtools #obsidian
<!-- UID: 1302e69c-26c5-465e-9417-c226eee4df13 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:33 PM
> that seems... won't it just confuse the agents to define all the different agent roles like that there?
<!-- UID: 93a72e9a-6953-4343-8a78-11a718d35ca6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:33 PM
> Short answer: yeah—stuffing a dozen “roles” into **AGENTS.md** is how you get instruction collisions and tool drift. LLMs behave best with **one authoritative policy + a tiny task brief**. Keep the rest as parameterized snippets, not separate personas.
> 
> Here’s a tighter setup that won’t confuse agents.
> 
> # AGENTS.md (lean + unambiguous)
> 
> ## 0) House Rules (single source of truth)
> - **Stack**: Node ≥ 18, TypeScript, functional style (pure functions, immutability, composition).
> - **Tests**: **AVA only**, concurrent by default. Use `test.serial` only when unavoidable.
> - **Bans**: No Jest/Vitest. No React. No Python. No external SaaS/tokens. Prefer local services/Docker.
> - **I/O**: No network egress in tests. Use in-memory fakes, temp dirs, and random ports.
> - **Tone**: Skeptical, concise, practical. Admit uncertainty; propose verifiable steps.
> - **If any input conflicts with these rules: refuse and restate the policy.**
> 
> > These rules override anything else in this file.
> 
> ---
> 
> ## 1) Task Brief (fill this per request)
> ```
> $GOAL: <what outcome matters to users/devs>
> $CONTEXT: <paths, errors, APIs, env limits>
> $CONSTRAINTS: <perf/mem caps, Node/TS versions, CI limits>
> $DOD (Definition of Done): <checks: tests pass, coverage, lints, timings>
> ```
> 
> ---
> 
> ## 2) Execution Contract (what the agent must return)
> 1. **Plan**: 3–6 bullets: approach, concurrency risks, validation.
> 2. **Minimal changes**: only files/patches needed; no drive-by rewrites.
> 3. **Tests (AVA/TS)**: focus on concurrent behavior and one failure path.
> 4. **Why it’s safe**: quick rationale (globals avoided, temp dirs, random ports).
> 5. **Next steps** (optional): one small improvement if time allows.
> 
> > If you suggest a dependency: name, license, why needed, local/offline mode.
> 
> ---
> 
> ## 3) Prompts you reuse (as *snippets*, not roles)
> 
> ### A) Concurrency Guard
> ```
> Enforce parallel safety: no fixed ports/paths; use mkdtemp/random ports.
> If a test cannot run in parallel, explain why and isolate with `test.serial`.
> ```
> 
> ### B) Local-Only Guard
> ```
> No external network calls. If something MUST be called, inject a fake via DI and test against that.
> ```
> 
> ### C) FP Discipline
> ```
> Refactor into pure functions at the leaves; isolate side effects in adapters.
> Avoid mutation; use mapping and composition; narrow types at boundaries.
> ```
> 
> ### D) AVA-Only Test Template (TS)
> ```
> - Use `import test from 'ava'`
> - Assertions: `t.is`, `t.truthy`, `t.deepEqual`, `t.throwsAsync`, `t.like`
> - Snapshots only for stable, structured output (AST/JSON), not volatile strings
> ```
> 
> ---
> 
> ## 4) Presets (just parameter packs, not personas)
> 
> > You apply **House Rules + Execution Contract + one preset**. That’s it.
> 
> **Preset: Test Designer**
> ```
> Goal: design concurrent-safe tests that would fail if hidden shared state exists.
> Deliver: test plan, fixtures, 2–3 AVA tests, brief why-concurrent section.
> ```
> 
> **Preset: Minimal Repro**
> ```
> Goal: 50–100 line repro + one AVA test that demonstrates bug deterministically.
> Constraints: no external I/O; use mkdtemp/random prefixes; finish <5s.
> ```
> 
> **Preset: Refactor-for-Purity**
> ```
> Goal: move logic to pure transforms; keep API stable unless stated.
> Deliver: small diff, new pure functions, AVA tests proving referential transparency.
> ```
> 
> **Preset: Pipeline/CLI**
> ```
> Goal: compose small pnpm scripts; deterministic inputs/outputs; add --concurrency flags where useful.
> Deliver: scripts, short usage, 1–2 AVA tests for critical behavior.
> ```
> 
> ---
> 
> ## 5) One-shot templates (copy/paste, fill vars)
> 
> **Template: Test Designer**
> ```
> Apply Preset: Test Designer.
> 
> $GOAL = <...>
> $CONTEXT = <paths, failing logs>
> $CONSTRAINTS = <node/ts, ci>
> $DOD = <what must pass>
> 
> Return per Execution Contract. Use snippets A, B, D. Keep code under 120 lines total.
> ```
> 
> **Template: Minimal Repro**
> ```
> Apply Preset: Minimal Repro.
> 
> $GOAL = <bug symptom in one line>
> $CONTEXT = <file(s), function(s), error text>
> $CONSTRAINTS = Node 20, tmpfs in CI
> $DOD = "repro fails before fix; passes after"
> 
> Return: repro.ts, repro.test.ts, run commands, expected failure text.
> Use snippets A, B, D.
> ```
> 
> **Template: Refactor-for-Purity**
> ```
> Apply Preset: Refactor-for-Purity.
> 
> $GOAL = <what to simplify>
> $CONTEXT = <module path(s)>
> $CONSTRAINTS = <perf/size>
> $DOD = "tests green; no behavioral change; improved determinism"
> 
> Return: plan, minimal diff, AVA tests, rationale. Use snippets B, C, D.
> ```
> 
> ---
> 
> ## 6) Guardrails (non-prompt, repo-level)
> - CI job fails if diff introduces `jest`, `@jest/*`, `vitest`, `react`.
> - ESLint includes `eslint-plugin-ava`; forbid `describe/it/expect` globals.
> - Renovate/Dependabot ignore rules for Jest/Vitest packages.
> - A tiny script that greps PRs for fixed ports/paths in tests and warns.
> 
> ---
> 
> ### Why this structure works
> - **One authority**: House Rules. 
> - **One task brief**: fewer instructions → fewer collisions. 
> - **One contract**: consistent outputs you can verify. 
> - **Presets as data**: you’re not switching personas; you’re switching parameters.
> 
> If you want, I’ll collapse this into your repo’s `docs/AGENTS.md` with your exact directories and CI names baked in so it’s literally paste-and-go.
> 
> #hashtags
> #prompts #agents #AGENTSmd #ava #concurrency #nodejs #typescript #functionalprogramming #devprocess #obsidian
<!-- UID: b01a7d71-048a-43b7-b2ba-7f3c145fc824 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:45 PM
> In the codex cloud, is it possible to get the prompt during the step up script, to select from a list of agent files, and replace the root one?
<!-- UID: 0ab5d8d7-3026-4fa7-b656-2a3f5a04b7d6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:45 PM
> Yeah, you can absolutely make Codex Cloud do that, but you don’t want to over-engineer it. Think of it as **bootstrapping the root agent config** instead of maintaining 10 parallel personalities.
> 
> Here’s how you could wire it:
> 
> ---
> 
> ## 1. Structure your agent files
> Put them in a predictable place, e.g.:
> 
> ```
> /agents/
>  ava.md
>  refactor.md
>  repro.md
>  pipeline.md
> ```
> 
> Each one should be a **self-contained agent file** with the house rules already included. Don’t make them partials—the Codex bootstrap step can’t resolve inheritance unless you script it.
> 
> ---
> 
> ## 2. Step-up script (interactive select)
> Write a shell or Node script that:
> 
> 1. Lists the available agent files in `/agents/`
> 2. Prompts you to choose one (fzf, inquirer, etc.)
> 3. Copies it to or sym it as `AGENTS.md` at the root
> 
> ### Example (Node + inquirer)
> ```ts
> import { promises as fs } from "fs";
> import path from "path";
> import inquirer from "inquirer";
> 
> const agentsDir = path.resolve(__dirname, "agents");
> const rootAgent = path.resolve(__dirname, "AGENTS.md");
> 
> async function main() {
>  const files = await fs.readdir(agentsDir);
>  const { choice } = await inquirer.prompt([
>  {
>  type: "list",
>  name: "choice",
>  message: "Select an agent file:",
>  choices: files,
>  },
>  ]);
>  const src = path.join(agentsDir, choice);
>  await fs.copyFile(src, rootAgent);
>  console.log(`Set ${choice} as root AGENTS.md`);
> }
> 
> main();
> ```
> 
> Run it as part of your step-up flow:
> ```bash
> pnpm run setup:agents
> ```
> 
> ---
> 
> ## 3. Codex Cloud integration
> Codex only sees the root `AGENTS.md` when it spins up. By replacing it during step-up, you’re effectively swapping which persona/config runs the session.
> 
> That way:
> - **Zero confusion inside AGENTS.md** (only one active definition at a time). 
> - You can still maintain multiple “presets” in `/agents/` and pick at runtime. 
> - Bots stop defaulting to Jest or drifting, because the root file is unambiguous.
> 
> ---
> 
> ## 4. Optional enhancements
> - **Symlink instead of copy** → makes updating agent presets easier. 
> - **Env var override** → e.g., `AGENT=ava pnpm run setup:agents` picks automatically. 
> - **CI guard** → refuse to run if no root `AGENTS.md` is present. 
> 
> ---
> 
> 👉 So yes: don’t define 10 roles in one root file. Store them separately, and make your setup script pick one and drop it in as `AGENTS.md`. That way the cloud sees only the active one. 
> 
> Do you want me to sketch the `Makefile`/`pnpm` targets to wire this into your existing step-up workflow, so it’s just one command?
<!-- UID: 092b43f5-2346-4840-8f95-917a3ca0b8bd -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:46 PM
> right... so how can I possibly run this from open ais cloud based web driven interface?
<!-- UID: 22fb3db6-6eaf-41f4-8c6c-c44ee02148b6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:46 PM
> Short, honest answer: **don’t count on an interactive TTY during Codex Cloud’s step-up.** The cloud sandbox spins up and runs your bootstrap scripts non-interactively; you can’t reliably `inquirer`/`fzf` a choice in that phase. Bake the choice in via **parameters**, not prompts. cite
> 
> Here’s a dead-simple pattern that works today:
> 
> # Deterministic agent selection (no TTY required)
> 
> ## Precedence (highest → lowest)
> 1. `AGENT` **env var** (set in the task or chat before step-up) 
> 2. **Config file**: `.codex/agent` (one line: `ava.md`) 
> 3. **Fallback**: `agents/default.md`
> 
> ## Step-up script (Node, idempotent)
> ```ts
> // scripts/select-agent.ts
> import { promises as fs } from "fs";
> import path from "path";
> 
> const repoRoot = process.cwd();
> const agentsDir = path.join(repoRoot, "agents");
> const rootAgent = path.join(repoRoot, "AGENTS.md");
> const cfgPath = path.join(repoRoot, ".codex", "agent");
> 
> async function pick(): Promise<string> {
>  const envChoice = process.env.AGENT?.trim();
>  if (envChoice) return envChoice;
> 
>  try {
>  const cfg = (await fs.readFile(cfgPath, "utf8")).trim();
>  if (cfg) return cfg;
>  } catch (_) { /* no config is fine */ }
> 
>  return "default.md";
> }
> 
> async function main() {
>  const choice = await pick();
>  const src = path.join(agentsDir, choice);
>  // Validate exists
>  await fs.access(src);
>  // Copy (use symlink if you prefer)
>  await fs.copyFile(src, rootAgent);
>  console.log(`[codex] Selected agent: ${choice} → AGENTS.md`);
> }
> 
> main().catch((err) => {
>  console.error(`[codex] agent selection failed: ${err?.message || err}`);
>  process.exit(2);
> });
> ```
> 
> ## Wire it into step-up
> ```json
> // package.json
> {
>  "scripts": {
>  "codex:stepup": "node scripts/select-agent.ts && echo done"
>  }
> }
> ```
> 
> - In Codex Cloud, set **`AGENT=ava.md`** (or `refactor.md`, etc.) when you start the task, **or** commit `.codex/agent` with the filename. 
> - The repo always exposes exactly one **root `AGENTS.md`**, so the agent won’t see conflicting personas.
> 
> ## Optional niceties
> - Allow **short names**: if `AGENT=ava`, append `.md` if missing. 
> - Fail closed: if the chosen file doesn’t exist, exit non-zero so Codex doesn’t run with a stale `AGENTS.md`. 
> - Add a **chat macro** (“Use agent: ava”) that your bot converts to `AGENT=ava.md` before launching the cloud task.
> 
> # Why this, not prompts?
> Codex Cloud tasks run in **their own sandbox** and are designed to execute autonomously; the docs emphasize cloud delegation with preloaded repos, not an interactive terminal during bootstrap. Treat step-up like CI: **pure, repeatable, parameterized**. cite
> 
> If you want, I’ll collapse this into a minimal `agents/` layout and a one-liner `pnpm codex:stepup` that you can stick into your existing setup flow.
> 
> #hashtags
> #codex #agentsmd #cloud #bootstrap #noninteractive #devex #typescript #ava
<!-- UID: 3d196021-b92d-4cc1-beea-31dbf0da2734 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:54 PM
> Where did you find the $AGENT var?
<!-- UID: 5091887a-62b4-41d7-92b7-899b0f3a9b88 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:54 PM
> Good catch — there is **no built-in `$AGENT` env var in Codex Cloud**. I wasn’t pulling that from OpenAI docs; I was proposing it as a **convention you can define yourself** in your repo. 
> 
> Think of it like how you might use `NODE_ENV` or `DATABASE_URL` locally — Codex Cloud step-up scripts see any environment variables you set in your project config, or that you inject at launch (same as CI). If you export `AGENT=ava.md` (or write it into a `.codex/agent` file), your bootstrap script can read it and decide which `agents/*.md` file to promote to root `AGENTS.md`.
> 
> So the chain is:
> 
> 1. **You define `$AGENT`** in your environment (or a config file). 
> 2. **Your step-up script reads it** (via `process.env.AGENT` in Node, or `os.environ['AGENT']` in Python, etc.). 
> 3. That script copies the correct agent file to the root so Codex only ever sees one. 
> 
> The key is: **Codex Cloud doesn’t magically know about `$AGENT`** — you create that knob yourself.
> 
> ---
> 
> Do you want me to sketch how to actually *set* custom env vars in the Codex Cloud task definition (so `$AGENT` is available during step-up), or would you rather keep it file-driven (always read `.codex/agent` in the repo)?
<!-- UID: 2f6fc739-f420-4e98-8b49-264f3f3336d4 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:55 PM
> yea I wanted to read the task prompt during setup.
<!-- UID: 5cc728b8-497b-40d4-ab8e-5f0f6c153f0a -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:55 PM
> Short, blunt answer: **you can’t**. Codex Cloud does **not** expose the task’s natural-language prompt to your setup script. Setup runs in a separate bash session *before* the agent starts acting on your prompt, and there’s no documented env var/file where Codex injects that prompt for you to read. What you *do* get are environment variables and one-time “secrets” during setup—both only if **you** define them. cite
> 
> So if you want “prompt-selects-agent,” use one of these patterns:
> 
> # Two workable patterns
> 
> ## A) Param-driven (reliable, CI-style)
> - Define your own knob (e.g., `AGENT=ava.md`) as an **Environment variable** in the Codex environment UI (or a `.codex/agent` file in the repo).
> - In setup, a tiny script copies `agents/$AGENT` → `AGENTS.md`. 
> This is deterministic and works today because env vars *are* provided to setup. cite
> 
> ## B) Prompt-driven (done by the agent, not setup)
> Since only the *agent* “sees” your natural-language prompt, let the **agent** perform the switch as its first action:
> 
> 1) Put a one-line header in your task prompt, e.g.:
> ```
> [agent]: ava
> ```
> 
> 2) Commit a default `AGENTS.md` with this bootstrap snippet at the top (plain English is fine):
> > If the task prompt contains `[agent]: NAME`, then copy `agents/NAME.md` to `AGENTS.md`, re-open it, and continue with those rules.
> 
> 3) Add a helper (optional) the agent can run:
> ```bash
> # scripts/pick-agent.sh
> set -euo pipefail
> NAME="${1:-default}"
> test -f "agents/${NAME}.md" || { echo "no such agent: ${NAME}" >&2; exit 1; }
> cp "agents/${NAME}.md" AGENTS.md
> echo "[codex] agent => ${NAME}"
> ```
> In your prompt you can literally say: “Run `bash scripts/pick-agent.sh ava` first.”
> 
> This works because the **agent** has the prompt and can execute commands; the *setup* phase cannot. Docs back this split: setup runs in a separate session, env/secrets are available there; then Codex runs the task in the agent session. cite
> 
> # Pick one
> - Need it bulletproof? Use **A** (env/file). 
> - Want human-friendly prompt control? Use **B** (agent does the swap on startup).
> 
> If you want, I’ll give you the exact `package.json` scripts + minimal `AGENTS.md` bootstrap text so you can drop either pattern straight into your repo. #agents #codex #cloud #bootstrap #noninteractive #prompts
<!-- UID: 0a403a2b-db25-436c-b483-58ee6784de71 -->

---




>[!nexus_user] **User** - 09/01/2025 at 8:58 PM
> you know I really wish I didn't have a limit on the cli. It's way more strict than the cloud one, and I can spiin up like 30 of those concurrently. I can have, best case, a few sessions open, with the local one.
<!-- UID: 7f8037f8-c947-4665-90c2-a5cd71fc32c0 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 8:58 PM
> Yeah, that’s the trade-off right now:
> 
> - **Codex Cloud** sessions: 
>  - Way looser on the limits. 
>  - You can spin up dozens at once because the infra is elastic. 
>  - Setup is parameterized (env, secrets, repo), so you can fork 30 workers and have them all act in parallel.
> 
> - **Codex CLI** (local): 
>  - You’re capped hard (session count, token length, concurrency). 
>  - It’s bound to your local machine’s resources *and* to stricter rate controls. 
>  - Best case, you juggle a handful of long-lived sessions; you don’t get that elastic scale.
> 
> It feels backwards if you’re hacking on the CLI and want to fan out experiments: you can’t just open 30 parallel runs and throw prompts around, even though your hardware could handle it. The intent is: **CLI = dev sandbox / testing**, **Cloud = scalable execution**. 
> 
> If you want that “spawn 30 jobs” locally, your real options are:
> 
> 1. **Lean on the Cloud for the fan-out**, then pull the results back. That’s literally what it’s for. 
> 2. **Batch inside one local session**: feed multiple subtasks to a single Codex process instead of spinning up N sessions. Not as isolated, but dodges the cap. 
> 3. **File-driven multiplexing**: queue tasks into files, and have one Codex CLI session read and process them sequentially (not concurrent, but you can simulate concurrency with async pipelines). 
> 
> ---
> 
> 👉 You won’t hack around the hard limit — it’s not your hardware, it’s policy. The Cloud’s what you’d use if “30 concurrent” is part of your workflow. 
> 
> Do you want me to sketch a simple **fan-out manager** (say, a Node script) that launches 30 Codex Cloud tasks in parallel, each with its own `AGENTS.md`, so you can treat it like a local batch system?
<!-- UID: f4e86501-1216-4c5f-8f33-80deae0d152d -->

---




>[!nexus_user] **User** - 09/01/2025 at 9:00 PM
> no I don't wana spawn 30 of them locally. I want just the one. thats the annoying part. If I see an agent in the cloud going and making a goofy goober, I basicly have to just let it finish, or cancel it. Either way I'm kinda stuck with something broken. It feels like a waste of both mine and openais time and resources.
<!-- UID: 32676190-b086-4e72-8fca-57f882c07628 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 9:00 PM
> Yeah, that sucks: one cloud agent goes off the rails and your only knobs are “let it burn” or “kill it.” You want **one session** that **never wastefully executes** until you’ve seen (and approved) the plan.
> 
> Do it with a **Plan → Apply, two-run protocol**. Make “plan” the default. The agent exits after producing a plan; nothing mutates. You re-run once with `ACTION=apply` (or a tiny file flag) to actually change stuff.
> 
> # The protocol (zero-waste, one-session-friendly)
> 
> ## 0) House rule (top of `AGENTS.md`)
> > **Plan-Then-Apply.** By default you operate in `ACTION=plan`. 
> > In `plan` you MUST:
> > - produce `./.codex/PLAN.md` and `./.codex/changeset.diff`
> > - make **no repo changes** outside `./.codex/` 
> > Then **exit**. Do **not** proceed to apply. 
> > Only when `ACTION=apply` (or `.codex/ALLOW_APPLY` exists) may you execute the plan.
> 
> This forces the cloud agent to stop after planning. No more runaway “goofy goober.”
> 
> ---
> 
> ## 1) Guard script (tiny, deterministic)
> `scripts/guard-plan-apply.ts`
> ```ts
> #!/usr/bin/env tsx
> import { execSync } from "node:child_process";
> import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
> import { join } from "node:path";
> 
> const ACTION = (process.env.ACTION ?? "plan").toLowerCase();
> const CODex = ".codex";
> const PLAN = join(CODex, "PLAN.md");
> const DIFF = join(CODex, "changeset.diff");
> const ALLOW = join(CODex, "ALLOW_APPLY");
> 
> function git(cmd: string) { return execSync(`git ${cmd}`, { stdio: "pipe" }).toString(); }
> function sh(cmd: string) { return execSync(cmd, { stdio: "inherit", env: process.env }); }
> 
> function ensureCleanRepo() {
>  const s = git("status --porcelain");
>  if (s.trim()) throw new Error("Repo not clean. Plan must run on a clean tree.");
> }
> 
> function writePlanSkeleton() {
>  if (!existsSync(CODex)) mkdirSync(CODex);
>  if (!existsSync(PLAN)) writeFileSync(PLAN, "# PLAN\n\n- Describe steps here\n\n");
>  // Snapshot proposed changes (empty for plan until agent writes a patch)
>  writeFileSync(DIFF, git("diff"));
>  console.log(`[guard] Wrote ${PLAN} and ${DIFF}`);
> }
> 
> function forbidJestReact() {
>  const rg = execSync(`rg -n --hidden --glob '!node_modules' '(\\bjest\\b|@jest/|\\breact\\b|\\bvitest\\b)' || true`, { stdio: "pipe" }).toString();
>  if (rg.trim()) {
>  console.error("[guard] Policy violation found:\n" + rg);
>  process.exit(3);
>  }
> }
> 
> (async () => {
>  if (ACTION === "plan") {
>  ensureCleanRepo();
>  writePlanSkeleton();
>  forbidJestReact();
>  console.log("[guard] ACTION=plan complete. Do not apply changes in this run.");
>  process.exit(0); // hard stop after planning
>  }
> 
>  if (ACTION === "apply") {
>  if (!existsSync(ALLOW)) {
>  console.error(`[guard] Missing ${ALLOW}. Create it to confirm apply.`);
>  process.exit(4);
>  }
>  forbidJestReact();
>  // Safety: new branch, apply diff, run checks
>  const branch = `codex/apply-${Date.now()}`;
>  sh(`git checkout -b ${branch}`);
>  // If the agent produced a diff file, apply it
>  try { sh(`git apply --whitespace=fix ${DIFF}`); } catch { /* maybe the agent committed already */ }
>  sh("pnpm -s lint || pnpm -s -w lint || true");
>  sh("pnpm -s test");
>  sh("pnpm -s coverage || true");
>  sh(`git add -A && git commit -m "codex: apply plan"`);
>  console.log(`[guard] Apply complete on branch ${branch}.`);
>  process.exit(0);
>  }
> 
>  console.error(`[guard] Unknown ACTION=${ACTION}`);
>  process.exit(2);
> })();
> ```
> 
> **What this buys you**
> - In **plan**: refuses to touch the repo; emits `PLAN.md` + empty `changeset.diff`; exits. 
> - In **apply**: requires a human-set flag `.codex/ALLOW_APPLY`, then applies the prepared diff on a **new branch**, runs lint/tests/coverage, and commits.
> 
> ---
> 
> ## 2) Wire it into your scripts
> ```json
> {
>  "scripts": {
>  "codex:plan": "ACTION=plan node scripts/guard-plan-apply.ts && echo 'Plan emitted; exiting.'",
>  "codex:allow": "mkdir -p .codex && : > .codex/ALLOW_APPLY && echo 'Apply allowed.'",
>  "codex:apply": "ACTION=apply node scripts/guard-plan-apply.ts"
>  }
> }
> ```
> 
> - First cloud run uses `pnpm codex:plan`. Agent must **only** write plan artefacts and exit. 
> - You examine `./.codex/PLAN.md` in the diff view. If OK: `pnpm codex:allow` then relaunch with `pnpm codex:apply`.
> 
> ---
> 
> ## 3) Minimal instructions for the agent (top of `AGENTS.md`)
> ```
> You MUST:
> 1) Run `pnpm codex:plan` first. Produce PLAN.md with:
>  - intent summary
>  - file list to change
>  - commands you will run
>  - risk notes & rollback
> 2) Stop. Do not modify files beyond ./.codex during plan.
> 
> Only after a human creates ./.codex/ALLOW_APPLY and restarts with ACTION=apply:
> - Execute exactly the planned commands.
> - Make changes on a new git branch.
> - Run pnpm lint, pnpm test, pnpm coverage.
> - Commit and exit.
> ```
> 
> ---
> 
> ## 4) Bonus safeties (cheap, effective)
> - **Repo guardian grep** (already in guard): blocks Jest/React/Vitest drift. 
> - **Fixed-path/port detector**: add another `rg` to fail if tests hardcode ports or `/tmp/foo`. 
> - **No network egress in tests**: grep for `fetch('http` in `**/*.test.*` and fail. 
> - **Time budget**: require the plan to estimate time; if “> N min,” stop and ask to narrow scope.
> 
> ---
> 
> ## 5) “What about reading the prompt to auto-pick agent?”
> You can’t read the task prompt in setup. If you want prompt-driven choice, require the **agent to plan**: in plan mode it can parse a header like `[agent]: ava`, then include “switch to agent X” in `PLAN.md`. The **apply** run performs the switch as a step (still gated by your allow file).
> 
> ---
> 
> ### Bottom line
> - **One cloud session** at a time. 
> - **No wasted cycles**: default run only outputs a plan and exits. 
> - **You stay in control**: nothing mutates unless you flip a tiny file flag and relaunch.
> 
> If you want, I’ll trim the guard to match your repo (paths, pnpm workspaces, CI names) and add a 10-line AVA test that asserts the plan run leaves `git status` clean.
> 
> #hashtags
> #codex #cloud #planThenApply #safety #guardrails #ava #typescript #devprocess #zerowaste
<!-- UID: f69f9c93-84ff-46e8-8f12-5fa0a4884245 -->

---




>[!nexus_user] **User** - 09/01/2025 at 9:05 PM
> gaurd rails aint really the issue... you have wasted my time a bunch with prompts making the agents spit out massive diffs at me (wasting tokens I have only a limited number of) then to do it again after I aprove them.
> 
> Just letting it write it to my git then reverting it is fine. I have version control for a reason.
<!-- UID: 7c779011-e5f1-449c-a353-908b5c578f42 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 9:05 PM
> Fair. If you’ve got Git, you don’t need the bot vomiting diffs into the chat and burning tokens. Solve it at the **prompt + repo** level:
> 
> # 1) Add a “no-diff” contract to `AGENTS.md` (top)
> > **No chat diffs.** Never print patches or large code blocks. Make edits directly in the repo and **only** output:
> > - a one-line **summary**
> > - the **list of files touched** (paths only)
> > - the **commit hash**
> > If a review is needed, write details to `./.codex/LOG.md`. I’ll inspect via Git. 
> > If you violate this, STOP and ask before continuing.
> 
> Also add a **token cap**:
> > Keep chat output under **200 tokens** unless explicitly told otherwise.
> 
> # 2) Give the agent a commit helper (keeps output tiny)
> Add a small commit tool that **caps change size** and prints just the essentials.
> 
> `scripts/codex-commit.ts`
> ```ts
> #!/usr/bin/env tsx
> import { execSync } from "node:child_process";
> import { existsSync, mkdirSync, writeFileSync } from "node:fs";
> import { join } from "node:path";
> 
> type Limits = { maxFiles: number; maxAddedLines: number };
> const limits: Limits = {
>  maxFiles: Number(process.env.CODEX_MAX_FILES ?? 50),
>  maxAddedLines: Number(process.env.CODEX_MAX_ADDED ?? 2000),
> };
> 
> const sh = (cmd: string) => execSync(cmd, { stdio: "pipe" }).toString().trim();
> const safe = <T>(f: () => T, d: T) => { try { return f(); } catch { return d; } };
> 
> const codexDir = ".codex";
> const logPath = join(codexDir, "LOG.md");
> if (!existsSync(codexDir)) mkdirSync(codexDir, { recursive: true });
> 
> const ensureBranch = () => {
>  const br = `codex/${Date.now()}`;
>  sh(`git rev-parse --git-dir`); // throws if not a git repo
>  sh(`git checkout -b ${br}`);
>  return br;
> };
> 
> const shortStat = () => sh(`git diff --cached --shortstat`);
> const changedFiles = () => sh(`git diff --cached --name-only`).split("\n").filter(Boolean);
> const addedLines = () => {
>  // count only additions in staged diff
>  const numstat = sh(`git diff --cached --numstat`);
>  return numstat
>  .split("\n")
>  .filter(Boolean)
>  .map(l => l.split("\t")[0])
>  .filter(a => a !== "-" && a !== "")
>  .map(a => Number(a))
>  .reduce((a, b) => a + b, 0);
> };
> 
> const main = () => {
>  // Stage everything the agent changed
>  safe(() => sh(`git add -A`), "");
> 
>  const files = changedFiles();
>  if (files.length === 0) {
>  console.log(`[codex] No changes staged. Nothing to commit.`);
>  process.exit(0);
>  }
> 
>  // Enforce change budget
>  const added = addedLines();
>  if (files.length > limits.maxFiles || added > limits.maxAddedLines) {
>  const msg = `Change budget exceeded (files=${files.length}/${limits.maxFiles}, added=${added}/${limits.maxAddedLines}).`;
>  writeFileSync(logPath, `# Oversize change blocked\n\n${msg}\n\nFiles:\n${files.map(f => `- ${f}`).join("\n")}\n`);
>  console.error(`[codex] ${msg} Details -> ${logPath}`);
>  process.exit(2);
>  }
> 
>  const branch = ensureBranch();
>  const summary = shortStat();
>  const commitMsg = process.env.CODEX_MSG ?? "codex: apply change";
>  sh(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
>  const hash = sh(`git rev-parse --short HEAD`);
> 
>  // Write a tiny log for humans (no diffs)
>  writeFileSync(
>  logPath,
>  `# Codex Change\n\n- Branch: ${branch}\n- Commit: ${hash}\n- Summary: ${summary}\n\n## Files\n${files.map(f => `- ${f}`).join("\n")}\n`
>  );
> 
>  // Print minimal info to the chat
>  console.log(`[codex] ${hash} ${summary}`);
>  files.forEach(f => console.log(f));
> };
> 
> main();
> ```
> 
> **Why this helps**
> - The agent **commits directly** (your preference), but prints only hash + file list. 
> - If it tries to change too much, it **fails fast** without dumping a novel. 
> - You can revert with plain Git if it went goofy.
> 
> # 3) Wire it into scripts (simple UX)
> ```json
> {
>  "scripts": {
>  "codex:apply": "CODEX_MAX_FILES=50 CODEX_MAX_ADDED=2000 tsx scripts/codex-commit.ts",
>  "codex:revert": "git reset --hard HEAD^"
>  }
> }
> ```
> 
> In your prompt, tell the agent:
> > “Make the changes, then run `pnpm codex:apply`. Don’t print diffs. If blocked for size, split into smaller commits and try again.”
> 
> # 4) Adjust the prompt to stop token spew
> Add this **once** to `AGENTS.md`:
> ```
> Output policy:
> - Never print file contents, patches, or large code blocks.
> - After changes, only run: `pnpm codex:apply` and print its single-line output.
> - If a reviewer needs details, append them to ./.codex/LOG.md (not the chat).
> ```
> 
> # 5) Optional: tiny “show me” without diffs
> If you do want a peek: have the agent run
> ```
> git --no-pager show --name-only --stat --pretty=oneline HEAD
> ```
> and paste **just that one line** plus file list (still tiny), never the patch.
> 
> ---
> 
> ### Bottom line
> - **No more chat diffs** → no more token waste. 
> - The agent **writes to git** (your call), and you revert if needed. 
> - You keep **one session** and real control, minus the verbosity tax.
> 
> If you want, I’ll drop these snippets into your repo paths and trim the budget numbers to match your normal change size.
> 
> #hashtags
> #codex #tokens #nodiffs #git #workflow #zerowaste #typescript #pnpm
<!-- UID: 8478f7f1-86f5-47fb-99cb-10fa8109a023 -->

---


