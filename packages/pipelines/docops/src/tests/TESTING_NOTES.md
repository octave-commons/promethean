This package's frontend tests should use AVA with a jsdom-like environment. For ESM-safe mocking, use `esmock`.

- They mock "./selection.js" and "./api.js" modules used by renderSelectedMarkdown with `esmock`.
- Scenarios covered:
  - no DOM
  - no selection
  - global marked available
  - ambient marked fallback
  - offline raw text
  - error handling
  - repeated renders
  - argument passing

Adjust the import path in render.test.ts if your renderSelectedMarkdown source lives at a different location.
