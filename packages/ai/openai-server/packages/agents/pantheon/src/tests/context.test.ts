/**
 * Context Module Tests
 * Comprehensive test suite for the unified context management system
 */

import test from 'ava';
import { 
  ContextManager,
  InMemoryEventStore,
  InMemorySnapshotStore,
  InMemoryShareStore,
  InMemoryMetadataStore,
  ContextLifecycleManager,
  AuthService,
  ContextSharingService,
  ContextMetadataService,
  SecurityValidator,
  SecurityLogger
} from '../context/index.js';
import type {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextShare,
  ContextMetadata,
  ContextStatistics,
  ContextLifecycleConfig
} from '../context/index.js';
import type {
  AgentId,
  ContextId
} from '../core/types/index.js';

// ============================================================================
// Test Setup and Utilities
// ============================================================================

const createTestContext = (agentId: string): AgentContext => ({
  id: agentId as AgentId,
  version: 1,
  state: { initialized: true },
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createTestEvent = (agentId: string, type: string, data: unknown): ContextEvent => ({
  id: `event-${Date.now()}-${Math.random()}`,
  agentId: agentId as AgentId,
  type,
  timestamp: new Date(),
  data,
});

const createTestSnapshot = (agentId: string, version: number): ContextSnapshot => ({
  id: `snapshot-${Date.now()}`,
  agentId: agentId as AgentId,
  version,
  state: { snapshot: true, version },
  timestamp: new Date(),
});

const createTestShare = (agentId: string): ContextShare => ({
  id: `share-${Date.now()}`,
  agentId: agentId as AgentId,
  sharedWith: 'test-user' as AgentId,
  permissions: ['read'],
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

const createTestMetadata = (agentId: string): ContextMetadata => ({
  id: { value: `meta-${Date.now()}` },
  agentId: agentId as AgentId,
  name: 'test-metadata',
  description: 'Test metadata entry',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['test'],
  permissions: { read: ['*'], write: ['admin'] }
});

// ============================================================================
// Security Tests
// ============================================================================

test('SecurityValidator validates agent IDs correctly', (t) => {
  t.notThrows(() => SecurityValidator.validateAgentId('valid-agent-123'));
  t.notThrows(() => SecurityValidator.validateAgentId('agent_with_underscores'));
  
  t.throws(() => SecurityValidator.validateAgentId(''), { message: /Agent ID cannot be empty/ });
  t.throws(() => SecurityValidator.validateAgentId('invalid agent with spaces'), { message: /Invalid agent ID format/ });
  t.throws(() => SecurityValidator.validateAgentId('invalid@agent'), { message: /Invalid agent ID format/ });
});

test('SecurityValidator sanitizes objects correctly', (t) => {
  const malicious = {
    safe: 'value',
    __proto__: { polluted: true },
    constructor: { prototype: { polluted: true } },
    nested: {
      safe: 'value',
      __proto__: { polluted: true }
    }
  };

  const sanitized = SecurityValidator.sanitizeObject(malicious);
  
  t.is(sanitized.safe, 'value');
  t.is(sanitized.nested.safe, 'value');
  t.false(Object.prototype.hasOwnProperty.call(sanitized, '__proto__'));
  t.false(Object.prototype.hasOwnProperty.call(sanitized, 'constructor'));
  t.false(Object.prototype.hasOwnProperty.call(sanitized.nested, '__proto__'));
});

test('SecurityLogger logs security events', (t) => {
  const originalConsoleLog = console.log;
  let loggedMessage = '';
  
  console.log = (message: string) => {
    loggedMessage = message;
  };

  SecurityLogger.log({
    type: 'data_access',
    severity: 'low',
    agentId: 'test-agent' as AgentId,
    action: 'test',
    details: { test: true }
  });

  t.true(loggedMessage.includes('SECURITY_LOG'));
  t.true(loggedMessage.includes('data_access'));
  t.true(loggedMessage.includes('test-agent'));

  console.log = originalConsoleLog;
});

// ============================================================================
// Context Manager Tests
// ============================================================================

test('ContextManager creates and retrieves contexts', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  const agentId = 'test-agent-1' as AgentId;
  
  // Create context
  const context = await contextManager.getContext(agentId);
  t.is(context.id, agentId);
  t.is(context.version, 1);
  t.deepEqual(context.state, {});
  
  // Update context
  const updatedContext = await contextManager.updateContext(agentId, {
    state: { test: 'value' }
  });
  t.is(updatedContext.state.test, 'value');
  t.is(updatedContext.version, 2);
  
  // Retrieve context
  const retrievedContext = await contextManager.getContext(agentId);
  t.deepEqual(retrievedContext.state, { test: 'value' });
  t.is(retrievedContext.version, 2);
});

test('ContextManager handles events correctly', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  const agentId = 'test-agent-2' as AgentId;
  const event = createTestEvent(agentId, 'test_event', { data: 'test' });
  
  // Append event
  await contextManager.appendEvent(event);
  
  // Retrieve events
  const events = await eventStore.getEvents(agentId);
  t.is(events.length, 1);
  t.is(events[0].type, 'test_event');
  t.deepEqual(events[0].data, { data: 'test' });
});

test('ContextManager creates snapshots correctly', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  const agentId = 'test-agent-3' as AgentId;
  
  // Update context to create state
  await contextManager.updateContext(agentId, {
    state: { snapshot: 'test' }
  });
  
  // Create snapshot
  const snapshot = await contextManager.createSnapshot(agentId);
  t.is(snapshot.agentId, agentId);
  t.deepEqual(snapshot.state, { snapshot: 'test' });
  
  // Retrieve snapshot
  const retrievedSnapshot = await snapshotStore.getLatestSnapshot(agentId);
  t.truthy(retrievedSnapshot);
  t.deepEqual(retrievedSnapshot!.state, { snapshot: 'test' });
});

// ============================================================================
// Lifecycle Manager Tests
// ============================================================================

test('ContextLifecycleManager creates contexts with initial state', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  const metadataStore = new InMemoryMetadataStore();
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore,
    metadataStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-4' as AgentId;
  const initialState = { initialized: true, data: 'test' };
  
  const context = await lifecycleManager.createContext(agentId, initialState);
  t.is(context.id, agentId);
  t.deepEqual(context.state, initialState);
});

test('ContextLifecycleManager archives contexts correctly', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-5' as AgentId;
  
  // Create context first
  await lifecycleManager.createContext(agentId, { test: 'data' });
  
  // Archive context
  await lifecycleManager.archiveContext(agentId);
  
  // Check for archive event
  const events = await eventStore.getEvents(agentId);
  const archiveEvent = events.find(e => e.type === 'context_archived');
  t.truthy(archiveEvent);
  t.deepEqual(archiveEvent!.data, {
    archivedAt: archiveEvent!.data.archivedAt, // Date object
    archivedBy: 'system'
  });
});

test('ContextLifecycleManager deletes contexts correctly', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  const metadataStore = new InMemoryMetadataStore();
  const shareStore = new InMemoryShareStore();
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore,
    metadataStore,
    shareStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-6' as AgentId;
  
  // Create context with metadata and shares
  await lifecycleManager.createContext(agentId, { test: 'data' });
  await metadataStore.setMetadata(createTestMetadata(agentId));
  await shareStore.createShare(createTestShare(agentId));
  
  // Delete context
  await lifecycleManager.deleteContext(agentId);
  
  // Check for deletion event
  const events = await eventStore.getEvents(agentId);
  const deleteEvent = events.find(e => e.type === 'context_deleted');
  t.truthy(deleteEvent);
  
  // Check metadata and shares are cleaned up
  const metadata = await metadataStore.getMetadata(agentId);
  const shares = await shareStore.getSharesForAgent(agentId);
  t.is(metadata.length, 0);
  t.is(shares.length, 0);
});

test('ContextLifecycleManager provides accurate statistics', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  const shareStore = new InMemoryShareStore();
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore,
    shareStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-7' as AgentId;
  
  // Create context with activity
  await lifecycleManager.createContext(agentId, { test: 'data' });
  await contextManager.appendEvent(createTestEvent(agentId, 'test', {}));
  await contextManager.createSnapshot(agentId);
  await shareStore.createShare(createTestShare(agentId));
  
  // Get statistics
  const stats = await lifecycleManager.getContextStatistics(agentId);
  t.is(stats.totalEvents, 2); // creation event + test event
  t.is(stats.totalSnapshots, 1);
  t.is(stats.totalShares, 1);
  t.is(stats.activeShares, 1);
  t.true(stats.contextSize > 0);
});

test('ContextLifecycleManager exports and imports contexts correctly', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  const metadataStore = new InMemoryMetadataStore();
  const shareStore = new InMemoryShareStore();
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore,
    metadataStore,
    shareStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-8' as AgentId;
  
  // Create rich context
  await lifecycleManager.createContext(agentId, { test: 'data' });
  await contextManager.appendEvent(createTestEvent(agentId, 'test', {}));
  await metadataStore.setMetadata(createTestMetadata(agentId));
  await shareStore.createShare(createTestShare(agentId));
  
  // Export context
  const exportData = await lifecycleManager.exportContext(agentId);
  t.is(exportData.events.length, 2); // creation event + test event
  t.is(exportData.metadata.length, 1);
  t.is(exportData.shares.length, 1);
  
  // Import to new agent
  const newAgentId = 'test-agent-9' as AgentId;
  await lifecycleManager.importContext(newAgentId, exportData);
  
  // Verify import
  const newContext = await contextManager.getContext(newAgentId);
  t.deepEqual(newContext.state, { test: 'data' });
  
  const newEvents = await eventStore.getEvents(newAgentId);
  t.is(newEvents.length, 2);
  
  const newMetadata = await metadataStore.getMetadata(newAgentId);
  t.is(newMetadata.length, 1);
  
  const newShares = await shareStore.getSharesForAgent(newAgentId);
  t.is(newShares.length, 1);
});

test('ContextLifecycleManager validates context integrity', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'test-agent-10' as AgentId;
  
  // Test non-existent context
  const result1 = await lifecycleManager.validateContextIntegrity(agentId);
  t.false(result1.isValid);
  t.true(result1.issues.some(issue => issue.includes('Context does not exist')));
  
  // Create valid context
  await lifecycleManager.createContext(agentId, { test: 'data' });
  
  const result2 = await lifecycleManager.validateContextIntegrity(agentId);
  t.true(result2.isValid);
  t.is(result2.issues.length, 0);
});

// ============================================================================
// Authentication Service Tests
// ============================================================================

test('AuthService generates and validates tokens', async (t) => {
  const authService = new AuthService('test-secret');
  const agentId = 'test-agent-11' as AgentId;
  
  // Generate token
  const token = await authService.generateToken(agentId);
  t.is(typeof token, 'string');
  t.true(token.length > 0);
  
  // Validate token
  const payload = await authService.validateToken(token);
  t.truthy(payload);
  t.is(payload!.agentId, agentId);
  t.true(payload!.exp > Date.now() / 1000);
  
  // Test invalid token
  const invalidPayload = await authService.validateToken('invalid-token');
  t.falsy(invalidPayload);
});

test('AuthService manages API keys', async (t) => {
  const authService = new AuthService('test-secret');
  const agentId = 'test-agent-12' as AgentId;
  
  // Create API key
  const apiKey = await authService.createApiKey(agentId, ['read', 'write']);
  t.is(typeof apiKey.key, 'string');
  t.true(apiKey.key.startsWith('pk_'));
  t.deepEqual(apiKey.permissions, ['read', 'write']);
  
  // Validate API key
  const validatedKey = await authService.validateApiKey(apiKey.key);
  t.truthy(validatedKey);
  t.is(validatedKey!.agentId, agentId);
  t.deepEqual(validatedKey!.permissions, ['read', 'write']);
  
  // Revoke API key
  await authService.revokeApiKey(apiKey.key);
  const revokedKey = await authService.validateApiKey(apiKey.key);
  t.falsy(revokedKey);
});

// ============================================================================
// Context Sharing Service Tests
// ============================================================================

test('ContextSharingService creates and manages shares', async (t) => {
  const shareStore = new InMemoryShareStore();
  const sharingService = new ContextSharingService(shareStore);
  
  const agentId = 'test-agent-13' as AgentId;
  const sharedWith = 'test-user' as AgentId;
  const permissions = ['read', 'write'];
  
  // Create share
  const share = await sharingService.createShare(agentId, sharedWith, permissions);
  t.is(share.agentId, agentId);
  t.is(share.sharedWith, sharedWith);
  t.deepEqual(share.permissions, permissions);
  
  // Get share
  const retrievedShare = await sharingService.getShare(share.id);
  t.truthy(retrievedShare);
  t.is(retrievedShare!.id, share.id);
  
  // Check permissions
  const hasPermission = await sharingService.hasPermission(share.id, sharedWith, 'read');
  t.true(hasPermission);
  
  const noPermission = await sharingService.hasPermission(share.id, sharedWith, 'admin');
  t.false(noPermission);
  
  // Revoke share
  await sharingService.revokeShare(share.id);
  const revokedShare = await sharingService.getShare(share.id);
  t.falsy(revokedShare);
});

// ============================================================================
// Context Metadata Service Tests
// ============================================================================

test('ContextMetadataService manages metadata', async (t) => {
  const metadataStore = new InMemoryMetadataStore();
  const metadataService = new ContextMetadataService(metadataStore);
  
  const agentId = 'test-agent-14' as AgentId;
  const metadata = createTestMetadata(agentId);
  
  // Set metadata
  await metadataService.setMetadata(metadata);
  
  // Get metadata
  const retrievedMetadata = await metadataService.getMetadata(agentId, metadata.name);
  t.truthy(retrievedMetadata);
  t.is(retrievedMetadata!.name, metadata.name);
  
  // Get all metadata
  const allMetadata = await metadataService.getAllMetadata(agentId);
  t.is(allMetadata.length, 1);
  t.is(allMetadata[0].name, metadata.name);
  
  // Update metadata
  const updatedMetadata = { ...metadata, description: 'Updated description' };
  await metadataService.updateMetadata(agentId, metadata.name, updatedMetadata);
  
  const updated = await metadataService.getMetadata(agentId, metadata.name);
  t.is(updated!.description, 'Updated description');
  
  // Delete metadata
  await metadataService.deleteMetadata(agentId, metadata.name);
  const deleted = await metadataService.getMetadata(agentId, metadata.name);
  t.falsy(deleted);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('Full context lifecycle integration', async (t) => {
  // Setup all services
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  const metadataStore = new InMemoryMetadataStore();
  const shareStore = new InMemoryShareStore();
  const authService = new AuthService('integration-test-secret');
  const sharingService = new ContextSharingService(shareStore);
  const metadataService = new ContextMetadataService(metadataStore);
  
  const config: ContextLifecycleConfig = {
    contextManager,
    eventStore,
    snapshotStore,
    metadataStore,
    shareStore
  };
  
  const lifecycleManager = new ContextLifecycleManager(config);
  const agentId = 'integration-agent' as AgentId;
  
  // 1. Create context with authentication
  const token = await authService.generateToken(agentId);
  const authPayload = await authService.validateToken(token);
  t.truthy(authPayload);
  t.is(authPayload!.agentId, agentId);
  
  // 2. Create context with initial state
  const initialState = { 
    initialized: true, 
    data: 'integration-test',
    timestamp: Date.now()
  };
  const context = await lifecycleManager.createContext(agentId, initialState);
  t.deepEqual(context.state, initialState);
  
  // 3. Add some activity
  await contextManager.appendEvent(createTestEvent(agentId, 'user_action', { action: 'test' }));
  await contextManager.appendEvent(createTestEvent(agentId, 'system_event', { status: 'active' }));
  
  // 4. Create metadata
  const metadata = createTestMetadata(agentId);
  await metadataService.setMetadata(metadata);
  
  // 5. Create shares
  const share = await sharingService.createShare(agentId, 'shared-user' as AgentId, ['read']);
  t.truthy(share);
  
  // 6. Create snapshot
  const snapshot = await contextManager.createSnapshot(agentId);
  t.truthy(snapshot);
  
  // 7. Get comprehensive statistics
  const stats = await lifecycleManager.getContextStatistics(agentId);
  t.is(stats.totalEvents, 3); // creation + 2 events
  t.is(stats.totalSnapshots, 1);
  t.is(stats.totalShares, 1);
  t.true(stats.contextSize > 0);
  
  // 8. Validate integrity
  const validation = await lifecycleManager.validateContextIntegrity(agentId);
  t.true(validation.isValid);
  t.is(validation.issues.length, 0);
  
  // 9. Export context
  const exportData = await lifecycleManager.exportContext(agentId);
  t.is(exportData.events.length, 3);
  t.is(exportData.snapshots.length, 1);
  t.is(exportData.metadata.length, 1);
  t.is(exportData.shares.length, 1);
  
  // 10. Import to new context
  const newAgentId = 'imported-agent' as AgentId;
  await lifecycleManager.importContext(newAgentId, exportData);
  
  // 11. Verify imported context
  const importedContext = await contextManager.getContext(newAgentId);
  t.deepEqual(importedContext.state, initialState);
  
  const importedStats = await lifecycleManager.getContextStatistics(newAgentId);
  t.is(importedStats.totalEvents, 3);
  t.is(importedStats.totalSnapshots, 1);
  
  // 12. Cleanup
  await lifecycleManager.deleteContext(agentId);
  await lifecycleManager.deleteContext(newAgentId);
  
  // Verify deletion
  const originalEvents = await eventStore.getEvents(agentId);
  const importedEvents = await eventStore.getEvents(newAgentId);
  t.true(originalEvents.some(e => e.type === 'context_deleted'));
  t.true(importedEvents.some(e => e.type === 'context_deleted'));
});

// ============================================================================
// Error Handling Tests
// ============================================================================

test('Error handling for invalid operations', async (t) => {
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const contextManager = new ContextManager(eventStore, snapshotStore);
  
  // Test invalid agent ID
  await t.throwsAsync(
    () => contextManager.getContext('' as AgentId),
    { message: /Agent ID cannot be empty/ }
  );
  
  await t.throwsAsync(
    () => contextManager.getContext('invalid agent id' as AgentId),
    { message: /Invalid agent ID format/ }
  );
  
  // Test operations on non-existent context (should not throw)
  const nonExistentContext = await contextManager.getContext('non-existent' as AgentId);
  t.is(nonExistentContext.id, 'non-existent');
  t.is(nonExistentContext.version, 1);
  t.deepEqual(nonExistentContext.state, {});
});

test('Rate limiting functionality', async (t) => {
  const originalConsoleLog = console.log;
  let loggedMessages: string[] = [];
  
  console.log = (message: string) => {
    loggedMessages.push(message);
  };

  try {
    // Simulate rapid requests to trigger rate limiting
    for (let i = 0; i < 150; i++) {
      SecurityValidator.validateAgentId(`test-agent-${i}`);
    }
    
    // Check if rate limiting warnings were logged
    const rateLimitLogs = loggedMessages.filter(msg => msg.includes('Rate limit'));
    t.true(rateLimitLogs.length > 0);
  } finally {
    console.log = originalConsoleLog;
  }
});