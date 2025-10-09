# CRUSH.md

## Commands

```bash
pnpm install
pnpm build
pnpm lint
pnpm test:all
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

## Code Style

- TypeScript monorepo
- Functional preferred
- Immutable data
- TDD non-negotiable
- Document-driven development
- Prefer key-value caches via `@promethean/level-cache`
- No relative module resolution outside of the package root.
- Always use the ts-lsp server to diagnose build errors.
- Always use the eslint tool on each file you edit.

## Kanban

```bash
pnpm kanban regenerate
pnpm kanban sync
pnpm kanban update-status <uuid> <column>
```