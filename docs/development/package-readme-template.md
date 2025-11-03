# Package README Template with Nx Commands

> Use this template for creating or updating package READMEs with nx-centric commands.

## Template Structure

```markdown
# @promethean-os/<package-name>

Brief description of the package purpose and functionality.

## Quick Start

```bash
# Build the package
nx build <package-name>

# Run tests
nx test <package-name>

# Start development (if applicable)
nx <package-name> dev

# Lint the package
nx lint <package-name>
```

## Development Commands

### Building
```bash
# Build the package
nx build <package-name>

# Build with watch mode
nx watch <package-name>

# Build specific configuration
nx build <package-name> --configuration=production
```

### Testing
```bash
# Run all tests
nx test <package-name>

# Run specific test file
nx exec <package-name> -- ava path/to/test.test.js

# Run tests with coverage
nx test <package-name> --coverage
```

### Linting & Type Checking
```bash
# Lint the package
nx lint <package-name>

# Auto-fix linting issues
nx lint <package-name> --fix

# Type check
nx typecheck <package-name>
```

## Usage

[Package-specific usage examples]

## Configuration

[Package-specific configuration details]

## Dependencies

This package depends on:
- [List key dependencies with nx project names]

## Contributing

When working on this package:

1. **Use nx commands** - Always prefer `nx build <package-name>` over pnpm filters
2. **Test affected** - Use `nx affected -t test` when making changes
3. **Check dependencies** - Use `nx graph --focus=<package-name>` to understand dependencies

## License

GPL-3.0-only
```

## Key Command Replacements

| Old pnpm Command | New Nx Command | When to Use |
|------------------|----------------|-------------|
| `pnpm --filter @promethean-os/<pkg> build` | `nx build <pkg>` | Building package |
| `pnpm --filter @promethean-os/<pkg> test` | `nx test <pkg>` | Testing package |
| `pnpm --filter @promethean-os/<pkg> lint` | `nx lint <pkg>` | Linting package |
| `pnpm --filter @promethean-os/<pkg> dev` | `nx <pkg> dev` | Development mode |
| `pnpm --filter @promethean-os/<pkg> start` | `nx <pkg> start` | Starting service |

## Package-Specific Patterns

### For Service Packages
```bash
# Build and start service
nx build <package-name> && nx <package-name> start

# Development with watch
nx watch <package-name>
```

### For Library Packages
```bash
# Build library
nx build <package-name>

# Test library
nx test <package-name>

# Type check library
nx typecheck <package-name>
```

### For CLI/Tool Packages
```bash
# Build CLI
nx build <package-name>

# Test CLI functionality
nx test <package-name>

# Use CLI globally (after build)
nx exec <package-name> -- node dist/cli.js
```

## Integration with Workspace

### Affected Operations
When making changes to this package, use affected commands:

```bash
# Test what depends on this package
nx affected -t test --base=origin/main

# Build dependent packages
nx affected -t build --base=origin/main
```

### Project Graph
```bash
# See this package's dependencies
nx graph --focus=<package-name>

# See what depends on this package
nx graph --focus=<package-name> --reverse
```

## Examples in Context

### Example 1: Development Workflow
```bash
# Make changes to package
# ...

# Build and test in one command
nx run-many -t build test -p <package-name>

# Or use affected if working on multiple packages
nx affected -t build test
```

### Example 2: CI/CD Integration
```bash
# In CI pipeline
nx affected -t build test lint --base=origin/main --head=HEAD
```

### Example 3: Local Development
```bash
# Watch for changes during development
nx watch <package-name>

# Test specific file
nx exec <package-name> -- ava src/tests/specific.test.js
```

## Notes for Package Authors

1. **Always use nx project names** in documentation, not pnpm filters
2. **Include dependency information** - helps users understand build order
3. **Provide watch commands** - essential for development workflow
4. **Show affected usage** - demonstrates nx capabilities
5. **Include graph examples** - helps with understanding project relationships