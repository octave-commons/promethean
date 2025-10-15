import { MessageType } from './parser.js';
import { Command, CommandExecutor } from './parser.js';

// Simple MessageEnvelope interface for internal use
interface MessageEnvelope {
    id: string;
    type: MessageType;
    timestamp: Date;
    sender: string;
    receiver: string;
    payload: any;
    metadata?: any;
}

/**
 * Command Executor for Agent OS
 *
 * Executes parsed commands within the Agent OS ecosystem by interfacing
 * with the runtime system and generating appropriate message envelopes.
 */

export interface ExecutionContext {
    userId: string;
    sessionId: string;
    timestamp: Date;
    permissions: string[];
    metadata: Record<string, any>;
}

export interface ExecutionResult {
    success: boolean;
    message: MessageEnvelope;
    error?: string;
    duration: number;
}

export interface AgentRuntime {
    startAgent(name: string, config?: any): Promise<any>;
    stopAgent(name: string): Promise<any>;
    getAgentStatus(name: string): Promise<any>;
    listAgents(): Promise<any[]>;
    configureAgent(name: string, config: any): Promise<any>;
}

export interface ServiceManager {
    startService(name: string, config?: any): Promise<any>;
    stopService(name: string): Promise<any>;
    getServiceStatus(name: string): Promise<any>;
    listServices(): Promise<any[]>;
    configureService(name: string, config: any): Promise<any>;
}

export interface WorkflowManager {
    startWorkflow(name: string, config?: any): Promise<any>;
    stopWorkflow(name: string): Promise<any>;
    getWorkflowStatus(name: string): Promise<any>;
    listWorkflows(): Promise<any[]>;
    configureWorkflow(name: string, config: any): Promise<any>;
}

export class AgentOSCommandExecutor implements CommandExecutor {
    private agentRuntime: AgentRuntime;
    private serviceManager: ServiceManager;
    private workflowManager: WorkflowManager;
    private executionHistory: Map<string, MessageEnvelope[]> = new Map();

    constructor(agentRuntime: AgentRuntime, serviceManager: ServiceManager, workflowManager: WorkflowManager) {
        this.agentRuntime = agentRuntime;
        this.serviceManager = serviceManager;
        this.workflowManager = workflowManager;
    }

    async execute(command: Command, context?: ExecutionContext): Promise<MessageEnvelope> {
        const startTime = Date.now();
        const executionContext = context || this.createDefaultContext();

        try {
            let result: any;

            switch (command.type) {
                case 'start':
                    result = await this.executeStart(command, executionContext);
                    break;
                case 'stop':
                    result = await this.executeStop(command, executionContext);
                    break;
                case 'status':
                    result = await this.executeStatus(command, executionContext);
                    break;
                case 'configure':
                    result = await this.executeConfigure(command, executionContext);
                    break;
                case 'create':
                    result = await this.executeCreate(command, executionContext);
                    break;
                case 'delete':
                    result = await this.executeDelete(command, executionContext);
                    break;
                case 'update':
                    result = await this.executeUpdate(command, executionContext);
                    break;
                case 'query':
                    result = await this.executeQuery(command, executionContext);
                    break;
                case 'help':
                    result = await this.executeHelp(command, executionContext);
                    break;
                default:
                    throw new Error(`Unsupported command type: ${command.type}`);
            }

            const duration = Date.now() - startTime;
            const message = this.createSuccessMessage(command, result, executionContext, duration);

            // Store in execution history
            this.addToHistory(command.target, message);

            return message;
        } catch (error) {
            const duration = Date.now() - startTime;
            const message = this.createErrorMessage(command, error, executionContext, duration);

            // Store in execution history
            this.addToHistory(command.target, message);

            return message;
        }
    }

    canExecute(_command: Command): boolean {
        // Check if the user has permissions for this command type
        // For now, assume all commands are executable
        return true;
    }

    async getHistory(target: string, limit: number = 10): Promise<MessageEnvelope[]> {
        const history = this.executionHistory.get(target) || [];
        return history.slice(-limit);
    }

    private async executeStart(command: Command, _context: ExecutionContext): Promise<any> {
        const { target, parameters } = command;

        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.startAgent(target, parameters);
            case 'service':
                return await this.serviceManager.startService(target, parameters);
            case 'workflow':
                return await this.workflowManager.startWorkflow(target, parameters);
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeStop(command: Command, _context: ExecutionContext): Promise<any> {
        const { target } = command;

        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.stopAgent(target);
            case 'service':
                return await this.serviceManager.stopService(target);
            case 'workflow':
                return await this.workflowManager.stopWorkflow(target);
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeStatus(command: Command, _context: ExecutionContext): Promise<any> {
        const { target } = command;

        if (target === 'all' || target === 'system') {
            return {
                agents: await this.agentRuntime.listAgents(),
                services: await this.serviceManager.listServices(),
                workflows: await this.workflowManager.listWorkflows(),
            };
        }

        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.getAgentStatus(target);
            case 'service':
                return await this.serviceManager.getServiceStatus(target);
            case 'workflow':
                return await this.workflowManager.getWorkflowStatus(target);
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeConfigure(command: Command, _context: ExecutionContext): Promise<any> {
        const { target, parameters } = command;

        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.configureAgent(target, parameters);
            case 'service':
                return await this.serviceManager.configureService(target, parameters);
            case 'workflow':
                return await this.workflowManager.configureWorkflow(target, parameters);
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeCreate(command: Command, _context: ExecutionContext): Promise<any> {
        const { target, parameters } = command;

        // Create is similar to start but with additional setup
        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.startAgent(target, { ...parameters, create: true });
            case 'service':
                return await this.serviceManager.startService(target, { ...parameters, create: true });
            case 'workflow':
                return await this.workflowManager.startWorkflow(target, { ...parameters, create: true });
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeDelete(command: Command, _context: ExecutionContext): Promise<any> {
        const { target } = command;

        // First stop, then delete
        await this.executeStop(command, _context);

        switch (this.determineTargetType(target)) {
            case 'agent':
                return { deleted: true, target };
            case 'service':
                return { deleted: true, target };
            case 'workflow':
                return { deleted: true, target };
            default:
                throw new Error(`Unknown target type: ${target}`);
        }
    }

    private async executeUpdate(command: Command, _context: ExecutionContext): Promise<any> {
        // Update is similar to configure
        return await this.executeConfigure(command, _context);
    }

    private async executeQuery(command: Command, _context: ExecutionContext): Promise<any> {
        const { target } = command;

        switch (this.determineTargetType(target)) {
            case 'agent':
                return await this.agentRuntime.listAgents();
            case 'service':
                return await this.serviceManager.listServices();
            case 'workflow':
                return await this.workflowManager.listWorkflows();
            default:
                // Generic query
                return {
                    query: target,
                    parameters: command.parameters,
                    results: [],
                };
        }
    }

    private async executeHelp(command: Command, _context: ExecutionContext): Promise<any> {
        const { target } = command;

        const helpContent = {
            start: {
                description: 'Start an agent, service, or workflow',
                usage: 'start <target> [options]',
                examples: ['start agent agent1', 'start service monitoring', 'start workflow backup'],
            },
            stop: {
                description: 'Stop an agent, service, or workflow',
                usage: 'stop <target> [options]',
                examples: ['stop agent agent1', 'stop service monitoring', 'stop workflow backup'],
            },
            status: {
                description: 'Get status of an agent, service, or workflow',
                usage: 'status <target> [options]',
                examples: ['status agent agent1', 'status service monitoring', 'status all'],
            },
            configure: {
                description: 'Configure an agent, service, or workflow',
                usage: 'configure <target> <parameters>',
                examples: ['configure agent agent1 memory=512MB', 'configure service monitoring interval=30s'],
            },
            help: {
                description: 'Get help and usage information',
                usage: 'help [command]',
                examples: ['help', 'help start', 'help status'],
            },
        };

        if (target && target !== 'unknown') {
            return helpContent[target as keyof typeof helpContent] || { error: 'Unknown command' };
        }

        return {
            availableCommands: Object.keys(helpContent),
            usage: 'Type "help <command>" for specific command information',
        };
    }

    private determineTargetType(target: string): string {
        // Simple heuristic to determine target type
        if (target.includes('agent')) return 'agent';
        if (target.includes('service')) return 'service';
        if (target.includes('workflow')) return 'workflow';

        // Default to agent for unknown targets
        return 'agent';
    }

    private createDefaultContext(): ExecutionContext {
        return {
            userId: 'system',
            sessionId: `session_${Date.now()}`,
            timestamp: new Date(),
            permissions: ['read', 'write', 'execute'],
            metadata: {},
        };
    }

    private createSuccessMessage(
        command: Command,
        result: any,
        context: ExecutionContext,
        duration: number,
    ): MessageEnvelope {
        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: MessageType.RESPONSE,
            timestamp: new Date(),
            sender: 'command-executor',
            receiver: context.userId,
            payload: {
                command,
                result,
                success: true,
                duration,
                context: {
                    sessionId: context.sessionId,
                    timestamp: context.timestamp,
                },
            },
            metadata: {
                executionTime: duration,
                commandType: command.type,
                target: command.target,
            },
        };
    }

    private createErrorMessage(
        command: Command,
        error: any,
        context: ExecutionContext,
        duration: number,
    ): MessageEnvelope {
        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: MessageType.ERROR,
            timestamp: new Date(),
            sender: 'command-executor',
            receiver: context.userId,
            payload: {
                command,
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
                duration,
                context: {
                    sessionId: context.sessionId,
                    timestamp: context.timestamp,
                },
            },
            metadata: {
                executionTime: duration,
                commandType: command.type,
                target: command.target,
                errorType: error.constructor.name,
            },
        };
    }

    private addToHistory(target: string, message: MessageEnvelope): void {
        if (!this.executionHistory.has(target)) {
            this.executionHistory.set(target, []);
        }

        const history = this.executionHistory.get(target)!;
        history.push(message);

        // Keep only last 100 messages per target
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
    }
}
