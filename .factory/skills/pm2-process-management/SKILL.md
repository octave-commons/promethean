---
name: pm2-process-management
description: "Start, stop, restart, and manage PM2 processes using the ecosystem-based configuration system"
---

# Skill: PM2 Process Management

## Goal
Start, stop, restart, and manage PM2 processes using the ecosystem-based configuration system.

## Use This Skill When
- The user wants to start/stop/restart PM2 processes
- You need to work with ecosystem files in `ecosystems/`
- Managing system services or development processes
- The request mentions "pm2", "start", "stop", "restart" processes
- The user wants to manage the workspace's process stack

## Do Not Use This Skill When
- The request is about creating new ecosystem configs (use `create-pm2-clj-config` skill)
- You need to migrate from legacy formats (see deprecation notice below)
- The task is purely about editing ecosystem files

## Ecosystem System Overview

This workspace uses an **ecosystem-based approach** to process management:

1. **Ecosystem Files**: Defined in `ecosystems/*.cljs` using clobber.macro DSL
2. **Compilation**: `npx shadow-cljs release clobber` compiles to `.clobber/index.cjs`
3. **PM2 Startup**: `pm2 start ecosystem.config.cjs` runs the compiled config
4. **Process Isolation**: Each app defined with `clobber.macro/defapp`

### Directory Structure
```
ecosystems/
├── index.cljs      # Main entry - requires all ecosystem files
├── ecosystem.cljs  # Duck/OpenCode processes
└── cephalon.cljs   # Cephalon "always-running mind" process

.clobber/
└── index.cjs       # Compiled PM2 config (generated)

ecosystem.config.cjs  # PM2 entry point (requires .clobber/index.cjs)
```

## Inputs
- The target process name(s) or action (start/stop/restart/logs/status)
- Optional: specific ecosystem file path (defaults to `ecosystem.config.cjs`)

## Steps

### Compile Ecosystems (Required Before Starting)
```bash
npx shadow-cljs release clobber
```
This compiles `ecosystems/*.cljs` → `.clobber/index.cjs`

### Start All Processes
```bash
pm2 start ecosystem.config.cjs
```

### Start Specific Ecosystem File
```bash
# For development services
pm2 start ecosystem.config.cjs

# Check what's running
pm2 list
```

### Stop Processes
```bash
# Stop specific process by name
pm2 stop <app-name>

# Stop all processes
pm2 stop all

# Delete from PM2 (fully remove)
pm2 delete <app-name>
```

### Restart Processes
```bash
# Restart specific process
pm2 restart <app-name>

# Restart all
pm2 restart all

# Graceful reload (zero-downtime)
pm2 reload <app-name>
```

### View Logs
```bash
# View logs for specific app
pm2 logs <app-name>

# View all logs with real-time updates
pm2 monit

# View last 100 lines
pm2 logs <app-name> --lines 100
```

### Check Status
```bash
# List all processes
pm2 list
# or
pm2 status

# Show detailed metrics
pm2 describe <app-name>
```

## Common Patterns

### Development Workflow
```bash
# 1. Compile ecosystems
npx shadow-cljs release clobber

# 2. Start all processes
pm2 start ecosystem.config.cjs

# 3. Monitor
pm2 monit

# 4. Restart specific process after changes
pm2 restart <app-name>

# 5. Stop all when done
pm2 delete all
```

### Check Process Health
```bash
pm2 list                              # Quick status
pm2 logs --lines 50 --nostream        # Recent logs
pm2 describe <app-name>               # Details + metrics
```

### Debugging Issues
```bash
# Check for errors
pm2 logs --lines 100 | grep -i error

# Restart with verbose logging
pm2 restart <app-name> --verbose

# Check process environment
pm2 env <app-name>
```

## Process Names
Current ecosystem includes:
- `devel/opencode` - OpenCode development server
- `duck-ui` - UI service (Clojure)
- `cephalon` - "Always-running mind" with vector memory

Note: `duck-io` and `duck-brain` were removed as the source repositories don't exist yet. These can be added when cephalon-clj-discord-io and cephalon-clj-brain are implemented.

## Deprecation Notice
The following formats are deprecated:
- `ecosystem.pm2.edn` → Use `ecosystems/*.cljs`
- `pm2-clj` CLI → Use `npx shadow-cljs release clobber`
- `ecosystem.config.*` source files → Use `ecosystem.config.cjs` (generated)

## Strong Hints
- Always compile with `npx shadow-cljs release clobber` before starting
- Process names are defined in ecosystem files with `clobber.macro/defapp`
- Use `pm2 list` to see currently running processes and their names
- `pm2 monit` provides real-time monitoring dashboard
- Check `.clobber/index.cjs` to see compiled output

## Output
- Confirmation of PM2 operation (start/stop/restart)
- Process status showing running/stopped state
- Any error messages from shadow-cljs, clobber, or PM2

## Related Skills
- `create-pm2-clj-config` - Create new ecosystem configuration files
- `render-pm2-clj-config` - Validate configs without starting
- `workspace-navigation` - Locate ecosystem files

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[create-pm2-clj-config](../create-pm2-clj-config/SKILL.md)**
- **[render-pm2-clj-config](../render-pm2-clj-config/SKILL.md)**
- **[workspace-navigation](../workspace-navigation/SKILL.md)**
