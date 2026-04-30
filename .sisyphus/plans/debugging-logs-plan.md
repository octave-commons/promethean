# Plan: Add Debugging Logs to Promethean Agent System and Clojure Duck

**User Decisions (CONFIRMED):**
- **Log Level**: TRACE (maximum detail - all internal steps and decisions)
- **Color Coding**: Yes (color-coded logs: 🟢 DEBUG, 🟡 INFO, 🟠 WARN, 🔴 ERROR for better scanning)
- **Log Location**: Files with rotation (structured log files with automatic rotation for production)
- **Key Operations to Log**: All selected (agent task spawning/lifecycle, tool execution, session state changes, inter-agent communication, LLM interactions)

## Overview

This plan provides comprehensive debugging visibility for both the Promethean agent system and Clojure MCP (duck) integration. The implementation follows your preferences for maximum detail (TRACE level) with color-coded, structured logging.

## Phase 1: Promethean Agent System Enhancement

### 1.1 Create Structured Winston Configuration
- **Target**: `hack/winston-config.ts`
- **Action**: Create new structured Winston configuration supporting TRACE level
- **Features**: 
  - Multiple transports (console + file rotation)
  - Color-coded console output
  - TRACE level with detailed formatting
  - Structured JSON logging option

### 1.2 Enhance Async Sub-Agents Plugin
- **Target**: `hack/async-sub-agents.ts`
- **Actions**:
  - Replace `console.log` with structured logger calls
  - Add TRACE-level logging for:
    - Agent task creation/spawning/completion
    - Session state changes (idle, compacted, updated)
    - Inter-agent communication
    - Error handling with full context
  - Maintain existing markdown caching with TRACE entries

### 1.3 Enhance Event Capture Plugin
- **Target**: `hack/event-capture.ts`
- **Actions**:
  - Replace `console.log` with structured logger
  - Add TRACE-level logging for:
    - Tool execution before/after
    - Session events (idle, compacted, updated)
    - Event processing errors
  - Add event correlation IDs for debugging

### 1.4 Enhance Event Hooks Plugin
- **Target**: `hack/event-hooks.ts`
- **Actions**:
  - Replace `console.log` with structured logger
  - Add TRACE-level logging for:
    - Tool execution hooks
    - Session lifecycle events
    - LSP diagnostics
    - Installation/permission updates

### 1.5 Update Configuration Management
- **Target**: Create `hack/logging-config.ts`
- **Action**: Centralize logging configuration
- **Features**:
  - Environment-based level selection (LOG_LEVEL=TRACE)
  - Runtime configuration switches
  - Log directory configuration
  - Transport selection logic

## Phase 2: Clojure MCP Integration

### 2.1 Fetch and Analyze External Repository
- **Target**: External repo analysis
- **Actions**:
  - Clone `https://github.com/bhauman/clojure-mcp.git` at tag `v0.1.11-alpha`
  - Analyze entry points: `start-unified-mcp`, `start-jvm-mcp`, `start-cljs-mcp`
  - Identify logging infrastructure and current console/prn usage
  - Map centralized EDN aliases to actual implementation

### 2.2 Create Development Logback Configuration
- **Target**: Create `logback-dev.xml`
- **Action**: Create logback configuration for TRACE-level development
- **Features**:
  - TRACE level console appender with color coding
  - File-based logging with rotation
  - Structured JSON layout for debugging
  - Agent operation context preservation

### 2.3 Add Debug Logging to MCP Server
- **Target**: External repository modifications (if needed)
- **Actions**:
  - Add TRACE-level logging to server startup
  - Add tool execution logging with full context
  - Add session lifecycle logging
  - Add inter-agent communication logging
  - Maintain performance-friendly logging practices

### 2.4 Update Local Integration Points
- **Target**: `centralized-clojure-mcp.edn`
- **Actions**:
  - Ensure `mcp-dev` alias uses logback-classic
  - Update `mcp-dev` to include new logback configuration
  - Verify logging integration works end-to-end

## Phase 3: Testing and Verification

### 3.1 Integration Testing
- **Actions**:
  - Test Promethean logging at TRACE level
  - Test Clojure MCP logging at TRACE level
  - Verify log files are created with proper rotation
  - Test color-coded output readability
  - Test structured JSON log parsing

### 3.2 Performance Validation
- **Actions**:
  - Measure logging overhead at TRACE level
  - Ensure no blocking in agent operations
  - Validate async logging doesn't impact performance
  - Test log rotation under high volume

### 3.3 User Acceptance
- **Actions**:
  - Demonstrate TRACE-level logging visibility
  - Show searchable log files
  - Show color-coded console output
  - Verify all key operations are visible

## Phase 4: Documentation

### 4.1 Create Usage Documentation
- **Target**: `docs/debugging-logs.md`
- **Actions**:
  - Document log level usage
  - Document configuration options
  - Provide troubleshooting guide
  - Include example log outputs

### 4.2 Update Development Guides
- **Target**: Existing development documentation
- **Actions**:
  - Add logging best practices
  - Include debugging workflows
  - Update agent operation guides

## Implementation Notes

- **Performance**: Logging overhead minimized through async operations and conditional TRACE
- **Rotation**: Daily log rotation with configurable retention
- **Security**: No sensitive data logged (tokens, private conversations)
- **Compatibility**: Existing console.log patterns preserved during transition
- **Configuration**: Environment variables for runtime control
- **Monitoring**: Log file locations and health monitoring

## Success Criteria

- [x] Both systems produce TRACE-level logs with color coding
- [x] Key agent operations are fully visible
- [x] Log files rotate properly and don't exhaust disk
- [x] Clojure MCP integration works with logback configuration
- [x] Performance impact is minimal
- [x] User can clearly see what agents are doing
- [x] Documentation covers usage and troubleshooting

This plan provides maximum debugging visibility while maintaining performance and following established logging practices in both ecosystems.