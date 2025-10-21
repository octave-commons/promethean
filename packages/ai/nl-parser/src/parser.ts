import { 
  NLParser, 
  ParseResult, 
  Intent, 
  IntentClassifier, 
  ParameterExtractor,
  ParserConfig,
  ParserCache,
  RateLimiter,
  MetricsCollector,
  CommandHandler
} from './types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class DefaultNLParser implements NLParser {
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(
    private intentClassifier: IntentClassifier,
    private parameterExtractor: ParameterExtractor,
    private cache: ParserCache,
    private rateLimiter: RateLimiter,
    private metrics: MetricsCollector,
    private config: ParserConfig
  ) {}

  async parse(text: string, context?: any): Promise<ParseResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(text, context);

    try {
      // Check rate limit
      const identifier = context?.userId || context?.agentId || 'anonymous';
      if (!await this.rateLimiter.isAllowed(identifier)) {
        throw new Error('Rate limit exceeded');
      }

      // Check cache
      if (this.config.cacheEnabled) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          this.metrics.recordCacheHit();
          return cached;
        }
        this.metrics.recordCacheMiss();
      }

      // Classify intent
      const classification = await this.intentClassifier.classify(text);
      
      if (classification.confidence < this.config.confidenceThreshold) {
        throw new Error(`Intent confidence too low: ${classification.confidence}`);
      }

      // Get intent definition
      const intents = await this.intentClassifier.getIntents();
      const intent = intents.find(i => i.name === classification.intent);
      
      if (!intent) {
        throw new Error(`Intent not found: ${classification.intent}`);
      }

      // Extract parameters
      const parameters = await this.parameterExtractor.extractParameters(text, intent);

      // Validate parameters
      const validation = this.parameterExtractor.validateParameters(parameters, intent);
      if (!validation.valid) {
        throw new Error(`Parameter validation failed: ${validation.errors.join(', ')}`);
      }

      const result: ParseResult = {
        intent: classification.intent,
        confidence: classification.confidence,
        parameters,
        originalText: text,
        timestamp: new Date(),
        metadata: {
          context,
          processingTime: Date.now() - startTime
        }
      };

      // Cache result
      if (this.config.cacheEnabled) {
        await this.cache.set(cacheKey, result, this.config.cacheTTL);
      }

      // Record metrics
      this.metrics.recordRequest(result.intent, result.confidence, Date.now() - startTime);

      return result;

    } catch (error) {
      this.metrics.recordFailure(error as Error);
      throw error;
    }
  }

  async parseWithValidation(text: string, context?: any): Promise<ParseResult & { valid: boolean; errors: string[] }> {
    try {
      const result = await this.parse(text, context);
      
      // Additional validation
      const intents = await this.intentClassifier.getIntents();
      const intent = intents.find(i => i.name === result.intent);
      
      let valid = true;
      const errors: string[] = [];

      if (intent) {
        const validation = this.parameterExtractor.validateParameters(result.parameters, intent);
        valid = validation.valid;
        errors.push(...validation.errors);
      }

      return {
        ...result,
        valid,
        errors
      };

    } catch (error) {
      return {
        intent: 'unknown',
        confidence: 0,
        parameters: {},
        originalText: text,
        timestamp: new Date(),
        valid: false,
        errors: [(error as Error).message]
      };
    }
  }

  async addIntent(intent: Intent): Promise<void> {
    await this.intentClassifier.addIntent(intent);
  }

  async removeIntent(intentName: string): Promise<void> {
    await this.intentClassifier.removeIntent(intentName);
    this.handlers.delete(intentName);
  }

  async getIntents(): Promise<Intent[]> {
    return await this.intentClassifier.getIntents();
  }

  async train(examples: Array<{ text: string; intent: string; parameters?: Record<string, any> }>): Promise<void> {
    await this.intentClassifier.train(examples);
  }

  // Command handling
  registerHandler(handler: CommandHandler): void {
    this.handlers.set(handler.getIntent(), handler);
  }

  unregisterHandler(intent: string): void {
    this.handlers.delete(intent);
  }

  async executeCommand(parseResult: ParseResult, context?: any): Promise<any> {
    const handler = this.handlers.get(parseResult.intent);
    
    if (!handler) {
      throw new Error(`No handler registered for intent: ${parseResult.intent}`);
    }

    return await handler.handle(parseResult, context);
  }

  // Batch processing
  async parseBatch(texts: string[], context?: any): Promise<ParseResult[]> {
    const results: ParseResult[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.parse(text, context);
        results.push(result);
      } catch (error) {
        // Add error result
        results.push({
          intent: 'error',
          confidence: 0,
          parameters: { error: (error as Error).message },
          originalText: text,
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  // Suggestion and correction
  async suggestCorrections(text: string, maxSuggestions: number = 3): Promise<Array<{ text: string; confidence: number }>> {
    const suggestions: Array<{ text: string; confidence: number }> = [];
    
    // Get similar intents
    const similarIntents = await this.intentClassifier.getSimilarIntents(text);
    
    for (const similar of similarIntents.slice(0, maxSuggestions)) {
      const intents = await this.intentClassifier.getIntents();
      const intent = intents.find(i => i.name === similar.intent);
      
      if (intent && intent.examples.length > 0) {
        suggestions.push({
          text: intent.examples[0], // Use first example as suggestion
          confidence: similar.similarity
        });
      }
    }

    return suggestions;
  }

  // Utility methods
  private generateCacheKey(text: string, context?: any): string {
    const data = { text, context };
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `parse:${hash}`;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: any;
    intentCount: number;
  }> {
    try {
      const metrics = await this.metrics.getMetrics();
      const intents = await this.intentClassifier.getIntents();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (metrics.averageConfidence < 0.5) {
        status = 'degraded';
      }
      
      if (metrics.failedParses / metrics.totalRequests > 0.3) {
        status = 'unhealthy';
      }

      return {
        status,
        metrics,
        intentCount: intents.length
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: null,
        intentCount: 0
      };
    }
  }

  // Reset and cleanup
  async reset(): Promise<void> {
    await this.cache.clear();
    await this.metrics.resetMetrics();
  }

  async cleanup(): Promise<void> {
    await this.reset();
    this.handlers.clear();
  }
}