import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface PromptAffinityRecord {
  readonly promptCacheKey: string;
  readonly providerId: string;
  readonly accountId: string;
  readonly updatedAt: number;
}

interface PromptAffinityDb {
  readonly records: PromptAffinityRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function emptyDb(): PromptAffinityDb {
  return { records: [] };
}

function hydrateRecord(raw: unknown): PromptAffinityRecord | null {
  if (!isRecord(raw)) {
    return null;
  }

  const promptCacheKey = typeof raw.promptCacheKey === "string"
    ? raw.promptCacheKey.trim()
    : typeof raw.prompt_cache_key === "string"
      ? raw.prompt_cache_key.trim()
      : "";
  const providerId = typeof raw.providerId === "string" ? raw.providerId.trim() : "";
  const accountId = typeof raw.accountId === "string" ? raw.accountId.trim() : "";
  const updatedAt = typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now();

  if (!promptCacheKey || !providerId || !accountId) {
    return null;
  }

  return {
    promptCacheKey,
    providerId,
    accountId,
    updatedAt,
  };
}

function hydrateDb(raw: unknown): PromptAffinityDb {
  if (!isRecord(raw) || !Array.isArray(raw.records)) {
    return emptyDb();
  }

  return {
    records: raw.records
      .map((entry) => hydrateRecord(entry))
      .filter((entry): entry is PromptAffinityRecord => entry !== null),
  };
}

export class PromptAffinityStore {
  private dbCache: PromptAffinityDb | null = null;
  private mutationChain: Promise<void> = Promise.resolve();
  private persistChain: Promise<void> = Promise.resolve();
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private persistPending = false;
  private closed = false;

  public constructor(
    private readonly filePath: string,
    private readonly persistIntervalMs: number = 250,
  ) {}

  public async warmup(): Promise<void> {
    await this.readDb();
  }

  public async get(promptCacheKey: string): Promise<PromptAffinityRecord | undefined> {
    const normalized = promptCacheKey.trim();
    if (!normalized) {
      return undefined;
    }

    const db = await this.readDb();
    return db.records.find((record) => record.promptCacheKey === normalized);
  }

  public async upsert(promptCacheKey: string, providerId: string, accountId: string): Promise<void> {
    const normalizedKey = promptCacheKey.trim();
    if (!normalizedKey) {
      return;
    }

    await this.mutate((db) => {
      const next: PromptAffinityRecord = {
        promptCacheKey: normalizedKey,
        providerId: providerId.trim(),
        accountId: accountId.trim(),
        updatedAt: Date.now(),
      };
      const index = db.records.findIndex((record) => record.promptCacheKey === normalizedKey);
      if (index >= 0) {
        db.records[index] = next;
      } else {
        db.records.push(next);
      }
    });
  }

  public async delete(promptCacheKey: string): Promise<void> {
    const normalized = promptCacheKey.trim();
    if (!normalized) {
      return;
    }

    await this.mutate((db) => {
      const index = db.records.findIndex((record) => record.promptCacheKey === normalized);
      if (index >= 0) {
        db.records.splice(index, 1);
      }
    });
  }

  public async close(): Promise<void> {
    this.closed = true;
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    await this.mutationChain;
    if (this.persistPending) {
      await this.queuePersist(true);
    }
    await this.persistChain;
  }

  private async readDb(): Promise<PromptAffinityDb> {
    if (this.dbCache) {
      return this.dbCache;
    }

    try {
      const raw = await readFile(this.filePath, "utf8");
      this.dbCache = hydrateDb(JSON.parse(raw) as unknown);
    } catch (error) {
      const code = isRecord(error) && typeof error.code === "string" ? error.code : "";
      if (code === "ENOENT") {
        this.dbCache = emptyDb();
      } else {
        throw error;
      }
    }

    return this.dbCache;
  }

  private async mutate(mutator: (db: PromptAffinityDb) => void): Promise<void> {
    this.mutationChain = this.mutationChain.then(async () => {
      const db = await this.readDb();
      mutator(db);
      this.schedulePersist();
    });
    await this.mutationChain;
  }

  private schedulePersist(): void {
    if (this.closed) {
      return;
    }

    this.persistPending = true;
    if (this.persistTimer) {
      return;
    }

    if (this.persistIntervalMs === 0) {
      void this.queuePersist();
      return;
    }

    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.queuePersist();
    }, this.persistIntervalMs);
    this.persistTimer.unref?.();
  }

  private async queuePersist(force = false): Promise<void> {
    this.persistChain = this.persistChain
      .catch(() => undefined)
      .then(async () => {
        if (!force && !this.persistPending) {
          return;
        }

        const db = await this.readDb();
        this.persistPending = false;
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(this.filePath, JSON.stringify(db, null, 2) + "\n", "utf8");
      });
    await this.persistChain;
  }
}
