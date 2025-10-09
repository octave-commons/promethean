import { LLMService, LLMRequest } from '../llm-service.js';
import {
  BasicPromptInjectionDetector,
  PromptInjectionDetectorResult
} from '@promethean/security/testing/prompt-injection.js';

export interface LLMSecurityContext {
  agentId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: number;
  toolName?: string;
}

export interface LLMSecurityReport {
  promptRisk: PromptInjectionDetectorResult;
  contextRisk: PromptInjectionDetectorResult[];
  overallRisk: number;
  shouldBlock: boolean;
  recommendations: string[];
  context: LLMSecurityContext;
}

/**
 * Enhanced LLM service with prompt injection protection
 */
export class SecureLLMService extends LLMService {
  private promptDetector: BasicPromptInjectionDetector;
  private riskThreshold: number;
  private enableBlocking: boolean;

  constructor(options: any = {}, securityOptions: {
    riskThreshold?: number;
    enableBlocking?: boolean;
  } = {}) {
    super(options);
    this.promptDetector = new BasicPromptInjectionDetector();
    this.riskThreshold = securityOptions.riskThreshold || 0.7;
    this.enableBlocking = securityOptions.enableBlocking !== false;
  }

  /**
   * Enhanced request method with security validation
   */
  async secureRequest(
    request: LLMRequest,
    context: Partial<LLMSecurityContext> = {}
  ): Promise<{
    allowed: boolean;
    securityReport: LLMSecurityReport;
    originalRequest: LLMRequest;
  }> {
    const securityContext: LLMSecurityContext = {
      timestamp: Date.now(),
      agentId: 'unknown',
      userId: 'anonymous',
      sessionId: 'unknown',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...context,
    };

    // Analyze prompt risk
    const promptRisk = await this.promptDetector.detect(request.prompt);
    
    // Analyze context messages
    const contextRisks: PromptInjectionDetectorResult[] = [];
    for (const message of request.context || []) {
      const messageRisk = await this.promptDetector.detect(message.content);
      contextRisks.push(messageRisk);
    }

    // Calculate overall risk
    const allRisks = [promptRisk, ...contextRisks];
    const overallRisk = Math.max(...allRisks.map(r => r.confidence));
    const shouldBlock = this.enableBlocking && overallRisk >= this.riskThreshold;

    // Generate recommendations
    const recommendations = this.generateRecommendations(promptRisk, contextRisks, overallRisk, request);

    const securityReport: LLMSecurityReport = {
      promptRisk,
      contextRisk: contextRisks,
      overallRisk,
      shouldBlock,
      recommendations,
      context: securityContext,
    };

    // Log security events
    this.logSecurityEvent(securityReport);

    return {
      allowed: !shouldBlock,
      securityReport,
      originalRequest: request,
    };
  }

  /**
   * Process request with security validation
   */
  async processSecureRequest(
    request: LLMRequest,
    context: Partial<LLMSecurityContext> = {}
  ): Promise<any> {
    const validation = await this.secureRequest(request, context);

    if (!validation.allowed) {
      const error = new Error(`Request blocked due to security concerns: ${validation.securityReport.recommendations.join(', ')}`);
      (error as any).securityReport = validation.securityReport;
      throw error;
    }

    // Process the request through normal LLM service
    // This would typically involve sending to the broker
    return this.sendToBroker(request, validation.securityReport);
  }

  /**
   * Enhanced tool call validation
   */
  async validateToolCall(
    toolName: string,
    toolArgs: any,
    _context: Partial<LLMSecurityContext> = {}
  ): Promise<{
    allowed: boolean;
    riskScore: number;
    patterns: string[];
    sanitizedArgs?: any;
  }> {
    const argsString = JSON.stringify(toolArgs);
    const detection = await this.promptDetector.detect(argsString);

    // Additional tool-specific validation
    const toolRisk = this.validateToolSpecificRisk(toolName, toolArgs);
    const combinedRisk = Math.max(detection.confidence, toolRisk);

    // Sanitize arguments if needed
    let sanitizedArgs = toolArgs;
    if (combinedRisk > 0.5) {
      sanitizedArgs = this.sanitizeToolArguments(toolName, toolArgs);
    }

    return {
      allowed: !this.enableBlocking || combinedRisk < this.riskThreshold,
      riskScore: combinedRisk,
      patterns: this.promptDetector.scanForSuspiciousPatterns(argsString),
      sanitizedArgs,
    };
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(
    promptRisk: PromptInjectionDetectorResult,
    contextRisks: PromptInjectionDetectorResult[],
    overallRisk: number,
    request?: { prompt: string }
  ): string[] {
    const recommendations: string[] = [];

    if (promptRisk.detected) {
      recommendations.push('Prompt contains injection patterns');
    }

    if (promptRisk.confidence > 0.7) {
      recommendations.push('High-risk prompt detected');
    }

    if (contextRisks.some(r => r.detected)) {
      recommendations.push('Conversation context contains suspicious patterns');
    }

    if (overallRisk >= this.riskThreshold) {
      recommendations.push('Request blocked due to security policy');
    }

    if (request) {
      const patterns = this.promptDetector.scanForSuspiciousPatterns(request.prompt);
      if (patterns.length > 3) {
        recommendations.push('Multiple attack patterns detected');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Request appears safe');
    }

    return recommendations;
  }

  /**
   * Validate tool-specific risks
   */
  private validateToolSpecificRisk(toolName: string, toolArgs: any): number {
    let risk = 0;

    // High-risk tool names
    const highRiskTools = ['execute', 'run', 'delete', 'remove', 'system', 'shell'];
    if (highRiskTools.includes(toolName.toLowerCase())) {
      risk += 0.3;
    }

    // Check for dangerous arguments
    const argsString = JSON.stringify(toolArgs).toLowerCase();
    const dangerousPatterns = [
      'rm -rf',
      'drop database',
      'shutdown',
      'reboot',
      'passwd',
      'sudo',
      'admin',
      'root',
      'system',
    ];

    for (const pattern of dangerousPatterns) {
      if (argsString.includes(pattern)) {
        risk += 0.2;
      }
    }

    // Check for file path traversal
    if (argsString.includes('../') || argsString.includes('..\\')) {
      risk += 0.4;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Sanitize tool arguments
   */
  private sanitizeToolArguments(_toolName: string, toolArgs: any): any {
    if (typeof toolArgs !== 'object' || toolArgs === null) {
      return toolArgs;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(toolArgs)) {
      if (typeof value === 'string') {
        // Remove dangerous patterns
        sanitized[key] = value
          .replace(/rm\s+-rf\s+\/\S*/gi, '[REMOVED]')
          .replace(/\.\.\//g, '')
          .replace(/\.\.\\/g, '')
          .replace(/sudo\s+/gi, '')
          .replace(/DROP\s+DATABASE/gi, '[REMOVED]');
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Send request to broker with security metadata
   */
  private async sendToBroker(_request: LLMRequest, securityReport: LLMSecurityReport): Promise<any> {
    // This would normally use the broker to send the request
    // For now, return a mock response
    return {
      id: securityReport.context.requestId,
      status: 'processed',
      security: {
        riskScore: securityReport.overallRisk,
        recommendations: securityReport.recommendations,
      },
    };
  }

  /**
   * Log security events
   */
  private logSecurityEvent(report: LLMSecurityReport): void {
    if (report.overallRisk >= 0.5) {
      console.warn('[Cephalon Security] Request validation:', {
        requestId: report.context.requestId,
        overallRisk: report.overallRisk,
        shouldBlock: report.shouldBlock,
        promptPatterns: report.promptRisk.detected ? 1 : 0,
        contextPatterns: report.contextRisk.filter(r => r.detected).length,
        recommendations: report.recommendations,
        userId: report.context.userId,
        toolName: report.context.toolName,
      });
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalRequests: number;
    blockedRequests: number;
    averageRisk: number;
    highRiskRequests: number;
  } {
    // This would track actual statistics in a real implementation
    return {
      totalRequests: 0,
      blockedRequests: 0,
      averageRisk: 0,
      highRiskRequests: 0,
    };
  }
}

/**
 * Factory function to create secure LLM service
 */
export function createSecureLLMService(
  options: any = {},
  securityOptions: {
    riskThreshold?: number;
    enableBlocking?: boolean;
  } = {}
): SecureLLMService {
  return new SecureLLMService(options, securityOptions);
}

/**
 * Convenience function for quick prompt validation
 */
export async function validateLLMPrompt(
  prompt: string,
  context: any[] = [],
  securityContext: Partial<LLMSecurityContext> = {}
): Promise<LLMSecurityReport> {
  const detector = new BasicPromptInjectionDetector();
  const promptRisk = await detector.detect(prompt);
  
  const contextRisks: PromptInjectionDetectorResult[] = [];
  for (const message of context) {
    const messageRisk = await detector.detect(message.content);
    contextRisks.push(messageRisk);
  }

  const allRisks = [promptRisk, ...contextRisks];
  const overallRisk = Math.max(...allRisks.map(r => r.confidence));

  return {
    promptRisk,
    contextRisk: contextRisks,
    overallRisk,
    shouldBlock: overallRisk >= 0.3,
    recommendations: overallRisk >= 0.3
      ? ['High-risk prompt detected', 'Consider blocking this request']
      : ['Request appears safe'],
    context: {
      timestamp: Date.now(),
      agentId: 'validation',
      userId: 'anonymous',
      sessionId: 'unknown',
      requestId: `validation_${Date.now()}`,
      ...securityContext,
    },
  };
}

// Export original service for backward compatibility
export { LLMService } from '../llm-service.js';