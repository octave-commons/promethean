import test from 'ava';
import sinon from 'sinon';
import {
  detectTaskCompletion,
  processMessage,
  processSessionMessages,
  getSessionMessages,
} from '../../actions/messages/index.js';
import { sessionStore } from '../../index.js';
import type { EventMessage } from '../../types/index.js';

test.beforeEach(() => {
  sinon.restore();
});

test.serial('detectTaskCompletion returns false for empty messages', (t) => {
  const result = detectTaskCompletion([]);

  t.false(result.completed);
  t.is(result.completionMessage, undefined);
});

test.serial('detectTaskCompletion returns false for messages without text parts', (t) => {
  const messages: EventMessage[] = [
    {
      info: { id: 'msg1', timestamp: Date.now() },
      parts: [{ type: 'image', data: 'base64data' }],
    } as any,
  ];

  const result = detectTaskCompletion(messages);

  t.false(result.completed);
  t.is(result.completionMessage, undefined);
});

test.serial('detectTaskCompletion detects completion patterns', (t) => {
  const testCases = [
    { text: 'Task completed successfully', expected: true },
    { text: 'Finished the task', expected: true },
    { text: 'Done with the task', expected: true },
    { text: 'Task finished', expected: true },
    { text: 'Completed successfully', expected: true },
    { text: 'Work complete', expected: true },
    { text: 'All done', expected: true },
    { text: 'Mission accomplished', expected: true },
    { text: 'Objective achieved', expected: true },
    { text: '✅ Task done', expected: true },
    { text: '🎉 Success', expected: true },
    { text: '🏆 Complete', expected: true },
    { text: '✓ Finished', expected: true },
    { text: 'Still working on it', expected: false },
    { text: 'In progress', expected: false },
  ];

  testCases.forEach(({ text, expected }) => {
    const messages: EventMessage[] = [
      {
        info: { id: 'msg1', timestamp: Date.now() },
        parts: [{ type: 'text', text }],
      } as any,
    ];

    const result = detectTaskCompletion(messages);

    t.is(result.completed, expected, `Failed for text: "${text}"`);
    if (expected) {
      t.is(result.completionMessage, text.toLowerCase());
    }
  });
});

test.serial('processMessage stores text parts in session store', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();

  const message: EventMessage = {
    info: { id: 'msg1', timestamp: Date.now() },
    parts: [
      { type: 'text', text: 'Hello world' },
      { type: 'image', data: 'base64data' },
    ],
  } as any;

  const context = { sessionStore };

  await processMessage(context, 'session-123', message);

  t.true(insertStub.calledOnce);
  t.true(
    insertStub.calledWith({
      id: 'msg1',
      text: 'Hello world',
      timestamp: sinon.match.string,
      metadata: {
        sessionID: 'session-123',
        messageID: 'msg1',
        type: 'text',
      },
    }),
  );
});

test.serial('processMessage handles empty message gracefully', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();

  const message = {} as EventMessage;
  const context = { sessionStore };

  await processMessage(context, 'session-123', message);

  t.false(insertStub.called);
});

test.serial('processMessage handles message without parts gracefully', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();

  const message: EventMessage = {
    info: { id: 'msg1', timestamp: Date.now() },
  } as any;
  const context = { sessionStore };

  await processMessage(context, 'session-123', message);

  t.false(insertStub.called);
});

test.serial('processMessage handles empty text parts gracefully', async (t) => {
  const insertStub = sinon.stub(sessionStore, 'insert').resolves();

  const message: EventMessage = {
    info: { id: 'msg1', timestamp: Date.now() },
    parts: [{ type: 'text', text: '   ' }], // Whitespace only
  } as any;
  const context = { sessionStore };

  await processMessage(context, 'session-123', message);

  t.false(insertStub.called);
});

test.serial('processMessage logs errors when storage fails', async (t) => {
  const error = new Error('Storage failed');
  sinon.stub(sessionStore, 'insert').rejects(error);
  const consoleErrorSpy = sinon.spy(console, 'error');

  const message: EventMessage = {
    info: { id: 'msg1', timestamp: Date.now() },
    parts: [{ type: 'text', text: 'Hello world' }],
  } as any;
  const context = { sessionStore };

  await processMessage(context, 'session-123', message);

  t.true(consoleErrorSpy.calledWith(`Error storing message msg1:`, sinon.match.array));
});

test.serial('getSessionMessages returns messages from client', async (t) => {
  const mockMessages: EventMessage[] = [
    {
      info: { id: 'msg1', timestamp: Date.now() },
      parts: [{ type: 'text', text: 'Hello' }],
    } as any,
    {
      info: { id: 'msg2', timestamp: Date.now() },
      parts: [{ type: 'text', text: 'World' }],
    } as any,
  ];

  const mockClient = {
    session: {
      messages: sinon.stub().resolves({ data: mockMessages }),
    },
  };

  const result = await getSessionMessages(mockClient, 'session-123');

  t.true(mockClient.session.messages.calledOnceWith({ path: { id: 'session-123' } }));
  t.is(result.length, 2);
  t.deepEqual(result, mockMessages);
});

test.serial('getSessionMessages handles client errors gracefully', async (t) => {
  const consoleErrorSpy = sinon.spy(console, 'error');

  const mockClient = {
    session: {
      messages: sinon.stub().rejects(new Error('Network error')),
    },
  };

  const result = await getSessionMessages(mockClient, 'session-123');

  t.true(
    consoleErrorSpy.calledWith(
      'Error fetching messages for session session-123:',
      sinon.match.instanceOf(Error),
    ),
  );
  t.deepEqual(result, []);
});

test.serial('getSessionMessages handles undefined data gracefully', async (t) => {
  const mockClient = {
    session: {
      messages: sinon.stub().resolves({ data: undefined }),
    },
  };

  const result = await getSessionMessages(mockClient, 'session-123');

  t.deepEqual(result, []);
});

test.serial('processSessionMessages processes all messages', async (t) => {
  const mockMessages: EventMessage[] = [
    {
      info: { id: 'msg1', timestamp: Date.now() },
      parts: [{ type: 'text', text: 'Hello' }],
    } as any,
    {
      info: { id: 'msg2', timestamp: Date.now() },
      parts: [{ type: 'text', text: 'World' }],
    } as any,
  ];

  const mockClient = {
    session: {
      messages: sinon.stub().resolves({ data: mockMessages }),
    },
  };

  const processMessageStub = sinon.stub();
  const context = { sessionStore };

  // Replace processMessage with stub for this test
  const originalModule = await import('../../actions/messages/index.js');
  sinon.stub(originalModule, 'processMessage').value(processMessageStub);

  await processSessionMessages(context, mockClient, 'session-123');

  t.true(mockClient.session.messages.calledOnceWith({ path: { id: 'session-123' } }));
  t.is(processMessageStub.callCount, 2);
  t.true(processMessageStub.calledWith(context, 'session-123', mockMessages[0]));
  t.true(processMessageStub.calledWith(context, 'session-123', mockMessages[1]));
});
