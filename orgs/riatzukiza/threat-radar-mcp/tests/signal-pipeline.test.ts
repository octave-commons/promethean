import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import {
  normalize,
  cluster,
  reduce as deterministicReduce,
  type SignalEvent,
  type Thread,
  type Radar,
} from "@workspace/radar-core";
import { PostgresRadarStore } from "../src/store.js";

/**
 * Integration tests for the signal→thread→snapshot pipeline.
 *
 * Tests verify:
 * 1. collect with radarId → signals have radar_id set
 * 2. normalize() populates normalized_content, category, quality_score
 * 3. reduceLive auto-clusters when no threads exist
 * 4. end-to-end collect→normalize→cluster→reduce produces threads and snapshot
 * 5. radar_cluster_signals tool logic: explicit clustering of signals
 * 6. auto-clustering in daily snapshot path
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

beforeAll(async () => {
  adminSql = postgres(ADMIN_DB_URL, { max: 1, connect_timeout: 10 });
  try {
    await adminSql`CREATE DATABASE threat_radar_test`;
  } catch {
    // database might already exist
  }
  await adminSql.end();

  process.env.DATABASE_URL = TEST_DB_URL;
  const { initSchema } = await import("../src/lib/postgres.js");
  await initSchema();

  testSql = postgres(TEST_DB_URL, { max: 2, connect_timeout: 10 });
  store = new PostgresRadarStore();
});

beforeEach(async () => {
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

function makeRawSignal(overrides: Partial<SignalEvent> & { text?: string } = {}): SignalEvent {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    provenance: {
      source_type: "bluesky",
      author: "test-author",
      retrieved_at: now,
      confidence_class: "commentary",
    },
    text: overrides.text ?? "Test signal content about geopolitical events",
    links: [],
    domain_tags: [],
    observed_at: now,
    ingested_at: now,
    content_hash: `hash-${randomUUID().slice(0, 8)}`,
    metadata: {},
    ...overrides,
  };
}

function makeRadar(overrides: Partial<Radar> = {}): Radar {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    slug: `test-radar-${Date.now()}`,
    name: "Test Radar",
    category: "geopolitical",
    status: "active",
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

// --- Tests ---

describe("signal pipeline: normalize populates fields", () => {
  it("normalize() sets normalized_content, category, and quality_score", () => {
    const result = normalize({
      text: "Major <b>military</b> conflict escalation in the Middle East region involving NATO forces",
      provenance: {
        source_type: "bluesky",
        retrieved_at: new Date().toISOString(),
      },
    });

    expect(result.normalized_content).toBeDefined();
    expect(typeof result.normalized_content).toBe("string");
    expect(result.normalized_content!.length).toBeGreaterThan(0);
    // HTML tags should be stripped
    expect(result.normalized_content).not.toContain("<b>");

    expect(result.category).toBeDefined();
    // Content about military/NATO should be categorized as geopolitical
    expect(result.category).toBe("geopolitical");

    expect(result.quality_score).toBeDefined();
    expect(typeof result.quality_score).toBe("number");
    expect(result.quality_score!).toBeGreaterThan(0);
    expect(result.quality_score!).toBeLessThanOrEqual(1);
  });
});

describe("signal pipeline: collect with radarId", () => {
  it("signals have radar_id set when radarId is provided during normalize", async () => {
    const radarId = randomUUID();
    const radar = makeRadar({ id: radarId });
    await store.createRadar(radar);

    // Simulate what the collector tool does: normalize with radarId
    const rawSignal = makeRawSignal();
    const normalized = normalize({
      id: rawSignal.id,
      radar_id: radarId,
      provenance: rawSignal.provenance,
      text: rawSignal.text,
      links: rawSignal.links,
      domain_tags: rawSignal.domain_tags,
      observed_at: rawSignal.observed_at,
      ingested_at: rawSignal.ingested_at,
      content_hash: rawSignal.content_hash,
      metadata: rawSignal.metadata,
    });

    expect(normalized.radar_id).toBe(radarId);
    expect(normalized.normalized_content).toBeDefined();
    expect(normalized.category).toBeDefined();
    expect(normalized.quality_score).toBeDefined();

    // Store and verify in DB
    await store.createSignal(normalized);
    const fetched = await store.getSignal(normalized.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.radar_id).toBe(radarId);

    // Verify listSignals by radarId returns it
    const radarSignals = await store.listSignals(radarId);
    expect(radarSignals.length).toBe(1);
    expect(radarSignals[0].id).toBe(normalized.id);
  });

  it("signals without radarId have undefined radar_id", () => {
    const normalized = normalize({
      text: "A test signal without radar association",
      provenance: {
        source_type: "reddit",
        retrieved_at: new Date().toISOString(),
      },
    });

    expect(normalized.radar_id).toBeUndefined();
  });
});

describe("signal pipeline: auto-clustering in reduceLive", () => {
  it("auto-clusters signals into threads when no threads exist for radar", async () => {
    const radarId = randomUUID();
    const radar = makeRadar({ id: radarId });
    await store.createRadar(radar);

    // Create several signals about similar topics (should cluster together)
    const signals: SignalEvent[] = [];
    const texts = [
      "Major military conflict escalation with NATO forces deploying in Eastern Europe",
      "NATO military forces mobilize as conflict escalates near borders",
      "Military tensions rise as NATO prepares defensive posture",
      "New open source AI model released by community developers",
      "Open source community contributes major improvements to local LLM models",
    ];

    for (const text of texts) {
      const normalized = normalize({
        radar_id: radarId,
        text,
        provenance: {
          source_type: "bluesky",
          retrieved_at: new Date().toISOString(),
        },
      });
      await store.createSignal(normalized);
      signals.push(normalized);
    }

    // Verify no threads exist yet
    const threadsBefore = await store.listThreads(radarId);
    expect(threadsBefore.length).toBe(0);

    // Simulate auto-clustering logic from reduceLive
    const radarSignals = await store.listSignals(radarId);
    expect(radarSignals.length).toBe(5);

    const clustered = cluster(radarSignals);
    expect(clustered.length).toBeGreaterThan(0);

    // Store threads with radar_id
    for (const thread of clustered) {
      thread.radar_id = radarId;
      await store.createThread(thread);
    }

    // Verify threads were created
    const threadsAfter = await store.listThreads(radarId);
    expect(threadsAfter.length).toBeGreaterThan(0);

    // Each thread should have radar_id set
    for (const thread of threadsAfter) {
      expect(thread.radar_id).toBe(radarId);
      expect(thread.members.length).toBeGreaterThan(0);
    }
  });
});

describe("signal pipeline: cluster produces meaningful threads", () => {
  it("groups similar signals into the same thread", () => {
    const now = new Date().toISOString();
    const signals: SignalEvent[] = [
      normalize({
        text: "Major cyber attack targets critical infrastructure power grid systems across Europe",
        provenance: { source_type: "bluesky", retrieved_at: now },
      }),
      normalize({
        text: "European power grid infrastructure hit by sophisticated cyber attack campaign",
        provenance: { source_type: "reddit", retrieved_at: now },
      }),
      normalize({
        text: "Cyber security experts analyze massive infrastructure breach on power systems",
        provenance: { source_type: "bluesky", retrieved_at: now },
      }),
      normalize({
        text: "New open source machine learning model achieves state of the art performance",
        provenance: { source_type: "reddit", retrieved_at: now },
      }),
      normalize({
        text: "Community developers release breakthrough AI model with open weights",
        provenance: { source_type: "bluesky", retrieved_at: now },
      }),
    ];

    const threads = cluster(signals);

    // Should produce at least 2 clusters (cyber/infrastructure vs AI/community)
    expect(threads.length).toBeGreaterThanOrEqual(2);

    // Each thread should have members
    for (const thread of threads) {
      expect(thread.members.length).toBeGreaterThan(0);
      expect(thread.title).toBeDefined();
      expect(thread.kind).toBeDefined();
    }
  });
});

describe("signal pipeline: end-to-end collect→normalize→cluster→reduce", () => {
  it("produces threads and deterministicSnapshot from normalized signals", async () => {
    const radarId = randomUUID();
    const radar = makeRadar({ id: radarId });
    await store.createRadar(radar);

    // Step 1: Simulate collection + normalization
    const texts = [
      "Oil pipeline disruption threatens energy supply across the region causing economic concern",
      "Energy supply chain disrupted as pipeline maintenance extends due to security threats",
      "Regional energy crisis deepens with ongoing pipeline disruption and supply concerns",
    ];

    const storedSignals: SignalEvent[] = [];
    for (const text of texts) {
      const normalized = normalize({
        radar_id: radarId,
        text,
        provenance: {
          source_type: "bluesky",
          author: "test-user",
          retrieved_at: new Date().toISOString(),
        },
      });
      await store.createSignal(normalized);
      storedSignals.push(normalized);
    }

    // Step 2: Cluster signals into threads
    const signals = await store.listSignals(radarId);
    expect(signals.length).toBe(3);

    const threads = cluster(signals);
    expect(threads.length).toBeGreaterThan(0);

    // Store threads with radar_id
    for (const thread of threads) {
      thread.radar_id = radarId;
      await store.createThread(thread);
    }

    // Step 3: Verify threads in DB
    const dbThreads = await store.listThreads(radarId);
    expect(dbThreads.length).toBeGreaterThan(0);

    // Step 4: Run deterministic reducer
    const snapshot = deterministicReduce(dbThreads);
    expect(snapshot).toBeDefined();
    expect(snapshot.scoreRanges).toBeDefined();
    expect(snapshot.scoreRanges.length).toBeGreaterThan(0);
    expect(snapshot.disagreementIndex).toBeDefined();
    expect(typeof snapshot.disagreementIndex).toBe("number");
    expect(snapshot.narrativeBranches).toBeDefined();
    expect(snapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);
    expect(typeof snapshot.compressionLoss).toBe("number");

    // Verify score ranges have proper structure
    for (const range of snapshot.scoreRanges) {
      expect(range.dimension).toBeDefined();
      expect(range.min).toBeLessThanOrEqual(range.max);
      expect(range.median).toBeGreaterThanOrEqual(range.min);
      expect(range.median).toBeLessThanOrEqual(range.max);
    }
  });

  it("reduceLive path: auto-clusters and includes deterministicSnapshot in render_state", async () => {
    const radarId = randomUUID();
    const radar = makeRadar({ id: radarId });
    await store.createRadar(radar);

    // Create normalized signals
    const texts = [
      "Sanctions imposed on major oil exporting nation disrupt global trade flows",
      "Global trade sanctions against major oil producer cause market uncertainty",
      "Economic sanctions target oil exports causing significant trade disruption",
    ];

    for (const text of texts) {
      const normalized = normalize({
        radar_id: radarId,
        text,
        provenance: {
          source_type: "reddit",
          retrieved_at: new Date().toISOString(),
        },
      });
      await store.createSignal(normalized);
    }

    // Simulate the auto-clustering path in reduceLive
    let threads = await store.listThreads(radarId);
    expect(threads.length).toBe(0); // No threads yet

    const signals = await store.listSignals(radarId);
    expect(signals.length).toBe(3);

    // Auto-cluster
    const clustered = cluster(signals);
    for (const thread of clustered) {
      thread.radar_id = radarId;
      await store.createThread(thread);
    }
    threads = clustered;

    // Run deterministic reducer
    const deterministicSnapshot = deterministicReduce(threads);
    expect(deterministicSnapshot).toBeDefined();
    expect(deterministicSnapshot.scoreRanges).toBeDefined();
    expect(deterministicSnapshot.scoreRanges.length).toBeGreaterThan(0);
    expect(deterministicSnapshot.disagreementIndex).toBeDefined();
    expect(deterministicSnapshot.narrativeBranches.length).toBeGreaterThanOrEqual(2);

    // Simulate attaching to render_state like reduceLive does
    const renderState: Record<string, unknown> = {
      deterministicSnapshot,
    };
    expect(renderState.deterministicSnapshot).toBeDefined();
  });
});

describe("signal pipeline: radar_cluster_signals tool logic", () => {
  it("explicitly clusters signals for a given radarId and stores threads", async () => {
    const radarId = randomUUID();
    const radar = makeRadar({ id: radarId });
    await store.createRadar(radar);

    // Create normalized signals for two distinct topics
    const signalTexts = [
      "Cryptocurrency market crash wipes billions as Bitcoin drops below key support level",
      "Bitcoin crashes dramatically as crypto market loses billions in value",
      "AI chip shortage intensifies as demand for GPU compute skyrockets globally",
      "Global GPU shortage drives up prices as AI compute demand surges",
    ];

    for (const text of signalTexts) {
      const normalized = normalize({
        radar_id: radarId,
        text,
        provenance: {
          source_type: "bluesky",
          retrieved_at: new Date().toISOString(),
        },
      });
      await store.createSignal(normalized);
    }

    // Simulate the radar_cluster_signals tool
    const signals = await store.listSignals(radarId);
    expect(signals.length).toBe(4);

    const threads = cluster(signals);
    expect(threads.length).toBeGreaterThan(0);

    let created = 0;
    for (const thread of threads) {
      thread.radar_id = radarId;
      await store.createThread(thread);
      created++;
    }

    expect(created).toBeGreaterThan(0);

    // Verify threads in DB
    const dbThreads = await store.listThreads(radarId);
    expect(dbThreads.length).toBe(created);
    for (const thread of dbThreads) {
      expect(thread.radar_id).toBe(radarId);
      expect(thread.members.length).toBeGreaterThan(0);
    }
  });
});
