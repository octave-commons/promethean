# Cephalon Code Style & Conventions

## TypeScript Usage
- **ESM modules** with `.js` extensions in imports
- **Strict typing** with some `any` usage in legacy integration points
- **Async/await** patterns throughout
- **Functional programming** preferred over object-oriented

## Naming Conventions
- **camelCase** for variables and functions
- **PascalCase** for classes and types
- **kebab-case** for file names
- **UPPER_SNAKE_CASE** for environment variables and constants

## Import Patterns
- **Workspace dependencies** using `@promethean/*` with `workspace:*` in package.json
- **Explicit file extensions** (.js) required for ESM
- **Path aliases** configured in tsconfig.json for cleaner imports

## Error Handling
- **Try-catch blocks** with meaningful error messages
- **Console logging** for debugging (extensive use of console.log/warn/error)
- **Graceful degradation** in optional features (e.g., ENSO bridge)
- **Empty catch blocks** in some places for non-critical operations

## Code Organization
- **Modular structure** with clear separation of concerns
- **Factory functions** for object creation
- **Event-driven architecture** with EventEmitter patterns
- **Dependency injection** through constructor parameters

## Testing
- **AVA test runner** with comprehensive test coverage
- **Mock implementations** for external dependencies
- **Integration tests** for end-to-end workflows
- **Security-focused tests** for prompt injection detection

## Documentation
- **JSDoc comments** for public APIs
- **Type definitions** for interfaces and types
- **README documentation** with usage examples
- **Inline comments** for complex logic

## Security Considerations
- **Input validation** and sanitization
- **Prompt injection detection** and prevention
- **Environment variable** usage for sensitive configuration
- **Permission checks** for Discord commands