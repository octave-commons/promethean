/**
 * Natural Language Processing Module for Agent OS
 *
 * This module provides natural language command parsing and execution
 * capabilities for the Agent OS ecosystem.
 */

import { NaturalLanguageCommandParser, type NLPConfig } from './parser.js';
import { AgentOSCommandExecutor, type ExecutionContext } from './executor.js';

export { NaturalLanguageCommandParser, type NLPConfig } from './parser.js';

export {
    AgentOSCommandExecutor,
    type ExecutionContext,
    type ExecutionResult,
    type AgentRuntime,
    type ServiceManager,
    type WorkflowManager,
} from './executor.js';

/**
 * Main NLP Service class that combines parsing and execution
 */
export class NLPService {
    private parser: NaturalLanguageCommandParser;
    private executor: AgentOSCommandExecutor;

    constructor(agentRuntime: any, serviceManager: any, workflowManager: any, config?: Partial<NLPConfig>) {
        this.parser = new NaturalLanguageCommandParser(config);
        this.executor = new AgentOSCommandExecutor(agentRuntime, serviceManager, workflowManager);
    }

    /**
     * Process natural language input and execute the resulting command
     */
    async processInput(input: string, context?: Partial<ExecutionContext>): Promise<any> {
        // Parse the natural language input
        const parseResult = await this.parser.parse(input);

        if (!parseResult.success) {
            return {
                success: false,
                error: parseResult.error,
                suggestions: parseResult.suggestions,
                phase: 'parsing',
            };
        }

        // Check if the command can be executed
        if (!this.executor.canExecute(parseResult.command!)) {
            return {
                success: false,
                error: 'Command cannot be executed with current permissions',
                command: parseResult.command,
                phase: 'validation',
            };
        }

        // Execute the command
        try {
            const result = await this.executor.execute(parseResult.command!, context as ExecutionContext);

            return {
                success: true,
                result,
                command: parseResult.command,
                phase: 'execution',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown execution error',
                command: parseResult.command,
                phase: 'execution',
            };
        }
    }

    /**
     * Get suggestions for the given input
     */
    async getSuggestions(input: string): Promise<string[]> {
        return await this.parser.getSuggestions(input);
    }

    /**
     * Get supported commands
     */
    getSupportedCommands(): Record<string, any> {
        return this.parser.getSupportedCommands();
    }

    /**
     * Register a new command type
     */
    registerCommand(type: string, schema: any, examples: string[]): void {
        this.parser.registerCommand(type, schema, examples);
    }

    /**
     * Get execution history for a target
     */
    async getHistory(target: string, limit?: number): Promise<any[]> {
        return await this.executor.getHistory(target, limit);
    }
}

/**
 * Factory function to create an NLP service with default implementations
 */
export function createNLPService(
    agentRuntime?: any,
    serviceManager?: any,
    workflowManager?: any,
    config?: Partial<NLPConfig>,
): NLPService {
    // Default mock implementations if not provided
    const defaultAgentRuntime = agentRuntime || {
        async startAgent(name: string, config?: any) {
            return { name, status: 'running', config };
        },
        async stopAgent(name: string) {
            return { name, status: 'stopped' };
        },
        async getAgentStatus(name: string) {
            return { name, status: 'running' };
        },
        async listAgents() {
            return [];
        },
        async configureAgent(name: string, config: any) {
            return { name, config };
        },
    };

    const defaultServiceManager = serviceManager || {
        async startService(name: string, config?: any) {
            return { name, status: 'running', config };
        },
        async stopService(name: string) {
            return { name, status: 'stopped' };
        },
        async getServiceStatus(name: string) {
            return { name, status: 'running' };
        },
        async listServices() {
            return [];
        },
        async configureService(name: string, config: any) {
            return { name, config };
        },
    };

    const defaultWorkflowManager = workflowManager || {
        async startWorkflow(name: string, config?: any) {
            return { name, status: 'running', config };
        },
        async stopWorkflow(name: string) {
            return { name, status: 'stopped' };
        },
        async getWorkflowStatus(name: string) {
            return { name, status: 'running' };
        },
        async listWorkflows() {
            return [];
        },
        async configureWorkflow(name: string, config: any) {
            return { name, config };
        },
    };

    return new NLPService(defaultAgentRuntime, defaultServiceManager, defaultWorkflowManager, config);
}
