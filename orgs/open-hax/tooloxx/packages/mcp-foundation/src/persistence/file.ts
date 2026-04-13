import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Persistence, SerializableClient, SerializableCode, SerializableRefreshTokenReuse, SerializableToken } from "./types.js";

export class FilePersistence implements Persistence {
  private store: Map<string, unknown> = new Map();
  private initialized = false;

  constructor(private readonly filePath: string) {}

  async init(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await readFile(this.filePath, "utf8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      for (const [key, value] of Object.entries(data)) {
        this.store.set(key, value);
      }
    } catch {
      // File doesn't exist, start fresh
    }
    this.initialized = true;
  }

  async stop(): Promise<void> {
    await this.persist();
  }

  private async persist(): Promise<void> {
    if (!this.initialized) return;
    const data: Record<string, unknown> = {};
    for (const [key, value] of this.store.entries()) {
      data[key] = value;
    }
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2));
    await rename(tempPath, this.filePath);
  }

  async getCode(code: string): Promise<SerializableCode | undefined> {
    return this.store.get(`code:${code}`) as SerializableCode | undefined;
  }

  async setCode(code: string, value: SerializableCode): Promise<void> {
    this.store.set(`code:${code}`, value);
    await this.persist();
  }

  async deleteCode(code: string): Promise<void> {
    this.store.delete(`code:${code}`);
    await this.persist();
  }

  async getAccessToken(token: string): Promise<SerializableToken | undefined> {
    return this.store.get(`access:${token}`) as SerializableToken | undefined;
  }

  async setAccessToken(token: string, value: SerializableToken): Promise<void> {
    this.store.set(`access:${token}`, value);
    await this.persist();
  }

  async deleteAccessToken(token: string): Promise<void> {
    this.store.delete(`access:${token}`);
    await this.persist();
  }

  async getRefreshToken(token: string): Promise<SerializableToken | undefined> {
    return this.store.get(`refresh:${token}`) as SerializableToken | undefined;
  }

  async setRefreshToken(token: string, value: SerializableToken): Promise<void> {
    this.store.set(`refresh:${token}`, value);
    await this.persist();
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.store.delete(`refresh:${token}`);
    await this.persist();
  }

  async consumeRefreshToken(token: string): Promise<SerializableToken | undefined> {
    const value = this.store.get(`refresh:${token}`) as SerializableToken | undefined;
    if (value) {
      this.store.delete(`refresh:${token}`);
      await this.persist();
    }
    return value;
  }

  async getRefreshTokenReuse(oldRefreshToken: string): Promise<SerializableRefreshTokenReuse | undefined> {
    return this.store.get(`reuse:${oldRefreshToken}`) as SerializableRefreshTokenReuse | undefined;
  }

  async setRefreshTokenReuse(oldRefreshToken: string, value: SerializableRefreshTokenReuse): Promise<void> {
    this.store.set(`reuse:${oldRefreshToken}`, value);
    await this.persist();
  }

  async getClient(clientId: string): Promise<SerializableClient | undefined> {
    return this.store.get(`client:${clientId}`) as SerializableClient | undefined;
  }

  async setClient(clientId: string, value: SerializableClient): Promise<void> {
    this.store.set(`client:${clientId}`, value);
    await this.persist();
  }

  async cleanup(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    let cleaned = 0;
    for (const [key, value] of this.store.entries()) {
      const token = value as { expiresAt?: number };
      if (token.expiresAt && token.expiresAt < now) {
        this.store.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      await this.persist();
    }
    return cleaned;
  }
}