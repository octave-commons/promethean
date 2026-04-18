/**
 * Tenor GIF tools
 *
 * Purpose:
 * - reliably find Tenor GIF “view” URLs (Discord will embed these)
 * - optionally post them with a cooldown so we get "often enough to be funny" without spam
 */

import path from "node:path";
import { promises as fs } from "node:fs";

import type { ToolRegistryEntry, ToolDependencies } from "./types.js";
import { envInt } from "../../config/env.js";
import { getStateDir, getSelfName } from "../../peer/runtime.js";

type TenorSearchResult = {
  url: string;
};

type TenorShareState = {
  schemaVersion: 1;
  updatedAt: string;
  byChannel: Record<
    string,
    {
      lastPostedAt: number;
      recentUrls: string[];
    }
  >;
};

const TENOR_BASE = "https://tenor.com";
const STATE_FILENAME = "tenor-share-state.json";

let shareQueue: Promise<unknown> = Promise.resolve();

function isIrcTarget(channelId: string): boolean {
  return channelId.startsWith("irc:");
}

function clampInt(value: number, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function slugifyQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "gif";
  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function tenorSearchUrl(query: string): string {
  const slug = slugifyQuery(query);
  return `${TENOR_BASE}/search/${encodeURIComponent(slug)}-gifs`;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchTextWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

function extractTenorViewUrls(html: string, limit: number): TenorSearchResult[] {
  const results: TenorSearchResult[] = [];
  const seen = new Set<string>();
  const regex = /href="(\/view\/[^"]+)"/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const pathPart = decodeHtmlEntities(match[1]);
    if (!pathPart.startsWith("/view/")) continue;
    const full = `${TENOR_BASE}${pathPart}`;
    if (seen.has(full)) continue;
    seen.add(full);
    results.push({ url: full });
    if (results.length >= limit) break;
  }

  return results;
}

function statePath(): string {
  return path.join(getStateDir(), STATE_FILENAME);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readState(): Promise<TenorShareState> {
  try {
    const raw = await fs.readFile(statePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<TenorShareState>;
    if (parsed.schemaVersion !== 1 || typeof parsed.byChannel !== "object" || !parsed.byChannel) {
      return { schemaVersion: 1, updatedAt: new Date().toISOString(), byChannel: {} };
    }
    return {
      schemaVersion: 1,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      byChannel: parsed.byChannel as TenorShareState["byChannel"],
    };
  } catch {
    return { schemaVersion: 1, updatedAt: new Date().toISOString(), byChannel: {} };
  }
}

async function writeState(state: TenorShareState): Promise<void> {
  await ensureDir(getStateDir());
  const filePath = statePath();
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const json = JSON.stringify(state, null, 2) + "\n";
  await fs.writeFile(tmpPath, json, "utf-8");
  await fs.rename(tmpPath, filePath);
}

async function sendToChannel(
  deps: ToolDependencies,
  channelId: string,
  text: string,
): Promise<{ messageId?: string; channelId: string; sent: boolean; timestamp?: string }> {
  if (isIrcTarget(channelId)) {
    if (!deps.ircApiClient) {
      throw new Error("IRC client not configured");
    }
    return deps.ircApiClient.sendMessage(channelId, text);
  }

  return deps.discordApiClient.sendMessage(channelId, text);
}

async function hasRecentHumanActivity(
  deps: ToolDependencies,
  channelId: string,
  windowSeconds: number,
): Promise<boolean> {
  if (windowSeconds <= 0) return true;
  if (isIrcTarget(channelId)) {
    // IRC activity check is non-trivial here; be conservative.
    return false;
  }

  try {
    const { messages } = await deps.discordApiClient.fetchChannelMessages(channelId, { limit: 20 });
    const cutoff = Date.now() - windowSeconds * 1000;
    return messages.some((m) => !m.authorIsBot && m.timestamp.getTime() >= cutoff);
  } catch {
    // If we can't verify, skip posting to avoid spam.
    return false;
  }
}

function pickRandom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export const tenorTools: Record<string, ToolRegistryEntry> = {
  "tenor.search": {
    schema: {
      name: "tenor.search",
      description:
        "Search Tenor for GIFs and return Tenor view URLs (Discord will embed these).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (e.g. 'facepalm', 'duck dance', 'wow')",
          },
          limit: {
            type: "number",
            description: "How many Tenor view URLs to return (default: 8, max: 40)",
          },
          timeout_ms: {
            type: "number",
            description: "HTTP timeout in milliseconds (default: 12000)",
          },
        },
        required: ["query"],
      },
    },
    handler: async (args, _deps) => {
      const { query, limit = 8, timeout_ms } = args as {
        query: string;
        limit?: number;
        timeout_ms?: number;
      };

      const cappedLimit = clampInt(limit, 1, 40, 8);
      const timeoutMs = clampInt(timeout_ms ?? envInt("CEPHALON_TENOR_TIMEOUT_MS", 12000, { min: 1000, max: 120000 }), 1000, 120000, 12000);

      const url = tenorSearchUrl(query);
      console.log(`[TOOL] tenor.search: ${query} -> ${url}`);

      try {
        const html = await fetchTextWithTimeout(url, timeoutMs);
        const results = extractTenorViewUrls(html, cappedLimit);

        return {
          toolName: "tenor.search",
          success: true,
          result: {
            query,
            url,
            results,
            count: results.length,
          },
        };
      } catch (error) {
        return {
          toolName: "tenor.search",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "tenor.share": {
    schema: {
      name: "tenor.share",
      description:
        "Find a Tenor GIF (via Tenor search) and post it to the current output channel, with cooldown + recent-activity gating to prevent spam.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for the gif",
          },
          caption: {
            type: "string",
            description: "Optional caption to include before the gif URL",
          },
          cooldown_seconds: {
            type: "number",
            description: "Override cooldown in seconds (default from env)",
          },
          require_recent_human_seconds: {
            type: "number",
            description:
              "Only post if the channel has a human message within this window (default from env)",
          },
          limit: {
            type: "number",
            description: "How many Tenor results to consider (default: 12, max: 40)",
          },
        },
        required: ["query"],
      },
    },
    handler: async (args, deps) => {
      const {
        query,
        caption,
        cooldown_seconds,
        require_recent_human_seconds,
        limit = 12,
      } = args as {
        query: string;
        caption?: string;
        cooldown_seconds?: number;
        require_recent_human_seconds?: number;
        limit?: number;
      };

      const outputChannel = deps.outputChannel?.channelId
        ? deps.outputChannel
        : await deps.resolveOutputChannel?.();

      if (!outputChannel?.channelId) {
        return {
          toolName: "tenor.share",
          success: false,
          error: "No output channel available. Set an output channel first.",
        };
      }

      const channelId = outputChannel.channelId;
      const channelName = outputChannel.channelName;

      // Optional channel-name gate
      const allowRegexRaw = (process.env.CEPHALON_TENOR_CHANNEL_NAME_ALLOW_REGEX || "")
        .trim();
      if (allowRegexRaw && channelName) {
        try {
          const allow = new RegExp(allowRegexRaw, "i");
          if (!allow.test(channelName)) {
            return {
              toolName: "tenor.share",
              success: true,
              result: {
                posted: false,
                reason: "channel_not_allowed",
                channel_id: channelId,
                channel_name: channelName,
              },
            };
          }
        } catch {
          // Ignore invalid regex and proceed.
        }
      }

      const cooldownSeconds = clampInt(
        cooldown_seconds ?? envInt("CEPHALON_TENOR_COOLDOWN_SECONDS", 300, { min: 15, max: 86400 }),
        15,
        86400,
        300,
      );

      const requireRecentHumanSeconds = clampInt(
        require_recent_human_seconds ?? envInt("CEPHALON_TENOR_REQUIRE_RECENT_HUMAN_SECONDS", 900, { min: 0, max: 86400 }),
        0,
        86400,
        900,
      );

      const considerLimit = clampInt(limit, 1, 40, 12);
      const timeoutMs = envInt("CEPHALON_TENOR_TIMEOUT_MS", 12000, { min: 1000, max: 120000 });
      const recentUrlMemory = envInt("CEPHALON_TENOR_RECENT_URL_MEMORY", 25, { min: 0, max: 500 });

      const createdBy = deps.session?.cephalonId ?? getSelfName();

      return shareQueue = shareQueue.then(async () => {
        // Activity gate
        const okActivity = await hasRecentHumanActivity(deps, channelId, requireRecentHumanSeconds);
        if (!okActivity) {
          return {
            toolName: "tenor.share",
            success: true,
            result: {
              posted: false,
              reason: "no_recent_human_activity",
              channel_id: channelId,
              channel_name: channelName,
              window_seconds: requireRecentHumanSeconds,
            },
          };
        }

        const state = await readState();
        const record = state.byChannel[channelId] ?? { lastPostedAt: 0, recentUrls: [] };
        const now = Date.now();
        const elapsedSeconds = (now - record.lastPostedAt) / 1000;

        if (record.lastPostedAt > 0 && elapsedSeconds < cooldownSeconds) {
          return {
            toolName: "tenor.share",
            success: true,
            result: {
              posted: false,
              reason: "cooldown",
              channel_id: channelId,
              channel_name: channelName,
              cooldown_seconds: cooldownSeconds,
              retry_after_seconds: Math.ceil(cooldownSeconds - elapsedSeconds),
            },
          };
        }

        const searchUrl = tenorSearchUrl(query);
        console.log(`[TOOL] tenor.share: searching ${searchUrl} (channel ${channelId})`);

        const html = await fetchTextWithTimeout(searchUrl, timeoutMs);
        const results = extractTenorViewUrls(html, considerLimit);

        const recentSet = new Set(record.recentUrls);
        const fresh = results.filter((r) => !recentSet.has(r.url));
        const chosen = pickRandom(fresh.length ? fresh : results);
        if (!chosen) {
          return {
            toolName: "tenor.share",
            success: false,
            error: "Tenor search returned no results",
          };
        }

        const textParts = [
          typeof caption === "string" && caption.trim() ? caption.trim() : "",
          chosen.url,
        ].filter(Boolean);
        const messageText = textParts.join("\n");

        const sent = await sendToChannel(deps, channelId, messageText);

        // Update state
        record.lastPostedAt = now;
        if (recentUrlMemory > 0) {
          record.recentUrls = [...record.recentUrls, chosen.url].slice(-recentUrlMemory);
        }
        state.byChannel[channelId] = record;
        state.updatedAt = new Date().toISOString();
        await writeState(state);

        return {
          toolName: "tenor.share",
          success: true,
          result: {
            posted: true,
            query,
            url: chosen.url,
            channel_id: channelId,
            channel_name: channelName,
            by: createdBy,
            messageId: sent.messageId,
            timestamp: sent.timestamp,
          },
        };
      }) as Promise<any>;
    },
  },
};
