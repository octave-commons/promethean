// Placeholder persistence layer for OpenCode hub
import type { SessionIndexEvent } from "../types.js";
import { appendFile } from "node:fs/promises";

export interface PersistenceSink {
  indexEvent(ev: SessionIndexEvent): Promise<void>;
  indexDocs(docs: Array<{ id: string; repoId: string; kind: string; text: string; meta?: Record<string, unknown> }>): Promise<void>;
}

// Simple file-based persistence for development
export class FilePersistence implements PersistenceSink {
  private logPath: string;

  constructor(logPath = "./opencode-hub.log") {
    this.logPath = logPath;
  }

  async indexEvent(ev: SessionIndexEvent): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] EVENT: ${JSON.stringify(ev)}\n`;
    try {
      await appendFile(this.logPath, logEntry, { encoding: 'utf8' });
    } catch (error) {
      console.error('Failed to write event log:', error);
    }
  }

  async indexDocs(docs: Array<{ id: string; repoId: string; kind: string; text: string; meta?: Record<string, unknown> }>): Promise<void> {
    for (const doc of docs) {
      const logEntry = `[${new Date().toISOString()}] DOC: ${JSON.stringify(doc)}\n`;
      try {
        await appendFile(this.logPath, logEntry, { encoding: 'utf8' });
      } catch (error) {
        console.error('Failed to write doc log:', error);
      }
    }
  }
}

// No-op sink for testing
export class NoopPersistence implements PersistenceSink {
  async indexEvent(ev: SessionIndexEvent): Promise<void> {
    console.log("NoopPersistence: indexEvent", ev);
  }
  async indexDocs(docs: Array<{ id: string; repoId: string; kind: string; text: string; meta?: Record<string, unknown> }>): Promise<void> {
    console.log("NoopPersistence: indexDocs", docs);
  }
}

