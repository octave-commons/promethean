---
title: "feat: upload voice recordings to discord"
status: "open"
created: "8/3/2025, 1:28:27 AM"
url: "https://github.com/riatzukiza/promethean/pull/169"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# feat: upload voice recordings to discord
## Summary
- allow cephalon to upload recordings to a Discord text channel selected via a new /setrecordingchannel command
- send recordings to the chosen channel whenever a voice session saves audio
- cover recording uploads with a unit test and include tests in TypeScript build

## Testing
- make format-ts (passed)
- make lint-ts-service-cephalon (fails: You are linting '.', but all of the files matching the glob pattern '.' are ignored.)
- make build-ts (fails: npm warn Unknown env config "http-proxy" make: *** [Makefile.ts:39: build-ts] Error 1)
- make test-ts-service-cephalon (fails: Cannot find module 'discordjs/voice' or its corresponding type declarations.)

- - -- - -
https://chatgpt.com/codex/tasks/taske688efda1e8f88324ae37f6e0b0b3980a




---
### New status: "open"

# feat: upload voice recordings to discord
## Summary
- allow cephalon to upload recordings to a Discord text channel selected via a new /setrecordingchannel command
- send recordings to the chosen channel whenever a voice session saves audio
- cover recording uploads with a unit test and include tests in TypeScript build

## Testing
- make format-ts (passed)
- make lint-ts-service-cephalon (fails: You are linting '.', but all of the files matching the glob pattern '.' are ignored.)
- make build-ts (fails: npm warn Unknown env config "http-proxy" make: *** [Makefile.ts:39: build-ts] Error 1)
- make test-ts-service-cephalon (fails: Cannot find module 'discordjs/voice' or its corresponding type declarations.)

- - -- - -
https://chatgpt.com/codex/tasks/taske688efda1e8f88324ae37f6e0b0b3980a
