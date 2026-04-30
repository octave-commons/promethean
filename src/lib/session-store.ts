import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface SessionMessageRecord {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly reasoningContent?: string;
  readonly model?: string;
  readonly createdAt: number;
}

export interface SessionRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  promptCacheKey: string;
  forkedFromSessionId?: string;
  forkedFromMessageId?: string;
  messages: SessionMessageRecord[];
}

interface SessionDb {
  readonly sessions: SessionRecord[];
}

export interface SessionListItem {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly promptCacheKey: string;
  readonly messageCount: number;
  readonly lastMessagePreview: string;
  readonly forkedFromSessionId?: string;
  readonly forkedFromMessageId?: string;
}

export interface SessionSearchDocument {
  readonly sessionId: string;
  readonly sessionTitle: string;
  readonly messageId: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
}

function normalizeTitle(input: string | undefined): string {
  const trimmed = input?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : "New chat";
}

function derivePromptCacheKey(seed?: string): string {
  const normalized = seed?.trim();
  return normalized && normalized.length > 0 ? normalized : crypto.randomUUID();
}

function summarizeMessage(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) {
    return "";
  }

  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized;
}

function emptyDb(): SessionDb {
  return { sessions: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

function toRole(value: unknown): ChatRole {
  if (value === "system" || value === "user" || value === "assistant" || value === "tool") {
    return value;
  }

  return "user";
}

function hydrateDb(raw: unknown): SessionDb {
  if (!isRecord(raw) || !Array.isArray(raw.sessions)) {
    return emptyDb();
  }

  const sessions: SessionRecord[] = raw.sessions
    .map((entry): SessionRecord | null => {
      if (!isRecord(entry)) {
        return null;
      }

      const id = typeof entry.id === "string" && entry.id.length > 0 ? entry.id : crypto.randomUUID();
      const createdAt = toNumber(entry.createdAt, Date.now());
      const updatedAt = toNumber(entry.updatedAt, createdAt);
      const title = normalizeTitle(typeof entry.title === "string" ? entry.title : undefined);
      const promptCacheKey = derivePromptCacheKey(
        typeof entry.promptCacheKey === "string"
          ? entry.promptCacheKey
          : typeof entry.prompt_cache_key === "string"
            ? entry.prompt_cache_key
            : undefined,
      );

      const messages = Array.isArray(entry.messages)
        ? entry.messages
            .map((message): SessionMessageRecord | null => {
              if (!isRecord(message)) {
                return null;
              }

              const messageId =
                typeof message.id === "string" && message.id.length > 0 ? message.id : crypto.randomUUID();
              const content = typeof message.content === "string" ? message.content : "";

              return {
                id: messageId,
                role: toRole(message.role),
                content,
                reasoningContent: typeof message.reasoningContent === "string" ? message.reasoningContent : undefined,
                model: typeof message.model === "string" ? message.model : undefined,
                createdAt: toNumber(message.createdAt, createdAt),
              };
            })
            .filter((message): message is SessionMessageRecord => message !== null)
        : [];

      return {
        id,
        title,
        createdAt,
        updatedAt,
        promptCacheKey,
        forkedFromSessionId:
          typeof entry.forkedFromSessionId === "string" ? entry.forkedFromSessionId : undefined,
        forkedFromMessageId:
          typeof entry.forkedFromMessageId === "string" ? entry.forkedFromMessageId : undefined,
        messages,
      };
    })
    .filter((session): session is SessionRecord => session !== null);

  return { sessions };
}

export class SessionStore {
  private dbCache: SessionDb | null = null;
  private mutationChain: Promise<void> = Promise.resolve();

  public constructor(private readonly filePath: string) {}

  public async listSessions(): Promise<SessionListItem[]> {
    const db = await this.readDb();
    return db.sessions
      .map((session): SessionListItem => {
        const lastMessage = session.messages[session.messages.length - 1];
        return {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          promptCacheKey: session.promptCacheKey,
          messageCount: session.messages.length,
          lastMessagePreview: summarizeMessage(lastMessage?.content ?? lastMessage?.reasoningContent ?? ""),
          forkedFromSessionId: session.forkedFromSessionId,
          forkedFromMessageId: session.forkedFromMessageId,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public async getSession(sessionId: string): Promise<SessionRecord | undefined> {
    const db = await this.readDb();
    return db.sessions.find((session) => session.id === sessionId);
  }

  public async createSession(title?: string): Promise<SessionRecord> {
    return this.mutate(async (db) => {
      const now = Date.now();
      const session: SessionRecord = {
        id: crypto.randomUUID(),
        title: normalizeTitle(title),
        createdAt: now,
        updatedAt: now,
        promptCacheKey: crypto.randomUUID(),
        messages: [],
      };

      db.sessions.push(session);
      return session;
    });
  }

  public async appendMessage(
    sessionId: string,
    input: {
      readonly role: ChatRole;
      readonly content: string;
      readonly reasoningContent?: string;
      readonly model?: string;
    },
  ): Promise<{ readonly session: SessionRecord; readonly message: SessionMessageRecord }> {
    return this.mutate(async (db) => {
      const session = db.sessions.find((entry) => entry.id === sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const now = Date.now();
      const message: SessionMessageRecord = {
        id: crypto.randomUUID(),
        role: input.role,
        content: input.content,
        reasoningContent: input.reasoningContent,
        model: input.model,
        createdAt: now,
      };

      session.messages.push(message);
      const isUntitled = session.title === "New chat" || session.title.startsWith("Fork of ");
      if (isUntitled && input.role === "user") {
        const nextTitle = summarizeMessage(input.content);
        if (nextTitle.length > 0) {
          session.title = nextTitle;
        }
      }
      session.updatedAt = now;

      return {
        session,
        message,
      };
    });
  }

  public async forkSession(
    sourceSessionId: string,
    sourceMessageId?: string,
  ): Promise<SessionRecord> {
    return this.mutate(async (db) => {
      const source = db.sessions.find((entry) => entry.id === sourceSessionId);
      if (!source) {
        throw new Error(`Session not found: ${sourceSessionId}`);
      }

      const maxIndex =
        sourceMessageId === undefined
          ? source.messages.length - 1
          : source.messages.findIndex((message) => message.id === sourceMessageId);

      if (sourceMessageId !== undefined && maxIndex < 0) {
        throw new Error(`Message not found in session: ${sourceMessageId}`);
      }

      const copiedMessages = source.messages
        .slice(0, maxIndex + 1)
        .map((message) => ({
          ...message,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        }));

      const now = Date.now();
      const forked: SessionRecord = {
        id: crypto.randomUUID(),
        title: `Fork of ${source.title}`,
        createdAt: now,
        updatedAt: now,
        promptCacheKey: crypto.randomUUID(),
        forkedFromSessionId: source.id,
        forkedFromMessageId: sourceMessageId,
        messages: copiedMessages,
      };

      db.sessions.push(forked);
      return forked;
    });
  }

  public async collectSearchDocuments(): Promise<SessionSearchDocument[]> {
    const db = await this.readDb();
    const documents: SessionSearchDocument[] = [];

    for (const session of db.sessions) {
      for (const message of session.messages) {
        if (message.content.trim().length === 0) {
          continue;
        }

        documents.push({
          sessionId: session.id,
          sessionTitle: session.title,
          messageId: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        });
      }
    }

    return documents;
  }

  public async searchLexical(query: string, limit: number): Promise<SessionSearchDocument[]> {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) {
      return [];
    }

    const documents = await this.collectSearchDocuments();
    const scored = documents
      .map((document) => {
        const haystack = `${document.sessionTitle}\n${document.content}`.toLowerCase();
        const index = haystack.indexOf(normalized);
        if (index < 0) {
          return null;
        }

        return {
          document,
          score: index,
        };
      })
      .filter((entry): entry is { document: SessionSearchDocument; score: number } => entry !== null)
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        return b.document.createdAt - a.document.createdAt;
      });

    return scored.slice(0, Math.max(1, Math.min(limit, 50))).map((entry) => entry.document);
  }

  private async mutate<T>(fn: (db: SessionDb) => Promise<T>): Promise<T> {
    const resultPromise = this.mutationChain.then(async () => {
      const db = await this.readDb();
      const result = await fn(db);
      await this.writeDb(db);
      return result;
    });

    this.mutationChain = resultPromise.then(
      () => undefined,
      () => undefined,
    );

    return resultPromise;
  }

  private async readDb(): Promise<SessionDb> {
    if (this.dbCache) {
      return this.dbCache;
    }

    try {
      const contents = await readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(contents);
      this.dbCache = hydrateDb(parsed);
      return this.dbCache;
    } catch (error) {
      this.dbCache = emptyDb();
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return this.dbCache;
      }

      return this.dbCache;
    }
  }

  private async writeDb(db: SessionDb): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  }
}
