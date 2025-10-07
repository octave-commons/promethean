# Duck Revival

Goal: resurrect the voice assistant ("Duck") with a safer, faster media path:
- Control stays JSON-over-WS (small).
- Media images/audio streams as **binary WS chunks** with checksums & TTL.
- STT/TTS run behind **docker-compose** on a private network.
- Reuse existing queue semantics ACK/NACK/MODACK in `packages/ws`.

## Scope
- ✅ WS "blob" sub-protocol: `BLOB_PUT_START/CHUNK/END`, `BLOB_GET_STREAM`
- ✅ STT/TTS proxying (PCM in, audio out)
- ✅ Pragmatic rate limits + quotas, per-route limits
- ✅ Operational runbook (healthchecks, envs, smoke tests)
- ❌ No UI overhaul follow-up
- ❌ Model retraining out-of-scope

## Definition of Done
- Can capture mic → STT → LLM → TTS → speaker end-to-end on localhost.
- 16× large image batch delivered via WS blobs without OOM/proxy breaks.
- Blob TTL reaping works; disk bounded; checksums verified.
- Docs + smoke tests pass in CI.
