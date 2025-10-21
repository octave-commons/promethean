# P0 Security Task Validation Gate

## Overview

The P0 Security Task Validation Gate is a comprehensive security validation system that ensures all P0 priority security tasks meet strict security requirements before advancing through the kanban workflow. This system prevents security vulnerabilities from being inadequately addressed and maintains high security standards across the Promethean Framework.

## Features

### 🔍 Automated Validation
- **Implementation Plan Validation**: Ensures P0 tasks have detailed implementation plans
- **Code Changes Verification**: Validates that committed code changes exist for the task
- **Security Review Enforcement**: Requires completed security review before testing
- **Test Coverage Requirements**: Mandates comprehensive test coverage plans
- **Documentation Validation**: Ensures documentation is updated before completion

### 🛡️ Security-Focused
- **Git Integration**: Analyzes commit history for task-related changes
- **Content Analysis**: Scans task files for required security information
- **Label-Based Validation**: Recognizes security tasks through labels and content
- **Multi-Format Support**: Handles various status naming conventions

### ⚡ Performance Optimized
- **Sub-Second Validation**: Completes validation within 2 seconds
- **Efficient Git Operations**: Uses optimized git commands with caching
- **Graceful Error Handling**: Degrades gracefully when external systems fail
- **Minimal Overhead**: Adds negligible delay to kanban operations

## Installation

The P0 security validation is integrated into the kanban system automatically. No additional installation is required.

## Usage

### Basic Validation

The validation system automatically activates when:
- A task has `priority: P0`
- The task has `security` labels or security-related keywords in the title
- A status transition is attempted via the kanban CLI

```bash
# This will trigger P0 validation if the task is a P0 security task
pnpm kanban update-status <task-uuid> in_progress
```

### Validation Requirements

#### Todo → In Progress Requirements
- ✅ **Implementation Plan**: Task must contain detailed implementation approach
- ✅ **Code Changes**: Committed changes must reference the task

#### In Progress → Testing Requirements
- ✅ **Security Review**: Must have completed security review
- ✅ **Test Coverage**: Must define comprehensive test coverage

#### Review → Done Requirements
- ✅ **Documentation**: Documentation must be updated

### Task File Format

Tasks should include the following sections to pass validation:

```markdown
---
uuid: your-task-uuid
title: Fix critical security vulnerability
priority: P0
labels: [security, security-reviewed]
---

# Fix Critical Security Vulnerability

## Implementation Plan
1. Identify the root cause
2. Implement proper input validation
3. Add security tests
4. Update documentation

## Security Review
Security review completed by Security Team:
- ✅ Input validation properly implemented
- ✅ No new attack vectors introduced
- ✅ Code follows security best practices

## Test Coverage
### Unit Tests
- Test input validation functions
- Test error handling

### Security Tests
- Test for injection attacks
- Test for authentication bypass

## Documentation
- API documentation updated
- README.md updated with security guidelines
```

## Configuration

### Environment Variables

```bash
# Skip git checks (for testing environments)
KANBAN_SKIP_GIT_CHECKS=true

# Skip file checks (for testing environments)
KANBAN_SKIP_FILE_CHECKS=true
```

### Programmatic Usage

```typescript
import { createP0SecurityValidator } from '@promethean/kanban/validation';

const validator = createP0SecurityValidator({
  repoRoot: '/path/to/repo',
  tasksDir: '/path/to/tasks',
  skipGitChecks: false,
  skipFileChecks: false
});

const result = await validator.validateStatusTransition(
  task,
  'todo',
  'in_progress'
);

if (!result.valid) {
  console.error('Validation failed:', result.errors);
}
```

## Validation Rules

### Task Classification

A task is considered a P0 security task if it meets ANY of these criteria:
- `priority: P0` AND has `security` label
- `priority: P0` AND title contains "security", "vulnerability", or "fix"
- Has `security-gates` label

### Status Transition Rules

| From | To | Requirements |
|-------|-----|-------------|
| todo | in_progress | Implementation plan + Code changes |
| in_progress | testing | Security review + Test coverage |
| review | done | Documentation |

### Git Integration

The system analyzes git commits for:
- Commit messages containing task UUID
- Commit messages containing task title keywords
- Security-related file changes
- Repository state validation

## Error Messages

### Common Validation Errors

```
❌ P0 security tasks require an implementation plan before starting work
❌ P0 security tasks require committed code changes to move to in-progress
❌ P0 security tasks require completed security review before testing
❌ P0 security tasks require defined test coverage plan before testing
❌ P0 security tasks require updated documentation before completion
```

### Warning Messages

```
⚡ Consider adding an implementation plan to improve task clarity
⚡ Code changes should be committed before status transitions
⚡ Security review should be completed before testing phase
⚡ Test coverage plan helps ensure comprehensive validation
⚡ Documentation updates help maintain system knowledge
```

## Testing

### Unit Tests
```bash
# Run P0 security validation tests
pnpm test packages/kanban/src/lib/validation/p0-security-validator.test.ts
```

### Integration Tests
```bash
# Run integration tests
pnpm test packages/kanban/src/lib/validation/integration.test.ts
```

### Manual Testing

```bash
# Create a P0 security task
pnpm kanban create "Test P0 security fix" --priority P0 --labels security

# Try to move it without implementation plan (should fail)
pnpm kanban update-status <task-uuid> in_progress

# Add implementation plan and try again (should fail due to missing code changes)
# Add code changes and try again (should succeed)
```

## Troubleshooting

### Common Issues

#### Validation Fails Unexpectedly
1. Check that task file contains required sections
2. Verify git commits reference the task
3. Ensure security review is documented
4. Confirm test coverage is defined

#### Performance Issues
1. Check git repository size (large repos may be slow)
2. Verify file system performance
3. Consider skipping git checks for testing

#### Git Integration Problems
1. Ensure you're in a git repository
2. Check git configuration
3. Verify commit history exists

### Debug Mode

Enable debug logging:
```bash
DEBUG=kanban:* pnpm kanban update-status <task-uuid> in_progress
```

## API Reference

### P0SecurityValidator

#### Constructor Options
- `repoRoot`: Git repository root directory
- `tasksDir`: Tasks directory path
- `skipGitChecks`: Skip git validation (testing only)
- `skipFileChecks`: Skip file validation (testing only)

#### Methods
- `isP0SecurityTask(task)`: Check if task is P0 security task
- `validateStatusTransition(task, fromStatus, toStatus)`: Validate transition
- `checkImplementationPlan(task)`: Check for implementation plan
- `checkCodeChanges(task)`: Check for committed code changes
- `checkSecurityReview(task)`: Check for security review
- `checkTestCoverage(task)`: Check for test coverage
- `checkDocumentation(task)`: Check for documentation

### GitValidator

#### Methods
- `hasCodeChanges(options)`: Check for task-related code changes
- `getTaskCommits(options)`: Get task-related commits
- `getCommitFiles(commitHash)`: Get files changed in commit
- `hasSecurityFileChanges(commits)`: Check for security file changes
- `validateRepoState()`: Validate repository state

## Contributing

When contributing to the P0 security validation system:

1. **Add Tests**: Ensure comprehensive test coverage
2. **Update Documentation**: Keep this README current
3. **Performance Testing**: Validate performance impact
4. **Security Review**: All changes must pass security review

## Security Considerations

- **Input Validation**: All inputs are validated before processing
- **Path Traversal Protection**: File access is restricted to allowed directories
- **Command Injection Prevention**: Git commands use parameterized execution
- **Error Information**: Error messages don't expose sensitive information

## License

This validation system is part of the Promethean Framework and follows the same licensing terms.