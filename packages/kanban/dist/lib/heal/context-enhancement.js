/**
 * Context Enhancement with LLM Integration
 *
 * This module provides intelligent context enhancement capabilities using LLM services
 * to improve the quality and depth of context for kanban healing operations.
 */
import { randomUUID } from 'node:crypto';
// Dynamic import for LLM to avoid build issues
async function getLLMGenerate() {
    try {
        const llmModule = await import('@promethean-os/llm');
        return llmModule.generate;
    }
    catch (error) {
        console.warn('LLM module not available, using fallback');
        return null;
    }
}
/**
 * Context Enhancement Engine
 *
 * Provides intelligent context enhancement using LLM services to analyze
 * board state, detect patterns, identify issues, and generate recommendations.
 */
export class ContextEnhancementEngine {
    options;
    constructor(options = {}) {
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
    async enhanceContext(context, builderOptions = {}) {
        if (!this.options.enabled) {
            return context;
        }
        const startTime = Date.now();
        const enhancedContext = { ...context };
        try {
            // Prepare context data for LLM analysis
            const contextData = this.prepareContextData(context, builderOptions);
            // Apply enhancement strategies
            const analysis = {};
            let totalTokensUsed = 0;
            for (const strategy of this.options.strategies) {
                try {
                    const result = await this.applyStrategy(strategy, contextData);
                    Object.assign(analysis, result);
                    // Track tokens if available
                    if (result && typeof result === 'object' && 'tokensUsed' in result) {
                        totalTokensUsed += result.tokensUsed;
                    }
                }
                catch (error) {
                    console.warn(`Failed to apply strategy ${strategy}:`, error);
                    if (this.options.fallbackBehavior === 'error') {
                        throw error;
                    }
                }
            }
            // Add analysis to context
            enhancedContext.analysis = analysis;
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
        }
        catch (error) {
            console.error('Context enhancement failed:', error);
            if (this.options.fallbackBehavior === 'skip') {
                return context;
            }
            else if (this.options.fallbackBehavior === 'basic') {
                return this.applyBasicEnhancement(context, builderOptions);
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Prepare context data for LLM analysis
     */
    prepareContextData(context, builderOptions) {
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
    async applyStrategy(strategy, contextData) {
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
        }
        catch (error) {
            console.error(`Failed to apply strategy ${strategy}:`, error);
            throw error;
        }
    }
    /**
     * Get default prompt for strategy
     */
    getDefaultPrompt(strategy) {
        const prompts = {
            summarization: 'Analyze the provided kanban healing context and provide a concise summary of current state, key issues, and overall situation.',
            pattern_detection: 'Analyze the kanban context to identify recurring patterns, trends, and systemic issues. Look for patterns in task flow, bottlenecks, quality issues, or team behaviors.',
            anomaly_detection: 'Examine the kanban context for anomalies, outliers, or unusual conditions that may indicate problems or opportunities for improvement.',
            recommendation_generation: 'Based on the kanban context analysis, generate specific, actionable recommendations for healing and improving the system.',
            risk_assessment: 'Assess the risks present in the kanban system, including potential failures, bottlenecks, and quality issues. Provide risk levels and mitigation strategies.',
            priority_analysis: 'Analyze the context to determine priority levels for different actions. Categorize recommendations into immediate, short-term, and long-term actions.',
            correlation_analysis: 'Identify correlations and relationships between different issues, patterns, or events in the kanban context.',
            basic: 'Analyze the provided kanban context and provide insights.',
        };
        return prompts[strategy] || 'Analyze the provided kanban context and provide insights.';
    }
    /**
     * Apply basic enhancement without LLM
     */
    applyBasicEnhancement(context, _builderOptions) {
        const basicAnalysis = {
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
    summarizeEventLog(eventLog) {
        if (eventLog.length === 0)
            return 'No events recorded.';
        const summary = eventLog
            .map((event) => `- ${event.event}: ${JSON.stringify(event.details)}`)
            .join('\n');
        return `Total events: ${eventLog.length}\n${summary}`;
    }
    /**
     * Summarize search results
     */
    summarizeSearchResults(results) {
        if (results.length === 0)
            return 'No search results.';
        const summary = results
            .map((result) => `- ${result.title} (relevance: ${result.relevance.toFixed(2)})`)
            .join('\n');
        return `Total results: ${results.length}\n${summary}`;
    }
    /**
     * Summarize previous scars
     */
    summarizePreviousScars(scars) {
        if (scars.length === 0)
            return 'No previous scars found.';
        return `Previous scars: ${scars.length} records found.`;
    }
    /**
     * Add LLM operation to context tracking
     */
    async addLLMOperation(context, operation, details) {
        const llmOp = {
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
export function createContextEnhancementEngine(options) {
    return new ContextEnhancementEngine(options);
}
/**
 * Default enhancement options
 */
export const DEFAULT_ENHANCEMENT_OPTIONS = {
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
//# sourceMappingURL=context-enhancement.js.map