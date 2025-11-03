# Migration Guide: From pnpm to Nx Commands

> **This guide helps you transition from pnpm-based commands to Nx-centric operations.**

## 🎯 Why Nx?

Nx provides significant advantages over plain pnpm commands:

- **Dependency Management**: Automatically builds projects in correct order
- **Intelligent Caching**: Only rebuilds what actually changed
- **Affected Operations**: Work only with projects impacted by your changes
- **Project Graph**: Visualize and understand project relationships
- **Parallel Execution**: Run multiple operations efficiently

## 📋 Command Mapping

### Build Commands

| Old pnpm Command | New Nx Command | Benefits |
|------------------|----------------|----------|
| `pnpm build` | `nx run-many -t build` | Respects dependencies, parallel execution |
| `pnpm --filter @promethean-os/<pkg> build` | `nx build <pkg>` | Simpler syntax, better caching |
| `node ./scripts/run-nx-task.mjs build affected` | `nx affected -t build` | Native affected builds |
| `pnpm build:all` | `nx run-many -t build` | Built-in dependency ordering |

### Test Commands

| Old pnpm Command | New Nx Command | Benefits |
|------------------|----------------|----------|
| `pnpm test` | `nx run-many -t test` | Parallel test execution |
| `pnpm --filter @promethean-os/<pkg> test` | `nx test <pkg>` | Direct project targeting |
| `pnpm test:unit` | `nx run-many -t test:unit` | Consistent with other targets |
| `pnpm test:affected` | `nx affected -t test` | Native affected detection |
| `pnpm --filter @promethean-os/<pkg> exec ava path/to/test.test.js` | `nx exec <pkg> -- ava path/to/test.test.js` | Project context execution |

### Lint Commands

| Old pnpm Command | New Nx Command | Benefits |
|------------------|----------------|----------|
| `pnpm lint` | `nx run-many -t lint` | Parallel linting |
| `pnpm lint:diff` | `nx affected -t lint` | Native affected detection |
| `pnpm --filter @promethean-os/<pkg> lint` | `nx lint <pkg>` | Direct project targeting |
| `pnpm lint:all` | `nx run-many -t lint` | Consistent syntax |

### Type Checking Commands

| Old pnpm Command | New Nx Command | Benefits |
|------------------|----------------|----------|
| `pnpm typecheck:all` | `nx run-many -t typecheck` | Parallel execution |
| `pnpm typecheck:affected` | `nx affected -t typecheck` | Native affected detection |
| `pnpm --filter @promethean-os/<pkg> typecheck` | `nx typecheck <pkg>` | Direct project targeting |

## 🔄 Workflow Examples

### Development Workflow

**Before (pnpm):**
```bash
# Make changes
pnpm build
pnpm test
pnpm lint
```

**After (Nx):**
```bash
# Make changes
nx affected -t build test lint
```

### Working on Specific Project

**Before (pnpm):**
```bash
pnpm --filter @promethean-os/llm build
pnpm --filter @promethean-os/llm test
pnpm --filter @promethean-os/llm lint
```

**After (Nx):**
```bash
nx build llm
nx test llm
nx lint llm
```

### CI/CD Pipeline

**Before (pnpm):**
```bash
pnpm build:all
pnpm test:all
pnpm lint:all
```

**After (Nx):**
```bash
nx affected -t build test lint --base=origin/main --head=HEAD
```

## 🚀 Advanced Nx Features

### Project Graph Visualization

```bash
# See all projects and dependencies
nx graph

# Focus on specific project
nx graph --focus=llm

# Exclude certain projects
nx graph --exclude="*-frontend"
```

### Watching for Changes

```bash
# Watch and rebuild specific project
nx watch llm

# Watch multiple targets
nx watch llm --include=build,test
```

### Running Multiple Projects

```bash
# Build specific projects
nx run-many -t build -p llm,broker,security

# Test multiple projects
nx run-many -t test -p "*-frontend"
```

### Custom Execution

```bash
# Run any command in project context
nx exec llm -- npm run custom-script

# Execute with environment variables
nx exec llm --env.NODE_ENV=production -- node dist/index.js
```

## 📊 Performance Benefits

### Caching

Nx provides intelligent caching that understands:
- File changes
- Dependency relationships
- Build outputs
- Test results

**Example:**
```bash
# First run - builds everything
nx run-many -t build

# Second run - uses cache (if no changes)
nx run-many -t build  # Nearly instant

# Skip cache if needed
nx run-many -t build --skip-nx-cache
```

### Affected Detection

Nx automatically determines which projects are affected by changes:

```bash
# See what would be affected
nx affected --graph

# Run only affected targets
nx affected -t build test lint

# Use different base branch
nx affected -t build --base=origin/develop
```

## 🛠️ Migration Checklist

### For Individual Developers

- [ ] Replace `pnpm build` with `nx run-many -t build`
- [ ] Replace `pnpm --filter @promethean-os/<pkg> build` with `nx build <pkg>`
- [ ] Use `nx affected -t <target>` instead of wrapper scripts
- [ ] Start using `nx graph` to understand project dependencies
- [ ] Use `nx watch` for development instead of manual rebuilds

### For Teams

- [ ] Update CI/CD pipelines to use `nx affected` commands
- [ ] Replace custom build scripts with native Nx targets
- [ ] Train team on Nx project graph and dependency management
- [ ] Update documentation to use Nx commands
- [ ] Configure Nx Cloud for distributed caching (optional)

### For Repository Maintainers

- [ ] Remove redundant wrapper scripts from package.json
- [ ] Ensure all projects have proper Nx targets configured
- [ ] Update README and documentation files
- [ ] Add Nx configuration to project templates
- [ ] Set up Nx Cloud for team caching benefits

## 🔧 Common Issues and Solutions

### Issue: "Project not found"

**Problem:** Using old package names instead of Nx project names

**Solution:** 
```bash
# List available projects
nx show projects

# Use correct project name
nx build correct-project-name  # not nx build @promethean-os/package-name
```

### Issue: "Target not found"

**Problem:** Project doesn't have the target configured

**Solution:**
```bash
# Check available targets for project
nx show project <project-name>

# Or run all targets of type
nx run-many -t build  # Will show which projects have build target
```

### Issue: Cache not working

**Problem:** Builds are always slow

**Solution:**
```bash
# Reset cache if corrupted
nx reset

# Check cache status
nx show projects --web

# Ensure outputs are properly configured in nx.json
```

## 📚 Additional Resources

- [Official Nx Documentation](https://nx.dev/)
- [Nx Concepts](https://nx.dev/concepts/intro)
- [Nx CLI Reference](https://nx.dev/reference/cli-commands)
- [Project Configuration](https://nx.dev/reference/project-configuration)

## 🎉 Quick Reference Card

Print this for quick reference:

```bash
# Build
nx run-many -t build           # All projects
nx build <project>            # Specific project
nx affected -t build           # Affected only

# Test
nx run-many -t test            # All projects
nx test <project>             # Specific project
nx affected -t test            # Affected only

# Lint
nx run-many -t lint            # All projects
nx lint <project> --fix        # Specific + fix
nx affected -t lint            # Affected only

# Utilities
nx graph                      # Project graph
nx show projects              # List projects
nx reset                     # Clear cache
nx watch <project>           # Watch mode
```

Welcome to the Nx-powered workflow! 🚀