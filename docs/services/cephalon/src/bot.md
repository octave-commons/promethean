# bot.ts

**Path**: `services/cephalon/src/bot.ts`

**Description**: Handles top level discord interactions. EG slash commands send by the user.

## Dependencies
- ./agent
- ./collectionManager
- ./contextManager
- ./transcriber
- ./voice-session
- ./voice-synth
- discord.js
- events

## Dependents
- `services/cephalon/tests/bot.test.ts`

## Commands
- `set_waveform_channel` – selects the Discord text channel where recorded waveforms are uploaded.

