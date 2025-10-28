# Functional Framework Migration Scope Analysis

## Current State
- **Total Classes**: 706 exported classes across 544 TypeScript files
- **Pantheon Package**: 5 main classes identified for conversion
  - `PantheonError` (utils/index.ts)
  - `SessionManager` (auth/session-manager.ts) 
  - `CliAuthManager` (auth/auth-middleware.ts)
  - `JwtHandler` (auth/jwt-handler.ts)
  - Mock error classes in tests

## Migration Categories
1. **Error Handling Classes**: Convert to functional error creators
2. **Authentication/Authorization Classes**: Convert to functional auth actions
3. **Session Management Classes**: Convert to functional session operations
4. **Service/Manager Classes**: Convert to functional service patterns
5. **Test Helper Classes**: Convert to functional test utilities

## Conversion Patterns
- Classes → Typeclasses (categories of functionality)
- Methods → Pure functions with explicit inputs/outputs
- Constructors → Factory functions
- Instance variables → Immutable data structures
- Inheritance → Function composition
- `this` keyword → Explicit parameters

## Priority Levels
- **High**: Core authentication, session management, error handling
- **Medium**: Service classes, utility classes
- **Low**: Test helper classes, mock implementations

## Dependencies
- Authentication depends on JWT handling
- Session management depends on authentication
- Error handling is foundational to all other conversions