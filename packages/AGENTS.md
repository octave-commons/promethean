# AGENTS.md

## Module Resolution

Do not resolve modules via relative paths outside of a package's root.
Shared types and shims must be provided by dependencies (e.g., `"@promethean/packagename": "workspace:*"`).

# AGENTS.md

## Caching

- Avoid writing JSON files for intermediate data.
- Use key-value caches (e.g., `@promethean/level-cache`).
- Additional cache implementations may be introduced in the future.
