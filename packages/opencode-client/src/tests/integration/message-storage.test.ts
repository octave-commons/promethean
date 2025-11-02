import test from 'ava';
import { DualStoreManager, cleanupClients } from '@promethean-os/persistence';
import {
  processMessage,
  processSessionMessages,
  getSessionMessages,
} from '../../actions/messages/index.js';
import { messageToMarkdown } from '../../services/indexer-formatters.js';
import type { EventMessage } from '../../types/index.js';

test.before(async () => {
  // Ensure clean test environment
  await cleanupClients();
});

test.after.always(async () => {
  // Cleanup after tests
  await cleanupClients();
});

test.serial('processMessage stores complete message structure as JSON', async (t) => {
  const store = await DualStoreManager.create('test-messages', 'text', 'timestamp');
  const context = { sessionStore: store };

  const mockMessage: EventMessage = {
    info: {
      id: 'test-msg-1',
      role: 'user',
      sessionID: 'test-session-1',
      time: { created: Date.now() },
    },
    parts: [
      { type: 'text', text: 'Hello world' },
      { type: 'text', text: 'This is a test message' },
    ],
  };

  await processMessage(context, 'test-session-1', mockMessage);

  // Verify that message was stored using getMostRelevant
  const results = await store.getMostRelevant(['test-msg-1'], 1);

  t.is(results.length, 1);

  const storedEntry = results[0];
  if (!storedEntry) {
    t.fail('Expected stored entry to be found');
    return;
  }

  t.true(typeof storedEntry.text === 'string');
  t.true(storedEntry.text.startsWith('{'));

  // Verify JSON structure
  const parsedMessage = JSON.parse(storedEntry.text);
  t.deepEqual(parsedMessage.info, mockMessage.info);
  t.deepEqual(parsedMessage.parts, mockMessage.parts);
  t.is(storedEntry.metadata?.messageID, 'test-msg-1');
  t.is(storedEntry.metadata?.sessionID, 'test-session-1');
  t.is(storedEntry.metadata?.role, 'user');
});

test.serial('processMessage handles empty parts gracefully', async (t) => {
  const store = await DualStoreManager.create('test-messages-empty', 'text', 'timestamp');
  const context = { sessionStore: store };

  const mockMessage: EventMessage = {
    info: {
      id: 'test-msg-empty',
      role: 'assistant',
      sessionID: 'test-session-empty',
      time: { created: Date.now() },
    },
    parts: [],
  };

  await processMessage(context, 'test-session-empty', mockMessage);

  // Should not store anything when no text content
  const results = await store.getMostRelevant(['test-msg-empty'], 1);

  t.is(results.length, 0);
});

test.serial('processMessage filters out empty text parts', async (t) => {
  const store = await DualStoreManager.create('test-messages-filter', 'text', 'timestamp');
  const context = { sessionStore: store };

  const mockMessage: EventMessage = {
    info: {
      id: 'test-msg-filter',
      role: 'user',
      sessionID: 'test-session-filter',
      time: { created: Date.now() },
    },
    parts: [
      { type: 'text', text: '' }, // Empty text should be filtered
      { type: 'text', text: '   ' }, // Whitespace only should be filtered
      { type: 'text', text: 'Valid content' }, // This should be kept
      { type: 'image', url: 'http://example.com/image.png' }, // Non-text should be filtered
    ],
  };

  await processMessage(context, 'test-session-filter', mockMessage);

  const results = await store.getMostRelevant(['test-msg-filter'], 1);

  t.is(results.length, 1);

  const resultEntry = results[0];
  if (!resultEntry) {
    t.fail('Expected filtered entry to be found');
    return;
  }

  const parsedMessage = JSON.parse(resultEntry.text);

  // Should only contain valid text part
  t.is(parsedMessage.parts.length, 1);
  t.is(parsedMessage.parts[0].text, 'Valid content');
});

test.serial('messageToMarkdown handles new JSON format', async (t) => {
  const messageEntry = {
    id: 'test-entry-1',
    text: JSON.stringify({
      info: {
        id: 'test-msg-1',
        role: 'user',
        time: { created: 1640995200000 }, // 2022-01-01 00:00:00
      },
      parts: [
        { type: 'text', text: 'Hello world' },
        { type: 'text', text: 'Second part' },
      ],
    }),
    timestamp: '2022-01-01T00:00:00.000Z',
  };

  const markdown = messageToMarkdown(messageEntry);

  t.true(markdown.includes('# Message: test-msg-1'));
  t.true(markdown.includes('**Role:** user'));
  t.true(markdown.includes('**Timestamp:** 1/1/2022, 12:00:00 AM'));
  t.true(markdown.includes('**Message ID:** test-msg-1'));
  t.true(markdown.includes('Hello world'));
  t.true(markdown.includes('Second part'));
});

test.serial('messageToMarkdown handles legacy plain text format', async (t) => {
  const messageEntry = {
    id: 'legacy-entry-1',
    text: 'This is a legacy message',
    timestamp: '2022-01-01T00:00:00.000Z',
  };

  const markdown = messageToMarkdown(messageEntry);

  t.true(markdown.includes('# Message: legacy-entry-1'));
  t.true(markdown.includes('**Role:** unknown'));
  t.true(markdown.includes('**Timestamp:** 1/1/2022, 12:00:00 AM'));
  t.true(markdown.includes('**Message ID:** legacy-entry-1'));
  t.true(markdown.includes('This is a legacy message'));
});

test.serial('messageToMarkdown handles malformed JSON gracefully', async (t) => {
  const messageEntry = {
    id: 'malformed-entry-1',
    text: '{"info": {"id": "test", "role": "user"', // Malformed JSON
    timestamp: '2022-01-01T00:00:00.000Z',
  };

  const markdown = messageToMarkdown(messageEntry);

  // Should fallback to treating as plain text
  t.true(markdown.includes('# Message: malformed-entry-1'));
  t.true(markdown.includes('**Role:** unknown'));
  t.true(markdown.includes('{"info": {"id": "test", "role": "user"'));
});

test.serial('messageToMarkdown handles direct message structure (legacy)', async (t) => {
  const directMessage = {
    info: {
      id: 'direct-msg-1',
      role: 'assistant',
      time: { created: 1640995200000 },
    },
    parts: [{ type: 'text', text: 'Direct message content' }],
  };

  const markdown = messageToMarkdown(directMessage);

  t.true(markdown.includes('# Message: direct-msg-1'));
  t.true(markdown.includes('**Role:** assistant'));
  t.true(markdown.includes('**Message ID:** direct-msg-1'));
  t.true(markdown.includes('Direct message content'));
});

test.serial('processSessionMessages processes all messages in a session', async (t) => {
  const store = await DualStoreManager.create('test-session-messages', 'text', 'timestamp');
  const context = { sessionStore: store };

  // Mock client with multiple messages
  const mockClient = {
    session: {
      messages: async () => ({
        data: [
          {
            info: { id: 'session-msg-1', role: 'user', time: { created: Date.now() } },
            parts: [{ type: 'text', text: 'First message' }],
          },
          {
            info: { id: 'session-msg-2', role: 'assistant', time: { created: Date.now() } },
            parts: [{ type: 'text', text: 'Second message' }],
          },
        ],
      }),
    },
  };

  await processSessionMessages(context, mockClient, 'test-session-multi');

  // Verify both messages were stored
  const results = await store.getMostRelevant(['session-msg'], 2);

  t.is(results.length, 2);

  // Verify message content
  const parsedMessages = results
    .map((entry) => {
      if (!entry.text) return null;
      return JSON.parse(entry.text);
    })
    .filter(Boolean);

  const messageTexts = parsedMessages.map((msg) =>
    msg.parts.map((part: any) => part.text).join(' '),
  );

  t.true(messageTexts.some((text) => text.includes('First message')));
  t.true(messageTexts.some((text) => text.includes('Second message')));
});

test.serial('getSessionMessages handles API errors gracefully', async (t) => {
  const mockClient = {
    session: {
      messages: async () => {
        throw new Error('API Error');
      },
    },
  };

  const messages = await getSessionMessages(mockClient, 'error-session');

  t.deepEqual(messages, []);
});
