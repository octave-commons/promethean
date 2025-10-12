---
uuid: "a7b8c9d0-e1f2-4a5b-9c8d-0e1f2a3b4c5d"
title: "Fix kanban config path resolution and document usage for agents"
slug: "fix-kanban-config-path-resolution-and-documentation"
status: "done"
priority: "P2"
labels: ["agents", "cli", "config", "documentation", "kanban"]
<<<<<<< HEAD
created_at: "2025-10-12T22:46:41.458Z"
=======
created_at: "2025-10-12T21:40:23.580Z"
>>>>>>> bug/kanban-duplication-issues
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
## 🛠️ Task: Fix kanban config path resolution and document usage for agents

## 🐛 Problem Statement

The kanban CLI has a path resolution bug where when called from subdirectories, it finds the correct config file but resolves output paths relative to the current working directory instead of the config file location. This causes agents to think they need to navigate to specific directories to use the kanban tool.

## 🎯 Desired Outcome

### Code Fixes:
1. **Fix path resolution** in `packages/kanban/src/board/config/sources.ts` and related files
2. **Config paths should resolve relative to config file location**, not current working directory
3. **Maintain backward compatibility** for existing usage patterns

### Documentation Updates:
1. **README.md** - Add comprehensive kanban usage section
2. **AGENTS** - Document kanban tool usage guidelines for AI agents
3. **CLAUDE** - Add kanban usage instructions for Claude interactions
4. **Package documentation** - Update kanban package README

## 📋 Requirements

### Code Changes:
- [ ] Update `findConfigPath` function to resolve relative paths from config directory
- [ ] Ensure `boardFile`, `tasksDir`, and `indexFile` paths resolve correctly
- [ ] Add tests for path resolution from various subdirectories
- [ ] Maintain existing CLI argument overrides functionality
- [ ] Ensure environment variable overrides still work

### Documentation:
- [ ] Update main README.md with kanban usage section
- [ ] Update AGENTS file with kanban tool guidelines
- [ ] Update CLAUDE file with kanban usage instructions
- [ ] Add kanban package documentation examples
- [ ] Document path resolution behavior

### Agent Guidelines:
- [ ] Clarify that kanban commands work from any directory in the repo
- [ ] Document common kanban workflows for agents
- [ ] Provide examples of proper kanban usage
- [ ] Explain when to use flags vs config file

## 🏗️ Implementation Plan

### Phase 1: Code Fix
1. **Analyze current path resolution logic** in `packages/kanban/src/board/config/`
2. **Update `resolveWithBase` function** to use config directory as base for relative paths
3. **Add comprehensive tests** for subdirectory usage scenarios
4. **Ensure backward compatibility** for existing workflows

### Phase 2: Documentation
1. **Audit current documentation** across README, AGENTS, CLAUDE files
2. **Write comprehensive kanban usage section** for README
3. **Create agent-specific guidelines** for AGENTS file
4. **Add Claude-specific instructions** to CLAUDE file
5. **Update kanban package documentation** with examples

### Phase 3: Agent Guidelines
1. **Document best practices** for agent kanban usage
```
2. **Provide common workflow examples**
```
3. **Explain when navigation is needed vs when it's not**
4. **Add troubleshooting guidance** for common agent issues

## 📚 Documentation Content Outline

### README.md - Kanban Section
- Overview of kanban system
- Basic usage examples
- Configuration explanation
- Common workflows
- Agent usage guidelines

### AGENTS File
- Kanban tool access patterns
- When to use flags vs config
- Common agent workflows
- Best practices and gotchas

### CLAUDE File
- Claude-specific kanban interactions
- Task management workflows
- Board generation and updates
- Troubleshooting common issues

## ⛓️ Dependencies

- Code analysis of kanban package path resolution
- Understanding of current config system
- Documentation audit across multiple files

## 🔗 Related Resources

- Current kanban config: `promethean.kanban.json`
- Kanban package: `packages/kanban/`
- Config sources: `packages/kanban/src/board/config/sources.ts`
- Documentation files: `README.md`, `AGENTS`, `CLAUDE`

## ✅ Acceptance Criteria

1. **Code Fix**: Kanban commands work correctly from any subdirectory
2. **Backward Compatibility**: Existing workflows continue to work
3. **Documentation**: All target files updated with kanban guidance
4. **Agent Guidelines**: Clear instructions for AI agent usage
5. **Testing**: Comprehensive test coverage for path resolution
6. **Examples**: Practical usage examples in documentation

## 📝 Notes

- This affects both human and agent users of the kanban system
- Priority is making it "just work" from any directory
- Documentation is as important as the code fix
- Consider adding debug/logging for path resolution troubleshooting

## ✅ Completion Summary

- Updated repo detection to anchor on `.git`/`pnpm-workspace.yaml`, ensuring the
  CLI always uses the repository root for default paths even from deep
  subdirectories.
- Added regression tests that load the kanban config and execute the CLI from
  nested folders to confirm board/task/index paths resolve from the config
  directory.
- Expanded README, AGENTS, CLAUDE, and package docs with clear guidance on
  running kanban commands, how overrides interact, and troubleshooting tips for
  agents.








































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
