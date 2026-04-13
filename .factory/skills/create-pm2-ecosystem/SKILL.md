---
name: create-pm2-ecosystem
description: "Create new PM2 ecosystem configuration files for the clobber-based system with proper defapp definitions"
---

# Skill: Create PM2 Ecosystem

## Goal
Create new PM2 ecosystem configuration files for the clobber-based system.

## Use This Skill When
- Adding a new service to the workspace
- Creating ecosystem definitions for new processes
- The request mentions "create ecosystem", "new PM2 service", or "add service to ecosystems"
- You need to define a new `defapp` for PM2 process management

## Do Not Use This Skill When
- Just starting/stopping existing services (use `pm2-process-management` skill)
- Rendering/validating existing configs (use `render-pm2-clj-config` skill)
- The task is about editing existing ecosystem files (use directly)

## Ecosystem Architecture

The workspace uses a **modular ecosystem system** where each service is defined in its own `.cljs` file:

```
ecosystems/
├── index.cljs        # Entry point - requires all ecosystem files
├── ecosystem.cljs    # Core services (opencode, duck-ui)
└── cephalon.cljs     # Cephalon services (cephalon, openskull-cephalon)
```

**Build Pipeline:**
```
ecosystems/*.cljs → shadow-cljs release clobber → .clobber/index.cjs → ecosystem.config.cjs → PM2
```

## Steps

### Step 1: Create the Ecosystem File

Create a new file at `ecosystems/<service-name>.cljs`:

```clojure
(ns <service-name>
  (:require [clobber.macro]))

;; Service description
;; Purpose: What this service does

(clobber.macro/defapp "<service-name>"
  {:script "node"
   :args ["dist/main.js"]
   :cwd "/path/to/service"
   :env {:NODE_ENV "production"}
   :autorestart true
   :max-restarts 5
   :min-uptime "10s"
   :log-date-format "YYYY-MM-DD HH:mm:ss Z"
   :error-file "./logs/error.log"
   :out-file "./logs/out.log"
   :merge-logs true
   :kill-timeout 5000})

;; End with ecosystem-output
(clobber.macro/ecosystem-output)
```

### Step 2: Register in index.cljs

Edit `ecosystems/index.cljs` to require your new service:

```clojure
(ns index
  (:require [clobber.macro]
            [ecosystem]      ;; existing
            [cephalon]       ;; existing
            [<service-name>])) ;; ADD THIS

;; Export ecosystem
(set! (.-exports js/module)
      (clj->js (clobber.macro/ecosystem)))
```

### Step 3: Compile the Ecosystem

```bash
# Using pnpm (preferred)
pnpm generate-ecosystem

# Or directly
npx shadow-cljs release clobber
```

### Step 4: Start the Service

```bash
pm2 start ecosystem.config.cjs
```

## defapp Options Reference

### Required
| Option | Description |
|--------|-------------|
| `:name` | Unique service name (used in PM2 commands) |
| `:script` | Executable to run (node, bun, clojure, etc.) |

### Common
| Option | Description | Default |
|--------|-------------|---------|
| `:args` | Arguments passed to script | `[]` |
| `:cwd` | Working directory for the process | `.` |
| `:env` | Environment variables | `{}` |
| `:autorestart` | Auto-restart on crash | `true` |
| `:max-restarts` | Max restart attempts before failure | `5` |
| `:min-uptime` | Min uptime before considering stable | `"5s"` |
| `:instances` | Number of instances | `1` |
| `:interpreter` | Script interpreter | `none` |

### Logging
| Option | Description |
|--------|-------------|
| `:log-date-format` | Date format for logs |
| `:error-file` | Path to error log |
| `:out-file` | Path to stdout log |
| `:log-file` | Combined log path |
| `:merge-logs` | Merge stdout/stderr |

### Advanced
| Option | Description |
|--------|-------------|
| `:watch` | Files to watch for auto-restart |
| `:ignore_watch` | Files to ignore in watch |
| `:watch_delay` | Delay after file change |
| `:kill_timeout` | Time to wait before SIGKILL |
| `:restart_delay` | Delay between restarts |

## Example: Node.js Service

```clojure
(ns my-service
  (:require [clobber.macro]))

(clobber.macro/defapp "my-service"
  {:script "node"
   :args ["dist/index.js"]
   :cwd "/home/err/devel/services/my-service"
   :env {:NODE_ENV "production"
         :PORT "3000"}
   :autorestart true
   :max-restarts 3
   :min-uptime "10s"
   :error-file "./logs/error.log"
   :out-file "./logs/out.log"})

(clobber.macro/ecosystem-output)
```

## Example: Clojure Service

```clojure
(ns my-clj-service
  (:require [clobber.macro]))

(clobber.macro/defapp "my-clj-service"
  {:script "clojure"
   :args ["-M" "-m" "my.namespace.main"]
   :cwd "/home/err/devel/services/clj-service"
   :env {:MY_VAR "value"}
   :interpreter "none"
   :error-file "./logs/error.log"
   :out-file "./logs/out.log"})

(clobber.macro/ecosystem-output)
```

## Example: Bun Service

```clojure
(ns my-bun-service
  (:require [clobber.macro]))

(clobber.macro/defapp "my-bun-service"
  {:script "bunx"
   :args ["my-service@latest" "start"]
   :cwd "."
   :env {:NODE_ENV "production"}
   :instances 1
   :autorestart true
   :error-file "./logs/error.log"
   :out-file "./logs/out.log"})

(clobber.macro/ecosystem-output)
```

## Profiles (Optional)

Create a dev profile for development:

```clojure
(clobber.macro/defprofile :dev
  {:apps [
          {:name "<service-name>-dev"
           :cwd "/path/to/service"
           :script "node"
           :args ["--watch" "dist"]
           :env {:NODE_ENV "development"}
           :watch ["src"]
           :ignore_watch ["node_modules" "logs"]}]})
```

## Strong Hints
- Always end ecosystem files with `(clobber.macro/ecosystem-output)`
- Service names must be unique across all ecosystem files
- Use `:interpreter "none"` for scripts that don't need shell interpretation
- Include logs directory creation in your service's build process
- Use absolute paths for `:cwd` and log files for reliability

## Output
- New ecosystem file at `ecosystems/<service-name>.cljs`
- Updated `ecosystems/index.cljs`
- Compiled `.clobber/index.cjs`
- Service ready to start with PM2

## Related Skills
- `pm2-process-management` - Start/stop/restart services
- `render-pm2-clj-config` - Validate configs without starting
- `workspace-navigation` - Locate existing ecosystem files

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[pm2-process-management](../pm2-process-management/SKILL.md)**
- **[render-pm2-clj-config](../render-pm2-clj-config/SKILL.md)**
- **[workspace-navigation](../workspace-navigation/SKILL.md)**
