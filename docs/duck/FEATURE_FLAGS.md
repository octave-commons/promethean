# DUCK – Feature Flags

Canonical list of flags used by `duck-web` (vite) and Node utilities. Keep names stable; use **UPPER_SNAKE_CASE**.

## Web (Vite env)
These are read via `import.meta.env` and must be prefixed with `VITE_` at build time.

| Flag | Type | Default | Description |
|---|---|---:|---|
| `VITE_DUCK_USE_BLOBS` | bool | `false` | Use Blob-backed storage for large payloads. |
| `VITE_STT_TTS_ENABLED` | bool | `false` | Enable speech-to-text + text-to-speech UI. |

Example `.env.local`:

```dotenv
VITE_DUCK_USE_BLOBS=true
VITE_STT_TTS_ENABLED=false
```

## Node
Read from `process.env`.

| Flag | Type | Default | Description |
|---|---|---:|---|
| `DUCK_USE_BLOBS` | bool | `false` | Enable Blob storage in Node tooling. |
| `STT_TTS_ENABLED` | bool | `false` | Toggle STT/TTS services. |

Example:

```bash
DUCK_USE_BLOBS=true STT_TTS_ENABLED=true node ./scripts/demo.js
```

## Notes
- Keep parsing logic **pure** and colocated in `duck-utils`/`duck-web` helpers.
- If a flag affects public behavior, add a test and update this document in the same PR.
# DUCK feature flags

Default: disabled (most paths are off by default).

Values other than the case-insensitive strings `true` or `false` fall back to their default values.

## Web (`apps/duck-web`)

- `VITE_DUCK_USE_BLOBS`: enables WS binary-blob path (default: `false`)
- `VITE_STT_TTS_ENABLED`: turns on STT/TTS integrations (default: `false`)

_Source: [`apps/duck-web/src/flags.ts`](../../apps/duck-web/src/flags.ts)_

> Non-`true`/`false` strings fall back to the default value.

## Node (`packages/duck-utils`)

- `DUCK_USE_BLOBS`: boolean read from `process.env` (default: `false`)
- `STT_TTS_ENABLED`: boolean read from `process.env` (default: `false`)

_Source: [`packages/duck-utils/src/flags.ts`](../../packages/duck-utils/src/flags.ts)_

> Non-`true`/`false` strings fall back to the default value.

### Examples

**Vite (.env)**

```
VITE_DUCK_USE_BLOBS=true
VITE_STT_TTS_ENABLED=true
```

**Node**

```
DUCK_USE_BLOBS=true
STT_TTS_ENABLED=true
```
