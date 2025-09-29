# Cephalon Service

## Overview

TODO: Add service description.

## Broker Usage

Use `@promethean/legacy/brokerClient.js` (or `AgentBus` wrapping it) for all broker communication. Avoid raw `WebSocket` clients.

## Paths

- [[cephalon|services/ts/cephalon]]

## Tags

#service #ts

## Tooling

- Package manager: prefer `pnpm`. Example:
  - Install: `pnpm install`
  - Build: `pnpm run build`
  - Test: `pnpm test`
  - Coverage: `pnpm run coverage`
- The root `Makefile` targets now auto-detect `pnpm` and fall back to `npm` if needed for JS/TS services.
- When running commands directly in this service, use the scripts from `package.json` with `pnpm`.

## Commands

- `join-voice`: Join the requester’s current voice channel
- `start-dialog`: Start the ECS-driven LLM dialog (after join)
- `tts message:<text>`: Speak a message via TTS
- `begin-recording speaker:@user` / `stop-recording speaker:@user`
- `begin-transcribing speaker:@user [log:true|false]`
- `set-capture-channel #channel` / `set-desktop-channel #channel`

## Persistence

Persistence is handled via shared module: @shared/ts/persistence/DualStore
