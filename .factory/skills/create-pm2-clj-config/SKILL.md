---
name: create-pm2-clj-config
description: "Create new pm2-clj ecosystem configuration files from scratch or templates for PM2 process management"
---

# Skill: Create PM2 Configs

## Goal
Create new pm2-clj ecosystem configuration files from scratch or templates.

## Use This Skill When
- The user needs a new PM2 ecosystem configuration
- Adding a new service/daemon to the workspace
- Setting up pm2-clj for a new application
- The user asks to "create an ecosystem config" or "add to PM2"

## Do Not Use This Skill When
- The user wants to start/stop existing processes (use `pm2-process-management` skill)
- Converting legacy `ecosystem.config.*` to pm2-clj (use migration workflow)
- Editing existing pm2-clj configs (use direct edits)

## Inputs
- Application/service name
- Script path and command
- Environment variables
- Port bindings
- Any special requirements (cluster mode, scaling, etc.)

## Steps

### 1. Determine Location
Identify where the new config should live:
- System daemons: `system/daemons/<group>/<name>/ecosystem.pm2.clj`
- Org services: `orgs/<org>/<repo>/ecosystem.pm2.clj`
- Package-level: `orgs/<org>/<repo>/packages/<pkg>/ecosystem.pm2.clj`

### 2. Create pm2-clj DSL
Create the EDN structure following pm2-clj conventions:

**Basic template**:
```clojure
{:apps
 [{:name "<process-name>"
   :script "<script-name>"
   :args "<arguments>"
   :cwd "<working-directory>"
   :interpreter "node"
   :env {:NODE_ENV "development"
          :PORT 3000}
   :env_production {:NODE_ENV "production"
                   :PORT 3000}
   :max_restarts 5
   :restart_delay 2000
   :autorestart true}]}
```

**Multi-app template**:
```clojure
{:apps
 [{:name "app-1"
   :script "node"
   :cwd "/path/to/app1"
   :env {:PORT 3000}}
  {:name "app-2"
   :script "pnpm"
   :args "dev"
   :cwd "/path/to/app2"
   :env {:PORT 3001}}]}
```

### 3. Configure Process Properties
Add appropriate fields based on process type:
- `:watch` - true/false for file watching
- `:instances` - cluster mode instances count
- `:exec_mode` - "fork" or "cluster"
- `:log_file`, `:error_file`, `:out_file` - log paths
- `:interpreter_args` - Node.js flags
- `:node_args` - Alternative for Node.js flags
- `:max_memory_restart` - Memory limit before restart

### 4. Validate Config
Run render to validate:
```bash
clobber render <new-config-path>/ecosystem.pm2.clj | jq '.'
```

### 5. Test Start (Optional)
Test the configuration:
```bash
clobber start <new-config-path>/ecosystem.pm2.clj
pm2 list
pm2 logs <process-name>
```

## Strong Hints
- Use `*.pm2.clj` extension for all pm2-clj configs
- Follow existing ecosystem files as templates
- Use environment-specific env blocks (`:env`, `:env_production`)
- Set `:cwd` to the actual working directory
- Use `:interpreter` for Node.js, leave empty for scripts like `pnpm`

## Output
- New `ecosystem.pm2.clj` file at appropriate location
- Validation result from pm2-clj render
- Confirmation that config is ready to use

## Examples

### System Daemon
```clojure
{:apps
 [{:name "new-daemon"
   :script "./dist/index.js"
   :cwd "/home/err/devel/system/daemons/new-group/new-daemon"
   :interpreter "node"
   :env {:NODE_ENV "production"}
   :max_restarts 5
   :restart_delay 2000
   :autorestart true}]}
```

### Package Service
```clojure
{:apps
 [{:name "api-service"
   :script "node"
   :args "./dist/index.js"
   :cwd "/home/err/devel/orgs/riatzukiza/promethean/packages/api-service"
   :interpreter "node"
   :env {:PORT 8080
          :NODE_ENV "development"}
   :env_production {:PORT 8080
                   :NODE_ENV "production"}
   :log_file "./logs/api-combined.log"
   :error_file "./logs/api-error.log"
   :out_file "./logs/api-out.log"}]}
```

### Vite Dev Server
```clojure
{:apps
 [{:name "dev-ui"
   :script "vite"
   :args "--port 3000 --host 0.0.0.0"
   :cwd "/path/to/ui"
   :interpreter "node"
   :watch false
   :env {:NODE_ENV "development"}}]}
```

## Related Skills
- Use `pm2-process-management` skill to start/stop the new process
- Use `render-pm2-clj-config` skill to validate before starting
- Use `workspace-navigation` skill to find existing examples

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[pm2-process-management](../pm2-process-management/SKILL.md)**
- **[render-pm2-clj-config](../render-pm2-clj-config/SKILL.md)**
- **[workspace-navigation](../workspace-navigation/SKILL.md)**
