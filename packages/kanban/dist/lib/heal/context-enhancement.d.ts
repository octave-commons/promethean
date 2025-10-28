/**
 * Context Enhancement with LLM Integration
 *
 * This module provides intelligent context enhancement capabilities using LLM services
 * to improve the quality and depth of context for kanban healing operations.
 */
import type { ScarContext } from './scar-context-types.js';
import type { ScarContextBuilderOptions } from './scar-context-builder.js';
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
export type EnhancementStrategy = 'summarization' | 'pattern_detection' | 'anomaly_detection' | 'recommendation_generation' | 'risk_assessment' | 'priority_analysis' | 'correlation_analysis' | 'basic';
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
export declare class ContextEnhancementEngine {
    private readonly options;
    constructor(options?: ContextEnhancementOptions);
    /**
     * Enhance scar context with LLM analysis
     */
    enhanceContext(context: ScarContext, builderOptions?: ScarContextBuilderOptions): Promise<EnhancedScarContext>;
    /**
     * Prepare context data for LLM analysis
     */
    private prepareContextData;
    /**
     * Apply specific enhancement strategy
     */
    private applyStrategy;
    /**
     * Get default prompt for strategy
     */
    private getDefaultPrompt;
    /**
     * Apply basic enhancement without LLM
     */
    private applyBasicEnhancement;
    /**
     * Summarize event log for context
     */
    private summarizeEventLog;
    /**
     * Summarize search results
     */
    private summarizeSearchResults;
    /**
     * Summarize previous scars
     */
    private summarizePreviousScars;
    /**
     * Add LLM operation to context tracking
     */
    private addLLMOperation;
}
/**
 * Create a context enhancement engine with default options
 */
export declare function createContextEnhancementEngine(options?: ContextEnhancementOptions): ContextEnhancementEngine;
/**
 * Default enhancement options
 */
export declare const DEFAULT_ENHANCEMENT_OPTIONS: ContextEnhancementOptions;
//# sourceMappingURL=context-enhancement.d.ts.map