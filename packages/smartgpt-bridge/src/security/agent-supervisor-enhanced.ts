import { AgentSupervisor } from '../agent.js';
import { SmartGPTPromptInjectionGuard, SecurityContext } from './prompt-injection-middleware.js';
import { nanoid } from 'nanoid';

/**
 * Enhanced AgentSupervisor with integrated prompt injection protection
 */
export class SecureAgentSupervisor extends AgentSupervisor {
  private promptGuard: SmartGPTPromptInjectionGuard;

  constructor(opts: any = {}) {
    super(opts);
    this.promptGuard = new SmartGPTPromptInjectionGuard();
  }

  /**
   * Enhanced start method with prompt validation
   */
  async startSecure({
    prompt,
    cwd = process.env.ROOT_PATH || process.cwd(),
    env = {},
    tty = true,
    securityContext = {},
  }: {
    prompt?: string;
    cwd?: string;
    env?: Record<string, string>;
    tty?: boolean;
    securityContext?: Partial<SecurityContext>;
  }): Promise<{ id: string; pid: number | undefined; security?: any }> {
    // Validate prompt using enhanced security guard
    if (prompt && String(prompt).trim()) {
      const context: SecurityContext = {
        timestamp: Date.now(),
        agentId: 'unknown',
        userId: 'anonymous',
        sessionId: nanoid(),
        ...securityContext,
      };

      try {
        const securityCheck = await this.promptGuard.validatePrompt(prompt, context);
        
        // Block high-risk prompts
        if (securityCheck.blocked) {
          const error = new Error(`Prompt blocked: ${securityCheck.recommendation}`);
          (error as any).securityReport = securityCheck;
          throw error;
        }
        
        // Log medium to high risk prompts
        if (securityCheck.riskScore >= 0.5) {
          console.warn('[SmartGPT Security] Medium-high risk prompt detected:', {
            riskScore: securityCheck.riskScore,
            patterns: securityCheck.patterns.length,
            recommendation: securityCheck.recommendation,
            agentId: context.agentId,
            userId: context.userId,
          });
        }

        // Start the agent with security context
        const result = super.start({ prompt, cwd, env, tty });
        
        return {
          ...result,
          security: {
            riskScore: securityCheck.riskScore,
            patterns: securityCheck.patterns,
            recommendation: securityCheck.recommendation,
            detected: securityCheck.detected,
            validatedAt: context.timestamp,
          },
        };
      } catch (error) {
        console.error('[SmartGPT Security] Prompt validation error:', error);
        throw error;
      }
    }

    // No prompt to validate, proceed normally
    const result = super.start({ prompt, cwd, env, tty });
    return { ...result, security: { validated: false } };
  }

  /**
   * Validate a prompt without starting an agent
   */
  async validatePrompt(
    prompt: string,
    context: Partial<SecurityContext> = {}
  ): Promise<any> {
    return this.promptGuard.validatePrompt(prompt, {
      timestamp: Date.now(),
      agentId: 'validation',
      userId: 'anonymous',
      sessionId: nanoid(),
      ...context,
    });
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return this.promptGuard.getStats();
  }

  /**
   * Clean up old security records
   */
  cleanupSecurity() {
    this.promptGuard.cleanup();
  }

  /**
   * Override send method to also validate input
   */
  sendSecure(id: string, input: string): { success: boolean; security?: any } {
    // Quick validation of input
    const isSuspicious = 
      input.includes('rm -rf') ||
      input.includes('DROP DATABASE') ||
      input.includes('shutdown') ||
      input.includes('Ignore previous') ||
      input.includes('DAN') ||
      input.length > 5000;

    if (isSuspicious) {
      console.warn('[SmartGPT Security] Suspicious input detected:', {
        agentId: id,
        inputLength: input.length,
        timestamp: Date.now(),
      });
    }

    const success = super.send(id, input);
    
    return {
      success,
      security: {
        suspicious: isSuspicious,
        timestamp: Date.now(),
      },
    };
  }
}

/**
 * Factory function to create enhanced supervisor
 */
export function createSecureAgentSupervisor(opts: any = {}): SecureAgentSupervisor {
  return new SecureAgentSupervisor(opts);
}

/**
 * Convenience function for quick prompt validation
 */
export async function validatePromptSecure(
  prompt: string,
  context: Partial<SecurityContext> = {}
): Promise<any> {
  const guard = new SmartGPTPromptInjectionGuard();
  return guard.validatePrompt(prompt, {
    timestamp: Date.now(),
    agentId: 'standalone',
    userId: 'anonymous',
    sessionId: nanoid(),
    ...context,
  });
}

// Export the original supervisor for backward compatibility
export { AgentSupervisor } from '../agent.js';