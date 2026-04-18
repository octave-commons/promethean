import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignalAtprotoClient } from "../src/client.js";
import {
  toAtprotoSignalEvent,
  toAtprotoThread,
  toAtprotoSnapshot,
} from "../src/converters.js";
import type {
  SignalEvent,
  Thread,
  ReducedSnapshot,
} from "@workspace/radar-core";

const NOW = new Date().toISOString();

// --- Fixtures ---

const signalEvent: SignalEvent = {
  id: "sig-pub-001",
  provenance: {
    source_type: "bluesky",
    author: "alice.bsky.social",
    post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
    parent_uri: undefined,
    confidence_class: "firsthand",
    retrieved_at: NOW,
  },
  text: "Infrastructure disruption reported in northern corridor",
  title: "Northern Alert",
  links: ["https://example.com/report"],
  domain_tags: ["infrastructure", "energy"],
  observed_at: NOW,
  ingested_at: NOW,
  content_hash: "sha256:deadbeef",
  metadata: {},
};

const thread: Thread = {
  id: "thread-pub-001",
  radar_id: "radar-001",
  kind: "event",
  title: "Energy supply disruption thread",
  summary: "Multiple signals about energy supply chain issues",
  members: [
    { signal_event_id: "sig-001", relevance: 0.95, added_at: NOW },
    { signal_event_id: "sig-002", relevance: 0.8, added_at: NOW },
  ],
  source_distribution: { bluesky: 0.6, reddit: 0.4 },
  confidence: 0.82,
  timeline: {
    first_seen: NOW,
    last_updated: NOW,
    peak_activity: NOW,
  },
  domain_tags: ["energy", "infrastructure"],
  status: "active",
};

const snapshot: ReducedSnapshot = {
  id: "snap-pub-001",
  radar_id: "radar-001",
  module_version_id: "mv-001",
  snapshot_kind: "live",
  as_of_utc: NOW,
  signals: {
    geopolitical: {
      median: 2.5,
      range: [1, 4],
      agreement: 0.7,
      sample_size: 3,
      weighted_values: [
        { value: 2, weight: 0.5, model_id: "model-a" },
        { value: 3, weight: 0.5, model_id: "model-b" },
      ],
    },
    infrastructure: {
      median: 3.0,
      range: [2, 4],
      agreement: 0.6,
      sample_size: 2,
      weighted_values: [
        { value: 3, weight: 1.0, model_id: "model-a" },
      ],
    },
  },
  branches: [
    {
      name: "Escalation",
      support: "moderate",
      agreement: 0.6,
      sample_size: 2,
      triggers: ["military buildup", "supply shortage"],
    },
    {
      name: "De-escalation",
      support: "low",
      agreement: 0.4,
      sample_size: 2,
      triggers: ["diplomatic talks"],
    },
  ],
  model_count: 2,
  disagreement_index: 0.3,
  quality_score: 0.75,
  render_state: {},
};

// --- Mock helpers ---

function createMockAgent() {
  const records = new Map<string, { uri: string; collection: string; value: Record<string, unknown> }>();
  let rkey = 0;
  const did = "did:plc:test123";

  const mockLogin = vi.fn().mockResolvedValue({ data: { did } });

  const mockCreateRecord = vi.fn().mockImplementation(
    (params: { repo: string; collection: string; record: Record<string, unknown> }) => {
      rkey++;
      const uri = `at://${did}/${params.collection}/${rkey}`;
      records.set(uri, { uri, collection: params.collection, value: params.record });
      return Promise.resolve({ data: { uri, cid: `cid-${rkey}` } });
    },
  );

  const mockGetRecord = vi.fn().mockImplementation(
    (params: { repo: string; collection: string; rkey: string }) => {
      const uri = `at://${params.repo}/${params.collection}/${params.rkey}`;
      const stored = records.get(uri);
      if (!stored) {
        const err = new Error("Record not found");
        (err as Record<string, unknown>).status = 404;
        return Promise.reject(err);
      }
      return Promise.resolve({ data: { uri, value: stored.value } });
    },
  );

  const mockListRecords = vi.fn().mockImplementation(
    (params: { repo: string; collection: string; limit: number }) => {
      const matching = Array.from(records.values())
        .filter((r) => r.collection === params.collection)
        .slice(0, params.limit);
      return Promise.resolve({
        data: {
          records: matching.map((r) => ({ uri: r.uri, value: r.value })),
        },
      });
    },
  );

  const mockDeleteRecord = vi.fn().mockImplementation(
    (params: { repo: string; collection: string; rkey: string }) => {
      const uri = `at://${params.repo}/${params.collection}/${params.rkey}`;
      records.delete(uri);
      return Promise.resolve({});
    },
  );

  return {
    did,
    records,
    agent: {
      login: mockLogin,
      com: {
        atproto: {
          repo: {
            createRecord: mockCreateRecord,
            getRecord: mockGetRecord,
            listRecords: mockListRecords,
            deleteRecord: mockDeleteRecord,
          },
        },
      },
    },
    mocks: {
      login: mockLogin,
      createRecord: mockCreateRecord,
      getRecord: mockGetRecord,
      listRecords: mockListRecords,
      deleteRecord: mockDeleteRecord,
    },
  };
}

function createClient(mockAgent: ReturnType<typeof createMockAgent>): SignalAtprotoClient {
  const client = new SignalAtprotoClient({
    service: "https://bsky.social",
    identifier: "test.handle",
    password: "test-password",
  });

  // Replace the internal agent with our mock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).agent = mockAgent.agent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any)._did = mockAgent.did;

  return client;
}

// --- Tests ---

describe("AT Protocol Publishing", () => {
  let mockAgent: ReturnType<typeof createMockAgent>;
  let client: SignalAtprotoClient;

  beforeEach(() => {
    mockAgent = createMockAgent();
    client = createClient(mockAgent);
  });

  describe("publishSignalEvent + read-back", () => {
    it("publishes a SignalEvent and returns a valid AT URI", async () => {
      const uri = await client.publishSignalEvent(signalEvent);
      expect(uri).toMatch(/^at:\/\/did:plc:test123\/app\.openhax\.radar\.signalEvent\//);
      expect(mockAgent.mocks.createRecord).toHaveBeenCalledOnce();

      const callArgs = mockAgent.mocks.createRecord.mock.calls[0][0];
      expect(callArgs.collection).toBe("app.openhax.radar.signalEvent");
      expect(callArgs.record.$type).toBe("app.openhax.radar.signalEvent");
      expect(callArgs.record.text).toBe(signalEvent.text);
    });

    it("reads back a published SignalEvent with matching content", async () => {
      const uri = await client.publishSignalEvent(signalEvent);
      const readBack = await client.getRecord(uri);

      expect(readBack.uri).toBe(uri);

      const expected = toAtprotoSignalEvent(signalEvent);
      expect(readBack.value.$type).toBe(expected.$type);
      expect(readBack.value.text).toBe(expected.text);
      expect(readBack.value.title).toBe(expected.title);
      expect(readBack.value.provenanceSource).toBe(expected.provenanceSource);
      expect(readBack.value.provenanceAuthor).toBe(expected.provenanceAuthor);
      expect(readBack.value.domainTags).toEqual(expected.domainTags);
      expect(readBack.value.contentHash).toBe(expected.contentHash);
      expect(readBack.value.observedAt).toBe(expected.observedAt);
    });
  });

  describe("publishThread + read-back", () => {
    it("publishes a Thread and returns a valid AT URI", async () => {
      const uri = await client.publishThread(thread);
      expect(uri).toMatch(/^at:\/\/did:plc:test123\/app\.openhax\.radar\.thread\//);
      expect(mockAgent.mocks.createRecord).toHaveBeenCalledOnce();

      const callArgs = mockAgent.mocks.createRecord.mock.calls[0][0];
      expect(callArgs.collection).toBe("app.openhax.radar.thread");
      expect(callArgs.record.title).toBe(thread.title);
    });

    it("reads back a published Thread with matching content", async () => {
      const uri = await client.publishThread(thread);
      const readBack = await client.getRecord(uri);

      expect(readBack.uri).toBe(uri);

      const expected = toAtprotoThread(thread);
      expect(readBack.value.$type).toBe(expected.$type);
      expect(readBack.value.title).toBe(expected.title);
      expect(readBack.value.kind).toBe(expected.kind);
      expect(readBack.value.radarId).toBe(expected.radarId);
      expect(readBack.value.memberRefs).toEqual(expected.memberRefs);
      expect(readBack.value.sourceDistribution).toEqual(expected.sourceDistribution);
      expect(readBack.value.confidence).toBe(expected.confidence);
      expect(readBack.value.status).toBe(expected.status);
    });
  });

  describe("publishSnapshot + read-back", () => {
    it("publishes a Snapshot and returns a valid AT URI", async () => {
      const uri = await client.publishSnapshot(snapshot);
      expect(uri).toMatch(/^at:\/\/did:plc:test123\/app\.openhax\.radar\.snapshot\//);
      expect(mockAgent.mocks.createRecord).toHaveBeenCalledOnce();

      const callArgs = mockAgent.mocks.createRecord.mock.calls[0][0];
      expect(callArgs.collection).toBe("app.openhax.radar.snapshot");
      expect(callArgs.record.snapshotKind).toBe("live");
    });

    it("reads back a published Snapshot with matching content", async () => {
      const uri = await client.publishSnapshot(snapshot);
      const readBack = await client.getRecord(uri);

      expect(readBack.uri).toBe(uri);

      const expected = toAtprotoSnapshot(snapshot);
      expect(readBack.value.$type).toBe(expected.$type);
      expect(readBack.value.radarId).toBe(expected.radarId);
      expect(readBack.value.snapshotKind).toBe(expected.snapshotKind);
      expect(readBack.value.modelCount).toBe(expected.modelCount);
      expect(readBack.value.disagreementIndex).toBe(expected.disagreementIndex);
      expect(readBack.value.qualityScore).toBe(expected.qualityScore);

      // Verify signal ranges survived round-trip
      const signals = readBack.value.signals as Record<string, Record<string, unknown>>;
      expect(signals.geopolitical.median).toBe(2.5);
      expect(signals.geopolitical.rangeLow).toBe(1);
      expect(signals.geopolitical.rangeHigh).toBe(4);
      expect(signals.infrastructure.median).toBe(3.0);

      // Verify branches survived round-trip
      const branches = readBack.value.branches as Array<Record<string, unknown>>;
      expect(branches).toHaveLength(2);
      expect(branches[0].name).toBe("Escalation");
      expect(branches[1].name).toBe("De-escalation");
    });
  });

  describe("authentication error handling", () => {
    it("throws on login failure when credentials are invalid", async () => {
      const badClient = new SignalAtprotoClient({
        service: "https://bsky.social",
        identifier: "bad-handle",
        password: "wrong-password",
      });

      // Replace agent with one that rejects login
      const loginError = new Error("Invalid identifier or password");
      (loginError as Record<string, unknown>).status = 401;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (badClient as any).agent = {
        login: vi.fn().mockRejectedValue(loginError),
      };

      await expect(badClient.login()).rejects.toThrow("Invalid identifier or password");
    });

    it("throws when publishing without login (no DID set)", async () => {
      const unauthClient = new SignalAtprotoClient({
        service: "https://bsky.social",
        identifier: "test",
        password: "test",
      });

      // Mock agent that rejects createRecord due to auth
      const authError = new Error("Authentication Required");
      (authError as Record<string, unknown>).status = 401;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (unauthClient as any).agent = {
        com: {
          atproto: {
            repo: {
              createRecord: vi.fn().mockRejectedValue(authError),
            },
          },
        },
      };

      await expect(unauthClient.publishSignalEvent(signalEvent)).rejects.toThrow(
        "Authentication Required",
      );
    });
  });

  describe("getRecord error handling", () => {
    it("throws for invalid AT URI format", async () => {
      await expect(client.getRecord("invalid-uri")).rejects.toThrow("Invalid AT URI");
    });

    it("throws for non-existent record", async () => {
      await expect(
        client.getRecord("at://did:plc:test123/app.openhax.radar.signalEvent/nonexistent"),
      ).rejects.toThrow("Record not found");
    });
  });
});
