import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  Persistence,
  SerializableClient,
  SerializableCode,
  SerializableRefreshTokenReuse,
  SerializableToken,
} from "./types.js";

type StoreShape = {
  codes: Record<string, SerializableCode>;
  accessTokens: Record<string, SerializableToken>;
  refreshTokens: Record<string, SerializableToken>;
  refreshTokenReuse: Record<string, SerializableRefreshTokenReuse>;
  clients: Record<string, SerializableClient>;
};

function emptyStore(): StoreShape {
  return {
    codes: {},
    accessTokens: {},
    refreshTokens: {},
    refreshTokenReuse: {},
    clients: {},
  };
}

export class FilePersistence implements Persistence {
  private state: StoreShape = emptyStore();
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(private readonly filePath: string) {}

  public async init(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoreShape>;
      this.state = {
        codes: parsed.codes ?? {},
        accessTokens: parsed.accessTokens ?? {},
        refreshTokens: parsed.refreshTokens ?? {},
        refreshTokenReuse: parsed.refreshTokenReuse ?? {},
        clients: parsed.clients ?? {},
      };
    } catch {
      this.state = emptyStore();
      await this.persist();
    }
    await this.cleanup();
  }

  public async stop(): Promise<void> {
    await this.queue;
  }

  public async getCode(code: string): Promise<SerializableCode | undefined> {
    return this.readExpiring(this.state.codes, code);
  }

  public async setCode(code: string, value: SerializableCode): Promise<void> {
    await this.writeState(() => {
      this.state.codes[code] = value;
    });
  }

  public async deleteCode(code: string): Promise<void> {
    await this.writeState(() => {
      delete this.state.codes[code];
    });
  }

  public async getAccessToken(token: string): Promise<SerializableToken | undefined> {
    return this.readExpiring(this.state.accessTokens, token);
  }

  public async setAccessToken(token: string, value: SerializableToken): Promise<void> {
    await this.writeState(() => {
      this.state.accessTokens[token] = value;
    });
  }

  public async deleteAccessToken(token: string): Promise<void> {
    await this.writeState(() => {
      delete this.state.accessTokens[token];
    });
  }

  public async getRefreshToken(token: string): Promise<SerializableToken | undefined> {
    return this.readExpiring(this.state.refreshTokens, token);
  }

  public async setRefreshToken(token: string, value: SerializableToken): Promise<void> {
    await this.writeState(() => {
      this.state.refreshTokens[token] = value;
    });
  }

  public async deleteRefreshToken(token: string): Promise<void> {
    await this.writeState(() => {
      delete this.state.refreshTokens[token];
    });
  }

  public async consumeRefreshToken(token: string): Promise<SerializableToken | undefined> {
    return this.writeState(() => {
      const value = this.state.refreshTokens[token];
      delete this.state.refreshTokens[token];
      return value;
    });
  }

  public async getRefreshTokenReuse(oldRefreshToken: string): Promise<SerializableRefreshTokenReuse | undefined> {
    return this.readExpiring(this.state.refreshTokenReuse, oldRefreshToken);
  }

  public async setRefreshTokenReuse(oldRefreshToken: string, value: SerializableRefreshTokenReuse): Promise<void> {
    await this.writeState(() => {
      this.state.refreshTokenReuse[oldRefreshToken] = value;
    });
  }

  public async getClient(clientId: string): Promise<SerializableClient | undefined> {
    return this.state.clients[clientId];
  }

  public async setClient(clientId: string, value: SerializableClient): Promise<void> {
    await this.writeState(() => {
      this.state.clients[clientId] = value;
    });
  }

  public async cleanup(): Promise<number> {
    return this.writeState(() => this.pruneExpired());
  }

  private async writeState<T>(mutate: () => T | Promise<T>): Promise<T> {
    const task = this.queue.then(async () => {
      const result = await mutate();
      this.pruneExpired();
      await this.persist();
      return result;
    });
    this.queue = task.then(() => undefined, () => undefined);
    return task;
  }

  private readExpiring<T extends { expiresAt: number }>(collection: Record<string, T>, key: string): T | undefined {
    const value = collection[key];
    if (!value) {
      return undefined;
    }
    if (value.expiresAt <= Math.floor(Date.now() / 1000)) {
      delete collection[key];
      void this.persist();
      return undefined;
    }
    return value;
  }

  private pruneExpired(): number {
    const now = Math.floor(Date.now() / 1000);
    let removed = 0;

    removed += this.pruneCollection(this.state.codes, now);
    removed += this.pruneCollection(this.state.accessTokens, now);
    removed += this.pruneCollection(this.state.refreshTokens, now);
    removed += this.pruneCollection(this.state.refreshTokenReuse, now);

    return removed;
  }

  private pruneCollection<T extends { expiresAt: number }>(collection: Record<string, T>, now: number): number {
    let removed = 0;
    for (const [key, value] of Object.entries(collection)) {
      if (value.expiresAt <= now) {
        delete collection[key];
        removed += 1;
      }
    }
    return removed;
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(this.state, null, 2)}\n`, { mode: 0o600 });
    await rename(tempPath, this.filePath);
  }
}
