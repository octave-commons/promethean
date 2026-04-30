---
name: testing-nx
description: "Configure and run tests across multiple projects using Nx affected detection for efficient workspace testing"
---

# Skill: Testing Nx

## Goal
Configure and run tests across multiple projects using Nx affected detection for efficient workspace-wide testing with proper caching.

## Use This Skill When
- Running tests for multiple projects in workspace
- Using Nx project graph for affected project detection
- Setting up CI/CD test pipelines
- The user asks to "run affected tests" or "set up Nx testing"

## Do Not Use This Skill When
- Single project without Nx (use direct test framework skill)
- Need to test all projects regardless of changes
- Project doesn't use Nx

## Nx Test Configuration

### nx.json Configuration

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default"],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "test": {
      "inputs": ["production", "^production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default"]
    }
  }
}
```

### project.json Configuration

```json
{
  "name": "my-package",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "targets": {
    "test": {
      "command": "vitest run",
      "inputs": ["default", "^production"],
      "outputs": ["coverage"]
    },
    "test:watch": {
      "command": "vitest watch"
    }
  }
}
```

## Running Tests

### Affected Tests

```bash
# Run tests for affected projects only
nx affected --target=test

# Run tests and build
nx affected --target=test --target=build

# With specific base branch
nx affected --target=test --base=main

# With files that changed
nx affected --target=test --files src/utils.ts

# Parallel execution
nx affected --target=test --parallel=4

# Max parallelization
nx affected --target=test --parallel=max
```

### All Project Tests

```bash
# Run all project tests
nx run-many --target=test --all

# Run specific projects
nx run-many --target=test --projects=project-a,project-b

# With parallelization
nx run-many --target=test --all --parallel=4
```

### Individual Project Tests

```bash
# Run test for specific project
nx run my-project:test

# With configuration
nx run my-project:test --configuration=ci

# Watch mode
nx run my-project:test --watch
```

## Test Caching

### Enable Caching

```json
// project.json
{
  "targets": {
    "test": {
      "command": "vitest run",
      "cache": true,
      "inputs": ["default", "^production"]
    }
  }
}
```

### Cache Configuration

```bash
# Set cache location
NX_CACHE_LOCATION=/tmp/nx-cache

# Disable cache
NX_DONT_USE_CACHE=1

# Custom cache duration
NX_CACHE_PROJECT_AGE=7d
```

## CI/CD Pipeline Integration

### GitHub Actions

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Nx
        run: pnpm add -D nx
      
      - name: Cache Nx
        uses: actions/cache@v3
        with:
          path: .nx/cache
          key: ${{ runner.os }}-nx-${{ hashFiles('**/pnpm-lock.yaml') }}
      
      - name: Run Affected Tests
        run: nx affected --target=test --base=origin/main
```

### GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm ci
    - npx nx affected --target=test --base=main
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Parallelization Strategy

### With Parallel Count

```bash
# Use 4 parallel workers
nx affected --target=test --parallel=4

# Use all available cores
nx affected --target=test --parallel=max
```

### Resource Management

```bash
# Run on specific machine type (with labels)
nx run my-project:test --target-machine-type=large

# With memory limits
NX_MAX_MEMORY=4GB nx affected --target=test
```

## Test Reporting

### JUnit Output

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    junitReporter: {
      outputFile: 'test-results.xml'
    }
  }
});
```

### Nx Reports

```bash
# Generate HTML report
nx report

# Test results in CI
nx affected --target=test --output-style=stream
```

## Output Formats

| Format | Flag | Use Case |
|--------|------|----------|
| Stream | `--output-style=stream` | Local development |
| Static | `--output-style=static` | CI/CD logs |
| JSON | `--output-style=json` | Programmatic parsing |
| Nx Cloud | `nx cloud` | Distributed caching |

## Workspace Structure

```
nx.json
project.json (project A)
project.json (project B)
packages/
├── pkg-a/
│   ├── project.json
│   └── src/
│       └── module.test.ts
└── pkg-b/
    ├── project.json
    └── src/
        └── module.test.ts
```

## Best Practices

### 1. Configure Targets Properly

```json
{
  "targets": {
    "test": {
      "command": "vitest run",
      "inputs": ["default", "^production"],
      "outputs": ["coverage"]
    }
  }
}
```

### 2. Use Named Inputs

```json
{
  "namedInputs": {
    "production": [
      "default",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/**/*.spec.ts"
    ]
  }
}
```

### 3. Cache Test Results

```bash
# Verify caching works
nx test my-project --skip-nx-cache

# First run (cache miss)
time nx test my-project

# Second run (cache hit)
time nx test my-project
```

### 4. CI Optimization

```bash
# Install Nx globally for faster execution
npm i -g nx

# Use CI mode for better performance
nx connect
nx cloud
```

## Troubleshooting

### Tests Not Running

```bash
# Check project graph
nx graph

# List affected projects
nx show projects --affected --base=main

# Verify target exists
nx show project my-project --target=test
```

### Cache Issues

```bash
# Clear cache
nx reset

# Check cache location
echo $NX_CACHE_LOCATION
```

### Performance Issues

```bash
# Analyze performance
nx report

# With profiling
NX_PROFILE=profile.json nx affected --target=test
```

## Output
- nx.json configuration for testing
- project.json target configurations
- CI/CD pipeline examples (GitHub Actions, GitLab)
- Test reporting setup
- Cache configuration

## References
- Nx testing: https://nx.dev/recipes/testing
- Affected: https://nx.dev/concepts/affected
- Nx caching: https://nx.dev/concepts/caching
