# @promethean-os/pm2-helpers

PM2 helper utilities for defining and managing applications.

## Features

- **App Definition**: Standardized way to define PM2 applications
- **Service Helpers**: Specialized helpers for Python and Node.js services
- **Agent Management**: Utilities for defining agent-based applications
- **Environment Configuration**: Consistent environment variable setup
- **Logging Setup**: Standardized log file configuration

## Installation

```bash
pnpm add @promethean-os/pm2-helpers
```

## Usage

```typescript
import {
  defineApp,
  definePythonService,
  defineNodeService,
  defineAgent,
  DefineAppOptions,
} from '@promethean-os/pm2-helpers';

// Define a basic application
const app = defineApp('my-app', 'server.js', ['--port', '3000'], {
  instances: 2,
  env: { NODE_ENV: 'production' },
});

// Define a Python service
const pythonService = definePythonService('my-python-service', './services/python-service');

// Define a Node.js service
const nodeService = defineNodeService('my-node-service', './services/node-service');

// Define an agent with multiple applications
const agent = defineAgent('my-agent', [app1, app2], {
  AGENT_CONFIG: 'production',
});
```

## API

### defineApp(name, script, args?, opts?)

Creates a PM2 application definition.

**Parameters:**

- `name`: Application name
- `script`: Script to run
- `args`: Command line arguments (optional)
- `opts`: Configuration options (optional)

**Options:**

- `cwd`: Working directory
- `watch`: Files or directories to watch
- `env_file`: Environment file path
- `env`: Environment variables
- `instances`: Number of instances (default: 1)
- `exec_mode`: Execution mode (default: 'fork')

### definePythonService(name, serviceDir, opts?)

Helper for defining Python services using pipenv.

**Parameters:**

- `name`: Service name
- `serviceDir`: Service directory path
- `opts`: Additional options

### defineNodeService(name, serviceDir, opts?)

Helper for defining Node.js services.

**Parameters:**

- `name`: Service name
- `serviceDir`: Service directory path
- `opts`: Additional options

### defineAgent(name, appDefs, opts?)

Helper for defining agent-based applications.

**Parameters:**

- `name`: Agent name
- `appDefs`: Array of application definitions
- `opts`: Additional agent options

## Constants

- `defineApp.HEARTBEAT_PORT`: Default heartbeat port (5005)
- `defineApp.PYTHONPATH`: Resolved Python path

## License

GPL-3.0-only
