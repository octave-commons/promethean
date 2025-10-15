import { z } from 'zod';

// Message types for the Agent OS
export enum MessageType {
    REQUEST = 'request',
    RESPONSE = 'response',
    ERROR = 'error',
    NOTIFICATION = 'notification',
    COMMAND = 'command',
    EVENT = 'event',
}

// Command type definition
export type CommandType =
    | 'start'
    | 'stop'
    | 'status'
    | 'configure'
    | 'create'
    | 'delete'
    | 'update'
    | 'query'
    | 'help'
    | 'test';

/**
 * Natural Language Command Parser for Agent OS
 *
 * Parses natural language input into structured commands that can be
 * executed within the Agent OS ecosystem.
 */

export const CommandSchema = z.object({
    id: z.string(),
    type: z.enum(['start', 'stop', 'status', 'configure', 'create', 'delete', 'update', 'query', 'help', 'test']),
    target: z.string(), // What the command operates on (agent, service, workflow, etc.)
    parameters: z.record(z.any()).optional(),
    context: z
        .object({
            confidence: z.number().min(0).max(1),
            alternatives: z.array(z.any()).optional(),
            requiresClarification: z.boolean().default(false),
            clarificationQuestion: z.string().optional(),
        })
        .optional(),
});

export const ParseResultSchema = z.object({
    success: z.boolean(),
    command: CommandSchema.optional(),
    error: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
});

export type Command = z.infer<typeof CommandSchema>;
export type ParseResult = z.infer<typeof ParseResultSchema>;

export interface CommandParser {
    /**
     * Parse natural language input into a structured command
     */
    parse(input: string): Promise<ParseResult>;

    /**
     * Get supported command types and their schemas
     */
    getSupportedCommands(): Record<string, any>;

    /**
     * Register a new command type
     */
    registerCommand(type: string, schema: any, examples: string[]): void;

    /**
     * Get suggestions for ambiguous input
     */
    getSuggestions(input: string): Promise<string[]>;
}

export interface CommandExecutor {
    /**
     * Execute a parsed command
     */
    execute(command: Command): Promise<any>;

    /**
     * Check if a command can be executed
     */
    canExecute(command: Command): boolean;

    /**
     * Get execution history for a target
     */
    getHistory(target: string, limit?: number): Promise<any[]>;
}

export interface NLPConfig {
    language: string;
    confidence: number;
    enableContext: boolean;
    enableLearning: boolean;
    maxAlternatives: number;
    timeout: number;
}

export class NaturalLanguageCommandParser implements CommandParser {
    private commands: Map<string, any> = new Map();
    private config: NLPConfig;

    constructor(config: Partial<NLPConfig> = {}) {
        this.config = {
            language: 'en',
            confidence: 0.7,
            enableContext: true,
            enableLearning: false,
            maxAlternatives: 3,
            timeout: 5000,
            ...config,
        };

        this.initializeBuiltinCommands();
    }

    async parse(input: string): Promise<ParseResult> {
        try {
            const normalizedInput = this.normalizeInput(input);
            const commandType = this.extractCommandType(normalizedInput);
            const target = this.extractTarget(normalizedInput);
            const parameters = this.extractParameters(normalizedInput);

            if (!commandType) {
                return {
                    success: false,
                    error: 'Could not determine command type',
                    suggestions: await this.getSuggestions(input),
                };
            }

            const command: Command = {
                id: this.generateCommandId(),
                type: commandType as CommandType,
                target,
                parameters,
                context: {
                    confidence: this.calculateConfidence(normalizedInput),
                    requiresClarification: false,
                },
            };

            // Validate command against schema
            const validation = CommandSchema.safeParse(command);
            if (!validation.success) {
                return {
                    success: false,
                    error: `Invalid command structure: ${validation.error.message}`,
                    suggestions: await this.getSuggestions(input),
                };
            }

            return {
                success: true,
                command: validation.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown parsing error',
                suggestions: await this.getSuggestions(input),
            };
        }
    }

    getSupportedCommands(): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [type, config] of this.commands) {
            result[type] = {
                description: config.description,
                parameters: config.parameters,
                examples: config.examples,
            };
        }
        return result;
    }

    registerCommand(type: string, schema: any, examples: string[]): void {
        this.commands.set(type, { schema, examples, description: schema.description });
    }

    async getSuggestions(input: string): Promise<string[]> {
        const normalizedInput = this.normalizeInput(input);
        const suggestions: string[] = [];

        // Simple keyword matching for now
        for (const [type, config] of this.commands) {
            for (const example of config.examples) {
                if (this.calculateSimilarity(normalizedInput, example) > 0.5) {
                    suggestions.push(example);
                }
            }
        }

        return suggestions.slice(0, this.config.maxAlternatives);
    }

    private normalizeInput(input: string): string {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    private extractCommandType(input: string): string | null {
        const commandPatterns = {
            start: ['start', 'begin', 'launch', 'run', 'execute', 'activate'],
            stop: ['stop', 'end', 'terminate', 'kill', 'shutdown', 'deactivate'],
            status: ['status', 'state', 'info', 'information', 'details', 'check'],
            configure: ['configure', 'config', 'setup', 'settings', 'adjust', 'modify'],
            create: ['create', 'make', 'new', 'add', 'generate', 'build'],
            delete: ['delete', 'remove', 'del', 'rm', 'destroy', 'eliminate'],
            update: ['update', 'modify', 'change', 'edit', 'alter', 'refresh'],
            query: ['query', 'search', 'find', 'list', 'show', 'get'],
            help: ['help', 'assist', 'guide', 'instructions', 'howto', 'usage'],
            test: ['test', 'testing', 'validate', 'verify', 'check'],
        };

        for (const [command, keywords] of Object.entries(commandPatterns)) {
            for (const keyword of keywords) {
                if (input.includes(keyword)) {
                    return command;
                }
            }
        }

        return null;
    }

    private extractTarget(input: string): string {
        // Simple extraction - look for nouns after command verbs
        const words = input.split(' ');
        const commandIndex = words.findIndex((word) =>
            ['start', 'stop', 'status', 'configure', 'create', 'delete', 'update', 'query', 'help', 'test'].includes(
                word,
            ),
        );

        if (commandIndex >= 0 && commandIndex < words.length - 1) {
            return words[commandIndex + 1];
        }

        return 'unknown';
    }

    private extractParameters(input: string): Record<string, any> {
        const parameters: Record<string, any> = {};

        // Extract key-value pairs like "name=agent1" or "port 3000"
        const kvPattern = /(\w+)[\s=]+(\w+)/g;
        let match;
        while ((match = kvPattern.exec(input)) !== null) {
            parameters[match[1]] = match[2];
        }

        return parameters;
    }

    private calculateConfidence(input: string): number {
        // Simple confidence calculation based on keyword matches
        const knownKeywords = [
            'start',
            'stop',
            'status',
            'configure',
            'create',
            'delete',
            'update',
            'query',
            'help',
            'agent',
            'service',
            'workflow',
            'task',
            'process',
            'system',
        ];

        const words = input.split(' ');
        const matches = words.filter((word) => knownKeywords.includes(word)).length;
        return Math.min(matches / words.length, 1);
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const words1 = str1.split(' ');
        const words2 = str2.split(' ');
        const intersection = words1.filter((word) => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        return intersection.length / union.length;
    }

    private generateCommandId(): string {
        return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private initializeBuiltinCommands(): void {
        // Start command
        this.registerCommand(
            'start',
            {
                description: 'Start an agent, service, or workflow',
                parameters: {
                    target: 'string',
                    options: 'object',
                },
                examples: [
                    'start agent agent1',
                    'start service monitoring',
                    'launch workflow backup',
                    'run agent with name=agent1',
                ],
            },
            ['start agent agent1', 'start service monitoring', 'launch workflow backup'],
        );

        // Stop command
        this.registerCommand(
            'stop',
            {
                description: 'Stop an agent, service, or workflow',
                parameters: {
                    target: 'string',
                    force: 'boolean',
                },
                examples: [
                    'stop agent agent1',
                    'shutdown service monitoring',
                    'terminate workflow backup',
                    'kill agent agent1 force=true',
                ],
            },
            ['stop agent agent1', 'shutdown service monitoring', 'terminate workflow backup'],
        );

        // Status command
        this.registerCommand(
            'status',
            {
                description: 'Get status of an agent, service, or workflow',
                parameters: {
                    target: 'string',
                    detailed: 'boolean',
                },
                examples: [
                    'status agent agent1',
                    'check service monitoring',
                    'info workflow backup',
                    'get status of agent agent1',
                ],
            },
            ['status agent agent1', 'check service monitoring', 'info workflow backup'],
        );

        // Help command
        this.registerCommand(
            'help',
            {
                description: 'Get help and usage information',
                parameters: {
                    topic: 'string',
                },
                examples: ['help', 'help start', 'how to start an agent', 'usage of status command'],
            },
            ['help', 'help start', 'how to start an agent'],
        );
    }
}
