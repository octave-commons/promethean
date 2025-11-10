# Kanban Legacy to Functional Architecture Mapping Analysis

## Current State Assessment

### ✅ Already Implemented Functional Actions

**Board Actions** (`src/lib/actions/boards/`):
- `loadBoard` ✅ - `load-board.ts`
- `saveBoard` ✅ - `save-board.ts` (equivalent to `writeBoard`)
- `queryBoard` ✅ - `query-board.ts`
- `getFrontmatter` ✅ - board operations
- `setFrontmatter` ✅ - board operations
- `getKanbanSettings` ✅ - board operations
- `setKanbanSettings` ✅ - board operations
- `listColumns` ✅ - board operations

**Card Actions** (`src/lib/actions/cards/`):
- `createCard` ✅ - `create-card.ts`
- `removeCard` ✅ - `remove-card.ts`
- `moveCard` ✅ - `move-card.ts`
- `updateCard` ✅ - `update-card.ts`
- `findCards` ✅ - `find-cards.ts`

**Column Actions** (`src/lib/actions/columns/`):
- `createColumn` ✅ - `create-column.ts`
- `removeColumn` ✅ - `remove-column.ts`
- `listColumnsInBoard` ✅ - `list-columns.ts`

**Task Actions** (`src/lib/actions/tasks/`):
- `createTaskAction` ✅ - `create-task.ts` (partial implementation)

**Serializers** (`src/lib/serializers/`):
- `markdown-formatter.ts` ✅
- Template processing ✅

**Factories** (`src/lib/factories/`):
- Board, Card, Column factories ✅

### ❌ Missing Functional Actions

**Core Task Operations** (need to be created):
- `updateTaskDescription` → `actions/tasks/update-description.ts`
- `renameTask` → `actions/tasks/reame-task.ts`
- `archiveTask` → `actions/tasks/archive-task.ts`
- `deleteTask` → `actions/tasks/delete-task.ts`
- `mergeTasks` → `actions/tasks/merge-tasks.ts`

**Transition Operations** (need to be created):
- `updateStatus` → `actions/transitions/update-status.ts`
- `moveTask` → `actions/transitions/move-task.ts` (different from card move)

**Search Operations** (need to be created):
- `searchTasks` → `actions/search/search-tasks.ts`
- `indexForSearch` → `actions/search/index-for-search.ts`

**Board Operations** (need to be created):
- `syncBoardAndTasks` → `actions/boards/sync-board-tasks.ts`
- `regenerateBoard` → `actions/boards/regenerate-board.ts`

**Utility Functions** (need to be created):
- `readTasksFolder` → `actions/tasks/read-tasks-folder.ts`
- `findTaskById` → `actions/tasks/find-task-by-id.ts`
- `findTaskByTitle` → `actions/tasks/find-task-by-title.ts`
- `getColumn` → `actions/columns/get-column.ts`
- `getTasksByColumn` → `actions/columns/get-tasks-by-column.ts`
- `countTasks` → `actions/boards/count-tasks.ts`

**Advanced Operations** (need to be created):
- `analyzeTask` → `actions/tasks/analyze-task.ts`
- `rewriteTask` → `actions/tasks/rewrite-task.ts`
- `breakdownTask` → `actions/tasks/breakdown-task.ts`
- `generateBoardByTags` → `actions/boards/generate-board-by-tags.ts`

**Git Operations** (need to be created):
- `pullFromTasks` → `actions/git/pull-from-tasks.ts`
- `pushToTasks` → `actions/git/push-to-tasks.ts`

## Export Mapping

### Current Main Exports (`src/index.ts`)
```typescript
// These currently point to legacy kanban.ts functions:
export {
  loadBoard,           // ✅ Has functional equivalent
  readTasksFolder,      // ❌ Missing functional action
  getColumn,           // ❌ Missing functional action
  findTaskById,        // ❌ Missing functional action
  findTaskByTitle,     // ❌ Missing functional action
  updateStatus,        // ❌ Missing functional action
  moveTask,            // ❌ Missing functional action
  syncBoardAndTasks,   // ❌ Missing functional action
  searchTasks,         // ❌ Missing functional action
  createTask,          // ✅ Has functional equivalent (createTaskAction)
  updateTaskDescription, // ❌ Missing functional action
  renameTask,          // ❌ Missing functional action
  archiveTask,         // ❌ Missing functional action
  deleteTask,          // ❌ Missing functional action
  mergeTasks,          // ❌ Missing functional action
  analyzeTask,         // ❌ Missing functional action
  rewriteTask,         // ❌ Missing functional action
  breakdownTask,       // ❌ Missing functional action
} from './lib/kanban.js';
```

## Integration Strategy

### Phase 1: Complete Missing Actions
1. **Task Actions** - Create core task lifecycle operations
2. **Transition Actions** - Create status update and move operations
3. **Search Actions** - Create search and indexing operations
4. **Board Actions** - Create sync and regenerate operations

### Phase 2: Update Exports
1. Update `src/index.ts` to export functional actions
2. Maintain backward compatibility where possible
3. Add deprecation warnings for legacy functions

### Phase 3: Update Integration Points
1. Update CLI command handlers to use new actions
2. Update any external package dependencies
3. Run comprehensive tests

### Phase 4: Cleanup
1. Remove legacy code from `kanban.ts`
2. Update documentation
3. Final validation

## Priority Order

**High Priority** (Core functionality):
- Task lifecycle actions (update, rename, archive, delete, merge)
- Transition actions (updateStatus, moveTask)
- Board sync and regenerate

**Medium Priority** (Search and utilities):
- Search actions
- Utility functions (find by id/title, etc.)

**Low Priority** (Advanced features):
- Analysis and breakdown actions
- Git operations

## Next Steps

1. **Immediate**: Create missing task actions
2. **Short-term**: Create transition actions
3. **Medium-term**: Update main exports
4. **Long-term**: Complete migration and cleanup

The functional architecture foundation is solid - we need to complete the missing actions and update integration points.