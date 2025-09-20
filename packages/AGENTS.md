# AGENTS.md

## Module Resolution

- Do not resolve modules via relative paths outside of a package's root.
- Shared types must be provided by dependencies (e.g., `"@promethean/packagename": "workspace:*"`).
- "@node/types" is installed at package root.
- node version is pinned by package.json

## Caching

- Avoid writing JSON files for intermediate data.
- Use key-value caches (e.g., `@promethean/level-cache`).
- Additional cache implementations may be introduced in the future.
- Avoid writing JSON files for cache or temp data.
- Conventionally, store level cache data under `.cache/<package-name>`.


## Package scaffolding

- Use Nx to create new workspace packages:
  - Libraries: `nx g tools:package <name> --preset library`
  - Fastify services: `nx g tools:package <name> --preset service`
  - Frontends: `nx g tools:package <name> --preset frontend`
- The generator writes `src/` with functional TypeScript entry points, AVA stubs in `src/tests`, and `static/` for assets that should be served by `@fastify/static`.
- Service presets include an OpenAPI template under `static/openapi`, and you must expose it through `/openapi.json` using `@fastify/swagger` and `@fastify/swagger-ui`.
- Frontend presets emit `src/frontend/` alongside `dist/frontend/` targets; serve `dist/frontend` and `static` together from Fastify when deploying UI shells.
- All packages compile to `dist/` with ESM outputs that keep `.js` extensions in import statements.
- Every package stays GPL-3.0-only and follows our functional TypeScript conventions (pure functions, immutability, composition).

## Testing

- Ava is always the test runner (tests live in `src/tests`).
- Test logic does not belong in module logic
- define **ports** (your own minimal interfaces),
- provide **adapters** for external services like Mongo/Chroma/level/redis/sql/etc,
- have a **composition root** that wires real adapters in prod,
- and in tests either inject fakes directly or **mock at the module boundary** (ESM-safe) without touching business code.
- **No test code in prod paths.** Ports/DI keeps boundaries explicit.
- **Deterministic & parallel-friendly.** No shared module singletons leaking between tests.
- **Easier refactors.** Adapters are the only place that knows Mongo/Chroma APIs.
- **Right tool for each test level.** Fakes for unit speed; containers for realistic integration. The principle is well-established: mock *your* interfaces, not vendor clients. ([Hynek Schlawack][3], [8th Light][2])
- `esmock` provides native ESM import mocking and has examples for AVA. It avoids invasive “test hook” exports. ([NPM][5], [Skypack][6])

## Clean Code

- Leave every file you touch a bit cleaner than you found it.
- Run eslint on changed paths and fix violations instead of ignoring them.
- Prefer small, incremental improvements to code quality.

## Example package
Keep it simple, use barrel exports, minimal tsconfig extending `../../tsconfig.base.json`, minimal `ava.config.mjs`
build essentials (`typescript`, `rimraf`, `eslint`,`prettier`,`ts-node`,`ava`,`tsx`, etc) are pinned to the root ``package.json`
to prevent version drift.

node versions are pinned to root `package.json` to prevent version drift.

### packages/hack/src/hack.ts
```typescript
import {foo} from "@promethean/bar"
export function hack() {}
```
### packages/hack/src/index.ts

```typescript
export * from "./hack.js"
```

### packages/hack/package.json

```json
{
  "name": "@promethean/hack",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.cjs",
  "types": "dist/index.d.ts",
  "module": "dist/index.js"
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./dist/*": "./dist/*",
    "./*": "./dist/*"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "typecheck": "tsc -p tsconfig.json",
    "test": "pnpm run build && ava",
    "lint": "pnpm exec eslint .",
    "coverage": "pnpm run build && c8 ava",
    "format": "pnpm exec prettier --write ."
  }
  "dependencies":{
  "@promethean/bar":"workspace:*"

  },
  "devDependencies":{}
}
```

### packages/hack/tsconfig.json
```json
{
    "extends": "../../config/tsconfig.base.json",
    "compilerOptions": {
        "rootDir": "src",
        "outDir": "dist",
        "composite": true,
        "declaration": true
    },
    "include": ["src/**/*"],
    "references": []
}
```

### packages/hack/ava.config.mjs

```javascript
export { default } from '../../config/ava.config.mjs';
```
