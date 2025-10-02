# DUCK feature flags

Default: disabled (most paths are off by default).

Web``packages/duck-web``:

- `VITE_DUCK_USE_BLOBS``: enables WS binary-blob path -- default false
- `VITE_STT_TTS_ENABLEd``: turns on STT/TTS integrations -- default false

Node``packages/duck-utils``:

- `DUCK_USE_BLOBS`: boolean` (from `process.env`)
- `STT_TTS_ENABLED: boolean` from `process.env`

Examples:

-Vite (.env.dev):

  VITE_DUCK_USE_BLOBS=true
  VITE_STT_TTS_ENABLED=true

-Node:

  DUCK_USE_BLOBS=true
  STT_TTS_ENABLED=true
