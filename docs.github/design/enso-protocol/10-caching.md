# Caching and Content Addressing

Caching treats every derived asset or computation as a content-addressed entry
that can be shared across rooms when policy allows.

## Cache Keys and Visibility

```ts
export type CacheVisibility = "session" | "room" | "global";

export interface CacheKey {
  cid: string;                    // content hash
  purpose: string;                // e.g. "text", "thumbnail"
}

export interface CachePut {
  key: CacheKey;
  uri?: string;
  bytes: number;
  mime: string;
  visibility: CacheVisibility;
  ttlSeconds?: number;
  tags?: string[];
  meta?: Record<string, unknown>; // provenance and tool/version
}
```

Cache entries inherit the strictest visibility of all contributing artefacts.

## Cache Events

```json
{ "kind": "event", "type": "cache.put", "payload": { "key": { "cid": "cid:...", "purpose": "text" }, "mime": "text/markdown" } }
{ "kind": "event", "type": "cache.hit", "payload": { "key": { "cid": "cid:...", "purpose": "text" }, "uri": "enso://asset/..." } }
{ "kind": "event", "type": "cache.miss", "payload": { "key": { "cid": "cid:...", "purpose": "text" } } }
{ "kind": "event", "type": "cache.evict", "payload": { "key": { "cid": "cid:...", "purpose": "text" }, "reason": "ttl" } }
```

`cache.partial` messages support ranged fetches for large blobs or streams.

## Stream-Level CIDs

Long-lived streams use a stream CID (`scid`) derived from the source inputs and
parameters. Clients can resume via `stream.resume` by referencing the `scid`
and last known sequence.

## Deterministic Derivation IDs

Derivation outputs compute CIDs using:

```
derivedCID = sha256(concat(
  "enso-derive\0",
  sourceCID, "\0",
  toolId, "\0",
  toolVersion, "\0",
  canonicalJson(params)
))
```

The rule ensures results computed in labs or production map to the same cache
entry.

## Policy Broadcasting

Room policy includes cache quotas and pin sets.

```json
{ "kind": "event", "type": "cache.policy",
  "payload": {
    "scope": "room",
    "maxBytesPerRoom": 5368709120,
    "maxBytesPerEntry": 268435456,
    "allowedMime": ["text/*", "image/*", "application/pdf"],
    "defaultTTLSeconds": 2592000,
    "pinTags": ["index:*"],
    "privateTags": ["session:*"]
  }}
```
