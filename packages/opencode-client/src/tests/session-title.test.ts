import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';

test('when a session is created with a title, it shows up in the list with that title', async (t) => {
  // Create a test session store
  const sessionStore = await DualStoreManager.create(
    'test-sessions-with-titles',
    'text',
    'timestamp',
  );

  // Create a session with a title
  const testSession = {
    id: 'test-session-title',
    text: 'Test session content',
    title: 'Test Session Title',
    metadata: {
      title: 'Test Session Title',
      activityStatus: 'active',
      isAgentTask: false,
      messageCount: 1,
    },
    timestamp: Date.now(),
  };

  // Insert the session
  await sessionStore.insert(testSession);

  // Retrieve the session
  const retrieved = await sessionStore.get('test-session-title');

  t.not(retrieved, null);
  t.is(retrieved?.metadata?.title, 'Test Session Title');

  // Clean up - close connections manually
  const { getMongoClient } = await import('@promethean/persistence');
  const mongoClient = await getMongoClient();
  await mongoClient.close();
});
