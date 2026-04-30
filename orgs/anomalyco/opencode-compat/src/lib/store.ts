import type { CompatConfigDoc, CompatSession, CreateSessionInput, McpServerConfig, McpStatus, MessageWithParts, PermissionRequest, QuestionRequest, SessionListQuery, SessionStatus, StoredMcpServer, UpdateSessionInput } from "./types.js";
import { cloneValue, createSessionRecord, defaultSessionStatus, slugify } from "./helpers.js";
import { createPostgresStore } from "../db/postgres-store.js";

export interface CompatStore {
  getConfig(directory: string): Promise<CompatConfigDoc | undefined>;
  putConfig(directory: string, document: CompatConfigDoc): Promise<CompatConfigDoc>;
  listSessions(query: SessionListQuery): Promise<CompatSession[]>;
  createSession(input: CreateSessionInput): Promise<CompatSession>;
  getSession(sessionId: string): Promise<CompatSession | undefined>;
  updateSession(sessionId: string, input: UpdateSessionInput): Promise<CompatSession | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  listSessionChildren(sessionId: string): Promise<CompatSession[]>;
  listSessionStatus(directory?: string): Promise<Record<string, SessionStatus>>;
  setSessionStatus(sessionId: string, directory: string, status: SessionStatus): Promise<void>;
  listMessages(sessionId: string, limit?: number): Promise<MessageWithParts[]>;
  getMessage(sessionId: string, messageId: string): Promise<MessageWithParts | undefined>;
  appendMessage(entry: MessageWithParts, directory: string): Promise<void>;
  listMcp(directory: string): Promise<Record<string, StoredMcpServer>>;
  putMcp(directory: string, name: string, config: McpServerConfig, status: McpStatus): Promise<Record<string, StoredMcpServer>>;
  getMcp(directory: string, name: string): Promise<StoredMcpServer | undefined>;
  setMcpStatus(directory: string, name: string, status: McpStatus): Promise<Record<string, StoredMcpServer>>;
  listPermissions(): Promise<PermissionRequest[]>;
  getPermission(requestId: string): Promise<PermissionRequest | undefined>;
  putPermission(request: PermissionRequest): Promise<void>;
  resolvePermission(requestId: string): Promise<PermissionRequest | undefined>;
  listQuestions(): Promise<QuestionRequest[]>;
  getQuestion(requestId: string): Promise<QuestionRequest | undefined>;
  putQuestion(request: QuestionRequest): Promise<void>;
  resolveQuestion(requestId: string): Promise<QuestionRequest | undefined>;
  rejectQuestion(requestId: string): Promise<QuestionRequest | undefined>;
  close(): Promise<void>;
}

export async function createStore(input: { version: string; databaseUrl?: string }): Promise<CompatStore> {
  if (input.databaseUrl) {
    return createPostgresStore(input.version, input.databaseUrl);
  }
  return new MemoryCompatStore(input.version);
}

class MemoryCompatStore implements CompatStore {
  readonly #config = new Map<string, CompatConfigDoc>();
  readonly #sessions = new Map<string, CompatSession>();
  readonly #status = new Map<string, { directory: string; status: SessionStatus }>();
  readonly #messages = new Map<string, MessageWithParts[]>();
  readonly #mcp = new Map<string, Map<string, StoredMcpServer>>();
  readonly #permissions = new Map<string, PermissionRequest>();
  readonly #questions = new Map<string, QuestionRequest>();

  constructor(private readonly version: string) {}

  async getConfig(directory: string): Promise<CompatConfigDoc | undefined> {
    const document = this.#config.get(directory);
    return document ? cloneValue(document) : undefined;
  }

  async putConfig(directory: string, document: CompatConfigDoc): Promise<CompatConfigDoc> {
    this.#config.set(directory, cloneValue(document));
    return cloneValue(document);
  }

  async listSessions(query: SessionListQuery): Promise<CompatSession[]> {
    return [...this.#sessions.values()]
      .filter((session) => {
        if (query.directory && session.directory !== query.directory) {
          return false;
        }
        if (query.roots && session.parentID) {
          return false;
        }
        if (typeof query.start === "number" && session.time.updated < query.start) {
          return false;
        }
        if (query.search && !session.title.toLowerCase().includes(query.search.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((left, right) => right.time.updated - left.time.updated)
      .slice(0, query.limit ?? Number.MAX_SAFE_INTEGER)
      .map((session) => cloneValue(session));
  }

  async createSession(input: CreateSessionInput): Promise<CompatSession> {
    const session = createSessionRecord({
      directory: input.directory,
      title: input.title ?? "New Session",
      version: this.version,
      parentID: input.parentID,
      permission: input.permission
    });
    this.#sessions.set(session.id, session);
    this.#messages.set(session.id, []);
    this.#status.set(session.id, { directory: session.directory, status: defaultSessionStatus() });
    return cloneValue(session);
  }

  async getSession(sessionId: string): Promise<CompatSession | undefined> {
    const session = this.#sessions.get(sessionId);
    return session ? cloneValue(session) : undefined;
  }

  async updateSession(sessionId: string, input: UpdateSessionInput): Promise<CompatSession | undefined> {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      return undefined;
    }
    const next: CompatSession = {
      ...session,
      title: input.title ?? session.title,
      slug: input.title ? slugify(input.title) : session.slug,
      share: input.shareUrl === undefined ? session.share : (input.shareUrl ? { url: input.shareUrl } : undefined),
      time: {
        ...session.time,
        updated: Date.now(),
        archived: input.archived === undefined ? session.time.archived : input.archived
      }
    };
    this.#sessions.set(sessionId, next);
    return cloneValue(next);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    this.#messages.delete(sessionId);
    this.#status.delete(sessionId);
    return this.#sessions.delete(sessionId);
  }

  async listSessionChildren(sessionId: string): Promise<CompatSession[]> {
    return [...this.#sessions.values()].filter((session) => session.parentID === sessionId).map((session) => cloneValue(session));
  }

  async listSessionStatus(directory?: string): Promise<Record<string, SessionStatus>> {
    return Object.fromEntries(
      [...this.#status.entries()]
        .filter(([, value]) => !directory || value.directory === directory)
        .map(([sessionId, value]) => [sessionId, cloneValue(value.status)])
    );
  }

  async setSessionStatus(sessionId: string, directory: string, status: SessionStatus): Promise<void> {
    this.#status.set(sessionId, { directory, status: cloneValue(status) });
  }

  async listMessages(sessionId: string, limit?: number): Promise<MessageWithParts[]> {
    const entries = this.#messages.get(sessionId) ?? [];
    const sliced = typeof limit === "number" ? entries.slice(-limit) : entries;
    return sliced.map((entry) => cloneValue(entry));
  }

  async getMessage(sessionId: string, messageId: string): Promise<MessageWithParts | undefined> {
    const entry = (this.#messages.get(sessionId) ?? []).find((candidate) => candidate.info.id === messageId);
    return entry ? cloneValue(entry) : undefined;
  }

  async appendMessage(entry: MessageWithParts, _directory: string): Promise<void> {
    const items = this.#messages.get(entry.info.sessionID) ?? [];
    items.push(cloneValue(entry));
    this.#messages.set(entry.info.sessionID, items);
    const session = this.#sessions.get(entry.info.sessionID);
    if (session) {
      session.time.updated = Date.now();
      this.#sessions.set(session.id, session);
    }
  }

  async listMcp(directory: string): Promise<Record<string, StoredMcpServer>> {
    const map = this.#mcp.get(directory) ?? new Map<string, StoredMcpServer>();
    return Object.fromEntries([...map.entries()].map(([name, value]) => [name, cloneValue(value)]));
  }

  async putMcp(directory: string, name: string, config: McpServerConfig, status: McpStatus): Promise<Record<string, StoredMcpServer>> {
    const map = this.#mcp.get(directory) ?? new Map<string, StoredMcpServer>();
    map.set(name, { directory, name, config: cloneValue(config), status: cloneValue(status) });
    this.#mcp.set(directory, map);
    return this.listMcp(directory);
  }

  async getMcp(directory: string, name: string): Promise<StoredMcpServer | undefined> {
    const map = this.#mcp.get(directory);
    const entry = map?.get(name);
    return entry ? cloneValue(entry) : undefined;
  }

  async setMcpStatus(directory: string, name: string, status: McpStatus): Promise<Record<string, StoredMcpServer>> {
    const map = this.#mcp.get(directory) ?? new Map<string, StoredMcpServer>();
    const current = map.get(name);
    if (current) {
      map.set(name, { ...current, status: cloneValue(status) });
      this.#mcp.set(directory, map);
    }
    return this.listMcp(directory);
  }

  async listPermissions(): Promise<PermissionRequest[]> {
    return [...this.#permissions.values()].map((entry) => cloneValue(entry));
  }

  async getPermission(requestId: string): Promise<PermissionRequest | undefined> {
    const entry = this.#permissions.get(requestId);
    return entry ? cloneValue(entry) : undefined;
  }

  async putPermission(request: PermissionRequest): Promise<void> {
    this.#permissions.set(request.id, cloneValue(request));
  }

  async resolvePermission(requestId: string): Promise<PermissionRequest | undefined> {
    const entry = this.#permissions.get(requestId);
    if (!entry) {
      return undefined;
    }
    this.#permissions.delete(requestId);
    return cloneValue(entry);
  }

  async listQuestions(): Promise<QuestionRequest[]> {
    return [...this.#questions.values()].map((entry) => cloneValue(entry));
  }

  async getQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    const entry = this.#questions.get(requestId);
    return entry ? cloneValue(entry) : undefined;
  }

  async putQuestion(request: QuestionRequest): Promise<void> {
    this.#questions.set(request.id, cloneValue(request));
  }

  async resolveQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    const entry = this.#questions.get(requestId);
    if (!entry) {
      return undefined;
    }
    this.#questions.delete(requestId);
    return cloneValue(entry);
  }

  async rejectQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    return this.resolveQuestion(requestId);
  }

  async close(): Promise<void> {}
}
