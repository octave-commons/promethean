# ADR-0001: Move media to WS binary blobs

- **Context**: Duck needs to ship 50–100 MB payloads (16× large images, audio). JSON+base64 caused memory bloat and intermittent proxy failures.
- **Decision**: Add a WS sub-protocol for binary blob upload/download with checksums and TTL. Control path stays JSON.
- **Consequences**:
  - Pros: lower memory, backpressure-friendly, proxy-safe, re-usable blob references
  - Cons: more protocol surface, spool on disk, janitor responsibilities
- **Status**: Accepted
