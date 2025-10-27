# Assets, Derivations, and Messaging

Attachments flow through a deterministic pipeline that produces content
addressed assets and derived renditions. Messages may embed attachments and
reference derived content as it becomes available.

## Asset Upload Lifecycle

```ts
export interface AssetPut {
  name?: string;
  mime: string;
  bytes?: number;
  cid?: string;                 // optional precomputed hash for dedupe
  room?: string;
  policy?: { public?: boolean; ttlSeconds?: number };
}
```

1. Client emits `{ kind: "event", type: "asset.put", payload: AssetPut }`.
2. Client streams `kind: "stream", type: "asset.chunk"` frames carrying the
   binary data.
3. Client finalises with `asset.commit`.
4. Gateway responds with `asset.ready` containing the canonical CID and URI.

```json
{ "kind": "event", "type": "asset.ready",
  "payload": { "cid": "cid:sha256-...", "uri": "enso://asset/cid:...", "mime": "application/pdf", "bytes": 834221 } }
```

## Posting Rich Messages

```json
{ "kind": "event", "type": "content.post",
  "payload": {
    "room": "r1",
    "message": {
      "role": "human",
      "parts": [
        { "kind": "text", "text": "Please summarise this PDF." },
        { "kind": "attachment", "uri": "enso://asset/...", "mime": "application/pdf", "bytes": 834221 }
      ]
    }
  }}
```

Gateways emit `content.message` immediately, then append derived parts as they
arrive. Delivery includes a stable message identifier for downstream receipts:

```json
{ "kind": "event", "type": "content.message",
  "payload": {
    "messageId": "msg-ax9",
    "room": "r1",
    "message": { "role": "agent", "parts": [{ "kind": "text", "text": "Working on it." }] }
  }}
```

## Derivation Requests

Derivations can be automatic (based on policy) or explicitly requested.

```json
{ "kind": "event", "type": "asset.derive",
  "payload": {
    "cid": "cid:sha256-...",
    "plans": [
      { "purpose": "text", "via": ["pdf.extract_text", "ocr.tesseract"] },
      { "purpose": "image", "via": ["pdf.page_renders@150dpi"] }
    ]
  }}
```

Derived results are broadcast as they complete.

```json
{ "kind": "event", "type": "asset.derived",
  "payload": {
    "from": "cid:sha256-...",
    "derived": { "purpose": "text", "uri": "enso://asset/...", "mime": "text/markdown" }
  }}
```

## Default Derivation Policy

| Input MIME | Text derivation | Image derivation |
```
| --- | --- | --- |
```
| `application/pdf` | Extract text, fallback OCR | Page render + thumbnail |
| `image/*` | OCR with language hints | Normalised PNG/WebP + thumbnail |
| `text/*`, `application/json` | Identity | Optional screenshot preview |
| Office formats (`docx`, `pptx`, `xlsx`) | Convert to Markdown/notes | Per-page or slide images |
| `text/html` | Readability → Markdown | Screenshot + thumbnail |
| `audio/*`, `video/*` | Speech-to-text transcript | Optional keyframes |

Gateways store derivations via `enso-transcode` and cache them using the same
CID scheme as original assets.

## Messaging Behaviour

* Chat delivery is never blocked on derivations.
* URIs are deterministic: `enso://asset/<sha256>` ensures instant dedupe.
* Thumbnails remain under 64 KB by policy.
