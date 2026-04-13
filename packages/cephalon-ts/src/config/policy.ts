/**
 * Policy loader for Cephalon
 * 
 * Loads and validates EDN policy files
 */

import { readFile } from 'fs/promises';
import { parseEDNString } from 'edn-data';
import { envInt } from "./env.js";
import type {
  CephalonPolicy,
  ModelConfig,
  ContextPolicy,
  NormalizePolicy,
  DedupePolicy,
  ChannelPolicy,
  CompactionPolicy,
  SpamPolicy,
  JanitorPolicy,
  LocksPolicy,
  SummaryPolicy,
  GroupingPolicy,
  AccessPolicy,
  MemoryKind
} from '../types/index.js';

/**
 * Parse volatile rewrites from EDN format
 */
function parseVolatileRewrites(ednRewrites: unknown[]): Array<[string, string]> {
  return ednRewrites.map((rewrite) => {
    if (!Array.isArray(rewrite) || rewrite.length !== 2) {
      throw new Error('Invalid volatile rewrite format');
    }
    const [pattern, replacement] = rewrite;
    if (typeof pattern !== 'string' || typeof replacement !== 'string') {
      throw new Error('Volatile rewrite must be [string, string]');
    }
    return [pattern, replacement];
  });
}

/**
 * Parse channel policies from EDN
 */
function parseChannelPolicies(ednChannels: Record<string, unknown>): Record<string, ChannelPolicy> {
  const channels: Record<string, ChannelPolicy> = {};
  
  for (const [channelId, config] of Object.entries(ednChannels)) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(`Invalid channel config for ${channelId}`);
    }
    
    const cfg = config as Record<string, unknown>;
    channels[channelId] = {
      name: String(cfg.name || 'unnamed'),
      embedRawBotMessages: Boolean(cfg['embed-raw-bot-messages?']),
      embedAggregates: Boolean(cfg['embed-aggregates?'])
    };
  }
  
  return channels;
}

/**
 * Parse locks policy from EDN
 */
function parseLocksPolicy(ednLocks: Record<string, unknown>): LocksPolicy {
  const neverDeleteKinds = new Set<MemoryKind>();
  const neverDeleteTags = new Set<string>();
  
  if (ednLocks['never-delete-kinds']) {
    const kinds = ednLocks['never-delete-kinds'] as string[];
    for (const kind of kinds) {
      neverDeleteKinds.add(kind as MemoryKind);
    }
  }
  
  if (ednLocks['never-delete-tags']) {
    const tags = ednLocks['never-delete-tags'] as string[];
    for (const tag of tags) {
      neverDeleteTags.add(tag);
    }
  }
  
  return { neverDeleteKinds, neverDeleteTags };
}

/**
 * Parse summary policy from EDN
 */
function parseSummaryPolicy(ednSummary: Record<string, unknown>): SummaryPolicy {
  return {
    format: 'json_v1',
    maxBullets: Number(ednSummary['max-bullets'] || 25),
    maxPatterns: Number(ednSummary['max-patterns'] || 10),
    indexSummary: Boolean(ednSummary['index-summary?'])
  };
}

/**
 * Parse grouping policy from EDN
 */
function parseGroupingPolicy(ednGrouping: Record<string, unknown>): GroupingPolicy {
  const by = (ednGrouping.by as string[] || []).map(s => 
    s.replace(':', '-').replace('channel-id', 'channel-id') as 'channel-id' | 'day' | 'thread'
  );
  
  return {
    by,
    maxSourceCount: Number(ednGrouping['max-source-count'] || 200),
    maxSourceTokens: Number(ednGrouping['max-source-tokens'] || 60000)
  };
}

/**
 * Parse access policy from EDN
 */
function parseAccessPolicy(ednAccess: Record<string, unknown>): AccessPolicy {
  return {
    tauDays: Number(ednAccess['tau-days'] || 21),
    threshold: Number(ednAccess.threshold || 0.8)
  };
}

/**
 * Parse compaction policy from EDN
 */
function parseCompactionPolicy(ednCompaction: Record<string, unknown>): CompactionPolicy {
  return {
    intervalMinutes: Number(ednCompaction['interval-minutes'] || 360),
    ageMinDays: Number(ednCompaction['age-min-days'] || 14),
    access: parseAccessPolicy(ednCompaction.access as Record<string, unknown>),
    grouping: parseGroupingPolicy(ednCompaction.grouping as Record<string, unknown>),
    summary: parseSummaryPolicy(ednCompaction.summary as Record<string, unknown>),
    locks: parseLocksPolicy(ednCompaction.locks as Record<string, unknown>)
  };
}

/**
 * Parse spam policy from EDN
 */
function parseSpamPolicy(ednSpam: Record<string, unknown>): SpamPolicy {
  const dedupe = ednSpam.dedupe as Record<string, unknown>;
  const channels = ednSpam.channels as Record<string, Record<string, unknown>>;
  
  const spamChannels: Record<string, { embedAggregates: boolean; embedRawBotMessages: boolean }> = {};
  
  for (const [channelId, config] of Object.entries(channels)) {
    spamChannels[channelId] = {
      embedAggregates: Boolean(config['embed-aggregates?']),
      embedRawBotMessages: Boolean(config['embed-raw-bot-messages?'])
    };
  }
  
  return {
    dedupe: {
      exactTtlSeconds: Number(dedupe['exact-ttl-seconds'] || 3600),
      nearWindowSeconds: Number(dedupe['near-window-seconds'] || 600),
      simhashHammingThreshold: Number(dedupe['simhash-hamming-threshold'] || 6),
      aggregateBotDupes: Boolean(dedupe['aggregate-bot-dupes?'])
    },
    channels: spamChannels
  };
}

/**
 * Parse janitor policy from EDN
 */
function parseJanitorPolicy(ednJanitor: Record<string, unknown>): JanitorPolicy {
  return {
    enabled: Boolean(ednJanitor['enabled?']),
    reportChannelId: String(ednJanitor['report-channel-id'] || ''),
    reportIntervalMinutes: Number(ednJanitor['report-interval-minutes'] || 60),
    maxActionsPerHour: Number(ednJanitor['max-actions-per-hour'] || 20),
    proposeSuppressRules: Boolean(ednJanitor['propose-suppress-rules?'])
  };
}

/**
 * Parse model config from EDN
 */
function parseModelConfig(ednModel: Record<string, unknown>): ModelConfig {
  return {
    name: String(ednModel.name),
    maxContextTokens: Number(ednModel['max-context-tokens']),
    toolCallStrict: Boolean(ednModel['tool-call-strict?'])
  };
}

/**
 * Parse context policy from EDN
 */
function parseContextPolicy(ednContext: Record<string, unknown>): ContextPolicy {
  const budgets = ednContext.budgets as Record<string, number>;
  const invariants = ednContext.invariants as Record<string, unknown>;
  
  return {
    budgets: {
      systemDevPct: budgets['system-dev-pct'] || 0.06,
      persistentPct: budgets['persistent-pct'] || 0.08,
      recentPct: budgets['recent-pct'] || 0.18,
      relatedPct: budgets['related-pct'] || 0.42
    },
    invariants: {
      relatedGteRecentMult: Number(invariants['related-gte-recent-mult'] || 1.6),
      dedupeWithinContext: Boolean(invariants['dedupe-within-context?'])
    }
  };
}

/**
 * Parse normalize policy from EDN
 */
function parseNormalizePolicy(ednNormalize: Record<string, unknown>): NormalizePolicy {
  return {
    volatileRewrites: parseVolatileRewrites((ednNormalize['volatile-rewrites'] || []) as unknown[]),
    stripTrackingParams: Boolean(ednNormalize['strip-tracking-params?'])
  };
}

/**
 * Parse dedupe policy from EDN
 */
function parseDedupePolicy(ednDedupe: Record<string, unknown>): DedupePolicy {
  return {
    exactTtlSeconds: Number(ednDedupe['exact-ttl-seconds'] || 3600),
    nearWindowSeconds: Number(ednDedupe['near-window-seconds'] || 600),
    simhashHammingThreshold: Number(ednDedupe['simhash-hamming-threshold'] || 6),
    aggregateBotDupes: Boolean(ednDedupe['aggregate-bot-dupes?'])
  };
}

/**
 * Load and parse policy from EDN file
 */
export async function loadPolicy(path: string): Promise<CephalonPolicy> {
  const content = await readFile(path, 'utf-8');
  const edn = parseEDNString(content) as Record<string, unknown>;
  
  const models = edn.models as Record<string, unknown>;
  const context = edn.context as Record<string, unknown>;
  const normalize = edn.normalize as Record<string, unknown>;
  const dedupe = edn.dedupe as Record<string, unknown>;
  const channels = edn.channels as Record<string, unknown>;
  const compaction = edn.compaction as Record<string, unknown>;
  const spam = edn.spam as Record<string, unknown>;
  const janitor = edn.janitor as Record<string, unknown>;
  
  return {
    models: {
      actor: {
        name: 'qwen3.5:4b-q8_0',
        maxContextTokens: 131072
      },
      fallbacks: []
    },
    context: parseContextPolicy(context),
    normalize: parseNormalizePolicy(normalize),
    dedupe: parseDedupePolicy(dedupe),
    channels: parseChannelPolicies(channels),
    compaction: parseCompactionPolicy(compaction),
    spam: parseSpamPolicy(spam),
    janitor: parseJanitorPolicy(janitor),
    output: {
      preventFeedbackLoops: true,
      ignoredAuthorIds: []
    }
  };
}

/**
 * Load default policy
 */
export function loadDefaultPolicy(): CephalonPolicy {
  // Check for GLM model override from environment
  const glmModel = process.env.GLM_MODEL || process.env.ZAI_MODEL;
  const maxContextTokens = envInt("CEPHALON_MAX_CONTEXT_TOKENS", 131072, {
    min: 1024,
    max: 10_000_000,
  });

  return {
    models: {
      actor: {
        name: glmModel || 'qwen3.5:4b-q8_0',
        maxContextTokens,
        toolCallStrict: true
      },
      fallbacks: []
    },
    context: {
      budgets: {
        systemDevPct: 0.06,
        persistentPct: 0.08,
        recentPct: 0.18,
        relatedPct: 0.42
      },
      invariants: {
        relatedGteRecentMult: 1.6,
        dedupeWithinContext: true
      }
    },
    normalize: {
      volatileRewrites: [
        ['\\b\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?\\b', '<ts>'],
        ['\\b\\d{1,2}:\\d{2}(:\\d{2})?\\s?(AM|PM)?\\b', '<time>'],
        ['\\b\\d{15,}\\b', '<id>'],
        ['\\b[0-9a-f]{7,}\\b', '<hex>']
      ],
      stripTrackingParams: true
    },
    dedupe: {
      exactTtlSeconds: 3600,
      nearWindowSeconds: 600,
      simhashHammingThreshold: 6,
      aggregateBotDupes: true
    },
    channels: {
      '343299242963763200': {
        name: 'bots',
        embedRawBotMessages: false,
        embedAggregates: true
      },
      '450688080542695436': {
        name: 'duck-bots',
        embedRawBotMessages: true,
        embedAggregates: true
      },
      '343179912196128792': {
        name: 'general',
        embedRawBotMessages: false,
        embedAggregates: true
      },
      '367156652140658699': {
        name: 'memes',
        embedRawBotMessages: false,
        embedAggregates: true
      }
    },
    compaction: {
      intervalMinutes: 360,
      ageMinDays: 14,
      access: {
        tauDays: 21,
        threshold: 0.8
      },
      grouping: {
        by: ['channel-id', 'day'],
        maxSourceCount: 200,
        maxSourceTokens: 60000
      },
      summary: {
        format: 'json_v1',
        maxBullets: 25,
        maxPatterns: 10,
        indexSummary: true
      },
      locks: {
        neverDeleteKinds: new Set(['system', 'developer', 'admin', 'summary', 'aggregate']),
        neverDeleteTags: new Set(['pinned', 'critical'])
      }
    },
    spam: {
      dedupe: {
        exactTtlSeconds: 3600,
        nearWindowSeconds: 600,
        simhashHammingThreshold: 6,
        aggregateBotDupes: true
      },
      channels: {
        '367156652140658699': {
          embedAggregates: true,
          embedRawBotMessages: false
        },
        '343299242963763200': {
          embedAggregates: true,
          embedRawBotMessages: false
        }
      }
    },
    janitor: {
      enabled: true,
      reportChannelId: '450688080542695436',
      reportIntervalMinutes: 60,
      maxActionsPerHour: 20,
      proposeSuppressRules: true
    },
    output: {
      defaultChannelId: '450688080542695436',
      preventFeedbackLoops: true,
      ignoredAuthorIds: []
    }
  };
}
