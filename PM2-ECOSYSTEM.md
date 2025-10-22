# Enhanced PM2 Ecosystem for Promethean Monorepo

A comprehensive, production-ready PM2 ecosystem configuration that integrates with Nx for intelligent affected project detection and automated testing/building across the Promethean monorepo.

## 🎯 Overview

This enhanced PM2 ecosystem provides:

- **Intelligent File Watching**: Monitors changes across all packages and services
- **Nx Integration**: Leverages Nx's dependency graph for affected project detection
- **Automated Operations**: Runs builds, tests, linting, and typechecking on affected projects
- **Performance Optimization**: Debounced operations, batching, and concurrency control
- **Comprehensive Logging**: Structured logging with rotation and monitoring
- **Production Ready**: Error handling, memory management, and graceful shutdowns

## 📁 Files Created

| File                            | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `ecosystem.config.enhanced.mjs` | Main PM2 ecosystem configuration   |
| `scripts/nx-watcher.mjs`        | Intelligent Nx-aware file watcher  |
| `scripts/setup-logging.mjs`     | Logging infrastructure setup       |
| `scripts/pm2-quickstart.mjs`    | Quick start and management script  |
| `docs/pm2-enhanced-usage.md`    | Comprehensive usage documentation  |
| `shared/js/logger.js`           | Centralized logging utility        |
| `scripts/log-monitor.mjs`       | Web-based log monitoring dashboard |

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Setup logging infrastructure and dependencies
node scripts/pm2-quickstart.mjs setup

# Or manually
node scripts/setup-logging.mjs
sudo scripts/install-logrotate.sh  # Optional, for log rotation
```

### 2. Start the Ecosystem

```bash
# Start in development mode
node scripts/pm2-quickstart.mjs start --env development

# Or directly with PM2
pm2 start ecosystem.config.enhanced.mjs --env development
```

### 3. Monitor and Manage

```bash
# Check status
node scripts/pm2-quickstart.mjs status

# View logs
node scripts/pm2-quickstart.mjs logs

# Start monitoring dashboard
node scripts/pm2-quickstart.mjs monitor
```

## 🏗️ Architecture

### Core Components

#### 1. Nx Watcher (`nx-watcher`)

- **Purpose**: Intelligent file change detection and operation triggering
- **Features**:
  - Monitors all `src` directories across packages, services, and shared modules
  - Uses Nx's affected project detection
  - Debounced file watching (2s default)
  - Batched operations (5s delay)
  - Concurrent operation control (max 3)
  - Supports all cacheable operations from `nx.json`

#### 2. Development Servers (`dev-*`)

- **Purpose**: Hot-reloading development servers for frontend projects
- **Includes**: All frontend projects from `packages/frontends/`
- **Features**:
  - Automatic port assignment (3000-3005)
  - File watching with hot reload
  - Development-specific environment variables

#### 3. Background Services

- **Autocommit**: Automatic commit service with AI-generated messages
- **Promethean MCP Dev**: MCP development server
- **OpenCode Unified**: OpenCode development environment
- **Playwright MCP**: Browser automation server

#### 4. Monitoring Services

- **Health Monitor**: System health monitoring with configurable intervals
- **Heartbeat**: Process heartbeat monitoring
- **Message Broker**: Inter-service communication hub

#### 5. Automation Tasks

- **Periodic Build**: Full workspace build every 6 hours
- **Periodic Test**: Full test suite daily at 2 AM
- **Coverage Report**: Weekly coverage generation on Sundays

## ⚙️ Configuration

### Environment Variables

```bash
# Core Configuration
NODE_ENV=production|development|staging
LOG_LEVEL=error|warn|info|debug|trace
PROJECT_ROOT=/path/to/promethean

# Nx Configuration
NX_VERBOSE_LOGGING=true|false
NX_DAEMON=true|false
NX_PERF_LOGGING=true|false

# Service Configuration
OPENAI_BASE_URL=http://localhost:11434
AUTOCOMMIT_MODEL=llama3.1:8b
MCP_USER_ROLE=developer
PLAYWRIGHT_BROWSERS_PATH=0
```

### Customizing the Ecosystem

Edit `ecosystem.config.enhanced.mjs` to customize:

```javascript
// Modify watch patterns and timing
const CONFIG = {
  WATCH: {
    debounceDelay: 3000, // Increase debounce to 3s
    batchDelay: 8000, // Increase batch delay to 8s
    maxConcurrentOps: 5, // Allow 5 concurrent operations
  },

  // Adjust logging
  LOGGING: {
    dateFormat: 'YYYY-MM-DD HH:mm:ss Z',
    maxFiles: 15,
    maxSize: '20M',
  },

  // Performance tuning
  PERFORMANCE: {
    maxMemoryRestart: '2G',
    killTimeout: 20000,
    restartDelay: 8000,
  },
};
```

## 📊 Monitoring and Logging

### Log Structure

```
logs/
├── nx-watcher-out.log          # Nx watcher output
├── nx-watcher-err.log          # Nx watcher errors
├── nx-watcher-combined.log     # Combined nx-watcher logs
├── dev-*.log                  # Development server logs
├── autocommit*.log             # Autocommit service logs
├── health-monitor*.log          # Health monitoring logs
├── heartbeat*.log               # Heartbeat service logs
├── message-broker*.log          # Message broker logs
├── pm2/                        # PM2 process logs
├── archive/                     # Rotated log archives
└── monitoring/                  # Monitoring dashboards
```

### Log Monitoring

```bash
# Real-time log viewing
pm2 logs
pm2 logs nx-watcher

# Web-based monitoring dashboard
node scripts/log-monitor.mjs
# Visit http://localhost:3099

# PM2 monitoring
pm2 monit
```

### Log Rotation

Automatic log rotation is configured via `logrotate.conf`:

```bash
# Install log rotation
sudo scripts/install-logrotate.sh

# Test configuration
sudo logrotate -d /etc/logrotate.d/promethean

# Force rotation
sudo logrotate -f /etc/logrotate.d/promethean
```

## 🔧 Operations

### Starting and Stopping

```bash
# Start all processes
pm2 start ecosystem.config.enhanced.mjs
pm2 start ecosystem.config.enhanced.mjs --env production

# Start specific processes
pm2 start ecosystem.config.enhanced.mjs --only nx-watcher,dev-*

# Stop processes
pm2 stop all
pm2 stop nx-watcher

# Restart processes
pm2 restart all
pm2 restart nx-watcher

# Zero-downtime reload
pm2 reload all
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
# Manual Nx operations
pnpm nx graph --affected
pnpm nx build --affected
pnpm nx test --affected
pnpm nx lint --affected

# View project dependencies
pnpm nx show project <project-name> --web

# Clear cache
pnpm nx reset
```

## 📈 Performance Optimization

### Memory Management

```bash
# Set memory limits
pm2 restart all --max-memory-restart 1G

# Monitor memory usage
pm2 monit

# Check for memory leaks
pm2 logs nx-watcher | grep -i memory
```

### File Watching Optimization

```javascript
// In ecosystem.config.enhanced.mjs
const CONFIG = {
  WATCH: {
    debounceDelay: 5000, // Increase for less frequent operations
    batchDelay: 10000, // Increase for better batching
    maxConcurrentOps: 2, // Reduce for lower resource usage
  },
};
```

### Nx Performance

```bash
# Enable Nx daemon for better performance
NX_DAEMON=true pm2 restart nx-watcher

# Use parallel execution
pnpm nx build --parallel --maxParallel=4

# Cache optimization
pnpm nx reset  # Clear corrupted cache
```

## 🔄 Deployment

### Environment-Specific Deployments

```bash
# Development
pm2 start ecosystem.config.enhanced.mjs --env development

# Staging
pm2 start ecosystem.config.enhanced.mjs --env staging

# Production
pm2 start ecosystem.config.enhanced.mjs --env production
```

### Automated Deployment

```bash
# Deploy to production
pm2 deploy production

# Deploy to staging
pm2 deploy staging
```

### CI/CD Integration

```yaml
# .github/workflows/pm2-deploy.yml
name: PM2 Deployment
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Setup PM2 ecosystem
        run: node scripts/pm2-quickstart.mjs setup

      - name: Build affected projects
        run: pnpm nx build --affected

      - name: Deploy with PM2
        run: pm2 deploy production
        env:
          CLASSIC_GITHUB_TOKEN: ${{ secrets.CLASSIC_GITHUB_TOKEN }}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Nx Watcher Not Responding

```bash
# Check process status
pm2 describe nx-watcher

# Restart the watcher
pm2 restart nx-watcher

# Check for errors
pm2 logs nx-watcher --lines 20

# Reset Nx cache
pnpm nx reset
```

#### 2. High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart with memory limits
pm2 restart all --max-memory-restart 1G

# Identify memory-intensive processes
pm2 show <process-name>
```

#### 3. Build/Test Failures

```bash
# Check affected projects
pnpm nx affected:libs
pnpm nx affected:apps

# Run with verbose logging
NX_VERBOSE_LOGGING=true pm2 restart nx-watcher

# Manual test run
pnpm nx test --affected --verbose
```

#### 4. Log File Issues

```bash
# Check log directory
ls -la logs/

# Manually rotate logs
logrotate -f logrotate.conf

# Clear old logs
find logs -name "*.log.old" -delete
```

### Debug Mode

Enable debug logging:

```bash
# Start with debug logging
LOG_LEVEL=debug pm2 start ecosystem.config.enhanced.mjs

# Or restart existing processes
LOG_LEVEL=debug pm2 restart all
```

## 📚 Advanced Usage

### Adding Custom Processes

Add to `ecosystem.config.enhanced.mjs`:

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
    CUSTOM_VAR: "value",
    PORT: 3013
  },
  max_memory_restart: "512M"
}
```

### Custom Schedules

Add periodic tasks:

```javascript
// Add to the schedules array
{
  name: "custom-maintenance",
  script: "node",
  args: ["scripts/maintenance.mjs"],
  cron: "0 2 * * 0"  # Weekly on Sunday at 2 AM
}
```

### Health Checks

Configure custom health checks:

```javascript
{
  name: "my-service",
  script: "node",
  args: ["services/my-service/index.js"],
  health_check_grace_period: 3000,
  health_check_fatal_exceptions: true,
  health_check_interval: 10000,
  health_check_url: "http://localhost:3014/health"
}
```

## 📋 Best Practices

### Development Workflow

1. **Start the ecosystem**: `node scripts/pm2-quickstart.mjs start --env development`
2. **Make changes**: Files are automatically watched
3. **Monitor logs**: `pm2 logs` or web dashboard
4. **Check status**: `pm2 status` or `pm2 monit`
5. **Stop when done**: `pm2 stop all`

### Production Deployment

1. **Setup environment**: Configure production variables
2. **Test locally**: `pm2 start ecosystem.config.enhanced.mjs --env production`
3. **Deploy**: `pm2 deploy production`
4. **Monitor**: Set up log monitoring and alerts
5. **Maintain**: Regular cleanup and updates

### Performance Tips

- Use appropriate debounce and batch delays for your workflow
- Monitor memory usage and set appropriate limits
- Enable Nx daemon for better performance
- Use log rotation to prevent disk space issues
- Regularly clean up cache and old logs

## 🔗 Related Documentation

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nx Documentation](https://nx.dev/)
- [Promethean Project Structure](./AGENTS.md)
- [Development Workflow](./docs/development-workflow.md)
- [Enhanced Usage Guide](./docs/pm2-enhanced-usage.md)

## 🆘 Support

For issues and questions:

1. Check the logs: `pm2 logs`
2. Verify configuration: `pm2 describe <process-name>`
3. Check system resources: `pm2 monit`
4. Reset caches: `pnpm nx reset`
5. Create an issue in the project repository

---

**Note**: This enhanced PM2 ecosystem is designed to work with the existing Promethean monorepo structure and Nx configuration. It complements rather than replaces the existing `ecosystem.config.mjs` file.
