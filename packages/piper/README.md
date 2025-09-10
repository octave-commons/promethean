# @promethean/piper

Piper is a lightweight pipeline runner. It reads a `pipelines.json` file and executes the steps it defines.

## Dev UI

A minimal Fastify server is included to inspect pipelines and trigger steps from the browser.

```bash
pnpm --filter @promethean/piper dev-ui -- --config pipelines.json
```

Then open [http://localhost:3939](http://localhost:3939) to run individual steps. The UI lists pipelines and exposes buttons for each step while streaming logs back to the page.

