import test from 'ava';
import { ContextMetadataService } from '../context-metadata.js';
import { MockMetadataStore } from './utils/mocks.js';

test.serial('ContextMetadataService: should set and retrieve metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';
  const key = 'user-preferences';
  const value = { theme: 'dark', language: 'en' };

  // Set metadata
  const metadata = await metadataService.setMetadata(agentId, key, value);

  t.is(metadata.agentId, agentId);
  t.is(metadata.contextKey, key);
  t.deepEqual(metadata.contextValue, value);
  t.truthy(metadata.id);
  t.truthy(metadata.createdAt);
  t.truthy(metadata.updatedAt);

  // Retrieve metadata
  const retrieved = await metadataService.getMetadata(agentId, key);
  t.is(retrieved.length, 1);
  t.deepEqual(retrieved[0]?.contextValue, value);
});

test.serial('ContextMetadataService: should update existing metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';
  const key = 'user-preferences';
  const initialValue = { theme: 'dark', language: 'en' };
  const updatedValue = { theme: 'light', language: 'fr' };

  // Set initial metadata
  await metadataService.setMetadata(agentId, key, initialValue);

  // Update metadata
  const updated = await metadataService.updateMetadata(agentId, key, updatedValue);

  t.deepEqual(updated.contextValue, updatedValue);
  t.true(updated.updatedAt > updated.createdAt);

  // Verify update
  const retrieved = await metadataService.getMetadata(agentId, key);
  t.deepEqual(retrieved[0]?.contextValue, updatedValue);
});

test.serial('ContextMetadataService: should delete metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';
  const key = 'user-preferences';
  const value = { theme: 'dark', language: 'en' };

  // Set metadata
  await metadataService.setMetadata(agentId, key, value);

  // Verify it exists
  let retrieved = await metadataService.getMetadata(agentId, key);
  t.is(retrieved.length, 1);

  // Delete metadata
  await metadataService.deleteMetadata(agentId, key);

  // Verify it's gone
  retrieved = await metadataService.getMetadata(agentId, key);
  t.is(retrieved.length, 0);
});

test.serial('ContextMetadataService: should query metadata with filters', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set multiple metadata entries
  await metadataService.setMetadata(agentId, 'preferences', { theme: 'dark' });
  await metadataService.setMetadata(agentId, 'cache', { size: 100 });
  await metadataService.setMetadata(agentId, 'session', { id: 'sess-123' });

  // Query all metadata for agent
  const allMetadata = await metadataService.queryMetadata({
    agentId,
  });
  t.is(allMetadata.length, 3);

  // Query with key pattern
  const preferencesMetadata = await metadataService.queryMetadata({
    agentId,
    keyPattern: 'preferences',
  });
  t.is(preferencesMetadata.length, 1);
  t.is(preferencesMetadata[0]?.contextKey, 'preferences');

  // Query by type
  const genericMetadata = await metadataService.queryMetadata({
    agentId,
    contextType: 'generic',
  });
  t.is(genericMetadata.length, 3);
});

test.serial('ContextMetadataService: should handle metadata expiration', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';
  const key = 'temporary-data';

  // Set metadata with expiration in the past
  const pastDate = new Date(Date.now() - 1000); // 1 second ago
  await metadataService.setMetadata(
    agentId,
    key,
    { temp: true },
    {
      expiresAt: pastDate,
    },
  );

  // Set metadata with expiration in the future
  const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
  await metadataService.setMetadata(
    agentId,
    'future-data',
    { future: true },
    {
      expiresAt: futureDate,
    },
  );

  // Query should only return non-expired metadata
  const activeMetadata = await metadataService.queryMetadata({
    agentId,
  });
  t.is(activeMetadata.length, 1);
  t.is(activeMetadata[0]?.contextKey, 'future-data');

  // Cleanup expired metadata
  const cleanedCount = await metadataService.cleanupExpired();
  t.is(cleanedCount, 1);

  // Verify expired metadata is gone
  const remainingMetadata = await metadataStore.getMetadata(agentId);
  t.is(remainingMetadata.length, 1);
  t.is(remainingMetadata[0]?.contextKey, 'future-data');
});

test.serial('ContextMetadataService: should search by value', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set multiple metadata entries
  await metadataService.setMetadata(agentId, 'user-profile', { name: 'John', age: 30 });
  await metadataService.setMetadata(agentId, 'system-config', { debug: true, version: '1.0' });
  await metadataService.setMetadata(agentId, 'cache', { size: 100, ttl: 3600 });

  // Search for values containing 'debug'
  const debugResults = await metadataService.searchByValue(agentId, 'debug');
  t.is(debugResults.length, 1);
  t.is(debugResults[0]?.contextKey, 'system-config');

  // Search for values containing 'John'
  const johnResults = await metadataService.searchByValue(agentId, 'John');
  t.is(johnResults.length, 1);
  t.is(johnResults[0]?.contextKey, 'user-profile');

  // Search with type filter
  const genericResults = await metadataService.searchByValue(agentId, 'true', {
    type: 'generic',
  });
  t.is(genericResults.length, 1);
});

test.serial('ContextMetadataService: should handle visibility levels', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set metadata with different visibility levels
  await metadataService.setMetadata(
    agentId,
    'private-data',
    { secret: 'shhh' },
    {
      visibility: 'private',
    },
  );

  await metadataService.setMetadata(
    agentId,
    'shared-data',
    { team: 'dev' },
    {
      visibility: 'shared',
    },
  );

  await metadataService.setMetadata(
    agentId,
    'public-data',
    { status: 'online' },
    {
      visibility: 'public',
    },
  );

  // Get private metadata (should return all for the agent)
  const privateMetadata = await metadataService.queryMetadata({
    agentId,
    visibility: 'private',
  });
  t.is(privateMetadata.length, 1);
  t.is(privateMetadata[0]?.contextKey, 'private-data');

  // Get shared metadata
  const sharedMetadata = await metadataService.getSharedMetadata(agentId);
  t.is(sharedMetadata.length, 1);
  t.is(sharedMetadata[0]?.contextKey, 'shared-data');

  // Get public metadata
  const publicMetadata = await metadataService.getPublicMetadata(agentId);
  t.is(publicMetadata.length, 1);
  t.is(publicMetadata[0]?.contextKey, 'public-data');
});

test.serial('ContextMetadataService: should handle topic metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set topic metadata
  await metadataService.setTopicMetadata(agentId, 'weather', {
    temperature: 72,
    condition: 'sunny',
  });

  await metadataService.setTopicMetadata(agentId, 'news', {
    headlines: ['Tech news', 'World news'],
  });

  // Get topics
  const topics = await metadataService.getTopics(agentId);
  t.is(topics.length, 2);
  t.true(topics.includes('weather'));
  t.true(topics.includes('news'));

  // Get metadata by type
  const topicMetadata = await metadataService.getMetadataByType(agentId, 'topic');
  t.is(topicMetadata.length, 2);
  t.true(topicMetadata.some((meta) => meta.contextKey === 'topic:weather'));
  t.true(topicMetadata.some((meta) => meta.contextKey === 'topic:news'));
});

test.serial('ContextMetadataService: should handle participant metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set participant metadata
  await metadataService.setParticipantMetadata(agentId, 'user-123', {
    name: 'Alice',
    role: 'admin',
  });

  await metadataService.setParticipantMetadata(agentId, 'user-456', {
    name: 'Bob',
    role: 'user',
  });

  // Get participants
  const participants = await metadataService.getParticipants(agentId);
  t.is(participants.length, 2);
  t.true(participants.includes('user-123'));
  t.true(participants.includes('user-456'));

  // Get metadata by type
  const participantMetadata = await metadataService.getMetadataByType(agentId, 'participant');
  t.is(participantMetadata.length, 2);
});

test.serial('ContextMetadataService: should handle session metadata', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  const agentId = 'agent-1';

  // Set session metadata
  await metadataService.setSessionMetadata(agentId, 'session-123', {
    startTime: new Date(),
    userAgent: 'Mozilla/5.0',
  });

  await metadataService.setSessionMetadata(agentId, 'session-456', {
    startTime: new Date(),
    userAgent: 'Chrome/91.0',
  });

  // Get sessions
  const sessions = await metadataService.getSessions(agentId);
  t.is(sessions.length, 2);
  t.true(sessions.includes('session-123'));
  t.true(sessions.includes('session-456'));

  // Get metadata by type
  const sessionMetadata = await metadataService.getMetadataByType(agentId, 'session');
  t.is(sessionMetadata.length, 2);
});

test.serial('ContextMetadataService: should handle errors gracefully', async (t) => {
  const metadataStore = new MockMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);

  // Try to update non-existent metadata
  await t.throwsAsync(
    async () => {
      await metadataService.updateMetadata('agent-1', 'non-existent', { value: 1 });
    },
    { message: /not found/ },
  );

  // Try to delete non-existent metadata (should not throw)
  await t.notThrowsAsync(async () => {
    await metadataService.deleteMetadata('agent-1', 'non-existent');
  });

  // Search for non-existent value should return empty array
  const results = await metadataService.searchByValue('agent-1', 'non-existent');
  t.is(results.length, 0);
});
