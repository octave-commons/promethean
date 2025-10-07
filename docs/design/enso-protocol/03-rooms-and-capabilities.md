# Rooms, Sessions, and Capability Handshake

Rooms provide shared state for membership, permissions, streams, and policy.
Sessions are authenticated connections that advertise capabilities during the
initial handshake.

## Roles and Capabilities

Roles provide defaults; capabilities are explicit strings prefixed with
`can.` or a specific domain identifier.

| Role | Common capabilities |
$$
| --- | --- |
$$
| `human` | `can.speak.audio`, `can.recv.text`, `can.asset.put` |
| `agent` | `can.recv.audio`, `tool.call`, `tool.host`, `cache.write` |
| `observer` | `can.recv.text`, `cache.read` |
| `mixer` | `can.speak.audio`, `can.route.streams` |

Capabilities drive server-side policy enforcement and allow participants to
negotiate tool exposure or privacy requirements.

## Handshake Structure

```ts
export interface HelloCaps {
  proto: "ENSO-1";
  agent?: { name: string; version: string };
  caps: string[];
  privacy?: PrivacyRequest;           // see privacy docs
  cache?: CacheAnnouncement;          // what the client can store
}
```

The gateway responds with room policy, accepted privacy mode, and any
capability adjustments before allowing further traffic.

```ts
{ kind: "event", type: "privacy.accepted",
  payload: { profile: "pseudonymous", wantsE2E: true } }
```

## Room State

Room state is maintained using a CRDT-friendly structure. Core components
include:

* **Member registry** – sessions with role, capability list, and privacy
  profile.
* **Stream registry** – active streams keyed by `streamId`, codec, and target
  participants.
* **Context registry** – active contexts and their applied data sources.
* **Policy set** – retention, cache, and derivation limits announced via
  `room.policy` events.

## Presence and Lifecycle Events

```json
{ "kind": "event", "type": "presence.join", "payload": { "session": "s1", "caps": ["can.speak.audio"] } }
{ "kind": "event", "type": "presence.part", "payload": { "session": "s1", "reason": "network" } }
```

Clients should treat presence events as advisory; the gateway is the source of
truth for who may send or receive traffic.

## Capability Revisions

Capability grants evolve with room policy and operator actions. Gateways MUST
acknowledge any change with a canonical `caps.update` event so clients can
adjust their tool surfaces deterministically.

```json
{
  "kind": "event",
  "type": "caps.update",
  "payload": {
    "session": "s1",
    "caps": ["can.send.text"],
    "revoked": ["can.asset.put"],
    "revision": 2,
    "reason": "policy:asset-freeze",
    "acknowledgedAt": "2024-04-01T12:00:00Z"
  }
}
```

The payload conveys the complete, authoritative capability list along with
explicit `granted`/`revoked` deltas for audit trails. `revision` increments on
every change so receivers can discard stale updates, and `acknowledgedAt`
timestamps when the server committed the revision. Clients that initiate a
change MAY supply a `requestId`; servers echo it in the update so callers can
correlate acknowledgements.

`caps.update` SHOULD be broadcast to observers and ALWAYS delivered to the
affected session before further enforcement decisions. Clients apply the new
set prior to invoking tools; revocations immediately disable local affordances
while grants unlock the corresponding actions.
