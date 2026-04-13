/**
 * Bluesky Discovery Source
 * 
 * Real-time perception from AT Protocol firehose.
 * Provides live social signals to the cephalon perception layer.
 */

import type { UUID, ISO8601 } from '../../core/types.js';
import type { ExclusionSet } from '../../policy/exclusions.js';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Local Types
// ============================================================================

/**
 * Discovery target from Sintel.
 */
export interface BskyDiscoveryTarget {
  readonly id: UUID;
  readonly hostname?: string;
  readonly did?: string;
  readonly handle?: string;
  readonly scope: string;
}

/**
 * Discovery result from Bluesky.
 */
export interface BskyDiscoveryResult {
  readonly target: BskyDiscoveryTarget;
  readonly observations: BskySignal[];
  readonly error?: string;
}

// ============================================================================
// Bluesky Types
// ============================================================================

/**
 * AT Protocol Lexicon record types we care about.
 */
export type BskyRecordType = 
  | 'app.bsky.feed.post'
  | 'app.bsky.feed.repost'
  | 'app.bsky.feed.like'
  | 'app.bsky.graph.follow'
  | 'app.bsky.graph.block'
  | 'app.bsky.actor.profile';

/**
 * Bluesky account (DID + handle).
 */
export interface BskyAccount {
  readonly did: string;
  readonly handle: string;
  readonly displayName?: string;
  readonly avatar?: string;
  readonly followers?: number;
  readonly following?: number;
  readonly posts?: number;
  readonly verified?: boolean;
  readonly observedAt: ISO8601;
}

/**
 * Bluesky post content.
 */
export interface BskyPost {
  readonly uri: string;
  readonly cid: string;
  readonly authorDid: string;
  readonly authorHandle?: string;
  readonly text: string;
  readonly facets?: BskyFacet[];
  readonly embed?: BskyEmbed;
  readonly reply?: {
    readonly root: { uri: string; cid: string };
    readonly parent: { uri: string; cid: string };
  };
  readonly langs?: string[];
  readonly createdAt: ISO8601;
  readonly indexedAt?: ISO8601;
}

/**
 * Post facet (mention, link, tag).
 */
export interface BskyFacet {
  readonly type: 'mention' | 'link' | 'tag';
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

/**
 * Embedded content.
 */
export type BskyEmbed = 
  | { type: 'images'; images: BskyImage[] }
  | { type: 'video'; video: BskyVideo }
  | { type: 'external'; external: BskyExternalLink }
  | { type: 'record'; record: { uri: string; cid: string } }
  | { type: 'recordWithMedia'; record: BskyPost; media: BskyEmbed };

export interface BskyImage {
  readonly alt?: string;
  readonly thumb: string;
  readonly fullsize: string;
}

export interface BskyVideo {
  readonly ref: string;
  readonly width?: number;
  readonly height?: number;
}

export interface BskyExternalLink {
  readonly uri: string;
  readonly title?: string;
  readonly description?: string;
  readonly thumb?: string;
}

/**
 * Social signal extracted from Bluesky activity.
 */
export interface BskySignal {
  readonly id: UUID;
  readonly type: 'post' | 'repost' | 'like' | 'follow' | 'mention' | 'trend' | 'anomaly';
  readonly author?: BskyAccount;
  readonly post?: BskyPost;
  readonly targetDid?: string;
  readonly strength: number;
  readonly rationale: string;
  readonly tags: string[];
  readonly observedAt: ISO8601;
  readonly rawEvent?: Record<string, unknown>;
}

/**
 * Signal aggregation for a topic/account.
 */
export interface BskySignalAggregate {
  readonly topic: string;
  readonly signals: BskySignal[];
  readonly combinedStrength: number;
  readonly uniqueAuthors: number;
  readonly timeframe: {
    readonly start: ISO8601;
    readonly end: ISO8601;
  };
}

/**
 * Firehose event.
 */
export interface FirehoseEvent {
  readonly seq: number;
  readonly time: string;
  readonly repo: string;
  readonly path: string;
  readonly action: 'create' | 'update' | 'delete';
  readonly commit?: { readonly cid: string };
  readonly record?: Record<string, unknown>;
  readonly collection?: string;  // Collection type (e.g., 'app.bsky.feed.post')
  readonly ops?: Array<{
    readonly action: 'create' | 'update' | 'delete';
    readonly path: string;
    readonly cid?: string;
    readonly record?: Record<string, unknown>;
  }>;
}

/**
 * Firehose subscription options.
 */
export interface FirehoseOptions {
  readonly relay?: string;
  readonly collections?: BskyRecordType[];
  readonly dids?: string[];
  readonly onEvent?: (event: FirehoseEvent) => void;
  readonly onError?: (error: Error) => void;
  readonly onReconnect?: () => void;
}

// ============================================================================
// Bluesky Discovery Class
// ============================================================================

/**
 * Discovery source for Bluesky/AT Protocol.
 * Connects to the AT Protocol firehose and extracts social signals.
 */
export class BskyDiscovery {
  readonly name = 'bluesky';
  
  private firehoseInstance: InternalFirehose | null = null;
  private signalBuffer: BskySignal[] = [];
  private accountCache: Map<string, BskyAccount> = new Map();
  private topicTrackers: Map<string, BskySignalAggregate> = new Map();

  constructor(private readonly bufferSize = 1000) {}

  /**
   * Start listening to the firehose.
   */
  async start(options?: FirehoseOptions): Promise<void> {
    this.firehoseInstance = new InternalFirehose({
      ...options,
      onEvent: (event) => this.processFirehoseEvent(event),
      onError: (err) => console.error('[BskyDiscovery] Firehose error:', err),
    });
    
    await this.firehoseInstance.start();
  }

  /**
   * Stop listening.
   */
  stop(): void {
    if (this.firehoseInstance) {
      this.firehoseInstance.stop();
      this.firehoseInstance = null;
    }
  }

  /**
   * Discover signals for a target (returns what we've collected).
   */
  async discover(target: BskyDiscoveryTarget, exclusions: ExclusionSet): Promise<BskyDiscoveryResult> {
    // Check exclusions
    for (const exc of exclusions.effective) {
      if (target.hostname?.includes(exc.pattern)) {
        return { target, observations: [], error: `Target excluded: ${exc.category}` };
      }
    }
    
    const matching = this.findMatchingSignals(target);
    return { target, observations: matching };
  }

  /**
   * Get current signal buffer.
   */
  getSignals(limit = 100): BskySignal[] {
    return this.signalBuffer.slice(0, limit);
  }

  /**
   * Get signals for a topic.
   */
  getTopicSignals(topic: string): BskySignalAggregate | undefined {
    return this.topicTrackers.get(topic);
  }

  /**
   * Track a topic for aggregation.
   */
  trackTopic(topic: string): void {
    if (!this.topicTrackers.has(topic)) {
      this.topicTrackers.set(topic, {
        topic,
        signals: [],
        combinedStrength: 0,
        uniqueAuthors: 0,
        timeframe: { start: new Date().toISOString(), end: new Date().toISOString() },
      });
    }
  }

  /**
   * Lookup account by DID.
   */
  getAccount(did: string): BskyAccount | undefined {
    return this.accountCache.get(did);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private processFirehoseEvent(event: FirehoseEvent): void {
    // Handle both old format (event.ops) and new format from metadata-only firehose
    if ((event as any).ops) {
      // Old format from full record parsing
      for (const op of (event as any).ops) {
        if (op.action !== 'create' && op.action !== 'update') continue;
        
        const path = op.path || '';
        const collection = path.split('/')[0];
        
        this.createSignal(collection, event.repo, event.time, op.record);
      }
    } else {
      // New format from metadata-only firehose
      const collection = (event as any).collection || event.path?.split('/')[0] || '';
      this.createSignal(collection, event.repo, event.time, undefined);
    }
  }
  
  private createSignal(collection: string, authorDid: string, timestamp: string, record: any): void {
    const type = this.signalTypeFromCollection(collection);
    if (!type) return; // Skip unknown collections
    
    const signal: BskySignal = {
      id: randomUUID() as UUID,
      type,
      strength: this.defaultStrength(collection),
      rationale: `Bluesky ${type} from ${authorDid?.slice(0, 16) || 'unknown'}...`,
      observedAt: timestamp || new Date().toISOString(),
      author: authorDid ? {
        did: authorDid,
        handle: '', // Will be resolved later
        observedAt: timestamp || new Date().toISOString(),
      } : undefined,
      tags: [collection, `type:${type}`],
      post: record?.text ? {
        uri: `at://${authorDid}/${collection}/${record.uri || ''}`,
        cid: record.cid || '',
        authorDid,
        text: record.text,
        createdAt: record.createdAt || timestamp,
      } : undefined,
    };
    
    this.addSignal(signal);
  }
  
  private signalTypeFromCollection(collection: string): BskySignal['type'] | null {
    switch (collection) {
      case 'app.bsky.feed.post': return 'post';
      case 'app.bsky.feed.repost': return 'repost';
      case 'app.bsky.feed.like': return 'like';
      case 'app.bsky.graph.follow': return 'follow';
      case 'app.bsky.graph.block': return 'anomaly';
      case 'app.bsky.actor.profile': return 'post';
      default: return null;
    }
  }
  
  private defaultStrength(collection: string): number {
    switch (collection) {
      case 'app.bsky.feed.post': return 0.7;
      case 'app.bsky.feed.repost': return 0.5;
      case 'app.bsky.feed.like': return 0.3;
      case 'app.bsky.graph.follow': return 0.4;
      default: return 0.5;
    }
  }

  private processPost(record: any, authorDid: string): void {
    if (!record?.text) return;
    
    const post: BskyPost = {
      uri: `at://${authorDid}/app.bsky.feed.post/${record.uri?.split('/').pop() || ''}`,
      cid: record.cid || '',
      authorDid,
      text: record.text,
      facets: this.extractFacets(record),
      langs: record.langs,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    
    const mentions = post.facets?.filter(f => f.type === 'mention') || [];
    
    const signal: BskySignal = {
      id: randomUUID() as UUID,
      type: mentions.length > 0 ? 'mention' : 'post',
      author: this.accountCache.get(authorDid),
      post,
      strength: this.calculatePostStrength(post),
      rationale: `Post by ${authorDid}`,
      tags: this.extractTags(post),
      observedAt: new Date().toISOString(),
    };
    
    this.addSignal(signal);
  }

  private processRepost(record: any, authorDid: string): void {
    if (!record?.subject?.uri) return;
    
    const signal: BskySignal = {
      id: randomUUID() as UUID,
      type: 'repost',
      author: this.accountCache.get(authorDid),
      post: {
        uri: record.subject.uri,
        cid: record.subject.cid || '',
        authorDid: record.subject.uri.split('/')[2] || '',
        text: '',
        createdAt: new Date().toISOString(),
      },
      strength: 0.3,
      rationale: `Repost by ${authorDid}`,
      tags: ['repost', 'amplification'],
      observedAt: new Date().toISOString(),
    };
    
    this.addSignal(signal);
  }

  private processLike(record: any, authorDid: string): void {
    if (!record?.subject?.uri) return;
    
    const signal: BskySignal = {
      id: randomUUID() as UUID,
      type: 'like',
      author: this.accountCache.get(authorDid),
      post: {
        uri: record.subject.uri,
        cid: record.subject.cid || '',
        authorDid: record.subject.uri.split('/')[2] || '',
        text: '',
        createdAt: new Date().toISOString(),
      },
      strength: 0.1,
      rationale: `Like by ${authorDid}`,
      tags: ['like', 'engagement'],
      observedAt: new Date().toISOString(),
    };
    
    this.addSignal(signal);
  }

  private processFollow(record: any, authorDid: string): void {
    if (!record?.subject) return;
    
    const targetDid = typeof record.subject === 'string' 
      ? record.subject 
      : record.subject?.uri?.split('/')[2] || '';
    
    const signal: BskySignal = {
      id: randomUUID() as UUID,
      type: 'follow',
      author: this.accountCache.get(authorDid),
      targetDid,
      strength: 0.2,
      rationale: `Follow: ${authorDid} → ${targetDid}`,
      tags: ['follow', 'graph'],
      observedAt: new Date().toISOString(),
    };
    
    this.addSignal(signal);
  }

  private addSignal(signal: BskySignal): void {
    this.signalBuffer.push(signal);
    
    if (this.signalBuffer.length > this.bufferSize) {
      this.signalBuffer = this.signalBuffer.slice(-this.bufferSize);
    }
    
    for (const tag of signal.tags) {
      const tracker = this.topicTrackers.get(tag);
      if (tracker) {
        const newSignals = [...tracker.signals, signal];
        const newCombined = this.calculateCombinedStrength(newSignals);
        const newUniqueAuthors = new Set(newSignals.map(s => s.author?.did).filter(Boolean)).size;
        
        this.topicTrackers.set(tag, {
          topic: tracker.topic,
          signals: newSignals,
          combinedStrength: newCombined,
          uniqueAuthors: newUniqueAuthors,
          timeframe: { start: tracker.timeframe.start, end: signal.observedAt },
        });
      }
    }
  }

  private findMatchingSignals(target: BskyDiscoveryTarget): BskySignal[] {
    const results: BskySignal[] = [];
    
    for (const signal of this.signalBuffer) {
      if (signal.author?.handle === target.hostname) {
        results.push(signal);
        continue;
      }
      
      if (signal.post?.text?.toLowerCase().includes((target.hostname || '').toLowerCase())) {
        results.push(signal);
        continue;
      }
      
      if (signal.tags.some(t => t.includes(target.hostname || ''))) {
        results.push(signal);
        continue;
      }
    }
    
    return results;
  }

  private extractFacets(record: any): BskyFacet[] {
    if (!record?.facets) return [];
    
    return record.facets.map((f: any) => {
      const feature = f.features?.[0];
      let type: BskyFacet['type'] = 'link';
      let value = '';
      
      if (feature?.$type === 'app.bsky.richtext.facet#mention') {
        type = 'mention';
        value = feature.did;
      } else if (feature?.$type === 'app.bsky.richtext.facet#link') {
        type = 'link';
        value = feature.uri;
      } else if (feature?.$type === 'app.bsky.richtext.facet#tag') {
        type = 'tag';
        value = feature.tag;
      }
      
      return { type, start: f.index?.byteStart || 0, end: f.index?.byteEnd || 0, value };
    });
  }

  private extractTags(post: BskyPost): string[] {
    const tags = new Set<string>();
    const hashtags = post.text.match(/#\w+/g) || [];
    hashtags.forEach(t => tags.add(t.slice(1).toLowerCase()));
    post.facets?.forEach(f => { if (f.type === 'tag') tags.add(f.value.toLowerCase()); });
    return Array.from(tags);
  }

  private calculatePostStrength(post: BskyPost): number {
    let strength = 0.5;
    if (post.text.length > 280) strength += 0.1;
    if (post.text.length > 560) strength += 0.1;
    if (post.facets?.some(f => f.type === 'link')) strength += 0.1;
    if (post.facets?.some(f => f.type === 'mention')) strength += 0.05;
    if (post.embed) strength += 0.1;
    if (post.reply) strength += 0.05;
    return Math.min(1.0, strength);
  }

  private calculateCombinedStrength(signals: BskySignal[]): number {
    if (signals.length === 0) return 0;
    const now = Date.now();
    const weights = signals.map(s => {
      const age = now - new Date(s.observedAt).getTime();
      const hours = age / (1000 * 60 * 60);
      return Math.exp(-hours * 0.1) * s.strength;
    });
    return weights.reduce((a, b) => a + b, 0) / signals.length;
  }
}

// ============================================================================
// Internal Firehose Client
// ============================================================================

/**
 * Internal firehose client using dynamic WebSocket import.
 */
class InternalFirehose {
  private ws: any = null;
  private reconnectTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private lastSeq = 0;

  constructor(private readonly options: FirehoseOptions) {}

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    const relay = this.options.relay || 'wss://bsky.network';
    const url = `${relay}/xrpc/com.atproto.sync.subscribeRepos`;
    
    this.isRunning = true;
    await this.connect(url);
  }

  stop(): void {
    this.isRunning = false;
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  private async connect(url: string): Promise<void> {
    const WebSocketClass = await this.getWebSocket();
    this.ws = new WebSocketClass(url);
    
    this.ws.onopen = () => console.log('[BskyFirehose] Connected to relay');
    
    // AT Protocol firehose sends binary CBOR frames, not JSON
    this.ws.binaryType = 'arraybuffer';
    
    this.ws.onmessage = async (event: any) => {
      try {
        const buffer = event.data instanceof ArrayBuffer 
          ? new Uint8Array(event.data)
          : event.data;
        await this.handleFrame(buffer);
      } catch (err) {
        console.error('[BskyFirehose] Frame error:', err);
      }
    };
    
    this.ws.onerror = (err: any) => {
      console.error('[BskyFirehose] Error:', err);
      this.options.onError?.(new Error('WebSocket error'));
    };
    
    this.ws.onclose = () => {
      console.log('[BskyFirehose] Disconnected');
      if (this.isRunning) this.scheduleReconnect();
    };
  }

  private async getWebSocket(): Promise<any> {
    if (typeof WebSocket !== 'undefined') return WebSocket;
    try {
      const ws = await import('ws');
      return ws.default || ws;
    } catch {
      throw new Error('Install "ws" package for Node.js support');
    }
  }

  /**
   * Parse AT Protocol firehose messages using CBOR.
   * 
   * The firehose sends paired CBOR objects:
   * 1. Frame header: { t: "#commit", op: 1 }
   * 2. Payload: { seq, time, repo, ops, blocks, ... }
   * 
   * We use decodeMultiple from cbor-x which handles buffers with
   * multiple CBOR items and returns all decoded objects.
   */
  private async handleFrame(buffer: Uint8Array): Promise<void> {
    try {
      const cborModule = await import('cbor-x');
      
      // decodeMultiple returns an array of all CBOR objects in the buffer
      const objects = (cborModule as any).decodeMultiple(buffer);
      
      if (objects && objects.length >= 2) {
        // First object is the frame header: { t, op }
        const frameHeader = objects[0];
        const msgType = frameHeader?.t || '';
        
        // Second object is the payload with actual data
        const payload = objects[1];
        
        // Convert BigInt values to strings for safe handling
        if (payload && typeof payload === 'object') {
          // seq is often BigInt
          if (typeof payload.seq === 'bigint') {
            payload.seq = Number(payload.seq);
          }
          // Handle ops array
          if (Array.isArray(payload.ops)) {
            for (const op of payload.ops) {
              if (typeof op.cid === 'bigint') {
                op.cid = String(op.cid);
              }
            }
          }
        }
        
        // Debug: log first few messages
        if (this.lastSeq < 3) {
          const repo = payload?.repo?.slice?.(0, 8) || payload?.repo || 'unknown';
          const seq = payload?.seq || '?';
          const numOps = payload?.ops?.length || 0;
          console.log(`[BskyFirehose] ${msgType} seq=${seq} repo=${repo} ops=${numOps}`);
        }
        
        // Process commit messages
        if (msgType === '#commit' && payload) {
          this.processMessage(payload);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (this.lastSeq < 1 && !msg.includes('BigInt')) {
        console.error(`[BskyFirehose] CBOR error: ${msg.slice(0, 60)}`);
      }
    }
  }
  
  private processMessage(message: any): void {
    if (!message || typeof message !== 'object') return;
    
    // Update last sequence
    if (message.seq) {
      this.lastSeq = Math.max(this.lastSeq, Number(message.seq));
    }
    
    // Process record operations
    if (!message.ops || !message.repo) return;
    
    // Debug counter
    let dbgCount = 0;
    
    for (const op of message.ops) {
      const action = op.action;
      const path = op.path || '';
      
      // Extract collection from path (format: "collection/rkey")
      const collection = path.split('/')[0] || '';
      
      // Debug: count processed (only first 3 to avoid spam)
      // dbgCount++;
      // if (dbgCount <= 3) {
      //   console.log(`[BskyFirehose] ${collection}`);
      // }
      
      // We care about creates and updates
      if (action !== 'create' && action !== 'update') continue;
      
      // Map collection to signal type
      const signalType = this.collectionToSignalType(collection);
      if (!signalType) continue; // Skip unknown collections
      
      // Create the signal
      this.handleMessage({
        seq: message.seq,
        time: message.time,
        repo: message.repo,
        path: op.path,
        action: action,
        cid: op.cid,
        collection: collection,
        ops: message.ops,
      });
    }
  }
  
  private collectionToSignalType(collection: string): string | null {
    switch (collection) {
      case 'app.bsky.feed.post':
        return 'post';
      case 'app.bsky.feed.repost':
        return 'repost';
      case 'app.bsky.feed.like':
        return 'like';
      case 'app.bsky.graph.follow':
        return 'follow';
      case 'app.bsky.graph.block':
        return 'block';
      case 'app.bsky.actor.profile':
        return 'profile';
      default:
        return null;
    }
  }

  private handleMessage(data: any): void {
    if (data.seq && data.seq > this.lastSeq) this.lastSeq = data.seq;
    
    // Skip tombstones (deletes)
    if (data.action === 'delete') return;
    
    // The firehose only sends metadata, not full record content
    // We create signals from what we have: author DID, collection type, timestamp
    const path = data.path || '';
    const collection = data.collection || path.split('/')[0] || '';
    const authorDid = data.repo;
    const timestamp = data.time || new Date().toISOString();
    const type = this.collectionToType(collection);
    
    // Call the onEvent callback to notify listeners
    this.options.onEvent?.({
      seq: data.seq,
      time: timestamp,
      repo: authorDid || '',
      path: data.path,
      action: data.action,
      ops: data.ops,
      collection: collection,
    });
  }
  
  private collectionToType(collection: string): BskySignal['type'] {
    switch (collection) {
      case 'app.bsky.feed.post': return 'post';
      case 'app.bsky.feed.repost': return 'repost';
      case 'app.bsky.feed.like': return 'like';
      case 'app.bsky.graph.follow': return 'follow';
      case 'app.bsky.graph.block': return 'anomaly'; // Block events are anomalies
      case 'app.bsky.actor.profile': return 'post'; // Treat profile updates as posts
      default: return 'post';
    }
  }
  
  private calculateMetadataStrength(collection: string): number {
    // Posts are more interesting than likes
    switch (collection) {
      case 'app.bsky.feed.post': return 0.7;
      case 'app.bsky.feed.repost': return 0.6;
      case 'app.bsky.feed.like': return 0.3;
      case 'app.bsky.graph.follow': return 0.4;
      default: return 0.5;
    }
  }
  
  private extractMetadataTags(collection: string, data: any): string[] {
    const tags: string[] = [collection];
    if (data.repo) tags.push(`author:${data.repo.slice(0, 16)}...`);
    return tags;
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      console.log('[BskyFirehose] Reconnecting...');
      this.options.onReconnect?.();
      const relay = this.options.relay || 'wss://bsky.network';
      this.connect(`${relay}/xrpc/com.atproto.sync.subscribeRepos`);
    }, 5000);
  }
}