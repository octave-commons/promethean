# Duck Revival – Review Playbook

A practical checklist and cross-links for the open PR cluster around `duck-web`, `duck-audio`, and `enso-*`.

> **Diagrams:** See **Duck Revival — System Diagrams** at `docs/diagrams/duck-revival-overview.md`.

## PRs
- **#1451 – enso-browser-gateway handshake guard**
  - Add env override `ENSO_HANDSHAKE_TIMEOUT_MS`.
  - Cache readiness in `ensureHandshake()` once `isReady()` flips true.
  - Pairs with #1448 (voice forwarder) for startup correctness.

- **#1450 – cephalon Morganna rationale + room flags**
  - Emit `policy` and `evidenceKind` in rationale payload.
  - Export `ActRationalePayload` from `enso-protocol`.
  - Enables UI guardrail copy; independent of audio path.

- **#1448 – voice forwarder seq/pts, EOF**
  - Document `protocol` parsing + fallback to 20ms; clamp out-of-range to 20ms.
  - Register/deregister lifecycle as per gateway protocol.
  - Consumes output from #1443 worklet (once fixed).

- **#1447 – DUCK feature flags web + node**
  - Replace broken impl with pure ESM helpers on web + node.
  - Sync names in `docs/duck/FEATURE_FLAGS.md`.
  - Blocks nothing else but should land before #1443/#1446 to avoid drift.

- **#1446 – duck-web WebSocket helper**
  - Guard empty bearer; use factory for DI testing.
  - Used by #1443 mic glue; safe to merge post-fix.

- **#1445 – throttled DataChannel sender**
  - Fix `RTCDataChannel` type + threshold logic; expose pure `makeThrottledSender`.
  - Unblocks stable media sending for #1443.

- **#1444 – cephalon PCM clamp**
  - Corrects -32768 extrema; includes tests. Mergeable now.

- **#1443 – audio worklet pipeline + mic glue**
  - Fix `registerProcessor(...)` syntax, carry fractional position (no drift).
  - Import `float32ToInt16` from `duck-audio`.
  - Depends on: #1442 (helpers), #1446 (WS helper), #1445 (sender).

- **#1442 – duck-audio helpers**
  - Fix import paths/tests; provides `clamp16` + `float32ToInt16`. Mergeable now.

## Merge order
```
1. #1442, #1444 → **land first** (leaf libs).
```
```
2. #1451, #1450 → **land next** (infra + protocol).
```
```
3. #1447, #1446, #1445 → **stabilise web helpers**.
```
```
4. #1448, #1443 → **voice + mic path**.
```
## Review checklist (applies to all)
- [ ] CI green; new tests added for changed logic.
- [ ] No mutation in helpers; functional style only.
- [ ] Native ESM; no CJS interop sneaking in.
- [ ] Paths and extensions match build outputs (`.js` after TS).
- [ ] Docs updated when env flags or public types change.

## Commands
```bash
# Regenerate board + sync labels
pnpm kanban regenerate && pnpm kanban sync --process docs/agile/process/duck-revival.yaml
```
