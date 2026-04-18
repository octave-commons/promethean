import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import postgres from "postgres";
import { PostgresRadarStore } from "../src/store.js";
import type { Radar, SignalEvent, Thread } from "@workspace/radar-core";

/**
 * Integration tests for the Postgres storage adapter.
 *
 * These tests run against a real Postgres database (threat_radar_test).
 * They exercise CRUD operations for radars, signals, and threads.
 */

/**
 * Connection URLs default to local Docker Postgres.
 * Override with TEST_DATABASE_URL and TEST_ADMIN_DATABASE_URL env vars.
 */
const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ??
  `postgres://${process.env.PGUSER ?? "openai_proxy"}:${process.env.PGPASSWORD ?? "openai_proxy"}@localhost:5432/threat_radar_test`;

const ADMIN_DB_URL =
  process.env.TEST_ADMIN_DATABASE_URL ??
  `postgres://${process.env.PGUSER ?? "openai_proxy"}:${process.env.PGPASSWORD ?? "openai_proxy"}@localhost:5432/openai_proxy`;

let adminSql: postgres.Sql;
let testSql: postgres.Sql;
let store: PostgresRadarStore;

// We need to mock getSql to return our test connection
// Since PostgresRadarStore uses getSql() internally, we'll set DATABASE_URL
// before importing and running initSchema

beforeAll(async () => {
  // Create test database if it doesn't exist
  adminSql = postgres(ADMIN_DB_URL, {
    max: 1,
    connect_timeout: 10,
  });

  try {
    await adminSql`CREATE DATABASE threat_radar_test`;
  } catch {
    // database might already exist
  }
  await adminSql.end();

  // Set DATABASE_URL for the store module
  process.env.DATABASE_URL = TEST_DB_URL;

  // Import and run schema init
  const { initSchema, closeSql } = await import("../src/lib/postgres.js");
  await initSchema();

  // Create a direct connection for cleanup
  testSql = postgres(TEST_DB_URL, { max: 2, connect_timeout: 10 });

  store = new PostgresRadarStore();
});

beforeEach(async () => {
  // Clean all tables before each test
  await testSql`DELETE FROM radar_audit_events`;
  await testSql`DELETE FROM radar_snapshots`;
  await testSql`DELETE FROM radar_packets`;
  await testSql`DELETE FROM radar_sources`;
  await testSql`DELETE FROM radar_module_versions`;
  await testSql`DELETE FROM threads`;
  await testSql`DELETE FROM signals`;
  await testSql`DELETE FROM radars`;
});

afterAll(async () => {
  await testSql.end();
  const { closeSql } = await import("../src/lib/postgres.js");
  await closeSql();
});

// --- Helpers ---

function makeRadar(overrides: Partial<Radar> = {}): Radar {
  const now = new Date().toISOString();
  return {
    id: `radar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug: "test-radar",
    name: "Test Radar",
    category: "geopolitical",
    status: "active",
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function makeSignal(overrides: Partial<SignalEvent> = {}): SignalEvent {
  const now = new Date().toISOString();
  return {
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    provenance: {
      source_type: "bluesky",
      retrieved_at: now,
      confidence_class: "commentary",
    },
    text: "Test signal content about geopolitical events",
    links: [],
    domain_tags: ["geopolitical"],
    observed_at: now,
    ingested_at: now,
    metadata: {},
    ...overrides,
  };
}

function makeThread(overrides: Partial<Thread> = {}): Thread {
  const now = new Date().toISOString();
  return {
    id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: "event",
    title: "Test Thread",
    members: [],
    source_distribution: {},
    confidence: 0.7,
    timeline: {
      first_seen: now,
      last_updated: now,
    },
    domain_tags: ["geopolitical"],
    status: "emerging",
    ...overrides,
  };
}

// --- Radar CRUD Tests ---

describe("storage: radar CRUD", () => {
  it("creates and retrieves a radar", async () => {
    const radar = makeRadar();
    await store.createRadar(radar);
    const fetched = await store.getRadar(radar.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(radar.id);
    expect(fetched!.slug).toBe("test-radar");
    expect(fetched!.name).toBe("Test Radar");
    expect(fetched!.category).toBe("geopolitical");
    expect(fetched!.status).toBe("active");
  });

  it("lists all radars", async () => {
    const r1 = makeRadar({ slug: "radar-a", name: "Radar A" });
    const r2 = makeRadar({ slug: "radar-b", name: "Radar B" });
    await store.createRadar(r1);
    await store.createRadar(r2);
    const list = await store.listRadars();
    expect(list.length).toBeGreaterThanOrEqual(2);
    const ids = list.map((r) => r.id);
    expect(ids).toContain(r1.id);
    expect(ids).toContain(r2.id);
  });

  it("updates a radar status", async () => {
    const radar = makeRadar();
    await store.createRadar(radar);
    await store.updateRadar(radar.id, { status: "paused" });
    const updated = await store.getRadar(radar.id);
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("paused");
  });

  it("returns null for non-existent radar", async () => {
    const fetched = await store.getRadar("nonexistent-id");
    expect(fetched).toBeNull();
  });
});

// --- Signal CRUD Tests ---

describe("storage: signal CRUD", () => {
  it("creates and retrieves a signal", async () => {
    const signal = makeSignal();
    await store.createSignal(signal);
    const fetched = await store.getSignal(signal.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(signal.id);
    expect(fetched!.text).toBe(signal.text);
    expect(fetched!.provenance.source_type).toBe("bluesky");
  });

  it("lists signals with optional radar filter", async () => {
    const s1 = makeSignal({ radar_id: "radar-1" });
    const s2 = makeSignal({ radar_id: "radar-1" });
    const s3 = makeSignal({ radar_id: "radar-2" });
    await store.createSignal(s1);
    await store.createSignal(s2);
    await store.createSignal(s3);

    const allSignals = await store.listSignals();
    expect(allSignals.length).toBeGreaterThanOrEqual(3);

    const radarSignals = await store.listSignals("radar-1");
    expect(radarSignals.length).toBe(2);
    expect(radarSignals.every((s) => s.radar_id === "radar-1")).toBe(true);
  });

  it("finds signal by content hash (dedup support)", async () => {
    const signal = makeSignal({ content_hash: "sha256:abc123" });
    await store.createSignal(signal);
    const found = await store.findSignalByContentHash("sha256:abc123");
    expect(found).not.toBeNull();
    expect(found!.id).toBe(signal.id);
  });

  it("returns null for non-existent content hash", async () => {
    const found = await store.findSignalByContentHash("sha256:nonexistent");
    expect(found).toBeNull();
  });

  it("handles duplicate signal insert gracefully (ON CONFLICT DO NOTHING)", async () => {
    const signal = makeSignal();
    await store.createSignal(signal);
    // Insert same signal again — should not throw
    await store.createSignal(signal);
    const list = await store.listSignals();
    const matching = list.filter((s) => s.id === signal.id);
    expect(matching.length).toBe(1);
  });

  it("returns null for non-existent signal", async () => {
    const fetched = await store.getSignal("nonexistent-id");
    expect(fetched).toBeNull();
  });
});

// --- Thread CRUD Tests ---

describe("storage: thread CRUD", () => {
  it("creates and retrieves a thread", async () => {
    const thread = makeThread();
    await store.createThread(thread);
    const fetched = await store.getThread(thread.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(thread.id);
    expect(fetched!.title).toBe("Test Thread");
    expect(fetched!.kind).toBe("event");
    expect(fetched!.confidence).toBe(0.7);
    expect(fetched!.status).toBe("emerging");
  });

  it("lists threads with optional radar filter", async () => {
    const t1 = makeThread({ radar_id: "radar-x" });
    const t2 = makeThread({ radar_id: "radar-x" });
    const t3 = makeThread({ radar_id: "radar-y" });
    await store.createThread(t1);
    await store.createThread(t2);
    await store.createThread(t3);

    const allThreads = await store.listThreads();
    expect(allThreads.length).toBeGreaterThanOrEqual(3);

    const radarThreads = await store.listThreads("radar-x");
    expect(radarThreads.length).toBe(2);
    expect(radarThreads.every((t) => t.radar_id === "radar-x")).toBe(true);
  });

  it("updates thread fields", async () => {
    const thread = makeThread();
    await store.createThread(thread);
    await store.updateThread(thread.id, {
      title: "Updated Thread Title",
      status: "active",
      confidence: 0.9,
    });
    const updated = await store.getThread(thread.id);
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("Updated Thread Title");
    expect(updated!.status).toBe("active");
    expect(updated!.confidence).toBe(0.9);
  });

  it("returns null for non-existent thread", async () => {
    const fetched = await store.getThread("nonexistent-id");
    expect(fetched).toBeNull();
  });
});
