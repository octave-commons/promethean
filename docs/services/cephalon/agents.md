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

- Package manager: `pnpm` (workspace-aware). Examples:
  - Install deps: `pnpm install --filter @promethean/cephalon`
  - Build: `pnpm --filter @promethean/cephalon run build`
  - Test: `pnpm --filter @promethean/cephalon run test`
  - Coverage: `pnpm --filter @promethean/cephalon run coverage`
- Workspace automation: `bb setup`, `bb build`, `bb test`, and
  `pnpm exec nx affected -t <target>` match what CI runs.
- See [[Babashka + Nx Automation Reference|../../notes/automation/bb-nx-cli.md]]
  before updating service docs, and request review from the CI/agent owners
  after making changes.

## Commands

- `join-voice`: Join the requester’s current voice channel
- `start-dialog`: Start the ECS-driven LLM dialog (after join)
- `tts message:<text>`: Speak a message via TTS
- `begin-recording speaker:@user` / `stop-recording speaker:@user`
- `begin-transcribing speaker:@user [log:true|false]`
- `set-capture-channel #channel` / `set-desktop-channel #channel`

## Persistence

Persistence is handled via shared module: @shared/ts/persistence/DualStore
