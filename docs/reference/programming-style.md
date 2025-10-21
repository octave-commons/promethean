# Programming Style Guide

## 🛠️ Technology Stack

- **TypeScript monorepo** with nx workspaces
- **AVA** for testing framework
- **Webcomponents** and **Fastify REST** for web services
- **MongoDB** for primary data storage
- **LevelDB** for caching layers
- **ESMODULEs** throughout the codebase

## 💻 Development Principles

### Code Style

- **Functional programming preferred** - Immutable data, pure functions
- **TDD mandatory** - Write tests before implementation
- **Document-driven development** - Documentation accompanies code

### Import Strategy

- Use `@promethean/<package>*` via `"workspace:*"`
- **No relative imports** outside package root
- Prefer `@promethean/level-cache` for caching needs

### Development Workflow

- Use **ts-lsp** for build errors (faster than full typecheck)
- **Always eslint** files you edit
- **BuildFix Integration** - Use unified benchmark CLI

## 📦 Package Structure

```
./src                    # Source code
./src/tests             # Test files
./src/frontend          # Frontend components
./tsconfig.json         # Extends "../../config/tsconfig.base.json"
./ava.config.mjs        # Extends "../../config/ava.config.mjs"
./package.json          # build, test, clean, coverage, typecheck scripts
./static                # Webserver static files
```

**Note:** Webservers mount both `dist/frontend` and `static` directories.

## 🎯 Working Guidelines

### Change Management

- **Prefer small, auditable changes** over large rewrites
- **Write tests** if none exist for the code you're modifying
- **Don't edit config files** when fixing problems (prefer code changes)
- **Add changelog entries**: `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
- **Ship partial artifacts** if incomplete - never leave with "couldn't finish"

### Code Quality

- **Functional preferred**: Immutable data patterns
- **TypeScript strict mode**: All code must be fully typed
- **ESLint compliance**: Follow established linting rules
- **Test coverage**: Maintain high test coverage for new code

## 📋 BuildFix Integration

### Benchmarking Commands

```bash
# Quick validation
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --iterations 3

# Comprehensive testing
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --suite buildfix-massive

# Model comparison
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --models qwen3:8b,qwen3:14b
```

### BuildFix Workflows

1. **Initial Validation**: Run quick benchmark before changes
2. **Model Selection**: `qwen3:8b` for development, `gpt-oss:20b-cloud` for production
3. **Resource Monitoring**: Use `--monitor-resources` flag
4. **Error Focus**: Specify TypeScript error types

### Best Practices

- Use unified `@promethean/benchmark` CLI over direct scripts
- Monitor performance, compare models, track resource usage
- Use both small and massive fixture sets

### Standard Configuration

```typescript
{
  name: 'buildfix-local',
  type: 'buildfix',
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:8b',
  options: {
    errorContext: true,
    fixStrategy: 'conservative',
    maxRetries: 3,
    timeoutMs: 30000,
  }
}
```

## 🔧 Development Tools

### Essential Scripts

- `pnpm build` - Build all packages
- `pnpm test` - Run test suite
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - TypeScript type checking
- `pnpm clean` - Clean build artifacts

### Package Management

- Use **pnpm** as package manager
- Workspace configuration in `pnpm-workspace.yaml`
- Dependencies managed via `workspace:*` protocol

## 📚 Additional Resources

- [[buildfix-guide|buildfix-guide.md]] - Detailed BuildFix documentation
- [[testing-guide|testing-guide.md]] - Testing framework usage
- [[eslint-configuration|eslint-guide.md]] - Linting configuration
- [[typescript-configuration|typescript-config.md]] - TypeScript setup
