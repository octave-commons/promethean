/**
 * Tests for the Enso-style federation module.
 *
 * Covers:
 * - Envelope serialization and deserialization (VAL-FED-001)
 * - Peer snapshot exchange simulation (VAL-FED-001, VAL-FED-002)
 * - Offline peer handling (timeout, retry, stale marking)
 * - Trust circle filtering (VAL-FED-003)
 * - Privacy: only aggregate snapshots shared, never raw signals
 * - AT Protocol peer discovery
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  createEnvelope,
  serializeEnvelope,
  deserializeEnvelope,
  computeEnvelopeHash,
  createAggregatePayload,
  FederationManager,
  discoverPeersViaAtProtocol,
  type AggregateSnapshotPayload,
  type EnsoEnvelope,
} from "../src/lib/federation.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAggregatePayload(overrides?: Partial<AggregateSnapshotPayload>): AggregateSnapshotPayload {
  return {
    radarId: "radar-1",
    radarName: "Geopolitical",
    radarCategory: "geopolitical",
    snapshotKind: "live",
    asOfUtc: "2025-01-15T10:00:00.000Z",
    scoreRanges: {
      geopolitics: { lower: 30, upper: 70, median: 50 },
      infrastructure: { lower: 20, upper: 60, median: 40 },
    },
    disagreementIndex: 0.3,
    narrativeBranchCount: 3,
    threadCount: 5,
    signalCount: 42,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Envelope serialization & deserialization
// ---------------------------------------------------------------------------

describe("federation: envelope serialization", () => {
  it("creates a valid Enso-style envelope with required fields", () => {
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("instance-a", "federation.snapshot", payload);

    expect(envelope.id).toBeTruthy();
    expect(typeof envelope.id).toBe("string");
    expect(envelope.ts).toBeTruthy();
    expect(envelope.room).toBe("federation");
    expect(envelope.from).toBe("instance-a");
    expect(envelope.kind).toBe("event");
    expect(envelope.type).toBe("federation.snapshot");
    expect(envelope.payload).toEqual(payload);
    // No sig by default
    expect(envelope.sig).toBeUndefined();
  });

  it("round-trips serialize → deserialize with content intact", () => {
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("instance-a", "federation.snapshot", payload);

    const serialized = serializeEnvelope(envelope);
    expect(typeof serialized).toBe("string");

    const deserialized = deserializeEnvelope(serialized);
    expect(deserialized.id).toBe(envelope.id);
    expect(deserialized.ts).toBe(envelope.ts);
    expect(deserialized.from).toBe("instance-a");
    expect(deserialized.type).toBe("federation.snapshot");
    expect(deserialized.payload).toEqual(payload);
  });

  it("rejects invalid envelope JSON missing required fields", () => {
    expect(() => deserializeEnvelope('{"foo":"bar"}')).toThrow("Invalid envelope");
    expect(() => deserializeEnvelope("not json")).toThrow();
  });

  it("computes deterministic envelope hash", () => {
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("instance-a", "federation.snapshot", payload);

    const hash1 = computeEnvelopeHash(envelope);
    const hash2 = computeEnvelopeHash(envelope);
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("string");
    expect(hash1.length).toBe(64); // SHA-256 hex

    // Different payload → different hash
    const envelope2 = createEnvelope("instance-b", "federation.snapshot", payload);
    const hash3 = computeEnvelopeHash(envelope2);
    expect(hash3).not.toBe(hash1);
  });
});

// ---------------------------------------------------------------------------
// 2. Peer snapshot exchange simulation
// ---------------------------------------------------------------------------

describe("federation: peer exchange simulation", () => {
  let managerA: FederationManager;
  let managerB: FederationManager;

  beforeEach(() => {
    managerA = new FederationManager({
      instanceId: "instance-a",
      instanceName: "Instance A",
      endpoint: "http://localhost:9001",
    });
    managerB = new FederationManager({
      instanceId: "instance-b",
      instanceName: "Instance B",
      endpoint: "http://localhost:9002",
    });

    // Register each other as peers
    managerA.addPeer({
      id: "instance-b",
      displayName: "Instance B",
      endpoint: "http://localhost:9002",
      trustLevel: "trusted",
    });
    managerB.addPeer({
      id: "instance-a",
      displayName: "Instance A",
      endpoint: "http://localhost:9001",
      trustLevel: "trusted",
    });
  });

  it("creates and receives an envelope between peers", () => {
    const payload = makeAggregatePayload();

    // Instance A creates envelope
    const envelope = managerA.createSnapshotEnvelope(payload);
    expect(envelope.from).toBe("instance-a");
    expect(envelope.type).toBe("federation.snapshot");

    // Instance B receives the envelope
    const result = managerB.receiveEnvelope(envelope);
    expect(result.accepted).toBe(true);

    // Verify Instance B now has the snapshot
    const peerSnapshots = managerB.getPeerSnapshots();
    expect(peerSnapshots.length).toBe(1);
    expect(peerSnapshots[0].peerId).toBe("instance-a");
    expect(peerSnapshots[0].snapshots.length).toBe(1);
    expect(peerSnapshots[0].snapshots[0].radarId).toBe("radar-1");
    expect(peerSnapshots[0].snapshots[0].scoreRanges).toEqual(payload.scoreRanges);
  });

  it("updates existing snapshot when same radar arrives again", () => {
    const payload1 = makeAggregatePayload({ disagreementIndex: 0.3 });
    const payload2 = makeAggregatePayload({ disagreementIndex: 0.8 });

    const env1 = managerA.createSnapshotEnvelope(payload1);
    const env2 = managerA.createSnapshotEnvelope(payload2);

    managerB.receiveEnvelope(env1);
    managerB.receiveEnvelope(env2);

    // Should still be 1 snapshot (latest replaces)
    const peerSnapshots = managerB.getPeerSnapshots();
    expect(peerSnapshots[0].snapshots.length).toBe(1);
    expect(peerSnapshots[0].snapshots[0].disagreementIndex).toBe(0.8);
  });

  it("marks sending peer as online after successful receive", () => {
    const payload = makeAggregatePayload();
    const envelope = managerA.createSnapshotEnvelope(payload);
    managerB.receiveEnvelope(envelope);

    const peer = managerB.getPeer("instance-a");
    expect(peer?.status).toBe("online");
    expect(peer?.lastSeen).toBeTruthy();
    expect(peer?.lastError).toBeNull();
  });

  it("simulates broadcast with mock fetch — tracks success and failure", async () => {
    const payload = makeAggregatePayload();

    // Add another peer
    managerA.addPeer({
      id: "instance-c",
      displayName: "Instance C",
      endpoint: "http://localhost:9003",
      trustLevel: "trusted",
    });

    let callCount = 0;
    const mockFetch = async (url: string | URL | Request): Promise<Response> => {
      callCount++;
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("9002")) {
        // Instance B succeeds
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      // Instance C fails
      return new Response("Internal Server Error", { status: 500 });
    };

    const results = await managerA.broadcastSnapshot(payload, mockFetch as typeof globalThis.fetch);
    expect(callCount).toBe(2);
    expect(results.get("instance-b")).toBe(true);
    expect(results.get("instance-c")).toBe(false);

    // Check peer statuses updated
    const peerB = managerA.getPeer("instance-b");
    expect(peerB?.status).toBe("online");
    const peerC = managerA.getPeer("instance-c");
    expect(peerC?.status).toBe("stale"); // first failure = stale, not offline yet
  });
});

// ---------------------------------------------------------------------------
// 3. Offline peer handling
// ---------------------------------------------------------------------------

describe("federation: offline peer handling", () => {
  let manager: FederationManager;

  beforeEach(() => {
    manager = new FederationManager({
      instanceId: "instance-a",
      instanceName: "Instance A",
      endpoint: "http://localhost:9001",
      timeoutMs: 100,
      staleAfterMs: 1000,
      maxRetries: 3,
    });

    manager.addPeer({
      id: "peer-1",
      displayName: "Peer 1",
      endpoint: "http://localhost:9010",
      trustLevel: "trusted",
    });
  });

  it("marks peer as stale after failed send attempts", async () => {
    const payload = makeAggregatePayload();

    // Mock fetch that always fails
    const mockFetch = async (): Promise<Response> => {
      throw new Error("Connection refused");
    };

    // First attempt — should be marked stale (retryCount < maxRetries)
    const success = await manager.sendSnapshotToPeer("peer-1", payload, mockFetch as typeof globalThis.fetch);
    expect(success).toBe(false);

    const peer1 = manager.getPeer("peer-1");
    expect(peer1?.status).toBe("stale");
    expect(peer1?.retryCount).toBe(1);
    expect(peer1?.lastError).toBe("Connection refused");
  });

  it("marks peer as offline after exceeding max retries", async () => {
    const payload = makeAggregatePayload();

    const mockFetch = async (): Promise<Response> => {
      throw new Error("timeout");
    };

    // Exhaust retries
    await manager.sendSnapshotToPeer("peer-1", payload, mockFetch as typeof globalThis.fetch);
    await manager.sendSnapshotToPeer("peer-1", payload, mockFetch as typeof globalThis.fetch);
    await manager.sendSnapshotToPeer("peer-1", payload, mockFetch as typeof globalThis.fetch);

    const peer = manager.getPeer("peer-1");
    expect(peer?.status).toBe("offline");
    expect(peer?.retryCount).toBe(3);
  });

  it("resets peer to online after successful contact", async () => {
    const payload = makeAggregatePayload();

    // First: fail twice
    const failFetch = async (): Promise<Response> => {
      throw new Error("timeout");
    };
    await manager.sendSnapshotToPeer("peer-1", payload, failFetch as typeof globalThis.fetch);
    await manager.sendSnapshotToPeer("peer-1", payload, failFetch as typeof globalThis.fetch);

    expect(manager.getPeer("peer-1")?.status).toBe("stale");

    // Then: succeed
    const successFetch = async (): Promise<Response> => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    await manager.sendSnapshotToPeer("peer-1", payload, successFetch as typeof globalThis.fetch);

    const peer = manager.getPeer("peer-1");
    expect(peer?.status).toBe("online");
    expect(peer?.retryCount).toBe(0);
    expect(peer?.lastError).toBeNull();
  });

  it("detects stale peers based on lastSeen timestamp", () => {
    const peer = manager.getPeer("peer-1");
    if (!peer) throw new Error("Peer not found");

    // Set lastSeen to well in the past
    peer.status = "online";
    peer.lastSeen = new Date(Date.now() - 60_000).toISOString(); // 60s ago

    // With staleAfterMs = 1000, this should be stale
    const staleIds = manager.markStalePeers();
    expect(staleIds).toContain("peer-1");
    expect(peer.status).toBe("stale");
  });

  it("does not mark recently seen peers as stale", () => {
    const peer = manager.getPeer("peer-1");
    if (!peer) throw new Error("Peer not found");

    peer.status = "online";
    peer.lastSeen = new Date().toISOString(); // just now

    const staleIds = manager.markStalePeers();
    expect(staleIds).not.toContain("peer-1");
    expect(peer.status).toBe("online");
  });
});

// ---------------------------------------------------------------------------
// 4. Trust circle filtering
// ---------------------------------------------------------------------------

describe("federation: trust circle filtering", () => {
  let manager: FederationManager;

  beforeEach(() => {
    manager = new FederationManager({
      instanceId: "instance-a",
      instanceName: "Instance A",
    });

    manager.addPeer({
      id: "peer-trusted",
      displayName: "Trusted Peer",
      endpoint: "http://localhost:9010",
      trustLevel: "trusted",
    });

    manager.addPeer({
      id: "peer-known",
      displayName: "Known Peer",
      endpoint: "http://localhost:9011",
      trustLevel: "known",
    });

    manager.addPeer({
      id: "peer-untrusted",
      displayName: "Untrusted Peer",
      endpoint: "http://localhost:9012",
      trustLevel: "untrusted",
    });
  });

  it("accepts envelopes from trusted peers", () => {
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("peer-trusted", "federation.snapshot", payload);

    const result = manager.receiveEnvelope(envelope as EnsoEnvelope<AggregateSnapshotPayload>);
    expect(result.accepted).toBe(true);
  });

  it("rejects envelopes from untrusted peers", () => {
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("peer-untrusted", "federation.snapshot", payload);

    const result = manager.receiveEnvelope(envelope as EnsoEnvelope<AggregateSnapshotPayload>);
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("trust circle");
  });

  it("excludes peer from trust circle and rejects their data", () => {
    // peer-known starts as trusted (default for 'known' trust level)
    expect(manager.isPeerTrusted("peer-known")).toBe(true);

    // Exclude peer-known
    manager.excludeFromTrustCircle("peer-known");
    expect(manager.isPeerTrusted("peer-known")).toBe(false);

    // Now their envelope is rejected
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("peer-known", "federation.snapshot", payload);
    const result = manager.receiveEnvelope(envelope as EnsoEnvelope<AggregateSnapshotPayload>);
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("trust circle");
  });

  it("only includes trusted peer snapshots in getPeerSnapshots", () => {
    const payload = makeAggregatePayload();

    // Send from trusted peer
    const env1 = createEnvelope("peer-trusted", "federation.snapshot", payload);
    manager.receiveEnvelope(env1 as EnsoEnvelope<AggregateSnapshotPayload>);

    // Manually give untrusted peer a snapshot (as if it bypassed filtering)
    const untrustedPeer = manager.getPeer("peer-untrusted");
    if (untrustedPeer) {
      untrustedPeer.snapshots.push(payload);
    }

    // Only trusted peer's snapshot should appear
    const peerSnapshots = manager.getPeerSnapshots();
    expect(peerSnapshots.length).toBe(1);
    expect(peerSnapshots[0].peerId).toBe("peer-trusted");
  });

  it("adds peer to trust circle and then accepts their data", () => {
    // peer-untrusted is initially rejected
    expect(manager.isPeerTrusted("peer-untrusted")).toBe(false);

    // Add to trust circle
    manager.addToTrustCircle("peer-untrusted");
    expect(manager.isPeerTrusted("peer-untrusted")).toBe(true);

    // Now their envelope is accepted
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("peer-untrusted", "federation.snapshot", payload);
    const result = manager.receiveEnvelope(envelope as EnsoEnvelope<AggregateSnapshotPayload>);
    expect(result.accepted).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Privacy: aggregate only, never raw signals
// ---------------------------------------------------------------------------

describe("federation: privacy — aggregate snapshots only", () => {
  it("createAggregatePayload strips all non-aggregate data", () => {
    const payload = createAggregatePayload(
      {
        radarId: "radar-1",
        radarName: "Geopolitical",
        radarCategory: "geopolitical",
        snapshotKind: "live",
        asOfUtc: "2025-01-15T10:00:00.000Z",
        threadCount: 5,
        signalCount: 42,
      },
      {
        scoreRanges: { geo: { lower: 10, upper: 80, median: 45 } },
        disagreementIndex: 0.4,
        narrativeBranches: [{}, {}, {}],
        compressionLoss: 0.15,
      },
    );

    // Verify only aggregate fields are present
    expect(payload.radarId).toBe("radar-1");
    expect(payload.scoreRanges).toEqual({ geo: { lower: 10, upper: 80, median: 45 } });
    expect(payload.disagreementIndex).toBe(0.4);
    expect(payload.narrativeBranchCount).toBe(3);
    expect(payload.threadCount).toBe(5);
    expect(payload.signalCount).toBe(42);
    expect(payload.compressionLoss).toBe(0.15);

    // Verify no raw data fields
    const keys = Object.keys(payload);
    expect(keys).not.toContain("rawSignals");
    expect(keys).not.toContain("signals");
    expect(keys).not.toContain("threads");
    expect(keys).not.toContain("rawContent");
    expect(keys).not.toContain("narrativeBranches"); // only count, not content
  });
});

// ---------------------------------------------------------------------------
// 6. AT Protocol peer discovery
// ---------------------------------------------------------------------------

describe("federation: AT Protocol peer discovery", () => {
  it("discovers peers from Bluesky profile descriptions", async () => {
    const mockFetch = async (url: string | URL | Request): Promise<Response> => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("alice.bsky.social")) {
        return new Response(JSON.stringify({
          did: "did:plc:alice123",
          handle: "alice.bsky.social",
          displayName: "Alice",
          description: "My threat radar node threat-radar-peer:https://alice.example.com/api",
        }), { status: 200 });
      }
      if (urlStr.includes("bob.bsky.social")) {
        return new Response(JSON.stringify({
          did: "did:plc:bob456",
          handle: "bob.bsky.social",
          displayName: "Bob",
          description: "Just a normal Bluesky user, no radar here",
        }), { status: 200 });
      }
      return new Response("Not found", { status: 404 });
    };

    const peers = await discoverPeersViaAtProtocol(
      ["alice.bsky.social", "bob.bsky.social", "nonexistent.bsky.social"],
      mockFetch as typeof globalThis.fetch,
    );

    expect(peers.length).toBe(1);
    expect(peers[0].did).toBe("did:plc:alice123");
    expect(peers[0].handle).toBe("alice.bsky.social");
    expect(peers[0].displayName).toBe("Alice");
    expect(peers[0].endpoint).toBe("https://alice.example.com/api");
  });

  it("handles network errors during discovery gracefully", async () => {
    const mockFetch = async (): Promise<Response> => {
      throw new Error("Network unreachable");
    };

    const peers = await discoverPeersViaAtProtocol(
      ["alice.bsky.social"],
      mockFetch as typeof globalThis.fetch,
    );

    expect(peers.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Federation status summary
// ---------------------------------------------------------------------------

describe("federation: status summary for Π lane", () => {
  it("returns complete federation status for API", () => {
    const manager = new FederationManager({
      instanceId: "instance-a",
      instanceName: "Test Instance",
    });

    manager.addPeer({
      id: "peer-1",
      displayName: "Peer 1",
      endpoint: "http://localhost:9010",
      trustLevel: "trusted",
    });

    // Receive a snapshot from peer-1
    const payload = makeAggregatePayload();
    const envelope = createEnvelope("peer-1", "federation.snapshot", payload);
    manager.receiveEnvelope(envelope as EnsoEnvelope<AggregateSnapshotPayload>);

    const status = manager.getFederationStatus();
    expect(status.instanceId).toBe("instance-a");
    expect(status.instanceName).toBe("Test Instance");
    expect(status.totalPeers).toBe(1);
    expect(status.trustedPeers).toBe(1);
    expect(status.onlinePeers).toBe(1);
    expect(status.peerSnapshots.length).toBe(1);
    expect(status.peerSnapshots[0].peerId).toBe("peer-1");
    expect(status.peerSnapshots[0].snapshots[0].radarId).toBe("radar-1");
  });
});
