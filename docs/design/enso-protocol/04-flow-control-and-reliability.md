# Flow Control and Reliability

Ensuring predictable delivery across transports requires explicit flow-control
signals and retry semantics.

## Sequence Tracking

* Every stream frame carries a monotonically increasing `seq` field.
* Gaps detected by receivers result in a `flow.nack` event that references the
  missing sequence numbers.

```json
{ "kind": "event", "type": "flow.nack", "payload": { "streamId": "V1", "missing": [42, 43] } }
```

## Backpressure

Gateways and mixers enforce backpressure by instructing senders to pause
specific streams.

```json
{ "kind": "event", "type": "flow.pause", "payload": { "streamId": "V1" } }
{ "kind": "event", "type": "flow.resume", "payload": { "streamId": "V1" } }
```

Senders must honour pauses before resuming transmission.

## Graceful Degradation

When media streams stall the gateway emits room-level state updates so clients
can degrade their UI or prompt reconnection.

```json
{ "kind": "event", "type": "state.patch", "payload": { "room": "lab", "voice": { "V1": "degraded" } } }
```

## Timeouts and Retries

Tool calls and derivations declare a `ttlMs`. Gateways terminate work that
exceeds the TTL and emit `tool.result` with `ok: false` and `error: "timeout"`.
This rule is part of the Morganna guardrails covered later.
