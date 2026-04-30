import type { Session, DiscordMessagePayload } from "../types/index.js";
import { scoreSentiment } from "./sentiment.js";

export interface ChannelCandidate {
  id: string;
  name: string;
  guildId: string;
  type: string;
}

export interface ChannelSelection {
  channelId: string;
  channelName?: string;
  serverName?: string;
  reason: string;
  mode: "auto" | "manual";
  setAt: number;
}

interface ChannelStats {
  pheromone: number;
  lastActivityAt: number;
  mentions: number;
  visits: number;
  /** Running sentiment about the bot in this channel (roughly -1..+1). */
  reception: number;
  lastReceptionAt: number;
}

interface SessionRoutingState {
  channelId: string | null;
  channelName?: string;
  serverName?: string;
  mode: "auto" | "manual";
  setAt: number;
  manualTurnsRemaining: number;
  visitHistory: string[];
}

interface BotSpeechRecord {
  sessionId: string;
  channelId: string;
  timestamp: number;
}

const PHEROMONE_DECAY = 0.92;
const MAX_HISTORY = 8;
const MANUAL_OVERRIDE_TURNS = 5;
const HOME_CHANNEL_BOOST = 4.5;
const CLUMP_PENALTY_BASE = 1.4;
const STAY_PENALTY_BASE = 0.85;
const BASE_NOISE_AMPLITUDE = 0.08;
const MAX_NOISE_AMPLITUDE = 1.6;
const NOISE_BUCKET_MS = 45_000;
const RECEPTION_DECAY = 0.92;
const RECEPTION_GAIN_REPLY = 0.55;
const RECEPTION_GAIN_MENTION = 0.22;
const BOT_SPEECH_TTL_MS = 35 * 60_000;

function deterministicNoise(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 0xffffffff) * 2 - 1;
}

export class ChannelAcoRouter {
  private channelStats = new Map<string, ChannelStats>();
  private sessionState = new Map<string, SessionRoutingState>();
  private recentBotMessages = new Map<string, BotSpeechRecord>();

  private pruneBotMessages(now = Date.now()): void {
    for (const [messageId, record] of this.recentBotMessages.entries()) {
      if (now - record.timestamp > BOT_SPEECH_TTL_MS) {
        this.recentBotMessages.delete(messageId);
      }
    }
  }

  private getAutoOccupancy(excludeSessionId?: string): {
    counts: Map<string, number>;
    autoSessions: number;
    clumpRatio: number;
  } {
    const counts = new Map<string, number>();
    let autoSessions = 0;

    for (const [sessionId, state] of this.sessionState.entries()) {
      if (sessionId === excludeSessionId) continue;
      if (!state.channelId || state.mode !== "auto") continue;
      autoSessions += 1;
      counts.set(state.channelId, (counts.get(state.channelId) ?? 0) + 1);
    }

    const maxOccupancy = Array.from(counts.values()).reduce((max, value) => Math.max(max, value), 0);
    const clumpRatio = autoSessions > 0 ? maxOccupancy / autoSessions : 0;
    return { counts, autoSessions, clumpRatio };
  }

  observeMessage(payload: DiscordMessagePayload): void {
    this.pruneBotMessages(payload.timestamp ?? Date.now());
    const stats = this.getChannelStats(payload.channelId);
    stats.lastActivityAt = payload.timestamp ?? Date.now();
    stats.pheromone = stats.pheromone * PHEROMONE_DECAY + 1.5;
    if (payload.mentionsCephalon) {
      stats.mentions += 1;
      stats.pheromone += 2.5;
    }

    // Reception tracking: only when humans are responding to the bot.
    const replyTo = payload.replyTo ?? null;
    const repliedToBot = replyTo ? this.recentBotMessages.has(replyTo) : false;
    const mentionedBot = Boolean(payload.mentionsCephalon);

    if (repliedToBot || mentionedBot) {
      const { score } = scoreSentiment(payload.content || "");
      const gain = repliedToBot ? RECEPTION_GAIN_REPLY : RECEPTION_GAIN_MENTION;
      stats.reception = stats.reception * RECEPTION_DECAY + score * gain;
      stats.lastReceptionAt = payload.timestamp ?? Date.now();

      // Light coupling: harsh negative reception should reduce future pheromone.
      if (score < -0.4) {
        stats.pheromone = Math.max(0.05, stats.pheromone * 0.72);
      }
    }
  }

  recordSpeech(sessionId: string, channelId: string): void {
    const stats = this.getChannelStats(channelId);
    stats.visits += 1;
    stats.pheromone = Math.max(0.15, stats.pheromone * 0.55);

    const state = this.sessionState.get(sessionId) ?? {
      channelId,
      mode: "auto",
      setAt: Date.now(),
      manualTurnsRemaining: 0,
      visitHistory: [],
    };
    state.channelId = channelId;
    state.setAt = Date.now();
    state.visitHistory = [channelId, ...state.visitHistory.filter((id) => id !== channelId)].slice(0, MAX_HISTORY);
    this.sessionState.set(sessionId, state);
  }

  recordSpeechMessage(sessionId: string, channelId: string, messageId: string): void {
    const now = Date.now();
    this.pruneBotMessages(now);
    this.recentBotMessages.set(messageId, { sessionId, channelId, timestamp: now });
    this.recordSpeech(sessionId, channelId);
  }

  setManualChannel(
    sessionId: string,
    channelId: string,
    channelName?: string,
    serverName?: string,
  ): void {
    const state = this.sessionState.get(sessionId) ?? {
      channelId,
      mode: "manual",
      setAt: Date.now(),
      manualTurnsRemaining: MANUAL_OVERRIDE_TURNS,
      visitHistory: [],
    };

    state.channelId = channelId;
    state.channelName = channelName;
    state.serverName = serverName;
    state.mode = "manual";
    state.setAt = Date.now();
    state.manualTurnsRemaining = MANUAL_OVERRIDE_TURNS;
    state.visitHistory = [channelId, ...state.visitHistory.filter((id) => id !== channelId)].slice(0, MAX_HISTORY);
    this.sessionState.set(sessionId, state);
  }

  getCurrentSelection(sessionId: string): ChannelSelection | null {
    const state = this.sessionState.get(sessionId);
    if (!state?.channelId) return null;
    return {
      channelId: state.channelId,
      channelName: state.channelName,
      serverName: state.serverName,
      reason: state.mode === "manual" ? "manual override" : "auto ant routing",
      mode: state.mode,
      setAt: state.setAt,
    };
  }

  noteTurn(sessionId: string): void {
    const state = this.sessionState.get(sessionId);
    if (!state || state.mode !== "manual") return;
    state.manualTurnsRemaining = Math.max(0, state.manualTurnsRemaining - 1);
    if (state.manualTurnsRemaining === 0) {
      state.mode = "auto";
    }
  }

  chooseChannel(
    session: Session,
    channels: ChannelCandidate[],
    options?: { semanticWeights?: Map<string, number> },
  ): ChannelSelection | null {
    if (channels.length === 0) return null;

    const state = this.sessionState.get(session.id);
    if (state?.channelId && state.mode === "manual" && state.manualTurnsRemaining > 0) {
      return {
        channelId: state.channelId,
        channelName: state.channelName,
        serverName: state.serverName,
        reason: `manual override (${state.manualTurnsRemaining} turn(s) remaining)`,
        mode: "manual",
        setAt: state.setAt,
      };
    }

    const hints = new Set((session.defaultChannelHints ?? []).map((hint) => hint.toLowerCase()));
    const visitHistory = state?.visitHistory ?? [];
    const occupancy = this.getAutoOccupancy(session.id);

    let best: { channel: ChannelCandidate; score: number; reason: string } | null = null;
    const now = Date.now();
    const noiseAmplitude = Math.min(
      MAX_NOISE_AMPLITUDE,
      BASE_NOISE_AMPLITUDE + Math.max(0, occupancy.clumpRatio - 0.34) * 2.4,
    );

    for (const channel of channels) {
      const stats = this.getChannelStats(channel.id);
      const name = channel.name.toLowerCase();
      const semanticWeight = options?.semanticWeights?.get(channel.id) ?? 0;
      const semanticBoost = semanticWeight > 0
        ? Math.log1p(semanticWeight * 50) * 2.4
        : 0;

      const receptionBoost = stats.reception * 3.2;
      const hintBoost = Array.from(hints).some((hint) => name.includes(hint)) ? 3 : 0;
      const mentionBoost = stats.mentions * 0.6;
      const freshnessBoost = stats.lastActivityAt > 0 ? Math.max(0, 2 - (now - stats.lastActivityAt) / 600_000) : 0;
      const visitIndex = visitHistory.indexOf(channel.id);
      const noveltyPenalty = visitIndex >= 0
        ? (MAX_HISTORY - visitIndex) * (1.25 + occupancy.clumpRatio * 0.9)
        : 0;
      const homeBoost = session.homeChannelId === channel.id ? HOME_CHANNEL_BOOST : 0;
      const clumpCount = occupancy.counts.get(channel.id) ?? 0;
      const clumpPenalty = clumpCount > 0
        ? clumpCount * (CLUMP_PENALTY_BASE + occupancy.clumpRatio * 3)
        : 0;
      const stayPenalty = state?.channelId === channel.id && state.mode === "auto"
        ? STAY_PENALTY_BASE + occupancy.clumpRatio * 1.5
        : 0;
      const noise = deterministicNoise(
        `${session.id}:${session.circuitIndex ?? "x"}:${channel.id}:${Math.floor(now / NOISE_BUCKET_MS)}:${visitHistory.length}`,
      ) * noiseAmplitude;
      const score =
        stats.pheromone +
        semanticBoost +
        receptionBoost +
        hintBoost +
        mentionBoost +
        freshnessBoost +
        homeBoost +
        noise -
        noveltyPenalty -
        clumpPenalty -
        stayPenalty;
      const reason = `pheromone=${stats.pheromone.toFixed(2)} semantic=${semanticBoost.toFixed(2)} reception=${receptionBoost.toFixed(2)} hint=${hintBoost.toFixed(2)} home=${homeBoost.toFixed(2)} mentions=${mentionBoost.toFixed(2)} freshness=${freshnessBoost.toFixed(2)} noise=${noise.toFixed(2)} clumpPenalty=${clumpPenalty.toFixed(2)} stayPenalty=${stayPenalty.toFixed(2)} noveltyPenalty=${noveltyPenalty.toFixed(2)} clumpRatio=${occupancy.clumpRatio.toFixed(2)}`;
      if (!best || score > best.score) {
        best = { channel, score, reason };
      }
    }

    if (!best) return null;

    const selection: ChannelSelection = {
      channelId: best.channel.id,
      channelName: best.channel.name,
      serverName: best.channel.guildId,
      reason: best.reason,
      mode: "auto",
      setAt: Date.now(),
    };

    this.sessionState.set(session.id, {
      channelId: selection.channelId,
      channelName: selection.channelName,
      serverName: selection.serverName,
      mode: "auto",
      setAt: selection.setAt,
      manualTurnsRemaining: 0,
      visitHistory: [selection.channelId, ...visitHistory.filter((id) => id !== selection.channelId)].slice(0, MAX_HISTORY),
    });

    return selection;
  }

  describeTopChannels(limit = 5): Array<{ channelId: string; pheromone: number; reception: number; mentions: number; visits: number; lastActivityAt: number }> {
    return Array.from(this.channelStats.entries())
      .map(([channelId, stats]) => ({ channelId, pheromone: stats.pheromone, reception: stats.reception, mentions: stats.mentions, visits: stats.visits, lastActivityAt: stats.lastActivityAt }))
      .sort((a, b) => b.pheromone - a.pheromone)
      .slice(0, limit);
  }

  private getChannelStats(channelId: string): ChannelStats {
    const existing = this.channelStats.get(channelId);
    if (existing) return existing;
    const created: ChannelStats = {
      pheromone: 0.5,
      lastActivityAt: 0,
      mentions: 0,
      visits: 0,
      reception: 0,
      lastReceptionAt: 0,
    };
    this.channelStats.set(channelId, created);
    return created;
  }
}
