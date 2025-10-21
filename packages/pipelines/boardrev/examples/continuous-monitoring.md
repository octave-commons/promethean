# Boardrev Continuous Monitoring Examples

This guide demonstrates how to set up and use the continuous monitoring capabilities of the boardrev system.

## Quick Start

### 1. Basic Monitoring Setup

```typescript
import { BoardrevMonitor } from "@promethean/boardrev/src/07-monitor.js";

// Create a monitor with default configuration
const monitor = new BoardrevMonitor({
  watchPaths: ["docs/agile/tasks", "docs/agile/boards"],
  watchDebounceMs: 2000,
  enableScheduler: true,
  enableGitHooks: true
});

// Start monitoring
await monitor.start();

// Listen for events
monitor.on("change", (event) => {
  console.log(`File changed: ${event.data.filename}`);
});

monitor.on("run-complete", (event) => {
  console.log(`Boardrev run ${event.status} completed in ${event.duration}ms`);
});
```

### 2. Custom Configuration

```typescript
const monitor = new BoardrevMonitor({
  // File watching
  watchPaths: [
    "docs/agile/tasks",
    "docs/agile/boards",
    "packages/*/README.md",
    "package.json"
  ],
  watchDebounceMs: 5000, // Longer debounce for large projects
  watchIgnoredPatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.cache/**",
    "**/*.tmp"
  ],

  // Git integration
  enableGitHooks: true,
  gitHookTriggers: ["pre-commit", "post-commit"],

  // Scheduling
  enableScheduler: true,
  scheduleInterval: "*/10 * * * *", // Every 10 minutes

  // Performance
  maxConcurrentRuns: 2,
  runTimeoutMs: 15 * 60 * 1000, // 15 minutes

  // Notifications
  enableNotifications: true,
  notificationWebhook: "https://hooks.slack.com/services/your/webhook"
});
```

## Advanced File Watching

### 1. Custom File Watcher

```typescript
import { FileWatcher } from "@promethean/boardrev/src/08-watchers.js";

// Create a specialized watcher for boardrev
const watcher = FileWatcher.createBoardrevWatcher();

// Add custom filters
watcher.addFilter({
  pattern: /high-priority/,
  extensions: [".md"]
});

watcher.addFilter({
  custom: (event) => {
    // Only include files modified in the last hour
    const stats = event.stats;
    return stats && stats.mtime &&
           (Date.now() - stats.mtime.getTime()) < 60 * 60 * 1000;
  }
});

// Start watching
await watcher.start();

watcher.on("change", (event) => {
  console.log(`Filtered change: ${event.relativePath}`);
});
```

### 2. Multiple Watchers with Different Configurations

```typescript
// Task files watcher
const taskWatcher = new FileWatcher({
  paths: ["docs/agile/tasks"],
  debounceMs: 1000,
  filters: [FileWatcher.createTaskFilter()]
});

// Board files watcher
const boardWatcher = new FileWatcher({
  paths: ["docs/agile/boards"],
  debounceMs: 5000,
  filters: [FileWatcher.createBoardFilter()]
});

// Configuration files watcher
const configWatcher = new FileWatcher({
  paths: ["."],
  debounceMs: 3000,
  filters: [FileWatcher.createConfigFilter()]
});

// Start all watchers
await Promise.all([
  taskWatcher.start(),
  boardWatcher.start(),
  configWatcher.start()
]);
```

## Scheduling Examples

### 1. Custom Job Scheduling

```typescript
import { Scheduler } from "@promethean/boardrev/src/09-scheduler.js";

const scheduler = new Scheduler();

// Add a custom cron job
scheduler.addJob(Scheduler.createCronJob(
  "daily-scan",
  "Daily Full Scan",
  "0 2 * * *", // 2 AM every day
  async () => {
    console.log("Running daily full scan");
    // Custom logic here
  },
  {
    retryAttempts: 3,
    timeoutMs: 30 * 60 * 1000 // 30 minutes
  }
));

// Add an interval job for quick checks
scheduler.addJob(Scheduler.createIntervalJob(
  "quick-check",
  "Quick Health Check",
  5 * 60 * 1000, // Every 5 minutes
  async () => {
    console.log("Running quick health check");
    // Quick validation logic
  }
));

// Start scheduler
await scheduler.start();
```

### 2. Job Dependencies and Chaining

```typescript
// Create a job that runs after file changes
const postChangeJob = Scheduler.createIntervalJob(
  "post-change-cleanup",
  "Post-Change Cleanup",
  30 * 1000, // 30 seconds after trigger
  async () => {
    console.log("Running post-change cleanup");
    // Cleanup logic
  }
);

// Only schedule this job after file changes
monitor.on("change", async (event) => {
  if (event.data.filename.includes("tasks")) {
    // Schedule post-change job in 30 seconds
    setTimeout(() => {
      scheduler.executeJob(postChangeJob);
    }, 30000);
  }
});
```

## Git Integration

### 1. Git Hook Setup

The monitor automatically sets up git hooks. Here's how to use them:

```bash
# Pre-commit hook will run automatically
git commit -m "Add new task"

# Manual trigger via monitor
pnpm monitor:trigger "pre-commit"

# Check status
pnpm monitor:status
```

### 2. Custom Git Hook Handler

```typescript
monitor.on("git-hook", async (event) => {
  const { hook, args } = event.data;

  switch (hook) {
    case "pre-commit":
      console.log("Pre-commit hook triggered");
      // Run additional pre-commit checks
      await runPreCommitChecks();
      break;

    case "post-commit":
      console.log("Post-commit hook triggered");
      // Trigger boardrev run after commit
      await monitor.triggerRun("post-commit");
      break;

    case "pre-push":
      console.log("Pre-push hook triggered");
      // Run additional pre-push validations
      await runPrePushChecks();
      break;
  }
});

async function runPreCommitChecks() {
  // Custom pre-commit logic
  console.log("Running pre-commit checks...");
}

async function runPrePushChecks() {
  // Custom pre-push logic
  console.log("Running pre-push checks...");
}
```

## Event-Driven Architecture

### 1. Event Listeners

```typescript
// Monitor lifecycle events
monitor.on("started", () => {
  console.log("🚀 Boardrev monitor started");
});

monitor.on("stopped", () => {
  console.log("🛑 Boardrev monitor stopped");
});

// File change events
monitor.on("change", (event) => {
  console.log(`📁 File change: ${event.data.relativePath}`);

  // Trigger different actions based on file type
  if (event.data.relativePath.includes("tasks/")) {
    console.log("📝 Task file changed, running task-specific analysis");
  }
});

// Run lifecycle events
monitor.on("run-start", (event) => {
  console.log(`▶️  Starting boardrev run ${event.executionId}`);
});

monitor.on("run-complete", (event) => {
  const status = event.status === "success" ? "✅" : "❌";
  console.log(`${status} Boardrev run ${event.executionId} ${event.status} in ${event.duration}ms`);
});
```

### 2. Custom Event Handlers

```typescript
// Create a notification system
class NotificationSystem {
  constructor(private webhookUrl: string) {}

  async notify(event: any) {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: this.formatMessage(event),
          channel: "#boardrev-updates"
        })
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  private formatMessage(event: any): string {
    switch (event.type) {
      case "change":
        return `📁 File changed: ${event.data.relativePath}`;
      case "run-complete":
        if (event.status === "success") {
          return `✅ Boardrev completed successfully (${event.duration}ms)`;
        } else {
          return `❌ Boardrev failed: ${event.error?.message}`;
        }
      default:
        return `Boardrev event: ${event.type}`;
    }
  }
}

// Use with monitor
const notifications = new NotificationSystem("https://hooks.slack.com/services/YOUR/WEBHOOK");
monitor.on("change", notifications.notify.bind(notifications));
monitor.on("run-complete", notifications.notify.bind(notifications));
```

## Performance Optimization

### 1. Incremental Updates

```typescript
// Enable incremental updates for better performance
const monitor = new BoardrevMonitor({
  incrementalUpdates: true,
  // Other config...
});

// Monitor will automatically detect when it can do incremental updates
monitor.on("run-complete", (event) => {
  if (event.metadata?.incremental) {
    console.log(`📈 Incremental update completed in ${event.duration}ms`);
  }
});
```

### 2. Concurrency Control

```typescript
// Limit concurrent runs to prevent resource exhaustion
const monitor = new BoardrevMonitor({
  maxConcurrentRuns: 2,
  runTimeoutMs: 5 * 60 * 1000 // 5 minutes
});

// Monitor will queue runs when limit is reached
monitor.on("change", (event) => {
  if (monitor.getStatus().activeRuns >= 2) {
    console.log("⏳ Queueing boardrev run (max concurrent reached)");
  }
});
```

## Error Handling and Resilience

### 1. Retry Logic

```typescript
monitor.on("run-complete", (event) => {
  if (event.status === "failed") {
    console.log(`❌ Run failed: ${event.error?.message}`);

    // Auto-retry for certain types of errors
    if (isTransientError(event.error)) {
      console.log("🔄 Retrying due to transient error");
      setTimeout(() => {
        monitor.triggerRun("auto-retry");
      }, 10000);
    }
  }
});

function isTransientError(error: any): boolean {
  const transientMessages = [
    "ENOENT",
    "ECONNRESET",
    "timeout"
  ];

  return transientMessages.some(msg =>
    error.message.includes(msg)
  );
}
```

### 2. Health Monitoring

```typescript
// Set up health check interval
setInterval(async () => {
  const status = monitor.getStatus();

  if (status.errorCount > 5) {
    console.warn("⚠️ High error rate detected, restarting monitor");
    await monitor.stop();
    await monitor.start();
  }

  // Log periodic status
  console.log(`📊 Status: ${status.totalRuns} runs, ${status.errorCount} errors`);
}, 60000); // Every minute
```

## Production Deployment

### 1. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "boardrev-monitor",
    script: "node_modules/.bin/boardrev-monitor",
    args: ["start"],
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    },
    error_file: "./logs/monitor-error.log",
    out_file: "./logs/monitor-out.log",
    log_file: "./logs/monitor-combined.log",
    time: true
  }]
};
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable pnpm && corepack install

COPY . .

# Install git hooks
RUN npx boardrev-monitor git-hook setup

EXPOSE 3000

CMD ["pnpm", "monitor:start"]
```

### 3. Systemd Service

```ini
# /etc/systemd/system/boardrev-monitor.service
[Unit]
Description=Boardrev Continuous Monitor
After=network.target

[Service]
Type=simple
User=boardrev
WorkingDirectory=/path/to/boardrev
ExecStart=/path/to/boardrev/node_modules/.bin/boardrev-monitor start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### 1. Common Issues

```typescript
// Debug logging
monitor.on("error", (error) => {
  console.error("Monitor error:", error);
});

// Enable verbose logging
process.env.DEBUG = "boardrev:*";

// Check what's being watched
console.log("Watching paths:", monitor.config.watchPaths);
console.log("Active watchers:", monitor.getStatus().activeWatches);
```

### 2. Performance Tuning

```typescript
// Monitor system performance
setInterval(() => {
  const memUsage = process.memoryUsage();
  const status = monitor.getStatus();

  console.log("Memory usage:", memUsage);
  console.log("Monitor stats:", status);

  // Adjust debounce if too many events
  if (status.totalRuns > 100) {
    console.warn("Consider increasing debounce time");
  }
}, 30000);
```

This comprehensive example shows how to leverage the continuous monitoring capabilities of boardrev for real-time updates and automation in your development workflow.