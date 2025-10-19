/**
 * Core module tests for Pantheon Agent Framework
 */

import test from 'ava';
import {
  AgentId,
  AgentStatus,
  ContextId,
  MessageEnvelope,
  PantheonError,
  ContextError,
  ProtocolError,
  WorkflowError,
  OrchestrationError,
} from '../core/index.js';

test('AgentId creation', (t) => {
  const agentId: AgentId = {
    value: 'test-agent-123',
    type: 'uuid',
  };

  t.is(agentId.value, 'test-agent-123');
  t.is(agentId.type, 'uuid');
});

test('AgentStatus enum values', (t) => {
  t.is(AgentStatus.INACTIVE, AgentStatus.INACTIVE);
  t.is(AgentStatus.ACTIVE, AgentStatus.ACTIVE);
  t.is(AgentStatus.BUSY, AgentStatus.BUSY);
  t.is(AgentStatus.ERROR, AgentStatus.ERROR);
  t.is(AgentStatus.MAINTENANCE, AgentStatus.MAINTENANCE);
});

test('ContextId creation', (t) => {
  const contextId: ContextId = {
    value: 'session-456',
    type: 'session',
  };

  t.is(contextId.value, 'session-456');
  t.is(contextId.type, 'session');
});

test('MessageEnvelope creation', (t) => {
  const envelope: MessageEnvelope = {
    id: { value: 'msg-789', type: 'uuid' },
    from: { value: 'agent-1', type: 'uuid' },
    to: { value: 'agent-2', type: 'uuid' },
    type: 'test-message',
    payload: { hello: 'world' },
    timestamp: new Date(),
    priority: 1,
  };

  t.is(envelope.type, 'test-message');
  t.deepEqual(envelope.payload, { hello: 'world' });
});

test('PantheonError creation', (t) => {
  const error = new PantheonError('Test error', 'TEST_ERROR', 'core');

  t.is(error.message, 'Test error');
  t.is(error.code, 'TEST_ERROR');
  t.is(error.module, 'core');
  t.is(error.name, 'PantheonError');
});

test('Specialized error types', (t) => {
  const contextError = new ContextError('Context error', 'CTX_ERROR');
  const protocolError = new ProtocolError('Protocol error', 'PROTO_ERROR');
  const workflowError = new WorkflowError('Workflow error', 'WORKFLOW_ERROR');
  const orchestrationError = new OrchestrationError('Orchestration error', 'ORCH_ERROR');

  t.is(contextError.name, 'ContextError');
  t.is(contextError.module, 'context');

  t.is(protocolError.name, 'ProtocolError');
  t.is(protocolError.module, 'protocol');

  t.is(workflowError.name, 'WorkflowError');
  t.is(workflowError.module, 'workflow');

  t.is(orchestrationError.name, 'OrchestrationError');
  t.is(orchestrationError.module, 'orchestration');
});
