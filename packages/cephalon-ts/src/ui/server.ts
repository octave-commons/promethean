import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { readFileSync, promises as fs } from "fs";
import type { ChromaMemoryStore } from "../chroma/client.js";
import type { MemoryStore } from "../core/memory-store.js";
import type { Memory } from "../types/index.js";
import type { OpenPlannerClient } from "../openplanner/client.js";
import {
  approveRestartRequest,
  createRestartRequest,
  getGitStatus,
  getLogFilePath,
  getRestartRequest,
  getRuntimeSourceRoot,
  getSelfName,
  listRestartRequestsForTarget,
  readLogTail,
  runRepoCommand,
  safeResolveWithinRoot,
} from "../peer/runtime.js";

// Handle both ESM (import.meta.url) and CJS (module.parent.filename or __dirname)
function getDirname(): string {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return dirname(fileURLToPath(import.meta.url));
  }
  // Fallback for CJS require - use current working directory or parent module
  return process.cwd();
}

const __dirname = getDirname();

// Point to src/ui/public for static files
function getPublicDir(): string {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    // ESM: use the script's actual directory
    return join(dirname(fileURLToPath(import.meta.url)), "public");
  }
  // CJS fallback - try module.filename first
  if (typeof module !== 'undefined' && module.filename) {
    return join(dirname(module.filename), "public");
  }
  // Last resort fallback
  return join(process.cwd(), "public");
}

const PUBLIC_DIR = getPublicDir();

// ============================================================================
// JSON Utility - Ensures all JSON data is parsable and table-ready
// ============================================================================

export function toTableCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return "{}";
    }
    return `{${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""}}`;
  }
  return String(value);
}

export interface TableRow {
  id: string;
  timestamp: string;
  sessionId: string;
  role: string;
  kind: string;
  content: string;
  pinned: string;
  source: string;
  cephalonId: string;
  // Dynamic columns for tool_result with JSON content
  dynamicColumns?: Record<string, string>;
  dynamicColumnKeys?: string[];
}

function parseToolResultContent(content: string): { data: unknown; type: 'object' | 'array' | 'string' } | null {
  try {
    let contentToParse = content.trim();
    
    // Check for stringified JSON pattern: {"text": "..."}
    const stringifiedMatch = contentToParse.match(/^"text":\s*"(.+)"/);
    if (stringifiedMatch && stringifiedMatch[1]) {
      const jsonStr = stringifiedMatch[1];
      let fixedJson = jsonStr.replace(/\\"/g, '"');
      const parsed = JSON.parse(fixedJson);
      
      if (typeof parsed === 'object' || Array.isArray(parsed)) {
        return { data: parsed, type: Array.isArray(parsed) ? 'array' : 'object' };
      }
    }
    
    // Try direct JSON parsing
    const parsed = JSON.parse(contentToParse);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    
    if (Array.isArray(parsed)) {
      return { data: parsed, type: 'array' };
    }
    
    if (typeof parsed === 'object') {
      return { data: parsed, type: 'object' };
    }
    
    return { data: parsed, type: 'string' };
  } catch {
    return null;
  }
}

function getObjectKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).sort();
}

function getCommonKeysFromArray(arr: unknown[]): string[] {
  const keySet = new Set<string>();
  
  for (const item of arr) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item).forEach(key => keySet.add(key));
    }
  }
  
  return Array.from(keySet).sort();
}

function formatToolResultCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return "{}";
    }
    return keys.slice(0, 3).map(k => `${k}: ${toTableCell(obj[k])}`).join(', ') + 
           (keys.length > 3 ? '...' : '');
  }
  return String(value);
}

export function memoryToTableRow(memory: Record<string, unknown>): TableRow {
  const getNestedValue = (obj: unknown, path: string): string => {
    const keys = path.split(".");
    let value: unknown = obj;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return "";
      }
    }
    return toTableCell(value);
  };

  const kind = getNestedValue(memory, "kind") as string;
  
  // Handle content - can be string or MemoryContent object
  const contentValue = getNestedValue(memory, "content");
  let contentText: string;
  if (typeof contentValue === "string") {
    contentText = contentValue;
  } else if (typeof contentValue === "object" && contentValue !== null) {
    const contentObj = contentValue as { text: string };
    contentText = contentObj.text;
  } else {
    contentText = String(contentValue);
  }
  
  const baseRow: TableRow = {
    id: getNestedValue(memory, "id"),
    timestamp: getNestedValue(memory, "timestamp"),
    sessionId: getNestedValue(memory, "sessionId"),
    role: getNestedValue(memory, "role"),
    kind: kind,
    content: contentText,
    pinned: getNestedValue(memory, "retrieval.pinned"),
    source: getNestedValue(memory, "source.type"),
    cephalonId: getNestedValue(memory, "cephalonId"),
  };

  // Special handling for tool_result with JSON content
  if (kind === 'tool_result') {
    const parsedContent = parseToolResultContent(contentText);
    
    if (parsedContent) {
      baseRow.dynamicColumnKeys = [];
      baseRow.dynamicColumns = {};
      
      if (parsedContent.type === 'object') {
        const data = parsedContent.data as Record<string, unknown>;
        const keys = getObjectKeys(data);
        baseRow.dynamicColumnKeys = keys;
        
        keys.forEach(key => {
          baseRow.dynamicColumns![key] = formatToolResultCell(data[key]);
        });
      } else if (parsedContent.type === 'array') {
        const data = parsedContent.data as unknown[];
        const keys = getCommonKeysFromArray(data);
        baseRow.dynamicColumnKeys = keys;
        
        // Show array summary in content cell
        baseRow.content = `[${data.length} items] - Array result`;
        
        // Add first item's data as dynamic columns
        if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
          keys.forEach(key => {
            baseRow.dynamicColumns![key] = formatToolResultCell((data[0] as Record<string, unknown>)[key]);
          });
        }
      }
    }
  }

  return baseRow;
}

interface SearchQuery {
  query: string;
  limit?: string;
}

interface ListQuery {
  sessionId?: string;
  kind?: string;
  limit?: string;
  offset?: string;
}

interface PinBody {
  priority?: number;
}

export interface RuntimeInspector {
  getState?: () => unknown | Promise<unknown>;
}

export interface MemoryUIConfig {
  port: number;
  chromaStore?: ChromaMemoryStore;
  openPlannerClient?: OpenPlannerClient;
  memoryStore: MemoryStore;
  runtimeInspector?: RuntimeInspector;
}

function getCaller(request: FastifyRequest): string {
  const caller = request.headers["x-cephalon-caller"];
  return Array.isArray(caller) ? caller[0] ?? "unknown" : caller ?? "unknown";
}

function truncateOutput(text: string, maxLength = 8000): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n...[truncated]` : text;
}

export class MemoryUIServer {
  private fastify: any;
  private chromaStore?: ChromaMemoryStore;
  private openPlannerClient?: OpenPlannerClient;
  private memoryStore: MemoryStore;
  private port: number;
  private runtimeInspector?: RuntimeInspector;

  constructor(config: MemoryUIConfig) {
    this.port = config.port;
    this.chromaStore = config.chromaStore;
    this.openPlannerClient = config.openPlannerClient;
    this.memoryStore = config.memoryStore;
    this.runtimeInspector = config.runtimeInspector;
    this.fastify = Fastify({ logger: false });
  }

  async start(): Promise<void> {
    await this.fastify.register(fastifyCors as never, {
      origin: true,
    });

    // Register API routes FIRST so they take precedence
    this.registerRoutes();

    await this.fastify.register(fastifyStatic as never, {
      root: PUBLIC_DIR,
      prefix: "/",
      decorateReply: false,
    });

    this.fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url.startsWith("/api/")) {
        return reply.status(404).send({ error: "API endpoint not found" });
      }
      const indexPath = join(PUBLIC_DIR, "index.html");
      const content = readFileSync(indexPath, "utf-8");
      return reply.type("text/html").send(content);
    });

    await this.fastify.listen({ port: this.port, host: "0.0.0.0" });
    console.log(`[MemoryUI] Server running at http://localhost:${this.port}`);
  }

  async stop(): Promise<void> {
    await this.fastify.close();
  }

  private async loadAllMemories(): Promise<Memory[]> {
    if (!this.memoryStore.getAllMemories) return [];
    return Promise.resolve(this.memoryStore.getAllMemories());
  }

  private registerRoutes(): void {
    this.fastify.get("/api/memories/count", async () => {
      if (this.chromaStore) {
        const count = await this.chromaStore.getMemoryCount();
        return { count };
      }
      const memories = await this.loadAllMemories();
      const count = memories.length;
      return { count };
    });

    this.fastify.get("/api/runtime/self", async () => {
      const state = await this.runtimeInspector?.getState?.();
      return {
        runtime: state ?? null,
      };
    });

    this.fastify.get("/api/runtime/handshake", async () => {
      const state = await this.runtimeInspector?.getState?.();
      return {
        ok: true,
        status: "ready",
        runtime: state ?? null,
      };
    });

    this.fastify.get("/api/memories/search", async (request: FastifyRequest<{ Querystring: SearchQuery }>) => {
      const { query, limit = "10" } = request.query;

      if (!query) {
        return { error: "Query parameter required" };
      }

      const parsedLimit = parseInt(limit, 10);
      const results = this.chromaStore
        ? await this.chromaStore.search(query, { limit: parsedLimit })
        : this.openPlannerClient
          ? (await this.openPlannerClient.searchFts(query, {
              limit: parsedLimit,
            })).map((result) => ({
              id: result.id,
              content: result.text ?? "",
              metadata: {
                cephalonId: String(result.meta?.cephalon_id ?? ""),
                sessionId: String(result.source_ref?.session ?? ""),
                timestamp: result.ts ? Date.parse(result.ts) : 0,
                kind: String(result.kind ?? ""),
                source: String(result.source ?? ""),
              },
              distance: result.score,
            }))
          : [];

      return { results };
    });

    this.fastify.get("/api/memories/pinned", async () => {
      const allMemories = await this.loadAllMemories();
      const pinned = allMemories.filter((m) => m.retrieval.pinned);
      return { pinned };
    });

    this.fastify.get("/api/memories/context", async () => {
      const allMemories = await this.loadAllMemories();
      const recent = allMemories
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);

      const pinned = allMemories.filter((m) => m.retrieval.pinned);

      const bySession = allMemories.reduce<Record<string, Memory[]>>(
        (acc, m) => {
          if (!acc[m.sessionId]) acc[m.sessionId] = [];
          acc[m.sessionId].push(m);
          return acc;
        },
        {},
      );

      return {
        recent,
        pinned,
        sessionCount: Object.keys(bySession).length,
        totalCount: allMemories.length,
      };
    });

    this.fastify.get("/api/memories/list", async (request: FastifyRequest<{ Querystring: ListQuery }>) => {
      const { sessionId, kind, limit = "50", offset = "0" } = request.query;

      let memories = await this.loadAllMemories();

      if (sessionId) {
        memories = memories.filter((m) => m.sessionId === sessionId);
      }

      if (kind) {
        memories = memories.filter((m) => m.kind === kind);
      }

      memories = memories.sort((a, b) => b.timestamp - a.timestamp);

      const total = memories.length;
      const start = parseInt(offset, 10);
      const end = start + parseInt(limit, 10);
      memories = memories.slice(start, end);

      return { memories, total, offset: start, limit: parseInt(limit, 10) };
    });

    this.fastify.get("/api/memories/table", async (request: FastifyRequest<{ Querystring: ListQuery }>) => {
      const { sessionId, kind, limit = "50", offset = "0" } = request.query;
      
      let memories = await this.loadAllMemories();
      
      if (sessionId) {
        memories = memories.filter((m) => m.sessionId === sessionId);
      }
      
      if (kind) {
        memories = memories.filter((m) => m.kind === kind);
      }
      
      memories = memories.sort((a, b) => b.timestamp - a.timestamp);
      
      const total = memories.length;
      const start = parseInt(offset, 10);
      const end = start + parseInt(limit, 10);
      const paginatedMemories = memories.slice(start, end);
      
      // Convert to table-friendly format
      const tableRows: TableRow[] = paginatedMemories.map((m) =>
        memoryToTableRow(m as unknown as Record<string, unknown>),
      );
      
      // Collect all columns including dynamic ones
      const baseColumns = ["id", "timestamp", "sessionId", "role", "kind", "content", "pinned", "source", "cephalonId"];
      const allColumns = new Set(baseColumns);
      tableRows.forEach((row) => {
        if (row.dynamicColumnKeys) {
          row.dynamicColumnKeys.forEach((col) => allColumns.add(col));
        }
      });
      const uniqueColumns = Array.from(allColumns);
      
      return {
        columns: uniqueColumns,
        rows: tableRows,
        total,
        offset: start,
        limit: parseInt(limit, 10),
      };
    });

    this.fastify.get("/api/memories/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      if (!this.memoryStore.getMemoryById) {
        return reply.status(501).send({ error: "Memory lookup not supported" });
      }

      const memory = await Promise.resolve(this.memoryStore.getMemoryById(id));

      if (!memory) {
        return reply.status(404).send({ error: "Memory not found" });
      }

      return { memory };
    });

    this.fastify.post("/api/memories/:id/pin", async (request: FastifyRequest<{ Params: { id: string }; Body: PinBody }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { priority = 10 } = request.body;

      if (!this.memoryStore.pinMemory) {
        return reply.status(501).send({ error: "Pinning not supported" });
      }

      try {
        await Promise.resolve(this.memoryStore.pinMemory(id, priority));
        return { success: true };
      } catch (error) {
        return reply.status(500).send({
          error: error instanceof Error ? error.message : "Failed to pin memory",
        });
      }
    });

    this.fastify.post("/api/memories/:id/unpin", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      if (!this.memoryStore.unpinMemory) {
        return reply.status(501).send({ error: "Unpinning not supported" });
      }

      try {
        await Promise.resolve(this.memoryStore.unpinMemory(id));
        return { success: true };
      } catch (error) {
        return reply.status(500).send({
          error:
            error instanceof Error ? error.message : "Failed to unpin memory",
        });
      }
    });

    this.fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.url.startsWith("/api/peer/")) {
        return;
      }

      const peerToken = process.env.CEPHALON_PEER_TOKEN;
      if (!peerToken) {
        return reply.status(503).send({ error: "CEPHALON_PEER_TOKEN not configured" });
      }

      const provided = request.headers["x-cephalon-peer-token"];
      if (typeof provided !== "string" || provided !== peerToken) {
        return reply.status(401).send({ error: "peer auth required" });
      }
    });

    this.fastify.get("/api/peer/meta", async () => {
      return {
        self: getSelfName(),
        repoRoot: getRuntimeSourceRoot(),
        logFile: getLogFilePath(),
        gitStatus: await getGitStatus(),
      };
    });

    this.fastify.get(
      "/api/peer/files/*",
      async (request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot read own code via peer API" });
        }

        try {
          const relativePath = request.params["*"];
          const fullPath = safeResolveWithinRoot(getRuntimeSourceRoot(), relativePath);
          const content = await fs.readFile(fullPath, "utf-8");
          return {
            peer: self,
            caller,
            path: relativePath,
            content,
            repoRoot: getRuntimeSourceRoot(),
            gitStatus: await getGitStatus(),
          };
        } catch (error) {
          return reply.status(404).send({
            error: error instanceof Error ? error.message : "File not found",
          });
        }
      },
    );

    this.fastify.put(
      "/api/peer/files/*",
      async (
        request: FastifyRequest<{ Params: { '*': string }; Body: { content: string } }>,
        reply: FastifyReply,
      ) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot write own code via peer API" });
        }

        const relativePath = request.params["*"];
        const content = request.body?.content ?? "";

        try {
          const fullPath = safeResolveWithinRoot(getRuntimeSourceRoot(), relativePath);
          await fs.mkdir(dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content, "utf-8");
          return {
            peer: self,
            caller,
            path: relativePath,
            written: true,
            repoRoot: getRuntimeSourceRoot(),
            gitStatus: await getGitStatus(),
          };
        } catch (error) {
          return reply.status(500).send({
            error: error instanceof Error ? error.message : "Failed to write file",
          });
        }
      },
    );

    this.fastify.post(
      "/api/peer/edit-file",
      async (
        request: FastifyRequest<{
          Body: { path: string; oldText: string; newText: string };
        }>,
        reply: FastifyReply,
      ) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot edit own code via peer API" });
        }

        const relativePath = request.body?.path ?? "";
        const { oldText, newText } = request.body ?? { oldText: "", newText: "" };

        try {
          const fullPath = safeResolveWithinRoot(getRuntimeSourceRoot(), relativePath);
          const original = await fs.readFile(fullPath, "utf-8");
          if (!original.includes(oldText)) {
            return reply.status(400).send({ error: "oldText not found" });
          }
          const updated = original.replace(oldText, newText);
          await fs.writeFile(fullPath, updated, "utf-8");
          return {
            peer: self,
            caller,
            path: relativePath,
            edited: true,
            repoRoot: getRuntimeSourceRoot(),
            gitStatus: await getGitStatus(),
          };
        } catch (error) {
          return reply.status(500).send({
            error: error instanceof Error ? error.message : "Failed to edit file",
          });
        }
      },
    );

    this.fastify.post(
      "/api/peer/bash",
      async (
        request: FastifyRequest<{ Body: { command: string; timeoutMs?: number } }>,
        reply: FastifyReply,
      ) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot bash own code via peer API" });
        }

        const command = request.body?.command ?? "";
        const timeoutMs = request.body?.timeoutMs ?? 30_000;
        const result = await runRepoCommand(command, timeoutMs);

        return {
          peer: self,
          caller,
          command,
          stdout: truncateOutput(result.stdout),
          stderr: truncateOutput(result.stderr),
          exitCode: result.exitCode,
          repoRoot: getRuntimeSourceRoot(),
          gitStatus: await getGitStatus(),
        };
      },
    );

    this.fastify.get(
      "/api/peer/logs",
      async (request: FastifyRequest<{ Querystring: { lines?: string } }>, reply: FastifyReply) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot read own logs via peer API" });
        }

        const lines = parseInt(request.query.lines ?? "50", 10);
        return {
          peer: self,
          caller,
          logs: await readLogTail(lines),
          logFile: getLogFilePath(),
        };
      },
    );

    this.fastify.post(
      "/api/peer/restart-request",
      async (
        request: FastifyRequest<{ Body: { reason?: string } }>,
        reply: FastifyReply,
      ) => {
        const caller = getCaller(request);
        const self = getSelfName();
        if (caller.toLowerCase() === self) {
          return reply.status(403).send({ error: "Cannot request restart for self" });
        }

        const record = await createRestartRequest(caller, self, request.body?.reason ?? "No reason provided");
        return {
          requestId: record.id,
          target: record.target,
          requester: record.requester,
          approvals: record.approvals,
          status: record.status,
        };
      },
    );

    this.fastify.post(
      "/api/peer/restart-approve/:requestId",
      async (
        request: FastifyRequest<{ Params: { requestId: string } }>,
        reply: FastifyReply,
      ) => {
        const caller = getCaller(request);
        const self = getSelfName();
        const record = await approveRestartRequest(request.params.requestId, caller);
        if (!record) {
          return reply.status(404).send({ error: "Restart request not found" });
        }

        const response = {
          requestId: record.id,
          target: record.target,
          requester: record.requester,
          approved: record.status === "approved",
          approvers: record.approvals,
        };

        if (record.status === "approved" && record.target === self) {
          setTimeout(() => {
            process.kill(process.pid, "SIGTERM");
          }, 750);
        }

        return response;
      },
    );

    this.fastify.get(
      "/api/peer/restart-status/:requestId",
      async (
        request: FastifyRequest<{ Params: { requestId: string } }>,
        reply: FastifyReply,
      ) => {
        const record = await getRestartRequest(request.params.requestId);
        if (!record) {
          return reply.status(404).send({ error: "Restart request not found" });
        }
        return {
          requestId: record.id,
          target: record.target,
          requester: record.requester,
          approved: record.status === "approved",
          approvers: record.approvals,
          status: record.status,
        };
      },
    );

    this.fastify.get("/api/peer/restart-requests", async () => {
      const self = getSelfName();
      const requests = await listRestartRequestsForTarget(self);
      return { requests };
    });
  }
}
