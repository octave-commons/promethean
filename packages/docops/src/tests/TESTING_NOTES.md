This package's frontend tests are written for the existing repository test runner (Vitest or Jest) with a jsdom environment.

- They mock "./selection.js" and "./api.js" modules used by renderSelectedMarkdown.
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