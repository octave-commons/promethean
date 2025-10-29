## Clean Code

- Leave every file you touch a bit cleaner than you found it.
- Run eslint on changed paths and fix violations instead of ignoring them.
- Prefer small, incremental improvements to code quality.

## Code Style Guidelines

**Imports:**

- ESM only (no require/module.exports)
- Import order: builtin → external → internal → parent → sibling → index
- No default exports (prefer named exports)
- No dynamic imports

**Formatting:**

- Prettier with `pnpm format`
- Max 300 lines per file, 50 lines per function
- Max 4 function parameters
- LF line endings

**Types:**

- TypeScript strict mode enabled
- No `any` types (error)
- Prefer readonly/immutable types
- Explicit function return types
- No unchecked indexed access

**Naming:**

- PascalCase for types/interfaces
- camelCase for functions/variables
- kebab-case for file names

**Error Handling:**

- Avoid try/catch when possible
- Prefer Result/Either patterns
- Use functional error handling

**Forbidden:**

- Class statements/expressions
- `var` declarations
- `let` statements (prefer const)
- `else` statements (avoid when possible)
- setTimeout in tests (use sleep from test-utils)

**Testing:**

- AVA test runner
- Tests in `src/tests/`
- No test code in production paths
- Mock at module boundaries with esmock
