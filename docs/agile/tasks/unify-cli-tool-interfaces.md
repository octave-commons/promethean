---
uuid: "f3c311a0-de6a-44ba-90ac-ad8ab96f4699"
title: "Unify CLI and Tool Interfaces"
slug: "unify-cli-tool-interfaces"
status: "incoming"
priority: "P1"
labels: ["cli", "tools", "interfaces", "unification", "epic3"]
created_at: "2025-10-18T00:00:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.291Z"
    action: "Bulk commit tracking initialization"
---

## 🛠️ Unify CLI and Tool Interfaces

### 📋 Description

Unify the CLI and tool interfaces from `@promethean/opencode-client` into a single, consistent command-line interface for the unified package. This involves consolidating command structures, standardizing help and documentation, and creating a cohesive user experience.

### 🎯 Goals

- Single CLI entry point for all functionality
- Unified command structure and organization
- Consistent help and documentation
- Improved user experience and discoverability
- Simplified installation and setup

### ✅ Acceptance Criteria

- [ ] Single CLI entry point implemented
- [ ] Unified command structure established
- [ ] Consistent help and documentation
- [ ] All existing CLI functionality preserved
- [ ] Command validation and error handling
- [ ] Auto-completion support
- [ ] Configuration management unified

### 🔧 Technical Specifications

#### CLI Components to Unify:

1. **Command Structure**

   - Consolidated command hierarchy
   - Consistent command naming
   - Unified argument parsing
   - Standardized option handling

2. **Help System**

   - Unified help documentation
   - Command discovery and suggestions
   - Examples and usage patterns
   - Interactive help and tutorials

3. **Configuration Management**

   - Unified configuration file format
   - Environment variable handling
   - Configuration validation
   - Profile and workspace management

4. **Tool Integration**
   - Plugin system for tools
   - Tool discovery and loading
   - Tool version management
   - Tool dependency resolution

#### Unified CLI Architecture:

```typescript
// Proposed CLI structure
src/typescript/cli/
├── core/
│   ├── CLI.ts                 # Main CLI entry point
│   ├── CommandManager.ts      # Command registration
│   ├── ConfigManager.ts       # Configuration management
│   └── PluginManager.ts       # Plugin system
├── commands/
│   ├── agents/                # Agent management commands
│   ├── sessions/              # Session management commands
│   ├── ollama/                # Ollama queue commands
│   ├── dualstore/             # Dual-store commands
│   ├── editor/                # Editor commands
│   └── config/                # Configuration commands
├── utils/
│   ├── help.ts                # Help system
│   ├── validation.ts          # Command validation
│   ├── completion.ts          # Auto-completion
│   └── formatting.ts          # Output formatting
├── plugins/
│   ├── tool-loader.ts         # Tool loading
│   ├── plugin-api.ts          # Plugin interface
│   └── plugin-registry.ts     # Plugin registry
└── templates/
    ├── command.template.ts     # Command template
    └── plugin.template.ts     # Plugin template
```

#### Command Organization:

1. **Agent Commands**

   ```bash
   opencode agent list
   opencode agent create <name>
   opencode agent start <id>
   opencode agent stop <id>
   opencode agent status <id>
   ```

2. **Session Commands**

   ```bash
   opencode session list
   opencode session create <name>
   opencode session connect <id>
   opencode session disconnect <id>
   ```

3. **Ollama Commands**

   ```bash
   opencode ollama queue status
   opencode ollama model list
   opencode ollama inference run <model> <prompt>
   ```

4. **Configuration Commands**
   ```bash
   opencode config list
   opencode config set <key> <value>
   opencode config get <key>
   opencode config init
   ```

### 📁 Files/Components to Migrate

#### From `@promethean/opencode-client`:

1. **CLI Core**

   - `src/cli/CLI.ts` - Main CLI entry point
   - `src/cli/CommandManager.ts` - Command management
   - `src/cli/ConfigManager.ts` - Configuration

2. **Command Implementations**

   - `src/cli/commands/` - All command implementations
   - `src/cli/utils/` - CLI utilities and helpers

3. **Plugin System**
   - `src/cli/plugins/` - Plugin management
   - `src/cli/templates/` - Command and plugin templates

#### New Components to Create:

1. **Enhanced Command System**

   - Advanced command discovery
   - Command validation and suggestions
   - Interactive command builder

2. **Improved Help System**

   - Contextual help and examples
   - Interactive tutorials
   - Command usage analytics

3. **Advanced Configuration**
   - Configuration profiles and workspaces
   - Configuration validation and migration
   - Environment-specific configurations

### 🧪 Testing Requirements

- [ ] All CLI commands functional
- [ ] Command validation tests
- [ ] Help system tests
- [ ] Configuration management tests
- [ ] Plugin system tests
- [ ] Auto-completion tests
- [ ] Error handling tests

### 📋 Subtasks

1. **Create Single CLI Entry Point** (1 point)

   - Consolidate CLI entry points
   - Implement unified command registration
   - Set up consistent argument parsing

2. **Unify Command Structure** (1 point)

   - Standardize command organization
   - Implement consistent help system
   - Add command validation

3. **Implement Configuration Management** (1 point)
   - Unify configuration handling
   - Add configuration validation
   - Implement profile management

### ⛓️ Dependencies

- **Blocked By**:
  - Integrate Ollama queue functionality
- **Blocks**:
  - Testing and quality assurance
  - Documentation migration

### 🔗 Related Links

- [[PACKAGE_CONSOLIDATION_PLAN_STORY_POINTS.md]]
- Current CLI implementation: `packages/opencode-client/src/cli/`
- Commander.js documentation: https://github.com/tj/commander.js
- CLI best practices: `docs/cli-guidelines.md`

### 📊 Definition of Done

- CLI interfaces fully unified
- Single entry point functional
- All commands working consistently
- Help system comprehensive
- Configuration management unified
- Auto-completion support implemented

---

## 🔍 Relevant Links

- CLI core: `packages/opencode-client/src/cli/CLI.ts`
- Commands: `packages/opencode-client/src/cli/commands/`
- Configuration: `packages/opencode-client/src/cli/ConfigManager.ts`
- Plugin system: `packages/opencode-client/src/cli/plugins/`
