import test from 'ava';

import { AgentOSCommandExecutor } from '../executor.js';
import { Command, MessageType } from '../parser.js';

// Mock implementations for testing
class MockAgentRuntime {
    private agents: Map<string, any> = new Map();

    async startAgent(name: string, config?: any): Promise<any> {
        this.agents.set(name, { name, status: 'running', config });
        return { name, status: 'running', config };
    }

    async stopAgent(name: string): Promise<any> {
        const agent = this.agents.get(name);
        if (agent) {
            agent.status = 'stopped';
            return { name, status: 'stopped' };
        }
        throw new Error(`Agent ${name} not found`);
    }

    async getAgentStatus(name: string): Promise<any> {
        const agent = this.agents.get(name);
        if (agent) {
            return agent;
        }
        throw new Error(`Agent ${name} not found`);
    }

    async listAgents(): Promise<any[]> {
        return Array.from(this.agents.values());
    }

    async configureAgent(name: string, config: any): Promise<any> {
        const agent = this.agents.get(name);
        if (agent) {
            agent.config = { ...agent.config, ...config };
            return agent;
        }
        throw new Error(`Agent ${name} not found`);
    }
}

class MockServiceManager {
    private services: Map<string, any> = new Map();

    async startService(name: string, config?: any): Promise<any> {
        this.services.set(name, { name, status: 'running', config });
        return { name, status: 'running', config };
    }

    async stopService(name: string): Promise<any> {
        const service = this.services.get(name);
        if (service) {
            service.status = 'stopped';
            return { name, status: 'stopped' };
        }
        throw new Error(`Service ${name} not found`);
    }

    async getServiceStatus(name: string): Promise<any> {
        const service = this.services.get(name);
        if (service) {
            return service;
        }
        throw new Error(`Service ${name} not found`);
    }

    async listServices(): Promise<any[]> {
        return Array.from(this.services.values());
    }

    async configureService(name: string, config: any): Promise<any> {
        const service = this.services.get(name);
        if (service) {
            service.config = { ...service.config, ...config };
            return service;
        }
        throw new Error(`Service ${name} not found`);
    }
}

class MockWorkflowManager {
    private workflows: Map<string, any> = new Map();

    async startWorkflow(name: string, config?: any): Promise<any> {
        this.workflows.set(name, { name, status: 'running', config });
        return { name, status: 'running', config };
    }

    async stopWorkflow(name: string): Promise<any> {
        const workflow = this.workflows.get(name);
        if (workflow) {
            workflow.status = 'stopped';
            return { name, status: 'stopped' };
        }
        throw new Error(`Workflow ${name} not found`);
    }

    async getWorkflowStatus(name: string): Promise<any> {
        const workflow = this.workflows.get(name);
        if (workflow) {
            return workflow;
        }
        throw new Error(`Workflow ${name} not found`);
    }

    async listWorkflows(): Promise<any[]> {
        return Array.from(this.workflows.values());
    }

    async configureWorkflow(name: string, config: any): Promise<any> {
        const workflow = this.workflows.get(name);
        if (workflow) {
            workflow.config = { ...workflow.config, ...config };
            return workflow;
        }
        throw new Error(`Workflow ${name} not found`);
    }
}

const mockAgentRuntime = new MockAgentRuntime();
const mockServiceManager = new MockServiceManager();
const mockWorkflowManager = new MockWorkflowManager();
const executor = new AgentOSCommandExecutor(
    mockAgentRuntime as any,
    mockServiceManager as any,
    mockWorkflowManager as any,
);

function createCommand(type: string, target: string, parameters?: any): Command {
    return {
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type as any,
        target,
        parameters: parameters || {},
        context: {
            confidence: 0.9,
            requiresClarification: false,
        },
    };
}

test('executor initialization', (t) => {
    t.truthy(executor);
    t.is(typeof executor.execute, 'function');
    t.is(typeof executor.canExecute, 'function');
    t.is(typeof executor.getHistory, 'function');
});

test('execute start agent command', async (t) => {
    const command = createCommand('start', 'agent agent1', { name: 'agent1' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.is(result.sender, 'command-executor');
    t.truthy(result.payload.success);
    t.truthy(result.payload.result);
    t.is(result.payload.result.name, 'agent1');
    t.is(result.payload.result.status, 'running');
});

test('execute start service command', async (t) => {
    const command = createCommand('start', 'service monitoring', { interval: '30s' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.truthy(result.payload.result);
    t.is(result.payload.result.name, 'monitoring');
    t.is(result.payload.result.status, 'running');
});

test('execute start workflow command', async (t) => {
    const command = createCommand('start', 'workflow backup', { schedule: 'daily' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.truthy(result.payload.result);
    t.is(result.payload.result.name, 'backup');
    t.is(result.payload.result.status, 'running');
});

test('execute stop agent command', async (t) => {
    // First start an agent
    await executor.execute(createCommand('start', 'agent agent1'));

    // Then stop it
    const command = createCommand('stop', 'agent agent1');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.is(result.payload.result.status, 'stopped');
});

test('execute status command for specific target', async (t) => {
    // Start an agent first
    await executor.execute(createCommand('start', 'agent agent1'));

    const command = createCommand('status', 'agent agent1');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.is(result.payload.result.name, 'agent1');
    t.is(result.payload.result.status, 'running');
});

test('execute status command for all targets', async (t) => {
    const command = createCommand('status', 'all');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.truthy(result.payload.result.agents);
    t.truthy(result.payload.result.services);
    t.truthy(result.payload.result.workflows);
});

test('execute configure command', async (t) => {
    // Start an agent first
    await executor.execute(createCommand('start', 'agent agent1'));

    const command = createCommand('configure', 'agent agent1', { memory: '512MB' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.is(result.payload.result.config.memory, '512MB');
});

test('execute create command', async (t) => {
    const command = createCommand('create', 'agent agent2', { memory: '1GB' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.is(result.payload.result.name, 'agent2');
    t.is(result.payload.result.status, 'running');
    t.true(result.payload.result.config.create);
});

test('execute delete command', async (t) => {
    // Start an agent first
    await executor.execute(createCommand('start', 'agent agent1'));

    const command = createCommand('delete', 'agent agent1');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.true(result.payload.result.deleted);
    t.is(result.payload.result.target, 'agent1');
});

test('execute update command', async (t) => {
    // Start an agent first
    await executor.execute(createCommand('start', 'agent agent1'));

    const command = createCommand('update', 'agent agent1', { memory: '2GB' });
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.is(result.payload.result.config.memory, '2GB');
});

test('execute query command', async (t) => {
    const command = createCommand('query', 'agent');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.true(Array.isArray(result.payload.result));
});

test('execute help command', async (t) => {
    const command = createCommand('help', 'unknown');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.truthy(result.payload.result.availableCommands);
    t.truthy(result.payload.result.usage);
});

test('execute help command for specific command', async (t) => {
    const command = createCommand('help', 'start');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.RESPONSE);
    t.truthy(result.payload.success);
    t.truthy(result.payload.result.description);
    t.truthy(result.payload.result.usage);
    t.true(Array.isArray(result.payload.result.examples));
});

test('handle execution errors', async (t) => {
    const command = createCommand('stop', 'agent nonexistent');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.ERROR);
    t.false(result.payload.success);
    t.truthy(result.payload.error);
    t.true(result.payload.error.includes('not found'));
});

test('canExecute check', (t) => {
    const command = createCommand('start', 'agent agent1');
    t.true(executor.canExecute(command));
});

test('execution history tracking', async (t) => {
    const command = createCommand('start', 'agent agent1');

    // Execute command
    await executor.execute(command);

    // Check history
    const history = await executor.getHistory('agent1');
    t.true(history.length > 0);
    t.is(history[0]?.sender, 'command-executor');
});

test('execution history limit', async (t) => {
    const command = createCommand('start', 'agent agent1');

    // Execute multiple commands
    for (let i = 0; i < 5; i++) {
        await executor.execute(command);
    }

    // Check history with limit
    const history = await executor.getHistory('agent1', 3);
    t.is(history.length, 3);
});

test('message structure validation', async (t) => {
    const command = createCommand('start', 'agent agent1');
    const result = await executor.execute(command);

    // Check message structure
    t.truthy(result.id);
    t.truthy(result.type);
    t.truthy(result.timestamp);
    t.truthy(result.sender);
    t.truthy(result.receiver);
    t.truthy(result.payload);
    t.truthy(result.metadata);

    // Check payload structure
    t.truthy(result.payload.command);
    t.truthy(result.payload.result);
    t.truthy(result.payload.success);
    t.truthy(result.payload.duration);
    t.truthy(result.payload.context);

    // Check metadata
    t.truthy(result.metadata.executionTime);
    t.truthy(result.metadata.commandType);
    t.truthy(result.metadata.target);
});

test('execution duration tracking', async (t) => {
    const command = createCommand('start', 'agent agent1');
    const startTime = Date.now();

    const result = await executor.execute(command);
    const endTime = Date.now();

    t.true(result.payload.duration >= 0);
    t.true(result.payload.duration <= endTime - startTime + 10); // Allow small margin
});

test('context handling', async (t) => {
    const command = createCommand('start', 'agent agent1');
    const context = {
        userId: 'test-user',
        sessionId: 'test-session',
        timestamp: new Date(),
        permissions: ['read', 'write'],
        metadata: { test: true },
    };

    const result = await executor.execute(command, context);

    t.is(result.receiver, 'test-user');
    t.is(result.payload.context.sessionId, 'test-session');
});

test('unsupported command type', async (t) => {
    const command = createCommand('unsupported', 'agent agent1');
    const result = await executor.execute(command);

    t.is(result.type, MessageType.ERROR);
    t.false(result.payload.success);
    t.true(result.payload.error.includes('Unsupported command type'));
});
