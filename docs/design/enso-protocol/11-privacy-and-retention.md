# Privacy Profiles and Retention Policy

Privacy is negotiated at connection time and enforced throughout the room.
Profiles determine encryption requirements, retention limits, and logging
behaviour.

## Privacy Profiles

```ts
export type PrivacyProfile = "persistent" | "pseudonymous" | "ephemeral" | "ghost";

export interface PrivacyRequest {
  profile: PrivacyProfile;
  wantsE2E?: boolean;
  allowLogging?: boolean;
  allowTelemetry?: boolean;
}
```

* **Persistent** – allows indexing and longer retention windows.
* **Pseudonymous** – default mode; minimal logging, room-scoped cache visibility.
* **Ephemeral** – session-limited storage, short TTLs, optional derivations.
* **Ghost** – requires end-to-end encryption, forbids server-side derivations
  and indexing.

## Retention Policy Broadcast

```ts
export interface RetentionPolicy {
  messages: { defaultTTL: number; maxTTL: number };
  assets: { defaultTTL: number; maxTTL: number; allowDerivations: boolean };
  logs: { keepProtocolLogs: boolean; logTTL: number };
  roster: { keepPresenceHistory: boolean };
  index: { allowSearch: boolean; indexTTL: number };
}
```

Gateways announce the policy using `room.policy` events and enforce that
messages or assets never exceed the configured maxima.

## Message-Level Controls

```ts
export interface ChatMessage {
  role: "human" | "agent" | "system";
  parts: ContentPart[];
  expiresAt?: string;            // must be <= room.messages.maxTTL
  burnOnRead?: boolean;          // delete after first read
  forbidIndex?: boolean;         // omit from search/embeddings
  watermark?: "none" | "local" | "cryptographic";
}
```

`burnOnRead` triggers `content.burn` receipts so clients can confirm deletion.

## Consent and Deletion

* `consent.record` events capture whether storage, indexing, or export actions were
  approved.
* Deletion flows use `asset.delete`, `cache.evict`, and `content.retract` events
  followed by `deleted` receipts. Ghost rooms require receipts to expire once
  the log TTL elapses.
