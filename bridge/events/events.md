# Event Definitions

Event names use **kebab-case** and are prefixed by the service or routing target. Versioning is handled in the protocol schema files under `bridge/protocols/`.

| Event            | Description                                          | Protocol                                                          |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `stt-input`      | Audio frames sent to STT service.                    | [`stt-ws-request-v1.json`](../protocols/stt-ws-request-v1.json)   |
| `stt-output`     | Transcription emitted by STT service.                | [`stt-ws-response-v1.json`](../protocols/stt-ws-response-v1.json) |
| `cephalon-route` | Text routed through Cephalon for language reasoning. | –                                                                 |
| `tts-output`     | Synthesized audio emitted by TTS service.            | –                                                                 |
