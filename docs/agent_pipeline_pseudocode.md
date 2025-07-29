# Agent Pipeline Pseudocode

This document captures the basic interaction loop described in `AGENTS.md` and `readme.md`.
It outlines how an agent like **Duck** processes voice input and produces a spoken response.

```pseudo
initialize services: STT, Cephalon, TTS

loop while agent active:
    # 1. perception
    audio_input = capture_voice_in()

    # 2. speech-to-text
    text = STT.transcribe(audio_input)

    # 3. reasoning
    response = Cephalon.generate(text)

    # 4. text-to-speech
    audio_output = TTS.synthesize(response)

    # 5. action
    play_voice_out(audio_output)
```

The services communicate via message protocols under `bridge/` and may
maintain memory or emotional state as configured in each agent.

#hashtags: #agents #pseudocode #promethean

#tags: #docs
