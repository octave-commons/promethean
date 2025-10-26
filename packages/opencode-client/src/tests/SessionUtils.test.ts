import test from 'ava';
import sinon from 'sinon';
import { SessionUtils } from '../SessionUtils.js';
import type {
  AgentTask,
  SessionEventProperties,
  MessageEventProperties,
  OpenCodeEvent,
} from '../types/index.js';

test('extractSessionId returns null when no properties and no sessionId', (t) => {
  const event: OpenCodeEvent = {
    type: 'session_created',
    sessionId: '',
    timestamp: Date.now(),
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, '');
});

test('extractSessionId returns sessionId when no properties', (t) => {
  const event: OpenCodeEvent = {
    type: 'session_created',
    sessionId: 'session-123',
    timestamp: Date.now(),
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'session-123');
});

test('extractSessionId handles session_idle event with sessionID', (t) => {
  const event: OpenCodeEvent = {
    type: 'session_idle',
    sessionId: '',
    timestamp: Date.now(),
    properties: {
      sessionID: 'idle-session-456',
    } as SessionEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'idle-session-456');
});

test('extractSessionId handles session_idle event with session.id', (t) => {
  const event: OpenCodeEvent = {
    type: 'session_idle',
    sessionId: '',
    timestamp: Date.now(),
    properties: {
      session: { id: 'idle-session-789' },
    } as SessionEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'idle-session-789');
});

test('extractSessionId handles session_updated event with info.id', (t) => {
  const event: OpenCodeEvent = {
    type: 'session_updated',
    sessionId: '',
    timestamp: Date.now(),
    properties: {
      info: { id: 'updated-session-123' },
    } as SessionEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'updated-session-123');
});

test('extractSessionId handles message_updated event with message.session_id', (t) => {
  const event: OpenCodeEvent = {
    type: 'message_updated',
    sessionId: '',
    messageId: 'msg-123',
    timestamp: Date.now(),
    data: {
      role: 'user' as const,
      content: 'Hello',
    },
    properties: {
      message: { session_id: 'msg-session-456' },
    } as MessageEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'msg-session-456');
});

test('extractSessionId falls back to sessionId for message events', (t) => {
  const event: OpenCodeEvent = {
    type: 'message_updated',
    sessionId: 'fallback-session-789',
    messageId: 'msg-123',
    timestamp: Date.now(),
    data: {
      role: 'user' as const,
      content: 'Hello',
    },
    properties: {
      message: { session_id: undefined },
    } as MessageEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, 'fallback-session-789');
});

test('extractSessionId returns null for unknown event type', (t) => {
  const event: OpenCodeEvent = {
    type: 'message_sent',
    sessionId: '',
    messageId: 'msg-123',
    timestamp: Date.now(),
    data: {
      role: 'user' as const,
      content: 'Hello',
    },
    properties: {} as SessionEventProperties,
  };

  const result = SessionUtils.extractSessionId(event);
  t.is(result, null);
});

test('getSessionMessages handles successful response', async (t) => {
  const mockClient = {
    session: {
      messages: sinon.stub().resolves({
        data: [{ id: 'msg1', content: 'Hello' }],
      }),
    },
  };

  const result = await SessionUtils.getSessionMessages(mockClient as any, 'session-123');
  t.deepEqual(result, [{ id: 'msg1', content: 'Hello' }]);
});

test('getSessionMessages handles error response', async (t) => {
  const mockClient = {
    session: {
      messages: sinon.stub().rejects(new Error('Network error')),
    },
  };

  const consoleErrorStub = sinon.stub(console, 'error');

  const result = await SessionUtils.getSessionMessages(mockClient as any, 'session-123');

  t.deepEqual(result, []);
  t.true(consoleErrorStub.calledOnce);
  t.true(
    consoleErrorStub.calledWith(
      'Error fetching messages for session session-123:',
      sinon.match.any,
    ),
  );

  consoleErrorStub.restore();
});

test('getSessionMessages handles empty response', async (t) => {
  const mockClient = {
    session: {
      messages: sinon.stub().resolves({ data: null }),
    },
  };

  const result = await SessionUtils.getSessionMessages(mockClient as any, 'session-123');
  t.deepEqual(result, []);
});

test('determineActivityStatus with running agent task and recent activity', (t) => {
  const agentTask: AgentTask = {
    sessionId: 'session-123',
    task: 'Test task',
    status: 'running',
    lastActivity: Date.now() - 100000, // Recent activity (less than 5 minutes)
    startTime: Date.now() - 1000000,
  };

  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 5, agentTask);
  t.is(result, 'active');
});

test('determineActivityStatus with running agent task but old activity', (t) => {
  const agentTask: AgentTask = {
    sessionId: 'session-123',
    task: 'Test task',
    status: 'running',
    lastActivity: Date.now() - 10 * 60 * 1000, // Old activity (more than 5 minutes)
    startTime: Date.now() - 1000000,
  };

  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 5, agentTask);
  t.is(result, 'waiting_for_input');
});

test('determineActivityStatus with completed agent task', (t) => {
  const agentTask: AgentTask = {
    sessionId: 'session-123',
    task: 'Test task',
    status: 'completed',
    lastActivity: Date.now() - 100000,
    startTime: Date.now() - 1000000,
  };

  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 5, agentTask);
  t.is(result, 'completed');
});

test('determineActivityStatus without agent task - low message count', (t) => {
  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 5);
  t.is(result, 'active');
});

test('determineActivityStatus without agent task - medium message count', (t) => {
  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 25);
  t.is(result, 'waiting_for_input');
});

test('determineActivityStatus without agent task - high message count', (t) => {
  const result = SessionUtils.determineActivityStatus({ id: 'session-123' }, 60);
  t.is(result, 'idle');
});

test('createSessionInfo with agent task', (t) => {
  const session = {
    id: 'session-123',
    title: 'Test Session',
    isAgentTask: false,
  };

  const agentTask: AgentTask = {
    sessionId: 'session-123',
    task: 'Test task',
    status: 'running',
    lastActivity: Date.now() - 100000,
    startTime: Date.now() - 1000000,
  };

  const result = SessionUtils.createSessionInfo(session, 10, agentTask);

  t.is(result.id, 'session-123');
  t.is(result.title, 'Test Session');
  t.is(result.messageCount, 10);
  t.is(result.isAgentTask, true);
  t.is(result.agentTaskStatus, 'running');
  t.true(result.lastActivityTime.length > 0);
  t.true(result.sessionAge > 0);
});

test('createSessionInfo without agent task but with isAgentTask flag', (t) => {
  const session = {
    id: 'session-456',
    title: 'Agent Session',
    isAgentTask: true,
  };

  const result = SessionUtils.createSessionInfo(session, 5);

  t.is(result.id, 'session-456');
  t.is(result.title, 'Agent Session');
  t.is(result.messageCount, 5);
  t.is(result.isAgentTask, true);
  t.is(result.agentTaskStatus, undefined);
  t.is(result.sessionAge, 0);
});

test('createSessionInfo without title uses id as title', (t) => {
  const session = {
    id: 'session-789',
  };

  const result = SessionUtils.createSessionInfo(session, 0);

  t.is(result.id, 'session-789');
  t.is(result.title, 'session-789');
});
