/**
 * Protocol Tests
 * Comprehensive test suite for Agent OS Core Message Protocol
 */

import test from 'ava';
import {
  CoreMessage,
  MessageType,
  Priority,
  QoSLevel,
  CrisisMessage,
  CrisisMessageType,
  CrisisLevel,
} from '../core/types';
import {
  AgentBusAdapter,
  OmniAdapter,
  EnsoAdapter,
  UniversalProtocolAdapter,
  CrisisMessageAdapter,
  EmergencyCrisisSystem,
} from '../adapters/protocol-adapter';
import { CrisisCoordinator } from '../crisis/coordinator';

// ============================================================================
// Protocol Adapter Tests
// ============================================================================

test('AgentBusAdapter - toCoreMessage converts correctly', (t) => {
  const adapter = new AgentBusAdapter();
  const agentBusMessage = {
    id: 'test-123',
    type: 'request',
    sender: 'agent-1',
    recipient: 'agent-2',
    payload: { action: 'test', data: 'value' },
    timestamp: Date.now(),
    metadata: { source: 'test' },
  };

  const coreMessage = adapter.toCoreMessage(agentBusMessage);

  t.is(coreMessage.id, 'test-123');
  t.is(coreMessage.type, MessageType.REQUEST);
  t.is(coreMessage.sender.id, 'agent-1');
  t.is(coreMessage.recipient.id, 'agent-2');
  t.is(coreMessage.payload.data, agentBusMessage.payload);
  t.is(coreMessage.priority, Priority.NORMAL);
  t.is(coreMessage.qos, QoSLevel.AT_LEAST_ONCE);
});

test('AgentBusAdapter - fromCoreMessage converts correctly', (t) => {
  const adapter = new AgentBusAdapter();
  const coreMessage: CoreMessage = {
    id: 'test-456',
    version: '1.0.0',
    type: MessageType.RESPONSE,
    timestamp: new Date().toISOString(),
    sender: { id: 'agent-2', namespace: 'test', domain: 'example' },
    recipient: { id: 'agent-1', namespace: 'test', domain: 'example' },
    capabilities: [],
    payload: { type: 'response', data: { result: 'success' } },
    metadata: { source: 'protocol-adapter', tags: ['adapted'] },
    headers: {},
    priority: Priority.HIGH,
    qos: QoSLevel.EXACTLY_ONCE,
  };

  const agentBusMessage = adapter.fromCoreMessage(coreMessage);

  t.is(agentBusMessage.id, 'test-456');
  t.is(agentBusMessage.type, MessageType.RESPONSE);
  t.is(agentBusMessage.sender, 'agent-2');
  t.is(agentBusMessage.recipient, 'agent-1');
  t.is(agentBusMessage.payload, coreMessage.payload.data);
});

test('OmniAdapter - converts correctly', (t) => {
  const adapter = new OmniAdapter();
  const omniMessage = {
    messageId: 'omni-789',
    messageType: 'command',
    source: 'omni-agent',
    destination: 'target-agent',
    content: { command: 'execute', parameters: {} },
    createdAt: new Date().toISOString(),
    headers: { 'X-Priority': 'high' },
  };

  const coreMessage = adapter.toCoreMessage(omniMessage);
  const backConverted = adapter.fromCoreMessage(coreMessage);

  t.is(coreMessage.type, MessageType.REQUEST);
  t.is(coreMessage.sender.id, 'omni-agent');
  t.is(coreMessage.recipient.id, 'target-agent');
  t.is(backConverted.messageId, 'omni-789');
  t.is(backConverted.messageType, 'command');
});

test('EnsoAdapter - converts correctly', (t) => {
  const adapter = new EnsoAdapter();
  const ensoMessage = {
    uuid: 'enso-abc',
    action: 'invoke',
    actor: 'enso-agent',
    target: 'target-service',
    data: { method: 'process', input: {} },
    timestamp: new Date().toISOString(),
    context: { environment: 'test' },
  };

  const coreMessage = adapter.toCoreMessage(ensoMessage);
  const backConverted = adapter.fromCoreMessage(coreMessage);

  t.is(coreMessage.type, MessageType.REQUEST);
  t.is(coreMessage.sender.id, 'enso-agent');
  t.is(coreMessage.recipient.id, 'target-service');
  t.is(backConverted.uuid, 'enso-abc');
  t.is(backConverted.action, 'invoke');
});

test('UniversalProtocolAdapter - detects protocols correctly', (t) => {
  const adapter = new UniversalProtocolAdapter();

  const agentBusMessage = {
    id: 'test',
    type: 'request',
    sender: 'agent1',
    recipient: 'agent2',
  };

  const omniMessage = {
    messageId: 'test',
    messageType: 'command',
    source: 'agent1',
    destination: 'agent2',
  };

  const ensoMessage = {
    uuid: 'test',
    action: 'invoke',
    actor: 'agent1',
    target: 'agent2',
  };

  t.is(adapter.detectProtocol(agentBusMessage), 'agent-bus');
  t.is(adapter.detectProtocol(omniMessage), 'omni');
  t.is(adapter.detectProtocol(ensoMessage), 'enso');
});

test('UniversalProtocolAdapter - autoConvert works', (t) => {
  const adapter = new UniversalProtocolAdapter();
  const message = {
    id: 'auto-test',
    type: 'event',
    sender: 'sender-agent',
    recipient: 'receiver-agent',
    payload: { event: 'test' },
    timestamp: Date.now(),
  };

  const coreMessage = adapter.autoConvert(message);

  t.is(coreMessage.id, 'auto-test');
  t.is(coreMessage.type, MessageType.EVENT);
  t.is(coreMessage.sender.id, 'sender-agent');
  t.is(coreMessage.recipient.id, 'receiver-agent');
});

// ============================================================================
// Crisis Management Tests
// ============================================================================

test('CrisisMessageAdapter - converts to CoreMessage', (t) => {
  const crisis: CrisisMessage = {
    id: 'crisis-001',
    type: CrisisMessageType.DUPLICATE_TASKS,
    level: CrisisLevel.HIGH,
    coordinationId: 'coord-123',
    affectedAgents: [
      { id: 'agent1', namespace: 'test', domain: 'example' },
      { id: 'agent2', namespace: 'test', domain: 'example' },
    ],
    requiredActions: ['consolidate', 'prioritize'],
    deadline: new Date(Date.now() + 3600000).toISOString(),
  };

  const coreMessage = CrisisMessageAdapter.toCoreMessage(crisis);

  t.is(coreMessage.id, 'crisis-001');
  t.is(coreMessage.type, MessageType.CRISIS_COORDINATION);
  t.is(coreMessage.sender.id, 'crisis-coordinator');
  t.is(coreMessage.recipient.id, 'all-agents');
  t.is(coreMessage.priority, Priority.HIGH);
  t.is(coreMessage.qos, QoSLevel.EXACTLY_ONCE);
  t.is(coreMessage.deadline, crisis.deadline);
});

test('CrisisMessageAdapter - converts from CoreMessage', (t) => {
  const coreMessage: CoreMessage = {
    id: 'crisis-002',
    version: '1.0.0',
    type: MessageType.CRISIS_COORDINATION,
    timestamp: new Date().toISOString(),
    sender: { id: 'crisis-coordinator', namespace: 'system', domain: 'coordination' },
    recipient: { id: 'all-agents', namespace: 'system', domain: '*' },
    capabilities: ['crisis-management'],
    payload: {
      type: 'crisis',
      data: {
        id: 'crisis-002',
        type: CrisisMessageType.SECURITY_VALIDATION,
        level: CrisisLevel.CRITICAL,
        coordinationId: 'coord-456',
        affectedAgents: [{ id: 'security-agent', namespace: 'security', domain: 'validation' }],
        requiredActions: ['validate', 'scan'],
        deadline: new Date(Date.now() + 7200000).toISOString(),
      },
    },
    metadata: { source: 'crisis-coordinator', tags: ['crisis'] },
    headers: {},
    priority: Priority.CRITICAL,
    qos: QoSLevel.EXACTLY_ONCE,
  };

  const crisis = CrisisMessageAdapter.fromCoreMessage(coreMessage);

  t.not(crisis, null);
  if (crisis) {
    t.is(crisis.id, 'crisis-002');
    t.is(crisis.type, CrisisMessageType.SECURITY_VALIDATION);
    t.is(crisis.level, CrisisLevel.CRITICAL);
    t.is(crisis.coordinationId, 'coord-456');
    t.is(crisis.affectedAgents.length, 1);
    t.is(crisis.requiredActions.length, 2);
  }
});

test('EmergencyCrisisSystem - handles crisis messages', async (t) => {
  const system = new EmergencyCrisisSystem();
  const crisis: CrisisMessage = {
    id: 'emergency-test',
    type: CrisisMessageType.SYSTEM_EMERGENCY,
    level: CrisisLevel.SYSTEM_EMERGENCY,
    coordinationId: 'emergency-coord',
    affectedAgents: [{ id: 'all-agents', namespace: 'system', domain: '*' }],
    requiredActions: ['emergency_response'],
    deadline: new Date(Date.now() + 1800000).toISOString(),
  };

  // Should not throw
  await t.notThrowsAsync(async () => {
    await system.handleCrisisMessage(crisis);
  });
});

test('EmergencyCrisisSystem - consolidates duplicate tasks', async (t) => {
  const system = new EmergencyCrisisSystem();
  const result = await system.consolidateDuplicateTasks('test-coord');

  t.is(result.coordinationId, 'test-coord');
  t.true(result.reduction >= 50);
  t.true(result.timeSavings > 0);
  t.is(result.status, 'completed');
});

test('EmergencyCrisisSystem - distributes workload', async (t) => {
  const system = new EmergencyCrisisSystem();
  const tasks = Array.from({ length: 10 }, (_, i) => ({ id: `task-${i}`, priority: 'normal' }));
  const result = await system.distributeWorkload('workload-coord', tasks);

  t.is(result.coordinationId, 'workload-coord');
  t.is(result.totalTasks, 10);
  t.true(result.assignedTasks > 0);
  t.is(result.status, 'completed');
});

// ============================================================================
// Crisis Coordinator Tests
// ============================================================================

test('CrisisCoordinator - initializes with default agents', (t) => {
  const coordinator = new CrisisCoordinator();
  const agents = coordinator.getAllAgents();

  t.true(agents.length > 0);
  t.true(agents.some((agent) => agent.id === 'security-specialist'));
  t.true(agents.some((agent) => agent.id === 'devops-orchestrator'));
  t.true(agents.some((agent) => agent.id === 'task-consolidator'));
});

test('CrisisCoordinator - handles duplicate tasks crisis', async (t) => {
  const coordinator = new CrisisCoordinator();
  const crisis: CrisisMessage = {
    id: 'crisis-duplicates',
    type: CrisisMessageType.DUPLICATE_TASKS,
    level: CrisisLevel.HIGH,
    coordinationId: 'duplicate-coord',
    affectedAgents: [{ id: 'task-consolidator', namespace: 'tasks', domain: 'consolidation' }],
    requiredActions: ['consolidate_duplicates'],
    deadline: new Date(Date.now() + 3600000).toISOString(),
  };

  const resolution = await coordinator.handleCrisisMessage(crisis);

  t.is(resolution.crisisId, 'crisis-duplicates');
  t.is(resolution.status, 'resolved');
  t.is(resolution.progress, 100);
  t.true(resolution.actions.length > 0);
  t.not(resolution.results, undefined);
  if (resolution.results) {
    t.true(resolution.results.tasksConsolidated > 0);
    t.true(resolution.results.timeSavings > 0);
  }
});

test('CrisisCoordinator - handles security validation crisis', async (t) => {
  const coordinator = new CrisisCoordinator();
  const crisis: CrisisMessage = {
    id: 'crisis-security',
    type: CrisisMessageType.SECURITY_VALIDATION,
    level: CrisisLevel.CRITICAL,
    coordinationId: 'security-coord',
    affectedAgents: [{ id: 'security-specialist', namespace: 'security', domain: 'validation' }],
    requiredActions: ['validate_security', 'scan_vulnerabilities'],
    deadline: new Date(Date.now() + 7200000).toISOString(),
  };

  const resolution = await coordinator.handleCrisisMessage(crisis);

  t.is(resolution.crisisId, 'crisis-security');
  t.is(resolution.status, 'resolved');
  t.true(resolution.actions.some((action) => action.type === 'security_validation'));
});

test('CrisisCoordinator - provides system status', (t) => {
  const coordinator = new CrisisCoordinator();
  const status = coordinator.getSystemStatus();

  t.true(status.totalAgents > 0);
  t.true(status.availableAgents > 0);
  t.true(status.availableAgents <= status.totalAgents);
  t.is(status.activeCrises, 0);
  t.true(['healthy', 'degraded', 'critical'].includes(status.systemHealth));
});

test('CrisisCoordinator - event system works', (t) => {
  const coordinator = new CrisisCoordinator();
  let eventFired = false;
  let eventData: any = null;

  coordinator.on('test_event', (data: any) => {
    eventFired = true;
    eventData = data;
  });

  // Simulate internal event emission
  coordinator.emit('test_event', { test: 'data' });

  t.true(eventFired);
  t.not(eventData, null);
  t.is(eventData.test, 'data');
});

// ============================================================================
// Integration Tests
// ============================================================================

test('Integration - Full crisis workflow', async (t) => {
  const coordinator = new CrisisCoordinator();
  const universalAdapter = new UniversalProtocolAdapter();

  // Create a crisis from different protocol formats
  const agentBusMessage = {
    id: 'integration-crisis',
    type: 'crisis_alert',
    sender: 'monitoring-agent',
    recipient: 'crisis-coordinator',
    payload: {
      crisisType: 'duplicate_tasks',
      crisisLevel: 'high',
      coordinationId: 'integration-coord',
      affectedAgents: ['task-consolidator', 'work-prioritizer'],
      requiredActions: ['consolidate', 'prioritize'],
      deadline: new Date(Date.now() + 3600000).toISOString(),
    },
    timestamp: Date.now(),
  };

  // Convert to core message
  const coreMessage = universalAdapter.autoConvert(agentBusMessage);

  // Convert to crisis message
  const crisis = CrisisMessageAdapter.fromCoreMessage(coreMessage);

  t.not(crisis, null);
  if (crisis) {
    // Handle the crisis
    const resolution = await coordinator.handleCrisisMessage(crisis);

    t.is(resolution.status, 'resolved');
    t.true(resolution.actions.length > 0);
    t.not(resolution.results, undefined);
  }
});

test('Integration - Multi-protocol message conversion', (t) => {
  const universalAdapter = new UniversalProtocolAdapter();

  // Test all three protocols
  const agentBusMsg = {
    id: 'test1',
    type: 'request',
    sender: 'agent1',
    recipient: 'agent2',
    payload: { test: 'data' },
    timestamp: Date.now(),
  };

  const omniMsg = {
    messageId: 'test2',
    messageType: 'query',
    source: 'agent1',
    destination: 'agent2',
    content: { test: 'data' },
    createdAt: new Date().toISOString(),
  };

  const ensoMsg = {
    uuid: 'test3',
    action: 'invoke',
    actor: 'agent1',
    target: 'agent2',
    data: { test: 'data' },
    timestamp: new Date().toISOString(),
  };

  const core1 = universalAdapter.autoConvert(agentBusMsg);
  const core2 = universalAdapter.autoConvert(omniMsg);
  const core3 = universalAdapter.autoConvert(ensoMsg);

  // All should be converted to CoreMessage format
  t.is(core1.sender.id, 'agent1');
  t.is(core1.recipient.id, 'agent2');
  t.is(core1.payload.data.test, 'data');

  t.is(core2.sender.id, 'agent1');
  t.is(core2.recipient.id, 'agent2');
  t.is(core2.payload.data.test, 'data');

  t.is(core3.sender.id, 'agent1');
  t.is(core3.recipient.id, 'agent2');
  t.is(core3.payload.data.test, 'data');
});
