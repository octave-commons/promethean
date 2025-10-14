# Development Commands

## Core Development Workflow
```bash
# Build the package
pnpm build

# Run type checking
pnpm typecheck

# Run linting (currently has violations)
pnpm lint

# Auto-fix linting issues where possible
pnpm lint --fix

# Run tests
pnpm test

# Run tests with coverage
pnpm coverage

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

## Development Process
1. **Before Making Changes**: Run `pnpm lint` to understand current issues
2. **During Development**: Use `pnpm typecheck` for immediate feedback
3. **Before Committing**: Run `pnpm test` to ensure functionality
4. **Final Check**: Run `pnpm lint` and `pnpm format` for code quality

## Testing Commands
```bash
# Run specific test file
pnpm test src/tests/markdown.test.ts

# Run tests in watch mode (if supported)
pnpm test --watch

# Generate coverage report
pnpm coverage
```

## Build System
- **TypeScript Compilation**: `tsc -p tsconfig.json`
- **Output Directory**: `dist/`
- **Module Formats**: ESM (primary) and CommonJS (fallback)
- **Declaration Files**: Generated with source maps

## Quality Assurance
The package currently has 44 linting violations (34 errors, 10 warnings) that should be addressed:
- Convert interfaces to types
- Reduce function complexity
- Split large files
- Fix unsafe type operations
- Improve import organization