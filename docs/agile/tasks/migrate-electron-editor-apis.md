---
uuid: '448a4bac-0003-0000-0000-000000000003'
title: 'Migrate Electron Editor APIs'
slug: 'migrate-electron-editor-apis'
status: 'incoming'
priority: 'P0'
labels: ['api', 'migration', 'electron', 'editor', 'consolidation']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '1 session'
---

## ⚡ Migrate Electron Editor APIs

### 📋 Description

Migrate and consolidate all editor configuration, file system operations, and UI component APIs from opencode-cljs-electron package into the unified API structure.

### 🎯 Goals

- Migrate editor configuration endpoints
- Migrate file system operation APIs
- Migrate UI component APIs
- Migrate keybinding management endpoints
- Apply unified response formats and validation
- Maintain existing functionality

### ✅ Acceptance Criteria

- [ ] Editor configuration endpoints migrated to /api/v1/editor/config
- [ ] File system operations migrated to /api/v1/files
- [ ] UI component APIs migrated to /api/v1/ui/components
- [ ] Keybinding management migrated to /api/v1/editor/keybindings
- [ ] All endpoints use unified response format
- [ ] Input validation implemented using JSON Schema
- [ ] Error handling follows unified standards
- [ ] All existing functionality preserved

### 🔧 Technical Specifications

#### Endpoints to Migrate:

1. **Editor Configuration**

   - GET /api/v1/editor/config (get current config)
   - PUT /api/v1/editor/config (update config)
   - GET /api/v1/editor/config/:section (get config section)
   - PUT /api/v1/editor/config/:section (update config section)

2. **File System Operations**

   - GET /api/v1/files (list files/directories)
   - GET /api/v1/files/:path (get file/directory info)
   - POST /api/v1/files (create file/directory)
   - PUT /api/v1/files/:path (update file)
   - DELETE /api/v1/files/:path (delete file/directory)
   - POST /api/v1/files/:path/copy (copy file/directory)
   - POST /api/v1/files/:path/move (move file/directory)

3. **UI Components**

   - GET /api/v1/ui/components (list available components)
   - GET /api/v1/ui/components/:id (get component details)
   - POST /api/v1/ui/components/:id/render (render component)
   - GET /api/v1/ui/themes (list available themes)
   - PUT /api/v1/ui/themes/:id (apply theme)

4. **Keybinding Management**
   - GET /api/v1/editor/keybindings (get current keybindings)
   - PUT /api/v1/editor/keybindings (update keybindings)
   - GET /api/v1/editor/keybindings/:mode (get mode-specific keybindings)
   - POST /api/v1/editor/keybindings/reset (reset to defaults)

#### Implementation Requirements:

- Use Fastify route definitions with JSON Schema validation
- Apply unified response wrapper format
- Implement consistent error responses
- Preserve existing file system operations
- Add proper TypeScript types
- Maintain backward compatibility

### 📁 Files/Components to Create

- `src/typescript/server/api/v1/routes/editor.ts`
- `src/typescript/server/api/v1/routes/files.ts`
- `src/typescript/server/api/v1/routes/ui.ts`
- `src/typescript/server/api/v1/schemas/editor.ts`
- `src/typescript/server/api/v1/schemas/files.ts`
- `src/typescript/server/api/v1/schemas/ui.ts`

### ⛓️ Dependencies

- **Blocked By**: Migrate Opencode Client APIs
- **Blocks**: Implement API Documentation

### 📊 Definition of Done

- All electron editor endpoints migrated
- Unified response format applied
- Validation schemas implemented
- Tests passing for all migrated endpoints
- Documentation updated
- Backward compatibility maintained

---
