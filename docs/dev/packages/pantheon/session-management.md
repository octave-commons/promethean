# Pantheon Chat Session Management

## Overview

Pantheon's chat session management provides a robust, multi-runtime, persistent conversation system that maintains context, state, and continuity across agent interactions. Sessions act as conversational containers that can span multiple agents, runtimes, and time periods.

Related: [[docs/dev/packages/pantheon/README]] • [[lisp-dsl-specification]] • [[multi-runtime-architecture]]

## Core Session Architecture

### Session Model

```typescript
// Core Session Interface
interface ChatSession {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;

  // Session metadata
  metadata: {
    userId?: string;
    tags: string[];
    runtime: string;
    primaryAgent: string;
    contextSources: string[];
  };

  // Conversation state
  state: {
    messages: Message[];
    context: CompiledContext;
    agentStates: Map<string, AgentState>;
    toolStates: Map<string, ToolState>;
  };

  // Session configuration
  config: {
    maxMessages: number;
    contextWindow: number;
    persistenceEnabled: boolean;
    autoSave: boolean;
    sharingEnabled: boolean;
  };

  // Session status
  status: 'active' | 'paused' | 'archived' | 'deleted';
}

// Message Model
interface Message {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'user' | 'agent' | 'system' | 'tool';

  // Content
  content: {
    text: string;
    attachments?: Attachment[];
    metadata?: Record<string, any>;
  };

  // Agent information
  agent?: {
    id: string;
    name: string;
    runtime: string;
    model: string;
  };

  // Tool calls
  toolCalls?: ToolCall[];

  // Context references
  contextReferences?: ContextReference[];

  // Message metadata
  metadata: {
    tokens?: number;
    cost?: number;
    latency?: number;
    error?: string;
  };
}
```

### Session Manager

```typescript
class SessionManager {
  private sessions = new Map<string, ChatSession>();
  private persistence: SessionPersistence;
  private contextManager: ContextManager;
  private runtimeManager: RuntimeManager;

  constructor(config: SessionManagerConfig) {
    this.persistence = new SessionPersistence(config.persistence);
    this.contextManager = new ContextManager(config.context);
    this.runtimeManager = new RuntimeManager();
  }

  // Session lifecycle
  async createSession(config: SessionConfig): Promise<ChatSession> {
    const session: ChatSession = {
      id: this.generateSessionId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        tags: config.tags || [],
        runtime: config.runtime || 'opencode',
        primaryAgent: config.primaryAgent,
        contextSources: config.contextSources || [],
      },
      state: {
        messages: [],
        context: await this.contextManager.compileEmpty(),
        agentStates: new Map(),
        toolStates: new Map(),
      },
      config: {
        maxMessages: config.maxMessages || 100,
        contextWindow: config.contextWindow || 8000,
        persistenceEnabled: config.persistenceEnabled !== false,
        autoSave: config.autoSave !== false,
        sharingEnabled: config.sharingEnabled || false,
      },
      status: 'active',
    };

    this.sessions.set(session.id, session);

    if (session.config.persistenceEnabled) {
      await this.persistence.saveSession(session);
    }

    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Try to load from persistence
      session = await this.persistence.loadSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    return session || null;
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    Object.assign(session, updates);
    session.updatedAt = new Date();

    if (session.config.persistenceEnabled && session.config.autoSave) {
      await this.persistence.saveSession(session);
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.status = 'deleted';
      await this.persistence.deleteSession(sessionId);
      this.sessions.delete(sessionId);
    }
  }

  // Message management
  async addMessage(
    sessionId: string,
    message: Omit<Message, 'id' | 'sessionId' | 'timestamp'>,
  ): Promise<Message> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const fullMessage: Message = {
      ...message,
      id: this.generateMessageId(),
      sessionId,
      timestamp: new Date(),
    };

    session.state.messages.push(fullMessage);
    session.updatedAt = new Date();

    // Trim messages if exceeding max
    if (session.state.messages.length > session.config.maxMessages) {
      session.state.messages = session.state.messages.slice(-session.config.maxMessages);
    }

    // Update context if needed
    if (message.type === 'user' || message.type === 'agent') {
      session.state.context = await this.contextManager.updateContext(
        session.state.context,
        fullMessage,
        session.metadata.contextSources,
      );
    }

    if (session.config.persistenceEnabled && session.config.autoSave) {
      await this.persistence.saveSession(session);
    }

    return fullMessage;
  }

  async getMessages(sessionId: string, options?: MessageQueryOptions): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    let messages = session.state.messages;

    // Apply filters
    if (options?.type) {
      messages = messages.filter((m) => m.type === options.type);
    }

    if (options?.agentId) {
      messages = messages.filter((m) => m.agent?.id === options.agentId);
    }

    if (options?.limit) {
      messages = messages.slice(-options.limit);
    }

    if (options?.since) {
      messages = messages.filter((m) => m.timestamp > options.since);
    }

    return messages;
  }

  // Session operations
  async pauseSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { status: 'paused' });
  }

  async resumeSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { status: 'active' });
  }

  async archiveSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { status: 'archived' });
  }

  // Session search and filtering
  async listSessions(options?: SessionQueryOptions): Promise<ChatSession[]> {
    const sessions = Array.from(this.sessions.values());

    let filtered = sessions;

    if (options?.status) {
      filtered = filtered.filter((s) => s.status === options.status);
    }

    if (options?.userId) {
      filtered = filtered.filter((s) => s.metadata.userId === options.userId);
    }

    if (options?.tags) {
      filtered = filtered.filter((s) => options.tags!.some((tag) => s.metadata.tags.includes(tag)));
    }

    if (options?.runtime) {
      filtered = filtered.filter((s) => s.metadata.runtime === options.runtime);
    }

    // Sort by updated date
    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async searchSessions(query: string, options?: SearchOptions): Promise<ChatSession[]> {
    const sessions = await this.listSessions(options);

    return sessions.filter((session) => {
      // Search in session name
      if (session.name?.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }

      // Search in messages
      return session.state.messages.some((message) =>
        message.content.text.toLowerCase().includes(query.toLowerCase()),
      );
    });
  }

  // Session sharing and export
  async shareSession(sessionId: string, options?: ShareOptions): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session || !session.config.sharingEnabled) {
      throw new Error(`Session sharing not enabled: ${sessionId}`);
    }

    const shareData = {
      session: {
        id: session.id,
        name: session.name,
        createdAt: session.createdAt,
        metadata: session.metadata,
      },
      messages: session.state.messages,
      options: {
        includeMetadata: options?.includeMetadata || false,
        includeContext: options?.includeContext || false,
      },
    };

    return await this.persistence.createShareLink(shareData);
  }

  async exportSession(sessionId: string, format: 'json' | 'markdown' | 'csv'): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(session, null, 2);

      case 'markdown':
        return this.formatSessionAsMarkdown(session);

      case 'csv':
        return this.formatSessionAsCSV(session);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private formatSessionAsMarkdown(session: ChatSession): string {
    let output = `# Chat Session: ${session.name || session.id}\n\n`;
    output += `**Created:** ${session.createdAt.toISOString()}\n`;
    output += `**Runtime:** ${session.metadata.runtime}\n`;
    output += `**Primary Agent:** ${session.metadata.primaryAgent}\n\n`;

    for (const message of session.state.messages) {
      const role =
        message.type === 'user'
          ? '👤 User'
          : message.type === 'agent'
            ? `🤖 ${message.agent?.name || 'Agent'}`
            : message.type === 'system'
              ? '⚙️ System'
              : '🔧 Tool';

      output += `## ${role} - ${message.timestamp.toISOString()}\n\n`;
      output += `${message.content.text}\n\n`;

      if (message.toolCalls && message.toolCalls.length > 0) {
        output += `**Tool Calls:**\n`;
        for (const toolCall of message.toolCalls) {
          output += `- \`${toolCall.name}\`: ${toolCall.result}\n`;
        }
        output += `\n`;
      }
    }

    return output;
  }

  private formatSessionAsCSV(session: ChatSession): string {
    const headers = ['timestamp', 'type', 'agent', 'content', 'tool_calls'];
    const rows = [headers.join(',')];

    for (const message of session.state.messages) {
      const row = [
        message.timestamp.toISOString(),
        message.type,
        message.agent?.name || '',
        `"${message.content.text.replace(/"/g, '""')}"`,
        message.toolCalls?.map((tc) => tc.name).join(';') || '',
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Enhanced Lisp DSL with Session Management

### Session Operations in DSL

```lisp
;; Create new session
(session-create "Code Review Session"
               :runtime :opencode
               :primary-agent "code-reviewer"
               :tags ["coding" "review"]
               :context-sources ["./src" "./docs"])

;; List active sessions
(session-list :status :active)
;; => (#Session{:id "session_123" :name "Code Review Session" ...})

;; Switch to session
(session-switch "session_123")

;; Get current session info
(session-info)
;; => {:id "session_123" :name "Code Review Session" :message-count 5 ...}

;; Send message in current session
(ask "Review this function for security issues"
     :context #{"./src/auth.js"}
     :session "session_123")

;; Send message without session (creates temporary)
(ask "What is machine learning?" :no-session true)
```

### Session State Management

```lisp
;; Session with state persistence
(session-create "Project Planning"
               :auto-save true
               :persistence true
               :max-messages 200)

;; Pause and resume sessions
(session-pause "session_123")
(session-resume "session_123")

;; Archive old sessions
(session-archive "session_456")

;; Session search
(session-search "security" :tags ["coding"])
;; => (#Session{:id "session_123" :name "Security Review"} ...)
```

### Cross-Session Context

```lisp
;; Reference context from other sessions
(ask "Continue the security discussion from yesterday"
     :context-sources ["session_456" "./docs/security.md"])

;; Clone session with context
(session-clone "session_123"
               :new-name "Security Review Follow-up"
               :include-context true)

;; Merge sessions
(session-merge "session_123" "session_456"
               :new-name "Complete Security Review")
```

### Session Sharing and Collaboration

```lisp
;; Share session
(session-share "session_123"
               :include-metadata true
               :expires-in "7d")

;; Export session
(session-export "session_123" :format :markdown)
;; => "# Chat Session: Security Review\n\n..."

;; Import shared session
(session-import "https://pantheon.ai/share/abc123")
;; => #Session{:id "session_789" :name "Imported Session"}
```

## Multi-Agent Session Coordination

### Agent Handoff in Sessions

```lisp
;; Define agent handoff workflow
(defworkflow agent-handoff
  :description "Hand off conversation between specialized agents"
  :steps [
    ;; Initial agent handles first response
    (agent-respond :agent "general-assistant")

    ;; Check if specialized handling needed
    (if-contains-code?
      (agent-respond :agent "code-reviewer")
      (agent-respond :agent "general-assistant"))

    ;; Research if needed
    (if-needs-research?
      (agent-respond :agent "research-assistant")
      (no-op))

    ;; Final summary
    (agent-respond :agent "general-assistant")])

;; Run in session
(session-run-workflow "session_123" agent-handoff)
```

### Session-Aware Agents

```lisp
;; Agents with session context awareness
(defagent session-aware-assistant
  :runtime :opencode
  :capabilities ["session-aware" "context-retention"]
  :system-prompt "You are participating in an ongoing conversation.
                 Reference previous messages and maintain continuity.
                 Remember user preferences and conversation context.")

;; Agent with session memory
(defagent memory-assistant
  :runtime :openai-agent
  :capabilities ["long-term-memory" "session-learning"]
  :tools ["session-memory" "context-store"]
  :system-prompt "Learn from this conversation and remember important
                 details for future interactions. Build on previous context.")
```

## Session Persistence and Storage

### Storage Backends

```typescript
// Session Persistence Interface
interface SessionPersistence {
  saveSession(session: ChatSession): Promise<void>;
  loadSession(sessionId: string): Promise<ChatSession | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(options?: SessionQueryOptions): Promise<ChatSession[]>;
  createShareLink(data: ShareData): Promise<string>;
}

// File System Persistence
class FileSystemPersistence implements SessionPersistence {
  constructor(private basePath: string) {}

  async saveSession(session: ChatSession): Promise<void> {
    const filePath = path.join(this.basePath, `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  async loadSession(sessionId: string): Promise<ChatSession | null> {
    const filePath = path.join(this.basePath, `${sessionId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ChatSession;
    } catch {
      return null;
    }
  }

  // ... other methods
}

// Database Persistence
class DatabasePersistence implements SessionPersistence {
  constructor(private db: Database) {}

  async saveSession(session: ChatSession): Promise<void> {
    await this.db
      .collection('sessions')
      .updateOne({ id: session.id }, { $set: session }, { upsert: true });
  }

  async loadSession(sessionId: string): Promise<ChatSession | null> {
    const doc = await this.db.collection('sessions').findOne({ id: sessionId });
    return doc || null;
  }

  // ... other methods
}
```

### Session Configuration

```lisp
;; Global session configuration
(config :sessions
        :default-runtime :opencode
        :persistence :filesystem
        :storage-path "./pantheon-sessions"
        :auto-save true
        :max-sessions 100
        :session-timeout "30d")

;; Per-session configuration
(session-create "Important Project"
               :persistence :database
               :auto-save true
               :max-messages 500
               :sharing-enabled true
               :backup-enabled true)
```

## Session Analytics and Insights

### Session Metrics

```lisp
;; Get session statistics
(session-stats "session_123")
;; => {:message-count 25
;;     :agent-switches 3
;;     :tool-calls 12
;;     :total-tokens 5432
;;     :duration "45m"
;;     :cost "$0.23"}

;; Session analytics
(session-analytics :time-range "last-30d")
;; => {:total-sessions 45
;;     :avg-duration "23m"
;;     :popular-agents ["code-reviewer" "research-assistant"]
;;     :common-topics ["security" "performance" "testing"]}

;; Agent performance in sessions
(agent-performance "code-reviewer" :sessions "all")
;; => {:sessions-participated 23
;;     :success-rate 0.95
;;     :avg-response-time "2.3s"
;;     :user-satisfaction 4.7}
```

## Security and Privacy

### Session Security

```typescript
// Session Security Configuration
interface SessionSecurity {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotation: string;
  };

  access: {
    authentication: boolean;
    authorization: string[];
    sharing: {
      public: boolean;
      expiration: string;
      password: boolean;
    };
  };

  privacy: {
    dataRetention: string;
    anonymization: boolean;
    rightToDeletion: boolean;
  };
}

// Secure Session Manager
class SecureSessionManager extends SessionManager {
  private security: SessionSecurity;

  async createSecureSession(config: SessionConfig): Promise<ChatSession> {
    const session = await super.createSession(config);

    // Encrypt sensitive data
    if (this.security.encryption.enabled) {
      await this.encryptSession(session);
    }

    // Set up access controls
    if (this.security.access.authentication) {
      session.metadata.access = await this.generateAccessControls(config);
    }

    return session;
  }

  private async encryptSession(session: ChatSession): Promise<void> {
    // Encrypt message content and sensitive metadata
    for (const message of session.state.messages) {
      if (message.type === 'user' || message.type === 'agent') {
        message.content.text = await this.encrypt(message.content.text);
      }
    }
  }
}
```

### Privacy Controls

```lisp
;; Privacy-focused session
(session-create "Private Consultation"
               :encryption true
               :access :private
               :retention "7d"
               :anonymization true)

;; Session with data controls
(session-create "Work Project"
               :access :authenticated
               :sharing :disabled
               :audit-log true
               :compliance :gdpr)
```

## Benefits of Strong Session Management

### 1. **Continuity**

- Maintain conversation context across interactions
- Preserve agent states and learning
- Enable long-running collaborative sessions

### 2. **Flexibility**

- Switch between agents and runtimes seamlessly
- Pause and resume conversations
- Import/export sessions for different use cases

### 3. **Collaboration**

- Share sessions with team members
- Collaborative multi-agent conversations
- Session branching and merging

### 4. **Insights**

- Track conversation patterns and metrics
- Analyze agent performance
- Optimize workflows based on session data

### 5. **Security**

- Encrypt sensitive conversations
- Control access and sharing
- Comply with privacy regulations

This comprehensive session management system makes Pantheon a robust platform for sustained AI interactions while maintaining security, privacy, and user control over their conversational data.
