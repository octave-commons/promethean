# Daily Briefing Renderer — Spec

> *Good morning, Hormuz. Here's what moved while you slept.*

---

## Purpose

Transform the Threat Radar's latest daily snapshot into a human-readable "Good Morning Hormuz" briefing — published to Discord, Bluesky, or other channels via the social-publish skills.

---

## Conceptual Model

```
┌─────────────────────────────────────────────────────────────┐
│                     DAILY BRIEFING                           │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Daily       │───►│   Briefing  │───►│   Output    │      │
│  │ Snapshot    │    │   Renderer  │    │   Channels  │      │
│  │ (radar-core)│    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Signals     │    │   Template   │    │   Discord   │      │
│  │ Branches    │    │   Engine     │    │   Bluesky   │      │
│  │ Disagreement│    │              │    │   Email     │      │
│  │ Evidence    │    │              │    │   Web UI    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
│  Output formats:                                              │
│  - Discord embed (rich)                                      │
│  - Bluesky thread (concise)                                  │
│  - Email (detailed)                                          │
│  - Web UI (interactive)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Daily Snapshot** = Sealed, immutable snapshot from `radar_seal_daily_snapshot`.

**Briefing Renderer** = Template engine that transforms signals/branches into human text.

**Output Channels** = Discord, Bluesky, email, web UI.

---

## Input: Daily Snapshot

### From `radar-core` (Already Exists)

```typescript
export interface ReducedSnapshot {
  id: string;
  radar_id: string;
  module_version_id: string;
  snapshot_kind: "live" | "daily";
  as_of_utc: string;              // ISO timestamp
  signals: Record<string, ReducedSignal>;
  branches: ReducedBranch[];
  model_count: number;
  disagreement_index: number;    // 0-1, higher = more disagreement
  quality_score: number;          // 0+, higher = better
  render_state: Record<string, unknown>;
}

export interface ReducedSignal {
  median: number;                // 0-4 scale
  range: [number, number];        // [low, high] quantiles
  agreement: number;             // 0-1, higher = more agreement
  sample_size: number;           // Number of model submissions
  weighted_values: Array<{ value: number; weight: number; model_id: string }>;
}

export interface ReducedBranch {
  name: string;
  support: "very_low" | "low" | "moderate" | "high" | "very_high";
  agreement: number;
  sample_size: number;
  triggers: string[];
}
```

---

## Output: Briefing Structure

### Briefing Content Model

```typescript
export interface DailyBriefing {
  radar_id: string;
  radar_name: string;
  as_of: string;                  // ISO timestamp
  as_of_human: string;            // "Monday, March 24, 2025"

  // Executive summary (1-2 sentences)
  summary: BriefingSummary;

  // Signal highlights (what changed)
  signals: BriefingSignal[];

  // Branch probabilities (what might happen)
  branches: BriefingBranch[];

  // Notable items
  items: BriefingItem[];

  // Metadata
  metadata: BriefingMetadata;
}

export interface BriefingSummary {
  headline: string;               // "Transit flow degraded, attack tempo elevated"
  sentiment: "calm" | "elevated" | "critical";
  key_changes: string[];          // ["Transit flow dropped to degraded", "Attack tempo rose to impaired"]
}

export interface BriefingSignal {
  id: string;
  label: string;
  value: number;                   // 0-4
  value_label: string;             // "normal", "stressed", "degraded", "impaired", "broken"
  previous_value?: number;        // From yesterday's snapshot
  change?: number;                 // Delta from previous
  trend: "improving" | "stable" | "declining" | "unknown";
  agreement: number;              // 0-1
  reason: string;                  // Top reason from model
}

export interface BriefingBranch {
  id: string;
  label: string;
  support: "very_low" | "low" | "moderate" | "high" | "very_high";
  support_percent: number;         // 0-100
  triggers: string[];
}

export interface BriefingItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string;
  relevance: number;              // 0-1
  signals: string[];              // Signal IDs this item affects
}

export interface BriefingMetadata {
  model_count: number;
  source_count: number;
  disagreement_index: number;
  quality_score: number;
  generated_at: string;
}
```

---

## Template Engine

### Signal Value Labels

```typescript
export const SIGNAL_SCALE_LABELS: Record<number, string> = {
  0: "normal",
  1: "stressed",
  2: "degraded",
  3: "impaired",
  4: "broken",
};

export const SIGNAL_TREND_LABELS: Record<string, string> = {
  improving: "↓ improving",
  stable: "→ stable",
  declining: "↑ worsening",
  unknown: "? unknown",
};

export const BRANCH_SUPPORT_LABELS: Record<string, string> = {
  very_low: "very unlikely",
  low: "unlikely",
  moderate: "possible",
  high: "likely",
  very_high: "very likely",
};

export const SENTIMENT_THRESHOLDS = {
  calm: { max_signal: 1.5, max_change: 0.3 },
  elevated: { max_signal: 2.5, max_change: 0.7 },
  critical: { max_signal: 4.0, max_change: 1.5 },
};
```

### Renderer Class

```typescript
export class DailyBriefingRenderer {
  constructor(
    private radar: Radar,
    private moduleVersion: RadarModuleVersion,
    private previousSnapshot?: ReducedSnapshot
  ) {}

  render(snapshot: ReducedSnapshot, items: BriefingItem[]): DailyBriefing {
    return {
      radar_id: snapshot.radar_id,
      radar_name: this.radar.name,
      as_of: snapshot.as_of_utc,
      as_of_human: this.formatDate(snapshot.as_of_utc),
      summary: this.renderSummary(snapshot, items),
      signals: this.renderSignals(snapshot),
      branches: this.renderBranches(snapshot),
      items: items.slice(0, 10), // Top 10 items
      metadata: {
        model_count: snapshot.model_count,
        source_count: items.length,
        disagreement_index: snapshot.disagreement_index,
        quality_score: snapshot.quality_score,
        generated_at: new Date().toISOString(),
      },
    };
  }

  private renderSummary(snapshot: ReducedSnapshot, items: BriefingItem[]): BriefingSummary {
    const signals = Object.entries(snapshot.signals);
    const maxSignal = Math.max(...signals.map(([_, s]) => s.median));
    const maxChange = this.maxSignalChange(signals);

    const sentiment = this.classifySentiment(maxSignal, maxChange);
    const keyChanges = this.extractKeyChanges(signals);

    const headline = this.generateHeadline(signals, sentiment);

    return { headline, sentiment, key_changes: keyChanges };
  }

  private renderSignals(snapshot: ReducedSnapshot): BriefingSignal[] {
    return Object.entries(snapshot.signals).map(([id, signal]) => {
      const def = this.moduleVersion.signal_definitions.find(d => d.id === id);
      const previous = this.previousSnapshot?.signals[id];

      return {
        id,
        label: def?.label ?? id,
        value: signal.median,
        value_label: SIGNAL_SCALE_LABELS[Math.round(signal.median)] ?? "unknown",
        previous_value: previous?.median,
        change: previous ? signal.median - previous.median : undefined,
        trend: this.classifyTrend(signal, previous),
        agreement: signal.agreement,
        reason: this.extractTopReason(id, signal),
      };
    });
  }

  private renderBranches(snapshot: ReducedSnapshot): BriefingBranch[] {
    return snapshot.branches.map(branch => {
      const def = this.moduleVersion.branch_definitions.find(d => d.id === branch.name);
      return {
        id: branch.name,
        label: def?.label ?? branch.name,
        support: branch.support,
        support_percent: this.supportToPercent(branch.support),
        triggers: branch.triggers,
      };
    });
  }

  private maxSignalChange(signals: [string, ReducedSignal][]): number {
    if (!this.previousSnapshot) return 0;
    return Math.max(
      ...signals.map(([id, signal]) => {
        const prev = this.previousSnapshot?.signals[id];
        return prev ? Math.abs(signal.median - prev.median) : 0;
      })
    );
  }

  private classifySentiment(maxSignal: number, maxChange: number): "calm" | "elevated" | "critical" {
    if (maxSignal >= 3 || maxChange >= 1.0) return "critical";
    if (maxSignal >= 1.5 || maxChange >= 0.5) return "elevated";
    return "calm";
  }

  private classifyTrend(signal: ReducedSignal, previous?: ReducedSignal): "improving" | "stable" | "declining" | "unknown" {
    if (!previous) return "unknown";
    const delta = signal.median - previous.median;
    if (Math.abs(delta) < 0.3) return "stable";
    return delta > 0 ? "declining" : "improving"; // Higher = worse
  }

  private extractKeyChanges(signals: [string, ReducedSignal][]): string[] {
    const changes: string[] = [];
    for (const [id, signal] of signals) {
      const prev = this.previousSnapshot?.signals[id];
      if (prev && Math.abs(signal.median - prev.median) >= 0.5) {
        const def = this.moduleVersion.signal_definitions.find(d => d.id === id);
        const label = def?.label ?? id;
        const direction = signal.median > prev.median ? "rose to" : "dropped to";
        changes.push(`${label} ${direction} ${SIGNAL_SCALE_LABELS[Math.round(signal.median)]}`);
      }
    }
    return changes;
  }

  private generateHeadline(signals: [string, ReducedSignal][], sentiment: string): string {
    const degraded = signals.filter(([_, s]) => s.median >= 2).map(([id, _]) => {
      const def = this.moduleVersion.signal_definitions.find(d => d.id === id);
      return def?.label?.toLowerCase() ?? id;
    });

    if (degraded.length === 0) return "All systems nominal";
    if (degraded.length === 1) return `${degraded[0].charAt(0).toUpperCase() + degraded[0].slice(1)} ${SIGNAL_SCALE_LABELS[Math.round(Math.max(...signals.map(([_, s]) => s.median)))]}`;
    return `${degraded.slice(0, -1).join(", ")} and ${degraded[degraded.length - 1]} degraded`;
  }

  private supportToPercent(support: string): number {
    const map: Record<string, number> = {
      very_low: 10,
      low: 25,
      moderate: 50,
      high: 75,
      very_high: 90,
    };
    return map[support] ?? 50;
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private extractTopReason(id: string, signal: ReducedSignal): string {
    // TODO: Extract from model submissions
    return `Based on ${signal.sample_size} model assessments`;
  }
}
```

---

## Output Formats

### Discord Embed

```typescript
export function briefingToDiscord(briefing: DailyBriefing): DiscordMessage {
  const colorMap = {
    calm: 0x00FF00,      // Green
    elevated: 0xFFFF00,  // Yellow
    critical: 0xFF0000, // Red
  };

  const embed: DiscordEmbed = {
    title: `🌅 Good Morning ${briefing.radar_name}`,
    description: briefing.summary.headline,
    color: colorMap[briefing.summary.sentiment],
    fields: [],
    timestamp: briefing.as_of,
  };

  // Add signals
  embed.fields.push({
    name: "**Signal Status**",
    value: briefing.signals.map(s =>
      `${s.trend === "declining" ? "🔺" : s.trend === "improving" ? "🔻" : "➡️"} ${s.label}: ${s.value_label} (${s.agreement > 0.8 ? "high confidence" : "moderate confidence"})`
    ).join("\n"),
    inline: false,
  });

  // Add branches if relevant
  const relevantBranches = briefing.branches.filter(b => b.support !== "very_low");
  if (relevantBranches.length > 0) {
    embed.fields.push({
      name: "**Scenarios**",
      value: relevantBranches.map(b =>
        `${b.support === "high" || b.support === "very_high" ? "⚠️" : "📊"} ${b.label}: ${BRANCH_SUPPORT_LABELS[b.support]}`
      ).join("\n"),
      inline: false,
    });
  }

  // Add key changes
  if (briefing.summary.key_changes.length > 0) {
    embed.fields.push({
      name: "**Changes from Yesterday**",
      value: briefing.summary.key_changes.map(c => `• ${c}`).join("\n"),
      inline: false,
    });
  }

  // Add top items
  if (briefing.items.length > 0) {
    embed.fields.push({
      name: "**Key Sources**",
      value: briefing.items.slice(0, 3).map(i => `• [${i.title.slice(0, 50)}](${i.url})`).join("\n"),
      inline: false,
    });
  }

  return { embeds: [embed] };
}
```

### Bluesky Thread

```typescript
export function briefingToBluesky(briefing: DailyBriefing): string[] {
  const posts: string[] = [];

  // Post 1: Headline
  posts.push(`🌅 Good Morning ${briefing.radar_name}\n\n${briefing.summary.headline}\n\n${briefing.summary.key_changes.length > 0 ? "Changes:\n" + briefing.summary.key_changes.map(c => `• ${c}`).join("\n") : "No significant changes from yesterday."}`);

  // Post 2: Signal breakdown (if needed)
  if (briefing.summary.sentiment !== "calm") {
    posts.push(`Signal breakdown:\n\n${briefing.signals.map(s => `${s.trend === "declining" ? "🔺" : s.trend === "improving" ? "🔻" : "➡️"} ${s.label}: ${s.value_label}`).join("\n")}`);
  }

  // Post 3: Scenarios (if relevant)
  const relevantBranches = briefing.branches.filter(b => b.support !== "very_low");
  if (relevantBranches.length > 0) {
    posts.push(`Scenarios to watch:\n\n${relevantBranches.map(b => `• ${b.label}: ${BRANCH_SUPPORT_LABELS[b.support]}`).join("\n")}`);
  }

  return posts;
}
```

---

## Social Publish Integration

### Using `social-publish-discord` Skill

```typescript
// In threat-radar-mcp or separate briefing service

import { briefingToDiscord } from "./daily-briefing-renderer";
import { DailyBriefingRenderer } from "./daily-briefing-renderer";

async function publishDailyBriefing(radarId: string): Promise<void> {
  // 1. Get latest daily snapshot
  const snapshot = await store.getLatestDailySnapshot(radarId);
  if (!snapshot) throw new Error("No daily snapshot available");

  // 2. Get source items (from evidence index)
  const evidenceIndex = getEvidenceIndex(radarId);
  const items = await getTopItems(evidenceIndex, 10);

  // 3. Render briefing
  const renderer = new DailyBriefingRenderer(radar, moduleVersion, previousSnapshot);
  const briefing = renderer.render(snapshot, items);

  // 4. Convert to Discord format
  const message = briefingToDiscord(briefing);

  // 5. Publish via social-publish-discord skill
  // POST to Discord webhook configured in radar settings
  await fetch(process.env.DISCORD_WEBHOOK_HORMUZ, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}
```

---

## Scheduling

### Daily Briefing Job

```typescript
// In services/radar-stack/hormuz-agent-loop.sh

# Seal daily snapshot at 00:00 UTC
0 0 * * * curl -X POST http://threat-radar-mcp:10002/api/radars/hormuz/seal-daily

# Publish briefing at 06:00 UTC
0 6 * * * curl -X POST http://threat-radar-mcp:10002/api/radars/hormuz/publish-briefing
```

### MCP Tool

```typescript
server.registerTool(
  "radar_publish_briefing",
  {
    description: "Publish daily briefing to configured channels",
    inputSchema: {
      radar_id: z.string().min(1),
      channels: z.array(z.enum(["discord", "bluesky", "email"])).optional(),
    },
  },
  async ({ radar_id, channels }): Promise<CallToolResult> => {
    // Seal daily snapshot if not already sealed
    // Render briefing
    // Publish to channels
    // Return result
  },
);
```

---

## Tests

```typescript
describe("DailyBriefingRenderer", () => {
  it("classifies sentiment correctly", () => {
    const renderer = new DailyBriefingRenderer(radar, moduleVersion);
    expect(renderer.classifySentiment(0.5, 0.1)).toBe("calm");
    expect(renderer.classifySentiment(2.0, 0.3)).toBe("elevated");
    expect(renderer.classifySentiment(3.5, 1.2)).toBe("critical");
  });

  it("generates headline from signals", () => {
    const renderer = new DailyBriefingRenderer(radar, moduleVersion);
    const signals: [string, ReducedSignal][] = [
      ["transit_flow", { median: 3, agreement: 0.9, sample_size: 5 }],
    ];
    const headline = renderer.generateHeadline(signals, "elevated");
    expect(headline).toContain("Transit flow");
  });

  it("detects signal trends", () => {
    const renderer = new DailyBriefingRenderer(radar, moduleVersion, previousSnapshot);
    const signal: ReducedSignal = { median: 3, agreement: 0.9, sample_size: 5 };
    const previous: ReducedSignal = { median: 2, agreement: 0.8, sample_size: 4 };
    expect(renderer.classifyTrend(signal, previous)).toBe("declining");
  });
});
```

---

## Implementation Location

```
packages/radar-core/
├── src/
│   ├── briefing/
│   │   ├── index.ts
│   │   ├── types.ts              # Briefing types
│   │   ├── renderer.ts           # DailyBriefingRenderer
│   │   ├── templates.ts          # Labels and formats
│   │   └── output/
│   │       ├── discord.ts        # briefingToDiscord
│   │       ├── bluesky.ts        # briefingToBluesky
│   │       └── email.ts          # briefingToEmail
│   └── ...

orgs/riatzukiza/threat-radar-mcp/
└── src/
    └── briefing-service.ts       # MCP tool integration
```

---

## Next

With all specs complete, the eta-mu monorepo extraction path is defined. Begin implementation with `packages/presence-core/` as the foundation.