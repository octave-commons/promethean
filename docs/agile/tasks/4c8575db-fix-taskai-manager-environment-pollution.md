---
uuid: "4c8575db-873a-4b28-839d-ac0ea609a8be"
title: "Fix TaskAIManager Environment Variable Pollution - Security Issue"
slug: "fix-taskai-manager-environment-pollution"
status: "todo"
priority: "P0"
storyPoints: 5
lastCommitSha: "pending"
labels: ["critical", "security", "bugfix", "ai-integration", "environment"]
created_at: "2025-10-26T16:35:00Z"
estimates:
  complexity: "medium"
---

# Fix TaskAIManager Environment Variable Pollution - Security Issue

## Executive Summary

The TaskAIManager directly modifies `process.env` which affects the entire Node.js process, creating global side effects, thread safety issues, and potential security vulnerabilities.

## Critical Issues Identified

- **Global environment variable pollution**
- **Thread safety issues in concurrent environments**
- **Makes testing difficult and unreliable**
- **Potential security risk with shared process state**
- **Affects all other modules in the same process**

## Problematic Code

**File:** `/packages/kanban/src/lib/task-content/ai.ts` (lines 72-73)

```typescript
// Set environment variables for the LLM driver
process.env.LLM_DRIVER = 'ollama';
process.env.LLM_MODEL = this.config.model;
```

## Security & Architecture Risks

1. **Global State Pollution**: Affects entire Node.js process
2. **Race Conditions**: Unsafe in concurrent/async environments
3. **Test Isolation**: Tests interfere with each other
4. **Security Exposure**: Global variables accessible to all modules
5. **Debugging Difficulty**: Hard to trace state changes

## Required Actions

### 1. Replace Global Environment Variables

**Current Code:**
```typescript
process.env.LLM_DRIVER = 'ollama';
process.env.LLM_MODEL = this.config.model;
```

**Required Fix:**
```typescript
private getEnvironmentConfig() {
  return {
    LLM_DRIVER: 'ollama',
    LLM_MODEL: this.config.model,
    LLM_BASE_URL: this.config.baseUrl,
    LLM_TIMEOUT: this.config.timeout.toString(),
    LLM_MAX_TOKENS: this.config.maxTokens.toString(),
    LLM_TEMPERATURE: this.config.temperature.toString()
  };
}

// Pass this to the LLM driver instead of setting global env vars
const envConfig = this.getEnvironmentConfig();
await this.llmDriver.initialize(envConfig);
```

### 2. Update LLM Driver Integration

- Modify LLM driver to accept configuration object
- Remove dependency on global environment variables
- Add proper configuration validation
- Implement configuration isolation per instance

### 3. Add Configuration Validation

```typescript
private validateConfig(config: TaskAIManagerConfig): void {
  if (!config.model || typeof config.model !== 'string') {
    throw new Error('Model name is required and must be a string');
  }
  
  if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
    throw new Error('Base URL must be a valid URL');
  }
  
  if (config.timeout && (config.timeout <= 0 || config.timeout > 300000)) {
    throw new Error('Timeout must be between 1ms and 5 minutes');
  }
}
```

### 4. Implement Proper Dependency Injection

```typescript
export interface LLMDriver {
  initialize(config: LLMConfig): Promise<void>;
  generate(prompt: string): Promise<string>;
  dispose(): Promise<void>;
}

export class TaskAIManager {
  constructor(
    config: TaskAIManagerConfig = {},
    llmDriver?: LLMDriver
  ) {
    this.config = this.validateAndNormalizeConfig(config);
    this.llmDriver = llmDriver || new DefaultLLMDriver();
  }
}
```

## Acceptance Criteria

- [ ] All `process.env` modifications removed
- [ ] LLM driver accepts configuration object
- [ ] Configuration validation implemented
- [ ] Dependency injection pattern implemented
- [ ] All tests pass without environment pollution
- [ ] Thread safety verified in concurrent scenarios
- [ ] Security review completed

## Files to Modify

- `/packages/kanban/src/lib/task-content/ai.ts` (lines 72-73)
- LLM driver integration files
- Configuration validation files
- Related test files

## Security Impact

**HIGH** - Global state pollution can lead to:
- Unauthorized access to configuration
- Cross-module interference
- Security vulnerabilities in shared state
- Difficult to audit configuration changes

## Testing Requirements

- Unit tests for configuration isolation
- Integration tests for concurrent usage
- Security tests for configuration access
- Performance tests for configuration overhead

## Priority

**CRITICAL** - Security vulnerability and architectural issue affecting system stability.

## Dependencies

- LLM driver configuration interface
- Configuration validation framework
- Dependency injection implementation

---

**Created:** 2025-10-26  
**Assignee:** TBD  
**Due Date:** 2025-10-28
**Security Review Required:** Yes
