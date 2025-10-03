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
