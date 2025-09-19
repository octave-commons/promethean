# Security, Signatures, and Guardrails

Security covers session authentication, optional message signatures, and the
Morganna guardrails that govern evaluation behaviour.

## Authentication and Signatures

* Sessions authenticate using opaque tokens or mutual TLS for trusted agents.
* Envelopes may carry a detached Ed25519 signature in the `sig` field. The
  signature is computed over the canonical JSON form of the envelope without
  the `sig` property.
* Room policy can mandate signatures for specific roles or event types.

## Morganna Guardrails

The Morganna guardrail suite enforces transparent tool usage:

1. **Evaluation mode** – `room.flags.eval = true` requires agents to emit
   `act.rationale` events describing why a tool call is being made.
2. **Intent tracking** – `act.intent` events enumerate allowed actions such as
   `"reduce_self_scope"`. Concealing intent in evaluation mode is a violation.
3. **Timeout discipline** – each tool declares `ttlMs`. Gateways emit a
   negative `tool.result` with `error: "timeout"` when the limit is exceeded.

## Derivation Sandboxes

Derivation workers run in sandboxed processes with network disabled by default.
Room policy defines which MIME types may trigger automatic derivations and how
long results remain accessible.

## Consent and Audit

* `consent.record` receipts document when content may be exported outside the room.
* Transparency logs can capture `tool.call` metadata in persistent rooms.
* Ephemeral/ghost rooms suppress detailed logging; only aggregate counters are
  retained when policy allows.
