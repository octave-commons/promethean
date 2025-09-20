# Rooms, Sessions, and Capability Handshake

Rooms provide shared state for membership, permissions, streams, and policy.
Sessions are authenticated connections that advertise capabilities during the
initial handshake.

## Roles and Capabilities

Roles provide defaults; capabilities are explicit strings prefixed with
`can.` or a specific domain identifier.

| Role | Common capabilities |
| --- | --- |
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
