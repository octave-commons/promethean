# Pantheon Persistence Examples

This document provides practical examples and integration patterns for using [pantheon-persistence](../packages/pantheon/pantheon-persistence.md) in various scenarios.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Multi-Source Context Compilation](#multi-source-context-compilation)
- [Custom Resolvers](#custom-resolvers)
- [Dynamic Store Management](#dynamic-store-management)
- [Integration with Pantheon Framework](#integration-with-pantheon-framework)
- [Advanced Patterns](#advanced-patterns)
- [Testing Examples](#testing-examples)
- [Performance Optimization](#performance-optimization)

## Basic Setup

### Minimal Configuration

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

// Create a simple adapter with default resolvers
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: async () => [await DualStoreManager.create('sessions', 'text', 'createdAt')],
});

// Use the adapter
const context = await adapter.compile({
  sources: [{ id: 'sessions', label: 'Chat Sessions' }],
  recentLimit: 10,
});

console.log('Compiled context:', context);
```

### Environment-Based Configuration

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

const createAdapter = async () => {
  const managers = [];

  // Conditionally create stores based on environment
  if (process.env.ENABLE_CHAT_SESSIONS === 'true') {
    managers.push(await DualStoreManager.create('chat-sessions', 'text', 'createdAt'));
  }

  if (process.env.ENABLE_AGENT_TASKS === 'true') {
    managers.push(await DualStoreManager.create('agent-tasks', 'description', 'dueDate'));
  }

  if (process.env.ENABLE_USER_DATA === 'true') {
    managers.push(await DualStoreManager.create('user-profiles', 'bio', 'updatedAt'));
  }

  return makePantheonPersistenceAdapter({
    getStoreManagers: () => Promise.resolve(managers),

    // Environment-specific resolvers
    resolveRole:
      process.env.NODE_ENV === 'production'
        ? (meta) => meta?.verifiedRole || 'system'
        : (meta) => meta?.role || 'system',

    resolveName:
      process.env.SHOW_USERNAMES === 'true'
        ? (meta) => meta?.username || meta?.displayName || 'Anonymous'
        : (meta) => meta?.displayName || 'User',

    formatTime:
      process.env.USE_RELATIVE_TIME === 'true'
        ? (ms) => getRelativeTime(ms)
        : (ms) => new Date(ms).toISOString(),
  });
};

const getRelativeTime = (ms: number): string => {
  const now = Date.now();
  const diff = now - ms;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ms).toLocaleDateString();
};
```

## Multi-Source Context Compilation

### Chat Application Example

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';
import type { ContextSource } from '@promethean-os/pantheon-core';

class ChatContextManager {
  private adapter: ContextPort;

  constructor() {
    this.adapter = makePantheonPersistenceAdapter({
      getStoreManagers: async () => {
        return [
          await DualStoreManager.create('messages', 'content', 'timestamp'),
          await DualStoreManager.create('user-profiles', 'bio', 'updatedAt'),
          await DualStoreManager.create('conversation-context', 'summary', 'lastUpdated'),
          await DualStoreManager.create('system-prompts', 'text', 'version'),
        ];
      },

      resolveRole: (meta) => {
        switch (meta?.source) {
          case 'messages':
            return meta?.senderType === 'human' ? 'user' : 'assistant';
          case 'system-prompts':
            return 'system';
          case 'user-profiles':
          case 'conversation-context':
            return 'system';
          default:
            return meta?.role || 'system';
        }
      },

      resolveName: (meta) => {
        if (meta?.username) return meta.username;
        if (meta?.displayName) return meta.displayName;
        if (meta?.agentName) return `🤖 ${meta.agentName}`;
        if (meta?.source === 'system-prompts') return '🔧 System';
        if (meta?.source === 'conversation-context') return '📝 Context';
        return 'Unknown';
      },

      formatTime: (ms) => {
        const date = new Date(ms);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }

        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    });
  }

  async getConversationContext(
    userId: string,
    conversationId: string,
    options: {
      includeUserProfile?: boolean;
      includeSystemPrompts?: boolean;
      maxMessages?: number;
    } = {},
  ) {
    const sources: ContextSource[] = [
      {
        id: 'messages',
        label: 'Chat Messages',
        where: {
          userId,
          conversationId,
          isDeleted: false,
        },
      },
    ];

    if (options.includeUserProfile) {
      sources.push({
        id: 'user-profiles',
        label: 'User Profile',
        where: { userId },
      });
    }

    if (options.includeSystemPrompts) {
      sources.push({
        id: 'system-prompts',
        label: 'System Instructions',
        where: { isActive: true },
      });
    }

    sources.push({
      id: 'conversation-context',
      label: 'Conversation Summary',
      where: { conversationId },
    });

    return this.adapter.compile({
      sources,
      recentLimit: options.maxMessages || 50,
      queryLimit: 10,
      limit: 100,
    });
  }

  async getAgentContext(agentId: string, taskType?: string) {
    const sources: ContextSource[] = [
      {
        id: 'messages',
        label: 'Recent Messages',
        where: {
          agentId,
          timestamp: { $gte: Date.now() - 24 * 60 * 60 * 1000 }, // Last 24 hours
        },
      },
      {
        id: 'conversation-context',
        label: 'Active Conversations',
        where: {
          agentId,
          status: 'active',
        },
      },
    ];

    if (taskType) {
      sources.push({
        id: 'agent-tasks',
        label: `${taskType} Tasks`,
        where: {
          agentId,
          taskType,
          status: { $in: ['pending', 'in_progress'] },
        },
      });
    }

    return this.adapter.compile({
      sources,
      recentLimit: 20,
      queryLimit: 5,
    });
  }
}

// Usage
const chatManager = new ChatContextManager();

// Get context for a specific conversation
const context = await chatManager.getConversationContext('user123', 'conv456', {
  includeUserProfile: true,
  includeSystemPrompts: true,
  maxMessages: 30,
});

console.log('Conversation context:', context);
```

### Multi-Tenant Application

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

class MultiTenantContextManager {
  private adapters = new Map<string, ContextPort>();

  async getAdapter(tenantId: string): Promise<ContextPort> {
    if (this.adapters.has(tenantId)) {
      return this.adapters.get(tenantId)!;
    }

    const adapter = makePantheonPersistenceAdapter({
      getStoreManagers: async () => {
        const tenantPrefix = `tenant_${tenantId}`;

        return [
          await DualStoreManager.create(`${tenantPrefix}_messages`, 'text', 'createdAt'),
          await DualStoreManager.create(`${tenantPrefix}_documents`, 'content', 'updatedAt'),
          await DualStoreManager.create(`${tenantPrefix}_users`, 'profile', 'lastSeen'),
          await DualStoreManager.create(`${tenantPrefix}_workflows`, 'definition', 'version'),
        ];
      },

      resolveRole: (meta) => {
        // Tenant-specific role resolution
        const tenantRole = meta?.[`${tenantId}_role`];
        if (tenantRole) return tenantRole;

        return meta?.role || 'system';
      },

      resolveName: (meta) => {
        // Privacy-aware name resolution
        if (meta?.privacyLevel === 'private') {
          return `User ${meta?.userId?.slice(-4) || 'Unknown'}`;
        }

        return meta?.displayName || meta?.name || 'Anonymous';
      },

      formatTime: (ms) => {
        // Tenant-specific timezone handling
        const tenantTimezone = meta?.timezone || 'UTC';
        return new Date(ms).toLocaleString('en-US', {
          timeZone: tenantTimezone,
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    });

    this.adapters.set(tenantId, adapter);
    return adapter;
  }

  async compileTenantContext(
    tenantId: string,
    sources: Array<{ id: string; label: string; where?: any }>,
    options: any = {},
  ) {
    const adapter = await this.getAdapter(tenantId);
    return adapter.compile({
      sources,
      ...options,
    });
  }

  async cleanupTenant(tenantId: string) {
    const adapter = this.adapters.get(tenantId);
    if (adapter) {
      // Cleanup would need to be implemented in the adapter
      this.adapters.delete(tenantId);
    }
  }
}

// Usage
const tenantManager = new MultiTenantContextManager();

const context = await tenantManager.compileTenantContext(
  'acme-corp',
  [
    { id: 'tenant_acme-corp_messages', label: 'Messages' },
    { id: 'tenant_acme-corp_documents', label: 'Documents' },
  ],
  { recentLimit: 20 },
);
```

## Custom Resolvers

### Role Resolution Based on Content Analysis

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';

const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  resolveRole: (meta) => {
    // 1. Explicit role in metadata
    if (meta?.role && ['system', 'user', 'assistant'].includes(meta.role)) {
      return meta.role;
    }

    // 2. Content-based analysis
    const content = meta?.text || meta?.content || '';

    // Check for system messages
    if (
      content.startsWith('System:') ||
      content.startsWith('[SYSTEM]') ||
      meta?.isSystemGenerated ||
      meta?.source?.includes('system')
    ) {
      return 'system';
    }

    // Check for AI responses
    if (
      content.includes('[ASSISTANT]:') ||
      content.includes('AI:') ||
      meta?.isAIResponse ||
      meta?.model ||
      meta?.temperature !== undefined ||
      meta?.source?.includes('agent') ||
      meta?.source?.includes('ai')
    ) {
      return 'assistant';
    }

    // Check for user messages
    if (
      meta?.isUserInput ||
      meta?.userId ||
      meta?.username ||
      meta?.source?.includes('user') ||
      meta?.source?.includes('human')
    ) {
      return 'user';
    }

    // 3. Pattern-based detection
    const userPatterns = [
      /^(hi|hello|hey|help|please|can you|could you)/i,
      /\b(my|I|me|mine)\b/i,
      /\b(question|ask|want|need)\b/i,
    ];

    const assistantPatterns = [
      /^(I can|I will|Here is|Let me|Based on)/i,
      /\b(answer|solution|recommendation|suggestion)\b/i,
      /\b(certainly|definitely|absolutely)\b/i,
    ];

    if (userPatterns.some((pattern) => pattern.test(content))) {
      return 'user';
    }

    if (assistantPatterns.some((pattern) => pattern.test(content))) {
      return 'assistant';
    }

    // 4. Source-based inference
    if (meta?.source) {
      const source = meta.source.toLowerCase();
      if (source.includes('chat') || source.includes('message')) {
        return 'user';
      }
      if (source.includes('agent') || source.includes('ai') || source.includes('bot')) {
        return 'assistant';
      }
      if (source.includes('system') || source.includes('log')) {
        return 'system';
      }
    }

    // 5. Default fallback
    return 'system';
  },
});
```

### Advanced Name Resolution with Fallbacks

```typescript
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  resolveName: (meta) => {
    // Priority-based name resolution with rich fallbacks

    // 1. Human-readable display names (highest priority)
    if (meta?.displayName) return meta.displayName;
    if (meta?.fullName) return meta.fullName;
    if (meta?.preferredName) return meta.preferredName;

    // 2. Usernames and identifiers
    if (meta?.username) return meta.username;
    if (meta?.handle) return `@${meta.handle}`;
    if (meta?.email) {
      const [localPart] = meta.email.split('@');
      return localPart;
    }

    // 3. Agent-specific names
    if (meta?.agentName) {
      const emoji =
        meta.agentType === 'assistant' ? '🤖' : meta.agentType === 'analyst' ? '🔍' : '⚙️';
      return `${emoji} ${meta.agentName}`;
    }

    // 4. Role-based names
    if (meta?.role) {
      const roleEmojis = {
        system: '🔧',
        user: '👤',
        assistant: '🤖',
      };
      const emoji = roleEmojis[meta.role] || '📝';
      return `${emoji} ${meta.role.charAt(0).toUpperCase() + meta.role.slice(1)}`;
    }

    // 5. ID-based names with privacy
    if (meta?.userId) {
      if (meta?.privacyLevel === 'high') {
        return `User ****${meta.userId.slice(-4)}`;
      }
      return `User ${meta.userId}`;
    }

    if (meta?.sessionId) {
      return `Session ${meta.sessionId.slice(-8)}`;
    }

    if (meta?.id) {
      return `ID ${meta.id.slice(-8)}`;
    }

    // 6. Source-based names
    if (meta?.source) {
      const sourceNames = {
        'chat-messages': '💬 Chat',
        'agent-tasks': '📋 Tasks',
        'system-logs': '🔧 System',
        'user-profiles': '👤 Profile',
        documents: '📄 Documents',
      };
      return sourceNames[meta.source] || `📁 ${meta.source}`;
    }

    // 7. Type-based names
    if (meta?.type) {
      const typeNames = {
        'user-message': '👤 User',
        'assistant-response': '🤖 Assistant',
        'system-notification': '🔧 System',
        'task-update': '📋 Task',
        document: '📄 Document',
      };
      return typeNames[meta.type] || `📝 ${meta.type}`;
    }

    // 8. Final fallbacks
    if (meta?.name) return meta.name;
    if (meta?.title) return meta.title;
    if (meta?.label) return meta.label;

    return 'Unknown';
  },
});
```

### Sophisticated Time Formatting

```typescript
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  formatTime: (ms) => {
    const date = new Date(ms);
    const now = new Date();
    const diffMs = now.getTime() - ms;

    // Calculate time differences
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Very recent times
    if (diffSeconds < 30) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    // Within the last hour
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    // Today
    if (diffHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // This week
    if (diffWeeks < 1) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[date.getDay()]} ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // This year
    if (diffYears < 1) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Previous years
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
});
```

## Dynamic Store Management

### Context-Aware Store Management

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

class DynamicContextAdapter {
  private managers = new Map<string, DualStoreManager>();
  private adapter: ContextPort;
  private managerConfigs = new Map<string, any>();

  constructor() {
    this.adapter = makePantheonPersistenceAdapter({
      getStoreManagers: async () => {
        // Refresh managers based on current needs
        await this.ensureRequiredManagers();
        return Array.from(this.managers.values());
      },

      resolveRole: (meta) => this.resolveRoleWithContext(meta),
      resolveName: (meta) => this.resolveNameWithContext(meta),
      formatTime: (ms) => this.formatTimeWithContext(ms),
    });
  }

  async registerStore(
    name: string,
    config: {
      textKey?: string;
      timeKey?: string;
      description?: string;
      required?: boolean;
    } = {},
  ) {
    this.managerConfigs.set(name, {
      textKey: config.textKey || 'text',
      timeKey: config.timeKey || 'createdAt',
      description: config.description || `Store for ${name}`,
      required: config.required || false,
    });

    if (config.required) {
      await this.ensureManagerExists(name);
    }
  }

  private async ensureManagerExists(name: string) {
    if (this.managers.has(name)) {
      return this.managers.get(name)!;
    }

    const config = this.managerConfigs.get(name);
    if (!config) {
      throw new Error(`No configuration found for store: ${name}`);
    }

    try {
      const manager = await DualStoreManager.create(name, config.textKey, config.timeKey);

      this.managers.set(name, manager);
      console.log(`Created manager for store: ${name}`);
      return manager;
    } catch (error) {
      console.error(`Failed to create manager for ${name}:`, error);
      throw error;
    }
  }

  private async ensureRequiredManagers() {
    const requiredStores = Array.from(this.managerConfigs.entries())
      .filter(([_, config]) => config.required)
      .map(([name, _]) => name);

    for (const name of requiredStores) {
      if (!this.managers.has(name)) {
        await this.ensureManagerExists(name);
      }
    }
  }

  async compileContext(
    sources: Array<{ id: string; label: string; where?: any }>,
    options: any = {},
  ) {
    // Ensure all required stores exist
    for (const source of sources) {
      await this.ensureManagerExists(source.id);
    }

    return this.adapter.compile({
      sources,
      ...options,
    });
  }

  async addTemporaryStore(
    name: string,
    textKey: string,
    timeKey: string,
    ttlMs: number = 30 * 60 * 1000, // 30 minutes
  ) {
    await this.ensureManagerExists(name);

    // Auto-cleanup after TTL
    setTimeout(async () => {
      const manager = this.managers.get(name);
      if (manager) {
        await manager.cleanup();
        this.managers.delete(name);
        this.managerConfigs.delete(name);
        console.log(`Auto-cleaned temporary store: ${name}`);
      }
    }, ttlMs);
  }

  private resolveRoleWithContext(meta?: any): 'system' | 'user' | 'assistant' {
    // Context-aware role resolution
    const source = meta?.source;
    const storeConfig = source ? this.managerConfigs.get(source) : null;

    if (storeConfig?.description?.includes('system')) {
      return 'system';
    }

    if (storeConfig?.description?.includes('user')) {
      return 'user';
    }

    if (storeConfig?.description?.includes('agent')) {
      return 'assistant';
    }

    // Default logic
    return meta?.role || 'system';
  }

  private resolveNameWithContext(meta?: any): string {
    const source = meta?.source;
    const storeConfig = source ? this.managerConfigs.get(source) : null;

    if (meta?.displayName) return meta.displayName;
    if (meta?.name) return meta.name;

    // Use store description for unknown names
    if (storeConfig?.description) {
      return storeConfig.description.split(' ')[0]; // First word
    }

    return source || 'Unknown';
  }

  private formatTimeWithContext(ms: number): string {
    return new Date(ms).toISOString();
  }

  async cleanup() {
    for (const [name, manager] of this.managers) {
      try {
        await manager.cleanup();
        console.log(`Cleaned up manager: ${name}`);
      } catch (error) {
        console.error(`Error cleaning up ${name}:`, error);
      }
    }
    this.managers.clear();
    this.managerConfigs.clear();
  }
}

// Usage
const dynamicAdapter = new DynamicContextAdapter();

// Register required stores
await dynamicAdapter.registerStore('messages', {
  textKey: 'content',
  timeKey: 'timestamp',
  description: 'User chat messages',
  required: true,
});

await dynamicAdapter.registerStore('agent-responses', {
  textKey: 'response',
  timeKey: 'generatedAt',
  description: 'AI agent responses',
  required: true,
});

// Add temporary store for a session
await dynamicAdapter.addTemporaryStore('temp-session-123', 'text', 'createdAt');

// Compile context
const context = await dynamicAdapter.compileContext([
  { id: 'messages', label: 'Chat Messages' },
  { id: 'agent-responses', label: 'AI Responses' },
  { id: 'temp-session-123', label: 'Session Data' },
]);
```

## Integration with Pantheon Framework

### Complete Agent System Integration

```typescript
import { makeOrchestrator, createLLMActor, type ActorScript } from '@promethean-os/pantheon';
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

class PantheonAgentSystem {
  private orchestrator: any;
  private contextAdapter: ContextPort;

  constructor() {
    this.setupContextAdapter();
    this.setupOrchestrator();
  }

  private async setupContextAdapter() {
    this.contextAdapter = makePantheonPersistenceAdapter({
      getStoreManagers: async () => {
        return [
          await DualStoreManager.create('agent-memory', 'text', 'createdAt'),
          await DualStoreManager.create('conversation-history', 'text', 'timestamp'),
          await DualStoreManager.create('user-preferences', 'value', 'updatedAt'),
          await DualStoreManager.create('system-instructions', 'prompt', 'version'),
        ];
      },

      resolveRole: (meta) => {
        switch (meta?.source) {
          case 'agent-memory':
            return meta?.isUserInput ? 'user' : 'assistant';
          case 'conversation-history':
            return meta?.senderType || 'user';
          case 'system-instructions':
            return 'system';
          default:
            return meta?.role || 'system';
        }
      },

      resolveName: (meta) => {
        if (meta?.agentName) return `🤖 ${meta.agentName}`;
        if (meta?.username) return meta.username;
        if (meta?.source === 'system-instructions') return '🔧 System';
        if (meta?.source === 'user-preferences') return '⚙️ Preferences';
        return meta?.displayName || 'Unknown';
      },

      formatTime: (ms) => {
        const date = new Date(ms);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    });
  }

  private setupOrchestrator() {
    this.orchestrator = makeOrchestrator({
      context: this.contextAdapter,
      // ... other adapters would be configured here
    });
  }

  async createAssistantAgent(name: string, systemPrompt: string, capabilities: string[] = []) {
    const actorScript: ActorScript = {
      name,
      contextSources: [
        { id: 'agent-memory', label: 'Agent Memory' },
        { id: 'conversation-history', label: 'Recent Conversations' },
        { id: 'user-preferences', label: 'User Preferences' },
        { id: 'system-instructions', label: 'System Instructions' },
      ],
      talents: [
        {
          name: 'conversation',
          behaviors: [
            {
              name: 'respond-to-user',
              mode: 'active',
              plan: async ({ goal, context }) => {
                // Context is already compiled by our adapter
                return {
                  actions: [
                    {
                      type: 'message',
                      content: `Processing: ${goal}`,
                      target: 'user',
                    },
                  ],
                };
              },
            },
          ],
        },
      ],
      description: `AI assistant: ${name}`,
      program: systemPrompt,
    };

    return this.orchestrator.spawnActor(
      actorScript,
      `Assist users with ${capabilities.join(', ')}`,
    );
  }

  async processUserMessage(agentId: string, userId: string, message: string) {
    const actor = await this.orchestrator.getActor(agentId);
    if (!actor) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Add user message to conversation history
    await this.addUserMessage(userId, message);

    // Process with agent
    await this.orchestrator.tickActor(actor, {
      userMessage: message,
      userId,
      contextSources: [
        {
          id: 'conversation-history',
          label: 'Recent Conversations',
          where: { userId },
        },
        {
          id: 'user-preferences',
          label: 'User Preferences',
          where: { userId },
        },
      ],
    });
  }

  private async addUserMessage(userId: string, message: string) {
    // This would add the message to the persistence layer
    // Implementation depends on your specific setup
    console.log(`Adding message for user ${userId}: ${message}`);
  }
}

// Usage
const agentSystem = new PantheonAgentSystem();

const assistant = await agentSystem.createAssistantAgent(
  'HelpfulAssistant',
  'You are a helpful AI assistant. Be friendly, informative, and concise.',
  ['conversation', 'information retrieval', 'task assistance'],
);

await agentSystem.processUserMessage(assistant.id, 'user123', 'What can you help me with today?');
```

## Advanced Patterns

### Plugin-Based Resolver System

```typescript
interface ResolverPlugin {
  name: string;
  priority: number;
  resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant' | null;
  resolveName?: (meta?: any) => string | null;
  formatTime?: (ms: number) => string | null;
}

class PluginPersistenceAdapter {
  private plugins: ResolverPlugin[] = [];
  private adapter: ContextPort;

  constructor() {
    this.adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => this.getStoreManagers(),
      resolveRole: (meta) => this.resolveWithPlugins('resolveRole', meta, 'system'),
      resolveName: (meta) => this.resolveWithPlugins('resolveName', meta, 'Unknown'),
      formatTime: (ms) =>
        this.resolveWithPlugins('formatTime', ms, () => new Date(ms).toISOString()),
    });
  }

  addPlugin(plugin: ResolverPlugin) {
    this.plugins.push(plugin);
    // Sort by priority (higher priority first)
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  private resolveWithPlugins<T>(
    method: keyof ResolverPlugin,
    input: any,
    fallback: T | (() => T),
  ): T {
    for (const plugin of this.plugins) {
      const resolver = plugin[method];
      if (typeof resolver === 'function') {
        const result = (resolver as any)(input);
        if (result !== null && result !== undefined) {
          return result;
        }
      }
    }

    return typeof fallback === 'function' ? (fallback as any)() : fallback;
  }

  async getStoreManagers(): Promise<DualStoreManager[]> {
    // Implementation for getting store managers
    return [];
  }

  compile(options: any) {
    return this.adapter.compile(options);
  }
}

// Example plugins
const emojiPlugin: ResolverPlugin = {
  name: 'emoji-enhancer',
  priority: 10,
  resolveName: (meta) => {
    if (meta?.role === 'assistant') return `🤖 ${meta?.name || 'Assistant'}`;
    if (meta?.role === 'user') return `👤 ${meta?.name || 'User'}`;
    if (meta?.role === 'system') return `🔧 ${meta?.name || 'System'}`;
    return null;
  },
};

const privacyPlugin: ResolverPlugin = {
  name: 'privacy-filter',
  priority: 20, // Higher priority than emoji
  resolveName: (meta) => {
    if (meta?.privacyLevel === 'private') {
      return `Private User`;
    }
    return null;
  },
};

const relativeTimePlugin: ResolverPlugin = {
  name: 'relative-time',
  priority: 5,
  formatTime: (ms) => {
    const now = Date.now();
    const diff = now - ms;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return null; // Use default formatting
  },
};

// Usage
const pluginAdapter = new PluginPersistenceAdapter();
pluginAdapter.addPlugin(privacyPlugin);
pluginAdapter.addPlugin(emojiPlugin);
pluginAdapter.addPlugin(relativeTimePlugin);
```

## Testing Examples

### Unit Testing with Mocks

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import type { DualStoreManager } from '@promethean-os/persistence';

// Mock DualStoreManager for testing
const createMockManager = (name: string, entries: any[] = []): DualStoreManager => {
  return {
    name,
    getMostRecent: async (limit = 10) => entries.slice(0, limit),
    getMostRelevant: async (queries, limit) => entries.slice(0, limit),
    insert: async () => {},
    get: async () => null,
    cleanup: async () => {},
  } as DualStoreManager;
};

describe('PantheonPersistenceAdapter', () => {
  it('should compile context with default resolvers', async () => {
    const mockManagers = [
      createMockManager('test-store', [
        {
          id: '1',
          text: 'Hello world',
          metadata: { role: 'user', name: 'Test User' },
        },
        {
          id: '2',
          text: 'Hi there!',
          metadata: { role: 'assistant', name: 'Assistant' },
        },
      ]),
    ];

    const adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => Promise.resolve(mockManagers),
    });

    const context = await adapter.compile({
      sources: [{ id: 'test-store', label: 'Test Store' }],
    });

    expect(context).toHaveLength(2);
    expect(context[0]).toMatchObject({
      role: 'user',
      content: 'Hello world',
    });
    expect(context[1]).toMatchObject({
      role: 'assistant',
      content: 'Hi there!',
    });
  });

  it('should use custom resolvers', async () => {
    const mockManagers = [
      createMockManager('custom-store', [
        {
          id: '1',
          text: 'Test message',
          metadata: { customRole: 'custom', customName: 'Custom Name' },
        },
      ]),
    ];

    const adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => Promise.resolve(mockManagers),
      resolveRole: (meta) => meta?.customRole || 'system',
      resolveName: (meta) => meta?.customName || 'Unknown',
      formatTime: (ms) => `T${ms}`,
    });

    const context = await adapter.compile({
      sources: [{ id: 'custom-store', label: 'Custom Store' }],
    });

    expect(context[0]).toMatchObject({
      role: 'custom',
      content: 'Test message',
    });
  });

  it('should handle empty sources', async () => {
    const adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => Promise.resolve([]),
    });

    const context = await adapter.compile({
      sources: [],
    });

    expect(context).toHaveLength(0);
  });

  it('should filter managers by source ID', async () => {
    const mockManagers = [
      createMockManager('store1', [{ id: '1', text: 'From store 1' }]),
      createMockManager('store2', [{ id: '2', text: 'From store 2' }]),
      createMockManager('store3', [{ id: '3', text: 'From store 3' }]),
    ];

    const adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => Promise.resolve(mockManagers),
    });

    const context = await adapter.compile({
      sources: [
        { id: 'store1', label: 'Store 1' },
        { id: 'store3', label: 'Store 3' },
      ],
    });

    // Should only include data from store1 and store3
    expect(context).toHaveLength(2);
    expect(context.some((msg) => msg.content.includes('store1'))).toBe(true);
    expect(context.some((msg) => msg.content.includes('store3'))).toBe(true);
    expect(context.some((msg) => msg.content.includes('store2'))).toBe(false);
  });
});
```

### Integration Testing with Real Database

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

describe('PantheonPersistence Integration', () => {
  let adapter: ContextPort;
  let testManager: DualStoreManager;

  beforeAll(async () => {
    // Setup test database connection
    process.env.MONGODB_URL = 'mongodb://localhost:27017/test';
    process.env.CHROMA_URL = 'http://localhost:8000';

    testManager = await DualStoreManager.create('test-integration', 'text', 'createdAt');

    adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => Promise.resolve([testManager]),

      resolveRole: (meta) => {
        if (meta?.type === 'user-message') return 'user';
        if (meta?.type === 'assistant-response') return 'assistant';
        return 'system';
      },

      resolveName: (meta) => meta?.username || meta?.agentName || 'Test',

      formatTime: (ms) => new Date(ms).toISOString(),
    });
  });

  afterAll(async () => {
    await testManager.cleanup();
  });

  beforeEach(async () => {
    // Clean up test data
    // This would depend on your specific cleanup implementation
  });

  it('should compile context from real database', async () => {
    // Insert test data
    await testManager.insert({
      text: 'Hello from user',
      metadata: {
        type: 'user-message',
        username: 'testuser',
        timestamp: Date.now(),
      },
    });

    await testManager.insert({
      text: 'Hello from assistant',
      metadata: {
        type: 'assistant-response',
        agentName: 'TestBot',
        timestamp: Date.now(),
      },
    });

    const context = await adapter.compile({
      sources: [{ id: 'test-integration', label: 'Test Integration' }],
      recentLimit: 10,
    });

    expect(context).toHaveLength(2);

    const userMessage = context.find((msg) => msg.role === 'user');
    const assistantMessage = context.find((msg) => msg.role === 'assistant');

    expect(userMessage).toBeDefined();
    expect(userMessage?.content).toBe('Hello from user');

    expect(assistantMessage).toBeDefined();
    expect(assistantMessage?.content).toBe('Hello from assistant');
  });
});
```

## Performance Optimization

### Caching and Memoization

```typescript
class OptimizedPersistenceAdapter {
  private adapter: ContextPort;
  private contextCache = new Map<string, { context: any[]; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.adapter = makePantheonPersistenceAdapter({
      getStoreManagers: () => this.getStoreManagersWithCache(),

      // Memoized resolvers
      resolveRole: this.memoize((meta?: any) => {
        // Your role resolution logic
        return meta?.role || 'system';
      }),

      resolveName: this.memoize((meta?: any) => {
        // Your name resolution logic
        return meta?.name || 'Unknown';
      }),

      formatTime: this.memoize((ms: number) => {
        return new Date(ms).toISOString();
      }),
    });
  }

  private memoize<T, R>(fn: (input: T) => R): (input: T) => R {
    const cache = new Map<string, R>();

    return (input: T): R => {
      const key = JSON.stringify(input);
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(input);
      cache.set(key, result);
      return result;
    };
  }

  async compile(options: any) {
    const cacheKey = JSON.stringify(options);
    const cached = this.contextCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.context;
    }

    const context = await this.adapter.compile(options);

    this.contextCache.set(cacheKey, {
      context,
      timestamp: Date.now(),
    });

    return context;
  }

  private async getStoreManagersWithCache() {
    // Implementation with caching
    return [];
  }
}
```

This comprehensive examples document provides practical implementations for various use cases of the [pantheon-persistence](../packages/pantheon/pantheon-persistence.md) package, from basic setup to advanced patterns and optimization techniques.

#hashtags: #examples #pantheon #persistence #integration
