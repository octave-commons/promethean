---
uuid: "387b3ee0-c4f3-4c53-9b77-048e5490c9ca"
title: "publish enso guardrail rationale payload"
slug: "publish-enso-guardrail-rationale-payload"
status: "rejected"
priority: "P1"
labels: ["enso", "protocol", "guardrails"]
created_at: "2025-10-07T20:25:05.645Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Background: The ENSO protocol docs and SDK still describe `act.rationale` as a loosely typed payload, even though Cephalon emits rich guardrail metadata during Duck evaluations. Without a canonical `ActRationalePayload` type and migration guidance, downstream producers/consumers are blocked from adopting the telemetry and the transport chapter risks drifting from the actual TypeScript union.

Goal: Align the ENSO transport spec, SDK (`packages/enso-protocol`), and service implementations around a typed guardrail rationale payload with clear migration steps.

Scope:
- Extend `packages/enso-protocol` with a first-class `ActRationalePayload` type, regenerate the `EnsoEvent` union, and document the schema in the transport chapter.
- Produce upgrade notes for Cephalon, the ENSO gateway, and any other guardrail publishers/consumers (e.g., Morganna evaluators) covering event renames, metadata expectations, and backward-compatibility shims.
- Add AVA tests verifying that the new payload serializes/deserializes cleanly and that deprecated fields (if any) trigger warnings.
- Update `docs/enso` design chapters to reflect the new telemetry contract and link to migration instructions.

Out of Scope:
- Adding new guardrail event families beyond `act.rationale`.
- Rewriting unrelated ENSO SDK areas like assets or context bundles.

Exit Criteria:
- `packages/enso-protocol` builds cleanly with the new payload type and exports matching documentation.
- Consumers (Cephalon, gateway) compile with the updated payload and emit/handle rationale metadata without type casts.
- Documentation changes land alongside a migration checklist summarizing adoption steps and compatibility considerations.
- A changelog entry captures the payload addition and any deprecations.
