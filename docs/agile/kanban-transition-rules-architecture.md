# Kanban Transition Rules Architecture

## Overview

The Promethean kanban system uses **ClojureScript-only transition rules** implemented through a Clojure DSL evaluated via nbb (Node.js Babashka). This architecture provides:

- **Declarative rule definitions** in Clojure
- **Functional composition** for complex validation logic  
- **Runtime evaluation** without TypeScript compilation
- **Single source of truth** for all transition logic

## Architecture Components

### 1. Clojure DSL (`docs/agile/rules/kanban-transitions.clj`)

**Purpose**: Defines all transition validation logic in pure Clojure functions.

**Key Features**:
- Column normalization and workflow ordering
- Priority-based validation (P0-P3)
- Story point and estimate validation
- WIP limit enforcement with P0 bypass
- Tool/environment tag requirements for active work
- Comprehensive testing validation with coverage/quality thresholds

**Structure**:
```clojure
(ns kanban-transitions
  "Kanban transition rules DSL using Clojure + Babashka NBB"
  (:require [clojure.string :as str]))

;; Helper functions
(defn column-key [col-name] ...)
(defn get-priority-numeric [priority] ...)

;; Transition validation functions
(defn triage-completed? [task board] ...)
(defn breakdown-complete? [task board] ...)
(defn comprehensive-testing-validation? [task board] ...)

;; Global rules
(defn wip-limits [from-to task board] ...)
(defn task-existence [from-to task board] ...)

;; Main evaluation function
(defn evaluate-transition [from to task board] ...)
```

### 2. TypeScript Engine (`packages/kanban/src/lib/transition-rules.ts`)

**Purpose**: Provides the runtime interface for evaluating Clojure rules from Node.js.

**Key Responsibilities**:
- Load and initialize Clojure DSL
- Convert JavaScript objects to Clojure-compatible format
- Execute Clojure functions via nbb
- Handle errors and provide meaningful feedback
- Enforce mandatory DSL requirement

**Critical Design Decision**: **No TypeScript fallback logic** - the system requires the Clojure DSL to function.

## Implementation Details

### nbb Integration

The system uses **nbb (Node.js Babashka)** for Clojure evaluation:

```typescript
// Load nbb dynamically
const { default: nbb } = await import('nbb');

// Load and evaluate Clojure DSL
const dslCode = await readFile(this.config.dslPath!, 'utf-8');
const result = await nbb(clojureCode);
```

### Object Conversion

JavaScript objects are converted to Clojure maps for evaluation:

```typescript
const clojureCode = `
  ${dslCode}
  
  (def task-clj {:uuid "${task.uuid}"
                 :title "${task.title}"
                 :priority "${task.priority}"
                 ...})
  
  (def board-clj {:columns [...]})
  
  (let [task task-clj board board-clj]
    ${ruleImpl})
`;
```

### Error Handling

The system provides **strict error handling** with no fallback:

```typescript
if (!this.dslAvailable) {
  throw new Error(
    'Clojure DSL is required but not available. TypeScript transition rules are no longer supported.',
  );
}
```

## Rule Categories

### 1. Transition-Specific Rules

Each transition has dedicated validation functions:

- `triage-completed?` - Incoming → Accepted
- `breakdown-complete?` - Breakdown → Ready  
- `implementation-complete?` - In Progress → Testing
- `comprehensive-testing-validation?` - Testing → Review
- `reviewable-change-exists?` - Review → Document

### 2. Global Rules

Applied to **all transitions**:

- `wip-limits` - Enforce column capacity (P0 tasks bypass)
- `task-existence` - Verify task exists in source column
- `has-tool-env-tags?` - Require tool/environment tags for In Progress

### 3. Special Validations

- **Story points**: Required for Breakdown → Ready transitions
- **Coverage thresholds**: 90% minimum for Testing → Review
- **Quality scores**: 75% minimum for Testing → Review
- **Correction limits**: Max 3 corrections from Done → Review

## Configuration

### Required Configuration

The system **requires** a valid Clojure DSL path:

```json
{
  "transitionRules": {
    "enabled": true,
    "enforcement": "strict",
    "dslPath": "docs/agile/rules/kanban-transitions.clj"
  }
}
```

### Initialization

```typescript
const engine = new TransitionRulesEngine(config);
await engine.initialize(); // Throws if DSL not found
```

## Migration from TypeScript

### Previous State (Deprecated)

The system previously had **dual implementation**:
- TypeScript hardcoded logic in `evalClojure()` method
- Clojure DSL (unused)
- Fallback to TypeScript when DSL unavailable

### Current State (ClojureScript Only)

- **Single implementation**: Clojure DSL only
- **No fallback**: System fails fast if DSL unavailable
- **Mandatory evaluation**: All transitions go through Clojure

### Benefits

1. **Single source of truth** - No logic duplication
2. **Functional clarity** - Declarative rule definitions
3. **Runtime flexibility** - Rules can be changed without TypeScript compilation
4. **Better testing** - Pure functions are easier to test
5. **Maintainability** - All logic in one language and file

## Testing Strategy

### Unit Testing

Test Clojure functions directly:

```clojure
(deftest test-comprehensive-testing-validation
  (testing "Valid coverage and quality"
    (let [task {:content "coverage-report: coverage.lcov\ncoverage-percent: 95\nquality-score: 80"}
          board {}]
      (is (true? (comprehensive-testing-validation? task board)))))
  
  (testing "Insufficient coverage"
    (let [task {:content "coverage-report: coverage.lcov\ncoverage-percent: 85\nquality-score: 80"}
          board {}]
      (is (false? (comprehensive-testing-validation? task board)))))
)
```

### Integration Testing

Test TypeScript engine with Clojure evaluation:

```typescript
const result = await engine.validateTransition('testing', 'review', task, board);
expect(result.allowed).toBe(true);
```

## Debugging

### Clojure Debug Functions

The DSL provides debug utilities:

```clojure
(defn debug-transition [from to task board]
  {:from from
   :to to
   :wip-check (wip-limits [from to] task board)
   :existence-check (task-existence [from to] task board)
   :valid-transitions (valid-transitions-from from board)})
```

### TypeScript Debug Interface

```typescript
const debug = await engine.debugTransition(from, to, task, board);
console.log('WIP Check:', debug.wipCheck);
console.log('Valid Transitions:', debug.validTransitions);
```

## Future Enhancements

### Potential Improvements

1. **Hot reloading** - Watch DSL file for changes
2. **Rule composition** - Combine multiple validation functions
3. **Metrics collection** - Track rule execution performance
4. **Visual debugging** - Web interface for rule testing
5. **Rule versioning** - Support multiple rule sets

### Extension Points

The architecture supports:

- **New transition functions** - Add to Clojure DSL
- **Custom global rules** - Implement `wip-limits` pattern
- **Enhanced validation** - Leverage existing helper functions
- **Integration hooks** - Connect to external systems

## Conclusion

The ClojureScript-only transition rules architecture provides a robust, maintainable foundation for kanban workflow enforcement. By eliminating TypeScript fallback logic and centralizing all rule definitions in the Clojure DSL, the system achieves better consistency, testability, and flexibility while maintaining strict validation requirements.

The mandatory nature of the Clojure DSL ensures that all transitions are evaluated through the same functional, declarative logic, eliminating the possibility of inconsistent behavior between different implementation paths.