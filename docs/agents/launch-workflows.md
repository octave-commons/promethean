# Agent Launch Workflows

This document provides standardized launch workflows for all Promethean agents, ensuring consistent developer experience and operational patterns.

## 🚀 Quick Start

For immediate agent launching, use the standardized pnpm workflows:

```bash
# Development mode (with hot reload)
pnpm --filter @promethean/cephalon dev

# Production mode
pnpm --filter @promethean/cephalon start

# Build and run
pnpm --filter @promethean/cephalon build && pnpm --filter @promethean/cephalon start
```

## 📋 Agent Inventory

### Core Agents

| Agent               | Package                            | Dev Command      | Start Command  | Health Check        |
| ------------------- | ---------------------------------- | ---------------- | -------------- | ------------------- |
| **Cephalon**        | `@promethean/cephalon`             | `pnpm start:dev` | `pnpm start`   | `GET /health`       |
| **Duck Web**        | `@promethean/duck-web`             | `pnpm dev`       | `pnpm preview` | `GET /`             |
| **ENSO Gateway**    | `@promethean/enso-browser-gateway` | `pnpm dev`       | N/A            | WebSocket handshake |
| **SmartGPT Bridge** | `@promethean/smartgpt-bridge`      | `pnpm dev`       | `pnpm start`   | `GET /health`       |

### Supporting Services

| Service           | Package                 | Dev Command | Start Command | Port   |
| ----------------- | ----------------------- | ----------- | ------------- | ------ |
| **Broker**        | `@promethean/broker`    | `pnpm dev`  | `pnpm start`  | 7000   |
| **LLM Service**   | `@promethean/llm`       | `pnpm dev`  | `pnpm start`  | 8888   |
| **Voice Service** | `@promethean/voice`     | `pnpm dev`  | `pnpm start`  | varies |
| **Embedding**     | `@promethean/embedding` | `pnpm dev`  | `pnpm start`  | varies |

## 🔧 Standardized Scripts

All agent packages MUST follow this script convention:

```json
{
  "scripts": {
    "dev": "Development launch with hot reload",
    "start": "Production launch",
    "build": "Build TypeScript to dist/",
    "test": "Run test suite",
    "health": "Health check endpoint verification",
    "clean": "Clean build artifacts",
    "lint": "Code linting",
    "typecheck": "TypeScript verification"
  }
}
```

### Script Implementation Patterns

#### Development Mode (`dev`)

```bash
# TypeScript with watch mode
node --loader ts-node/esm src/index.ts

# Or with nodemon for hot reload
nodemon --exec "node --loader ts-node/esm" src/index.ts

# Or with vite for web services
vite --open
```

#### Production Mode (`start`)

```bash
# Built JavaScript
node dist/index.js

# Or with environment file
node --env-file=../../.env dist/index.js
```

#### Health Check (`health`)

```bash
# Simple curl health check
curl -f http://localhost:${PORT:-3000}/health || exit 1

# Or with node health check
node scripts/health-check.js
```

## 🏗️ Ecosystem Management

### PM2 Configuration

The repository uses PM2 for process management. The main ecosystem config is at `ecosystem.config.js`.

#### Launch Individual Agents

```bash
# Start specific agent
pm2 start ecosystem.config.js --only cephalon

# Start with custom environment
pm2 start ecosystem.config.js --only cephalon --env development

# Restart agent
pm2 restart cephalon

# Stop agent
pm2 stop cephalon

# Delete agent
pm2 delete cephalon
```

#### Launch Full Ecosystem

```bash
# Start all agents
pm2 start ecosystem.config.js

# Start specific group
pm2 start ecosystem.config.js --only agents

# Save current process list
pm2 save

# Generate startup script
pm2 startup
```

### Environment Variables

Standardized environment variables for all agents:

```bash
# Core Configuration
NODE_ENV=development|production
PORT=3000                    # HTTP port
HOST=localhost              # Bind address

# Process Management
PM2_PROCESS_NAME=agent-name
HEARTBEAT_PORT=5005         # Health check port
CHECK_INTERVAL=300000       # 5 minutes
HEARTBEAT_TIMEOUT=600000    # 10 minutes

# Development
PYTHONUNBUFFERED=1
PYTHONPATH=./packages/pm2-helpers

# Logging
LOG_LEVEL=info|debug|error
LOG_FILE=./logs/agent-out.log
ERROR_FILE=./logs/agent-err.log
```

## 📦 Package Dependencies

### Standard Agent Dependencies

```json
{
  "dependencies": {
    "@promethean/agent-ecs": "workspace:*",
    "@promethean/utils": "workspace:*",
    "@promethean/security": "workspace:*",
    "dotenv": "^17.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### Agent-Specific Dependencies

| Agent Type           | Required Dependencies                |
| -------------------- | ------------------------------------ |
| **Discord Agents**   | `discord.js`, `@discordjs/voice`     |
| **Web Services**     | `fastify`, `@fastify/websocket`      |
| **Audio Processing** | `@promethean/duck-audio`, `wav`      |
| **AI/LLM**           | `@promethean/llm`, `ollama`          |
| **Database**         | `mongodb`, `@promethean/persistence` |

## 🔄 Development Workflow

### 1. Local Development

```bash
# Clone and install
git clone <repo>
cd promethean
pnpm install

# Start specific agent in dev mode
pnpm --filter @promethean/cephalon start:dev

# Or start with PM2 for process management
pm2 start ecosystem.config.js --only cephalon --env development
```

### 2. Testing

```bash
# Run agent tests
pnpm --filter @promethean/cephalon test

# Run with coverage
pnpm --filter @promethean/cephalon coverage

# Type checking
pnpm --filter @promethean/cephalon typecheck
```

### 3. Building

```bash
# Build agent
pnpm --filter @promethean/cephalon build

# Verify build
pnpm --filter @promethean/cephalon start
```

### 4. Production Deployment

```bash
# Build all agents
pnpm --filter "@promethean/*" build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit
pm2 logs cephalon
```

## 🏥 Health Monitoring

### Standard Health Endpoints

All agents MUST implement a health check endpoint:

```javascript
// Example health endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  };

  res.json(health);
});
```

### Health Check Script

Create `scripts/health-check.js` in each agent package:

```javascript
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log('❌ Health check failed:', res.statusCode);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if port is already in use

   ```bash
   lsof -i :3000
   # Or use different PORT
   PORT=3001 pnpm --filter @promethean/cephalon start
   ```

2. **Missing Dependencies**: Ensure workspace packages are linked

   ```bash
   pnpm install
   pnpm --filter @promethean/cephalon install
   ```

3. **TypeScript Build Errors**: Check configuration

   ```bash
   pnpm --filter @promethean/cephalon typecheck
   ```

4. **PM2 Process Issues**: Check logs and restart
   ```bash
   pm2 logs cephalon
   pm2 restart cephalon
   pm2 delete cephalon && pm2 start ecosystem.config.js --only cephalon
   ```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* pnpm --filter @promethean/cephalon start:dev
```

### Process Monitoring

Monitor agent processes:

```bash
# PM2 monitoring
pm2 monit

# System resource usage
htop
iotop

# Log monitoring
tail -f logs/cephalon-out.log
tail -f logs/cephalon-err.log
```

## 📚 Documentation Templates

### Agent README Template

Each agent package should include a README with:

```markdown
# @promethean/agent-name

## Description

Brief description of the agent's purpose and functionality.

## Quick Start

\`\`\`bash

# Development

pnpm dev

# Production

pnpm build && pnpm start
\`\`\`

## Configuration

Environment variables and configuration options.

## Health Check

\`\`\`bash
curl http://localhost:3000/health
\`\`\`

## Dependencies

Key dependencies and their purposes.

## Development

Development setup and testing instructions.
```

## 🔄 Migration from Makefile

Old Makefile targets and their pnpm equivalents:

| Make Target        | pnpm Equivalent                         |
| ------------------ | --------------------------------------- |
| `make dev-agent`   | `pnpm --filter @promethean/agent dev`   |
| `make start-agent` | `pnpm --filter @promethean/agent start` |
| `make build-agent` | `pnpm --filter @promethean/agent build` |
| `make test-agent`  | `pnpm --filter @promethean/agent test`  |
| `make clean-agent` | `pnpm --filter @promethean/agent clean` |

## 🚀 Production Considerations

### Process Management

- Use PM2 for production process management
- Configure appropriate restart policies
- Monitor memory usage and performance
- Set up log rotation

### Security

- Use environment variables for secrets
- Implement proper authentication/authorization
- Regular security updates
- Network segmentation

### Scaling

- Horizontal scaling via multiple instances
- Load balancing for web services
- Database connection pooling
- Caching strategies

### Monitoring

- Application performance monitoring
- Error tracking and alerting
- Resource usage metrics
- Health check automation
