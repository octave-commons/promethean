# Draft: Debugging Logs for Promethean Agent System and Clojure Duck

## Requirements (confirmed)
- Add debugging logs to promethean agent system (orgs/riatzukiza/promethean/)
- Add debugging logs to clojure duck / clojure-mcp (orgs/bhauman/clojure-mcp/)
- Goal: Make agent operations clearly visible

## Research Findings

### Promethean Agent System (orgs/riatzukiza/promethean/)
- **Logging infrastructure**: Has `@promethean-os/logger` package (Winston-based)
- **Current logging approach**: Mostly `console.log`/`console.error` with emoji prefixes (🚀, 🔍, 📝, ❌)
- **Hack plugins for agent monitoring**:
  - `hack/async-sub-agents.ts`: Monitors sub-agent tasks, sessions, spawns, inter-agent communication
  - `hack/event-capture.ts`: Captures ALL opencode events for searchability
  - `hack/event-hooks.ts`: Logs tool execution (before/after), session state changes, LSP diagnostics, IDE installations
  - These plugins use `console.log` extensively
- **Key workflows**:
  - Agent task spawning and management
  - Session lifecycle (idle, compacted, updated, messages)
  - Inter-agent messaging
  - Tool execution tracking

### Clojure Duck (clojure-mcp)
- **Location**: External repository at `https://github.com/bhauman/clojure-mcp` (NOT checked out locally)
- **Entry points via `centralized-clojure-mcp.edn`**:
  - `mcp-central`: Unified server (port 7890)
  - `mcp-jvm`: JVM-specific (port 7891)
  - `mcp-cljs`: ClojureScript (port 7892)
  - `mcp-dev`: Development mode with logback-classic logging
  - `mcp-test`: Test mode
- **Logging infrastructure**:
  - Default: `slf4j-nop` (no-op - silent)
  - Development mode: `logback-classic` for verbose logs
  - Uses `clojure.tools.logging`

## Technical Decisions
- Promethean has winston-based logger package - should use this for structured logging
- Hack plugins need more granular logging beyond current console.log usage
- Clojure MCP has logback support - need to create logback.xml configuration for dev mode

## User Decisions (CONFIRMED)
- **Log Level**: TRACE (Maximum detail - all internal steps and decisions)
- **Color Coding**: Yes (color-coded logs: 🟢 INFO, 🟡 WARN, 🔴 ERROR for better scanning)
- **Log Location**: Files with rotation (structured log files with automatic rotation for production)
- **Key Operations to Log**: 
  - Agent task spawning/lifecycle
  - Tool execution (every tool call with inputs/outputs)
  - Session state changes (idle, compacted, updated)
  - Inter-agent communication
  - LLM interactions (model calls, responses, token usage)

## Scope Boundaries
- INCLUDE:
  - Promethean: hack/async-sub-agents.ts, hack/event-capture.ts, hack/event-hooks.ts
  - Promethean: Create/extend @promethean-os/logger usage with Winston
  - Promethean: Add logback-like structured logging configuration
  - Clojure MCP: Fetch and log external repository structure
  - Clojure MCP: Create logback.xml configuration for dev mode (TRACE level, file output)
  - Clojure MCP: Add debug logging to MCP server startup and tool execution
  - Clojure MCP: Configure log rotation for development mode
- EXCLUDE:
  - Modifying production MCP server entry points (use logback config instead)
  - Changing core logger package internals (use configuration)
  - Performance profiling (logging should have minimal overhead)

---

---


## Research In Progress
- [x] Launched explore task for promethean agent system
- [x] Launched explore task for clojure-mcp
- [ ] Wait for results and analyze
- [ ] Identify key workflows
- [ ] Research logging best practices

## Questions to Ask User
- What level of logging granularity do you want? (INFO, DEBUG, TRACE?)
- Should logs be color-coded?
- Do you want timestamps in logs?
- Should logging be configurable (enable/disable via env vars)?
- Any specific agent operations you most want visibility into?
- Log output format preferences (JSON, structured, plain text)?

## Technical Decisions
- TBD based on research findings

## Open Questions
- What logging libraries are already in use?
- What are the key agent workflows that need visibility?
