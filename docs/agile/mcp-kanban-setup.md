# Kanban MCP Endpoint Setup

## Overview

This document describes the setup and configuration of the MCP (Model Context Protocol) server endpoint for kanban tooling in the Promethean framework.

## Configuration

The kanban endpoint is configured in `promethean.mcp.json` under the `endpoints.kanban` section.

### Available Tools

The endpoint provides **17 kanban management tools**:

#### Core Board Operations

- `kanban.get-board` - Load the complete kanban board
- `kanban.get-column` - Fetch a specific column and its tasks
- `kanban.sync-board` - Synchronize board and task files

#### Task Search and Discovery

- `kanban.find-task` - Find task by UUID
- `kanban.find-task-by-title` - Find task by exact title match
- `kanban.search` - Search tasks with flexible queries

#### Task Management

- `kanban.update-status` - Move task between columns (FSM compliant)
- `kanban.move-task` - Reorder task within column
- `kanban.update-task-description` - Update task content
- `kanban.rename-task` - Update task title

#### Task Organization

- `kanban.archive-task` - Move task to archive
- `kanban.delete-task` - Permanently delete task
- `kanban.merge-tasks` - Combine multiple tasks
- `kanban.bulk-archive` - Archive multiple tasks

#### AI-Assisted Tools

- `kanban.analyze-task` - AI-powered task analysis
- `kanban.rewrite-task` - AI-assisted task improvement
- `kanban.breakdown-task` - AI-powered task decomposition

## Usage

### Starting the MCP Server

```bash
# Development mode
pnpm --filter @promethean/mcp dev

# Production mode
pnpm --filter @promethean/mcp build
node packages/mcp/dist/index.js
```

### Accessing the Kanban Endpoint

When the MCP server is running with HTTP transport, the kanban tools are available at:

```
http://localhost:3000/kanban
```

### Example Tool Usage

#### Get Board Status

```json
{
  "tool": "kanban.get-board",
  "arguments": {}
}
```

#### Search for Tasks

```json
{
  "tool": "kanban.search",
  "arguments": {
    "query": "MCP setup"
  }
}
```

#### Update Task Status

```json
{
  "tool": "kanban.update-status",
  "arguments": {
    "uuid": "936b26de-61b4-4d8d-94d7-171315a56ac9",
    "status": "in_progress"
  }
}
```

#### AI Task Analysis

```json
{
  "tool": "kanban.analyze-task",
  "arguments": {
    "boardFile": "/path/to/board.md",
    "uuid": "task-uuid",
    "analysisType": "complexity",
    "context": {
      "projectInfo": "Promethean MCP integration",
      "teamContext": "Backend development team"
    }
  }
}
```

## Configuration Details

### Endpoint Metadata

The kanban endpoint includes comprehensive metadata:

```json
{
  "meta": {
    "title": "Kanban Task Management",
    "description": "Complete kanban board management with task creation, updates, analysis, and AI-assisted workflow tools.",
    "workflow": [
      "kanban.get-board -> kanban.search",
      "kanban.find-task -> kanban.update-status",
      "kanban.analyze-task -> kanban.breakdown-task",
      "kanban.breakdown-task -> kanban.update-task-description"
    ],
    "expectations": {
      "usage": [
        "Use kanban.get-board first to understand current state",
        "Use kanban.search to find relevant tasks",
        "Use kanban.analyze-task for AI-powered insights",
        "Use kanban.breakdown-task to decompose complex tasks"
      ],
      "pitfalls": [
        "kanban.update-status requires valid FSM transitions",
        "kanban.delete-task is permanent and cannot be undone",
        "AI-assisted tools require proper context for best results"
      ],
      "prerequisites": [
        "Understand kanban FSM transition rules",
        "Have appropriate permissions for task modifications"
      ]
    }
  }
}
```

### FSM Compliance

The kanban system implements a Finite State Machine with strict transition rules:

- `ready` → `todo` → `in_progress` → `testing` → `review` → `document` → `done`
- Special transitions: `blocked`, `breakdown`, `icebox`, `rejected`
- All transitions are validated and enforced

## Integration with AI Agents

The kanban MCP endpoint is designed for seamless integration with AI agents:

1. **Tool Discovery**: Agents can use `mcp_help` and `mcp_toolset` to discover available tools
2. **Context Management**: Tools accept optional context parameters for AI assistance
3. **Error Handling**: Comprehensive error messages guide agents in proper usage
4. **Validation**: Input validation prevents invalid state transitions

## Troubleshooting

### Common Issues

1. **FSM Transition Errors**

   - Ensure target status is valid from current status
   - Check WIP limits for target column
   - Verify task dependencies

2. **File Path Resolution**

   - Use absolute paths or ensure relative paths are correct
   - Check file permissions for board and task directories

3. **AI Tool Context**
   - Provide sufficient context for AI-assisted tools
   - Include project information and team context when available

### Validation

Validate configuration:

```bash
# Check JSON syntax
python3 -c "import json; json.load(open('promethean.mcp.json'))"

# Test MCP server startup
pnpm --filter @promethean/mcp dev
```

## Development

### Adding New Kanban Tools

1. Implement tool in `packages/mcp/src/tools/kanban.ts`
2. Export tool function following naming convention `kanbanToolName`
3. Register tool in `packages/mcp/src/index.ts` toolCatalog
4. Add to endpoint configuration in `promethean.mcp.json`
5. Update documentation

### Testing

```bash
# Run kanban-specific tests
pnpm --filter @promethean/mcp test --match="*kanban*"

# Run integration tests
pnpm --filter @promethean/mcp test --match="*integration*"
```

## Security Considerations

- Task file operations respect file system permissions
- Status transitions enforce business rules
- AI tools operate within defined context boundaries
- No direct file system access outside configured paths

## Performance

- Board loading optimized for large task sets
- Search operations use efficient indexing
- AI tools include caching for repeated operations
- Bulk operations minimize file I/O
