# Buildfix

Buildfix automates fixing TypeScript build errors.

## Usage

Run the commands individually:

```sh
pnpm --filter @promethean/buildfix bf:01-errors
pnpm --filter @promethean/buildfix bf:02-iterate
pnpm --filter @promethean/buildfix bf:03-report
```

Or run the full pipeline with [piper](https://github.com/promethean-framework/piper):

```sh
pnpm --filter @promethean/piper run buildfix --config packages/buildfix/pipelines.json
```

## Pipeline steps

1. **bf-errors** – gather TypeScript diagnostics into `.cache/buildfix/errors.json`.
2. **bf-iterate** – plan and apply fixes, writing history and summaries to `.cache/buildfix/`.
3. **bf-report** – render a Markdown report under `docs/agile/reports/buildfix`.

See `pipelines.json` for the full configuration.
