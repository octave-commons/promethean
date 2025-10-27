# Unified Indexer Linting Issues Plan

## Issue Categories (100+ total issues)

### 🔴 High Priority Issues

#### 1. Import Ordering Issues
- Missing empty lines between import groups
- Incorrect import order (type vs regular imports)
- Files: All source files
- Impact: Code organization

#### 2. TypeScript Type Safety Issues  
- Multiple `any` type usage (unsafe)
- Missing return type annotations
- Unsafe member access on `any` values
- Files: `unified-indexer-service.ts`, `cross-domain-scoring.ts`
- Impact: Type safety and reliability

#### 3. Functional Programming Immutability Issues
- Parameters need `readonly` types
- Return types need `ReadonlyDeep` instead of `ReadonlyShallow`/`Mutable`
- Files: All source files
- Impact: Functional programming compliance

### 🟡 Medium Priority Issues

#### 4. Functional Programming Pattern Issues
- `try-catch` statements (should use functional error handling)
- `for` loops (should use `map`/`reduce`)
- Data mutations (modifying arrays/objects)
- Files: `cross-domain-processing.ts`, `unified-indexer-example.ts`, `unified-indexer-service.ts`

#### 5. Code Structure Issues
- Function too long (`createUnifiedIndexingClient` has 132 lines, max 50)
- Complex cognitive complexity
- Files: `unified-indexer-service.ts`

## Fix Order
1. TypeScript errors (type safety)
2. Import ordering (easy wins)
3. Immutability types (functional compliance)
4. Functional patterns (code style)
5. Code structure (refactoring)

## Statistics
- Critical errors: ~15 TypeScript safety issues
- Files needing fixes: 7 source files
- Most affected: `unified-indexer-service.ts` (40+ issues)