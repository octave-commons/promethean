/**
 * Context Assembler
 * 
 * Assembles [persistent, recent, related] into a context window
 * with deterministic token budgeting and deduplication.
 */

import type {
  Memory,
  Session,
  CephalonEvent,
  CephalonPolicy,
  ContextBudgetResult,
  ContextItem,
  AssembledContext,
  InclusionLog,
  QueryEmbedding,
  ScoredMemory,
  UUID,
  ChatMessage
} from '../types/index.js';
import {
  generateSystemPrompt,
  generateDeveloperPrompt,
  getPromptName,
  formatRecentActivityForPrompt,
} from '../prompts/index.js';
import { envInt } from "../config/env.js";
import { selectEntertainmentPersona } from "../prompts/entertainment-personas.js";
import type { MemoryStore } from '../core/memory-store.js';
import { cosineSimilarity } from '../utils/vector-math.js';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Token Estimation
// ============================================================================

export interface Tokenizer {
  estimateTokens(text: string): number;
  estimateMessages(messages: ChatMessage[]): number;
}

/**
 * Simple tokenizer using character-based heuristic
 * In production, use tiktoken or similar
 */
export function createHeuristicTokenizer(): Tokenizer {
  return {
    estimateTokens(text: string): number {
      // Rough estimate: ~4 characters per token
      return Math.ceil(text.length / 4);
    },
    estimateMessages(messages: ChatMessage[]): number {
      let total = 0;
      for (const msg of messages) {
        total += 4;
        const content = msg.content;
        if (typeof content === 'string') {
          total += this.estimateTokens(content);
        } else if (content && Array.isArray(content)) {
          const blocks = content as Array<{type: string; text?: string}>;
          for (const block of blocks) {
            if (block.type === 'text' && block.text) {
              total += this.estimateTokens(block.text);
            }
          }
        }
      }
      return total;
    }
  };
}

// ============================================================================
// Budget Computation
// ============================================================================

export function computeBudgets(
  windowTokens: number,
  budgetsPct: CephalonPolicy['context']['budgets'],
  invariants: CephalonPolicy['context']['invariants']
): ContextBudgetResult {
  let sys = Math.floor(windowTokens * budgetsPct.systemDevPct);
  let persistent = Math.floor(windowTokens * budgetsPct.persistentPct);
  let recent = Math.floor(windowTokens * budgetsPct.recentPct);

  // Related wants to be bigger than recent
  let related = Math.floor(windowTokens * budgetsPct.relatedPct);
  const minRelated = Math.floor(recent * invariants.relatedGteRecentMult);
  if (related < minRelated) {
    related = minRelated;
  }

  // Safety margin so truncation doesn't thrash
  // (Keep this modest; we already do a second-pass shrink.)
  let safety = Math.max(128, Math.floor(windowTokens * 0.03));

  // Ensure budgets don't exceed window size.
  // Prefer reducing related first (while keeping invariant), then recent, then persistent, then system.
  let total = sys + persistent + recent + related + safety;
  if (total > windowTokens) {
    let overflow = total - windowTokens;

    const relatedFloor = minRelated;
    const cutRelated = Math.min(overflow, Math.max(0, related - relatedFloor));
    related -= cutRelated;
    overflow -= cutRelated;

    const cutRecent = Math.min(overflow, Math.max(0, recent));
    recent -= cutRecent;
    overflow -= cutRecent;

    const cutPersistent = Math.min(overflow, Math.max(0, persistent));
    persistent -= cutPersistent;
    overflow -= cutPersistent;

    sys = Math.max(0, sys - overflow);
  }

  return { sys, persistent, recent, related, safety };
}


// ============================================================================
// Dedupe
// ============================================================================

export function dedupeContextItems(items: ContextItem[]): ContextItem[] {
  const seenIds = new Set<UUID>();
  const seenContent = new Set<string>();
  const out: ContextItem[] = [];
  
  for (const item of items) {
    // Skip if same memory ID
    if (seenIds.has(item.memory.id)) continue;
    seenIds.add(item.memory.id);
    
    // Skip if same normalized content
    const contentKey = item.memory.hashes.normalizedHash || item.memory.hashes.contentHash;
    if (contentKey) {
      if (seenContent.has(contentKey)) continue;
      seenContent.add(contentKey);
    }
    
    out.push(item);
  }
  
  return out;
}

// ============================================================================
// Retrieval Scoring
// ============================================================================

export function scoreMemory(
  memory: Memory,
  query: QueryEmbedding,
  policy: {
    alpha: number;
    tauDays: number;
    kindWeights: Record<string, number>;
  }
): ScoredMemory {
  // Cosine similarity
  const similarity = cosineSimilarity(query.vector, memory.embedding.vector || []);
  
  // Time decay: (1 + α * e^(-Δt/τ))
  const ageHours = (Date.now() - memory.timestamp) / (1000 * 60 * 60);
  const recencyBoost = 1 + policy.alpha * Math.exp(-ageHours / (policy.tauDays * 24));
  
  // Kind weight
  const kindWeight = policy.kindWeights[memory.kind] ?? 1.0;
  
  // Source weight
  const sourceWeight = memory.source.type === 'admin' ? 1.2 :
                       memory.source.type === 'system' ? 1.1 : 1.0;
  
  const score = similarity * recencyBoost * kindWeight * sourceWeight;
  
  return {
    memory,
    score,
    similarity,
    recencyBoost
  };
}



// ============================================================================
// Context Assembly
// ============================================================================

export interface AssembleContextParams {
  windowTokens: number;
  policy: CephalonPolicy;
  session: Session;
  currentEvent: CephalonEvent;
  tokenizer: Tokenizer;
  memoryStore: MemoryStore;
  retrieveRelated: (queries: QueryEmbedding[]) => Promise<ScoredMemory[]>;
  getBestSummaryForCluster?: (clusterId: string) => Promise<Memory | null>;
}

export async function assembleContext({
  windowTokens,
  policy,
  session,
  currentEvent,
  tokenizer,
  memoryStore,
  retrieveRelated,
  getBestSummaryForCluster
}: AssembleContextParams): Promise<AssembledContext> {
  // 1. Compute budgets
  const budgets = computeBudgets(windowTokens, policy.context.budgets, policy.context.invariants);
  
  // 2. Build headers (system/developer/session)
  const headers = buildHeaders(session, policy, currentEvent);
  const headerTokens = tokenizer.estimateMessages(headers);
  
  // 3. Select persistent (priority order)
  const persistentMemories = await memoryStore.findPinned(session.cephalonId);
  const persistentItemsInput = persistentMemories.map(m => ({
    memory: m,
    estimatedTokens: tokenizer.estimateTokens(m.content.text),
    bucket: 'persistent' as const
  }));
  const persistentItems = fitByTokens(persistentItemsInput, budgets.persistent, tokenizer);
  
  // 4. Select recent (last N)
  const recentLimit = envInt("CEPHALON_CONTEXT_RECENT_LIMIT", 500, { min: 1, max: 50_000 });
  const recentMemories = await memoryStore.findRecent(session.id, recentLimit);
  const recentItemsInput = recentMemories.map(m => ({
    memory: m,
    estimatedTokens: tokenizer.estimateTokens(m.content.text),
    bucket: 'recent' as const
  }));
  const recentItems = fitByTokens(recentItemsInput, budgets.recent, tokenizer);
  
  // 5. Build retrieval queries from current + recent
  const queries = buildQueries(currentEvent, recentItems, session, policy);
  
  // 6. Retrieve and score related
  const scoredRelated = await retrieveRelated(queries);
  const relatedItemsInput = scoredRelated.map(s => ({
    memory: s.memory,
    estimatedTokens: tokenizer.estimateTokens(s.memory.content.text),
    bucket: 'related' as const
  }));
  const relatedItems = fitByTokens(relatedItemsInput, budgets.related, tokenizer);
  
  // 7. Combine and dedupe
  let allItems = [...persistentItems, ...relatedItems, ...recentItems];
  allItems = dedupeContextItems(allItems);
  
  // 8. Shrink if over budget
  const tokenLimit = Math.max(0, windowTokens - budgets.safety - headerTokens);
  allItems = await shrinkToFit(allItems, tokenLimit, getBestSummaryForCluster, tokenizer);
  
  // 9. Build provider messages
  const providerMessages = [
    ...headers,
    ...itemsToProviderMessages(allItems)
  ];
  
  // 10. Build inclusion log
  const contextId = randomUUID();
  const inclusionLog: InclusionLog = {
    contextId,
    sessionId: session.id,
    timestamp: Date.now(),
    windowTokens,
    items: allItems.map(item => ({
      memoryId: item.memory.id,
      tokens: item.estimatedTokens,
      bucket: item.bucket
    }))
  };
  
  // Update access stats
  for (const item of allItems) {
    await memoryStore.updateAccessStats(item.memory.id, contextId);
  }
  
  const totalTokens = tokenizer.estimateMessages(providerMessages);
  
  return {
    contextId,
    messages: providerMessages,
    inclusionLog,
    totalTokens
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildHeaders(
  session: Session,
  policy: CephalonPolicy,
  currentEvent?: CephalonEvent
): Array<{ role: 'system' | 'developer'; content: string }> {
  const headers: Array<{ role: 'system' | 'developer'; content: string }> = [];

  // System header (hard-locked) - imported from prompts
  headers.push({
    role: 'system',
    content: generateSystemPrompt(session.cephalonId, currentEvent)
  });

  if (session.systemPrompt) {
    headers.push({
      role: 'system',
      content: session.systemPrompt,
    });
  }

  // Developer header (contract / safety) - imported from prompts
  headers.push({
    role: 'developer',
    content: generateDeveloperPrompt()
  });

  if (session.developerPrompt) {
    headers.push({
      role: 'developer',
      content: session.developerPrompt,
    });
  }

  // Session personality (if configured)
  if (!session.systemPrompt && session.persona) {
    headers.push({
      role: 'system',
      content: session.persona
    });
  }

  return headers;
}

/**
 * Generate entertainment persona header for tick events.
 * Cycles through 34 different Duck personas based on tick number.
 */
export function generatePersonaHeader(
  cephalonId: string,
  tickNumber: number,
  recentActivity?: Array<{ type: string; preview: string; timestamp?: number }>
): Promise<{ role: 'system'; content: string } | null> {
  // Skip if no tick number provided
  if (tickNumber < 0) {
    return Promise.resolve(null);
  }

  const normalizedId = (cephalonId || "DUCK").trim().toUpperCase();
  const botVariant = normalizedId === "OPENHAX"
    ? { emoji: "🛠️", noun: "builder", flavor: "OpenHax remix: builder/hacker voice. Keep it playful, but default to constructive, shipping energy." }
    : normalizedId === "OPENSKULL"
      ? { emoji: "💀", noun: "mystic", flavor: "OpenSkull remix: mystic/contract-bearer voice. Poetic, slightly occult, but still clear and grounded." }
    : normalizedId === "ERROR"
        ? { emoji: "⚠️", noun: "critic", flavor: "Error remix: critic/QA voice. Sharp observations, witty, fair-minded, and constructive." }
        : { emoji: "🦆", noun: "duck", flavor: "Duck mode: chaotic, meme-brained, affectionate." };

  const replaceWordPreserveCase = (
    input: string,
    pattern: RegExp,
    replacement: string,
  ): string =>
    input.replace(pattern, (match) => {
      if (match.toUpperCase() === match) return replacement.toUpperCase();
      if (match[0] && match[0].toUpperCase() === match[0]) {
        return replacement[0]?.toUpperCase() + replacement.slice(1);
      }
      return replacement.toLowerCase();
    });

  return (async () => {
    const selection = await selectEntertainmentPersona(tickNumber);
    const personaPrompt = selection.prompt;
    const personaNameRaw = selection.name;
    const formattedActivity = formatRecentActivityForPrompt(recentActivity);

    // Adapt entertainment prompts so they ADD to the existing system/developer prompts,
    // rather than redefining the agent identity.
    let content = personaPrompt.replaceAll('{recentActivity}', formattedActivity);
    const personaName = normalizedId === "DUCK"
      ? personaNameRaw
      : personaNameRaw.replace(/\bDUCK\b/g, normalizedId);

    // Light skinning for the other cephalons (3-bot variations).
    if (normalizedId !== "DUCK") {
      content = content
        .replace(/#duck-bots/gi, "the current channel")
        .replace(/🦆/g, botVariant.emoji)
        .replace(/\bDUCK\b/g, normalizedId);
      content = replaceWordPreserveCase(content, /\bduck\b/gi, botVariant.noun);
    }

    return {
      role: 'system',
      content:
        `=== ENTERTAINMENT OVERLAY (additive): ${personaName} ===\n`
        + `This is an additive style layer that works alongside other system/developer prompts, tool rules, and safety constraints.\n`
        + `Growth: If you invent a genuinely new entertainment persona seed, save it via tool self.growth, keep the save action silent, and use <cephalon:silence/> whenever silence fits.\n`
        + `GIFs: When it's actually funny and tied to recent human activity, you may use tenor.share to drop a Tenor gif reaction (it enforces cooldown + activity gating).\n`
        + `Bot flavor: ${botVariant.flavor}\n\n`
        + content,
    };
  })();
}

/**
 * Get the current persona name for logging/debugging
 */
export function getCurrentPersonaName(tickNumber: number): string {
  return getPromptName(tickNumber);
}


function fitByTokens(
  items: ContextItem[],
  budget: number,
  tokenizer: Tokenizer
): ContextItem[] {
  let total = 0;
  const result: ContextItem[] = [];
  
  for (const item of items) {
    if (total + item.estimatedTokens > budget) {
      break;
    }
    total += item.estimatedTokens;
    result.push(item);
  }
  
  return result;
}

function buildQueries(
  currentEvent: CephalonEvent,
  recentItems: ContextItem[],
  session: Session,
  policy: CephalonPolicy
): QueryEmbedding[] {
  const queries: QueryEmbedding[] = [];
  
  // Q1: Current event text
  const eventText = JSON.stringify(currentEvent.payload);
  queries.push({
    text: eventText,
    vector: []  // Would be embedded
  });
  
  // Q2: Last 1-3 recent human messages
  const recentHuman = recentItems
    .filter(item => item.memory.role === 'user')
    .slice(0, 3);
  
  for (const item of recentHuman) {
    queries.push({
      text: item.memory.content.text,
      vector: []
    });
  }
  
  // Q3: Session goal/attention focus
  if (session.attentionFocus) {
    queries.push({
      text: session.attentionFocus,
      vector: []
    });
  }
  
  return queries;
}

async function shrinkToFit(
  items: ContextItem[],
  tokenLimit: number,
  getBestSummaryForCluster: ((clusterId: string) => Promise<Memory | null>) | undefined,
  tokenizer: Tokenizer
): Promise<ContextItem[]> {
  let totalTokens = items.reduce((sum, item) => sum + item.estimatedTokens, 0);
  
  if (totalTokens <= tokenLimit) {
    return items;
  }
  
  // Step 1: Drop low-score related (never drop persistent first)
  const relatedItems = items.filter((i): i is ContextItem & { bucket: 'related' } => i.bucket === 'related');
  const otherItems = items.filter((i): i is ContextItem & { bucket: 'persistent' | 'recent' } => i.bucket !== 'related');
  
  // Sort related by score (would need score in ContextItem)
  // For now, just trim from the end
  let keptRelated = relatedItems;
  while (totalTokens > tokenLimit && keptRelated.length > 0) {
    const removed = keptRelated.pop();
    if (removed) {
      totalTokens -= removed.estimatedTokens;
    }
  }
  
  items = [...otherItems, ...keptRelated];
  
  if (totalTokens <= tokenLimit) {
    return items;
  }
  
  // Step 2: Substitute clusters with summaries (if available)
  if (getBestSummaryForCluster) {
    items = await substituteClustersWithSummaries(items, tokenLimit, getBestSummaryForCluster, tokenizer);
    totalTokens = items.reduce((sum, item) => sum + item.estimatedTokens, 0);
  }
  
  if (totalTokens <= tokenLimit) {
    return items;
  }
  
  // Step 3: Trim recent (last resort)
  const persistent = items.filter(i => i.bucket === 'persistent');
  const related = items.filter(i => i.bucket === 'related');
  const recent = items.filter(i => i.bucket === 'recent');
  
  let keptRecent = recent;
  while (totalTokens > tokenLimit && keptRecent.length > 0) {
    const removed = keptRecent.pop();
    if (removed) {
      totalTokens -= removed.estimatedTokens;
    }
  }
  
  return [...persistent, ...related, ...keptRecent];
}

async function substituteClustersWithSummaries(
  items: ContextItem[],
  tokenBudget: number,
  getBestSummaryForCluster: (clusterId: string) => Promise<Memory | null>,
  tokenizer: Tokenizer
): Promise<ContextItem[]> {
  // Group by cluster
  const clusters = new Map<string, ContextItem[]>();
  for (const item of items) {
    const cid = item.memory.cluster?.clusterId;
    if (!cid) continue;
    
    if (!clusters.has(cid)) {
      clusters.set(cid, []);
    }
    clusters.get(cid)!.push(item);
  }
  
  // Sort clusters by token impact
  const ranked = [...clusters.entries()]
    .map(([cid, clusterItems]) => ({
      cid,
      items: clusterItems,
      tokens: clusterItems.reduce((sum, i) => sum + i.estimatedTokens, 0)
    }))
    .sort((a, b) => b.tokens - a.tokens);
  
  let total = items.reduce((sum, i) => sum + i.estimatedTokens, 0);
  const replacedIds = new Set<UUID>();
  const addedSummaries: ContextItem[] = [];
  
  for (const cluster of ranked) {
    if (total <= tokenBudget) break;
    
    const summary = await getBestSummaryForCluster(cluster.cid);
    if (!summary) continue;
    
    const summaryTokens = tokenizer.estimateTokens(summary.content.text);
    const savings = cluster.tokens - summaryTokens;
    
    if (savings <= 0) continue;
    
    // Mark cluster items for replacement
    for (const item of cluster.items) {
      replacedIds.add(item.memory.id);
    }
    
    total -= savings;
    addedSummaries.push({
      memory: summary,
      estimatedTokens: summaryTokens,
      bucket: 'related'
    });
  }
  
  // Rebuild list
  const kept = items.filter(i => !replacedIds.has(i.memory.id));
  return [...kept, ...addedSummaries];
}

function itemsToProviderMessages(
  items: ContextItem[]
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  for (const item of items) {
    const role = (item.memory.role === 'user' || item.memory.role === 'assistant' 
      ? item.memory.role 
      : 'system') as 'user' | 'assistant' | 'system';

    if (item.memory.kind === 'image') {
      // Extract URL from image memory content
      const text = item.memory.content.text;
      const urlMatch = text.match(/URL:\s*([^\s\]]+)/);
      const imageUrl = urlMatch ? urlMatch[1] : '';
      const providerImageUrl = imageUrl && !isExpiredDiscordCdnImageUrl(imageUrl)
        ? imageUrl
        : '';
      
      console.log(`[ImageLogger] Processing image memory: ${imageUrl}`);
      if (imageUrl && !providerImageUrl) {
        console.log(`[ImageLogger] Skipping expired Discord CDN image URL: ${imageUrl}`);
      }

      // For now, add as text with URL reference (actual base64 loading would happen here)
      // The Ollama provider will handle fetching and encoding images
      messages.push({
        role,
        content: text,
        images: providerImageUrl ? [providerImageUrl] : []
      } as ChatMessage);
    } else {
      messages.push({
        role,
        content: item.memory.content.text
      });
    }
  }

  // [ImageLogger] Log summary
  const imageCount = items.filter(i => i.memory.kind === 'image').length;
  if (imageCount > 0) {
    console.log(`[ImageLogger] Provider messages include ${imageCount} image(s) from ${items.length} total items`);
  }

  return messages;
}

export function isExpiredDiscordCdnImageUrl(url: string, nowMs: number = Date.now()): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'cdn.discordapp.com' && hostname !== 'media.discordapp.net') {
      return false;
    }

    const expiresAtHex = parsed.searchParams.get('ex');
    if (!expiresAtHex) {
      return false;
    }

    const expiresAtSeconds = Number.parseInt(expiresAtHex, 16);
    if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= 0) {
      return false;
    }

    return expiresAtSeconds * 1000 <= nowMs;
  } catch {
    return false;
  }
}
