---
uuid: "46d9372a-65f1-42b8-a024-3ce4449f67ec"
title: "Rewrite @packages/shadow-conf/ as nbb script for program generation"
slug: "rewrite-shadow-conf-as-nbb"
status: "ready"
priority: "P1"
labels: ["migration", "clojure", "nbb", "shadow-conf", "program-generation"]
created_at: "2025-10-13T23:29:41.346Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "336ece4b5582bedb702cac3d9defbec1f050a294"
commitHistory:
  -
    sha: "336ece4b5582bedb702cac3d9defbec1f050a294"
    timestamp: "2025-10-19 17:08:12 -0500\n\ndiff --git a/docs/agile/tasks/emergency-pipeline-fix-eslint-tasks 25.md b/docs/agile/tasks/emergency-pipeline-fix-eslint-tasks 25.md\nindex b6fb891cd..9e3d4c53e 100644\n--- a/docs/agile/tasks/emergency-pipeline-fix-eslint-tasks 25.md\t\n+++ b/docs/agile/tasks/emergency-pipeline-fix-eslint-tasks 25.md\t\n@@ -10,11 +10,14 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-commitHistory: \n-  - sha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-    timestamp: \"2025-10-19T16:27:40.286Z\"\n-    action: \"Bulk commit tracking initialization\"\n+lastCommitSha: \"104f0cc74bc813f41d815dbee2ce121de42d2706\"\n+commitHistory:\n+  -\n+    sha: \"104f0cc74bc813f41d815dbee2ce121de42d2706\"\n+    timestamp: \"2025-10-19 17:08:12 -0500\\n\\ndiff --git a/docs/agile/tasks/Secure BuildFix command execution.md b/docs/agile/tasks/Secure BuildFix command execution.md\\nindex ffba40086..5f2224927 100644\\n--- a/docs/agile/tasks/Secure BuildFix command execution.md\\t\\n+++ b/docs/agile/tasks/Secure BuildFix command execution.md\\t\\n@@ -10,11 +10,14 @@ estimates:\\n   complexity: \\\"\\\"\\n   scale: \\\"\\\"\\n   time_to_completion: \\\"\\\"\\n-lastCommitSha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-commitHistory: \\n-  - sha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-    timestamp: \\\"2025-10-19T16:27:40.283Z\\\"\\n-    action: \\\"Bulk commit tracking initialization\\\"\\n+lastCommitSha: \\\"16894ac9660c2f1ff934f437aca698d36e60792a\\\"\\n+commitHistory:\\n+  -\\n+    sha: \\\"16894ac9660c2f1ff934f437aca698d36e60792a\\\"\\n+    timestamp: \\\"2025-10-19T22:08:12.490Z\\\"\\n+    message: \\\"Update task: 6dae395f-31aa-42c7-b9c8-2dc1d750ddc9 - Update task: Secure BuildFix command execution\\\"\\n+    author: \\\"Error <foamy125@gmail.com>\\\"\\n+    type: \\\"update\\\"\\n ---\\n \\n High priority: BuildFix provider uses unsafe execSync without input validation, creating security vulnerabilities. Need to implement proper input sanitization, validation, and secure command execution patterns to prevent command injection attacks.\"\n+    message: \"Update task: 6dae395f-31aa-42c7-b9c8-2dc1d750ddc9 - Update task: Secure BuildFix command execution\"\n+    author: \"Error\"\n+    type: \"update\"\n ---\n \n ## 🚨 Emergency: ESLint Pipeline Missing Dependency"
    message: "Update task: 864b2172-e006-44fe-9ef0-0af3bbab6235 - Update task: Fix eslint-tasks pipeline missing dependency: Missing @typescript-eslint/parser"
    author: "Error"
    type: "update"
---

## Overview

Rewrite the entire @packages/shadow-conf/ TypeScript package as an nbb (Babashka) script. The current implementation is a TypeScript program that generates PM2 ecosystem configuration files from EDN sources. Since this is "a program that is generating a program," it makes more sense to implement it in Lisp, which provides better metaprogramming capabilities and a more natural fit for EDN processing.

## Current Functionality Analysis

The existing shadow-conf package provides:

1. **Core API** (`ecosystem.ts`):
   - `generateEcosystem()` - Main function that processes EDN files and generates ecosystem configs
   - Path normalization and resolution logic
   - File system operations (collecting .edn files, writing output)
   - JSON/JavaScript module generation with dotenv integration

2. **EDN Processing** (`edn.ts`):
   - EDN file loading using jsedn library
   - Keyword normalization (removing `:` prefixes)
   - Data structure normalization

3. **CLI Interface** (`bin/shadow-conf.ts`):
   - Command-line argument parsing
   - Help system and error handling
   - Integration with core API

4. **Test Suite** (`tests/ecosystem.test.ts`):
   - Comprehensive test coverage for aggregation logic
   - Path resolution testing
   - Integration tests

## Migration Requirements

### 1. Core Functionality Translation
- [ ] Translate TypeScript types to Clojure specs
- [ ] Convert file system operations to Babashka FS API
- [ ] Replace jsedn dependency with native Clojure EDN reading
- [ ] Implement path normalization logic in Clojure
- [ ] Generate JavaScript ecosystem output from Clojure data structures

### 2. CLI Interface Migration
- [ ] Create nbb-compatible CLI argument parsing
- [ ] Implement help system and error handling
- [ ] Maintain same command-line interface: `shadow-conf ecosystem --input-dir <path> --out <path> --filename <name>`

### 3. Testing Strategy
- [ ] Port existing tests to Clojure test framework
- [ ] Create test helpers for temporary file/directory creation
- [ ] Ensure same test coverage and assertions
- [ ] Add integration tests for nbb script execution

### 4. Project Structure
- [ ] Create new location: `bb/src/shadow_conf/` (following existing bb pattern)
- [ ] Implement as `.bb` script for CLI entry point
- [ ] Organize modules: core, cli, file_ops, output_gen
- [ ] Update bb.edn tasks for shadow-conf operations

### 5. API Compatibility
- [ ] Maintain same input/output behavior
- [ ] Preserve path resolution semantics
- [ ] Keep same error messages and exit codes
- [ ] Ensure generated JavaScript output is identical

### 6. Performance Considerations
- [ ] Leverage Clojure's lazy sequences for file processing
- [ ] Optimize EDN parsing with native Clojure reader
- [ ] Implement efficient file system traversal
- [ ] Consider memory usage for large EDN file sets

### 7. Documentation & Migration
- [ ] Document the migration rationale and benefits
- [ ] Create migration guide for users
- [ ] Update package.json deprecation notices
- [ ] Add examples and usage documentation

## Technical Implementation Details

### File Structure Proposal:
```
bb/src/shadow_conf/
├── core.clj           # Main ecosystem generation logic
├── cli.bb             # Command-line interface entry point
├── file_ops.clj       # File system operations
├── output_gen.clj     # JavaScript output generation
└── test/
    ├── core_test.clj
    └── file_ops_test.clj
```

### Key Benefits of Lisp Implementation:
1. **Native EDN Support**: No external dependencies needed
2. **Better Metaprogramming**: Code generation is more natural in Lisp
3. **Immutable Data Structures**: Safer data manipulation
4. **Sequence Processing**: Powerful data transformation capabilities
5. **REPL Development**: Interactive development and debugging
6. **Smaller Runtime**: No Node.js/TypeScript overhead

### Dependencies to Replace:
- `jsedn` → native `clojure.edn`
- `node:fs/promises` → `babashka.fs`
- TypeScript types → Clojure specs
- AVA test framework → `clojure.test`

## Acceptance Criteria

1. **Functional Parity**: Generated ecosystem files are identical to TypeScript version
2. **CLI Compatibility**: Same command-line interface and behavior
3. **Test Coverage**: All existing tests pass with equivalent assertions
4. **Performance**: Equal or better performance on typical workloads
5. **Error Handling**: Same error messages and exit codes
6. **Documentation**: Complete migration guide and usage documentation
7. **Integration**: Works with existing build system and CI/CD pipelines

## Dependencies & Considerations

### Dependencies:
- Babashka runtime
- Existing bb.edn configuration
- Clojure core libraries (edn, string, file, etc.)

### Integration Points:
- PM2 ecosystem generation workflow
- CI/CD pipelines using shadow-conf
- Development environment setup scripts
- Documentation and examples

### Migration Strategy:
1. Implement core functionality in parallel
2. Create comprehensive test suite
3. Gradual migration of usage
4. Deprecation notice for TypeScript version
5. eventual removal of old package

## Success Metrics

- [ ] All existing tests pass with new implementation
- [ ] Generated output is byte-for-byte identical
- [ ] Performance benchmarks meet or exceed current implementation
- [ ] Zero breaking changes for existing users
- [ ] Documentation is complete and accurate
- [ ] Code follows Clojure best practices and existing project conventions
