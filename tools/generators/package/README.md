# Package Generator

This Nx generator scaffolds new Promethean packages under `packages/<name>`.

## Options

- `name` (string, required): Kebab-case identifier for the package. The generator
  normalizes the value using Nx `names()` so `My Library` becomes `my-library`.
- `preset` (string, default: `ts-lib`): Template preset to use. The available
  presets are listed below.

## Presets

### `ts-lib`

Creates a TypeScript library aligned with `@promethean/utils`. The preset
includes:

- Shared config (`ava.config.mjs`, `project.json`, `tsconfig.json`).
- Documentation boilerplate (`README.md`).
- Licensing (`LICENSE.txt`).
- Sample source and test files (`src/index.ts`, `src/tests/sample.test.ts`).

## Usage

```bash
pnpm nx g ./tools/generators/package --name awesome-lib --preset ts-lib
```

Use `--dry-run` to preview the generated files without writing to disk.

## Follow-up task for operators

Review the generated README and extend it with package-specific usage notes once
real functionality has been implemented.
