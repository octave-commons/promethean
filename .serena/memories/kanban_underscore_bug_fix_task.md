# Comprehensive Task: Fix Kanban Column Underscore Normalization Bug

## 🚨 Critical Issue Summary

The kanban system has a **critical bug** where column names containing underscores (like `in_progress`) are being incorrectly normalized, causing transition validation failures. This blocks core kanban functionality and prevents task movement between columns.

## 🔍 Root Cause Analysis

### Problem Identified
- **Error shows**: `todo → inprogress is not a defined transition`
- **Expected behavior**: `todo → in_progress` should be valid
- **Root cause**: Inconsistent column name normalization across multiple components

### Technical Root Causes Found

1. **Clojure DSL (`kanban-transitions.clj`)**:
   ```clojure
   (defn column-key [col-name]
     (-> col-name
         (str/lower-case)
         (str/replace #"[\s_-]" "")))  ; Strips ALL underscores!
   ```

2. **TypeScript CLI (`command-handlers.ts`)**:
   ```typescript
   const columnKey = (name: string): string => name.toLowerCase().replace(/[\s_-]/g, '');
   ```

3. **TypeScript Core (`kanban.ts`)**:
   ```typescript
   const columnKey = (name: string): string =>
     normalizeColumnDisplayName(name)
       .normalize('NFKD')
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '');  ; Also strips underscores
   ```

4. **Transition Rules Engine (`transition-rules.ts`)**:
   ```typescript
   private normalizeColumnName(column: string): string {
     return column
       .normalize('NFKD')
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '');  ; Same issue
   }
   ```

### Impact Assessment
- **Blocks**: All transitions to `in_progress`, `time_to_completion`, and other underscore columns
- **Affects**: CLI commands, UI operations, and automated workflows
- **Severity**: **P0 - Critical** (core functionality broken)

## 🎯 Solution Strategy

### Phase 1: Immediate Fix (Normalization Consistency)
1. **Standardize column normalization** across all components
2. **Preserve underscores** in normalized keys for proper matching
3. **Update transition rules** to use consistent normalization
4. **Fix backward compatibility** for existing data

### Phase 2: Comprehensive Testing
1. **Add regression tests** for underscore scenarios
2. **Test edge cases** (multiple underscores, mixed separators)
3. **Validate CLI commands** work correctly
4. **Ensure UI consistency**

### Phase 3: Documentation & Validation
1. **Update documentation** with proper column naming rules
2. **Add validation** for column name transitions
3. **Create migration guide** if needed

## 📋 Detailed Sub-Tasks

### 🛠️ Task 1: Fix Column Normalization Logic
**Files to Update:**
- `packages/kanban/src/lib/kanban.ts` (line 58-62)
- `packages/kanban/src/cli/command-handlers.ts` (line 29)
- `packages/kanban/src/lib/transition-rules.ts` (line 269-275)
- `docs/agile/rules/kanban-transitions.clj` (line 6-11)

**Changes Required:**
```typescript
// BEFORE (strips underscores):
.replace(/[^a-z0-9]+/g, '')

// AFTER (preserves underscores):
.replace(/[^a-z0-9_]+/g, '')
```

```clojure
;; BEFORE (strips underscores):
(str/replace #"[\s_-]" "")

;; AFTER (preserves underscores):
(str/replace #"\s+" "")
```

### 🧪 Task 2: Update Transition Rules Configuration
**Files to Update:**
- Any JSON configuration files with transition rules
- Test fixtures that reference normalized column names

**Actions:**
1. Audit all transition rule configurations
2. Update rules to use underscore-preserved normalization
3. Ensure `in_progress` transitions work correctly

### ✅ Task 3: Add Comprehensive Test Coverage
**Test Files to Create/Update:**
- `packages/kanban/src/tests/column-normalization.test.ts` (new)
- `packages/kanban/src/tests/transition-rules.test.ts` (update)
- `packages/kanban/src/tests/command-handlers.test.ts` (update)

**Test Scenarios:**
1. `in_progress` column transitions
2. Multiple underscores: `time_to_completion`
3. Mixed separators: `in-progress` vs `in_progress`
4. Edge cases: leading/trailing underscores
5. Backward compatibility with existing data

### 🔧 Task 4: Fix CLI Command Handlers
**Files to Update:**
- `packages/kanban/src/cli/command-handlers.ts`

**Specific Commands to Fix:**
- `update-status` command
- `move_up`/`move_down` commands
- `getColumn` operations
- Task movement operations

### 🌐 Task 5: Validate UI Integration
**Files to Check:**
- `packages/kanban/src/frontend/kanban-ui.ts`
- `packages/kanban/src/frontend/render.ts`

**Validation Points:**
1. UI displays column names correctly
2. Drag-and-drop operations work
3. Status updates propagate correctly

### 📚 Task 6: Update Documentation
**Files to Update:**
- `docs/agile/kanban-cli-reference.md`
- `docs/agile/process.md`
- Add new section on column naming conventions

## 🎯 Definition of Done

### ✅ Core Functionality
- [ ] `pnpm kanban update-status <uuid> in_progress` works without errors
- [ ] `pnpm kanban show-transitions` shows correct `todo → in_progress` transition
- [ ] All underscore column names work consistently across CLI, UI, and storage
- [ ] No regression in existing column name handling

### ✅ Test Coverage
- [ ] 100% test coverage for column normalization functions
- [ ] All underscore scenarios covered in integration tests
- [ ] Regression tests prevent future breakage
- [ ] Performance tests confirm no degradation

### ✅ Documentation & Validation
- [ ] Updated CLI reference with column naming rules
- [ ] Clear error messages for invalid transitions
- [ ] Migration guide if any data changes needed
- [ ] All existing tests pass

### ✅ Edge Cases Handled
- [ ] Multiple underscores: `time_to_completion`
- [ ] Mixed separators work correctly
- [ ] Backward compatibility maintained
- [ ] Error handling for malformed column names

## 🔍 Technical Investigation Steps

### Step 1: Reproduce the Bug
```bash
# Create test task
pnpm kanban create "Test Underscore Bug" --content "Testing underscore handling"

# Try to move to in_progress (should fail)
pnpm kanban update-status <uuid> in_progress

# Show current transitions
pnpm kanban show-transitions
```

### Step 2: Identify All Normalization Points
```bash
# Search for column normalization patterns
rg "columnKey|column-key|normalizeColumnName" packages/kanban/
rg "replace.*\[\^.*\].*g" packages/kanban/
rg "str/replace.*_.*" docs/agile/rules/
```

### Step 3: Validate Fix
```bash
# After fix, test all underscore scenarios
pnpm kanban update-status <uuid> in_progress
pnpm kanban update-status <uuid> time_to_completion
pnpm kanban show-transitions | grep in_progress
```

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Data Migration**: Existing tasks might have normalized keys
2. **Backward Compatibility**: Breaking changes could affect workflows
3. **Performance**: Regex changes might impact performance

### Mitigation Strategies
1. **Gradual Rollout**: Fix normalization first, then update rules
2. **Comprehensive Testing**: Test all scenarios before deployment
3. **Rollback Plan**: Keep old normalization logic as fallback
4. **Monitoring**: Add logging for normalization operations

## 📊 Success Metrics

### Quantitative Metrics
- [ ] 100% success rate for underscore column transitions
- [ ] 0 regression failures in existing tests
- [ ] <100ms performance impact on normalization operations
- [ ] 100% test coverage for normalization functions

### Qualitative Metrics
- [ ] Clear, consistent error messages
- [ ] Intuitive column naming behavior
- [ ] No user confusion about column names
- [ ] Smooth workflow operations

## 🔗 Related Issues & Dependencies

### Blocks
- **kanban-stress-test-continuation**: Cannot proceed with stress testing
- **task-delegation-workflow**: Delegation system depends on working transitions

### Related
- **kanban-column-normalization-bug**: Memory file with initial analysis
- **transition-rules-enhancement**: May need updates for new normalization

## 📝 Implementation Notes

### Key Design Decisions
1. **Preserve underscores**: Underscores are part of valid column names
2. **Consistent normalization**: All components must use identical logic
3. **Backward compatibility**: Existing workflows should continue working
4. **Clear error messages**: Help users understand transition failures

### Performance Considerations
- Regex optimization for high-frequency operations
- Caching normalized column names where appropriate
- Minimal impact on existing performance characteristics

## 🚀 Deployment Strategy

### Phase 1: Core Fix
1. Update normalization functions
2. Fix transition rules
3. Update CLI handlers

### Phase 2: Testing & Validation
1. Run comprehensive test suite
2. Manual testing of critical workflows
3. Performance validation

### Phase 3: Documentation & Release
1. Update documentation
2. Release notes with breaking changes
3. Monitor for issues post-release

---

**This is a P0 critical bug affecting core kanban functionality. Immediate attention required to restore system reliability.**