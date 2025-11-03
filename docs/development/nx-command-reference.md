# Nx Command Reference

> **Nx is the center of operations for Promethean** - use these commands for all build, test, lint, and development operations.

## 🚀 Core Commands

### Build Commands

```bash
# Build all projects
nx run-many -t build

# Build specific project
nx build <project-name>

# Build affected projects (based on git changes)
nx affected -t build

# Build with specific configuration
nx build <project-name> --configuration=production
```

### Test Commands

```bash
# Test all projects
nx run-many -t test

# Test specific project
nx test <project-name>

# Test affected projects
nx affected -t test

# Run specific test types
nx run-many -t test:unit
nx run-many -t test:integration
nx run-many -t test:e2e

# Test with coverage
nx test <project-name> --coverage
```

### Lint Commands

```bash
# Lint all projects
nx run-many -t lint

# Lint specific project
nx lint <project-name>

# Lint affected projects
nx affected -t lint

# Auto-fix linting issues
nx lint <project-name> --fix
```

### Type Checking Commands

```bash
# Typecheck all projects
nx run-many -t typecheck

# Typecheck specific project
nx typecheck <project-name>

# Typecheck affected projects
nx affected -t typecheck
```

## 📊 Project Management

### Listing Projects

```bash
# List all projects
nx show projects

# Show project graph
nx graph

# Show project details
nx show project <project-name>
```

### Running Commands

```bash
# Run any target for a project
nx run <project-name>:<target> [options]

# Run target for multiple projects
nx run-many -t <target> -p <project1,project2>

# Execute any command in project context
nx exec <project-name> -- <command>
```

## 🔄 Development Workflow

### Affected Operations

```bash
# Run all targets for affected projects
nx affected

# Run specific targets for affected projects
nx affected -t build test lint

# Check what's affected without running
nx affected --graph
```

### Watching for Changes

```bash
# Watch and rebuild on changes
nx watch <project-name>

# Watch specific targets
nx watch <project-name> --include=build,test
```

## 🎯 Advanced Usage

### Caching

```bash
# Skip cache
nx build <project-name> --skip-nx-cache

# Reset cache
nx reset

# View cache status
nx show projects --web
```

### Parallel Execution

```bash
# Control parallelism
nx run-many -t build --parallel=5

# Run with specific output style
nx run-many -t test --output-style=static
```

### Dependency Graph

```bash
# View dependency graph
nx graph

# Focus on specific project
nx graph --focus=<project-name>

# Exclude projects
nx graph --exclude=<project-pattern>
```

## 📋 Project Examples

### Working with Frontend Packages

```bash
# Build all frontend packages
nx run-many -t build -p '*-frontend'

# Test specific frontend
nx test health-dashboard-frontend

# Lint all frontends
nx run-many -t lint -p '*-frontend'
```

### Working with Tools

```bash
# Build tools package
nx build tools

# Test tools
nx test tools

# Run custom tool command
nx exec tools -- npm run custom-script
```

## 🆚 Migration from pnpm Commands

| Old pnpm Command | New Nx Command | Notes |
|------------------|----------------|--------|
| `pnpm build` | `nx run-many -t build` | Builds all with dependency ordering |
| `pnpm test` | `nx run-many -t test` | Runs tests with proper dependencies |
| `pnpm lint` | `nx run-many -t lint` | Lints all projects |
| `pnpm typecheck:all` | `nx run-many -t typecheck` | Typechecks all projects |
| `pnpm --filter @promethean-os/<pkg> build` | `nx build <pkg>` | Simpler project targeting |
| `pnpm --filter @promethean-os/<pkg> test` | `nx test <pkg>` | Direct project testing |
| `node ./scripts/run-nx-task.mjs build affected` | `nx affected -t build` | Native affected builds |

## 🔧 Configuration

### Nx Configuration (nx.json)

The workspace is configured with:
- **Workspace Layout**: Apps in `services/`, libs in `packages/`
- **Caching**: Enabled for build, test, lint, typecheck, coverage
- **Dependencies**: Proper dependency ordering between projects
- **Outputs**: Configured for build artifacts and coverage reports

### Target Defaults

- `build`: Depends on `^build`, outputs to `{projectRoot}/dist`
- `test`: Depends on `build`
- `test:unit`: Outputs to `{projectRoot}/coverage/unit`
- `test:integration`: Outputs to `{projectRoot}/coverage/integration`
- `test:e2e`: Outputs to `{projectRoot}/coverage/e2e`
- `coverage`: Combines all test coverage outputs

## 🎖️ Best Practices

1. **Always use nx for project operations** - it handles dependencies and caching
2. **Use `affected` for CI/CD** - only build/test what changed
3. **Leverage the dependency graph** - nx ensures proper build order
4. **Use project names directly** - no need for complex filter syntax
5. **Check the graph** - `nx graph` helps understand project relationships

## 📚 Additional Resources

- [Nx Official Documentation](https://nx.dev/)
- [Nx CLI Reference](https://nx.dev/reference/cli-commands)
- [Project Configuration](https://nx.dev/reference/project-configuration)