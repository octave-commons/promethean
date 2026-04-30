# Cephalon Duck ↔ OpenSkull Discord Loop (Profiles + RAG + Permissions)

## TL;DR

> **Quick Summary**: Turn `orgs/octave-commons/cephalon-clj/` into the reusable Discord “tool Cain” runtime, and run two bot accounts (Duck + OpenSkull dev profile) that can loop, explore, request permissions via admin panel, and build shared RAG memory (Chroma + recency weighting).
>
> **Deliverables**:
> - Duck + OpenSkull profiles loaded from `CEPHALON_HOME` (no persona hardcoded in code)
> - Two-bot Discord loop with turn-taking + cooldown guardrails (text-only)
> - Admin panel becomes permission panel (seed channels at startup, approvals persisted)
> - Explorer seed session starts automatically on boot
> - Passive Discord history indexing → Chroma + recency-weighted retrieval injected into context
> - Clear Ollama request/response logging (redacted, surfaced in admin panel)
> - Docs + OpenCode skills updated to acknowledge docker services + new Cephalon-as-tool model
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Profiles/registry → Permission gating → Loop behavior → RAG indexing/retrieval → Docs

---

## Context

### Original Request
- “Main duck agent and dev openskull agent talking to each other on discord using their looping mode.”
- Can’t see what they’re sending to Ollama in logs.
- Duck’s old prompt is bad; start over.
- Add RAG: passive Discord history indexing into Chroma; similarity weighted by recency.
- Redis/Mongo/Chroma/Ollama already running via `promethean/docker-compose.yml`.

### Interview Summary
**Key Decisions**:
- Discord topology: **two bot accounts** (Duck bot + OpenSkull bot).
- Permissions: admin WS/TUI is the permission panel; **seed channels only at startup**, then agent requests approval.
- Seed channels: **shared** list for Duck + OpenSkull.
- Profiles: live under operator config (`CEPHALON_HOME`, e.g. `~/.cephalon/profiles/*`).
- RAG memory: **shared** store/index for both personas.
- Test strategy: **YES (TDD)** using existing `bin/cephalon test`.
- Discord modality: **text-only** for this plan.

**Intent Clarification**:
- “Discord is a set of tools” → agents can explore within permission boundaries, store observations, and gradually expand “places” they can write data.

### Research Findings (Key References)

**Cephalon toolchain**
- `orgs/octave-commons/cephalon-clj/cephalon-clj-discord-io/src/cephalon/discord_io/server.cljs` — Discord gateway + WS RPC server; currently ignores bot-authored messages (`when-not author.bot`) which prevents bot-to-bot event triggers.
- `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/agent.clj` — registers only Duck; loads prompt from `../../promethean/experimental/cephalon/defaultPrompt.txt` (hardcoded); emits `:ollama/request` and `:ollama/response` via `runtime/debug-emit` when `DUCK_DEBUG=true`.
- `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/loop.clj` — autonomous loop tick runs `agents/run!` with agent "duck".
- `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj` — admin WS supports sessions + session loops + streaming logs.
- `orgs/octave-commons/cephalon-clj/ecosystem.pm2.edn` — already defines `duck-*` and `skull-*` process slots (IO+brain+UI).
- `bin/cephalon` — sets `CEPHALON_HOME` and already creates `~/.cephalon/{sessions,logs,tools}`; natural home for profiles.

**Infrastructure**
- `promethean/docker-compose.yml` — expected running services: `ollama`, `chromadb`, `mongodb`, `redis`.

### Metis Review (Gaps Addressed)
Metis called out key risks; this plan bakes them in as guardrails and acceptance criteria:
- Looping cannot rely on bot-authored Discord message events (current IO filters them).
- Need explicit cooldowns, iteration budgets, and stop conditions to prevent runaway.
- Need explicit privacy/retention and log redaction.
- Need graceful fallback when Chroma/Ollama unavailable.

---

## Work Objectives

### Core Objective
Make Cephalon the reusable Discord tool runtime (“Cain”), with Duck + OpenSkull running as two profiles that can (1) loop and converse, (2) explore + request permissions, (3) build shared RAG memory, and (4) be observable (Ollama requests visible).

### Concrete Deliverables
- Profile loader + schema under `CEPHALON_HOME` (Duck/OpenSkull prompts + model + tools + limits + seed channels).
- OpenSkull persona exists (distinct from Duck) and is selectable (dev mode).
- Seed channel loop behavior that alternates/avoids spam via explicit guardrails.
- Admin permission workflow: request queue + approve/deny + persistence.
- Explorer seed session auto-created on startup (runs within seed channels).
- RAG: passive indexing + recency-weighted retrieval + context injection.
- Documentation and skill docs updated (Cephalon is the new Duck toolchain; docker services expected).

### Definition of Done
- `bin/cephalon test` passes.
- Running the two instances (duck + skull) results in:
  - visible Ollama request/response logs (redacted) in admin panel;
  - bot action constrained to seed channels until approved;
  - permission requests visible in admin panel and persisted;
  - RAG retrieval evidenced by logs showing retrieved doc IDs + similarity+recency scores.

### Must Have
- Two bot accounts with distinct profiles.
- Admin-driven permission gating.
- Shared RAG store with recency-weighted ordering.
- Strong anti-loop guardrails (cooldown, max iterations, turn-taking rule).
- Better initial state than “empty”: profile-driven seed memory + RAG-based unconscious context.

### Must NOT Have (Guardrails)
- No voice features (STT/TTS/VC join) in this plan.
- No “roam everywhere by default”: seed channels only until approval.
- No unredacted secrets in logs (Discord tokens, auth headers, etc.).
- No uncontrolled Discord spam: enforce budgets + cooldowns + stop conditions.
- No broad history backfill without explicit operator approval (indexing is passive + rate-limited).

---

## Verification Strategy (TDD)

### Test Decision
- **Infrastructure exists**: YES (`bin/cephalon test`)
- **User wants tests**: YES (TDD)

### Test Levels
- Unit tests (pure): recency-weighted ranking, permission policy transitions, turn-taking decision logic.
- Component tests (mocked): agent loop chooses send/no-send given history + permissions.
- Integration tests (optional/flagged): Chroma + Ollama availability checks (skip if services not running).

### Commands
- Primary: `bin/cephalon test`
- Brain-only: `clojure -M -m cephalon.brain.test-runner` (from `bin/cephalon`)

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Foundations):
- Profiles (load from `CEPHALON_HOME`), register Duck+OpenSkull, remove hardcoded prompt path
- Permission model + persistence skeleton + admin WS protocol
- Process wiring: per-instance profile selection + separate Discord tokens

Wave 2 (Behavior):
- Seed-channel loop behavior + turn-taking + cooldown/stop conditions
- Ollama request/response logging improvements + admin panel surfacing

Wave 3 (Memory):
- Discord history indexing → Chroma (+ Mongo optional) + recency-weighted retrieval
- Context injection + evidence logging
- Docs/skills updates

Critical Path: Wave 1 → Wave 2 → Wave 3

---

## TODOs

> Implementation + tests are ONE task (TDD). Each task must remain agent-executable.

- [x] 1. Add profile schema + loader under `CEPHALON_HOME`

  **What to do**:
  - Define an EDN profile schema for Duck/OpenSkull including:
    - `:id`, `:display-name`
    - prompts: `:system-prompt`, `:persona-prompt`
    - `:model` (and optional `:model-params`)
    - `:tools` (or reference toolset name)
    - `:limits` (`:max-steps`, `:max-context-messages`, etc)
    - `:seed-channels` (shared list)
    - `:seed-memory` (initial facts/active items) so agents don't start "empty"
    - `:logging` (redaction + truncation)
    - `:rag` (collection names, K, recency half-life, budgets)
  - Implement loader that reads from `CEPHALON_HOME/profiles/*.edn` (or a single `profiles.edn`).
  - Fail fast with a clear operator error if profiles missing.

  **References**:
  - `bin/cephalon#L15` - `CEPHALON_HOME` conventions.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/agent.clj#L31` - current hardcoded prompt path to remove.

  **Acceptance Criteria**:
  - Unit tests cover schema parsing + helpful errors.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`, `workspace-navigation`

- [x] 2. Register Duck + OpenSkull agents from profiles (`CEPHALON_PROFILE`)

  **What to do**:
  - Replace single-agent registration in `cephalon.brain.agent` with profile-driven registration.
  - Add runtime selection for the active profile (e.g., `CEPHALON_PROFILE=duck|openskull`).
  - Ensure tool selection uses either:
    - profile `:tools`, or
    - `toolset/toolset "duck"|"openskull"` as a default.

  **References**:
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/toolset.clj#L46` - current toolset mapping.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/mcp.clj#L6` - duck+openskull endpoints.

  **Acceptance Criteria**:
  - Tests verify both agents are registered and selectable.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`

- [x] 3. Process wiring: run two Discord bot accounts cleanly (Duck + OpenSkull)

  **What to do**:
  - Make it ergonomic and non-conflicting to run:
    - `duck-io` with Duck token + `duck-brain` with `CEPHALON_PROFILE=duck`
    - `skull-io` with OpenSkull token + `skull-brain` with `CEPHALON_PROFILE=openskull`
  - Update `orgs/octave-commons/cephalon-clj/ecosystem.pm2.edn` and/or `bin/cephalon` to support separate tokens (no env collisions).
  - Document required env vars (no secrets committed).

  **References**:
  - `orgs/octave-commons/cephalon-clj/ecosystem.pm2.edn` - duck/skull slots already exist.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-discord-io/src/cephalon/discord_io/server.cljs#L18` - reads `DISCORD_TOKEN`.

  **Acceptance Criteria**:
  - Config parsing tests for per-instance env selection.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`, `pm2-process-management`

- [x] 4. Permission core: seed channels + request/approve + persistence + gating

  **What to do**:
  - Implement deny-by-default except profile seed channels.
  - Add agent tool `permission.request` (channel/guild + action + rationale).
  - Persist permissions under `CEPHALON_HOME` (file-based first; Redis optional later).
  - Gate Discord tools (at tool invocation boundary) so unauthorized actions cannot execute.

  **References**:
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/remote.clj#L5` - remote tool macro (hook point).
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/tools/discord.clj` - remote tools to gate.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj#L177` - admin op routing.

  **Acceptance Criteria**:
  - Unit tests: seed allowed, non-seed denied, request lifecycle works, persistence reload works.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`

- [x] 5. Admin panel: permission queue UI + approve/deny ops

  **What to do**:
  - Extend admin WS protocol to:
    - list permissions
    - list pending requests
    - approve/deny requests
  - Update admin TUI/UI to show requests and allow approvals.

  **References**:
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj#L177` - WS op dispatch.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-admin-tui/src/cephalon/admin_tui/main.cljs` - UI client.

  **Acceptance Criteria**:
  - Admin UI tests updated (via `bin/cephalon test`).
  - Mocked brain test ensures approvals flow end-to-end.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: `submodule-ops`, `frontend-ui-ux`

- [x] 6. Explorer seed session: auto-create on startup + bounded loop prompt

  **What to do**:
  - Ensure an "explorer" session exists immediately at startup.
  - Provide a deterministic explorer tick prompt that encourages tool use and channel discovery within permissions.
  - Ensure explorer loop is bounded (cooldowns + max iterations) and controllable from admin panel.

  **References**:
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj#L59` - session creation.
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/loop.clj#L45` - loop scheduler.

  **Acceptance Criteria**:
  - Tests confirm explorer session exists and loop tick respects permissions and budgets.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`

- [x] 7. Seed-channel loop: fetch history + decide + post (turn-taking + cross-process lock)
- [x] 8. Ollama observability: structured request/response logging (redaction + admin surfacing)
- [x] 9. RAG: passive Discord history indexing → Chroma + recency-weighted retrieval

  **What to do**:
  - Index messages from seed channels passively (rate-limited) into Chroma.
  - Embed via Ollama `qwen3-embedding`.
  - Retrieval: top-K similarity then re-rank by similarity * recency weight (default half-life: 7 days).
  - Add graceful fallback if Chroma/Ollama unavailable.

  **References**:
  - `promethean/docker-compose.yml#L42` - expected service ports.

  **Acceptance Criteria**:
  - Unit tests for recency scoring.
  - Component tests show retrieval log evidence with scores.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`

- [ ] 10. Context injection: bounded “unconscious” context with prompt-injection guardrails

  **What to do**:
  - Inject retrieved items as a bounded section (budgeted tokens/chars).
  - Include metadata (channel + timestamp) and guardrail text to treat retrieved text as untrusted.

  **References**:
  - `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/context.clj#L26` - context builder.

  **Acceptance Criteria**:
  - Tests ensure injection respects budgets and is sanitized.
  - `bin/cephalon test` passes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `submodule-ops`

- [ ] 11. Docs + OpenCode skills updates (Cephalon-as-tool + docker services + profiles)

  **What to do**:
  - Update Cephalon docs to reflect:
    - Duck/OpenSkull profiles under `CEPHALON_HOME`
    - two bot accounts + env vars
    - docker services expected running (redis/mongo/chroma/ollama)
    - permission panel behavior
  - Update OpenCode skill docs to acknowledge these services and how to operate Cephalon under PM2.

  **References**:
  - `orgs/octave-commons/cephalon-clj/README.md`
  - `orgs/octave-commons/cephalon-clj/docs/duck-deployment.md`
  - `.opencode/skills/pm2-process-management.md`

  **Acceptance Criteria**:
  - Docs include a clear operator runbook to create profiles and provide tokens.

  **Recommended Agent Profile**:
  - Category: `writing`
  - Skills: `workspace-navigation`, `skill-authoring`

---

## Commit Strategy

Prefer atomic commits by concern (executor discretion). Suggested grouping:
- profiles + loader
- agent registration + loop behavior
- permissions (core) + admin panel
- rag indexing + retrieval + injection
- docs/skills

---

## Success Criteria

### Verification Commands
- `bin/cephalon test`

### Final Checklist
- [ ] Duck and OpenSkull profiles load from `CEPHALON_HOME` (no repo-hardcoded prompts)
- [ ] Seed channels only at startup; other channels require approval via admin panel
- [ ] Bots can loop without runaway (cooldowns + stop conditions)
- [ ] RAG retrieval uses recency-weighted scoring and is visible in logs
- [ ] Ollama prompt/response logging is visible and redacted
- [ ] Docs/skills updated and consistent
