# Code Style & Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive type checking
- **Module System**: ESNext with nodenext resolution
- **Target**: ESNext with modern JavaScript features
- **Type Definitions**: Prefer `type` over `interface` (per linting rules)
- **Import Style**: Organized imports with proper grouping

## Linting Rules (Current Issues)
The package has several linting violations that need addressing:

### Critical Issues:
- **Interface vs Type**: Multiple interfaces should be converted to types
- **Complexity**: Functions exceed cognitive complexity limits (15-24 range)
- **File Length**: Several files exceed 300-line limit
- **Function Length**: Multiple functions exceed 50-line limit
- **Unsafe Operations**: Various `any` types and unsafe operations

### Style Requirements:
- **Consistent Type Definitions**: Use `type` instead of `interface`
- **Import Organization**: Proper import grouping and ordering
- **Async/Await**: Remove unnecessary `await` expressions
- **Complexity Management**: Refactor complex functions into smaller units

## Code Patterns
- **Functional Programming**: Preferred over object-oriented approaches
- **Immutable Data**: No in-place object mutations
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Validation**: Zod schemas for runtime type validation
- **Streaming**: Async generators for streaming responses

## Testing Conventions
- **AVA Framework**: Used for all testing
- **Test Structure**: Comprehensive test coverage with edge cases
- **Mock Objects**: Proper mocking for external dependencies
- **Async Testing**: Proper async/await patterns in tests

## Documentation Patterns
- **JSDoc**: Limited usage, could be improved
- **Type Documentation**: Good type-level documentation
- **Comments**: Minimal inline comments
- **Examples**: Good examples in test files