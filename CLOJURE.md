# Clojure Development Environment

This directory contains centralized configuration files for unified Clojure development across all subprojects.

## Quick Start

### Start Development Environment
```bash
# Start all services (JVM REPL, CLJS REPL, MCP server, Shadow-CLJS watch)
./repl.sh all

# Or use Babashka version
bb clojure-dev.clj dev-all
```

### Individual Services
```bash
# JVM REPL only
./repl.sh jvm

# ClojureScript REPL only  
./repl.sh cljs

# MCP server only
./repl.sh mcp

# Shadow-CLJS watch only
./repl.sh shadow
```

## Configuration Files

### `deps.edn`
Centralized JVM Clojure configuration including:
- All source paths from subprojects
- Unified dependency management
- REPL configurations with CIDER middleware
- MCP server integration
- Development and testing aliases

### `shadow-cljs.edn`
Centralized ClojureScript configuration including:
- All frontend builds from Promethean and Riatzukiza
- Browser, Node.js, and NPM module targets
- Development server configurations
- Build optimization settings

### `bb.edn`
Babashka task runner with unified tasks:
- `bb repl:jvm` - Start JVM REPL
- `bb repl:cljs` - Start ClojureScript REPL
- `bb mcp:start` - Start MCP server
- `bb build:cljs` - Build all CLJS projects
- `bb test:all` - Run all tests
- `bb workspace:setup` - Setup entire workspace

## Project Structure

### JVM Projects
- `clojure-mcp/` - MCP server implementation
- `promethean/packages/clj-hacks/` - Clojure utilities
- `promethean/packages/ecosystem-dsl/` - Ecosystem generation

### ClojureScript Projects  
- `promethean/packages/opencode-unified/` - Opencode frontend
- `promethean/packages/frontend-service/` - Frontend services
- `promethean/packages/frontends/*/` - Various frontend applications
- `riatzukiza/openhax/packages/opencode-reactant/` - Reactant frontend

## Development Workflow

1. **Setup**: `bb workspace:setup`
2. **Start REPLs**: `./repl.sh all` or `bb repl:all`
3. **Watch builds**: `bb build:dev` or `./repl.sh shadow`
4. **Run tests**: `bb test:all`
5. **Lint code**: `bb lint:all`

## Port Configuration

- JVM REPL: 7888
- ClojureScript REPL: 9000  
- MCP Server: 7888
- Various frontend dev servers: 8080-8083

## Integration

All configurations are designed to work together:
- Single JVM REPL can access all Clojure namespaces
- Single CLJS REPL can access all ClojureScript namespaces
- MCP server integrates with both runtimes
- Shadow-CLJS can build all projects simultaneously