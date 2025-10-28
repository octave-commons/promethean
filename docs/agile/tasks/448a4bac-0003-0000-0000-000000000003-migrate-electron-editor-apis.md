---
uuid: '448a4bac-0003-0000-0000-000000000003'
title: 'Migrate Electron Editor APIs'
slug: 'migrate-electron-editor-apis'
status: 'ready'
priority: 'P1'
labels: ['api', 'migration', 'electron', 'editor', 'filesystem', 'ui', 'keybindings']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '3'
  scale: 'small'
  time_to_completion: '2 sessions'
storyPoints: 3
---

## 🔄 Migrate Electron Editor APIs

### 📋 Description

Migrate editor configuration, file system operations, UI component management, and keybinding APIs from `packages/electron-editor` to the unified API structure. This involves consolidating editor-specific endpoints with standardized interfaces, proper authentication, and consistent response handling.

### 🎯 Goals

- Migrate editor configuration endpoints to unified structure
- Migrate file system operation APIs with proper security
- Migrate UI component management endpoints
- Migrate keybinding and shortcut management APIs
- Implement consistent authentication and authorization
- Apply unified response format standards
- Ensure proper input validation and error handling

### ✅ Acceptance Criteria

- [ ] Editor configuration endpoints migrated and functional
- [ ] File system operation APIs migrated with security controls
- [ ] UI component management endpoints migrated
- [ ] Keybinding management APIs migrated
- [ ] All endpoints use unified response format
- [ ] Authentication and authorization implemented
- [ ] Input validation applied to all endpoints
- [ ] Error handling standardized across APIs
- [ ] Backward compatibility maintained during transition
- [ ] API documentation updated

### 🔧 Technical Specifications

#### Source Endpoints to Migrate:

1. **Editor Configuration**

   - `GET /editor/config` - Get current editor configuration
   - `PUT /editor/config` - Update editor configuration
   - `GET /editor/themes` - List available themes
   - `PUT /editor/theme` - Set active theme
   - `GET /editor/preferences` - Get user preferences
   - `PUT /editor/preferences` - Update user preferences

2. **File System Operations**

   - `GET /fs/files` - List files in directory
   - `GET /fs/file/:path` - Get file content
   - `PUT /fs/file/:path` - Write file content
   - `DELETE /fs/file/:path` - Delete file
   - `POST /fs/directory` - Create directory
   - `GET /fs/search` - Search files
   - `GET /fs/metadata/:path` - Get file metadata
   - `POST /fs/watch` - Watch file changes

3. **UI Component Management**

   - `GET /ui/panels` - List available panels
   - `POST /ui/panels` - Create new panel
   - `GET /ui/panels/:id` - Get panel details
   - `PUT /ui/panels/:id` - Update panel configuration
   - `DELETE /ui/panels/:id` - Remove panel
   - `POST /ui/layout` - Update layout configuration
   - `GET /ui/layout` - Get current layout

4. **Keybinding Management**
   - `GET /keybindings` - List current keybindings
   - `POST /keybindings` - Create new keybinding
   - `PUT /keybindings/:id` - Update keybinding
   - `DELETE /keybindings/:id` - Remove keybinding
   - `GET /keybindings/conflicts` - Check for conflicts
   - `POST /keybindings/reset` - Reset to defaults

#### Target API Structure:

```typescript
// src/typescript/server/api/v1/routes/editor.ts
export const editorRoutes = async (fastify: FastifyInstance) => {
  // Editor Configuration
  fastify.get('/editor/config', {
    schema: getEditorConfigSchema,
    handler: getEditorConfigHandler,
  });

  fastify.put('/editor/config', {
    schema: updateEditorConfigSchema,
    handler: updateEditorConfigHandler,
  });

  fastify.get('/editor/themes', {
    schema: listThemesSchema,
    handler: listThemesHandler,
  });

  fastify.put('/editor/theme', {
    schema: setThemeSchema,
    handler: setThemeHandler,
  });

  // File System Operations
  fastify.get('/fs/files', {
    schema: listFilesSchema,
    handler: listFilesHandler,
  });

  fastify.get('/fs/file/*', {
    schema: getFileSchema,
    handler: getFileHandler,
  });

  fastify.put('/fs/file/*', {
    schema: writeFileSchema,
    handler: writeFileHandler,
  });

  // UI Component Management
  fastify.get('/ui/panels', {
    schema: listPanelsSchema,
    handler: listPanelsHandler,
  });

  fastify.post('/ui/panels', {
    schema: createPanelSchema,
    handler: createPanelHandler,
  });

  // Keybinding Management
  fastify.get('/keybindings', {
    schema: listKeybindingsSchema,
    handler: listKeybindingsHandler,
  });

  fastify.post('/keybindings', {
    schema: createKeybindingSchema,
    handler: createKeybindingHandler,
  });
};
```

#### Request/Response Schemas:

```typescript
// Editor Configuration Schemas
interface EditorConfig {
  theme: string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: Record<string, string>;
  tokenColors: TokenColor[];
}

// File System Schemas
interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  created: string;
  permissions?: string;
}

interface FileContent {
  path: string;
  content: string;
  encoding: string;
  size: number;
  modified: string;
}

interface SearchRequest {
  query: string;
  path?: string;
  includePattern?: string;
  excludePattern?: string;
  maxResults?: number;
}

// UI Component Schemas
interface Panel {
  id: string;
  type: 'sidebar' | 'panel' | 'statusbar' | 'menubar';
  title: string;
  position: 'left' | 'right' | 'bottom' | 'top';
  size: number;
  visible: boolean;
  config: Record<string, any>;
}

interface Layout {
  panels: Panel[];
  activePanel?: string;
  sidebarWidth: number;
  panelHeight: number;
}

// Keybinding Schemas
interface Keybinding {
  id: string;
  command: string;
  key: string;
  when?: string;
  args?: Record<string, any>;
  enabled: boolean;
}

interface KeybindingConflict {
  key: string;
  bindings: Keybinding[];
  resolution?: 'override' | 'disable' | 'keep';
}
```

### 📁 Files/Components to Create

1. **Route Handlers**

   - `src/typescript/server/api/v1/routes/editor.ts` - Editor configuration routes
   - `src/typescript/server/api/v1/routes/filesystem.ts` - File system operation routes
   - `src/typescript/server/api/v1/routes/ui.ts` - UI component management routes
   - `src/typescript/server/api/v1/routes/keybindings.ts` - Keybinding management routes

2. **Handler Functions**

   - `src/typescript/server/api/v1/handlers/editor.ts` - Editor route handlers
   - `src/typescript/server/api/v1/handlers/filesystem.ts` - File system handlers
   - `src/typescript/server/api/v1/handlers/ui.ts` - UI component handlers
   - `src/typescript/server/api/v1/handlers/keybindings.ts` - Keybinding handlers

3. **Schema Definitions**

   - `src/typescript/server/api/v1/schemas/editor.ts` - Editor schemas
   - `src/typescript/server/api/v1/schemas/filesystem.ts` - File system schemas
   - `src/typescript/server/api/v1/schemas/ui.ts` - UI component schemas
   - `src/typescript/server/api/v1/schemas/keybindings.ts` - Keybinding schemas

4. **Type Definitions**

   - `src/typescript/server/api/v1/types/editor.ts` - Editor types
   - `src/typescript/server/api/v1/types/filesystem.ts` - File system types
   - `src/typescript/server/api/v1/types/ui.ts` - UI component types
   - `src/typescript/server/api/v1/types/keybindings.ts` - Keybinding types

5. **Middleware and Services**
   - `src/typescript/server/api/v1/middleware/fs-security.ts` - File system security middleware
   - `src/typescript/server/api/v1/services/editor-manager.ts` - Editor management service
   - `src/typescript/server/api/v1/services/file-manager.ts` - File management service
   - `src/typescript/server/api/v1/services/ui-manager.ts` - UI management service

### 🧪 Testing Requirements

- [ ] All editor configuration endpoints functional
- [ ] File system operations working with security controls
- [ ] UI component management working correctly
- [ ] Keybinding management functional
- [ ] Authentication and authorization working
- [ ] Input validation tests for all endpoints
- [ ] Error handling tests
- [ ] Response format validation tests
- [ ] Backward compatibility tests
- [ ] Security validation tests for file operations
- [ ] Performance tests for file operations

### ⛓️ Dependencies

- **Blocked By**:
  - Design Unified API Architecture and Standards
  - Migrate Opencode Client APIs
- **Blocks**:
  - None (final migration task)

### 🔗 Related Links

- Source implementation: `packages/electron-editor/src/api/`
- Parent task: [[consolidate-api-routes-endpoints.md]]
- API standards: [[design-unified-api-architecture.md]]
- Editor configuration: `packages/electron-editor/src/config/`
- File system: `packages/electron-editor/src/fs/`
- UI components: `packages/electron-editor/src/ui/`

### 📊 Definition of Done

- All editor configuration endpoints migrated and functional
- File system operation APIs migrated with security controls
- UI component management endpoints migrated
- Keybinding management APIs migrated
- Unified response format applied to all endpoints
- Authentication and authorization implemented
- Input validation applied to all endpoints
- Error handling standardized across APIs
- Backward compatibility maintained
- Comprehensive test coverage
- API documentation updated

---

## 🔍 Relevant Links

- Electron editor source: `packages/electron-editor/src/api/`
- Editor configuration: `packages/electron-editor/src/config/`
- File system: `packages/electron-editor/src/fs/`
- UI components: `packages/electron-editor/src/ui/`
- Keybindings: `packages/electron-editor/src/keybindings/`
- API architecture: `src/typescript/server/api/v1/`
