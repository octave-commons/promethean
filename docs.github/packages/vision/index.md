# index.js

**Path**: `services/vision/index.js`

**Description**: Express endpoint `/capture` returns a PNG screenshot via
`screenshot-desktop`. The module exports `app`, `start()`, and `setCaptureFn()`
for testing.

### Endpoints

- `GET /capture` – respond with a PNG screenshot.

## Dependencies
- express
- screenshot-desktop

## Dependents
- `services/cephalon/src/agent.ts`
