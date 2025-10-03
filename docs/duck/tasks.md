# Duck Revival – Tasks

## Milestone M0 – “Quack Again” (minimum viable sound)
- [ ] Wire envs in `voice/transcriber.ts` and `voice/voice-synth.ts` to STT/TTS docker (#duck-m0-env)
- [ ] Compose file for private `stt`, `tts`; expose only `ws` (#duck-m0-compose)
- [ ] Smoke: mic → STT → echo text → TTS → speaker, local only (#duck-m0-smoke)
- [ ] Add `reqId` to logs across `voice/*`, `llm`, `ws` (#duck-m0-reqid)

## Milestone M1 – “Blob Path”
- [ ] Implement WS ops: START/CHUNK/END/GET (server + client helpers) (#duck-m1-ws)
- [ ] Blob spool dir + TTL janitor + metrics (#duck-m1-janitor)
- [ ] Rate limits: per-IP + per-topic (reuse `server.rate.ts`) (#duck-m1-limit)
- [ ] Feature flag `DUCK_USE_BLOBS=1`; dual-path clients (#duck-m1-flag)
- [ ] 16× large images benchmark; ensure no single message > `WS_MAX_PAYLOAD_MB` (#duck-m1-bench)

## Milestone M2 – “Stability”
- [ ] MODACK at expensive phases; redelivery test (#duck-m2-modack)
- [ ] Checksums enforced; rejection path tested (#duck-m2-checksum)
- [ ] Operational runbook + alerts (#duck-m2-runbook)

## Stretch
- [ ] Pre-signed uploads to object store instead of local spool (#duck-s-presign)
- [ ] UI component `<duck-status>` for health (Web Component) (#duck-s-ui)

## Acceptance
- [ ] End-to-end loop stable for 60 minutes under load (images+audio)
- [ ] Disk bounded by TTL; no leaked temp files
- [ ] No base64 media in JSON on the wire
