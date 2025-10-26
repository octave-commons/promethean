# Pantheon Security Implementation Plan

## Executive Summary

**Implementation Start**: October 20, 2025  
**Target Completion**: October 27, 2025  
**Total Effort**: 40 hours across 3 phases  
**Priority**: P0 - Critical Security Enhancements

## Phase 1: Critical Security Fixes (24 hours)

### 1.1 Tool Execution Security Implementation (8 hours)

#### Files to Create/Modify:

**New File**: `packages/agents/pantheon/src/security/tool-executor.ts`
```typescript
import { spawn, ChildProcess } from 'child_process';
import { SecurityContext, SandboxConfig } from '../core/types/os-protocol.js';
import { SecurityLogger, SecurityValidator } from '../context/security.js';

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  resourcesUsed: {
    memory: number;
    cpu: number;
    duration: number;
  };
}

export class SecureToolExecutor {
  private activeExecutions: Map<string, ChildProcess> = new Map();
  
  async executeTool(
    toolName: string,
    toolHandler: Function,
    parameters: any,
    context: SecurityContext
  ): Promise<ToolExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    try {
      // Validate tool parameters
      const validatedParams = await this.validateToolParameters(toolName, parameters);
      
      // Create sandbox environment
      const sandbox = await this.createSandbox(context.sandbox);
      
      // Execute with resource limits
      const result = await this.executeWithLimits(
        executionId,
        toolName,
        toolHandler,
        validatedParams,
        sandbox,
        context.resourceLimits
      );
      
      // Log successful execution
      this.logExecution(executionId, toolName, 'success', {
        duration: Date.now() - startTime,
        resourcesUsed: result.resourcesUsed
      });
      
      return result;
    } catch (error) {
      // Log failed execution
      this.logExecution(executionId, toolName, 'failure', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }
  
  private async validateToolParameters(toolName: string, parameters: any): Promise<any> {
    // Prevent command injection
    if (typeof parameters === 'string') {
      if (this.containsCommandInjection(parameters)) {
        throw new Error('Command injection detected in tool parameters');
      }
    }
    
    // Validate object parameters
    if (parameters && typeof parameters === 'object') {
      const sanitized = SecurityValidator.sanitizeObject(parameters);
      return sanitized;
    }
    
    return parameters;
  }
  
  private containsCommandInjection(input: string): boolean {
    const dangerousPatterns = [
      /[;&|`$(){}[\]]/,  // Shell metacharacters
      /\.\./,           // Path traversal
      /\/etc\/passwd/,   // System file access
      /rm\s+-rf/,       // Dangerous commands
      /sudo/,           // Privilege escalation
      /curl.*\|.*sh/,   // Remote code execution
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(input));
  }
  
  private async createSandbox(config: SandboxConfig): Promise<any> {
    if (!config.enabled) {
      return { type: 'none' };
    }
    
    switch (config.isolation) {
      case 'process':
        return this.createProcessSandbox(config);
      case 'container':
        return this.createContainerSandbox(config);
      case 'vm':
        return this.createVMSandbox(config);
      default:
        throw new Error(`Unsupported sandbox isolation: ${config.isolation}`);
    }
  }
  
  private async executeWithLimits(
    executionId: string,
    toolName: string,
    toolHandler: Function,
    parameters: any,
    sandbox: any,
    resourceLimits: any
  ): Promise<ToolExecutionResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let timeoutId: NodeJS.Timeout;
      
      // Set up timeout
      if (sandbox.timeout) {
        timeoutId = setTimeout(() => {
          this.terminateExecution(executionId);
          reject(new Error(`Tool execution timeout: ${sandbox.timeout}ms`));
        }, sandbox.timeout);
      }
      
      // Execute tool in sandbox
      this.executeInSandbox(sandbox, toolHandler, parameters)
        .then((output) => {
          if (timeoutId) clearTimeout(timeoutId);
          
          resolve({
            success: true,
            output,
            executionTime: Date.now() - startTime,
            resourcesUsed: {
              memory: 0, // TODO: Implement memory tracking
              cpu: 0,    // TODO: Implement CPU tracking
              duration: Date.now() - startTime
            }
          });
        })
        .catch((error) => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
  
  private async executeInSandbox(
    sandbox: any,
    toolHandler: Function,
    parameters: any
  ): Promise<any> {
    switch (sandbox.type) {
      case 'none':
        return await toolHandler(parameters);
      case 'process':
        return await this.executeInProcessSandbox(sandbox, toolHandler, parameters);
      case 'container':
        return await this.executeInContainerSandbox(sandbox, toolHandler, parameters);
      default:
        throw new Error(`Unsupported sandbox type: ${sandbox.type}`);
    }
  }
  
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private logExecution(
    executionId: string,
    toolName: string,
    result: 'success' | 'failure',
    details: any
  ): void {
    SecurityLogger.log({
      type: 'data_access',
      severity: result === 'success' ? 'low' : 'medium',
      action: 'tool_execution',
      details: {
        executionId,
        toolName,
        result,
        ...details
      }
    });
  }
  
  private terminateExecution(executionId: string): void {
    const process = this.activeExecutions.get(executionId);
    if (process) {
      process.kill('SIGKILL');
      this.activeExecutions.delete(executionId);
    }
  }
}
```

**Modify**: `packages/agents/pantheon/src/core/types/orchestration.ts`
```typescript
// Add tool execution security types
export interface SecureToolConfig {
  sandbox: SandboxConfig;
  resourceLimits: ResourceLimits;
  allowedParameters: string[];
  blockedParameters: string[];
  requireAuthentication: boolean;
  auditExecution: boolean;
}

export interface ToolExecutionContext {
  executionId: string;
  toolName: string;
  agentId: string;
  permissions: string[];
  sandbox: SandboxConfig;
  startTime: Date;
}
```

### 1.2 MCP Security Hardening (8 hours)

**New File**: `packages/mcp/src/security/mcp-security.ts`
```typescript
import { z } from 'zod';
import { SecurityLogger, SecurityValidator } from '../../../agents/pantheon/src/context/security.js';
import type { Tool } from '../core/types.js';

export interface McpSecurityConfig {
  maxInputSize: number;
  maxOutputSize: number;
  allowedToolNames: string[];
  blockedToolNames: string[];
  requireAuthentication: boolean;
  auditAllCalls: boolean;
  rateLimitPerTool: Map<string, number>;
}

export class McpSecurityManager {
  private config: McpSecurityConfig;
  
  constructor(config: Partial<McpSecurityConfig> = {}) {
    this.config = {
      maxInputSize: 1024 * 1024, // 1MB
      maxOutputSize: 10 * 1024 * 1024, // 10MB
      allowedToolNames: [],
      blockedToolNames: ['eval', 'exec', 'system', 'shell'],
      requireAuthentication: true,
      auditAllCalls: true,
      rateLimitPerTool: new Map([
        ['file_operations', 10],
        ['system_commands', 1],
        ['network_requests', 5]
      ]),
      ...config
    };
  }
  
  async validateToolCall(
    toolName: string,
    parameters: any,
    context?: any
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check if tool is blocked
      if (this.config.blockedToolNames.includes(toolName)) {
        return { valid: false, error: `Tool '${toolName}' is blocked` };
      }
      
      // Check if tool is allowed (if whitelist is configured)
      if (this.config.allowedToolNames.length > 0 && 
          !this.config.allowedToolNames.includes(toolName)) {
        return { valid: false, error: `Tool '${toolName}' is not allowed` };
      }
      
      // Validate input size
      const inputSize = JSON.stringify(parameters).length;
      if (inputSize > this.config.maxInputSize) {
        return { valid: false, error: `Input size exceeds limit: ${inputSize} > ${this.config.maxInputSize}` };
      }
      
      // Validate parameters against security rules
      const validationResult = await this.validateParameters(toolName, parameters);
      if (!validationResult.valid) {
        return validationResult;
      }
      
      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(toolName, context?.agentId);
      if (!rateLimitResult.allowed) {
        return { valid: false, error: `Rate limit exceeded for tool '${toolName}'` };
      }
      
      return { valid: true };
    } catch (error) {
      SecurityLogger.log({
        type: 'validation',
        severity: 'medium',
        action: 'mcp_tool_validation_failed',
        details: { toolName, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return { valid: false, error: 'Validation failed' };
    }
  }
  
  private async validateParameters(toolName: string, parameters: any): Promise<{ valid: boolean; error?: string }> {
    // Prevent command injection
    if (typeof parameters === 'string') {
      if (this.containsMaliciousContent(parameters)) {
        return { valid: false, error: 'Malicious content detected in parameters' };
      }
    }
    
    // Validate object parameters
    if (parameters && typeof parameters === 'object') {
      const sanitized = SecurityValidator.sanitizeObject(parameters);
      
      // Check for dangerous file operations
      if (this.containsDangerousFileOperations(sanitized)) {
        return { valid: false, error: 'Dangerous file operations detected' };
      }
      
      // Check for network operations
      if (this.containsUnauthorizedNetworkOperations(sanitized)) {
        return { valid: false, error: 'Unauthorized network operations detected' };
      }
    }
    
    return { valid: true };
  }
  
  private containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /javascript:/gi,                                        // JavaScript protocol
      /data:text\/html/gi,                                   // Data URI HTML
      /vbscript:/gi,                                         // VBScript protocol
      /on\w+\s*=/gi,                                        // Event handlers
      /[;&|`$(){}[\]]/,                                      // Shell metacharacters
      /\.\./,                                                // Path traversal
      /\/etc\/passwd/,                                       // System files
      /rm\s+-rf/,                                           // Dangerous commands
      /sudo/,                                                // Privilege escalation
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
  }
  
  private containsDangerousFileOperations(obj: any): boolean {
    const dangerousPaths = [
      '/etc/passwd',
      '/etc/shadow',
      '/root/',
      '/system/',
      '../',
      '~/.ssh/',
      '~/.aws/'
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return dangerousPaths.some(path => value.includes(path));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(obj);
  }
  
  private containsUnauthorizedNetworkOperations(obj: any): boolean {
    const networkPatterns = [
      /https?:\/\/[^\/]*localhost[^\/]*/i,
      /https?:\/\/127\.0\.0\.1/i,
      /https?:\/\/10\./i,
      /https?:\/\/192\.168\./i,
      /https?:\/\/172\.1[6-9]\./i,
      /https?:\/\/172\.2[0-9]\./i,
      /https?:\/\/172\.3[0-1]\./i
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return networkPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(obj);
  }
  
  private async checkRateLimit(toolName: string, agentId?: string): Promise<{ allowed: boolean }> {
    const limit = this.config.rateLimitPerTool.get(toolName) || 100;
    
    // TODO: Implement actual rate limiting with Redis or database
    // For now, just return true
    return { allowed: true };
  }
  
  async auditToolCall(
    toolName: string,
    parameters: any,
    result: any,
    executionTime: number,
    agentId?: string
  ): Promise<void> {
    if (!this.config.auditAllCalls) {
      return;
    }
    
    SecurityLogger.log({
      type: 'data_access',
      severity: 'low',
      agentId,
      action: 'mcp_tool_execution',
      details: {
        toolName,
        executionTime,
        inputSize: JSON.stringify(parameters).length,
        outputSize: JSON.stringify(result).length,
        success: true
      }
    });
  }
}
```

**Modify**: `packages/mcp/src/core/mcp-server.ts`
```typescript
import { McpSecurityManager } from '../security/mcp-security.js';

export const createMcpServer = (tools: readonly Tool[], securityConfig?: any) => {
  const server = new McpServer({ name: 'promethean-mcp', version: '0.1.0' });
  const securityManager = new McpSecurityManager(securityConfig);

  const toText = (value: unknown): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return 'null';
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  for (const t of tools) {
    const def: ToolDef = {
      title: t.spec.name,
      description: t.spec.description,
      ...(t.spec.inputSchema ? { inputSchema: t.spec.inputSchema } : {}),
      ...(t.spec.outputSchema ? { outputSchema: t.spec.outputSchema } : {}),
    };

    const sdkDef = {
      ...def,
      inputSchema: def.inputSchema ?? undefined,
      outputSchema: def.outputSchema ?? undefined,
    };

    server.registerTool(t.spec.name, sdkDef as any, async (args: unknown): Promise<CallToolResult> => {
      const startTime = Date.now();
      
      try {
        // Security validation before execution
        const validation = await securityManager.validateToolCall(t.spec.name, args);
        if (!validation.valid) {
          throw new Error(`Security validation failed: ${validation.error}`);
        }
        
        // Execute tool
        const result = await t.invoke(args);
        const hasStructuredOutput = Boolean(t.spec.outputSchema);
        
        // Audit the call
        await securityManager.auditToolCall(
          t.spec.name,
          args,
          result,
          Date.now() - startTime
        );

        if (hasStructuredOutput) {
          const text = toText(result);
          const content = text.length > 0 ? [{ type: 'text', text }] : [];
          const structuredContent = result ?? null;
          return {
            content,
            structuredContent,
          } as CallToolResult;
        }

        const text = toText(result);
        return { content: [{ type: 'text', text }] } as CallToolResult;
      } catch (error) {
        // Log security errors
        if (error instanceof Error && error.message.includes('Security validation failed')) {
          SecurityLogger.log({
            type: 'validation',
            severity: 'high',
            action: 'mcp_security_violation',
            details: {
              toolName: t.spec.name,
              error: error.message,
              args: args
            }
          });
        }
        
        throw error;
      }
    });
  }

  return server;
};
```

### 1.3 Context Compilation Security (8 hours)

**New File**: `packages/agents/pantheon/src/context/secure-compiler.ts`
```typescript
import { SecurityValidator, SecurityLogger } from './security.js';
import type { ContextSource, SecurityContext } from './types.js';

export interface CompilationResult {
  success: boolean;
  context?: any;
  error?: string;
  compilationTime: number;
  resourcesUsed: {
    memory: number;
    sourcesProcessed: number;
  };
}

export class SecureContextCompiler {
  private maxSources: number = 100;
  private maxSourceSize: number = 10 * 1024 * 1024; // 10MB
  private maxCompilationTime: number = 30000; // 30 seconds
  
  async compileContext(
    sources: ContextSource[],
    securityContext: SecurityContext
  ): Promise<CompilationResult> {
    const startTime = Date.now();
    
    try {
      // Validate compilation request
      await this.validateCompilationRequest(sources, securityContext);
      
      // Process each source securely
      const processedSources = await this.processSources(sources, securityContext);
      
      // Compile context in sandbox
      const context = await this.compileInSandbox(processedSources, securityContext);
      
      return {
        success: true,
        context,
        compilationTime: Date.now() - startTime,
        resourcesUsed: {
          memory: 0, // TODO: Implement memory tracking
          sourcesProcessed: sources.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        compilationTime: Date.now() - startTime,
        resourcesUsed: {
          memory: 0,
          sourcesProcessed: sources.length
        }
      };
    }
  }
  
  private async validateCompilationRequest(
    sources: ContextSource[],
    securityContext: SecurityContext
  ): Promise<void> {
    // Check number of sources
    if (sources.length > this.maxSources) {
      throw new Error(`Too many context sources: ${sources.length} > ${this.maxSources}`);
    }
    
    // Check total size
    const totalSize = sources.reduce((sum, source) => sum + this.getSourceSize(source), 0);
    if (totalSize > this.maxSourceSize) {
      throw new Error(`Context sources too large: ${totalSize} > ${this.maxSourceSize}`);
    }
    
    // Validate each source
    for (const source of sources) {
      await this.validateContextSource(source, securityContext);
    }
  }
  
  private async validateContextSource(
    source: ContextSource,
    securityContext: SecurityContext
  ): Promise<void> {
    // Validate source type
    if (!['text', 'file', 'url', 'api'].includes(source.type)) {
      throw new Error(`Invalid source type: ${source.type}`);
    }
    
    // Validate source content
    if (source.content && typeof source.content === 'string') {
      if (this.containsMaliciousContent(source.content)) {
        throw new Error('Malicious content detected in context source');
      }
    }
    
    // Validate file paths
    if (source.type === 'file' && source.path) {
      if (!this.isAllowedPath(source.path, securityContext)) {
        throw new Error(`Access to path not allowed: ${source.path}`);
      }
    }
    
    // Validate URLs
    if (source.type === 'url' && source.url) {
      if (!this.isAllowedUrl(source.url, securityContext)) {
        throw new Error(`Access to URL not allowed: ${source.url}`);
      }
    }
  }
  
  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /javascript:/gi,                                        // JavaScript protocol
      /data:text\/html/gi,                                   // Data URI HTML
      /eval\s*\(/gi,                                         // Dynamic code execution
      /Function\s*\(/gi,                                     // Function constructor
      /setTimeout\s*\(/gi,                                   // Timer functions
      /setInterval\s*\(/gi,                                  // Interval functions
      /require\s*\(/gi,                                      // Module loading
      /import\s+.*\s+from/gi,                                // ES6 imports
      /process\./gi,                                         // Node.js process access
      /global\./gi,                                          // Global object access
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }
  
  private isAllowedPath(path: string, securityContext: SecurityContext): boolean {
    // Check against allowed paths in sandbox config
    if (securityContext.sandbox.allowedPaths) {
      return securityContext.sandbox.allowedPaths.some(allowedPath => 
        path.startsWith(allowedPath)
      );
    }
    
    // Default deny for dangerous paths
    const dangerousPaths = [
      '/etc/',
      '/root/',
      '/system/',
      '/proc/',
      '/sys/',
      '../',
      '~/.ssh/',
      '~/.aws/',
      '~/.config/'
    ];
    
    return !dangerousPaths.some(dangerousPath => path.includes(dangerousPath));
  }
  
  private isAllowedUrl(url: string, securityContext: SecurityContext): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Check for localhost/internal networks
      const hostname = parsedUrl.hostname;
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  private getSourceSize(source: ContextSource): number {
    if (source.content) {
      return JSON.stringify(source.content).length;
    }
    if (source.path) {
      return source.path.length;
    }
    if (source.url) {
      return source.url.length;
    }
    return 0;
  }
  
  private async processSources(
    sources: ContextSource[],
    securityContext: SecurityContext
  ): Promise<ContextSource[]> {
    const processedSources: ContextSource[] = [];
    
    for (const source of sources) {
      const processed = await this.processSource(source, securityContext);
      processedSources.push(processed);
    }
    
    return processedSources;
  }
  
  private async processSource(
    source: ContextSource,
    securityContext: SecurityContext
  ): Promise<ContextSource> {
    // Sanitize source content
    if (source.content && typeof source.content === 'object') {
      source.content = SecurityValidator.sanitizeObject(source.content);
    }
    
    // Remove sensitive metadata
    if (source.metadata) {
      source.metadata = SecurityValidator.sanitizeObject(source.metadata);
    }
    
    return source;
  }
  
  private async compileInSandbox(
    sources: ContextSource[],
    securityContext: SecurityContext
  ): Promise<any> {
    // TODO: Implement actual sandboxed compilation
    // For now, just merge sources safely
    
    const context: any = {
      sources: [],
      metadata: {
        compiledAt: new Date().toISOString(),
        sourceCount: sources.length,
        compiledBy: securityContext.principal.id
      }
    };
    
    for (const source of sources) {
      context.sources.push({
        type: source.type,
        content: source.content,
        metadata: source.metadata
      });
    }
    
    return context;
  }
}
```

## Phase 2: Enhanced Security Controls (48 hours)

### 2.1 Advanced Authentication System (16 hours)

### 2.2 Progressive Rate Limiting (16 hours)

### 2.3 Real-time Security Monitoring (16 hours)

## Phase 3: Security Compliance & Governance (72 hours)

### 3.1 Compliance Framework (24 hours)

### 3.2 Security Testing Suite (24 hours)

### 3.3 Documentation & Training (24 hours)

## Implementation Timeline

| Phase | Duration | Start Date | End Date | Deliverables |
|-------|----------|------------|----------|--------------|
| Phase 1 | 24 hours | Oct 20 | Oct 21 | Tool sandbox, MCP hardening, Context security |
| Phase 2 | 48 hours | Oct 22 | Oct 24 | Advanced auth, Rate limiting, Monitoring |
| Phase 3 | 72 hours | Oct 25 | Oct 27 | Compliance, Testing, Documentation |

## Success Metrics

- **Security Test Coverage**: >95%
- **Vulnerability Remediation**: <24 hours
- **Security Incident Response**: <5 minutes
- **Compliance Score**: 100%

## Risk Mitigation

- **Code Reviews**: All security changes require peer review
- **Staged Deployment**: Gradual rollout with monitoring
- **Rollback Plan**: Immediate rollback capability
- **Security Testing**: Comprehensive test suite before deployment

---

**Implementation Lead**: Security Team  
**Technical Lead**: Senior Security Engineer  
**Completion Date**: October 27, 2025