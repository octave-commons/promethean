# Kanban Package Functional Refactoring Analysis

## Current Architecture Assessment

### Existing Structure
The kanban package follows a mixed architectural pattern:
- **Monolithic functions** in `src/lib/kanban.ts` (1000+ lines)
- **Some modular separation** with dedicated modules for specific concerns
- **Command handlers** in `src/cli/command-handlers.ts` (2000+ lines)
- **Configuration management** in `src/board/config/`
- **Event logging system** in `src/board/event-log/`
- **Healing system** in `src/lib/healing/`

### Identified Issues
1. **Large procedural files** that violate single responsibility principle
2. **Mixed concerns** - business logic, I/O, and validation intertwined
3. **No clear separation** between actions, factories, and serializers
4. **Tight coupling** between different operations
5. **Difficult testing** due to impure functions and side effects

## Typeclasses Identified

Based on domain analysis, the following typeclasses are needed:

### Core Domain Typeclasses
1. **tasks** - Task lifecycle management (create, update, delete, move)
2. **boards** - Board operations (load, save, regenerate, sync)
3. **columns** - Column management (WIP limits, normalization)
4. **transitions** - Status transition validation and enforcement
5. **search** - Task search and indexing operations
6. **epics** - Epic and subtask relationship management
7. **audit** - Board auditing and compliance checking
8. **healing** - Healing operations and scar management

### Infrastructure Typeclasses
1. **config** - Configuration loading and management
2. **event-log** - Event logging and history tracking
3. **git** - Git operations and commit tracking
4. **serialization** - Data transformation (markdown, JSON, frontmatter)
5. **validation** - Input validation and rule enforcement

### Utility Typeclasses
1. **file-operations** - File system operations
2. **template** - Template processing and replacements
3. **priority** - Priority handling and normalization
4. **labels** - Label management and auto-generation

## Existing Functions Mapping

### Task Operations (to be refactored to `actions/tasks/`)
- `createTask` → `actions/tasks/create-task.ts`
- `updateTaskDescription` → `actions/tasks/update-description.ts`
- `renameTask` → `actions/tasks/rename-task.ts`
- `deleteTask` → `actions/tasks/delete-task.ts`
- `archiveTask` → `actions/tasks/archive-task.ts`
- `mergeTasks` → `actions/tasks/merge-tasks.ts`

### Board Operations (to be refactored to `actions/boards/`)
- `loadBoard` → `actions/boards/load-board.ts`
- `writeBoard` → `actions/boards/write-board.ts`
- `regenerateBoard` → `actions/boards/regenerate-board.ts`
- `syncBoardAndTasks` → `actions/boards/sync-board-tasks.ts`

### Transition Operations (to be refactored to `actions/transitions/`)
- `updateStatus` → `actions/transitions/update-status.ts`
- `moveTask` → `actions/transitions/move-task.ts`

### Search Operations (to be refactored to `actions/search/`)
- `searchTasks` → `actions/search/search-tasks.ts`
- `indexForSearch` → `actions/search/index-for-search.ts`

## Factory Functions Needed

### Task Factories (`factories/task-factory.ts`)
- `createTaskWithDependencies` - Create task with validation, labels, etc.
- `createEpicWithSubtasks` - Create epic with linked subtasks
- `createTaskFromTemplate` - Create task from template
- `createTaskFromFile` - Create task object from file content

### Board Factories (`factories/board-factory.ts`)
- `createBoardFromConfig` - Create board with WIP limits from config
- `createBoardFromTasks` - Create board by grouping tasks
- `createColumnWithLimits` - Create column with WIP validation

### Configuration Factories (`factories/config-factory.ts`)
- `createKanbanConfigWithDefaults` - Create config with sensible defaults
- `createEventLogManager` - Create event log with proper configuration

## Serializer Functions Needed

### Task Serializers (`serializers/task-serializers.ts`)
- `serializeTaskToMarkdown` - Task → markdown with frontmatter
- `serializeTaskToJSON` - Task → JSON format
- `deserializeTaskFromMarkdown` - Markdown → task object
- `deserializeTaskFromJSON` - JSON → task object

### Board Serializers (`serializers/board-serializers.ts`)
- `serializeBoardToMarkdown` - Board → kanban markdown
- `deserializeBoardFromMarkdown` - Markdown → board object

### Configuration Serializers (`serializers/config-serializers.ts`)
- `serializeConfigToJSON` - Config → JSON
- `deserializeConfigFromJSON` - JSON → config object

## Refactoring Strategy

### Phase 1: Foundation
1. Create typeclass directory structure
2. Define input/output types for each action
3. Create scope interfaces for dependency injection
4. Set up barrel exports

### Phase 2: Core Actions
1. Extract task operations to pure functions
2. Extract board operations to pure functions
3. Extract transition operations to pure functions
4. Add comprehensive error handling

### Phase 3: Factories
1. Create factory functions for complex object creation
2. Implement dependency injection patterns
3. Add validation and business rules

### Phase 4: Serializers
1. Extract data transformation logic
2. Create bidirectional serializers
3. Handle format-specific concerns

### Phase 5: Integration
1. Update command handlers to use new actions
2. Update main exports
3. Add comprehensive tests
4. Update documentation

## Benefits of Refactoring

1. **Testability** - Pure functions are easy to unit test
2. **Composability** - Functions can be combined in flexible ways
3. **Maintainability** - Clear separation of concerns
4. **Type Safety** - Explicit contracts for all operations
5. **Performance** - Better optimization opportunities
6. **Developer Experience** - Clearer APIs and better error messages