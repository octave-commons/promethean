# Ollama Registry

Polls our-gpus for discovered Ollama hosts and registers them in proxx.

## Environment

```
OUR_GPUS_URL=http://localhost:8000
OUR_GPUS_API_KEY=your-api-key
PROXX_URL=http://localhost:3000
PROXX_API_KEY=your-proxx-api-key
POLL_INTERVAL_MS=30000
```

## Commands

- `pnpm run dev` - Run in development mode with watch
- `pnpm run start` - Run the built version
- `pnpm run build` - Compile TypeScript
