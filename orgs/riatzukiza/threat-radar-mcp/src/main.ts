import "dotenv/config";
import { randomUUID } from "node:crypto";

import cors from "cors";
import express, { type RequestHandler } from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { createMcpHttpRouter } from "@workspace/mcp-foundation";
import {
  createAuditLogger,
  EvidenceIndex,
  radarAssessmentPacketSchema,
  radarModuleVersionSchema,
  radarSchema,
  reduceRadarPackets,
  sourceDefinitionSchema,
  type Radar,
  type RadarAssessmentPacket,
  type RadarModuleVersion,
  type ReducedSnapshot,
  type SourceDefinition,
} from "@workspace/radar-core";
import { getSql, initSchema, closeSql } from "./lib/postgres.js";
import { PostgresRadarStore } from "./store.js";

const ENV = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(10002),
  PUBLIC_BASE_URL: z.string().url().optional(),
  ADMIN_AUTH_KEY: z.string().min(12),
  ALLOW_UNAUTH_LOCAL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
}).parse(process.env);

const publicBaseUrl = new URL(ENV.PUBLIC_BASE_URL ?? process.env.RENDER_EXTERNAL_URL ?? `http://127.0.0.1:${ENV.PORT}`);
const usePostgres = Boolean(ENV.DATABASE_URL);

function nowIso(): string {
  return new Date().toISOString();
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isLoopbackAddress(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized === "::1" || normalized === "127.0.0.1" || normalized === "::ffff:127.0.0.1" || normalized.startsWith("127.");
}

function isLoopbackRequest(req: express.Request): boolean {
  const remote = req.socket.remoteAddress ?? "";
  const forwardedFor = String(req.headers["x-forwarded-for"] ?? "").split(",")[0]?.trim() ?? "";
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").toLowerCase();
  const bareHost = host.startsWith("[") ? host.slice(1, host.indexOf("]")) : host.split(":")[0] ?? "";
  return isLoopbackAddress(remote) && (!forwardedFor || isLoopbackAddress(forwardedFor)) && (!bareHost || bareHost === "localhost" || bareHost === "127.0.0.1" || bareHost === "::1");
}

function requireAdminKey(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const supplied = String(req.headers["x-admin-auth-key"] ?? "");
  if (supplied === ENV.ADMIN_AUTH_KEY) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

let store: PostgresRadarStore | InMemoryRadarStore;
const evidenceIndexes = new Map<string, EvidenceIndex>();

type InMemoryRadarRecord = {
  radar: Radar;
  moduleVersions: RadarModuleVersion[];
  sources: SourceDefinition[];
  submissions: Array<{ packet: RadarAssessmentPacket; weight: number; receivedAt: string }>;
  liveSnapshot?: ReducedSnapshot;
  dailySnapshots: ReducedSnapshot[];
};

class InMemoryRadarStore {
  private radars = new Map<string, InMemoryRadarRecord>();

  async getRadar(radarId: string): Promise<Radar | null> {
    const record = this.radars.get(radarId);
    return record?.radar ?? null;
  }

  async listRadars(): Promise<Radar[]> {
    return [...this.radars.values()].map((r) => r.radar);
  }

  async createRadar(radar: Radar): Promise<void> {
    this.radars.set(radar.id, {
      radar,
      moduleVersions: [],
      sources: [],
      submissions: [],
      dailySnapshots: [],
    });
  }

  async updateRadar(radarId: string, updates: Partial<Radar>): Promise<void> {
    const record = this.radars.get(radarId);
    if (record) {
      record.radar = { ...record.radar, ...updates, updated_at: nowIso() };
    }
  }

  async getModuleVersion(moduleVersionId: string): Promise<RadarModuleVersion | null> {
    for (const record of this.radars.values()) {
      const found = record.moduleVersions.find((mv) => mv.id === moduleVersionId);
      if (found) return found;
    }
    return null;
  }

  async listModuleVersions(radarId: string): Promise<RadarModuleVersion[]> {
    return this.radars.get(radarId)?.moduleVersions ?? [];
  }

  async createModuleVersion(mv: RadarModuleVersion): Promise<void> {
    const record = this.radars.get(mv.radar_id);
    if (record) {
      record.moduleVersions.push(mv);
    }
  }

  async listSources(radarId: string): Promise<SourceDefinition[]> {
    return this.radars.get(radarId)?.sources ?? [];
  }

  async createSource(source: SourceDefinition): Promise<void> {
    const record = this.radars.get(source.radar_id);
    if (record) {
      record.sources.push(source);
    }
  }

  async listSubmissions(radarId: string): Promise<Array<{ packet: RadarAssessmentPacket; weight: number; receivedAt: string }>> {
    return this.radars.get(radarId)?.submissions ?? [];
  }

  async createSubmission(packet: RadarAssessmentPacket, weight: number): Promise<void> {
    const record = this.radars.get(packet.radar_id);
    if (record) {
      record.submissions.push({ packet, weight, receivedAt: nowIso() });
    }
  }

  async getLatestLiveSnapshot(radarId: string): Promise<ReducedSnapshot | null> {
    return this.radars.get(radarId)?.liveSnapshot ?? null;
  }

  async getLatestDailySnapshot(radarId: string): Promise<ReducedSnapshot | null> {
    const record = this.radars.get(radarId);
    if (!record) return null;
    return record.dailySnapshots[record.dailySnapshots.length - 1] ?? null;
  }

  async createSnapshot(snapshot: ReducedSnapshot): Promise<void> {
    const record = this.radars.get(snapshot.radar_id);
    if (!record) return;
    if (snapshot.snapshot_kind === "live") {
      record.liveSnapshot = snapshot;
    } else {
      record.dailySnapshots.push(snapshot);
    }
  }

  async listDailySnapshots(radarId: string): Promise<ReducedSnapshot[]> {
    return this.radars.get(radarId)?.dailySnapshots ?? [];
  }

  async createAuditEvent(radarId: string, eventType: string, payload: object): Promise<void> {
    // no-op for in-memory
  }

  async listAuditEvents(radarId: string): Promise<Array<{ event_type: string; payload: object; created_at: string }>> {
    return [];
  }
}

function getEvidenceIndex(radarId: string): EvidenceIndex {
  const existing = evidenceIndexes.get(radarId);
  if (existing) return existing;
  const created = new EvidenceIndex();
  evidenceIndexes.set(radarId, created);
  return created;
}

function createDefaultMaritimeTemplate(radarId: string, createdBy: string): RadarModuleVersion {
  return radarModuleVersionSchema.parse({
    id: `${radarId}:module:v1`,
    radar_id: radarId,
    version: 1,
    signal_definitions: [
      { id: "transit_flow", label: "Transit Flow", description: "Observed transit throughput and continuity", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
      { id: "attack_tempo", label: "Attack Tempo", description: "Frequency and severity of hostile incidents", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
      { id: "insurance_availability", label: "Insurance Availability", description: "War-risk and marine insurance availability", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
    ],
    branch_definitions: [
      { id: "reopening", label: "Reopening", description: "Conditions normalizing" },
      { id: "effective_closure", label: "Effective Closure", description: "Sustained disruption persists" },
      { id: "wider_escalation", label: "Wider Escalation", description: "Regional conflict expansion" },
    ],
    source_adapter_refs: [],
    model_weight_table: {
      "perplexity-sonar": 0.25,
      "perplexity-sonar-pro": 0.3,
      "gpt-4o": 0.25,
      "claude-3.5-sonnet": 0.25,
      "gemini-2.5-pro": 0.28,
    },
    reducer_config: {
      signal_quantile_low: 0.25,
      signal_quantile_high: 0.75,
      disagreement_divisor: 2,
    },
    validation_rules: {},
    status: "active",
    created_by: createdBy,
    created_at: nowIso(),
  });
}

async function createRadar(input: { slug: string; name: string; category: string; templateId?: string; createdBy: string }): Promise<Radar> {
  const radar = radarSchema.parse({
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    category: input.category,
    status: "active",
    template_id: input.templateId,
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  const initialModule = createDefaultMaritimeTemplate(radar.id, input.createdBy);
  radar.active_module_version_id = initialModule.id;
  await store.createRadar(radar);
  await store.createModuleVersion(initialModule);
  await store.createAuditEvent(radar.id, "radar_created", { slug: input.slug, name: input.name, created_by: input.createdBy });
  return radar;
}

async function addSource(input: SourceDefinition): Promise<SourceDefinition> {
  await store.createSource(input);
  await store.updateRadar(input.radar_id, {});
  await store.createAuditEvent(input.radar_id, "source_added", { source_id: input.id, kind: input.kind });
  return input;
}

async function submitPacket(packet: RadarAssessmentPacket): Promise<{ submissionId: string; weight: number }> {
  const radar = await store.getRadar(packet.radar_id);
  if (!radar) {
    throw new Error(`Unknown radar: ${packet.radar_id}`);
  }
  const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
  if (!moduleVersion) {
    throw new Error(`No active module for radar ${packet.radar_id}`);
  }
  if (packet.module_version_id !== moduleVersion.id) {
    throw new Error(`Packet module version ${packet.module_version_id} does not match active module ${moduleVersion.id}`);
  }
  const weight = moduleVersion.model_weight_table[packet.model_id] ?? 0.2;
  await store.createSubmission(packet, weight);
  getEvidenceIndex(packet.radar_id).indexBatch(packet.sources);
  await store.createAuditEvent(packet.radar_id, "packet_submitted", { model_id: packet.model_id, weight });
  return { submissionId: packet.thread_id, weight };
}

async function reduceLive(radarId: string): Promise<ReducedSnapshot> {
  const radar = await store.getRadar(radarId);
  if (!radar) {
    throw new Error(`Unknown radar: ${radarId}`);
  }
  const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
  if (!moduleVersion) {
    throw new Error(`No active module for radar ${radarId}`);
  }
  const submissions = await store.listSubmissions(radarId);
  if (submissions.length === 0) {
    throw new Error("No submissions to reduce");
  }
  const snapshot = reduceRadarPackets({
    radarId,
    moduleVersion,
    submissions,
    snapshotKind: "live",
    snapshotId: `${radarId}:live:${Date.now()}`,
  });
  await store.createSnapshot(snapshot);
  await store.createAuditEvent(radarId, "live_reduction", { snapshot_id: snapshot.id });
  return snapshot;
}

async function sealDailySnapshot(radarId: string): Promise<ReducedSnapshot> {
  const radar = await store.getRadar(radarId);
  if (!radar) {
    throw new Error(`Unknown radar: ${radarId}`);
  }
  const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
  if (!moduleVersion) {
    throw new Error(`No active module for radar ${radarId}`);
  }
  const submissions = await store.listSubmissions(radarId);
  if (submissions.length === 0) {
    throw new Error("No submissions to reduce");
  }
  const snapshot = reduceRadarPackets({
    radarId,
    moduleVersion,
    submissions,
    snapshotKind: "daily",
    snapshotId: `${radarId}:daily:${new Date().toISOString().slice(0, 10)}`,
  });
  await store.createSnapshot(snapshot);
  await store.createAuditEvent(radarId, "daily_sealed", { snapshot_id: snapshot.id });
  return snapshot;
}

const app = express();
app.set("trust proxy", true);
app.use(cors({ origin: "*", exposedHeaders: ["mcp-session-id"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "threat-radar-mcp",
    storage: usePostgres ? "postgres" : "memory",
    publicBaseUrl: publicBaseUrl.toString(),
  });
});

app.get("/api/radars", async (_req, res) => {
  const radars = await store.listRadars();
  const result = await Promise.all(radars.map(async (radar) => {
    const sources = await store.listSources(radar.id);
    const submissions = await store.listSubmissions(radar.id);
    const liveSnapshot = await store.getLatestLiveSnapshot(radar.id);
    const latestDailySnapshot = await store.getLatestDailySnapshot(radar.id);
    return {
      radar,
      sourceCount: sources.length,
      submissionCount: submissions.length,
      liveSnapshot,
      latestDailySnapshot,
    };
  }));
  res.json(result);
});

app.post("/api/radars", requireAdminKey, async (req, res) => {
  const body = z.object({ slug: z.string().min(1), name: z.string().min(1), category: z.string().min(1), templateId: z.string().optional(), createdBy: z.string().min(1).default("admin") }).parse(req.body);
  const radar = await createRadar(body);
  res.status(201).json(radar);
});

const server = new McpServer({ name: "threat-radar-mcp", version: "0.1.0" });

server.registerTool(
  "radar_create",
  {
    description: "Create a new threat radar from a template",
    inputSchema: {
      slug: z.string().min(1),
      name: z.string().min(1),
      category: z.string().min(1),
      templateId: z.string().optional(),
      createdBy: z.string().min(1).default("agent"),
    },
  },
  async ({ slug, name, category, templateId, createdBy }): Promise<CallToolResult> => {
    const radar = await createRadar({ slug, name, category, templateId, createdBy });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, radar }, null, 2) }] };
  },
);

server.registerTool(
  "radar_list",
  {
    description: "List current threat radars",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async (): Promise<CallToolResult> => {
    const radars = await store.listRadars();
    const list = await Promise.all(radars.map(async (radar) => {
      const sources = await store.listSources(radar.id);
      const submissions = await store.listSubmissions(radar.id);
      const liveSnapshot = await store.getLatestLiveSnapshot(radar.id);
      const dailySnapshots = await store.listDailySnapshots(radar.id);
      return {
        radar,
        sourceCount: sources.length,
        submissionCount: submissions.length,
        hasLiveSnapshot: Boolean(liveSnapshot),
        dailySnapshotCount: dailySnapshots.length,
      };
    }));
    return { content: [{ type: "text", text: JSON.stringify(list, null, 2) }] };
  },
);

server.registerTool(
  "radar_add_source",
  {
    description: "Attach a typed source definition to a radar",
    inputSchema: { source: sourceDefinitionSchema },
  },
  async ({ source }): Promise<CallToolResult> => {
    const created = await addSource(source);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, source: created }, null, 2) }] };
  },
);

server.registerTool(
  "radar_submit_packet",
  {
    description: "Submit a structured assessment packet for a radar",
    inputSchema: { packet: radarAssessmentPacketSchema },
  },
  async ({ packet }): Promise<CallToolResult> => {
    const result = await submitPacket(packet);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...result }, null, 2) }] };
  },
);

server.registerTool(
  "radar_reduce_live",
  {
    description: "Produce the current live reduced snapshot for a radar",
    inputSchema: { radarId: z.string().min(1) },
  },
  async ({ radarId }): Promise<CallToolResult> => {
    const snapshot = await reduceLive(radarId);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, snapshot }, null, 2) }] };
  },
);

server.registerTool(
  "radar_seal_daily_snapshot",
  {
    description: "Seal an immutable daily snapshot for a radar",
    inputSchema: { radarId: z.string().min(1) },
  },
  async ({ radarId }): Promise<CallToolResult> => {
    const snapshot = await sealDailySnapshot(radarId);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, snapshot }, null, 2) }] };
  },
);

server.registerTool(
  "radar_get_audit_log",
  {
    description: "Get audit events for a radar",
    inputSchema: { radarId: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ radarId }): Promise<CallToolResult> => {
    const events = await store.listAuditEvents(radarId);
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
  },
);

const mcpRouter = createMcpHttpRouter({
  createServer: () => server,
});

const maybeAdminBypass: RequestHandler = (req, res, next) => {
  if (toBool(ENV.ALLOW_UNAUTH_LOCAL, false) && isLoopbackRequest(req)) {
    next();
    return;
  }
  requireAdminKey(req, res, next);
};

app.post("/mcp", maybeAdminBypass, async (req, res) => {
  await mcpRouter.handlePost(req, res);
});

app.get("/mcp", maybeAdminBypass, async (req, res) => {
  await mcpRouter.handleSession(req, res);
});

app.delete("/mcp", maybeAdminBypass, async (req, res) => {
  await mcpRouter.handleSession(req, res);
});

async function main(): Promise<void> {
  if (usePostgres) {
    await initSchema();
    store = new PostgresRadarStore();
    console.log("[threat-radar-mcp] postgres storage initialized");
  } else {
    store = new InMemoryRadarStore();
    console.log("[threat-radar-mcp] in-memory storage (no DATABASE_URL)");
  }
  app.listen(ENV.PORT, "0.0.0.0", () => {
    console.log(`[threat-radar-mcp] listening on ${ENV.PORT}`);
  });
}

main().catch((err) => {
  console.error("[threat-radar-mcp] fatal:", err);
  process.exit(1);
});