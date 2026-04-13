# Linear-a Lisp Dialect

**Version**: 0.1.0 (Draft)
**Status**: Speculative
**Purpose**: Universal translation layer compiling natural language to runnable code via WASM.

---

## Overview

Linear-a is a Clojure-based universal translation layer that:

1. Accepts natural language specifications
2. Converts programs using LLM-assisted pattern extraction
3. Compiles to JS/WASM with guaranteed observable equivalence
4. Provides reversible translation to any target language

The guarantee is not readability—the guarantee is **same observables regardless of runtime target**.

---

## Core Concepts

### The DSL

A Clojure dialect with "an absurd number of macros":

```clojure
;; Example: defining a spec
(defspec user-auth
  "User authentication flow"
  :inputs [{:user/id :string} {:password :string}]
  :outputs {:session/token :string}
  :constraints
    [(fn [ctx] (pos? (count (:user/id ctx))))
     (fn [ctx] (> (count (:password ctx)) 7))]
  :impl
    {:check-credentials (fn [user password] ...)
     :generate-token (fn [user] ...)
     :store-session (fn [token] ...)})
```

### Compilation Pipeline

```
Natural Language Spec
        │
        ▼
┌──────────────────┐
│  LLM Extraction  │  ← Extract intent, constraints, tests
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Linear-a AST    │  ← Intermediate representation
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  WASM Target     │  ← Primary compilation target
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Observable Test │  ← Verify equivalence
└────────┬─────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  JS Target       │   │  Python Target   │
└──────────────────┘   └──────────────────┘
```

### Pattern Extraction

The system finds **nameable patterns shared between languages**:

1. Compile corpus of programs in multiple languages
2. Extract patterns using ML techniques
3. Create reversible WASM patterns
4. Allow any language with `:oop` aspect to understand via translation layers

```clojure
;; Pattern: map/transform collection
{:pattern/name 'map
 :pattern/signature (fn [coll f] -> coll)
 :pattern/impl
   {:clojure '(map f coll)
    :js 'coll.map(f)'
    :python 'map(f, coll)'
    :wasm '(call $map (local.get $f) (local.get $coll))'}}
```

---

## Agent Workflow

The specification authoring process is automated:

```
1. Author writes natural language in timestamped note
2. Agent extracts intent using embeddings context
3. Agent generates Linear-a spec
4. Agent runs tests to verify
5. Agent saves reasoning trace
6. ACO optimizes path for future runs
7. Train models on optimized result
```

### Document Assembly

```
specs/           ← Deliverable results
tasks/           ← Pieces of work
designs/         ← High-level guidance
reports/         ← Agent examination results
reviews/         ← Human/agent reviews
```

### Session Handoff

```
natural language → Linear-a → WASM → observable tests
                                      │
                                      ▼
                              reasoning trace
                                      │
                                      ▼
                              ACO path optimization
```

---

## REPL Integration

The prompter system is a REPL in this environment:

```clojure
;; Start a spec compilation
(lineara/compile-spec
  {:input "User authentication flow"
   :tests ["login fails with wrong password"
           "login succeeds with correct password"
           "session expires after timeout"]
   :targets [:wasm :js :python]})
```

### OpenCode Plugin

The DSL can be replicated as an OpenCode plugin:

```clojure
;; opencode plugin definition
(defplugin lineara
  :grammar {:spec "defspec"
            :impl "defimpl"
            :test "deftest"}
  :hooks {:on-save (fn [file] (compile-spec file))
          :on-run (fn [spec] (run-tests spec))})
```

---

## Lossless Trace

Every compilation produces a trace:

```
specs/user-auth.linear-a
tasks/user-auth-001.extract-intent
tasks/user-auth-002.generate-ast
tasks/user-auth-003.compile-wasm
tasks/user-auth-004.run-tests
reports/user-auth.trace
```

The trace can be replayed, optimized, and used to train models.

---

## Key Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| Same observables | Test suite runs on all targets |
| Lossless trace | All reasoning steps saved |
| Reversible | Pattern library enables back-translation |
| Incremental | Additive until limit, then consolidate |
| Auditable | Shortest paths, congestion, gravity basins observable |

---

## Open Questions

1. How to handle language-specific features (e.g., Python decorators, JS prototypes)?
2. What is the minimum WASM instruction set needed?
3. How to encode side effects and IO?
4. What is the pattern library growth rate?

---

## References

- `research/linear-a-lisp-dialect-workflow-vision.md` - Original vision
- `orgs/octave-commons/graph-runtime/SPEC.md` - Underlying runtime model
