# Cephalon Runtime Handoff Draft

## Idea

A peer-written code change should **not** become primary just because files changed and the process restarted.

Instead, a cephalon should stage a **candidate runtime**, ask it to prove life, and only then promote it.

## Desired flow

1. **Peer edits source** in another cephalon's repo.
2. The target cephalon builds a **candidate bundle** in an isolated path.
3. The target launches a **candidate process** on a shadow port with the same token and a candidate runtime id.
4. The candidate must pass a **handoff handshake**:
   - responds to `/api/runtime/handshake`
   - executes a self-test tool call successfully
   - proves Discord login is healthy
   - returns current circuit/session manifest
   - returns graph/field status snapshot
5. The incumbent calls `runtime.promote_candidate` only if handshake passes.
6. Promotion swaps ports / runtime alias and stops the incumbent.
7. If handshake fails, incumbent stays primary and candidate is killed.

## Candidate handshake shape

```json
{
  "runtimeId": "candidate-uuid",
  "buildHash": "sha256:...",
  "cephalon": "duck",
  "status": "ready",
  "checks": {
    "http": true,
    "discord": true,
    "toolCall": true,
    "sessions": true,
    "graphWeaver": true
  }
}
```

## Minimal first implementation

- add `runtime.build_candidate`
- add `runtime.start_candidate`
- add `runtime.handshake_candidate`
- add `runtime.promote_candidate`
- add `runtime.abort_candidate`

## Why this matters

The cephalons are now closer to a distributed organism than a script. Promotion should feel like mitosis with proof, not like hotwiring the brainstem.
