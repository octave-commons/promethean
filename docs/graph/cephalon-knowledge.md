---
project: Promethean
tags: $#knowledge-graph, #cephalon, #voice, #state, #permissions$
---

# 🧠 Cephalon Knowledge Graph

## 🧩 Entities

- [[VoiceSynth]]
- [[PolicyChecker]]
- [[Store]]
- [[Effects]]
- [[WAVDecoder]]
- [[BotSession]]
- [[ffmpeg]]
- [[TTS API]]
- [[NotAllowedError]]
- $[JOIN_REQUESTED]$
- $[LEAVE_REQUESTED]$

---

## 📚 Relationships

```mermaid
graph TD
$$
  VoiceSynth -->|invokes| "TTS API"
$$
$$
  VoiceSynth -->|pipes to| ffmpeg
$$
$$
  VoiceSynth -->|returns| Readable
$$
$$
  Effects -->|triggers| VoiceSynth
$$
$$
  Effects -->|uses| Store
$$
$$
  Store -->|tracks| VoiceState
$$
$$
  PolicyChecker -->|calls| checkPermission
$$
$$
  checkPermission -->|throws| NotAllowedError
$$
$$
  WAVDecoder -->|provides| WAVBufferInterface
$$
