# Nx Workspace

Promethean uses [Nx](https://nx.dev) to coordinate builds and tests across packages.

## Common commands

- `pnpm nx graph` – visualize project dependencies.
- `pnpm nx build <project>` – compile a package.
- `pnpm nx test <project>` – run the AVA test suite for a package.
- `pnpm nx lint <project>` – lint a package with ESLint.
- `pnpm nx typecheck <project>` – type-check a package.

Each package under `packages/` provides a `project.json` describing its build and test targets. The root `nx.json` sets default caching and dependency behavior.

For quick local checks, `pnpm lint:diff` runs ESLint only on files changed since `origin/main`. It's much faster than `pnpm lint`, which lints the entire repository; use the full lint only in CI or when necessary.
