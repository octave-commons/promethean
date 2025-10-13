---
uuid: "1b14781e-0dae-4521-b4f9-d509efcbee6c"
title: "Fix Critical Linting Violations in agents-workflow Package"
slug: "Fix Critical Linting Violations in agents-workflow Package"
status: "incoming"
priority: "P0"
labels: ["tool:codex", "cap:codegen", "agents-workflow", "linting", "code-quality", "p0", "critical"]
created_at: "2025-10-13T20:36:39.698Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Fix Critical Linting Violations in agents-workflow Package\n\n## 🚨 Critical Issues\n\n**Current Status**: 44 linting violations (34 errors, 10 warnings) across all files in agents-workflow package\n\n### Specific Violations by File:\n\n**src/providers/ollama.ts (332 lines - exceeds 300 limit):**\n- Use interface instead of type (lines 24, 31)\n- Unsafe return of any value (line 112)\n- Cognitive complexity: 16 (exceeds 15) in buildRequest method\n- Async method 'getModel' has no 'await' expression\n\n**src/workflow/loader.ts (324 lines - exceeds 300 limit):**\n- Function complexity: 24 (exceeds 15) in mergeDefinitions\n- Unnecessary type assertions (lines 41, 44, 51, 54, 272, 279)\n- Async function 'resolveNodeDefinition' has too many lines (52, exceeds 50)\n- Import ordering issues\n\n**src/workflow/markdown.ts:**\n- Function complexity: 18 (exceeds 15) in parseMarkdownWorkflows\n- Cognitive complexity: 16 (exceeds 15) in parseMarkdownWorkflows\n\n**src/workflow/mermaid.ts:**\n- Cognitive complexity: 19 (exceeds 15) in parsing function\n\n**src/workflow/types.ts:**\n- 9 instances of interface instead of type\n\n**Test Files:**\n- Function length violations (51, 84 lines)\n- Unsafe any usage\n- Missing await expressions\n\n## 🎯 Acceptance Criteria\n\n### Must Fix (P0 Priority):\n- [ ] **All 34 errors resolved**: Zero ESLint errors remaining\n- [ ] **File size limits**: ollama.ts and loader.ts reduced to ≤300 lines\n- [ ] **Complexity reduction**: All functions ≤15 complexity\n- [ ] **Type safety**: Eliminate unsafe any usage and unnecessary assertions\n- [ ] **Import ordering**: Fix all import/order violations\n\n### Should Fix (P1 Priority):\n- [ ] **Warning resolution**: Address all 10 warnings\n- [ ] **Function length**: Reduce all functions to ≤50 lines\n- [ ] **Async patterns**: Fix unnecessary async/await patterns\n\n## 🔧 Technical Implementation\n\n### Phase 1: Critical Errors (1-2 days)\n1. **Interface → Type conversions**: Replace all interfaces with type aliases\n2. **Complexity reduction**: Refactor high-complexity functions\n3. **File splitting**: Break down large files into smaller modules\n4. **Type safety**: Add proper typing and remove any usage\n\n### Phase 2: Code Organization (1 day)\n1. **Function extraction**: Split large functions into smaller, focused ones\n2. **Import fixes**: Reorder imports according to ESLint rules\n3. **Async patterns**: Fix async/await usage\n\n### Phase 3: Testing & Validation (0.5 day)\n1. **Regression testing**: Ensure all functionality still works\n2. **Lint validation**: Confirm zero violations\n3. **Performance check**: Ensure no performance degradation\n\n## 📊 Success Metrics\n- [ ] **Zero ESLint errors**: All 34 errors resolved\n- [ ] **Complexity compliance**: All functions ≤15 complexity\n- [ ] **File size compliance**: All files ≤300 lines\n- [ ] **Test coverage**: Maintain existing test coverage\n- [ ] **Functionality**: All existing features work correctly\n\n## ⛓️ Dependencies\n- Requires agents-workflow package access\n- May need coordination with other teams using this package\n\n## ⛓️ Blocks\n- Blocks other tasks that depend on clean code quality\n- Required before production deployment

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
