---
uuid: 480c3123-6ad3-4825-8516-896cd8d683cc
created_at: '2025-10-06T01:50:48.289Z'
title: ECS Board Planning Note
status: todo
priority: P3
labels: []
---
# ECS Board Planning Note

## 📌 Purpose
Define expectations for an ECS-powered kanban experience so delivery teams can design and implement UI slices that stay aligned with existing markdown + CLI workflows.

## 👥 Target Personas
- **Board Manager (Agents & Ops):** Needs authoritative, low-friction controls to curate tasks, enforce WIP limits, and keep the markdown board in sync.
- **Individual Contributors:** Want quick ways to discover work, self-assign, and record progress without learning new tooling.
- **Stakeholders / Reviewers:** Require fast visibility into status, blockers, and scope deltas without leaving canonical documentation.

## 🧭 Desired Interactions
### Drag & Drop
- Reorder tasks within a column with optimistic UI updates that reconcile with markdown regeneration on save/commit.
- Column transitions must validate WIP limits before persisting, surfacing inline warnings if a move would exceed caps defined in regenerated board metadata.

### Keyboard Flows
- Shortcut-driven column changes e.g., `[`/`]` to move left/right that mirror `kanban move_up/move_down/update_status` semantics for accessibility parity.
- Inline edit/save commands that respect markdown frontmatter fields (status, priority, labels) so regenerated tasks remain valid.

### Filters & Views
- Quick filters for labels, priority, assignee (future), and status states while retaining markdown as the persisted source.
- Saved filter presets stored client-side to avoid mutating markdown/CLI artifacts; shareable query URLs for stakeholders.

## ⚙️ Performance & Latency
- Interactions should feel instant; target <150 ms for drag/drop acknowledgement and <400 ms for filtered view refreshes on typical boards (<500 tasks).
- Persisted changes must round-trip through the markdown/CLI pipeline within the same commit/PR cycle—no background divergence.

## 🛠️ Coexistence with Markdown & CLI
- Markdown tasks `docs/agile/tasks/*.md` stay authoritative; UI edits must emit operations that reuse `packages/kanban/src/index.ts` commands push/pull/sync/regenerate.
- UI should call into the CLI layer (direct spawn or API wrapper) instead of duplicating regeneration logic to ensure parity with `sync` and `regenerate` flows.
- Conflicts resolved via CLI rules: when UI detects divergence, prompt the operator to run `kanban sync`/`regenerate` before finalizing UI state.

## ✅ Acceptance Criteria aligned with `docs/agile/agents.md`
1. Markdown task files remain the single source of truth; UI cannot persist state that lacks a corresponding markdown update.
2. WIP limits from regenerated board headers block UI transitions that would exceed caps, matching board-manager enforcement duties.
3. Regeneration cycle (`kanban regenerate`) stays the blessed way to rebuild `kanban.md`; UI provides a one-click affordance that shells out to this command.
4. Task status changes always emit updates compatible with CLI push/pull flows so board + tasks remain synchronized.
5. System logs every UI-induced move for audit, mirroring the agents’ responsibility to document transitions before moving to **Done**.

## ❓ Open Questions for Stakeholders
- Which teams own the ECS board UI (frontend) versus CLI maintenance to guarantee parity long-term?
- Do we need role-based permissions before GA, or can board managers act as the gatekeepers for early phases?
- What telemetry is required (e.g., audit trail, performance metrics) to satisfy governance/compliance expectations?
- Should saved filters be shareable server-side or remain personal until multi-user coordination requirements are clearer?
- Is offline support (draft changes before sync) required, or can we assume always-on connectivity to the CLI layer?

## 📣 Circulation & Sign-off
- Share draft with: Platform DX (CLI owners), Board Ops/Agents, Product stakeholders for ECS initiative.
- Required approvals: `[ ]` Product, `[ ]` Engineering, `[ ]` Operations.
- Record sign-off decisions back in the linked kanban task before implementation begins.

