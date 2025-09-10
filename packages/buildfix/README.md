# Buildfix

Buildfix automates fixing TypeScript build errors.

## Usage

Build the package first, then run commands individually:

```sh
pnpm --filter @promethean/buildfix build
pnpm --filter @promethean/buildfix bf:01-errors
pnpm --filter @promethean/buildfix bf:02-iterate
pnpm --filter @promethean/buildfix bf:03-report
```

Or run the full pipeline with [piper](https://github.com/promethean-framework/piper):

```sh
pnpm --filter @promethean/piper run buildfix --config packages/buildfix/pipelines.json
```

### Workspace vs single project

`bf:01-errors` runs in workspace mode by default, scanning the current
directory for every `tsconfig.json`. To process a single project, disable
workspace mode by passing `--root=false` (also accepts `--root=no` or
`--root=0`) and provide `--tsconfig`:

```sh
pnpm --filter @promethean/buildfix bf:01-errors --root=false --tsconfig path/to/tsconfig.json
```

## Pipeline steps

1. **bf-errors** – gather TypeScript diagnostics into `.cache/buildfix/errors.json`.
2. **bf-iterate** – plan and apply fixes, writing history and summaries to `.cache/buildfix/`.
3. **bf-report** – render a Markdown report under `docs/agile/reports/buildfix`.

See `pipelines.json` for the full configuration.

## Tests

Run unit and integration tests:

```sh
pnpm --filter @promethean/buildfix test
```

Run only the integration tests:

```sh
pnpm --filter @promethean/buildfix test:integration
```
