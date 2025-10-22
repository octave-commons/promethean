/**
 * Context Enhancement with LLM Integration
 *
 * This module provides intelligent context enhancement capabilities using LLM services
 * to improve the quality and depth of context for kanban healing operations.
 */

import { randomUUID } from 'node:crypto';
import type { ScarContext, SearchResult, LLMOperation } from './scar-context-types.js';
import type { ScarContextBuilderOptions } from './scar-context-builder.js';

// LLM generate function type
type GenerateFunction = (args: {
  prompt: string;
  context?: Array<{ role: string; content: string }>;
  format?: unknown;
}) => Promise<unknown>;

// Dynamic import for LLM to avoid build issues
async function getLLMGenerate(): Promise<GenerateFunction | null> {
  try {
    const llmModule = await import('@promethean/llm');
    return llmModule.generate as GenerateFunction;
  } catch (error) {
    console.warn('LLM module not available, using fallback');
    return null;
  }
}

/**
 * Context enhancement configuration
 */
export interface ContextEnhancementOptions {
  /** Enable/disable LLM enhancement */
  enabled?: boolean;
  /** Maximum tokens to use for enhancement */
  maxTokens?: number;
  /** Enhancement strategies to apply */
  strategies?: EnhancementStrategy[];
  /** Custom prompts for different enhancement types */
  customPrompts?: Record<string, string>;
  /** Timeout for LLM operations (ms) */
  timeout?: number;
  /** Fallback behavior when LLM fails */
  fallbackBehavior?: 'skip' | 'basic' | 'error';
}

/**
 * Available enhancement strategies
 */
export type EnhancementStrategy =
  | 'summarization'
  | 'pattern_detection'
  | 'anomaly_detection'
  | 'recommendation_generation'
  | 'risk_assessment'
  | 'priority_analysis'
  | 'correlation_analysis'
  | 'basic';

/**
 * Enhanced context analysis results
 */
export interface ContextAnalysis {
  /** Summary of board state and issues */
  summary: string;
  /** Detected patterns in task data */
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
    evidence: string[];
  }>;
  /** Anomalies or unusual conditions */
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }>;
  /** Recommendations for healing */
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    rationale: string;
    estimatedImpact: string;
  }>;
  /** Risk assessment */
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      mitigation: string;
    }>;
  };
  /** Priority analysis */
  priorityAnalysis: {
    immediateActions: string[];
    shortTermActions: string[];
    longTermActions: string[];
  };
  /** Correlations between different issues */
  correlations: Array<{
    source: string;
    target: string;
    relationship: string;
    strength: number;
  }>;
}

/**
 * LLM-enhanced scar context
 */
export interface EnhancedScarContext extends ScarContext {
  /** LLM analysis results */
  analysis?: ContextAnalysis;
  /** Enhancement metadata */
  enhancement?: {
    strategies: EnhancementStrategy[];
    tokensUsed: number;
    processingTime: number;
    model: string;
    timestamp: Date;
  };
}

/**
 * Context Enhancement Engine
 *
 * Provides intelligent context enhancement using LLM services to analyze
 * board state, detect patterns, identify issues, and generate recommendations.
 */
export class ContextEnhancementEngine {
  private readonly options: Required<ContextEnhancementOptions>;

  constructor(options: ContextEnhancementOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      maxTokens: options.maxTokens ?? 4000,
      strategies: options.strategies ?? [
        'summarization',
        'pattern_detection',
        'anomaly_detection',
        'recommendation_generation',
        'risk_assessment',
        'priority_analysis',
      ],
      customPrompts: options.customPrompts ?? {},
      timeout: options.timeout ?? 30000,
      fallbackBehavior: options.fallbackBehavior ?? 'basic',
    };
  }

  /**
   * Enhance scar context with LLM analysis
   */
  async enhanceContext(
    context: ScarContext,
    builderOptions: ScarContextBuilderOptions = {},
  ): Promise<EnhancedScarContext> {
    if (!this.options.enabled) {
      return context as EnhancedScarContext;
    }

    const startTime = Date.now();
    const enhancedContext: EnhancedScarContext = { ...context };

    try {
      // Prepare context data for LLM analysis
      const contextData = this.prepareContextData(context, builderOptions);

      // Apply enhancement strategies
      const analysis: Partial<ContextAnalysis> = {};
      let totalTokensUsed = 0;

      for (const strategy of this.options.strategies) {
        try {
          const result = await this.applyStrategy(strategy, contextData);
          Object.assign(analysis, result);

          // Track tokens if available
          if (result && typeof result === 'object' && 'tokensUsed' in result) {
            totalTokensUsed += (result as any).tokensUsed;
          }
        } catch (error) {
          console.warn(`Failed to apply strategy ${strategy}:`, error);

          if (this.options.fallbackBehavior === 'error') {
            throw error;
          }
        }
      }

      // Add analysis to context
      enhancedContext.analysis = analysis as ContextAnalysis;
      enhancedContext.enhancement = {
        strategies: this.options.strategies,
        tokensUsed: totalTokensUsed,
        processingTime: Date.now() - startTime,
        model: 'unknown', // Would be populated from LLM response
        timestamp: new Date(),
      };

      // Add LLM operation tracking
      await this.addLLMOperation(enhancedContext, 'context-enhancement', {
        strategies: this.options.strategies,
        tokensUsed: totalTokensUsed,
        processingTime: Date.now() - startTime,
      });

      return enhancedContext;
    } catch (error) {
      console.error('Context enhancement failed:', error);

      if (this.options.fallbackBehavior === 'skip') {
        return context as EnhancedScarContext;
      } else if (this.options.fallbackBehavior === 'basic') {
        return this.applyBasicEnhancement(context, builderOptions);
      } else {
        throw error;
      }
    }
  }

  /**
   * Prepare context data for LLM analysis
   */
  private prepareContextData(
    context: ScarContext,
    builderOptions: ScarContextBuilderOptions,
  ): string {
    const sections = [
      `# Healing Context Analysis`,
      `**Reason:** ${context.reason}`,
      `**Timestamp:** ${new Date().toISOString()}`,
      '',
      '## Event Log Summary',
      this.summarizeEventLog(context.eventLog),
      '',
      '## Search Results',
      this.summarizeSearchResults(context.searchResults),
      '',
      '## Previous Scars',
      this.summarizePreviousScars(context.previousScars),
      '',
      '## Builder Options',
      JSON.stringify(builderOptions, null, 2),
    ];

    return sections.join('\n');
  }

  /**
   * Apply specific enhancement strategy
   */
  private async applyStrategy(
    strategy: EnhancementStrategy,
    contextData: string,
  ): Promise<Partial<ContextAnalysis>> {
    const prompt = this.options.customPrompts[strategy] || this.getDefaultPrompt(strategy);

    const enhancedPrompt = `${prompt}

Context Data:
${contextData}

Please provide your analysis in the following JSON format:
{
  "summary": "Brief summary of the context",
  "patterns": [{"type": "pattern_type", "description": "description", "confidence": 0.8, "evidence": ["evidence1", "evidence2"]}],
  "anomalies": [{"type": "anomaly_type", "description": "description", "severity": "high", "impact": "impact_description"}],
  "recommendations": [{"action": "recommended_action", "priority": "high", "rationale": "reason", "estimatedImpact": "impact"}],
  "riskAssessment": {"overallRisk": "medium", "riskFactors": [{"factor": "factor", "level": "medium", "mitigation": "mitigation"}]},
  "priorityAnalysis": {"immediateActions": ["action1"], "shortTermActions": ["action2"], "longTermActions": ["action3"]},
  "correlations": [{"source": "source", "target": "target", "relationship": "relationship", "strength": 0.7}]
}`;

    try {
      const generate = await getLLMGenerate();
      if (!generate) {
        throw new Error('LLM generate function not available');
      }

      const response = await generate({
        prompt: enhancedPrompt,
        context: [
          {
            role: 'system',
            content: 'You are an expert in kanban system analysis and healing operations.',
          },
        ],
        format: { type: 'json_object' },
      });

      // Parse and validate response
      const analysis = typeof response === 'string' ? JSON.parse(response) : response;

      // Filter results based on strategy
      switch (strategy) {
        case 'summarization':
          return { summary: analysis.summary };
        case 'pattern_detection':
          return { patterns: analysis.patterns };
        case 'anomaly_detection':
          return { anomalies: analysis.anomalies };
        case 'recommendation_generation':
          return { recommendations: analysis.recommendations };
        case 'risk_assessment':
          return { riskAssessment: analysis.riskAssessment };
        case 'priority_analysis':
          return { priorityAnalysis: analysis.priorityAnalysis };
        case 'correlation_analysis':
          return { correlations: analysis.correlations };
        case 'basic':
          return {};
        default:
          return analysis;
      }
    } catch (error) {
      console.error(`Failed to apply strategy ${strategy}:`, error);
      throw error;
    }
  }

  /**
   * Get default prompt for strategy
   */
  private getDefaultPrompt(strategy: EnhancementStrategy): string {
    const prompts: Record<string, string> = {
      summarization:
        'Analyze the provided kanban healing context and provide a concise summary of current state, key issues, and overall situation.',
      pattern_detection:
        'Analyze the kanban context to identify recurring patterns, trends, and systemic issues. Look for patterns in task flow, bottlenecks, quality issues, or team behaviors.',
      anomaly_detection:
        'Examine the kanban context for anomalies, outliers, or unusual conditions that may indicate problems or opportunities for improvement.',
      recommendation_generation:
        'Based on the kanban context analysis, generate specific, actionable recommendations for healing and improving the system.',
      risk_assessment:
        'Assess the risks present in the kanban system, including potential failures, bottlenecks, and quality issues. Provide risk levels and mitigation strategies.',
      priority_analysis:
        'Analyze the context to determine priority levels for different actions. Categorize recommendations into immediate, short-term, and long-term actions.',
      correlation_analysis:
        'Identify correlations and relationships between different issues, patterns, or events in the kanban context.',
      basic: 'Analyze the provided kanban context and provide insights.',
    };

    return prompts[strategy] || 'Analyze the provided kanban context and provide insights.';
  }

  /**
   * Apply basic enhancement without LLM
   */
  private applyBasicEnhancement(
    context: ScarContext,
    _builderOptions: ScarContextBuilderOptions,
  ): EnhancedScarContext {
    const basicAnalysis: ContextAnalysis = {
      summary: `Basic analysis of kanban healing context. Reason: ${context.reason}`,
      patterns: [],
      anomalies: [],
      recommendations: [
        {
          action: 'Review event log for detailed issues',
          priority: 'medium',
          rationale: 'Event log contains detailed information about context building process',
          estimatedImpact: 'Medium - improves understanding of current state',
        },
      ],
      riskAssessment: {
        overallRisk: 'medium',
        riskFactors: [
          {
            factor: 'Limited analysis without LLM enhancement',
            level: 'low',
            mitigation: 'Enable LLM enhancement for deeper analysis',
          },
        ],
      },
      priorityAnalysis: {
        immediateActions: [],
        shortTermActions: ['Review context data'],
        longTermActions: ['Implement LLM enhancement'],
      },
      correlations: [],
    };

    return {
      ...context,
      analysis: basicAnalysis,
      enhancement: {
        strategies: ['basic'],
        tokensUsed: 0,
        processingTime: 0,
        model: 'basic',
        timestamp: new Date(),
      },
    };
  }

  /**
   * Summarize event log for context
   */
  private summarizeEventLog(eventLog: any[]): string {
    if (eventLog.length === 0) return 'No events recorded.';

    const summary = eventLog
      .map((event) => `- ${event.event}: ${JSON.stringify(event.details)}`)
      .join('\n');

    return `Total events: ${eventLog.length}\n${summary}`;
  }

  /**
   * Summarize search results
   */
  private summarizeSearchResults(results: SearchResult[]): string {
    if (results.length === 0) return 'No search results.';

    const summary = results
      .map((result) => `- ${result.title} (relevance: ${result.relevance.toFixed(2)})`)
      .join('\n');

    return `Total results: ${results.length}\n${summary}`;
  }

  /**
   * Summarize previous scars
   */
  private summarizePreviousScars(scars: any[]): string {
    if (scars.length === 0) return 'No previous scars found.';

    return `Previous scars: ${scars.length} records found.`;
  }

  /**
   * Add LLM operation to context tracking
   */
  private async addLLMOperation(
    context: EnhancedScarContext,
    operation: string,
    details: any,
  ): Promise<void> {
    const llmOp: LLMOperation = {
      id: randomUUID(),
      operation,
      input: details,
      output: context.analysis,
      timestamp: new Date(),
      tokensUsed: details.tokensUsed,
    };

    context.llmOperations.push(llmOp);
  }
}

/**
 * Create a context enhancement engine with default options
 */
export function createContextEnhancementEngine(
  options?: ContextEnhancementOptions,
): ContextEnhancementEngine {
  return new ContextEnhancementEngine(options);
}

/**
 * Default enhancement options
 */
export const DEFAULT_ENHANCEMENT_OPTIONS: ContextEnhancementOptions = {
  enabled: true,
  maxTokens: 4000,
  strategies: [
    'summarization',
    'pattern_detection',
    'anomaly_detection',
    'recommendation_generation',
    'risk_assessment',
    'priority_analysis',
  ],
  customPrompts: {},
  timeout: 30000,
  fallbackBehavior: 'basic',
};
