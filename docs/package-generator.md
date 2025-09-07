# Package Generator

Use the NX package generator to scaffold a new package that matches the `docops` layout.

```bash
pnpm nx generate ./tools/generators/package --name my-lib
```

This creates `packages/my-lib` with:

- `package.json` named `@promethean/my-lib`
- TypeScript config extending the workspace base
- AVA test setup and sample test
- default `pipelines.yml`
- `project.json` wired for `build`, `test`, `lint`, and `typecheck`

Run the new package's tests with:

```bash
pnpm --filter @promethean/my-lib test
```
