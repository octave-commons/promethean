# Test Coverage Pipelines

This document describes the Promethean Framework's separate test coverage pipelines that provide visibility into test coverage quality across different testing levels (unit, integration, and end-to-end).

## Overview

The test coverage pipeline system consists of:

- **Test Classification**: Automatic categorization of tests into unit, integration, and E2E types
- **Separate Pipelines**: Independent execution and coverage reporting for each test type
- **Unified Reporting**: Combined coverage reports with type-specific metrics
- **CI/CD Integration**: GitHub Actions workflows for automated testing and coverage

## Test Types

### Unit Tests

- **Purpose**: Test individual functions, classes, and components in isolation
- **Characteristics**: Fast, no external dependencies, mocked external services
- **Naming Convention**: `*.unit.test.ts`, `*.unit.spec.ts`
- **Timeout**: 10 seconds
- **Concurrency**: 10 (high)
- **Coverage Threshold**: 80% across all metrics

### Integration Tests

- **Purpose**: Test interactions between multiple components or packages
- **Characteristics**: Medium speed, real dependencies, database integration
- **Naming Convention**: `*.integration.test.ts`, `*.integration.spec.ts`
- **Timeout**: 60 seconds
- **Concurrency**: 3 (medium)
- **Coverage Threshold**: 75% across all metrics

### E2E Tests

- **Purpose**: Test complete workflows and system behavior
- **Characteristics**: Slow, full system setup, external services
- **Naming Convention**: `*.e2e.test.ts`, `*.e2e.spec.ts`, `*.workflow.test.ts`
- **Timeout**: 300 seconds
- **Concurrency**: 1 (sequential)
- **Coverage Threshold**: 60% across all metrics

## Local Development

### Running Tests

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests for affected packages only
pnpm test:unit:affected

# Run all integration tests
pnpm test:integration

# Run integration tests for affected packages only
pnpm test:integration:affected

# Run all E2E tests
pnpm test:e2e

# Run E2E tests for affected packages only
pnpm test:e2e:affected
```

### Generating Coverage

```bash
# Generate unit test coverage
pnpm coverage:unit

# Generate integration test coverage
pnpm coverage:integration

# Generate E2E test coverage
pnpm coverage:e2e

# Generate all coverage reports and merge them
pnpm coverage:separate
```

### Test Classification

The `@promethean/test-classifier` package automatically categorizes tests based on:

1. **Filename patterns**: Tests following naming conventions are classified automatically
2. **Directory structure**: Tests in `tests/unit/`, `tests/integration/`, `tests/e2e/` directories
3. **Content analysis**: Import patterns, test descriptions, and usage patterns

#### Using the Test Classifier

```bash
# Build the classifier package
pnpm --filter @promethean/test-classifier build

# Classify all tests in the workspace
node packages/test-classifier/dist/cli.js

# Get detailed classification report
node packages/test-classifier/dist/cli.js --format json --verbose

# Classify specific files
node packages/test-classifier/dist/cli.js --files "packages/agent/src/tests/*.test.ts"
```

## Migration

### Migrating Existing Tests

Use the migration utility to rename existing tests to follow the new naming conventions:

```bash
# Dry run to see what would be renamed
pnpm migrate:tests --dry-run --verbose

# Migrate all tests with auto-classification
pnpm migrate:tests

# Migrate specific test type
pnpm migrate:tests --type=unit

# Interactive migration with confirmation
pnpm migrate:tests --confirm
```

### Manual Test Classification

For tests that aren't automatically classified correctly:

1. **Rename the file** to follow the appropriate naming convention
2. **Move the file** to the correct directory if using directory-based classification
3. **Update imports** that reference the renamed test file

### Migration Checklist

- [ ] Run `pnpm migrate:tests --dry-run` to preview changes
- [ ] Backup your code or create a new branch
- [ ] Run the migration: `pnpm migrate:tests`
- [ ] Fix any import statements that reference renamed files
- [ ] Run tests to ensure everything still works:
  ```bash
  pnpm test:unit
  pnpm test:integration
  pnpm test:e2e
  ```
- [ ] Generate coverage to verify reporting works:
  ```bash
  pnpm coverage:separate
  ```
- [ ] Commit the changes

## CI/CD Integration

### GitHub Actions Workflows

#### Separate Test Pipelines

- **`.github/workflows/test-unit.yml`**: Unit test pipeline
- **`.github/workflows/test-integration.yml`**: Integration test pipeline
- **`.github/workflows/test-e2e.yml`**: E2E test pipeline
- **`.github/workflows/test-coverage.yml`**: Unified coverage reporting

#### Pipeline Characteristics

| Pipeline          | Trigger       | Services       | Duration | Artifacts                           |
| ----------------- | ------------- | -------------- | -------- | ----------------------------------- |
| Unit Tests        | Push/PR       | None           | <5 min   | Coverage, test results              |
| Integration Tests | Push/PR       | MongoDB        | <15 min  | Coverage, test results              |
| E2E Tests         | Push/PR/Daily | MongoDB, Redis | <30 min  | Coverage, test results, screenshots |
| Coverage Report   | Push to main  | MongoDB, Redis | <45 min  | Unified coverage report             |

#### Coverage Reporting

- **Codecov Integration**: Separate flags for each test type (`unit`, `integration`, `e2e`, `unified`)
- **Artifact Storage**: Coverage reports stored as GitHub Actions artifacts
- **PR Comments**: Automatic coverage summary comments on pull requests
- **Status Checks**: Individual status checks for each test type

### Affected-Based Testing

The pipelines use Nx's affected-based testing to only run tests for packages that have changed:

```bash
# Only run tests for affected packages
pnpm test:unit:affected
pnpm test:integration:affected
pnpm test:e2e:affected
```

This significantly reduces CI/CD execution time for incremental changes.

## Configuration

### AVA Configurations

- **`config/ava.unit.config.mjs`**: Unit test configuration
- **`config/ava.integration.config.mjs`**: Integration test configuration
- **`config/ava.e2e.config.mjs`**: E2E test configuration

### Coverage Configurations

- **`config/c8.unit.config.js`**: Unit test coverage settings
- **`config/c8.integration.config.js`**: Integration test coverage settings
- **`config/c8.e2e.config.js`**: E2E test coverage settings
- **`config/c8.unified.config.js`**: Unified coverage configuration

### Nx Configuration

The `nx.json` file includes separate targets for each test type:

```json
{
  "targetDefaults": {
    "test:unit": {
      "dependsOn": ["build"],
      "outputs": ["{projectRoot}/coverage/unit"]
    },
    "test:integration": {
      "dependsOn": ["build", "^build"],
      "outputs": ["{projectRoot}/coverage/integration"]
    },
    "test:e2e": {
      "dependsOn": ["build", "^build"],
      "outputs": ["{projectRoot}/coverage/e2e"]
    }
  }
}
```

## Best Practices

### Writing Tests

1. **Unit Tests**

   - Test single functions or classes
   - Mock external dependencies
   - Keep tests fast and focused
   - Use descriptive test names

2. **Integration Tests**

   - Test component interactions
   - Use real databases when possible
   - Test error scenarios and edge cases
   - Clean up test data after each test

3. **E2E Tests**
   - Test complete user workflows
   - Use the application like a real user
   - Test critical paths and happy paths
   - Include setup and teardown procedures

### File Organization

```
packages/example-package/
├── src/
│   ├── index.ts
│   └── utils.ts
├── src/tests/
│   ├── utils.unit.test.ts     # Unit tests
│   ├── integration.test.ts    # Integration tests
│   └── workflow.e2e.test.ts   # E2E tests
└── package.json
```

### Coverage Goals

- **Unit Tests**: Aim for high coverage (80%+) since they're cheap to write and maintain
- **Integration Tests**: Focus on critical integration points (75%+)
- **E2E Tests**: Focus on critical user journeys (60%+ is acceptable)

## Troubleshooting

### Common Issues

#### Tests Not Being Classified Correctly

1. Check the filename follows the naming convention
2. Verify the file is in the correct directory
3. Use the classifier CLI to debug: `node packages/test-classifier/dist/cli.js --verbose`

#### Coverage Reports Not Merging

1. Ensure all coverage types completed successfully
2. Check that coverage directories exist: `coverage/unit/`, `coverage/integration/`, `coverage/e2e/`
3. Run the merge script manually: `node scripts/merge-coverage.js`

#### CI/CD Pipeline Failures

1. Check service dependencies (MongoDB, Redis) are properly configured
2. Verify environment variables are set correctly
3. Review pipeline logs for specific error messages

### Debug Commands

```bash
# Check test classification
node packages/test-classifier/dist/cli.js --format json --verbose

# Verify AVA configuration
ava --config config/ava.unit.config.mjs --dry-run

# Test coverage generation
c8 --config config/c8.unit.config.js --dry-run

# Check Nx targets
nx show project <project-name> --web
```

## Performance Considerations

### Execution Time

- **Unit Tests**: <5 minutes for full workspace
- **Integration Tests**: <15 minutes for full workspace
- **E2E Tests**: <30 minutes for full workspace
- **Total Coverage**: <45 minutes for complete pipeline

### Optimization Strategies

1. **Use affected-based testing** for incremental changes
2. **Parallelize test execution** where possible
3. **Cache dependencies** and build artifacts
4. **Optimize test data setup** and teardown
5. **Use selective test execution** during development

## Monitoring and Alerting

### Coverage Trends

- Monitor coverage trends over time
- Set up alerts for coverage drops
- Track coverage by test type separately
- Focus on improving the weakest test type first

### Pipeline Health

- Monitor pipeline execution times
- Track flaky test failures
- Set up alerts for pipeline failures
- Regular maintenance of test infrastructure

## Future Enhancements

### Planned Features

1. **Test Impact Analysis**: Predict which tests to run based on code changes
2. **Parallel Pipeline Execution**: Run unit and integration tests in parallel
3. **Smart Test Selection**: Use ML to prioritize high-risk tests
4. **Coverage Visualization**: Interactive coverage reports and dashboards
5. **Test Performance Monitoring**: Track test execution times and identify slow tests

### Integration Opportunities

1. **IDE Integration**: VS Code extensions for test classification and execution
2. **Git Hooks**: Pre-commit hooks to run relevant tests
3. **Slack Notifications**: Pipeline status and coverage reports
4. **Dashboard Integration**: Real-time test metrics and coverage trends
