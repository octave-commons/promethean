# Nx Workspace Guide

This monorepo uses Nx for project orchestration. Prefer the scoped pnpm commands defined per package, and fall back to Nx targets when you need dependency-aware graph execution.

## Common Commands

- `pnpm --filter @promethean-os/<pkg> build|test|lint|typecheck`: Preferred per-package entrypoints.
- `pnpm nx graph`: Visualize project dependencies.
- `pnpm nx run <project>:build` / `test` / `lint`: Run a specific target via Nx.
- `pnpm nx affected --target=build`: Run builds for changed projects.

## Notes

- Corepack with pnpm 9 is required; ensure `corepack enable && corepack prepare pnpm@9 --activate`.
- Avoid `npm`/`yarn`; CI enforces pnpm.
- Keep package READMEs in sync with any new targets or generators.
