// ---------------------------------------------------------------------------
// ActionFeed — time-bounded action suggestions derived from signal data.
// Shows suggestions grouped by time horizon: 24h / week / coordination.
// (Satisfies VAL-UI-007)
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import type { RadarTile, ThreadData } from "../../api/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimeHorizon = "within 24 hours" | "this week" | "coordination opportunity";

export interface ActionSuggestion {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly timeHorizon: TimeHorizon;
  readonly urgency: number; // 0–1
  readonly source: string;
}

export interface ActionFeedProps {
  readonly tiles: readonly RadarTile[];
  /** When agency bias is enabled, boost actionable items */
  readonly agencyBiasEnabled?: boolean;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Derive action suggestions from threads
// ---------------------------------------------------------------------------

function deriveActions(tiles: readonly RadarTile[], agencyBias: boolean): ActionSuggestion[] {
  const actions: ActionSuggestion[] = [];

  for (const tile of tiles) {
    if (!tile.threads) continue;

    for (const thread of tile.threads) {
      const action = threadToAction(thread, tile.radar.category);
      if (action) {
        actions.push(action);
      }
    }

    // Derive from narrative branches if deterministic snapshot exists
    const det = tile.liveSnapshot?.render_state?.deterministicSnapshot;
    if (det?.narrativeBranches) {
      for (const branch of det.narrativeBranches) {
        if (branch.actionability > 0.5) {
          actions.push({
            id: `branch-${branch.label.replace(/\s+/g, "-").toLowerCase()}-${tile.radar.id}`,
            title: `Prepare for: ${branch.label}`,
            description: `This narrative branch has ${(branch.probability * 100).toFixed(0)}% probability with actionability score of ${(branch.actionability * 100).toFixed(0)}%. Evidence: ${branch.evidence.slice(0, 2).join("; ")}`,
            timeHorizon: branch.probability > 0.5 ? "within 24 hours" : "this week",
            urgency: branch.actionability * branch.probability,
            source: tile.radar.name,
          });
        }
      }
    }
  }

  // Sort by urgency (highest first), boost if agency bias is on
  return actions.sort((a, b) => {
    const aScore = agencyBias ? a.urgency * 1.5 : a.urgency;
    const bScore = agencyBias ? b.urgency * 1.5 : b.urgency;
    return bScore - aScore;
  });
}

function threadToAction(thread: ThreadData, category: string): ActionSuggestion | null {
  // Only generate actions for active/emerging threads
  if (thread.status !== "active" && thread.status !== "emerging") return null;

  const isLocal = thread.kind === "local_opportunity" ||
    thread.domain_tags.some((t) => ["local", "community", "oss", "developer"].includes(t));

  let timeHorizon: TimeHorizon;
  let urgency: number;

  if (thread.status === "active" && isLocal) {
    timeHorizon = "within 24 hours";
    urgency = 0.8 + thread.confidence * 0.2;
  } else if (thread.status === "active") {
    timeHorizon = "this week";
    urgency = 0.5 + thread.confidence * 0.3;
  } else if (isLocal) {
    timeHorizon = "this week";
    urgency = 0.4 + thread.confidence * 0.2;
  } else {
    timeHorizon = "coordination opportunity";
    urgency = 0.2 + thread.confidence * 0.2;
  }

  const description = thread.summary
    ?? `Thread with ${thread.members.length} signals from ${Object.keys(thread.source_distribution).join(", ")}. ${thread.domain_tags.length > 0 ? `Tags: ${thread.domain_tags.join(", ")}` : ""}`;

  return {
    id: `thread-${thread.id}`,
    title: thread.title,
    description,
    timeHorizon,
    urgency: Math.min(1, urgency),
    source: category,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function horizonClass(h: TimeHorizon): string {
  switch (h) {
    case "within 24 hours": return "af-horizon-24h";
    case "this week": return "af-horizon-week";
    case "coordination opportunity": return "af-horizon-coord";
  }
}

function urgencyBar(urgency: number): string {
  if (urgency >= 0.7) return "af-urgency-high";
  if (urgency >= 0.4) return "af-urgency-medium";
  return "af-urgency-low";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionFeed({ tiles, agencyBiasEnabled = false, className }: ActionFeedProps): JSX.Element {
  const actions = useMemo(
    () => deriveActions(tiles, agencyBiasEnabled),
    [tiles, agencyBiasEnabled],
  );

  if (actions.length === 0) {
    return (
      <section className={`af-feed ${className ?? ""}`.trim()} data-testid="action-feed">
        <div className="af-header">
          <h3 className="af-title">Action Feed</h3>
        </div>
        <div className="af-empty" data-testid="af-empty">
          <p>No action suggestions yet. Collect signals and they will populate here.</p>
        </div>
      </section>
    );
  }

  // Group by time horizon
  const grouped: Record<TimeHorizon, ActionSuggestion[]> = {
    "within 24 hours": [],
    "this week": [],
    "coordination opportunity": [],
  };
  for (const action of actions) {
    grouped[action.timeHorizon].push(action);
  }

  return (
    <section className={`af-feed ${className ?? ""}`.trim()} data-testid="action-feed">
      <div className="af-header">
        <h3 className="af-title">Action Feed</h3>
        <span className="af-count">{actions.length} suggestion{actions.length !== 1 ? "s" : ""}</span>
      </div>

      {(Object.entries(grouped) as Array<[TimeHorizon, ActionSuggestion[]]>)
        .filter(([, items]) => items.length > 0)
        .map(([horizon, items]) => (
          <div key={horizon} className="af-group" data-testid={`af-group-${horizon.replace(/\s+/g, "-")}`}>
            <h4 className={`af-group-title ${horizonClass(horizon)}`}>
              {horizon}
              <span className="af-group-count">{items.length}</span>
            </h4>
            <div className="af-group-items">
              {items.slice(0, 5).map((action) => (
                <article key={action.id} className="af-item" data-testid="af-item">
                  <div className="af-item-header">
                    <span className={`af-urgency-dot ${urgencyBar(action.urgency)}`} />
                    <h5 className="af-item-title">{action.title}</h5>
                    <span className={`af-item-horizon ${horizonClass(action.timeHorizon)}`}>
                      {action.timeHorizon}
                    </span>
                  </div>
                  <p className="af-item-description">{action.description}</p>
                  <div className="af-item-footer">
                    <span className="af-item-source">{action.source}</span>
                    <span className="af-item-urgency">
                      urgency: {(action.urgency * 100).toFixed(0)}%
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
    </section>
  );
}
