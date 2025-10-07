---
```
uuid: 289512a0-68eb-47aa-b031-7c694d1a4806
```
title: scripts group audio tools
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.520Z'
```
---
Scripts: Group audio tools under scripts/audio

Goal: Move STT/TTS helpers into `scripts/audio/` with a README and verified usage.

Scope:
- Create `scripts/audio/` and move:
  - stt.py, stt_request.py, stt_module.py
  - tts.py, tts_request.py, bench_tts_ws.py
  - whisper_test.py, vision_request.py
- Add `scripts/audio/README.md` with requirements (e.g., FFmpeg, model paths), examples, and env vars.

Exit Criteria:
- All audio utilities live under `scripts/audio/` and run from repo root.
- README exists with prerequisites and sample commands.

#incoming #scripts #audio #organization


