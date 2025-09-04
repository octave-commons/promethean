# AGENTS.md

## Module Resolution
- Do not resolve modules via relative paths outside of a package's root.
- Shared types and shims must be provided by dependencies (e.g., `"@promethean/types": "workspace:*"`).
- If a package needs cross-package types, add the dependency in `package.json` and reference it through normal module specifiers.
