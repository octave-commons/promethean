import test from 'ava';
import { NLPService, createNLPService } from '../index.js';


// Mock implementations
const mockAgentRuntime = {
  agents: new Map(),
  async startAgent(name: string, config?: any) {
    this.agents.set(name, { name, status: 'running', config });
    return { name, status: 'running', config };
  },
  async stopAgent(name: string) {
    const agent = this.agents.get(name);
    if (agent) {
      agent.status = 'stopped';
      return { name, status: 'stopped' };
    }
    throw new Error(`Agent ${name} not found`);
  },
  async getAgentStatus(name: string) {
    const agent = this.agents.get(name);
    if (agent) return agent;
    throw new Error(`Agent ${name} not found`);
  },
  async listAgents() {
    return Array.from(this.agents.values());
  },
  async configureAgent(name: string, config: any) {
    const agent = this.agents.get(name);
    if (agent) {
      agent.config = { ...agent.config, ...config };
      return agent;
    }
    throw new Error(`Agent ${name} not found`);
  }
};

const mockServiceManager = {
  services: new Map(),
  async startService(name: string, config?: any) {
    this.services.set(name, { name, status: 'running', config });
    return { name, status: 'running', config };
  },
  async stopService(name: string) {
    const service = this.services.get(name);
    if (service) {
      service.status = 'stopped';
      return { name, status: 'stopped' };
    }
    throw new Error(`Service ${name} not found`);
  },
  async getServiceStatus(name: string) {
    const service = this.services.get(name);
    if (service) return service;
    throw new Error(`Service ${name} not found`);
  },
  async listServices() {
    return Array.from(this.services.values());
  },
  async configureService(name: string, config: any) {
    const service = this.services.get(name);
    if (service) {
      service.config = { ...service.config, ...config };
      return service;
    }
    throw new Error(`Service ${name} not found`);
  }
};

const mockWorkflowManager = {
  workflows: new Map(),
  async startWorkflow(name: string, config?: any) {
    this.workflows.set(name, { name, status: 'running', config });
    return { name, status: 'running', config };
  },
  async stopWorkflow(name: string) {
    const workflow = this.workflows.get(name);
    if (workflow) {
      workflow.status = 'stopped';
      return { name, status: 'stopped' };
    }
    throw new Error(`Workflow ${name} not found`);
  },
  async getWorkflowStatus(name: string) {
    const workflow = this.workflows.get(name);
    if (workflow) return workflow;
    throw new Error(`Workflow ${name} not found`);
  },
  async listWorkflows() {
    return Array.from(this.workflows.values());
  },
  async configureWorkflow(name: string, config: any) {
    const workflow = this.workflows.get(name);
    if (workflow) {
      workflow.config = { ...workflow.config, ...config };
      return workflow;
    }
    throw new Error(`Workflow ${name} not found`);
  }
};

test('NLPService initialization', (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  t.truthy(service);
  t.is(typeof service.processInput, 'function');
  t.is(typeof service.getSuggestions, 'function');
  t.is(typeof service.getSupportedCommands, 'function');
});

test('processInput - successful command execution', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const result = await service.processInput('start agent agent1');
  
  t.true(result.success);
  t.is(result.phase, 'execution');
  t.truthy(result.result);
  t.is(result.result.type, 'response');
  t.truthy(result.command);
  t.is(result.command.type, 'start');
  t.is(result.command.target, 'agent1');
});

test('processInput - parsing failure', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const result = await service.processInput('invalid command xyz');
  
  t.false(result.success);
  t.is(result.phase, 'parsing');
  t.truthy(result.error);
  t.truthy(result.suggestions);
});

test('processInput - execution failure', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const result = await service.processInput('stop agent nonexistent');
  
  t.false(result.success);
  t.is(result.phase, 'execution');
  t.truthy(result.error);
  t.truthy(result.command);
});

test('processInput with context', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const context = {
    userId: 'test-user',
    sessionId: 'test-session',
    timestamp: new Date(),
    permissions: ['read', 'write'],
    metadata: { test: true }
  };
  
  const result = await service.processInput('start agent agent1', context);
  
  t.true(result.success);
  t.is(result.result.receiver, 'test-user');
  t.is(result.result.payload.context.sessionId, 'test-session');
});

test('getSuggestions', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const suggestions = await service.getSuggestions('strt');
  
  t.true(Array.isArray(suggestions));
  t.true(suggestions.length > 0);
});

test('getSupportedCommands', (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const commands = service.getSupportedCommands();
  
  t.truthy(commands);
  t.truthy(commands.start);
  t.truthy(commands.stop);
  t.truthy(commands.status);
  t.truthy(commands.help);
});

test('registerCommand', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  service.registerCommand('test', {
    description: 'Test command',
    parameters: { target: 'string' }
  }, ['test target']);
  
  const commands = service.getSupportedCommands();
  t.truthy(commands.test);
  t.is(commands.test.description, 'Test command');
  
  const result = await service.processInput('test target');
  t.true(result.success);
  t.is(result.command.type, 'test');
});

test('getHistory', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  // Execute a command first
  await service.processInput('start agent agent1');
  
  const history = await service.getHistory('agent1');
  t.true(history.length > 0);
  t.is(history[0].sender, 'command-executor');
});

test('createNLPService with defaults', (t) => {
  const service = createNLPService();
  
  t.truthy(service);
  t.is(typeof service.processInput, 'function');
});

test('createNLPService with custom config', (t) => {
  const config = {
    language: 'en',
    confidence: 0.8,
    enableContext: true,
    enableLearning: false,
    maxAlternatives: 5,
    timeout: 10000
  };
  
  const service = createNLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager,
    config
  );
  
  t.truthy(service);
});

test('end-to-end workflow', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  // Start an agent
  const startResult = await service.processInput('start agent test-agent memory=512MB');
  t.true(startResult.success);
  t.is(startResult.command.type, 'start');
  t.is(startResult.command.parameters.memory, '512MB');
  
  // Check status
  const statusResult = await service.processInput('status agent test-agent');
  t.true(statusResult.success);
  t.is(statusResult.command.type, 'status');
  
  // Configure agent
  const configResult = await service.processInput('configure agent test-agent memory=1GB');
  t.true(configResult.success);
  t.is(configResult.command.type, 'configure');
  t.is(configResult.command.parameters.memory, '1GB');
  
  // Stop agent
  const stopResult = await service.processInput('stop agent test-agent');
  t.true(stopResult.success);
  t.is(stopResult.command.type, 'stop');
  
  // Check history
  const history = await service.getHistory('test-agent');
  t.true(history.length >= 4); // start, status, configure, stop
});

test('multiple command types', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const commands = [
    'start agent agent1',
    'start service monitoring',
    'start workflow backup',
    'status all',
    'help start'
  ];
  
  for (const command of commands) {
    const result = await service.processInput(command);
    t.true(result.success, `Failed to execute: ${command}`);
    t.truthy(result.command, `No command for: ${command}`);
  }
});

test('error handling and recovery', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  // Invalid command
  const invalidResult = await service.processInput('invalid xyz');
  t.false(invalidResult.success);
  t.is(invalidResult.phase, 'parsing');
  t.truthy(invalidResult.suggestions);
  
  // Valid command but execution error
  const errorResult = await service.processInput('stop agent nonexistent');
  t.false(errorResult.success);
  t.is(errorResult.phase, 'execution');
  t.truthy(errorResult.error);
  
  // Next command should still work
  const successResult = await service.processInput('start agent new-agent');
  t.true(successResult.success);
});

test('parameter extraction and validation', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  const result = await service.processInput('start agent agent1 name=agent1 memory=512MB timeout=60s');
  
  t.true(result.success);
  t.deepEqual(result.command.parameters, {
    name: 'agent1',
    memory: '512MB',
    timeout: '60s'
  });
});

test('confidence scoring and suggestions', async (t) => {
  const service = new NLPService(
    mockAgentRuntime,
    mockServiceManager,
    mockWorkflowManager
  );
  
  // High confidence command
  const highConfidenceResult = await service.processInput('start agent agent1');
  t.true(highConfidenceResult.success);
  t.true(highConfidenceResult.command.context!.confidence > 0.5);
  
  // Low confidence input
  const suggestions = await service.getSuggestions('random words');
  t.true(Array.isArray(suggestions));
});