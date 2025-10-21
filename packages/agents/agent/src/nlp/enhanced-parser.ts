import { z } from 'zod';
import {
    CoreMessage,
    MessageType,
    AgentAddress,
    Priority,
    QoSLevel,
} from '../../../../pseudo/agent-os-protocol/src/core/types.js';

// ============================================================================
// Enhanced Type Definitions
// ============================================================================

export enum IntentType {
    // Lifecycle Management
    START = 'start',
    STOP = 'stop',
    RESTART = 'restart',
    STATUS = 'status',

    // Configuration
    CONFIGURE = 'configure',
    UPDATE = 'update',
    MODIFY = 'modify',

    // Resource Management
    CREATE = 'create',
    DELETE = 'delete',
    REMOVE = 'remove',

    // Information & Query
    QUERY = 'query',
    LIST = 'list',
    SEARCH = 'search',
    FIND = 'find',
    SHOW = 'show',
    GET = 'get',

    // Assistance
    HELP = 'help',
    EXPLAIN = 'explain',
    DESCRIBE = 'describe',

    // Testing & Validation
    TEST = 'test',
    VALIDATE = 'validate',
    VERIFY = 'verify',
    CHECK = 'check',

    // Communication
    SEND = 'send',
    BROADCAST = 'broadcast',
    NOTIFY = 'notify',

    // Crisis Management
    ALERT = 'alert',
    ESCALATE = 'escalate',
    RESOLVE = 'resolve',

    // Workflow
    EXECUTE = 'execute',
    RUN = 'run',
    DEPLOY = 'deploy',
    ROLLBACK = 'rollback',
}

export enum EntityType {
    TARGET_AGENT = 'target_agent',
    TARGET_SERVICE = 'target_service',
    TARGET_WORKFLOW = 'target_workflow',
    TARGET_SYSTEM = 'target_system',
    TARGET_TASK = 'target_task',

    PARAMETER = 'parameter',
    VALUE = 'value',
    CONDITION = 'condition',

    TIME = 'time',
    DURATION = 'duration',
    PRIORITY = 'priority',

    USER = 'user',
    SESSION = 'session',
    CONTEXT = 'context',
}

export interface Entity {
    type: EntityType;
    value: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
    metadata?: Record<string, any>;
}

export interface Intent {
    type: IntentType;
    confidence: number;
    parameters: Record<string, any>;
    entities: Entity[];
    alternativeIntents?: Array<{
        type: IntentType;
        confidence: number;
        reason: string;
    }>;
}

export interface ParseContext {
    userId: string;
    sessionId: string;
    previousIntents: Intent[];
    entities: Entity[];
    timestamp: Date;
    preferences: Record<string, any>;
}

export interface EnhancedParseResult {
    success: boolean;
    intent?: Intent;
    coreMessage?: CoreMessage;
    confidence: number;
    requiresClarification: boolean;
    clarificationQuestions?: string[];
    suggestions?: string[];
    error?: string;
    context?: ParseContext;
}

// ============================================================================
// Schema Definitions
// ============================================================================

export const EntitySchema = z.object({
    type: z.nativeEnum(EntityType),
    value: z.string(),
    confidence: z.number().min(0).max(1),
    startIndex: z.number(),
    endIndex: z.number(),
    metadata: z.record(z.any()).optional(),
});

export const IntentSchema = z.object({
    type: z.nativeEnum(IntentType),
    confidence: z.number().min(0).max(1),
    parameters: z.record(z.any()),
    entities: z.array(EntitySchema),
    alternativeIntents: z
        .array(
            z.object({
                type: z.nativeEnum(IntentType),
                confidence: z.number().min(0).max(1),
                reason: z.string(),
            }),
        )
        .optional(),
});

export const ParseContextSchema = z.object({
    userId: z.string(),
    sessionId: z.string(),
    previousIntents: z.array(IntentSchema),
    entities: z.array(EntitySchema),
    timestamp: z.date(),
    preferences: z.record(z.any()),
});

export const EnhancedParseResultSchema = z.object({
    success: z.boolean(),
    intent: IntentSchema.optional(),
    coreMessage: z.any().optional(), // CoreMessage schema would be too complex here
    confidence: z.number().min(0).max(1),
    requiresClarification: boolean,
    clarificationQuestions: z.array(z.string()).optional(),
    suggestions: z.array(z.string()).optional(),
    error: z.string().optional(),
    context: ParseContextSchema.optional(),
});

export type EnhancedParseResult = z.infer<typeof EnhancedParseResultSchema>;

// ============================================================================
// Configuration
// ============================================================================

export interface EnhancedParserConfig {
    // Language & Localization
    language: string;
    locale: string;

    // Confidence Thresholds
    minIntentConfidence: number;
    minEntityConfidence: number;
    clarificationThreshold: number;

    // Context Management
    maxContextSize: number;
    contextTimeout: number; // milliseconds
    enableLearning: boolean;

    // Performance
    maxAlternatives: number;
    timeout: number;
    enableCaching: boolean;

    // Features
    enableSpellCheck: boolean;
    enableAutoComplete: boolean;
    enableSuggestions: boolean;
    enableMultiIntent: boolean;
}

export const defaultConfig: EnhancedParserConfig = {
    language: 'en',
    locale: 'en-US',
    minIntentConfidence: 0.7,
    minEntityConfidence: 0.6,
    clarificationThreshold: 0.5,
    maxContextSize: 10,
    contextTimeout: 300000, // 5 minutes
    enableLearning: false,
    maxAlternatives: 3,
    timeout: 5000,
    enableCaching: true,
    enableSpellCheck: true,
    enableAutoComplete: true,
    enableSuggestions: true,
    enableMultiIntent: false,
};

// ============================================================================
// Main Enhanced Parser Class
// ============================================================================

export class EnhancedNaturalLanguageParser {
    private config: EnhancedParserConfig;
    private intentPatterns: Map<IntentType, RegExp[]>;
    private entityExtractors: Map<EntityType, (input: string) => Entity[]>;
    private contextCache: Map<string, ParseContext>;
    private vocabulary: Map<string, IntentType[]>;

    constructor(config: Partial<EnhancedParserConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.intentPatterns = new Map();
        this.entityExtractors = new Map();
        this.contextCache = new Map();
        this.vocabulary = new Map();

        this.initializeIntentPatterns();
        this.initializeEntityExtractors();
        this.initializeVocabulary();
    }

    // ============================================================================
    // Public API
    // ============================================================================

    async parse(input: string, context?: Partial<ParseContext>): Promise<EnhancedParseResult> {
        try {
            const startTime = Date.now();

            // Get or create context
            const parseContext = await this.getOrCreateContext(context);

            // Preprocess input
            const preprocessedInput = this.preprocessInput(input);

            // Extract entities first (helps with intent recognition)
            const entities = await this.extractEntities(preprocessedInput);

            // Recognize intent
            const intentResult = await this.recognizeIntent(preprocessedInput, entities, parseContext);

            // Update context
            await this.updateContext(parseContext, intentResult.intent, entities);

            // Generate CoreMessage if intent is confident enough
            let coreMessage: CoreMessage | undefined;
            if (intentResult.intent && intentResult.intent.confidence >= this.config.minIntentConfidence) {
                coreMessage = await this.generateCoreMessage(intentResult.intent, parseContext);
            }

            // Determine if clarification is needed
            const requiresClarification = intentResult.intent?.confidence < this.config.clarificationThreshold;
            const clarificationQuestions = requiresClarification
                ? await this.generateClarificationQuestions(intentResult.intent!, entities)
                : undefined;

            // Generate suggestions
            const suggestions = this.config.enableSuggestions
                ? await this.generateSuggestions(preprocessedInput, intentResult.intent)
                : undefined;

            const duration = Date.now() - startTime;

            return {
                success: true,
                intent: intentResult.intent,
                coreMessage,
                confidence: intentResult.intent?.confidence || 0,
                requiresClarification,
                clarificationQuestions,
                suggestions,
                context: parseContext,
            };
        } catch (error) {
            return {
                success: false,
                confidence: 0,
                requiresClarification: false,
                error: error instanceof Error ? error.message : 'Unknown parsing error',
            };
        }
    }

    async getSuggestions(input: string, maxSuggestions: number = 5): Promise<string[]> {
        const preprocessedInput = this.preprocessInput(input);
        const suggestions: string[] = [];

        // Get vocabulary-based suggestions
        for (const [term, intents] of this.vocabulary) {
            if (this.calculateSimilarity(preprocessedInput, term) > 0.3) {
                for (const intent of intents) {
                    suggestions.push(this.generateExampleFromIntent(intent, term));
                }
            }
        }

        return suggestions.slice(0, maxSuggestions);
    }

    registerIntentPattern(intent: IntentType, patterns: RegExp[]): void {
        this.intentPatterns.set(intent, patterns);
    }

    registerEntityExtractor(type: EntityType, extractor: (input: string) => Entity[]): void {
        this.entityExtractors.set(type, extractor);
    }

    updateConfig(config: Partial<EnhancedParserConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // ============================================================================
    // Private Methods - Intent Recognition
    // ============================================================================

    private initializeIntentPatterns(): void {
        // Lifecycle Management
        this.intentPatterns.set(IntentType.START, [
            /\b(start|begin|launch|run|execute|activate|initiate|commence)\b/i,
            /\b(start up|power on|boot up|spin up)\b/i,
        ]);

        this.intentPatterns.set(IntentType.STOP, [
            /\b(stop|end|terminate|kill|shutdown|deactivate|halt|cease)\b/i,
            /\b(stop|shut down|power off|kill|terminate)\b/i,
        ]);

        this.intentPatterns.set(IntentType.RESTART, [
            /\b(restart|reboot|reload|reset|cycle)\b/i,
            /\b(start again|fresh start)\b/i,
        ]);

        this.intentPatterns.set(IntentType.STATUS, [
            /\b(status|state|info|information|details|check|monitor)\b/i,
            /\b(how is|what's the|get status|show me)\b/i,
        ]);

        // Configuration
        this.intentPatterns.set(IntentType.CONFIGURE, [
            /\b(configure|config|setup|settings|adjust|modify|change)\b/i,
            /\b(set|update|tune|calibrate)\b/i,
        ]);

        // Resource Management
        this.intentPatterns.set(IntentType.CREATE, [/\b(create|make|new|add|generate|build|spawn|provision)\b/i]);

        this.intentPatterns.set(IntentType.DELETE, [/\b(delete|remove|del|rm|destroy|eliminate|clean up)\b/i]);

        // Information & Query
        this.intentPatterns.set(IntentType.QUERY, [
            /\b(query|search|find|list|show|get|retrieve|fetch)\b/i,
            /\b(what|where|when|why|how)\b/i,
        ]);

        // Assistance
        this.intentPatterns.set(IntentType.HELP, [
            /\b(help|assist|guide|instructions|howto|usage|support)\b/i,
            /\b(learn about|understand|explain)\b/i,
        ]);

        // Testing & Validation
        this.intentPatterns.set(IntentType.TEST, [/\b(test|testing|validate|verify|check|examine|audit)\b/i]);

        // Communication
        this.intentPatterns.set(IntentType.SEND, [/\b(send|transmit|deliver|forward|route)\b/i]);

        // Crisis Management
        this.intentPatterns.set(IntentType.ALERT, [/\b(alert|notify|warn|escalate|report|flag)\b/i]);

        // Workflow
        this.intentPatterns.set(IntentType.EXECUTE, [/\b(execute|run|perform|carry out|implement)\b/i]);
    }

    private async recognizeIntent(
        input: string,
        entities: Entity[],
        context: ParseContext,
    ): Promise<{ intent?: Intent; confidence: number }> {
        const intentScores: Map<IntentType, number> = new Map();
        const matchedPatterns: Map<IntentType, string[]> = new Map();

        // Score based on pattern matching
        for (const [intent, patterns] of this.intentPatterns) {
            let score = 0;
            const matches: string[] = [];

            for (const pattern of patterns) {
                const match = input.match(pattern);
                if (match) {
                    score += match.length;
                    matches.push(...match);
                }
            }

            // Boost score based on entity relevance
            const relevantEntities = entities.filter((entity) => this.isEntityRelevantToIntent(entity, intent));
            score += relevantEntities.length * 0.5;

            // Context boost
            const contextBoost = this.calculateContextBoost(intent, context);
            score += contextBoost;

            if (score > 0) {
                intentScores.set(intent, score);
                matchedPatterns.set(intent, matches);
            }
        }

        if (intentScores.size === 0) {
            return { confidence: 0 };
        }

        // Normalize scores
        const maxScore = Math.max(...intentScores.values());
        const normalizedScores = new Map<IntentType, number>();

        for (const [intent, score] of intentScores) {
            normalizedScores.set(intent, score / maxScore);
        }

        // Sort by confidence
        const sortedIntents = Array.from(normalizedScores.entries()).sort((a, b) => b[1] - a[1]);

        const primaryIntent = sortedIntents[0];
        const alternatives = sortedIntents.slice(1, this.config.maxAlternatives);

        const intent: Intent = {
            type: primaryIntent[0],
            confidence: primaryIntent[1],
            parameters: this.extractParametersFromEntities(entities),
            entities,
            alternativeIntents: alternatives.map(([type, confidence]) => ({
                type,
                confidence,
                reason: `Pattern matching score: ${confidence.toFixed(2)}`,
            })),
        };

        return { intent, confidence: primaryIntent[1] };
    }

    // ============================================================================
    // Private Methods - Entity Extraction
    // ============================================================================

    private initializeEntityExtractors(): void {
        // Target entities
        this.entityExtractors.set(EntityType.TARGET_AGENT, (input) =>
            this.extractTargetEntities(input, ['agent', 'bot', 'assistant', 'worker']),
        );

        this.entityExtractors.set(EntityType.TARGET_SERVICE, (input) =>
            this.extractTargetEntities(input, ['service', 'microservice', 'api', 'endpoint']),
        );

        this.entityExtractors.set(EntityType.TARGET_WORKFLOW, (input) =>
            this.extractTargetEntities(input, ['workflow', 'pipeline', 'process', 'job']),
        );

        this.entityExtractors.set(EntityType.TARGET_SYSTEM, (input) =>
            this.extractTargetEntities(input, ['system', 'platform', 'environment', 'cluster']),
        );

        // Parameter entities
        this.entityExtractors.set(EntityType.PARAMETER, (input) => this.extractParameterEntities(input));

        // Value entities
        this.entityExtractors.set(EntityType.VALUE, (input) => this.extractValueEntities(input));

        // Time entities
        this.entityExtractors.set(EntityType.TIME, (input) => this.extractTimeEntities(input));

        // Priority entities
        this.entityExtractors.set(EntityType.PRIORITY, (input) => this.extractPriorityEntities(input));
    }

    private async extractEntities(input: string): Promise<Entity[]> {
        const allEntities: Entity[] = [];

        for (const [type, extractor] of this.entityExtractors) {
            try {
                const entities = extractor(input);
                allEntities.push(...entities);
            } catch (error) {
                // Log error but continue with other extractors
                console.warn(`Entity extractor failed for type ${type}:`, error);
            }
        }

        // Remove overlapping entities, keep higher confidence ones
        return this.resolveEntityConflicts(allEntities);
    }

    private extractTargetEntities(input: string, keywords: string[]): Entity[] {
        const entities: Entity[] = [];
        const regex = new RegExp(`\\b(${keywords.join('|')})\\s+(\\w+)\\b`, 'gi');
        let match;

        while ((match = regex.exec(input)) !== null) {
            entities.push({
                type: EntityType.TARGET_AGENT, // Default, will be refined
                value: match[2],
                confidence: 0.8,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                metadata: { targetType: match[1].toLowerCase() },
            });
        }

        return entities;
    }

    private extractParameterEntities(input: string): Entity[] {
        const entities: Entity[] = [];

        // Key-value pairs: key=value, key: value, key value
        const patterns = [/(\w+)\s*=\s*([^\s]+)/gi, /(\w+)\s*:\s*([^\s]+)/gi, /(\w+)\s+([^\s]+)/gi];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(input)) !== null) {
                entities.push({
                    type: EntityType.PARAMETER,
                    value: match[1],
                    confidence: 0.7,
                    startIndex: match.index,
                    endIndex: match.index + match[1].length,
                    metadata: { parameterValue: match[2] },
                });
            }
        }

        return entities;
    }

    private extractValueEntities(input: string): Entity[] {
        const entities: Entity[] = [];

        // Numbers
        const numberPattern = /\b(\d+(?:\.\d+)?)\b/g;
        let match;
        while ((match = numberPattern.exec(input)) !== null) {
            entities.push({
                type: EntityType.VALUE,
                value: match[1],
                confidence: 0.9,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                metadata: { valueType: 'number' },
            });
        }

        // Quoted strings
        const stringPattern = /["']([^"']+)["']/g;
        while ((match = stringPattern.exec(input)) !== null) {
            entities.push({
                type: EntityType.VALUE,
                value: match[1],
                confidence: 0.9,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                metadata: { valueType: 'string' },
            });
        }

        return entities;
    }

    private extractTimeEntities(input: string): Entity[] {
        const entities: Entity[] = [];

        // Time expressions
        const timePatterns = [
            /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\b/gi,
            /\b(in\s+\d+\s+(?:seconds?|minutes?|hours?|days?))\b/gi,
            /\b(\d+\s+(?:seconds?|minutes?|hours?|days?)\s+ago)\b/gi,
        ];

        for (const pattern of timePatterns) {
            let match;
            while ((match = pattern.exec(input)) !== null) {
                entities.push({
                    type: EntityType.TIME,
                    value: match[1],
                    confidence: 0.8,
                    startIndex: match.index,
                    endIndex: match.index + match[0].length,
                });
            }
        }

        return entities;
    }

    private extractPriorityEntities(input: string): Entity[] {
        const entities: Entity[] = [];

        const priorityPattern = /\b(low|medium|high|critical|urgent|priority)\s*(\d*)\b/gi;
        let match;

        while ((match = priorityPattern.exec(input)) !== null) {
            entities.push({
                type: EntityType.PRIORITY,
                value: match[1].toLowerCase(),
                confidence: 0.8,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                metadata: { level: match[2] || undefined },
            });
        }

        return entities;
    }

    // ============================================================================
    // Private Methods - Context Management
    // ============================================================================

    private async getOrCreateContext(context?: Partial<ParseContext>): Promise<ParseContext> {
        const sessionId = context?.sessionId || this.generateSessionId();

        if (this.contextCache.has(sessionId)) {
            const existingContext = this.contextCache.get(sessionId)!;

            // Check if context is still valid
            const now = new Date();
            const age = now.getTime() - existingContext.timestamp.getTime();

            if (age < this.config.contextTimeout) {
                return { ...existingContext, ...context, timestamp: now };
            }
        }

        const newContext: ParseContext = {
            userId: context?.userId || 'anonymous',
            sessionId,
            previousIntents: [],
            entities: [],
            timestamp: new Date(),
            preferences: {},
            ...context,
        };

        this.contextCache.set(sessionId, newContext);
        return newContext;
    }

    private async updateContext(context: ParseContext, intent?: Intent, entities: Entity[] = []): Promise<void> {
        if (intent) {
            context.previousIntents.push(intent);

            // Keep only recent intents
            if (context.previousIntents.length > this.config.maxContextSize) {
                context.previousIntents = context.previousIntents.slice(-this.config.maxContextSize);
            }
        }

        context.entities.push(...entities);
        context.timestamp = new Date();

        this.contextCache.set(context.sessionId, context);
    }

    private calculateContextBoost(intent: IntentType, context: ParseContext): number {
        let boost = 0;

        // Boost if similar intent was used recently
        for (const previousIntent of context.previousIntents.slice(-3)) {
            if (previousIntent.type === intent) {
                boost += 0.2;
            }
        }

        // Boost if relevant entities are present in context
        const relevantEntities = context.entities.filter((entity) => this.isEntityRelevantToIntent(entity, intent));
        boost += relevantEntities.length * 0.1;

        return Math.min(boost, 0.5); // Cap the boost
    }

    // ============================================================================
    // Private Methods - Core Message Generation
    // ============================================================================

    private async generateCoreMessage(intent: Intent, context: ParseContext): Promise<CoreMessage> {
        const messageId = this.generateMessageId();
        const timestamp = new Date().toISOString();

        // Create agent addresses
        const sender: AgentAddress = {
            id: 'nlp-parser',
            namespace: 'promethean',
            domain: 'agents',
            version: '1.0.0',
        };

        const recipient: AgentAddress = {
            id: 'command-executor',
            namespace: 'promethean',
            domain: 'agents',
            version: '1.0.0',
        };

        // Determine message type based on intent
        const messageType = this.mapIntentToMessageType(intent.type);

        // Determine priority based on intent and entities
        const priority = this.determinePriority(intent);

        // Create payload
        const payload = {
            type: 'command',
            data: {
                intent: intent.type,
                parameters: intent.parameters,
                entities: intent.entities,
                confidence: intent.confidence,
                context: {
                    userId: context.userId,
                    sessionId: context.sessionId,
                    timestamp: context.timestamp.toISOString(),
                },
            },
            encoding: 'json' as const,
        };

        return {
            id: messageId,
            version: '1.0.0',
            type: messageType,
            timestamp,
            sender,
            recipient,
            capabilities: this.determineRequiredCapabilities(intent),
            payload,
            metadata: {
                source: 'enhanced-nlp-parser',
                version: '1.0.0',
                language: this.config.language,
                locale: this.config.locale,
            },
            headers: {},
            priority,
            qos: QoSLevel.AT_LEAST_ONCE,
            traceId: this.generateTraceId(),
            spanId: this.generateSpanId(),
        };
    }

    private mapIntentToMessageType(intent: IntentType): MessageType {
        switch (intent) {
            case IntentType.QUERY:
            case IntentType.LIST:
            case IntentType.STATUS:
            case IntentType.HELP:
                return MessageType.REQUEST;

            case IntentType.START:
            case IntentType.STOP:
            case IntentType.RESTART:
            case IntentType.CREATE:
            case IntentType.DELETE:
            case IntentType.CONFIGURE:
            case IntentType.UPDATE:
            case IntentType.EXECUTE:
            case IntentType.DEPLOY:
            case IntentType.ROLLBACK:
                return MessageType.REQUEST;

            case IntentType.ALERT:
            case IntentType.ESCALATE:
                return MessageType.CRISIS_ALERT;

            case IntentType.SEND:
            case IntentType.BROADCAST:
            case IntentType.NOTIFY:
                return MessageType.EVENT;

            default:
                return MessageType.REQUEST;
        }
    }

    private determinePriority(intent: Intent): Priority {
        // Check for explicit priority in entities
        const priorityEntity = intent.entities.find((e) => e.type === EntityType.PRIORITY);
        if (priorityEntity) {
            switch (priorityEntity.value) {
                case 'critical':
                case 'urgent':
                    return Priority.CRITICAL;
                case 'high':
                    return Priority.HIGH;
                case 'low':
                    return Priority.LOW;
                default:
                    return Priority.NORMAL;
            }
        }

        // Determine priority based on intent type
        switch (intent.type) {
            case IntentType.ALERT:
            case IntentType.ESCALATE:
                return Priority.CRITICAL;
            case IntentType.STOP:
            case IntentType.DELETE:
            case IntentType.ROLLBACK:
                return Priority.HIGH;
            case IntentType.QUERY:
            case IntentType.LIST:
            case IntentType.STATUS:
            case IntentType.HELP:
                return Priority.LOW;
            default:
                return Priority.NORMAL;
        }
    }

    private determineRequiredCapabilities(intent: Intent): string[] {
        const capabilities = ['command.execute'];

        switch (intent.type) {
            case IntentType.START:
            case IntentType.STOP:
            case IntentType.RESTART:
                capabilities.push('lifecycle.manage');
                break;
            case IntentType.CREATE:
            case IntentType.DELETE:
                capabilities.push('resource.manage');
                break;
            case IntentType.CONFIGURE:
            case IntentType.UPDATE:
                capabilities.push('configuration.modify');
                break;
            case IntentType.ALERT:
            case IntentType.ESCALATE:
                capabilities.push('crisis.manage');
                break;
            case IntentType.QUERY:
            case IntentType.LIST:
            case IntentType.STATUS:
                capabilities.push('resource.read');
                break;
        }

        return capabilities;
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private initializeVocabulary(): void {
        // Initialize vocabulary for suggestions and auto-completion
        const vocabEntries: Array<[string, IntentType[]]> = [
            ['start', [IntentType.START]],
            ['stop', [IntentType.STOP]],
            ['restart', [IntentType.RESTART]],
            ['status', [IntentType.STATUS]],
            ['configure', [IntentType.CONFIGURE]],
            ['create', [IntentType.CREATE]],
            ['delete', [IntentType.DELETE]],
            ['query', [IntentType.QUERY]],
            ['help', [IntentType.HELP]],
            ['test', [IntentType.TEST]],
            ['send', [IntentType.SEND]],
            ['alert', [IntentType.ALERT]],
            ['execute', [IntentType.EXECUTE]],
            ['agent', [IntentType.START, IntentType.STOP, IntentType.STATUS]],
            ['service', [IntentType.START, IntentType.STOP, IntentType.STATUS]],
            ['workflow', [IntentType.START, IntentType.STOP, IntentType.STATUS]],
            ['system', [IntentType.STATUS, IntentType.QUERY]],
        ];

        for (const [term, intents] of vocabEntries) {
            this.vocabulary.set(term, intents);
        }
    }

    private preprocessInput(input: string): string {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s=:"]/g, ' ') // Keep special chars that might be meaningful
            .replace(/\s+/g, ' ')
            .trim();
    }

    private extractParametersFromEntities(entities: Entity[]): Record<string, any> {
        const parameters: Record<string, any> = {};

        for (const entity of entities) {
            if (entity.type === EntityType.PARAMETER && entity.metadata?.parameterValue) {
                parameters[entity.value] = entity.metadata.parameterValue;
            } else if (entity.type === EntityType.VALUE) {
                parameters.value = entity.value;
            } else if (entity.type === EntityType.TIME) {
                parameters.time = entity.value;
            } else if (entity.type === EntityType.PRIORITY) {
                parameters.priority = entity.value;
            }
        }

        return parameters;
    }

    private isEntityRelevantToIntent(entity: Entity, intent: IntentType): boolean {
        // Simple relevance mapping - can be made more sophisticated
        const relevanceMap: Record<IntentType, EntityType[]> = {
            [IntentType.START]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.STOP]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.STATUS]: [
                EntityType.TARGET_AGENT,
                EntityType.TARGET_SERVICE,
                EntityType.TARGET_WORKFLOW,
                EntityType.TARGET_SYSTEM,
            ],
            [IntentType.CONFIGURE]: [
                EntityType.TARGET_AGENT,
                EntityType.TARGET_SERVICE,
                EntityType.TARGET_WORKFLOW,
                EntityType.PARAMETER,
            ],
            [IntentType.CREATE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.DELETE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.QUERY]: [
                EntityType.TARGET_AGENT,
                EntityType.TARGET_SERVICE,
                EntityType.TARGET_WORKFLOW,
                EntityType.TARGET_SYSTEM,
            ],
            [IntentType.HELP]: [],
            [IntentType.TEST]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.SEND]: [EntityType.TARGET_AGENT, EntityType.USER],
            [IntentType.ALERT]: [EntityType.TARGET_AGENT, EntityType.TARGET_SYSTEM],
            [IntentType.EXECUTE]: [EntityType.TARGET_WORKFLOW, EntityType.TASK],
            [IntentType.RESTART]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.UPDATE]: [
                EntityType.TARGET_AGENT,
                EntityType.TARGET_SERVICE,
                EntityType.TARGET_WORKFLOW,
                EntityType.PARAMETER,
            ],
            [IntentType.MODIFY]: [
                EntityType.TARGET_AGENT,
                EntityType.TARGET_SERVICE,
                EntityType.TARGET_WORKFLOW,
                EntityType.PARAMETER,
            ],
            [IntentType.REMOVE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.LIST]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.SEARCH]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.FIND]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.SHOW]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.GET]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.EXPLAIN]: [],
            [IntentType.DESCRIBE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.VALIDATE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.VERIFY]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.CHECK]: [EntityType.TARGET_AGENT, EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.BROADCAST]: [EntityType.TARGET_AGENT, EntityType.USER],
            [IntentType.NOTIFY]: [EntityType.TARGET_AGENT, EntityType.USER],
            [IntentType.ESCALATE]: [EntityType.TARGET_AGENT, EntityType.TARGET_SYSTEM],
            [IntentType.RESOLVE]: [EntityType.TASK],
            [IntentType.RUN]: [EntityType.TARGET_WORKFLOW, EntityType.TASK],
            [IntentType.PERFORM]: [EntityType.TASK],
            [IntentType.CARRY_OUT]: [EntityType.TASK],
            [IntentType.IMPLEMENT]: [EntityType.TASK],
            [IntentType.DEPLOY]: [EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
            [IntentType.ROLLBACK]: [EntityType.TARGET_SERVICE, EntityType.TARGET_WORKFLOW],
        };

        const relevantTypes = relevanceMap[intent] || [];
        return relevantTypes.includes(entity.type);
    }

    private resolveEntityConflicts(entities: Entity[]): Entity[] {
        // Sort by confidence and start index
        const sorted = [...entities].sort((a, b) => {
            if (a.confidence !== b.confidence) {
                return b.confidence - a.confidence;
            }
            return a.startIndex - b.startIndex;
        });

        const resolved: Entity[] = [];

        for (const entity of sorted) {
            const hasOverlap = resolved.some(
                (existing) => entity.startIndex < existing.endIndex && entity.endIndex > existing.startIndex,
            );

            if (!hasOverlap) {
                resolved.push(entity);
            }
        }

        return resolved;
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const words1 = str1.split(' ').filter((w) => w.length > 0);
        const words2 = str2.split(' ').filter((w) => w.length > 0);
        const intersection = words1.filter((word) => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        return intersection.length / union.length;
    }

    private async generateClarificationQuestions(intent: Intent, entities: Entity[]): Promise<string[]> {
        const questions: string[] = [];

        // Check for missing target
        const hasTarget = entities.some(
            (e) =>
                e.type === EntityType.TARGET_AGENT ||
                e.type === EntityType.TARGET_SERVICE ||
                e.type === EntityType.TARGET_WORKFLOW,
        );

        if (!hasTarget) {
            questions.push(`What ${intent.type} would you like to ${intent.type}? (agent, service, or workflow)`);
        }

        // Check for missing parameters
        if (intent.type === IntentType.CONFIGURE || intent.type === IntentType.UPDATE) {
            const hasParameters = entities.some((e) => e.type === EntityType.PARAMETER);
            if (!hasParameters) {
                questions.push('What parameters would you like to configure?');
            }
        }

        return questions;
    }

    private async generateSuggestions(input: string, intent?: Intent): Promise<string[]> {
        const suggestions: string[] = [];

        // Generate suggestions based on intent
        if (intent) {
            switch (intent.type) {
                case IntentType.START:
                    suggestions.push('start agent monitoring', 'start service api', 'start workflow backup');
                    break;
                case IntentType.STOP:
                    suggestions.push('stop agent monitoring', 'stop service api', 'stop workflow backup');
                    break;
                case IntentType.STATUS:
                    suggestions.push('status all', 'status agent monitoring', 'check service health');
                    break;
                case IntentType.CONFIGURE:
                    suggestions.push('configure agent memory=512MB', 'configure service timeout=30s');
                    break;
                case IntentType.HELP:
                    suggestions.push('help start', 'help configure', 'help status');
                    break;
            }
        }

        // Add vocabulary-based suggestions
        const vocabSuggestions = await this.getSuggestions(input, 3);
        suggestions.push(...vocabSuggestions);

        return [...new Set(suggestions)]; // Remove duplicates
    }

    private generateExampleFromIntent(intent: IntentType, term: string): string {
        const examples: Record<IntentType, string> = {
            [IntentType.START]: `start agent ${term}`,
            [IntentType.STOP]: `stop agent ${term}`,
            [IntentType.STATUS]: `status agent ${term}`,
            [IntentType.CONFIGURE]: `configure agent ${term}`,
            [IntentType.CREATE]: `create agent ${term}`,
            [IntentType.DELETE]: `delete agent ${term}`,
            [IntentType.QUERY]: `query agent ${term}`,
            [IntentType.HELP]: `help ${term}`,
            [IntentType.TEST]: `test agent ${term}`,
            [IntentType.SEND]: `send message to ${term}`,
            [IntentType.ALERT]: `alert about ${term}`,
            [IntentType.EXECUTE]: `execute ${term}`,
            [IntentType.RESTART]: `restart agent ${term}`,
            [IntentType.UPDATE]: `update agent ${term}`,
            [IntentType.MODIFY]: `modify agent ${term}`,
            [IntentType.REMOVE]: `remove agent ${term}`,
            [IntentType.LIST]: `list agents`,
            [IntentType.SEARCH]: `search for ${term}`,
            [IntentType.FIND]: `find agent ${term}`,
            [IntentType.SHOW]: `show agent ${term}`,
            [IntentType.GET]: `get agent ${term}`,
            [IntentType.EXPLAIN]: `explain ${term}`,
            [IntentType.DESCRIBE]: `describe agent ${term}`,
            [IntentType.VALIDATE]: `validate agent ${term}`,
            [IntentType.VERIFY]: `verify agent ${term}`,
            [IntentType.CHECK]: `check agent ${term}`,
            [IntentType.BROADCAST]: `broadcast to ${term}`,
            [IntentType.NOTIFY]: `notify ${term}`,
            [IntentType.ESCALATE]: `escalate ${term}`,
            [IntentType.RESOLVE]: `resolve ${term}`,
            [IntentType.RUN]: `run ${term}`,
            [IntentType.PERFORM]: `perform ${term}`,
            [IntentType.CARRY_OUT]: `carry out ${term}`,
            [IntentType.IMPLEMENT]: `implement ${term}`,
            [IntentType.DEPLOY]: `deploy ${term}`,
            [IntentType.ROLLBACK]: `rollback ${term}`,
        };

        return examples[intent] || `${intent} ${term}`;
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    private generateTraceId(): string {
        return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    private generateSpanId(): string {
        return `span_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createEnhancedParser(config?: Partial<EnhancedParserConfig>): EnhancedNaturalLanguageParser {
    return new EnhancedNaturalLanguageParser(config);
}

// ============================================================================
// Exports
// ============================================================================

export { EnhancedNaturalLanguageParser as default };
