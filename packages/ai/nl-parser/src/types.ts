import { z } from 'zod';

export const IntentSchema = z.object({
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    required: z.boolean().default(false),
    description: z.string(),
    examples: z.array(z.string()).optional(),
    validation: z.object({
      min?: z.number(),
      max?: z.number(),
      pattern?: z.string(),
      enum: z.array(z.string()).optional()
    }).optional()
  })),
  confidence: z.number().min(0).max(1).optional()
});

export const ParseResultSchema = z.object({
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.any()),
  originalText: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export const ParserConfigSchema = z.object({
  language: z.string().default('en'),
  confidenceThreshold: z.number().min(0).max(1).default(0.7),
  maxParameters: z.number().default(10),
  enableFuzzyMatching: z.boolean().default(true),
  fuzzyThreshold: z.number().min(0).max(1).default(0.8),
  enableSpellCheck: z.boolean().default(true),
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().default(300000), // 5 minutes
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    maxRequests: z.number().default(100),
    windowMs: z.number().default(60000) // 1 minute
  }).default({})
});

export type Intent = z.infer<typeof IntentSchema>;
export type ParseResult = z.infer<typeof ParseResultSchema>;
export type ParserConfig = z.infer<typeof ParserConfigSchema>;

export interface IntentClassifier {
  classify(text: string): Promise<{ intent: string; confidence: number }>;
  addIntent(intent: Intent): Promise<void>;
  removeIntent(intentName: string): Promise<void>;
  getIntents(): Promise<Intent[]>;
  train(examples: Array<{ text: string; intent: string }>): Promise<void>;
}

export interface ParameterExtractor {
  extractParameters(text: string, intent: Intent): Promise<Record<string, any>>;
  addParameterPatterns(intentName: string, parameterName: string, patterns: string[]): Promise<void>;
  validateParameters(parameters: Record<string, any>, intent: Intent): { valid: boolean; errors: string[] };
}

export interface NLParser {
  parse(text: string, context?: any): Promise<ParseResult>;
  parseWithValidation(text: string, context?: any): Promise<ParseResult & { valid: boolean; errors: string[] }>;
  addIntent(intent: Intent): Promise<void>;
  removeIntent(intentName: string): Promise<void>;
  getIntents(): Promise<Intent[]>;
  train(examples: Array<{ text: string; intent: string; parameters?: Record<string, any> }>): Promise<void>;
}

export interface CommandHandler {
  canHandle(intent: string): boolean;
  handle(parseResult: ParseResult, context?: any): Promise<any>;
  getIntent(): string;
}

export interface ParserCache {
  get(key: string): Promise<ParseResult | null>;
  set(key: string, result: ParseResult, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface RateLimiter {
  isAllowed(identifier: string): Promise<boolean>;
  getRemainingRequests(identifier: string): Promise<number>;
  getResetTime(identifier: string): Promise<Date>;
}

export interface ParserMetrics {
  totalRequests: number;
  successfulParses: number;
  failedParses: number;
  averageConfidence: number;
  mostCommonIntents: Array<{ intent: string; count: number }>;
  averageProcessingTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
}

export interface MetricsCollector {
  recordRequest(intent: string, confidence: number, processingTime: number): void;
  recordFailure(error: Error): void;
  recordCacheHit(): void;
  recordCacheMiss(): void;
  recordRateLimitHit(): void;
  getMetrics(): Promise<ParserMetrics>;
  resetMetrics(): Promise<void>;
}