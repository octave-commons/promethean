import test from 'ava';
import sinon from 'sinon';
import {
  sendMessage,
  getSenderSessionId,
  formatMessage,
  logCommunication,
} from '../../actions/messaging/index.js';
import { sessionStore } from '../../index.js';
import { setupTestStores } from '../helpers/test-stores.js';

test.beforeEach(async () => {
  sinon.restore();
  await setupTestStores();
});

test.serial('getSenderSessionId returns session ID from client', async (t) => {
  const mockClient = {
    session: {
      list: sinon.stub().resolves({
        data: [{ id: 'session-123' }, { id: 'session-456' }],
      }),
    },
  };

  const result = await getSenderSessionId(mockClient);

  t.true(mockClient.session.list.calledOnce);
  t.is(result, 'session-123');
});

test.serial('getSenderSessionId returns unknown when no sessions', async (t) => {
  const mockClient = {
    session: {
      list: sinon.stub().resolves({ data: [] }),
    },
  };

  const result = await getSenderSessionId(mockClient);

  t.true(mockClient.session.list.calledOnce);
  t.is(result, 'unknown');
});

test.serial('getSenderSessionId returns unknown when client fails', async (t) => {
  const mockClient = {
    session: {
      list: sinon.stub().rejects(new Error('Network error')),
    },
  };

  const result = await getSenderSessionId(mockClient);

  t.true(mockClient.session.list.calledOnce);
  t.is(result, 'unknown');
});

test.serial('formatMessage formats message correctly', (t) => {
  const params = {
    senderId: 'sender-123456789',
    recipientId: 'recipient-123456789',
    message: 'Hello world',
    priority: 'high',
    messageType: 'urgent_update',
  };

  const result = formatMessage(params);

  t.true(result.includes('🔔 **INTER-AGENT MESSAGE** 🔔'));
  t.true(result.includes('**From:** Agent sender-12...'));
  t.true(result.includes('**To:** Agent recipient-12...'));
  t.true(result.includes('**Priority:** HIGH'));
  t.true(result.includes('**Type:** URGENT UPDATE'));
  t.true(result.includes('**Message:**'));
  t.true(result.includes('Hello world'));
  t.true(result.includes(new Date().toLocaleTimeString()));
});

test.serial('formatMessage handles short IDs', (t) => {
  const params = {
    senderId: 'abc',
    recipientId: 'def',
    message: 'Test',
    priority: 'low',
    messageType: 'info',
  };

  const result = formatMessage(params);

  t.true(result.includes('**From:** Agent abc'));
  t.true(result.includes('**To:** Agent def'));
  t.true(result.includes('**Priority:** LOW'));
  t.true(result.includes('**Type:** INFO'));
});

test.serial('sendMessage sends message and logs communication', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();
  const mockClient = {
    session: {
      list: sinon.stub().resolves({ data: [{ id: 'sender-session' }] }),
      prompt: sinon.stub().resolves(),
    },
  };

  const context = { sessionStore };

  const result = await sendMessage({
    context,
    client: mockClient,
    sessionId: 'recipient-session-123456',
    message: 'Test message',
    priority: 'high',
    messageType: 'urgent_update',
  });

  t.true(mockClient.session.list.calledOnce);
  t.true(mockClient.session.prompt.calledOnce);
  t.true(insertStub.calledOnce);

  // Check prompt call
  const promptCall = mockClient.session.prompt.getCall(0);
  t.is(promptCall!.args[0].path.id, 'recipient-session-123456');
  t.deepEqual(promptCall!.args[0].body.parts, [{ type: 'text', text: sinon.match.string }]);

  // Check insert call
  const insertCall = insertStub.getCall(0);
  if (insertCall && insertCall.args[0] && insertCall.args[0].metadata) {
    t.is(insertCall.args[0].metadata.type, 'inter_agent_communication');
    t.is(insertCall.args[0].metadata.sender, 'sender-session');
    t.is(insertCall.args[0].metadata.recipient, 'recipient-session-123456');
    t.is(insertCall.args[0].metadata.priority, 'high');
    t.is(insertCall.args[0].metadata.messageType, 'urgent_update');
  }

  // Check return value
  t.true(result.includes('✅ Message sent successfully'));
  t.true(result.includes('recipient...'));
  t.true(result.includes('Priority: high'));
  t.true(result.includes('Type: urgent_update'));
});

test.serial('sendMessage handles storage errors gracefully', async (t) => {
  const consoleWarnSpy = sinon.spy(console, 'warn');
  sinon.stub(sessionStore, 'insert').rejects(new Error('Storage failed'));
  const mockClient = {
    session: {
      list: sinon.stub().resolves({ data: [{ id: 'sender-session' }] }),
      prompt: sinon.stub().resolves(),
    },
  };

  const context = { sessionStore };

  const result = await sendMessage({
    context,
    client: mockClient,
    sessionId: 'recipient-session',
    message: 'Test message',
    priority: 'low',
    messageType: 'info',
  });

  t.true(
    consoleWarnSpy.calledWith(
      '⚠️ Failed to store inter-agent communication:',
      sinon.match.instanceOf(Error),
    ),
  );
  t.true(result.includes('✅ Message sent successfully'));
});

test.serial('logCommunication stores communication in session store', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();

  const context = { sessionStore };

  await logCommunication({
    context,
    senderId: 'sender-123',
    recipientId: 'recipient-456',
    message: 'Test communication',
    priority: 'medium',
    messageType: 'status_update',
  });

  t.true(insertStub.calledOnce);
  const insertCall = insertStub.getCall(0);

  if (insertCall && insertCall.args[0] && insertCall.args[0].metadata && insertCall.args[0].id) {
    t.true(insertCall.args[0].id.startsWith('inter_agent_'));
    t.is(insertCall.args[0].text, 'Inter-agent message: Test communication');
    t.is(insertCall.args[0].metadata.type, 'inter_agent_communication');
    t.is(insertCall.args[0].metadata.sender, 'sender-123');
    t.is(insertCall.args[0].metadata.recipient, 'recipient-456');
    t.is(insertCall.args[0].metadata.priority, 'medium');
    t.is(insertCall.args[0].metadata.messageType, 'status_update');
  }
});

test.serial('logCommunication handles storage errors gracefully', async (t) => {
  const consoleWarnSpy = sinon.spy(console, 'warn');
  sinon.stub(sessionStore, 'insert').rejects(new Error('Storage failed'));

  const context = { sessionStore };

  await logCommunication({
    context,
    senderId: 'sender-123',
    recipientId: 'recipient-456',
    message: 'Test communication',
    priority: 'medium',
    messageType: 'status_update',
  });

  t.true(
    consoleWarnSpy.calledWith(
      '⚠️ Failed to store inter-agent communication:',
      sinon.match.instanceOf(Error),
    ),
  );
});

test.serial('sendMessage generates unique message ID', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();
  const mockClient = {
    session: {
      list: sinon.stub().resolves({ data: [{ id: 'sender-session' }] }),
      prompt: sinon.stub().resolves(),
    },
  };

  const context = { sessionStore };

  // Call sendMessage twice
  await sendMessage({
    context,
    client: mockClient,
    sessionId: 'recipient-session',
    message: 'Message 1',
    priority: 'low',
    messageType: 'info',
  });

  await sendMessage({
    context,
    client: mockClient,
    sessionId: 'recipient-session',
    message: 'Message 2',
    priority: 'low',
    messageType: 'info',
  });

  t.is(insertStub.callCount, 2);

  const firstCall = insertStub.getCall(0);
  const secondCall = insertStub.getCall(1);

  if (firstCall && firstCall.args[0] && secondCall && secondCall.args[0]) {
    const firstId = firstCall.args[0].id;
    const secondId = secondCall.args[0].id;

    if (firstId && secondId) {
      t.not(firstId, secondId);
      t.true(firstId.startsWith('inter_agent_'));
      t.true(secondId.startsWith('inter_agent_'));
    } else {
      t.fail('Expected both IDs to be defined');
    }
  } else {
    t.fail('Expected both insert calls to have valid arguments');
  }
});
