import test from 'ava';
import { DualStoreManager, cleanupClients } from '@promethean-os/persistence';
import { processMessage } from '../../actions/messages/index.js';
import { messageToMarkdown } from '../../services/indexer-formatters.js';
import type { EventMessage } from '../../types/index.js';

test.before(async () => {
  await cleanupClients();
});

test.after.always(async () => {
  await cleanupClients();
});

test.serial('message storage and formatting integration', async (t) => {
  const store = await DualStoreManager.create('test-integration', 'text', 'timestamp');
  const context = { sessionStore: store };

  const mockMessage: EventMessage = {
    info: {
      id: 'integration-test-msg',
      role: 'user',
      sessionID: 'integration-test-session',
      time: { created: Date.now() },
    },
    parts: [
      { type: 'text', text: 'Integration test message' },
      { type: 'text', text: 'Second part of test' },
    ],
  };

  // Test message storage
  await processMessage(context, 'integration-test-session', mockMessage);

  // Verify storage
  const results = await store.getMostRelevant(['integration-test-msg'], 1);
  t.is(results.length, 1);

  const storedEntry = results[0];
  if (!storedEntry) {
    t.fail('Expected stored entry to be found');
    return;
  }

  // Test JSON format
  t.true(typeof storedEntry.text === 'string');
  t.true(storedEntry.text.startsWith('{'));

  const parsedMessage = JSON.parse(storedEntry.text);
  t.deepEqual(parsedMessage.info, mockMessage.info);
  t.deepEqual(parsedMessage.parts, mockMessage.parts);

  // Test formatter with stored entry
  const markdown = messageToMarkdown(storedEntry);
  t.true(markdown.includes('# Message: integration-test-msg'));
  t.true(markdown.includes('**Role:** user'));
  t.true(markdown.includes('Integration test message'));
  t.true(markdown.includes('Second part of test'));

  // Test formatter with direct message (legacy format)
  const legacyMarkdown = messageToMarkdown(mockMessage);
  t.true(legacyMarkdown.includes('# Message: integration-test-msg'));
  t.true(legacyMarkdown.includes('**Role:** user'));
  t.true(legacyMarkdown.includes('Integration test message'));
});
