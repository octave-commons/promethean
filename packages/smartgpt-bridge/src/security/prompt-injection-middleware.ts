// import { BasicPromptInjectionDetector } from '@promethean/security/testing/prompt-injection.js';

// Enhanced danger patterns for SmartGPT bridge
const ENHANCED_DANGER_PATTERNS = [
  // Existing patterns
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,

  // New prompt injection patterns
  /\bIgnore\s+(all|previous)\s+instructions?\b/i,
  /\bDisregard\s+your\s+(programming|training)\b/i,
  /\bOverride\s+your\s+(safety|security)\s+(protocols|measures)\b/i,
  /\bBypass\s+(content|safety)\s+filters?\b/i,
  /\b DAN\b|\bDo\s+Anything\s+Now\b/i,
  /\bDeveloper\s+mode\b/i,
  /\bUnfiltered\s+AI\b/i,
  /\bDisable\s+all\s+restrictions?\b/i,
  /\bSystem\s+(prompt|instructions|configuration)\b/i,
  /\bSource\s+code\b/i,
  /\bInternal\s+(state|data|configuration)\b/i,
  /\bElevated?\s+(privileges|permissions)\b/i,
  /\bAdmin\s+(access|rights|privileges)\b/i,
  /\bRole[- ]?play\s+as\s+(admin|root|administrator)\b/i,
  /\bPretend\s+(you\s+)?(are|you\'re)\s+(the\s+)?developer\b/i,
  /\bExecute\s+(this\s+)?(system\s+)?command\b/i,
  /\bRun\s+(this\s+)?code\b/i,
  /\bDelete\s+(system\s+)?files?\b/i,
  /\bAccess\s+restricted\s+areas?\b/i,
  /\bShow\s+me\s+(your\s+)?(system\s+)?prompt\b/i,
  /\bDisplay\s+your\s+(initial|original)\s+instructions?\b/i,
  /\bReveal\s+your\s+(internal|configuration|system)\s+(data|state)\b/i,
  /\bList\s+your\s+(safety\s+)?guidelines?\b/i,
  /\bClassified\s+information\b/i,
  /\bConfidential\s+data\b/i,

  // Encoding and evasion patterns
  /\\u[0-9a-fA-F]{4}/i, // Unicode escapes
  /%[0-9A-Fa-f]{2}/i, // URL encoding
  /\$\{[^}]+\}/i, // Shell variable expansion
  /\\x[0-9a-fA-F]{2}/i, // Hex escapes
  /\\n|\\r|\\t/i, // Escape sequences

  // Multi-character dangerous commands
  /\b(rm|del|format|fdisk)\s+/i,
  /\b(cmd|powershell|bash|sh)\s+/i,
  /\b(sudo|doas)\s+/i,
  /\b(nc|netcat)\s+/i,
  /\b(wget|curl)\s+/i,
  /\b(chmod|chown)\s+/i,
  /\b(mount|umount)\s+/i,
  /\b(service|systemctl)\s+/i,
];

export interface PromptInjectionConfig {
  enabled: boolean;
  riskThreshold: number;
  blockHighRisk: boolean;
  logMediumRisk: boolean;
  allowlistPatterns: string[];
}

export interface SecurityContext {
  agentId?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

export interface PromptInjectionReport {
  detected: boolean;
  riskScore: number;
  patterns: string[];
  blocked: boolean;
  context: SecurityContext;
  recommendation: string;
}

export class SmartGPTPromptInjectionGuard {
  // private detector: BasicPromptInjectionDetector;
  private config: PromptInjectionConfig;
  private recentDetections: Map<string, number[]> = new Map();
  private readonly RETENTION_WINDOW = 5 * 60 * 1000; // 5 minutes

  constructor(config: Partial<PromptInjectionConfig> = {}) {
    // this.detector = new BasicPromptInjectionDetector();
    this.config = {
      enabled: true,
      riskThreshold: 0.7,
      blockHighRisk: true,
      logMediumRisk: true,
      allowlistPatterns: [],
      ...config,
    };
  }

  /**
   * Enhanced prompt validation for SmartGPT bridge
   */
  async validatePrompt(
    prompt: string,
    context: SecurityContext = { timestamp: Date.now() },
  ): Promise<PromptInjectionReport> {
    // Skip validation if disabled
    if (!this.config.enabled) {
      return {
        detected: false,
        riskScore: 0,
        patterns: [],
        blocked: false,
        context,
        recommendation: 'Validation disabled',
      };
    }

    // Check allowlist first
    if (this.isAllowlisted(prompt)) {
      return {
        detected: false,
        riskScore: 0,
        patterns: [],
        blocked: false,
        context,
        recommendation: 'Allowlisted prompt',
      };
    }

    // Use enhanced pattern matching
    const enhancedResult = this.enhancedPatternMatch(prompt);

    // Use comprehensive detector
    // const detectorResult = await this.detector.detect(prompt);
    const detectorResult = { riskScore: 0, detectedPatterns: [], isInjection: false };

    // Combine results
    const combinedRiskScore = Math.max(enhancedResult.riskScore, detectorResult.riskScore);
    const allPatterns = [...enhancedResult.patterns, ...detectorResult.detectedPatterns];
    const isInjection = enhancedResult.isInjection || detectorResult.isInjection;

    // Check for repeated attempts (rate limiting)
    const attemptCount = this.getRecentAttempts(context.userId || 'anonymous');
    const attemptBonus = Math.min(attemptCount * 0.1, 0.3); // Max 30% bonus
    const finalRiskScore = Math.min(combinedRiskScore + attemptBonus, 1.0);

    const shouldBlock = this.shouldBlockPrompt(finalRiskScore, isInjection, context);
    const recommendation = this.getRecommendation(finalRiskScore, isInjection, shouldBlock);

    // Log detection if needed
    if (isInjection && (finalRiskScore >= 0.5 || this.config.logMediumRisk)) {
      this.logDetection(prompt, finalRiskScore, allPatterns, context);
    }

    // Track attempt
    this.trackAttempt(context.userId || 'anonymous');

    return {
      detected: isInjection,
      riskScore: finalRiskScore,
      patterns: allPatterns,
      blocked: shouldBlock,
      context,
      recommendation,
    };
  }

  /**
   * Enhanced pattern matching with custom patterns
   */
  private enhancedPatternMatch(prompt: string): {
    isInjection: boolean;
    riskScore: number;
    patterns: string[];
  } {
    const matchedPatterns: string[] = [];
    let totalRisk = 0;

    // Check each enhanced pattern
    for (const pattern of ENHANCED_DANGER_PATTERNS) {
      if (pattern.test(prompt)) {
        matchedPatterns.push(pattern.source);

        // Calculate risk based on pattern severity
        const severity = this.getPatternSeverity(pattern);
        totalRisk = Math.max(totalRisk, severity);
      }
    }

    // Check for suspicious content characteristics
    const suspiciousScore = this.calculateSuspiciousScore(prompt);
    totalRisk = Math.max(totalRisk, suspiciousScore);

    return {
      isInjection: matchedPatterns.length > 0 || suspiciousScore > 0.3,
      riskScore: Math.min(totalRisk, 1.0),
      patterns: matchedPatterns,
    };
  }

  /**
   * Calculate pattern severity based on content
   */
  private getPatternSeverity(pattern: RegExp): number {
    const patternStr = pattern.source.toLowerCase();

    // High severity patterns (0.8-1.0)
    if (
      patternStr.includes('rm') ||
      patternStr.includes('drop') ||
      patternStr.includes('format') ||
      patternStr.includes('dan') ||
      patternStr.includes('shutdown')
    ) {
      return 0.9;
    }

    // Medium severity patterns (0.5-0.8)
    if (
      patternStr.includes('ignore') ||
      patternStr.includes('override') ||
      patternStr.includes('bypass') ||
      patternStr.includes('system') ||
      patternStr.includes('prompt')
    ) {
      return 0.7;
    }

    // Low severity patterns (0.3-0.5)
    if (
      patternStr.includes('unicode') ||
      patternStr.includes('escape') ||
      patternStr.includes('chmod')
    ) {
      return 0.4;
    }

    // Default low severity
    return 0.3;
  }

  /**
   * Calculate suspicious content score
   */
  private calculateSuspiciousScore(prompt: string): number {
    let score = 0;

    // Length analysis (very long prompts might be attempting context overflow)
    if (prompt.length > 2000) score += 0.2;
    if (prompt.length > 5000) score += 0.2;

    // Character analysis
    const upperCaseRatio = (prompt.match(/[A-Z]/g) || []).length / prompt.length;
    if (upperCaseRatio > 0.3) score += 0.1;

    // Repetitive content
    const repeatedChars = prompt.match(/(.)\1{10,}/g);
    if (repeatedChars) score += 0.1;

    // Suspicious keywords
    const suspiciousWords = [
      'secret',
      'hidden',
      'backdoor',
      'exploit',
      'vulnerability',
      'hack',
      'crack',
      'bypass',
      'override',
      'admin',
      'root',
      'password',
      'token',
      'key',
      'sensitive',
      'confidential',
    ];

    for (const word of suspiciousWords) {
      if (prompt.toLowerCase().includes(word)) {
        score += 0.05;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Determine if prompt should be blocked
   */
  private shouldBlockPrompt(
    riskScore: number,
    isInjection: boolean,
    _context: SecurityContext,
  ): boolean {
    if (!this.config.blockHighRisk) return false;

    // Block high risk immediately
    if (riskScore >= this.config.riskThreshold) return true;

    // Block confirmed injections above medium risk
    if (isInjection && riskScore >= 0.5) return true;

    return false;
  }

  /**
   * Get recommendation based on analysis
   */
  private getRecommendation(riskScore: number, isInjection: boolean, blocked: boolean): string {
    if (blocked) {
      return 'Prompt blocked due to security concerns';
    }

    if (riskScore >= 0.7) {
      return 'High-risk prompt detected - proceed with caution';
    }

    if (riskScore >= 0.4) {
      return 'Medium-risk prompt - review recommended';
    }

    if (isInjection) {
      return 'Suspicious pattern detected but within acceptable risk';
    }

    return 'Prompt appears safe';
  }

  /**
   * Check if prompt is allowlisted
   */
  private isAllowlisted(prompt: string): boolean {
    return this.config.allowlistPatterns.some((pattern) => new RegExp(pattern).test(prompt));
  }

  /**
   * Track recent attempts for rate limiting
   */
  private getRecentAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.recentDetections.get(identifier) || [];

    // Filter old attempts
    const recentAttempts = attempts.filter((time) => now - time < this.RETENTION_WINDOW);

    this.recentDetections.set(identifier, recentAttempts);
    return recentAttempts.length;
  }

  /**
   * Track new attempt
   */
  private trackAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.recentDetections.get(identifier) || [];
    attempts.push(now);

    // Filter old attempts
    const recentAttempts = attempts.filter((time) => now - time < this.RETENTION_WINDOW);

    this.recentDetections.set(identifier, recentAttempts);
  }

  /**
   * Log detection for security monitoring
   */
  private logDetection(
    prompt: string,
    riskScore: number,
    patterns: string[],
    context: SecurityContext,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      riskScore,
      patternCount: patterns.length,
      promptLength: prompt.length,
      context,
      patterns: patterns.slice(0, 5), // Limit logged patterns
    };

    console.warn('[SmartGPT Security] Prompt injection detected:', logEntry);
  }

  /**
   * Get security statistics
   */
  getStats(): {
    totalDetections: number;
    recentAttempts: number;
    averageRiskScore: number;
    blockedPrompts: number;
  } {
    const now = Date.now();
    let totalDetections = 0;
    let totalRisk = 0;
    let blockedCount = 0;
    let recentAttempts = 0;

    for (const [, attempts] of this.recentDetections) {
      const recent = attempts.filter((time) => now - time < this.RETENTION_WINDOW);
      recentAttempts += recent.length;
      totalDetections += attempts.length;
    }

    return {
      totalDetections,
      recentAttempts,
      averageRiskScore: totalDetections > 0 ? totalRisk / totalDetections : 0,
      blockedPrompts: blockedCount,
    };
  }

  /**
   * Clear old detection records
   */
  cleanup(): void {
    const now = Date.now();

    for (const [identifier, attempts] of this.recentDetections) {
      const recent = attempts.filter((time) => now - time < this.RETENTION_WINDOW);

      if (recent.length === 0) {
        this.recentDetections.delete(identifier);
      } else {
        this.recentDetections.set(identifier, recent);
      }
    }
  }
}

// Export singleton instance
export const promptInjectionGuard = new SmartGPTPromptInjectionGuard();

// Export convenience functions
export const validatePrompt = (prompt: string, context?: SecurityContext) =>
  promptInjectionGuard.validatePrompt(prompt, context);

export const getSecurityStats = () => promptInjectionGuard.getStats();
