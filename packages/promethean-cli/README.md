# Promethean CLI

The Promethean CLI provides a thin wrapper around the workspace's `pnpm` scripts.
It discovers every package in the repository, lists their runnable scripts, and
then proxies invocations so that contributors can run project tasks with short,
memorable aliases.

## Usage

After installing dependencies run the build once so the distributable script is
available:

```sh
pnpm --filter @promethean/promethean-cli run build
```

Once built you can execute the CLI via the repo-level binaries:

```sh
pnpm exec promethean --help
# or, using the short alias
pnpm exec prom packages lint
```

The `--help` flag lists every discovered package and their registered scripts.
If you request an unknown package or action the CLI will display the available
options to help you recover quickly.

## Development

- Source lives in [`src/promethean/cli`](./src/promethean/cli/).
- Builds are produced with `shadow-cljs` and written to `dist/promethean_cli.cjs`.
- Tests live under [`tests/scripts`](../../tests/scripts/) and can be run with:

  ```sh
  pnpm exec ava tests/scripts/promethean-cli.test.js
  ```

Rebuild the distributable after making code changes so the binaries stay in sync
with the source.
