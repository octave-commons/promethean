/**
 * Federation module for threat-radar-mcp.
 *
 * Uses Enso-style envelope messaging to exchange aggregate RadarSnapshots
 * with peer instances. Implements:
 *
 * 1. Envelope creation, serialization, and verification
 * 2. Peer discovery via AT Protocol records
 * 3. Privacy-preserving aggregate snapshot sharing (never raw signals)
 * 4. Offline peer handling with timeout, retry, and stale marking
 * 5. Trust circle filtering for peer data
 */

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Enso-style Envelope types (adapted from @promethean-os/enso-protocol)
// ---------------------------------------------------------------------------

export interface EnsoEnvelope<T = unknown> {
  id: string;
  ts: string;
  room: string;
  from: string;
  kind: "event" | "stream";
  type: string;
  seq?: number;
  rel?: { replyTo?: string; parents?: string[] };
  payload: T;
  sig?: string;
}

// ---------------------------------------------------------------------------
// Aggregate snapshot payload (privacy-preserving — no raw signals)
// ---------------------------------------------------------------------------

export interface AggregateSnapshotPayload {
  radarId: string;
  radarName: string;
  radarCategory: string;
  snapshotKind: "live" | "daily";
  asOfUtc: string;
  scoreRanges: Record<string, { lower: number; upper: number; median: number }>;
  disagreementIndex: number;
  narrativeBranchCount: number;
  threadCount: number;
  signalCount: number;
  compressionLoss?: number;
}

// ---------------------------------------------------------------------------
// Peer types
// ---------------------------------------------------------------------------

export type PeerStatus = "online" | "offline" | "stale" | "unknown";

export interface PeerNode {
  id: string;
  displayName: string;
  endpoint: string;
  atProtocolDid?: string;
  trustLevel: "trusted" | "known" | "untrusted";
  status: PeerStatus;
  lastSeen: string | null;
  lastError: string | null;
  retryCount: number;
  snapshots: AggregateSnapshotPayload[];
}

export interface TrustCircle {
  trustedPeerIds: Set<string>;
  excludedPeerIds: Set<string>;
}

export interface FederationConfig {
  instanceId: string;
  instanceName: string;
  endpoint: string;
  trustCircle: TrustCircle;
  timeoutMs: number;
  staleAfterMs: number;
  maxRetries: number;
}

// ---------------------------------------------------------------------------
// Envelope creation & serialization
// ---------------------------------------------------------------------------

function canonicalPayload(envelope: EnsoEnvelope): string {
  const { sig: _sig, ...rest } = envelope;
  const entries = Object.entries(rest)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export function createEnvelope<T>(
  from: string,
  type: string,
  payload: T,
  room = "federation",
): EnsoEnvelope<T> {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room,
    from,
    kind: "event",
    type,
    payload,
  };
}

export function serializeEnvelope(envelope: EnsoEnvelope): string {
  return JSON.stringify(envelope);
}

export function deserializeEnvelope(raw: string): EnsoEnvelope {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  if (
    typeof parsed.id !== "string" ||
    typeof parsed.ts !== "string" ||
    typeof parsed.room !== "string" ||
    typeof parsed.from !== "string" ||
    typeof parsed.kind !== "string" ||
    typeof parsed.type !== "string"
  ) {
    throw new Error("Invalid envelope: missing required fields");
  }
  return parsed as unknown as EnsoEnvelope;
}

export function computeEnvelopeHash(envelope: EnsoEnvelope): string {
  const canonical = canonicalPayload(envelope);
  return createHash("sha256").update(canonical).digest("hex");
}

// ---------------------------------------------------------------------------
// Privacy: strip raw signals, produce aggregate-only payloads
// ---------------------------------------------------------------------------

export interface RadarSnapshotInput {
  radarId: string;
  radarName: string;
  radarCategory: string;
  snapshotKind: "live" | "daily";
  asOfUtc: string;
  render_state?: Record<string, unknown>;
  threadCount: number;
  signalCount: number;
}

export function createAggregatePayload(
  input: RadarSnapshotInput,
  deterministicSnapshot?: {
    scoreRanges?: Record<string, { lower: number; upper: number; median: number }>;
    disagreementIndex?: number;
    narrativeBranches?: unknown[];
    compressionLoss?: number;
  },
): AggregateSnapshotPayload {
  const scoreRanges = deterministicSnapshot?.scoreRanges ?? {};
  const disagreementIndex = deterministicSnapshot?.disagreementIndex ?? 0;
  const narrativeBranchCount = deterministicSnapshot?.narrativeBranches?.length ?? 0;
  const compressionLoss = deterministicSnapshot?.compressionLoss;

  return {
    radarId: input.radarId,
    radarName: input.radarName,
    radarCategory: input.radarCategory,
    snapshotKind: input.snapshotKind,
    asOfUtc: input.asOfUtc,
    scoreRanges,
    disagreementIndex,
    narrativeBranchCount,
    threadCount: input.threadCount,
    signalCount: input.signalCount,
    ...(compressionLoss !== undefined ? { compressionLoss } : {}),
  };
}

// ---------------------------------------------------------------------------
// Peer discovery via AT Protocol
// ---------------------------------------------------------------------------

const BSKY_PUBLIC_API = "https://public.api.bsky.app";

export interface AtProtocolPeerRecord {
  did: string;
  handle: string;
  displayName: string;
  endpoint: string;
}

/**
 * Discover peer instances by reading profile descriptions from known Bluesky
 * accounts. Peers advertise their endpoint in a specific format:
 *   threat-radar-peer:https://example.com/api
 */
export async function discoverPeersViaAtProtocol(
  knownHandles: string[],
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<AtProtocolPeerRecord[]> {
  const peers: AtProtocolPeerRecord[] = [];

  for (const handle of knownHandles) {
    try {
      const url = `${BSKY_PUBLIC_API}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`;
      const res = await fetchFn(url);
      if (!res.ok) continue;

      const profile = (await res.json()) as {
        did?: string;
        handle?: string;
        displayName?: string;
        description?: string;
      };

      const description = profile.description ?? "";
      const match = description.match(/threat-radar-peer:(https?:\/\/[^\s]+)/);
      if (match?.[1] && profile.did && profile.handle) {
        peers.push({
          did: profile.did,
          handle: profile.handle,
          displayName: profile.displayName ?? profile.handle,
          endpoint: match[1],
        });
      }
    } catch {
      // Skip unreachable profiles
    }
  }

  return peers;
}

// ---------------------------------------------------------------------------
// Federation manager (peer exchange + offline handling)
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_RETRIES = 3;

export class FederationManager {
  private readonly config: FederationConfig;
  private readonly peers: Map<string, PeerNode> = new Map();

  constructor(config: Partial<FederationConfig> & { instanceId: string }) {
    this.config = {
      instanceId: config.instanceId,
      instanceName: config.instanceName ?? `instance-${config.instanceId.slice(0, 8)}`,
      endpoint: config.endpoint ?? "",
      trustCircle: config.trustCircle ?? {
        trustedPeerIds: new Set<string>(),
        excludedPeerIds: new Set<string>(),
      },
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      staleAfterMs: config.staleAfterMs ?? DEFAULT_STALE_AFTER_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    };
  }

  getInstanceId(): string {
    return this.config.instanceId;
  }

  // ---- Peer management ----

  addPeer(peer: Omit<PeerNode, "status" | "lastSeen" | "lastError" | "retryCount" | "snapshots">): void {
    this.peers.set(peer.id, {
      ...peer,
      status: "unknown",
      lastSeen: null,
      lastError: null,
      retryCount: 0,
      snapshots: [],
    });
  }

  removePeer(peerId: string): void {
    this.peers.delete(peerId);
  }

  getPeer(peerId: string): PeerNode | undefined {
    return this.peers.get(peerId);
  }

  listPeers(): PeerNode[] {
    return Array.from(this.peers.values());
  }

  listTrustedPeers(): PeerNode[] {
    return this.listPeers().filter((p) => this.isPeerTrusted(p.id));
  }

  // ---- Trust circle ----

  isPeerTrusted(peerId: string): boolean {
    const { trustCircle } = this.config;
    if (trustCircle.excludedPeerIds.has(peerId)) return false;
    const peer = this.peers.get(peerId);
    if (!peer) return false;
    // If trust circle has explicit trusted IDs, only those pass
    if (trustCircle.trustedPeerIds.size > 0) {
      return trustCircle.trustedPeerIds.has(peerId);
    }
    // Otherwise trust 'trusted' and 'known' levels, exclude 'untrusted'
    return peer.trustLevel !== "untrusted";
  }

  addToTrustCircle(peerId: string): void {
    this.config.trustCircle.trustedPeerIds.add(peerId);
    this.config.trustCircle.excludedPeerIds.delete(peerId);
  }

  excludeFromTrustCircle(peerId: string): void {
    this.config.trustCircle.excludedPeerIds.add(peerId);
    this.config.trustCircle.trustedPeerIds.delete(peerId);
  }

  // ---- Envelope exchange ----

  /**
   * Create an outbound Enso envelope containing an aggregate snapshot.
   * Never includes raw signals — only aggregate data.
   */
  createSnapshotEnvelope(
    payload: AggregateSnapshotPayload,
  ): EnsoEnvelope<AggregateSnapshotPayload> {
    return createEnvelope<AggregateSnapshotPayload>(
      this.config.instanceId,
      "federation.snapshot",
      payload,
      "federation",
    );
  }

  /**
   * Send an aggregate snapshot to a specific peer.
   * Returns true on success, false on failure.
   */
  async sendSnapshotToPeer(
    peerId: string,
    payload: AggregateSnapshotPayload,
    fetchFn: typeof globalThis.fetch = globalThis.fetch,
  ): Promise<boolean> {
    const peer = this.peers.get(peerId);
    if (!peer) return false;
    if (!this.isPeerTrusted(peerId)) return false;

    const envelope = this.createSnapshotEnvelope(payload);
    const serialized = serializeEnvelope(envelope);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const res = await fetchFn(`${peer.endpoint}/federation/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: serialized,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        peer.status = "online";
        peer.lastSeen = new Date().toISOString();
        peer.lastError = null;
        peer.retryCount = 0;
        return true;
      }

      this.markPeerOffline(peer, `HTTP ${res.status}`);
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.markPeerOffline(peer, message);
      return false;
    }
  }

  /**
   * Receive an envelope from a peer. Validates envelope structure,
   * applies trust circle filtering, and stores the aggregate snapshot.
   */
  receiveEnvelope(
    envelope: EnsoEnvelope<AggregateSnapshotPayload>,
  ): { accepted: boolean; reason?: string } {
    // Validate envelope structure
    if (!envelope.id || !envelope.ts || !envelope.from || !envelope.type || !envelope.payload) {
      return { accepted: false, reason: "Invalid envelope structure" };
    }

    if (envelope.type !== "federation.snapshot") {
      return { accepted: false, reason: `Unsupported envelope type: ${envelope.type}` };
    }

    // Find or create peer entry
    let peer = this.peers.get(envelope.from);
    if (!peer) {
      // Auto-register unknown senders but mark as untrusted
      peer = {
        id: envelope.from,
        displayName: `peer-${envelope.from.slice(0, 8)}`,
        endpoint: "",
        trustLevel: "untrusted",
        status: "online",
        lastSeen: new Date().toISOString(),
        lastError: null,
        retryCount: 0,
        snapshots: [],
      };
      this.peers.set(envelope.from, peer);
    }

    // Trust circle filtering (VAL-FED-003)
    if (!this.isPeerTrusted(peer.id)) {
      return { accepted: false, reason: "Peer excluded by trust circle" };
    }

    // Privacy check: ensure payload contains only aggregate data
    const p = envelope.payload;
    if (!p.radarId || !p.asOfUtc || p.scoreRanges === undefined) {
      return { accepted: false, reason: "Payload missing required aggregate fields" };
    }

    // Update peer state
    peer.status = "online";
    peer.lastSeen = new Date().toISOString();
    peer.lastError = null;
    peer.retryCount = 0;

    // Store the snapshot (keep only latest per radar per peer)
    const existingIdx = peer.snapshots.findIndex((s) => s.radarId === p.radarId);
    if (existingIdx >= 0) {
      peer.snapshots[existingIdx] = p;
    } else {
      peer.snapshots.push(p);
    }

    return { accepted: true };
  }

  /**
   * Broadcast an aggregate snapshot to all trusted peers.
   * Returns a map of peerId → success/failure.
   */
  async broadcastSnapshot(
    payload: AggregateSnapshotPayload,
    fetchFn: typeof globalThis.fetch = globalThis.fetch,
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const trustedPeers = this.listTrustedPeers().filter((p) => p.endpoint);

    const promises = trustedPeers.map(async (peer) => {
      const success = await this.sendSnapshotToPeer(peer.id, payload, fetchFn);
      results.set(peer.id, success);
    });

    await Promise.allSettled(promises);
    return results;
  }

  // ---- Offline handling ----

  private markPeerOffline(peer: PeerNode, error: string): void {
    peer.retryCount += 1;
    peer.lastError = error;

    if (peer.retryCount >= this.config.maxRetries) {
      peer.status = "offline";
    } else {
      peer.status = "stale";
    }
  }

  /**
   * Check all peers for staleness based on lastSeen timestamp.
   * Marks peers as stale if they haven't been seen within staleAfterMs.
   */
  markStalePeers(): string[] {
    const now = Date.now();
    const staleIds: string[] = [];

    for (const peer of this.peers.values()) {
      if (peer.status === "offline") continue;
      if (!peer.lastSeen) {
        peer.status = "unknown";
        continue;
      }

      const lastSeenMs = new Date(peer.lastSeen).getTime();
      if (now - lastSeenMs > this.config.staleAfterMs) {
        peer.status = "stale";
        staleIds.push(peer.id);
      }
    }

    return staleIds;
  }

  /**
   * Get aggregated peer snapshots for the federation comparison panel.
   * Only returns snapshots from trusted, non-offline peers.
   */
  getPeerSnapshots(): Array<{
    peerId: string;
    peerName: string;
    peerStatus: PeerStatus;
    snapshots: AggregateSnapshotPayload[];
  }> {
    return this.listTrustedPeers()
      .filter((p) => p.snapshots.length > 0)
      .map((p) => ({
        peerId: p.id,
        peerName: p.displayName,
        peerStatus: p.status,
        snapshots: [...p.snapshots],
      }));
  }

  /**
   * Get a summary of federation state for API responses.
   */
  getFederationStatus(): {
    instanceId: string;
    instanceName: string;
    totalPeers: number;
    trustedPeers: number;
    onlinePeers: number;
    stalePeers: number;
    offlinePeers: number;
    peerSnapshots: Array<{
      peerId: string;
      peerName: string;
      peerStatus: PeerStatus;
      snapshots: AggregateSnapshotPayload[];
    }>;
  } {
    const allPeers = this.listPeers();
    return {
      instanceId: this.config.instanceId,
      instanceName: this.config.instanceName,
      totalPeers: allPeers.length,
      trustedPeers: this.listTrustedPeers().length,
      onlinePeers: allPeers.filter((p) => p.status === "online").length,
      stalePeers: allPeers.filter((p) => p.status === "stale").length,
      offlinePeers: allPeers.filter((p) => p.status === "offline").length,
      peerSnapshots: this.getPeerSnapshots(),
    };
  }
}
