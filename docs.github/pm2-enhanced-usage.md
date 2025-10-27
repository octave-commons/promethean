# Enhanced PM2 Ecosystem for Promethean Monorepo

This document provides comprehensive usage instructions for the enhanced PM2 ecosystem configuration that integrates with Nx for intelligent affected project detection and automated testing/building.

## 🚀 Quick Start

### 1. Setup Logging Infrastructure

```bash
# Setup comprehensive logging system
node scripts/setup-logging.mjs

# Install logrotate configuration (requires sudo)
sudo scripts/install-logrotate.sh
```

### 2. Start the Enhanced Ecosystem

```bash
# Start all processes with the enhanced configuration
pm2 start ecosystem.config.enhanced.mjs

# Or start with specific environment
pm2 start ecosystem.config.enhanced.mjs --env development
```

### 3. Monitor the System

```bash
# View all processes and their status
pm2 status

# View real-time logs
pm2 logs

# View specific process logs
pm2 logs nx-watcher
pm2 logs dev-health-dashboard-frontend

# View the monitoring dashboard
node scripts/log-monitor.mjs
```

## 📊 Ecosystem Components

### Core Processes

#### 1. Nx Watcher (`nx-watcher`)

- **Purpose**: Intelligent file watcher that triggers Nx operations on affected projects
- **Monitors**: All `src` directories in packages, services, and shared modules
- **Operations**: build, test, lint, typecheck, coverage (all cacheable operations from nx.json)
- **Features**:
  - Debounced file watching (2s default)
  - Batched operations (5s delay)
  - Affected project detection using Nx dependency graph
  - Concurrent operation control (max 3 concurrent)

#### 2. Development Servers (`dev-*`)

- **Purpose**: Hot-reloading development servers for frontend projects
- **Includes**: All frontend projects from `packages/frontends/`
- **Features**:
  - Automatic port assignment
  - File watching with hot reload
  - Development-specific environment variables

#### 3. Background Services

- **Autocommit**: Automatic commit service with AI-generated messages
- **Promethean MCP Dev**: MCP development server
- **OpenCode Unified**: OpenCode development environment
- **Playwright MCP**: Browser automation server

#### 4. Monitoring Services

- **Health Monitor**: System health monitoring
- **Heartbeat**: Process heartbeat monitoring
- **Message Broker**: Inter-service communication

#### 5. Automation Tasks

- **Periodic Build**: Full workspace build every 6 hours
- **Periodic Test**: Full test suite daily at 2 AM
- **Coverage Report**: Weekly coverage generation

## 🔧 Configuration

### Environment Variables

```bash
# General configuration
NODE_ENV=production|development
LOG_LEVEL=error|warn|info|debug|trace
PROJECT_ROOT=/path/to/promethean

# Nx configuration
NX_VERBOSE_LOGGING=true|false
NX_DAEMON=true|false
NX_PERF_LOGGING=true|false

# Service-specific
OPENAI_BASE_URL=http://localhost:11434
AUTOCOMMIT_MODEL=llama3.1:8b
MCP_USER_ROLE=developer
PLAYWRIGHT_BROWSERS_PATH=0
```

### Custom Configuration

You can modify the ecosystem configuration by editing `ecosystem.config.enhanced.mjs`:

```javascript
// Modify watch patterns
watch: [
  "packages/*/src/**/*",
  "services/*/src/**/*",
  "shared/*/src/**/*"
],

// Adjust debounce and batch timing
debounceDelay: 3000,    // 3 seconds
batchDelay: 8000,      // 8 seconds
maxConcurrentOps: 5,   // 5 concurrent operations

// Customize logging
log_date_format: "YYYY-MM-DD HH:mm:ss Z",
max_memory_restart: "2G"
```

## 📋 Common Operations

### Starting and Stopping

```bash
# Start all processes
pm2 start ecosystem.config.enhanced.mjs

# Start specific processes
pm2 start ecosystem.config.enhanced.mjs --only nx-watcher,dev-*

# Start with environment
pm2 start ecosystem.config.enhanced.mjs --env development

# Stop all processes
pm2 stop all

# Stop specific processes
pm2 stop nx-watcher

# Restart processes
pm2 restart all
pm2 restart nx-watcher

# Reload (zero-downtime restart)
pm2 reload all
```

### Monitoring and Debugging

```bash
# View process status
pm2 status
pm2 describe nx-watcher

# View logs
pm2 logs --lines 100
pm2 logs nx-watcher --lines 50

# Monitor in real-time
pm2 monit

# View log files directly
tail -f logs/nx-watcher-out.log
tail -f logs/nx-watcher-err.log

# Use the web dashboard
node scripts/log-monitor.mjs
# Then visit http://localhost:3099
```

### Custom Actions

```bash
# Trigger build for affected projects
pm2 trigger build-affected

# Trigger tests for affected projects
pm2 trigger test-affected

# Generate comprehensive status report
pm2 trigger generate-report

# Clean up old logs and cache
pm2 trigger cleanup
```

### Nx Operations

```bash
# Manually run Nx operations
pnpm nx graph --affected
pnpm nx build --affected
pnpm nx test --affected
pnpm nx lint --affected

# View project dependencies
pnpm nx show project <project-name> --web

# View affected projects
pnpm nx affected:libs
pnpm nx affected:apps
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Nx Watcher Not Responding

```bash
# Check if the process is running
pm2 describe nx-watcher

# Restart the watcher
pm2 restart nx-watcher

# Check logs for errors
pm2 logs nx-watcher --lines 20
```

#### 2. Excessive Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart processes with memory limits
pm2 restart all --max-memory-restart 1G

# Check for memory leaks
pm2 logs nx-watcher | grep -i memory
```

#### 3. Build/Test Failures

```bash
# Check Nx cache
pnpm nx reset

# Clear affected project cache
pnpm nx reset <project-name>

# Run with verbose logging
NX_VERBOSE_LOGGING=true pm2 restart nx-watcher

# Manually test affected projects
pnpm nx test --affected --verbose
```

#### 4. Log File Issues

```bash
# Check log directory permissions
ls -la logs/

# Rotate logs manually
logrotate -f logrotate.conf

# Clear old logs
rm logs/*.log.old
```

### Performance Optimization

#### 1. Reduce File Watching Overhead

```javascript
// In ecosystem.config.enhanced.mjs
debounceDelay: 5000,    // Increase debounce
batchDelay: 10000,      // Increase batch delay
maxConcurrentOps: 2,    // Reduce concurrency
```

#### 2. Optimize Nx Performance

```bash
# Enable Nx daemon
NX_DAEMON=true pm2 restart nx-watcher

# Use parallel execution
pnpm nx build --parallel --maxParallel=4

# Cache optimization
pnpm nx reset  # Clear cache if it becomes corrupted
```

#### 3. Memory Management

```bash
# Set appropriate memory limits
pm2 restart all --max-memory-restart 1G

# Monitor memory trends
pm2 monit

# Use PM2 clustering for CPU-intensive tasks
# Edit ecosystem.config.enhanced.mjs to use cluster mode
instances: "max",
exec_mode: "cluster"
```

## 📈 Monitoring and Analytics

### Log Analysis

```bash
# Count errors in logs
grep -c "ERROR" logs/*.log

# Find slow operations
grep "Performance:" logs/nx-watcher-combined.log | sort -k4 -n

# Monitor affected project patterns
grep "Found.*affected projects" logs/nx-watcher-combined.log
```

### Performance Metrics

The system automatically tracks:

- Files changed per hour
- Operations run and success rates
- Average operation duration
- Memory usage trends
- Error rates and patterns

View statistics with:

```bash
# Nx watcher prints stats every minute
pm2 logs nx-watcher

# Or trigger a report
pm2 trigger generate-report
```

## 🔄 Deployment

### Production Deployment

```bash
# Deploy to production
pm2 deploy production

# Deploy to staging
pm2 deploy staging

# Setup deployment configuration
# Edit ecosystem.config.enhanced.mjs deploy section
```

### Environment-Specific Configurations

```bash
# Development
pm2 start ecosystem.config.enhanced.mjs --env development

# Staging
pm2 start ecosystem.config.enhanced.mjs --env staging

# Production
pm2 start ecosystem.config.enhanced.mjs --env production
```

## 🛠️ Advanced Usage

### Custom Process Definitions

Add custom processes to `ecosystem.config.enhanced.mjs`:

```javascript
// Add to the apps array
{
  name: "custom-service",
  description: "My custom service",
  script: "node",
  args: ["packages/custom-service/dist/index.js"],
  cwd: PROJECT_ROOT,
  watch: ["packages/custom-service/src/**/*"],
  env: {
    CUSTOM_VAR: "value"
  }
}
```

### Custom Schedules

Add periodic tasks:

```javascript
// Add to the schedules array
{
  name: "custom-task",
  script: "node",
  args: ["scripts/custom-task.mjs"],
  cron: "0 */2 * * *"  // Every 2 hours
}
```

### Integration with CI/CD

```yaml
# .github/workflows/pm2.yml
name: PM2 Deployment
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Build affected projects
        run: pnpm nx build --affected

      - name: Deploy with PM2
        run: pm2 deploy production
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nx Documentation](https://nx.dev/)
- [Promethean Project Structure](../AGENTS.md)
- [Development Workflow](../docs/development-workflow.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `pm2 logs`
2. Verify configuration: `pm2 describe <process-name>`
3. Check system resources: `pm2 monit`
4. Reset Nx cache: `pnpm nx reset`
5. Restart processes: `pm2 restart all`

For additional support, create an issue in the project repository or contact the development team.
