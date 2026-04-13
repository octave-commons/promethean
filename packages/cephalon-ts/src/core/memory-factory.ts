import { createHash } from "crypto";
import type {
  Memory,
  UUID,
  Role,
  MemoryKind,
  MemorySource,
  MemoryRetrieval,
  MemoryUsage,
  MemoryEmbedding,
  MemoryLifecycle,
  MemoryHashes,
  MemoryContent,
  MemoryCluster,
} from "../types/index.js";

export interface MemoryFactoryConfig {
  cephalonId: string;
  sessionId: string;
  schemaVersion: number;
}

export interface CreateMemoryOptions {
  id?: UUID;
  timestamp?: number;
  eventId?: UUID | null;
  role: Role;
  kind: MemoryKind;
  content: MemoryContent;
  source: MemorySource;
  retrieval?: Partial<MemoryRetrieval>;
  embedding?: Partial<MemoryEmbedding>;
  lifecycle?: Partial<MemoryLifecycle>;
  cluster?: MemoryCluster;
  externalId?: string;
}

export class MemoryFactory {
  private config: MemoryFactoryConfig;

  constructor(config: MemoryFactoryConfig) {
    this.config = config;
  }

  createMemory(options: CreateMemoryOptions): Memory {
    const timestamp = options.timestamp ?? Date.now();
    const contentHash = createHash("sha256")
      .update(options.content.text)
      .digest("hex");

    const defaultRetrieval: MemoryRetrieval = {
      pinned: false,
      lockedByAdmin: false,
      lockedBySystem: false,
      weightKind: 1.0,
      weightSource: 1.0,
    };

    const defaultUsage: MemoryUsage = {
      includedCountTotal: 0,
      includedCountDecay: 1,
      lastIncludedAt: timestamp,
    };

    const defaultEmbedding: MemoryEmbedding = {
      status: "none",
    };

    const defaultLifecycle: MemoryLifecycle = {
      deleted: false,
    };

    const defaultHashes: MemoryHashes = {
      contentHash,
    };

    const id = options.externalId
      ? this.generateDeterministicId(options.externalId)
      : (options.id ?? this.generateId());

    return {
      id,
      timestamp,
      cephalonId: this.config.cephalonId,
      sessionId: this.config.sessionId,
      eventId: options.eventId ?? null,
      role: options.role,
      kind: options.kind,
      content: options.content,
      source: options.source,
      cluster: options.cluster,
      retrieval: { ...defaultRetrieval, ...options.retrieval },
      usage: defaultUsage,
      embedding: { ...defaultEmbedding, ...options.embedding },
      lifecycle: { ...defaultLifecycle, ...options.lifecycle },
      hashes: defaultHashes,
      schemaVersion: this.config.schemaVersion,
    };
  }

  createUserMessageMemory(
    content: string,
    source: MemorySource,
    options?: {
      eventId?: UUID;
      normalizedText?: string;
      timestamp?: number;
      externalId?: string;
    }
  ): Memory {
    return this.createMemory({
      role: "user",
      kind: "message",
      content: {
        text: content,
        normalizedText: options?.normalizedText ?? content,
      },
      source,
      eventId: options?.eventId ?? null,
      timestamp: options?.timestamp,
      externalId: options?.externalId,
    });
  }

  createAssistantMemory(
    content: string,
    options?: {
      timestamp?: number;
    }
  ): Memory {
    return this.createMemory({
      role: "assistant",
      kind: "message",
      content: { text: content },
      source: { type: "system" },
      timestamp: options?.timestamp,
    });
  }

  createToolCallMemory(
    toolName: string,
    args: Record<string, unknown>,
    callId: string,
    options?: {
      timestamp?: number;
      externalId?: string;
      eventId?: UUID;
    }
  ): Memory {
    return this.createMemory({
      role: "tool",
      kind: "tool_call",
      content: {
        text: `Called ${toolName}(${JSON.stringify(args)})`,
        normalizedText: `tool:${toolName}`,
      },
      source: { type: "system" },
      eventId: options?.eventId ?? null,
      retrieval: {
        pinned: false,
        lockedByAdmin: false,
        lockedBySystem: false,
        weightKind: 0.5,
        weightSource: 1.0,
      },
      timestamp: options?.timestamp,
      externalId: options?.externalId,
    });
  }

  createToolResultMemory(
    toolName: string,
    result: unknown,
    error: string | undefined,
    callId: string,
    options?: {
      timestamp?: number;
      externalId?: string;
      eventId?: UUID;
    }
  ): Memory {
    const contentText = error
      ? `Error: ${error}`
      : `Result: ${JSON.stringify(result)}`;

    return this.createMemory({
      role: "tool",
      kind: "tool_result",
      content: {
        text: contentText,
        normalizedText: `tool:${toolName}`,
      },
      source: { type: "system" },
      eventId: options?.eventId ?? null,
      retrieval: {
        pinned: false,
        lockedByAdmin: false,
        lockedBySystem: false,
        weightKind: 0.5,
        weightSource: 1.0,
      },
      timestamp: options?.timestamp,
      externalId: options?.externalId,
    });
  }

  createImageMemory(
    filename: string,
    url: string,
    size: number | undefined,
    source: MemorySource,
    options?: {
      eventId?: UUID;
      timestamp?: number;
      externalId?: string;
      parentMemoryId?: UUID;
    }
  ): Memory {
    const formattedSize = this.formatSize(size);

    return this.createMemory({
      role: "user",
      kind: "image",
      content: {
        text: `[Image: ${filename || "unnamed"}] URL: ${url} [${formattedSize}]`,
        normalizedText: `[image] ${url}`,
      },
      source,
      eventId: options?.eventId ?? null,
      timestamp: options?.timestamp,
      externalId: options?.externalId,
      cluster: options?.parentMemoryId
        ? { parentMemoryId: options.parentMemoryId }
        : undefined,
    });
  }

  createSummaryMemory(
    content: string,
    sourceMemoryIds: UUID[],
    options?: {
      timestamp?: number;
    }
  ): Memory {
    return this.createMemory({
      role: "system",
      kind: "summary",
      content: { text: content },
      source: { type: "system" },
      cluster: {
        threadId: sourceMemoryIds[0],
      },
      retrieval: {
        pinned: false,
        lockedByAdmin: false,
        lockedBySystem: true,
        weightKind: 1.2,
        weightSource: 1.0,
      },
      lifecycle: {
        deleted: false,
        replacedBySummaryId:
          sourceMemoryIds.length > 0 ? sourceMemoryIds[0] : undefined,
      },
      timestamp: options?.timestamp,
    });
  }

  private generateId(): UUID {
    const hash = createHash("sha256")
      .update(`${Date.now()}:${Math.random()}`)
      .digest("hex")
      .slice(0, 36);
    return hash as UUID;
  }

  private generateDeterministicId(seed: string): UUID {
    const hash = createHash("sha256").update(seed).digest("hex").slice(0, 36);
    return hash as UUID;
  }

  private formatSize(bytes: number | undefined): string {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
