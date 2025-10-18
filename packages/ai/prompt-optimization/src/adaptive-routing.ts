/**
 * Adaptive Routing System for Prompt Optimization v2.0
 * qwen3:4b-instruct 100k context optimization
 */

export interface ComplexityAnalysis {
  primary: ComplexityLevel;
  indicators: Record<ComplexityLevel, number>;
  confidence: number;
  domain?: DomainType;
}

export interface TemplateConfig {
  template: TemplateType;
  maxTokens: number;
  expectedSuccess: number;
  processingTime: number;
  description: string;
}

export interface RoutingResult {
  template: TemplateType;
  confidence: number;
  reasoning: string;
  fallbackChain: TemplateType[];
  estimatedTokens: number;
  estimatedTime: number;
}

export type ComplexityLevel =
  | 'SIMPLE'
  | 'FOCUSED'
  | 'COMPLEX'
  | 'TECHNICAL'
  | 'CREATIVE'
  | 'DATA'
  | 'DEBUG';

export type DomainType = 'technical' | 'creative' | 'data' | 'debug' | 'general';

export type TemplateType =
  | 'T1-BASE'
  | 'T2-FOCUSED'
  | 'T2-CONTEXT'
  | 'T3-CONSTRAINTS'
  | 'T3-EXAMPLES'
  | 'T4-EDGE'
  | 'T4-VALIDATION'
  | 'T5-COMPLEX'
  | 'T6-SIMPLE'
  | 'T7-TECHNICAL'
  | 'T8-CREATIVE'
  | 'T9-DATA'
  | 'T10-DEBUG'
  | 'T11-REVIEW'
  | 'T12-FALLBACK';

/**
 * Complexity classification configuration
 */
const COMPLEXITY_LEVELS: Record<ComplexityLevel, TemplateConfig> = {
  SIMPLE: {
    template: 'T6-SIMPLE',
    maxTokens: 500,
    expectedSuccess: 0.96,
    processingTime: 1.5,
    description: 'Simple, straightforward queries requiring minimal optimization',
  },

  FOCUSED: {
    template: 'T2-FOCUSED',
    maxTokens: 750,
    expectedSuccess: 0.95,
    processingTime: 2.5,
    description: 'Targeted optimization of specific aspects',
  },

  COMPLEX: {
    template: 'T5-COMPLEX',
    maxTokens: 1200,
    expectedSuccess: 0.83,
    processingTime: 4.0,
    description: 'Multi-faceted queries requiring comprehensive approach',
  },

  TECHNICAL: {
    template: 'T7-TECHNICAL',
    maxTokens: 950,
    expectedSuccess: 0.88,
    processingTime: 3.3,
    description: 'Technical specifications, API docs, code generation',
  },

  CREATIVE: {
    template: 'T8-CREATIVE',
    maxTokens: 900,
    expectedSuccess: 0.86,
    processingTime: 3.0,
    description: 'Creative content, writing, design tasks',
  },

  DATA: {
    template: 'T9-DATA',
    maxTokens: 1000,
    expectedSuccess: 0.87,
    processingTime: 3.5,
    description: 'Data analysis, processing, visualization',
  },

  DEBUG: {
    template: 'T10-DEBUG',
    maxTokens: 950,
    expectedSuccess: 0.89,
    processingTime: 3.3,
    description: 'Troubleshooting, problem-solving, debugging',
  },
};

/**
 * Domain-specific indicators
 */
const DOMAIN_INDICATORS: Record<DomainType, string[]> = {
  technical: [
    'api',
    'code',
    'function',
    'class',
    'method',
    'algorithm',
    'system',
    'architecture',
    'implementation',
    'technical',
    'programming',
    'software',
    'database',
    'server',
    'client',
    'interface',
    'protocol',
    'framework',
  ],

  creative: [
    'creative',
    'write',
    'design',
    'content',
    'story',
    'narrative',
    'artistic',
    'visual',
    'style',
    'tone',
    'voice',
    'brand',
    'marketing',
    'copywriting',
    'fiction',
    'poetry',
    'script',
    'character',
    'plot',
    'theme',
  ],

  data: [
    'data',
    'analysis',
    'statistics',
    'metrics',
    'analytics',
    'visualization',
    'chart',
    'graph',
    'report',
    'dataset',
    'processing',
    'transformation',
    'calculation',
    'measurement',
    'performance',
    'trends',
    'patterns',
  ],

  debug: [
    'debug',
    'error',
    'issue',
    'problem',
    'troubleshoot',
    'fix',
    'repair',
    'resolve',
    'diagnose',
    'investigate',
    'broken',
    'failure',
    'bug',
    'exception',
    'crash',
    'malfunction',
    'incorrect',
    'unexpected',
  ],

  general: [], // Default when no specific domain detected
};

/**
 * Complexity indicators with weights
 */
const COMPLEXITY_INDICATORS: Record<ComplexityLevel, { indicators: string[]; weight: number }> = {
  SIMPLE: {
    indicators: [
      'simple',
      'basic',
      'straightforward',
      'easy',
      'quick',
      'minimal',
      'single',
      'one',
      'just',
      'only',
      'merely',
      'simply',
      'clear',
    ],
    weight: 1.0,
  },

  FOCUSED: {
    indicators: [
      'specific',
      'targeted',
      'focused',
      'particular',
      'aspect',
      'component',
      'section',
      'part',
      'element',
      'feature',
      'area',
      'domain',
      'scope',
    ],
    weight: 1.2,
  },

  COMPLEX: {
    indicators: [
      'complex',
      'comprehensive',
      'multiple',
      'various',
      'several',
      'many',
      'integrated',
      'combined',
      'holistic',
      'complete',
      'full',
      'entire',
      'system',
      'architecture',
      'framework',
      'ecosystem',
    ],
    weight: 1.5,
  },

  TECHNICAL: {
    indicators: [
      'technical',
      'api',
      'code',
      'function',
      'class',
      'method',
      'algorithm',
      'implementation',
      'specification',
      'documentation',
      'protocol',
    ],
    weight: 1.3,
  },

  CREATIVE: {
    indicators: [
      'creative',
      'write',
      'design',
      'content',
      'story',
      'narrative',
      'artistic',
      'visual',
      'style',
      'tone',
      'voice',
      'brand',
    ],
    weight: 1.2,
  },

  DATA: {
    indicators: [
      'data',
      'analysis',
      'statistics',
      'metrics',
      'analytics',
      'chart',
      'graph',
      'report',
      'dataset',
      'processing',
      'transformation',
    ],
    weight: 1.3,
  },

  DEBUG: {
    indicators: [
      'debug',
      'error',
      'issue',
      'problem',
      'troubleshoot',
      'fix',
      'repair',
      'resolve',
      'diagnose',
      'investigate',
      'broken',
      'failure',
    ],
    weight: 1.4,
  },
};

/**
 * Fallback chain configuration
 */
const FALLBACK_CHAINS: Record<TemplateType, TemplateType[]> = {
  'T1-BASE': ['T12-FALLBACK'],
  'T2-FOCUSED': ['T1-BASE', 'T12-FALLBACK'],
  'T2-CONTEXT': ['T1-BASE', 'T12-FALLBACK'],
  'T3-CONSTRAINTS': ['T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T3-EXAMPLES': ['T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T4-EDGE': ['T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T4-VALIDATION': ['T3-EXAMPLES', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T5-COMPLEX': ['T4-EDGE', 'T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T6-SIMPLE': ['T1-BASE', 'T12-FALLBACK'],
  'T7-TECHNICAL': ['T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T8-CREATIVE': ['T3-EXAMPLES', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T9-DATA': ['T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T10-DEBUG': ['T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T11-REVIEW': ['T2-FOCUSED', 'T1-BASE', 'T12-FALLBACK'],
  'T12-FALLBACK': [], // Ultimate fallback, no further fallbacks
};

/**
 * Adaptive Routing System
 */
export class AdaptiveRoutingSystem {
  private performanceHistory: Map<TemplateType, number[]> = new Map();
  private fallbackUsage: Map<TemplateType, number> = new Map();

  constructor() {
    this.initializePerformanceHistory();
  }

  /**
   * Analyze prompt complexity and select optimal template
   */
  public async selectTemplate(
    userPrompt: string,
    fallbackHistory: TemplateType[] = [],
  ): Promise<RoutingResult> {
    // 1. Check if we're in fallback mode
    if (fallbackHistory.length > 0) {
      return this.handleFallback(userPrompt, fallbackHistory);
    }

    // 2. Analyze complexity
    const analysis = this.analyzeComplexity(userPrompt);

    // 3. Select primary template
    const primaryTemplate = this.selectPrimaryTemplate(analysis);

    // 4. Generate fallback chain
    const fallbackChain = FALLBACK_CHAINS[primaryTemplate];

    // 5. Calculate performance estimates
    const performanceEstimate = this.calculatePerformanceEstimate(primaryTemplate, analysis);

    return {
      template: primaryTemplate,
      confidence: analysis.confidence,
      reasoning: this.generateReasoning(analysis, primaryTemplate),
      fallbackChain,
      estimatedTokens: performanceEstimate.tokens,
      estimatedTime: performanceEstimate.time,
    };
  }

  /**
   * Analyze prompt complexity
   */
  private analyzeComplexity(prompt: string): ComplexityAnalysis {
    const normalizedPrompt = prompt.toLowerCase();
    const indicators: Record<ComplexityLevel, number> = {} as any;

    // Count indicators for each complexity level
    Object.entries(COMPLEXITY_INDICATORS).forEach(([level, config]) => {
      let score = 0;
      config.indicators.forEach((indicator) => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = normalizedPrompt.match(regex);
        if (matches) {
          score += matches.length * config.weight;
        }
      });
      indicators[level as ComplexityLevel] = score;
    });

    // Determine primary complexity
    const primary = Object.entries(indicators).sort(
      ([, a], [, b]) => b - a,
    )[0][0] as ComplexityLevel;

    // Calculate confidence based on score distribution
    const totalScore = Object.values(indicators).reduce((sum, score) => sum + score, 0);
    const primaryScore = indicators[primary];
    const confidence = totalScore > 0 ? primaryScore / totalScore : 0.5;

    // Detect domain
    const domain = this.detectDomain(normalizedPrompt);

    return {
      primary,
      indicators,
      confidence: Math.min(confidence, 0.95), // Cap at 95%
      domain,
    };
  }

  /**
   * Detect domain type from prompt
   */
  private detectDomain(prompt: string): DomainType | undefined {
    const domainScores: Record<DomainType, number> = {} as any;

    Object.entries(DOMAIN_INDICATORS).forEach(([domain, indicators]) => {
      let score = 0;
      indicators.forEach((indicator) => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = prompt.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      domainScores[domain as DomainType] = score;
    });

    // Find domain with highest score (excluding general)
    const detectedDomain = Object.entries(domainScores)
      .filter(([domain]) => domain !== 'general')
      .sort(([, a], [, b]) => b - a)[0];

    return detectedDomain && detectedDomain[1] > 0 ? (detectedDomain[0] as DomainType) : undefined;
  }

  /**
   * Select primary template based on analysis
   */
  private selectPrimaryTemplate(analysis: ComplexityAnalysis): TemplateType {
    const { primary, domain } = analysis;

    // Domain-specific routing
    if (domain && domain !== 'general') {
      const domainTemplate = this.getDomainTemplate(domain);
      if (domainTemplate) {
        return domainTemplate;
      }
    }

    // Complexity-based routing
    return COMPLEXITY_LEVELS[primary].template;
  }

  /**
   * Get template for specific domain
   */
  private getDomainTemplate(domain: DomainType): TemplateType | null {
    const domainMapping: Record<DomainType, TemplateType> = {
      technical: 'T7-TECHNICAL',
      creative: 'T8-CREATIVE',
      data: 'T9-DATA',
      debug: 'T10-DEBUG',
      general: 'T1-BASE',
    };

    return domainMapping[domain] || null;
  }

  /**
   * Handle fallback scenario
   */
  private handleFallback(prompt: string, fallbackHistory: TemplateType[]): RoutingResult {
    const lastFailedTemplate = fallbackHistory[fallbackHistory.length - 1];
    const fallbackChain = FALLBACK_CHAINS[lastFailedTemplate];

    if (fallbackChain.length === 0) {
      // Ultimate fallback
      return {
        template: 'T12-FALLBACK',
        confidence: 0.99,
        reasoning: 'Ultimate fallback after all other options failed',
        fallbackChain: [],
        estimatedTokens: 400,
        estimatedTime: 1.2,
      };
    }

    const nextTemplate = fallbackChain[0];
    const config = COMPLEXITY_LEVELS[nextTemplate] || {
      expectedSuccess: 0.9,
      maxTokens: 600,
      processingTime: 2.0,
    };

    return {
      template: nextTemplate,
      confidence: 0.85, // Lower confidence in fallback scenarios
      reasoning: `Fallback from ${lastFailedTemplate} to ${nextTemplate}`,
      fallbackChain: fallbackChain.slice(1),
      estimatedTokens: config.maxTokens,
      estimatedTime: config.processingTime,
    };
  }

  /**
   * Calculate performance estimates
   */
  private calculatePerformanceEstimate(
    template: TemplateType,
    analysis: ComplexityAnalysis,
  ): { tokens: number; time: number } {
    const baseConfig = COMPLEXITY_LEVELS[analysis.primary];

    // Adjust based on historical performance
    const historicalPerformance = this.getHistoricalPerformance(template);
    const performanceMultiplier = historicalPerformance / baseConfig.expectedSuccess;

    // Adjust based on confidence
    const confidenceMultiplier = 0.8 + analysis.confidence * 0.4; // 0.8 to 1.2 range

    return {
      tokens: Math.round(baseConfig.maxTokens * confidenceMultiplier),
      time: Math.round(baseConfig.processingTime * performanceMultiplier * 10) / 10,
    };
  }

  /**
   * Generate reasoning for template selection
   */
  private generateReasoning(analysis: ComplexityAnalysis, template: TemplateType): string {
    const { primary, confidence, domain } = analysis;

    let reasoning = `Selected ${template} based on ${primary} complexity`;

    if (domain && domain !== 'general') {
      reasoning += ` and ${domain} domain specialization`;
    }

    reasoning += ` (confidence: ${Math.round(confidence * 100)}%)`;

    // Add indicator details
    const topIndicators = Object.entries(analysis.indicators)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topIndicators.length > 0 && topIndicators[0][1] > 0) {
      reasoning += `. Key indicators: ${topIndicators
        .map(([level, score]) => `${level} (${Math.round(score)})`)
        .join(', ')}`;
    }

    return reasoning;
  }

  /**
   * Get historical performance for template
   */
  private getHistoricalPerformance(template: TemplateType): number {
    const history = this.performanceHistory.get(template) || [];
    if (history.length === 0) {
      return 0.9; // Default assumption
    }

    // Use weighted average (recent performance more important)
    const weights = history.map((_, index) => (index + 1) / history.length);
    const weightedSum = history.reduce((sum, success, index) => sum + success * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return weightedSum / totalWeight;
  }

  /**
   * Record template performance
   */
  public recordPerformance(template: TemplateType, success: boolean): void {
    const history = this.performanceHistory.get(template) || [];
    history.push(success ? 1 : 0);

    // Keep only last 50 performances
    if (history.length > 50) {
      history.shift();
    }

    this.performanceHistory.set(template, history);
  }

  /**
   * Record fallback usage
   */
  public recordFallbackUsage(template: TemplateType): void {
    const current = this.fallbackUsage.get(template) || 0;
    this.fallbackUsage.set(template, current + 1);
  }

  /**
   * Get routing statistics
   */
  public getStatistics(): {
    templatePerformance: Record<TemplateType, { successRate: number; usage: number }>;
    fallbackUsage: Record<TemplateType, number>;
    totalRoutings: number;
  } {
    const templatePerformance: Record<TemplateType, { successRate: number; usage: number }> =
      {} as any;

    Object.keys(COMPLEXITY_LEVELS).forEach((template) => {
      const history = this.performanceHistory.get(template as TemplateType) || [];
      const successRate =
        history.length > 0
          ? history.reduce((sum, success) => sum + success, 0) / history.length
          : 0;

      templatePerformance[template as TemplateType] = {
        successRate: Math.round(successRate * 100) / 100,
        usage: history.length,
      };
    });

    return {
      templatePerformance,
      fallbackUsage: Object.fromEntries(this.fallbackUsage) as Record<TemplateType, number>,
      totalRoutings: Array.from(this.performanceHistory.values()).reduce(
        (sum, history) => sum + history.length,
        0,
      ),
    };
  }

  /**
   * Initialize performance history with baseline values
   */
  private initializePerformanceHistory(): void {
    Object.values(COMPLEXITY_LEVELS).forEach((config) => {
      this.performanceHistory.set(config.template, []);
    });

    // Add baseline T1-BASE performance
    this.performanceHistory.set('T1-BASE', [1, 1, 1, 1, 1]); // 100% success rate
  }

  /**
   * Reset all statistics
   */
  public resetStatistics(): void {
    this.performanceHistory.clear();
    this.fallbackUsage.clear();
    this.initializePerformanceHistory();
  }
}

/**
 * Singleton instance for global use
 */
export const adaptiveRouting = new AdaptiveRoutingSystem();

/**
 * Convenience function for template selection
 */
export async function selectOptimalTemplate(
  userPrompt: string,
  fallbackHistory: TemplateType[] = [],
): Promise<RoutingResult> {
  return adaptiveRouting.selectTemplate(userPrompt, fallbackHistory);
}

/**
 * Export types and configurations for external use
 */
export { COMPLEXITY_LEVELS, DOMAIN_INDICATORS, FALLBACK_CHAINS };
