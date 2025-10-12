---
uuid: "8925f5a8-40ab-44e4-ad9e-54db7d617996"
title: "validate voice-demo microphone integration -test"
slug: "validate-voice-demo-microphone-integration-test"
status: "icebox"
priority: "P2"
labels: ["audio", "manual-test"]
created_at: "2025-10-12T02:22:05.423Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































# Description

Validate the `voice-demo` CLI command against real microphone devices and document any platform-specific setup guidance needed for contributors.

## Requirements/Definition of done

- Run the CLI on macOS and Linux with a physical microphone attached.
- Capture at least two short transcripts to confirm audio capture, streaming, and transcript playback.
- Document working `arecord`/`sox`/`ffmpeg` pipelines (or native equivalents) for piping microphone PCM into the CLI.
- File follow-up issues for any defects uncovered during testing.

## Tasks

- [ ] Verify microphone recording pipeline on macOS.
- [ ] Verify microphone recording pipeline on Linux.
- [ ] Record findings and setup steps in the package README.
- [ ] Open issues for any transport or audio capture bugs encountered.

## Relevant resources

- `packages/enso-protocol/src/cli.ts`
- `packages/enso-protocol/src/audio.ts`
- Voice transport notes in the latest PR description.

## Comments

Add observations about latency, buffering, or compatibility as testing progresses.








































































































