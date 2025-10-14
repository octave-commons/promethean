# PM2 Tool

A comprehensive PM2 process manager tool for the OpenCode framework that provides production-ready application management capabilities.

## Overview

This tool offers complete PM2 functionality including:

- Process lifecycle management (start, stop, restart, delete)
- Process monitoring and status tracking
- Log management and viewing
- Cluster mode scaling
- Startup configuration
- Zero-downtime deployments

## Available Tools

### Core Process Management

#### `startProcess`

Start a new process with PM2 using configuration options.

**Parameters:**

- `script` (required): Script file to execute (relative path)
- `name` (optional): Process name (auto-generated if not provided)
- `args` (optional): Arguments to pass to the script
- `cwd` (optional): Working directory
- `instances` (optional): Number of instances or "max" for cluster mode
- `exec_mode` (optional): Execution mode ("fork" or "cluster")
- `watch` (optional): Enable file watching
- `autorestart` (optional): Auto-restart on failure
- `max_memory_restart` (optional): Restart when memory exceeds threshold (e.g., "1G")
- `env` (optional): Environment variables
- `log_file`, `out_file`, `error_file` (optional): Log file paths

**Example:**

```javascript
await startProcess({
  script: 'server.js',
  name: 'my-app',
  instances: 'max',
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    PORT: '3000',
  },
});
```

#### `stopProcess`

Stop a running PM2 process.

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

#### `restartProcess`

Restart a PM2 process.

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

#### `deleteProcess`

Delete a PM2 process (removes from PM2 list).

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

### Process Information

#### `listProcesses`

List all PM2 processes with their status and information.

**Parameters:**

- `detailed` (optional, default: false): Include detailed process information

#### `showProcessInfo`

Show detailed information about a specific PM2 process.

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

#### `getPM2Status`

Get PM2 daemon status and quick process overview.

#### `describeProcess`

Get detailed process description including configuration.

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

### Log Management

#### `showLogs`

Show logs for a PM2 process.

**Parameters:**

- `nameOrId` (optional): Process name or PM2 ID (omit for all processes)
- `lines` (optional, default: 100): Number of lines to show
- `type` (optional, default: "combined"): Log type ("out", "error", "combined")
- `raw` (optional, default: false): Show raw logs without formatting

#### `flushLogs`

Flush logs for all PM2 processes or a specific process.

**Parameters:**

- `nameOrId` (optional): Process name or PM2 ID (omit for all processes)

#### `reloadLogs`

Reload all logs (close and reopen all log files).

### Advanced Operations

#### `scaleProcess`

Scale a cluster process to a specific number of instances.

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID
- `instances` (required): Number of instances or "max"

#### `reloadProcess`

Reload a process without downtime (zero-downtime reload).

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

#### `gracefulReload`

Gracefully reload a process (wait for connections to finish).

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

#### `resetMetadata`

Reset metadata for a process (restart count, etc.).

**Parameters:**

- `nameOrId` (required): Process name or PM2 ID

### System Management

#### `startup`

Setup PM2 startup script for system boot.

**Parameters:**

- `platform` (optional): Platform ("ubuntu", "centos", "redhat", "gentoo", "systemd", "darwin", "amazon", "freebsd")
- `user` (optional): User to run PM2 as

#### `generateStartupScript`

Generate and display the startup script without executing it.

**Parameters:**

- `platform` (optional): Platform (auto-detected if not provided)
- `user` (optional): User to run PM2 as

#### `saveProcessList`

Save current process list to be resurrected on PM2 restart.

#### `resurrectProcesses`

Resurrect previously saved processes.

#### `killPM2`

Kill PM2 daemon and all processes.

#### `monitor`

Monitor PM2 processes (real-time monitoring).

**Parameters:**

- `nameOrId` (optional): Process name or PM2 ID to monitor

#### `getPM2Version`

Get PM2 version and system information.

## Security Features

The PM2 tool includes several security measures:

1. **Path Validation**: Script paths must be relative and cannot contain parent directory references
2. **Process Name Validation**: Process names can only contain letters, numbers, hyphens, and underscores
3. **Command Timeout**: All PM2 commands have a 30-second timeout to prevent hanging
4. **Error Handling**: Comprehensive error handling with custom PM2Error class
5. **Input Sanitization**: All inputs are validated before execution

## Error Handling

The tool uses a custom `PM2Error` class that includes:

- Error code for programmatic handling
- Descriptive error message
- Command that caused the error

## Usage Examples

### Basic Web Server Management

```javascript
// Start a Node.js web server in cluster mode
await startProcess({
  script: 'src/server.js',
  name: 'web-server',
  instances: 'max',
  exec_mode: 'cluster',
  autorestart: true,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: '3000',
  },
});

// Check status
const status = await getPM2Status();
console.log(status);

// View logs
const logs = await showLogs({
  nameOrId: 'web-server',
  lines: 50,
  type: 'combined',
});
```

### Zero-Downtime Deployment

```javascript
// Deploy new version without downtime
await reloadProcess({
  nameOrId: 'web-server',
});

// Or graceful reload for connection-aware applications
await gracefulReload({
  nameOrId: 'web-server',
});
```

### Process Scaling

```javascript
// Scale to 4 instances
await scaleProcess({
  nameOrId: 'web-server',
  instances: 4,
});

// Or scale to maximum CPU cores
await scaleProcess({
  nameOrId: 'web-server',
  instances: 'max',
});
```

### System Setup

```javascript
// Setup PM2 to start on system boot
await startup({
  platform: 'systemd',
});

// Save current process list
await saveProcessList();
```

## Integration with OpenCode

The PM2 tool integrates seamlessly with the OpenCode framework:

1. **Context Awareness**: All operations include agent and session tracking
2. **Error Reporting**: Errors are properly formatted for OpenCode error handling
3. **JSON Responses**: All tools return structured JSON responses
4. **Type Safety**: Full TypeScript support with comprehensive type definitions

## Best Practices

1. **Always use process names** for easier management
2. **Set memory limits** with `max_memory_restart` to prevent memory leaks
3. **Use cluster mode** for production applications to utilize all CPU cores
4. **Configure log rotation** to prevent disk space issues
5. **Save process list** after making changes to ensure persistence
6. **Use graceful reload** for applications that handle persistent connections
7. **Monitor process health** regularly with `getPM2Status` and `showProcessInfo`

## Troubleshooting

### Common Issues

1. **Process won't start**: Check script path and ensure it's relative
2. **Permission denied**: Ensure the script file has execute permissions
3. **Port already in use**: Check if another process is using the same port
4. **Memory issues**: Set appropriate `max_memory_restart` limits
5. **Log files not created**: Check directory permissions for log paths

### Debug Commands

```javascript
// Get detailed process information
await describeProcess({ nameOrId: 'problematic-process' });

// Check recent logs
await showLogs({
  nameOrId: 'problematic-process',
  lines: 100,
  type: 'error',
});

// Get system report
await getPM2Version();
```

## Migration from Direct PM2

If you're currently using PM2 directly, here's how to migrate common commands:

| PM2 Command                      | PM2 Tool Equivalent                                  |
| -------------------------------- | ---------------------------------------------------- |
| `pm2 start app.js --name my-app` | `startProcess({ script: "app.js", name: "my-app" })` |
| `pm2 stop my-app`                | `stopProcess({ nameOrId: "my-app" })`                |
| `pm2 restart my-app`             | `restartProcess({ nameOrId: "my-app" })`             |
| `pm2 delete my-app`              | `deleteProcess({ nameOrId: "my-app" })`              |
| `pm2 list`                       | `listProcesses()`                                    |
| `pm2 logs my-app`                | `showLogs({ nameOrId: "my-app" })`                   |
| `pm2 monit`                      | `monitor()`                                          |
| `pm2 save`                       | `saveProcessList()`                                  |
| `pm2 startup`                    | `startup()`                                          |

## Performance Considerations

1. **Cluster Mode**: Use cluster mode for CPU-intensive applications
2. **Memory Management**: Set appropriate memory limits to prevent OOM kills
3. **Log Management**: Configure log rotation to prevent disk space issues
4. **Process Limits**: Don't exceed system limits for file descriptors and processes
5. **Monitoring**: Regular monitoring helps identify performance issues early

## Security Considerations

1. **Script Validation**: All script paths are validated for security
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **File Permissions**: Ensure proper file permissions for scripts and logs
4. **Network Access**: Consider network restrictions for production environments
5. **Resource Limits**: Set appropriate resource limits to prevent abuse
