## Notes

## 2026-01-29 Task: humble-ui compile
- `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/humble_ui.clj` fails to compile: `Unmatched delimiter: ]` (reported at line 246:64).

## 2026-01-29 Task: humble-ui runtime
- HumbleUI app hits `AssertionError: :y, expected number or :top/:center/:bottom, got: :middle` due to `[ui/align {:y :middle ...}]`.

## 2026-01-29 Task: admin-ws JSON
- `cephalon.brain.admin-ws/send!` fails on `java.time.Instant` in session summaries (`:created-at`), causing `Cannot JSON encode object of class: java.time.Instant` and preventing WS hello/session payloads from being sent.
