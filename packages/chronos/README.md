# Chronos - Time Tracker for Contracting

A time tracking application with agent tool integration for pi and opencode.

## Features

- **Web UI**: Clean dashboard for manual time tracking
- **HTTP API**: REST API for programmatic access
- **Agent Tool**: Integration with pi and opencode agents
- **SQLite Storage**: Persistent local storage
- **Project Management**: Clients, rates, and project organization

## Quick Start

```bash
# Install dependencies
bun install

# Start the server
bun start

# Open in browser
open http://localhost:5199
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sessions
- `POST /api/sessions/start` - Start a session (project_id or project_name)
- `POST /api/sessions/:id/stop` - Stop a session
- `POST /api/sessions/stop-all` - Stop all active sessions
- `GET /api/sessions/active` - Get active sessions
- `GET /api/sessions` - List recent sessions
- `GET /api/sessions/:id` - Get session details

### Reports
- `GET /api/reports/daily` - Daily time summary
- `GET /api/reports/sessions` - Sessions by date range
- `GET /api/reports/project/:id` - Total time for project

### Agent
- `GET /api/agent/status` - Quick status for agent tools

## Agent Tool Integration

### For pi (this repository)

Copy `tools/chronos-tool.ts` to your pi tools directory or add it to your agent configuration.

### For opencode

Add the tool definition to your opencode configuration:

```json
{
  "tools": [
    {
      "name": "chronos",
      "path": "/path/to/chronos/tools/chronos-tool.ts"
    }
  ]
}
```

### Usage Examples

```typescript
// Start tracking time
chronos({ action: 'start', project: 'ClientA', task: 'Code review' })

// Check status
chronos({ action: 'status' })

// Stop current session
chronos({ action: 'stop' })

// Create a project
chronos({ action: 'project_create', project: 'NewClient', hourly_rate: 150 })
```

## Environment Variables

- `CHRONOS_PORT` - Server port (default: 5199)
- `CHRONOS_URL` - API URL for agent tool (default: http://localhost:5199)

## Data Storage

Data is stored in `~/.chronos/chronos.db` (SQLite).

## License

GPL-3.0-or-later