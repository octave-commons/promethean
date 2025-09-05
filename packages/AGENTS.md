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

