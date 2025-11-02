---
uuid: "task-create-pm2-log-monitor-2025-10-26"
title: "Create PM2 Log Monitor Package"
slug: "create-pm2-log-monitor-package"
status: "incoming"
priority: "P1"
labels: ["kanban", "pm2", "pantheon", "log-monitoring", "package"]
created_at: "2025-10-26T15:00:00Z"
estimates:
  complexity: "5"
  scale: "medium"
  time_to_completion: "2-3 sessions"
---

# Create PM2 Log Monitor Package

## 🎯 Task Overview

Design and implement `@promethean-os/pm2-log-monitor` package that monitors PM2 logs using Pantheon workflow. The package will stream PM2 logs, buffer them with time/size triggers, analyze using Pantheon actors, and generate reports in `docs/report.md` format.

## 📋 Acceptance Criteria

- [ ] Create package structure following Pantheon patterns
- [ ] Implement PM2 log stream adapter using ports/adapters pattern
- [ ] Build log buffer with configurable time/size triggers
- [ ] Create Pantheon actor for intelligent log analysis
- [ ] Generate automated markdown reports in `docs/report.md`
- [ ] Provide CLI interface for starting/stopping monitoring
- [ ] Include comprehensive tests and documentation

## 🔧 Implementation Details

### Package Architecture

```
packages/pm2-log-monitor/
├── src/
│   ├── core/
│   │   ├── types.ts          # Core type definitions
│   │   ├── ports.ts          # Pantheon port interfaces
│   │   └── config.ts         # Configuration management
│   ├── adapters/
│   │   ├── pm2-adapter.ts    # PM2 log stream adapter
│   │   └── buffer-adapter.ts # Log buffer management
│   ├── actors/
│   │   ├── log-analyzer.ts   # Log analysis actor
│   │   └── report-generator.ts # Report generation actor
│   ├── cli/
│   │   └── index.ts          # CLI interface
│   ├── utils/
│   │   └── index.ts          # Utility functions
│   └── index.ts              # Main exports
├── tests/
├── package.json
├── tsconfig.json
├── ava.config.mjs
└── README.md
```

### Core Components

#### 1. PM2 Log Stream Adapter

```typescript
interface PM2LogEntry {
  timestamp: number;
  process: string;
  pid: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  raw: string;
}

interface PM2LogPort extends ToolPort {
  startStream(options?: PM2StreamOptions): Promise<AsyncIterable<PM2LogEntry>>;
  stopStream(): Promise<void>;
  getProcesses(): Promise<PM2Process[]>;
}
```

#### 2. Log Buffer System

```typescript
interface LogBuffer {
  entries: PM2LogEntry[];
  size: number;
  maxSize: number;
  lastFlush: number;
  flushInterval: number;
}

interface BufferConfig {
  maxSize: number;        // Default: 1000 entries
  flushInterval: number;  // Default: 5 minutes
  timeThreshold: number;   // Default: 10 minutes
}
```

#### 3. Pantheon Actor Integration

```typescript
interface LogAnalysisActorConfig extends ActorConfig {
  analysisPrompt?: string;
  reportTemplate?: string;
  llm: LlmPort;
}

interface ReportGeneratorConfig {
  outputPath: string;     // Default: docs/report.md
  template: string;
  includeMetrics: boolean;
  includeRecommendations: boolean;
}
```

### Key Features

#### 1. Real-time Log Streaming
- Connect to PM2 log streams using child processes
- Parse and structure log entries
- Filter by process, log level, and patterns
- Handle connection failures and reconnections

#### 2. Intelligent Buffering
- Time-based flushing (configurable intervals)
- Size-based flushing (when buffer reaches limit)
- Pattern-based flushing (error conditions, etc.)
- Persistent buffer state across restarts

#### 3. Pantheon Workflow Integration
- Use `ActorPort` for log analysis lifecycle
- Use `ToolPort` for PM2 command execution
- Use `ContextPort` for compiling analysis context
- Use `LlmPort` for intelligent log interpretation

#### 4. Automated Report Generation
```markdown
# PM2 Log Analysis Report

## Summary
- Analysis Period: 2025-10-26 14:00 - 15:00
- Total Log Entries: 1,247
- Error Rate: 2.3%
- Critical Issues: 3

## Key Findings
### 🚨 Critical Issues
1. Memory leak detected in `api-server` (PID: 1234)
2. Database connection timeouts in `worker-2`
3. Unhandled exceptions in `auth-service`

### 📊 Performance Metrics
- Average Response Time: 145ms
- Memory Usage: 512MB (peak: 780MB)
- CPU Usage: 23% (peak: 67%)

### 🔍 Recommendations
1. Restart `api-server` to clear memory leak
2. Increase database connection pool size
3. Add error handling for authentication failures
```

#### 5. CLI Interface
```bash
# Start monitoring all PM2 processes
pnpm pm2-log-monitor start

# Start monitoring specific processes
pnpm pm2-log-monitor start --processes api-server,worker-1

# Configure buffer settings
pnpm pm2-log-monitor start --buffer-size 500 --flush-interval 3m

# Generate immediate report
pnpm pm2-log-monitor report --output docs/emergency-report.md

# Stop monitoring
pnpm pm2-log-monitor stop
```

### Configuration Options

```typescript
interface PM2LogMonitorConfig {
  // PM2 Connection
  pm2Home?: string;           // Default: ~/.pm2
  processes?: string[];        // Default: all processes
  
  // Buffer Settings
  buffer: BufferConfig;
  
  // Analysis Settings
  analysis: {
    llmModel: string;          // Default: gpt-3.5-turbo
    analysisPrompt: string;
    enableRecommendations: boolean;
  };
  
  // Report Settings
  report: {
    outputPath: string;        // Default: docs/report.md
    template: string;
    includeMetrics: boolean;
    schedule: string;          // Cron expression for scheduled reports
  };
}
```

### Integration with Existing Systems

#### 1. Pantheon Framework Integration
- Extend existing `ToolPort` for PM2 operations
- Use `ActorPort` for analysis lifecycle management
- Leverage `LlmPort` for intelligent log interpretation
- Follow established patterns from `@promethean-os/pantheon`

#### 2. Monitoring System Integration
- Complement existing `@promethean-os/monitoring` package
- Share metrics and alerting infrastructure
- Unified dashboard for system health

#### 3. CLI Integration
- Follow patterns from existing CLI packages
- Consistent command structure and help system
- Integration with main Promethean CLI

## 🧪 Testing Requirements

### Unit Tests
- PM2 log stream parsing
- Buffer management logic
- Actor configuration and execution
- Report generation templates

### Integration Tests
- End-to-end log monitoring workflow
- PM2 process interaction
- Pantheon actor coordination
- CLI command execution

### Performance Tests
- High-volume log processing
- Memory usage under load
- Buffer flush performance
- Concurrent monitoring scenarios

## 🎯 Definition of Done

Implementation complete with:

1. ✅ Full package structure following Pantheon patterns
2. ✅ Working PM2 log stream adapter with error handling
3. ✅ Configurable buffer system with multiple trigger types
4. ✅ Pantheon actor for intelligent log analysis
5. ✅ Automated markdown report generation
6. ✅ CLI interface with all required commands
7. ✅ Comprehensive test coverage (>90%)
8. ✅ Complete documentation and examples
9. ✅ Integration with existing Promethean systems
10. ✅ Performance optimization for production use

---

_Created: 2025-10-26T15:00:00Z_
_Epic: Monitoring & Observability_
_Estimated Complexity: 5 (Fibonacci)_
_Estimated Time: 2-3 development sessions_

## 📊 Implementation Plan (Updated 2025-10-26)

### **Phase 1: Core Package Structure** 
**Timeline: Session 1 (First Half)**
- [ ] Create `packages/pm2-log-monitor/` directory structure
- [ ] Set up TypeScript configuration extending `../../config/tsconfig.base.json`
- [ ] Configure AVA testing with `../../config/ava.config.mjs`
- [ ] Create package.json with proper dependencies and scripts
- [ ] Define core types and interfaces

**Key Files to Create:**
```
packages/pm2-log-monitor/
├── package.json
├── tsconfig.json  
├── ava.config.mjs
├── src/
│   ├── core/
│   │   ├── types.ts
│   │   ├── ports.ts
│   │   └── config.ts
│   └── index.ts
```

### **Phase 2: PM2 Integration Layer**
**Timeline: Session 1 (Second Half)**
- [ ] Create PM2 log stream adapter using child processes
- [ ] Implement log parsing and structuring
- [ ] Handle PM2 process discovery and filtering
- [ ] Add error handling and reconnection logic

**Technical Implementation:**
```typescript
// PM2 Log Stream Adapter
class PM2LogStreamAdapter implements PM2LogPort {
  async startStream(options: PM2StreamOptions): Promise<AsyncIterable<PM2LogEntry>> {
    // Use child_process.spawn to execute 'pm2 logs --lines 0 --nostream'
    // Parse output in real-time
    // Return AsyncIterable of structured log entries
  }
}
```

### **Phase 3: Buffer System**
**Timeline: Session 2 (First Half)**
- [ ] Implement time-based and size-based log buffering
- [ ] Add configurable flush triggers
- [ ] Create persistent buffer state management
- [ ] Add buffer overflow protection

**Buffer Configuration:**
```typescript
interface BufferConfig {
  maxSize: number;        // Default: 1000 entries
  flushInterval: number;  // Default: 5 minutes  
  timeThreshold: number;   // Default: 10 minutes
  persistent: boolean;     // Default: true
}
```

### **Phase 4: Pantheon Actor Integration**
**Timeline: Session 2 (Second Half)**
- [ ] Create log analysis actor using `ActorPort`
- [ ] Integrate with `LlmPort` for intelligent analysis
- [ ] Use `ContextPort` for analysis context compilation
- [ ] Implement actor lifecycle management

**Actor Configuration:**
```typescript
interface LogAnalysisActorConfig extends ActorConfig {
  analysisPrompt: string;
  reportTemplate: string;
  bufferConfig: BufferConfig;
  llm: LlmPort;
}
```

### **Phase 5: Report Generation**
**Timeline: Session 3 (First Half)**
- [ ] Implement markdown report generation
- [ ] Create configurable report templates
- [ ] Add automated scheduling capabilities
- [ ] Generate reports in `docs/report.md` format

**Report Template Structure:**
```markdown
# PM2 Log Analysis Report
## Summary
- Analysis Period: {timestamp_range}
- Total Log Entries: {total_entries}
- Error Rate: {error_rate}
- Critical Issues: {critical_count}

## Key Findings
### 🚨 Critical Issues
{critical_issues_list}

### 📊 Performance Metrics  
{performance_metrics}

### 🔍 Recommendations
{recommendations}
```

### **Phase 6: CLI Interface**
**Timeline: Session 3 (Second Half)**
- [ ] Create CLI commands following established patterns
- [ ] Integrate with main Promethean CLI
- [ ] Add configuration management
- [ ] Implement start/stop/status commands

**CLI Commands:**
```bash
pnpm pm2-log-monitor start [--processes <list>] [--buffer-size <n>] [--flush-interval <time>]
pnpm pm2-log-monitor stop [--monitor-id <id>]
pnpm pm2-log-monitor status [--monitor-id <id>]
pnpm pm2-log-monitor report [--output <path>] [--template <name>]
```

## 🔍 Codebase Analysis Results

### **Existing Infrastructure to Leverage:**

1. **`@promethean-os/pm2-helpers`**: 
   - Provides PM2 application definitions
   - Has established PM2 process management patterns
   - Can be used for PM2 process discovery

2. **`@promethean-os/pantheon`**:
   - Clear ports/adapters pattern (`ToolPort`, `ActorPort`, `ContextPort`, `LlmPort`)
   - Actor lifecycle management
   - LLM integration capabilities

3. **`@promethean-os/monitoring`**:
   - Existing metrics and alerting infrastructure
   - Can be extended for log-based metrics
   - Provides unified monitoring dashboard

4. **Package Structure Patterns**:
   - Standardized TypeScript configuration
   - Shared AVA testing configuration
   - Consistent package.json scripts and dependencies

### **Integration Strategy:**

1. **PM2 Integration**: Build on top of `@promethean-os/pm2-helpers`
2. **Pantheon Workflow**: Use existing ports and actor patterns
3. **Monitoring**: Complement `@promethean-os/monitoring` with log analysis
4. **CLI**: Follow established CLI package patterns

## 🎯 Updated Acceptance Criteria

### **Core Functionality**
- [x] Package structure follows Pantheon patterns
- [ ] PM2 log stream adapter with real-time parsing
- [ ] Configurable buffer system (time/size triggers)
- [ ] Pantheon actor integration for intelligent analysis
- [ ] Automated markdown report generation
- [ ] CLI interface with start/stop/status commands

### **Quality & Integration**
- [ ] Comprehensive test coverage (>90%)
- [ ] Integration with existing PM2 helpers
- [ ] Pantheon workflow compliance
- [ ] Performance optimization for production use
- [ ] Complete documentation and examples

### **Configuration & Extensibility**
- [ ] Flexible configuration system
- [ ] Customizable report templates
- [ ] Plugin architecture for custom analyzers
- [ ] Environment-specific configurations

## 📈 Success Metrics

1. **Performance**: Handle >1000 log entries/second without memory leaks
2. **Reliability**: 99.9% uptime with automatic recovery
3. **Usability**: Simple CLI with comprehensive help system
4. **Integration**: Seamless integration with existing Promethean packages
5. **Documentation**: Complete API documentation with examples

## 🚦 Risk Assessment & Mitigation

### **High Risk Items**
1. **PM2 API Changes**: Mitigate by using stable PM2 CLI commands
2. **Memory Usage**: Implement buffer limits and monitoring
3. **LLM Integration**: Use existing Pantheon LLM patterns

### **Medium Risk Items**  
1. **Performance at Scale**: Implement streaming and buffering
2. **Configuration Complexity**: Provide sensible defaults
3. **Error Handling**: Comprehensive error recovery mechanisms

### **Low Risk Items**
1. **Package Dependencies**: Use existing workspace packages
2. **Build System**: Follow established patterns
3. **Testing**: Use existing AVA configuration

---

_Implementation Plan Updated: 2025-10-26T15:30:00Z_
_Phase Breakdown: 6 phases across 2-3 sessions_
_Risk Assessment: Complete with mitigation strategies_
_Success Metrics: Defined and measurable_
