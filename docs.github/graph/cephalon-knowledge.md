---
project: Promethean
tags: #knowledge-graph, #cephalon, #voice, #state, #permissions
---

# 🧠 Cephalon Knowledge Graph

## 🧩 Entities

- [VoiceSynth](VoiceSynth.md)
- [PolicyChecker](PolicyChecker.md)
- [Store](Store.md)
- [Effects](Effects.md)
- [WAVDecoder](WAVDecoder.md)
- [BotSession](BotSession.md)
- [ffmpeg](ffmpeg.md)
- [TTS API](TTS%20API.md)
- [NotAllowedError](NotAllowedError.md)
- [JOIN_REQUESTED]
- [LEAVE_REQUESTED]

---

## 📚 Relationships

```mermaid
graph TD
```
VoiceSynth -->|invokes| "TTS API"
```
```
VoiceSynth -->|pipes to| ffmpeg
```
```
VoiceSynth -->|returns| Readable
```
```
Effects -->|triggers| VoiceSynth
```
```
Effects -->|uses| Store
```
```
Store -->|tracks| VoiceState
```
```
PolicyChecker -->|calls| checkPermission
```
```
checkPermission -->|throws| NotAllowedError
```
```
WAVDecoder -->|provides| WAVBufferInterface
```
