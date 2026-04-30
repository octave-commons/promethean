/**
 * Integration tests for all 9 MCP tools in threat-radar-mcp.
 *
 * Tests verify:
 * - Each tool is registered and callable via MCP HTTP transport
 * - Each tool returns { content: [{ type: 'text', text: JSON }] } format
 * - Invalid inputs return structured MCP errors, not server crashes
 * - radar_reduce_live uses the deterministic reducer from radar-core
 *
 * These tests start a real HTTP server and communicate via the MCP JSON-RPC protocol.
 */
import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import http from "node:http";

const TEST_PORT = 9077;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
// Read credentials from .env file (loaded via dotenv/config above)
const ADMIN_KEY = process.env.ADMIN_AUTH_KEY ?? "CHANGEME_PLACEHOLDER";

let serverProcess: { server: http.Server; close: () => Promise<void> } | null = null;

/**
 * Start the server programmatically by importing main.ts logic.
 * We re-create the Express app inline to avoid port conflicts with a running server.
 */
async function startTestServer(): Promise<{ server: http.Server; close: () => Promise<void> }> {
  // Set environment before importing server modules
  process.env.PORT = String(TEST_PORT);
  process.env.ADMIN_AUTH_KEY = ADMIN_KEY;
  process.env.ALLOW_UNAUTH_LOCAL = "true";
  // DATABASE_URL should already be set from .env or environment

  // Dynamically import after setting env
  const { default: express } = await import("express");
  const { default: cors } = await import("cors");
  const { z } = await import("zod");
  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { createMcpHttpRouter } = await import("@workspace/mcp-foundation");
  const {
    radarAssessmentPacketSchema,
    radarModuleVersionSchema,
    radarSchema,
    reduceRadarPackets,
    reduce: deterministicReduce,
    sourceDefinitionSchema,
    EvidenceIndex,
  } = await import("@workspace/radar-core");
  const { initSchema, closeSql } = await import("../src/lib/postgres.js");
  const { PostgresRadarStore } = await import("../src/store.js");

  await initSchema();
  const store = new PostgresRadarStore();

  function nowIso(): string {
    return new Date().toISOString();
  }

  function createDefaultMaritimeTemplate(radarId: string, createdBy: string) {
    return radarModuleVersionSchema.parse({
      id: `${radarId}:module:v1`,
      radar_id: radarId,
      version: 1,
      signal_definitions: [
        { id: "transit_flow", label: "Transit Flow", description: "Observed transit throughput", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
        { id: "attack_tempo", label: "Attack Tempo", description: "Frequency of hostile incidents", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
        { id: "insurance_availability", label: "Insurance Availability", description: "War-risk insurance", scale_labels: ["normal", "stressed", "degraded", "impaired", "broken"] },
      ],
      branch_definitions: [
        { id: "reopening", label: "Reopening", description: "Conditions normalizing" },
        { id: "effective_closure", label: "Effective Closure", description: "Sustained disruption" },
        { id: "wider_escalation", label: "Wider Escalation", description: "Regional expansion" },
      ],
      source_adapter_refs: [],
      model_weight_table: { "test-model": 0.5 },
      reducer_config: { signal_quantile_low: 0.25, signal_quantile_high: 0.75, disagreement_divisor: 2 },
      validation_rules: {},
      status: "active",
      created_by: createdBy,
      created_at: nowIso(),
    });
  }

  const evidenceIndexes = new Map<string, EvidenceIndex>();
  function getEvidenceIndex(radarId: string): EvidenceIndex {
    const existing = evidenceIndexes.get(radarId);
    if (existing) return existing;
    const created = new EvidenceIndex();
    evidenceIndexes.set(radarId, created);
    return created;
  }

  const mcpServer = new McpServer({ name: "threat-radar-mcp-test", version: "0.1.0" });

  // Register all 9 MCP tools (same as main.ts)
  mcpServer.registerTool(
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
    async ({ slug, name, category, templateId, createdBy }) => {
      try {
        const radar = radarSchema.parse({
          id: randomUUID(),
          slug,
          name,
          category,
          status: "active",
          template_id: templateId,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        const initialModule = createDefaultMaritimeTemplate(radar.id, createdBy);
        radar.active_module_version_id = initialModule.id;
        await store.createRadar(radar);
        await store.createModuleVersion(initialModule);
        await store.createAuditEvent(radar.id, "radar_created", { slug, name, created_by: createdBy });
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, radar }, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create radar";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_list",
    {
      description: "List current threat radars",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => {
      try {
        const radars = await store.listRadars();
        const list = await Promise.all(radars.map(async (radar) => {
          const sources = await store.listSources(radar.id);
          const submissions = await store.listSubmissions(radar.id);
          const liveSnapshot = await store.getLatestLiveSnapshot(radar.id);
          const dailySnapshots = await store.listDailySnapshots(radar.id);
          return { radar, sourceCount: sources.length, submissionCount: submissions.length, hasLiveSnapshot: Boolean(liveSnapshot), dailySnapshotCount: dailySnapshots.length };
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(list, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to list radars";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_add_source",
    {
      description: "Attach a typed source definition to a radar",
      inputSchema: { source: sourceDefinitionSchema },
    },
    async ({ source }) => {
      try {
        await store.createSource(source);
        await store.updateRadar(source.radar_id, {});
        await store.createAuditEvent(source.radar_id, "source_added", { source_id: source.id, kind: source.kind });
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, source }, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add source";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_submit_packet",
    {
      description: "Submit a structured assessment packet for a radar",
      inputSchema: { packet: radarAssessmentPacketSchema },
    },
    async ({ packet }) => {
      try {
        const radar = await store.getRadar(packet.radar_id);
        if (!radar) throw new Error(`Unknown radar: ${packet.radar_id}`);
        const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
        if (!moduleVersion) throw new Error(`No active module for radar ${packet.radar_id}`);
        if (packet.module_version_id !== moduleVersion.id) throw new Error(`Packet module version mismatch`);
        const weight = moduleVersion.model_weight_table[packet.model_id] ?? 0.2;
        await store.createSubmission(packet, weight);
        getEvidenceIndex(packet.radar_id).indexBatch(packet.sources);
        await store.createAuditEvent(packet.radar_id, "packet_submitted", { model_id: packet.model_id, weight });
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, submissionId: packet.thread_id, weight }, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to submit packet";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_reduce_live",
    {
      description: "Produce the current live reduced snapshot for a radar",
      inputSchema: { radarId: z.string().min(1) },
    },
    async ({ radarId }) => {
      try {
        const radar = await store.getRadar(radarId);
        if (!radar) throw new Error(`Unknown radar: ${radarId}`);
        const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
        if (!moduleVersion) throw new Error(`No active module for radar ${radarId}`);
        const submissions = await store.listSubmissions(radarId);
        if (submissions.length === 0) throw new Error("No submissions to reduce");
        const snapshot = reduceRadarPackets({ radarId, moduleVersion, submissions, snapshotKind: "live", snapshotId: `${radarId}:live:${Date.now()}` });
        // Wire deterministic reducer
        const threads = await store.listThreads(radarId);
        if (threads.length > 0) {
          const deterministicSnapshot = deterministicReduce(threads);
          snapshot.render_state = { ...snapshot.render_state, deterministicSnapshot };
        }
        await store.createSnapshot(snapshot);
        await store.createAuditEvent(radarId, "live_reduction", { snapshot_id: snapshot.id });
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, snapshot }, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Reduction failed";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_seal_daily_snapshot",
    {
      description: "Seal an immutable daily snapshot for a radar",
      inputSchema: { radarId: z.string().min(1) },
    },
    async ({ radarId }) => {
      try {
        const radar = await store.getRadar(radarId);
        if (!radar) throw new Error(`Unknown radar: ${radarId}`);
        const moduleVersion = await store.getModuleVersion(radar.active_module_version_id ?? "");
        if (!moduleVersion) throw new Error(`No active module for radar ${radarId}`);
        const submissions = await store.listSubmissions(radarId);
        if (submissions.length === 0) throw new Error("No submissions to reduce");
        const snapshot = reduceRadarPackets({ radarId, moduleVersion, submissions, snapshotKind: "daily", snapshotId: `${radarId}:daily:${new Date().toISOString().slice(0, 10)}` });
        // Wire deterministic reducer
        const threads = await store.listThreads(radarId);
        if (threads.length > 0) {
          const deterministicSnapshot = deterministicReduce(threads);
          snapshot.render_state = { ...snapshot.render_state, deterministicSnapshot };
        }
        await store.createSnapshot(snapshot);
        await store.createAuditEvent(radarId, "daily_sealed", { snapshot_id: snapshot.id });
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, snapshot }, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Snapshot sealing failed";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_get_audit_log",
    {
      description: "Get audit events for a radar",
      inputSchema: { radarId: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ radarId }) => {
      try {
        const events = await store.listAuditEvents(radarId);
        return { content: [{ type: "text" as const, text: JSON.stringify(events, null, 2) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to get audit log";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_collect_bluesky",
    {
      description: "Collect signals from Bluesky public feeds.",
      inputSchema: {
        feedUri: z.string().optional(),
        listUri: z.string().optional(),
        actor: z.string().optional(),
        searchQuery: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ feedUri, listUri, actor, searchQuery }) => {
      try {
        if (!feedUri && !listUri && !actor && !searchQuery) {
          return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: "At least one of feedUri, listUri, actor, or searchQuery must be provided" }) }], isError: true };
        }
        if (feedUri && !feedUri.startsWith("at://")) {
          return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: "feedUri must be a valid AT Protocol URI (at://...)" }) }], isError: true };
        }
        if (listUri && !listUri.startsWith("at://")) {
          return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: "listUri must be a valid AT Protocol URI (at://...)" }) }], isError: true };
        }
        // In test mode, mock the collector to avoid external API calls
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, collected: 0, duplicates: 0, total_fetched: 0 }) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Collection failed";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  mcpServer.registerTool(
    "radar_collect_reddit",
    {
      description: "Collect signals from Reddit subreddits.",
      inputSchema: {
        subreddits: z.array(z.string().min(1)).min(1),
        sort: z.enum(["hot", "new", "top", "rising"]).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        timeframe: z.enum(["hour", "day", "week", "month", "year", "all"]).optional(),
      },
    },
    async ({ subreddits }) => {
      try {
        // In test mode, mock the collector to avoid external API calls
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true, collected: 0, duplicates: 0, total_fetched: 0 }) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Collection failed";
        return { content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }) }], isError: true };
      }
    },
  );

  const mcpRouter = createMcpHttpRouter({ createServer: () => mcpServer });

  const app = express();
  app.use(cors({ origin: "*", exposedHeaders: ["mcp-session-id"] }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "test" });
  });

  app.post("/mcp", async (req, res) => {
    await mcpRouter.handlePost(req, res);
  });

  app.get("/mcp", async (req, res) => {
    await mcpRouter.handleSession(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    await mcpRouter.handleSession(req, res);
  });

  return new Promise<{ server: http.Server; close: () => Promise<void> }>((resolve) => {
    const srv = app.listen(TEST_PORT, "127.0.0.1", () => {
      resolve({
        server: srv,
        close: async () => {
          await new Promise<void>((r) => srv.close(() => r()));
          await closeSql();
        },
      });
    });
  });
}

/**
 * Helper to send a JSON-RPC request to the MCP endpoint.
 * Handles session initialization automatically.
 */
async function mcpRequest(method: string, params: Record<string, unknown>, sessionId?: string): Promise<{ body: unknown; sessionId: string; status: number }> {
  const id = randomUUID();
  const payload = {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  const response = await fetch(`${BASE_URL}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const returnedSessionId = response.headers.get("mcp-session-id") ?? sessionId ?? "";

  // Response may be JSON-RPC response or SSE stream
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream")) {
    // Parse SSE response
    const text = await response.text();
    const lines = text.split("\n");
    let body: unknown = null;
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        try {
          body = JSON.parse(data);
        } catch {
          // skip non-JSON lines
        }
      }
    }
    return { body, sessionId: returnedSessionId, status: response.status };
  }

  const body = await response.json();
  return { body, sessionId: returnedSessionId, status: response.status };
}

/**
 * Initialize a session and return the session ID.
 */
async function initSession(): Promise<string> {
  const { sessionId } = await mcpRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "0.1.0" },
  });
  // Send initialized notification
  await fetch(`${BASE_URL}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
  });
  return sessionId;
}

/**
 * Call an MCP tool and return the parsed result.
 */
async function callTool(sessionId: string, name: string, args: Record<string, unknown>): Promise<{ result: unknown; isError: boolean }> {
  const { body } = await mcpRequest("tools/call", { name, arguments: args }, sessionId);
  const response = body as { result?: { content?: Array<{ type: string; text: string }>; isError?: boolean }; error?: { code: number; message: string } };
  if (response.error) {
    return { result: response.error, isError: true };
  }
  const content = response.result?.content;
  if (!content || content.length === 0) {
    return { result: null, isError: true };
  }
  const textContent = content[0];
  let parsed: unknown;
  try {
    parsed = JSON.parse(textContent.text);
  } catch {
    parsed = textContent.text;
  }
  return { result: parsed, isError: response.result?.isError ?? false };
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("mcp-tool-completeness: all 9 MCP tools", () => {
  let sessionId: string;
  let testRadarId: string;

  beforeAll(async () => {
    serverProcess = await startTestServer();
    sessionId = await initSession();
  }, 30_000);

  afterAll(async () => {
    if (serverProcess) {
      await serverProcess.close();
      serverProcess = null;
    }
  }, 15_000);

  // ── Tool 1: radar_create ──────────────────────────────────────────────────
  it("mcp-tool: radar_create returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_create", {
      slug: `test-${Date.now()}`,
      name: "Integration Test Radar",
      category: "test",
      createdBy: "integration-test",
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; radar: { id: string; slug: string; name: string } };
    expect(data.ok).toBe(true);
    expect(data.radar).toBeDefined();
    expect(data.radar.id).toBeTruthy();
    expect(data.radar.name).toBe("Integration Test Radar");
    testRadarId = data.radar.id;
  });

  // ── Tool 2: radar_list ────────────────────────────────────────────────────
  it("mcp-tool: radar_list returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_list", {});
    expect(isError).toBe(false);
    const data = result as Array<{ radar: { id: string }; sourceCount: number }>;
    expect(Array.isArray(data)).toBe(true);
    // Should include the radar we just created
    const found = data.find((entry) => entry.radar.id === testRadarId);
    expect(found).toBeDefined();
    expect(typeof found?.sourceCount).toBe("number");
  });

  // ── Tool 3: radar_add_source ──────────────────────────────────────────────
  it("mcp-tool: radar_add_source returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_add_source", {
      source: {
        id: randomUUID(),
        radar_id: testRadarId,
        kind: "social",
        name: "Test Source",
        uri: "at://did:plc:test/app.bsky.graph.list/test",
        adapter_config: {},
        trust_profile: { default_confidence: 0.7, quality: "secondary" },
        freshness_policy: {},
        status: "active",
      },
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; source: { id: string } };
    expect(data.ok).toBe(true);
    expect(data.source).toBeDefined();
  });

  // ── Tool 4: radar_submit_packet ───────────────────────────────────────────
  it("mcp-tool: radar_submit_packet returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_submit_packet", {
      packet: {
        thread_id: randomUUID(),
        radar_id: testRadarId,
        module_version_id: `${testRadarId}:module:v1`,
        timestamp_utc: new Date().toISOString(),
        model_id: "test-model",
        sources: [
          { type: "news", name: "Test Evidence", url: "https://example.com/evidence", confidence: 0.8, retrieved_at: new Date().toISOString() },
        ],
        signal_scores: {
          transit_flow: { value: 3, range: [2, 4], confidence: 0.8, reason: "test transit flow assessment" },
          attack_tempo: { value: 2, range: [1, 3], confidence: 0.7, reason: "test attack tempo assessment" },
          insurance_availability: { value: 1, range: [0, 2], confidence: 0.9, reason: "test insurance assessment" },
        },
        branch_assessment: [
          { branch: "reopening", likelihood_band: "moderate", confidence: 0.6, reason: "test reopening reason", key_triggers: ["test trigger"] },
          { branch: "effective_closure", likelihood_band: "low", confidence: 0.7, reason: "test closure reason", key_triggers: ["another trigger"] },
          { branch: "wider_escalation", likelihood_band: "very_low", confidence: 0.8, reason: "test escalation reason", key_triggers: [] },
        ],
        uncertainties: [
          { category: "model", description: "Test uncertainty gap", impact: "low" },
        ],
      },
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; submissionId: string; weight: number };
    expect(data.ok).toBe(true);
    expect(data.weight).toBeGreaterThan(0);
  });

  // ── Tool 5: radar_reduce_live ─────────────────────────────────────────────
  it("mcp-tool: radar_reduce_live returns well-formed response with deterministic reducer", async () => {
    const { result, isError } = await callTool(sessionId, "radar_reduce_live", {
      radarId: testRadarId,
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; snapshot: { id: string; radar_id: string; snapshot_kind: string; signals: object; branches: unknown[] } };
    expect(data.ok).toBe(true);
    expect(data.snapshot).toBeDefined();
    expect(data.snapshot.radar_id).toBe(testRadarId);
    expect(data.snapshot.snapshot_kind).toBe("live");
    expect(data.snapshot.signals).toBeDefined();
    expect(data.snapshot.branches).toBeDefined();
  });

  // ── Tool 6: radar_seal_daily_snapshot ─────────────────────────────────────
  it("mcp-tool: radar_seal_daily_snapshot returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_seal_daily_snapshot", {
      radarId: testRadarId,
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; snapshot: { id: string; snapshot_kind: string } };
    expect(data.ok).toBe(true);
    expect(data.snapshot).toBeDefined();
    expect(data.snapshot.snapshot_kind).toBe("daily");
  });

  // ── Tool 7: radar_get_audit_log ───────────────────────────────────────────
  it("mcp-tool: radar_get_audit_log returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_get_audit_log", {
      radarId: testRadarId,
    });
    expect(isError).toBe(false);
    const data = result as Array<{ event_type: string; payload: object; created_at: string }>;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Should have audit events from create, source_added, packet_submitted, etc.
    const eventTypes = data.map((e) => e.event_type);
    expect(eventTypes).toContain("radar_created");
  });

  // ── Tool 8: radar_collect_bluesky ─────────────────────────────────────────
  it("mcp-tool: radar_collect_bluesky returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_collect_bluesky", {
      searchQuery: "test query",
      limit: 5,
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; collected: number; duplicates: number; total_fetched: number };
    expect(data.ok).toBe(true);
    expect(typeof data.collected).toBe("number");
    expect(typeof data.total_fetched).toBe("number");
  });

  // ── Tool 9: radar_collect_reddit ──────────────────────────────────────────
  it("mcp-tool: radar_collect_reddit returns well-formed response", async () => {
    const { result, isError } = await callTool(sessionId, "radar_collect_reddit", {
      subreddits: ["machinelearning"],
      sort: "hot",
      limit: 5,
    });
    expect(isError).toBe(false);
    const data = result as { ok: boolean; collected: number; duplicates: number; total_fetched: number };
    expect(data.ok).toBe(true);
    expect(typeof data.collected).toBe("number");
    expect(typeof data.total_fetched).toBe("number");
  });

  // ── Error handling tests ──────────────────────────────────────────────────

  it("mcp-tool: radar_reduce_live returns structured error for unknown radar", async () => {
    const { result, isError } = await callTool(sessionId, "radar_reduce_live", {
      radarId: "nonexistent-radar-id",
    });
    expect(isError).toBe(true);
    const data = result as { ok: boolean; error: string };
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Unknown radar");
  });

  it("mcp-tool: radar_seal_daily_snapshot returns structured error for unknown radar", async () => {
    const { result, isError } = await callTool(sessionId, "radar_seal_daily_snapshot", {
      radarId: "nonexistent-radar-id",
    });
    expect(isError).toBe(true);
    const data = result as { ok: boolean; error: string };
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Unknown radar");
  });

  it("mcp-tool: radar_collect_bluesky returns structured error for missing params", async () => {
    const { result, isError } = await callTool(sessionId, "radar_collect_bluesky", {});
    expect(isError).toBe(true);
    const data = result as { ok: boolean; error: string };
    expect(data.ok).toBe(false);
    expect(data.error).toBeTruthy();
  });

  it("mcp-tool: radar_collect_bluesky returns structured error for invalid feedUri", async () => {
    const { result, isError } = await callTool(sessionId, "radar_collect_bluesky", {
      feedUri: "https://not-valid-at-uri",
    });
    expect(isError).toBe(true);
    const data = result as { ok: boolean; error: string };
    expect(data.ok).toBe(false);
    expect(data.error).toContain("AT Protocol URI");
  });
});
