# Task: Implement Separate Test Coverage Pipelines for Integration, E2E, and Unit Testing

## UUID
550e8400-e29b-41d4-a716-446655440000

## Title
"Implement Separate Test Coverage Pipelines for Integration, E2E, and Unit Testing"

## Status
incoming

## Priority
P1

## Tags
[devops, testing, coverage, pipelines, ci-cd, type:infrastructure]

## Created
2025-10-13

## Assignee
devops-orchestrator

## Objective

Implement separate test coverage pipelines that provide visibility into test coverage quality across different testing levels (unit, integration, and end-to-end) for the Promethean Framework monorepo.

## Background

The current testing setup uses AVA with a single unified test pipeline that runs all tests together. This makes it difficult to understand which types of tests need attention and doesn't provide granular visibility into coverage quality across different testing levels. The team needs separate pipelines to:

1. Identify coverage gaps in specific testing categories
2. Enable targeted improvements for different test types
3. Provide better metrics for code quality assessment
4. Support the TDD-mandatory development approach

## Current State Analysis

Based on repository analysis:
- **Test Runner**: AVA with centralized configuration in `config/ava.config.mjs`
- **Build System**: Nx monorepo with affected-based testing
- **CI/CD**: GitHub Actions with single test workflow in `.github/workflows/test.yml`
- **Test Distribution**: ~100+ test files across 50+ packages
- **Test Types Identified**:
  - Unit tests: Individual component/function testing (e.g., `packages/utils/src/tests/*.test.ts`)
  - Integration tests: Cross-package functionality (e.g., `packages/omni-service/src/tests/integration.test.ts`)
  - E2E tests: Full workflow testing (e.g., `packages/buildfix/src/tests/integration/*.test.ts`)

## Technical Requirements

### 1. Test Classification System
- Implement naming conventions and directory structure for test categorization
- Create test type detection logic based on file patterns and content analysis
- Support legacy test files during migration period

### 2. Separate Pipeline Configuration
- **Unit Test Pipeline**: Fast, isolated component testing
- **Integration Test Pipeline**: Cross-package dependency testing
- **E2E Test Pipeline**: Full workflow and system testing
- Maintain existing Nx affected-based execution for efficiency

### 3. Coverage Reporting
- Separate coverage reports for each test type
- Unified coverage dashboard combining all types
- Coverage thresholds and quality gates per test type
- Integration with existing tooling (AVA, Nx)

### 4. CI/CD Integration
- Separate GitHub Actions workflows for each test type
- Conditional execution based on file changes
- Parallel execution where possible
- Proper failure handling and reporting

## Implementation Approach

### Phase 1: Test Classification Infrastructure
1. **Create Test Type Detection Package**
   - New package: `@promethean/test-classifier`
   - Analyze test files for patterns indicating test type
   - Support configuration-based classification rules
   - Provide CLI for batch classification

2. **Establish Naming Conventions**
   - Unit: `*.unit.test.ts`, `*.unit.spec.ts`
   - Integration: `*.integration.test.ts`, `*.integration.spec.ts`
   - E2E: `*.e2e.test.ts`, `*.e2e.spec.ts`, `*.workflow.test.ts`
   - Directory-based: `tests/unit/`, `tests/integration/`, `tests/e2e/`

3. **Migration Strategy**
   - Auto-classify existing tests based on content analysis
   - Create migration script for bulk renaming
   - Support legacy patterns during transition

### Phase 2: Pipeline Configuration
1. **Extend Nx Configuration**
   - Add separate targets: `test:unit`, `test:integration`, `test:e2e`
   - Configure proper dependencies between targets
   - Update caching strategy for different test types

2. **AVA Configuration Extensions**
   - Separate AVA configs for each test type
   - Different timeout and concurrency settings
   - Type-specific mock and setup configurations

3. **Coverage Configuration**
   - Separate c8/nyc configurations per test type
   - Unified coverage report generation
   - Coverage thresholds and reporting

### Phase 3: CI/CD Workflows
1. **GitHub Actions Workflows**
   - `test-unit.yml`: Fast unit test pipeline
   - `test-integration.yml`: Integration test pipeline
   - `test-e2e.yml`: End-to-end test pipeline
   - `test-coverage.yml`: Unified coverage reporting

2. **Conditional Execution**
   - File change detection for pipeline triggering
   - Affected-based package selection
   - Parallel execution optimization

3. **Reporting and Notifications**
   - Separate status checks per test type
   - Coverage trend reporting
   - Integration with existing monitoring

## Success Criteria

### Functional Requirements
- [ ] All existing tests continue to pass without modification
- [ ] Separate pipelines execute correctly for each test type
- [ ] Coverage reports generated separately and unified
- [ ] CI/CD workflows provide clear visibility into test type failures
- [ ] Performance impact is minimal (pipelines complete within current timeframes)

### Quality Requirements
- [ ] Test classification accuracy >95%
- [ ] Coverage reporting includes type-specific metrics
- [ ] Zero regression in existing test coverage
- [ ] Clear documentation for test type guidelines

### Operational Requirements
- [ ] Migration path for existing tests is smooth
- [ ] Developer workflow remains simple
- [ ] Monitoring and alerting for pipeline health
- [ ] Rollback capability if issues arise

## Technical Constraints

### Repository Conventions
- Follow existing monorepo structure and patterns
- Use existing tooling (AVA, Nx, pnpm) where possible
- Maintain TDD-mandatory development approach
- Prefer small, auditable changes over grand rewrites
- Add changelog entries for all changes

### Performance Constraints
- Unit test pipeline: <5 minutes execution
- Integration test pipeline: <15 minutes execution
- E2E test pipeline: <30 minutes execution
- Coverage reporting: <5 minutes generation

### Compatibility Constraints
- Support existing test file patterns during migration
- Maintain backward compatibility with current workflows
- Work with existing container and caching infrastructure

## Dependencies

### Technical Dependencies
- Nx workspace configuration updates
- AVA configuration extensions
- GitHub Actions workflow modifications
- Coverage reporting tooling (c8/nyc)

### Process Dependencies
- Team alignment on test classification guidelines
- Documentation updates for development workflow
- Training materials for test type conventions

## Risk Mitigation

### Technical Risks
- **Test Classification Errors**: Implement validation and manual override capabilities
- **Pipeline Performance**: Use affected-based execution and parallel processing
- **Coverage Reporting Complexity**: Start with basic reporting, enhance iteratively

### Process Risks
- **Developer Adoption**: Provide clear documentation and migration tools
- **Legacy Test Support**: Maintain compatibility during transition period
- **Workflow Disruption**: Implement gradual rollout with rollback capability

## Deliverables

### Code Deliverables
1. `@promethean/test-classifier` package with classification logic
2. Updated Nx configuration with separate test targets
3. AVA configuration files for each test type
4. GitHub Actions workflows for separate pipelines
5. Coverage reporting configuration and scripts
6. Migration utilities for existing test files

### Documentation Deliverables
1. Test classification guidelines and conventions
2. Updated development workflow documentation
3. CI/CD pipeline documentation
4. Migration guide for existing tests
5. Coverage reporting interpretation guide

### Configuration Deliverables
1. Nx target configurations
2. AVA configuration files
3. Coverage reporting settings
4. GitHub Actions workflow definitions
5. Test classification rule configuration

## Timeline Estimate

- **Phase 1** (Classification Infrastructure): 3-4 days
- **Phase 2** (Pipeline Configuration): 2-3 days  
- **Phase 3** (CI/CD Integration): 2-3 days
- **Testing & Validation**: 2 days
- **Documentation & Migration**: 2 days

**Total Estimated Effort**: 11-14 days

## Acceptance Criteria

1. **Pipeline Separation**: Three distinct test pipelines (unit, integration, e2e) execute independently
2. **Coverage Visibility**: Separate and unified coverage reports provide clear insights into test quality
3. **Developer Experience**: Simple commands exist for running each test type locally
4. **CI/CD Integration**: GitHub Actions provide clear status checks per test type
5. **Migration Success**: All existing tests are properly classified and continue to pass
6. **Performance**: Pipeline execution times meet defined constraints
7. **Documentation**: Complete documentation exists for all new processes and conventions

## Next Steps

1. Validate test classification approach with team
2. Create `@promethean/test-classifier` package skeleton
3. Implement test type detection logic
4. Update Nx configuration for separate targets
5. Create AVA configurations for each test type
6. Develop GitHub Actions workflows
7. Implement coverage reporting
8. Create migration utilities
9. Update documentation
10. Roll out to team with training

## Notes

This implementation follows the repository's conventions:
- Uses existing tooling stack (AVA, Nx, pnpm)
- Maintains functional programming principles
- Implements TDD approach throughout
- Provides migration path rather than breaking changes
- Includes comprehensive documentation
- Uses small, auditable changes approach
- Adds changelog entries for all modifications