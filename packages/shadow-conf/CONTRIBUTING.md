# Contributing to @promethean/shadow-conf

Thank you for your interest in contributing to @promethean/shadow-conf! This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Git
- Basic knowledge of TypeScript and EDN format

### Development Setup

1. **Fork and Clone**

```bash
git clone https://github.com/your-username/shadow-conf.git
cd shadow-conf
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Run Tests**

```bash
pnpm test
```

4. **Build the Package**

```bash
pnpm build
```

## 🏗 Project Structure

```
src/
├── ecosystem.ts          # Core generation logic
├── edn.ts               # EDN parsing and normalization
├── index.ts             # Public API exports
├── bin/
│   └── shadow-conf.ts   # CLI implementation
└── tests/
    └── ecosystem.test.ts # Test suite
```

### Key Components

- **ecosystem.ts**: Main logic for generating PM2 configurations from EDN files
- **edn.ts**: EDN parsing utilities using jsedn library
- **bin/shadow-conf.ts**: Command-line interface implementation
- **tests/**: Comprehensive test suite

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm coverage

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test src/tests/ecosystem.test.ts
```

### Writing Tests

We use AVA for testing. Tests should be:

- **Descriptive**: Use clear test descriptions
- **Isolated**: Each test should be independent
- **Comprehensive**: Cover edge cases and error conditions

#### Test Structure

```typescript
import test from 'ava';

test('description of what is being tested', async (t) => {
  // Arrange
  const input = /* test data */;
  
  // Act
  const result = await functionUnderTest(input);
  
  // Assert
  t.deepEqual(result, expected);
});
```

#### Test Utilities

Use the existing test utilities in `src/tests/ecosystem.test.ts`:

```typescript
// Create temporary directories with EDN files
const tmpDir = await mkdtemp(path.join(os.tmpdir(), "shadow-conf-"));

// Write test EDN files
await writeServiceEcosystem(tmpDir, "service-name", ednContent);

// Clean up after tests
// Note: Use proper cleanup in test teardown
```

### Test Categories

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test the complete generation workflow
3. **CLI Tests**: Test command-line interface functionality
4. **Error Handling Tests**: Test error conditions and edge cases

## 📝 Code Style

### TypeScript Guidelines

- Use **strict TypeScript** configuration
- Provide **comprehensive type definitions**
- Use **readonly** types where appropriate
- Include **JSDoc comments** for all public APIs

#### Example

```typescript
/**
 * Description of what the function does.
 * 
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 * 
 * @example
 * ```typescript
 * const result = functionName('input', { option: true });
 * ```
 * 
 * @throws {Error} When invalid input is provided
 */
export async function functionName(
  param1: string,
  param2: Readonly<Options>
): Promise<Readonly<Result>> {
  // Implementation
}
```

### Code Organization

- **Functional programming**: Prefer pure functions
- **Immutable data**: Use readonly types and avoid mutation
- **Error handling**: Use descriptive error messages
- **Type safety**: Leverage TypeScript's type system

### Naming Conventions

- **Functions**: camelCase with descriptive names
- **Types**: PascalCase for interfaces and types
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for files, PascalCase for types

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Changes

- Follow the existing code style
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Run Quality Checks

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format

# Full test suite
pnpm test
```

### 4. Commit Changes

Use conventional commits:

```bash
# Feature
git commit -m "feat: add support for custom automation types"

# Bug fix
git commit -m "fix: resolve path normalization issue with nested directories"

# Documentation
git commit -m "docs: update API documentation for new options"

# Tests
git commit -m "test: add integration tests for CLI functionality"
```

### 5. Create Pull Request

- Provide a clear description of changes
- Link to relevant issues
- Include screenshots if applicable
- Ensure CI checks pass

## 🐛 Bug Reports

### Reporting Bugs

1. **Check existing issues** first
2. **Use the bug report template**
3. **Provide minimal reproduction case**
4. **Include environment information**

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.17.0]
- Package version: [e.g., 1.2.3]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Requesting Features

1. **Check existing issues** and discussions
2. **Use the feature request template**
3. **Provide use case and motivation**
4. **Consider implementation complexity**

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Motivation
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should the feature work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information or examples
```

## 📚 Documentation

### Types of Documentation

1. **API Documentation**: JSDoc comments in source code
2. **README.md**: User-facing documentation
3. **CONTRIBUTING.md**: Development guidelines
4. **Code Comments**: Implementation details

### Documentation Guidelines

- **Keep it current**: Update docs with code changes
- **Include examples**: Show practical usage
- **Be comprehensive**: Cover edge cases and errors
- **Use consistent formatting**: Follow existing style

## 🏷 Release Process

### Version Management

We follow semantic versioning:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md** with changes
3. **Run full test suite**
4. **Build package**
5. **Create git tag**
6. **Publish to npm**

## 🔍 Code Review

### Review Guidelines

When reviewing pull requests:

1. **Functionality**: Does it work as intended?
2. **Code quality**: Is it well-written and maintainable?
3. **Tests**: Are tests comprehensive and passing?
4. **Documentation**: Is documentation updated?
5. **Performance**: Any performance implications?

### Review Process

1. **Automated checks**: CI/CD pipeline
2. **Peer review**: At least one maintainer approval
3. **Testing**: Manual verification if needed
4. **Documentation**: Review documentation changes

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord**: For real-time conversation (if available)

## 🛠 Development Tools

### Recommended VS Code Extensions

- **TypeScript Importer**: Auto-import TypeScript modules
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Test Explorer UI**: Test runner interface

### Useful Commands

```bash
# Development build with watch mode
pnpm build --watch

# Run specific test
pnpm test --match="*specific test*"

# Check for outdated dependencies
pnpm outdated

# Update dependencies
pnpm update

# Audit for security vulnerabilities
pnpm audit
```

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
```

## 🎯 Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` for beginner-friendly contributions:

- Documentation improvements
- Test coverage enhancements
- Small bug fixes
- Code refactoring

### Advanced Contributions

More complex areas for experienced contributors:

- Core algorithm improvements
- New automation types
- Performance optimizations
- CLI enhancements

## 📞 Getting in Touch

- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas
- **Maintainers**: Tag specific maintainers for urgent issues

Thank you for contributing to @promethean/shadow-conf! Your contributions help make this project better for everyone. 🎉