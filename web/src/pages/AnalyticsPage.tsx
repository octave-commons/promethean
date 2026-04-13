import { useEffect, useMemo, useState } from "react";

import { getProviderModelAnalytics, type AnalyticsRow, type ProviderModelAnalytics } from "../lib/api";
import { useStoredState } from "../lib/use-stored-state";

const LS_ANALYTICS_WINDOW = "open-hax-proxy.ui.analytics.window";
const LS_ANALYTICS_SORT = "open-hax-proxy.ui.analytics.sort";
const LS_ANALYTICS_PROVIDER = "open-hax-proxy.ui.analytics.provider";
const LS_ANALYTICS_MODEL = "open-hax-proxy.ui.analytics.model";

function validateWindow(value: unknown): "daily" | "weekly" | "monthly" | undefined {
  return value === "daily" || value === "weekly" || value === "monthly" ? value : undefined;
}

function validateSort(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return ["suitability", "tokens", "requests", "ttft", "tps", "errors", "cost"].includes(normalized)
    ? normalized
    : undefined;
}

function validateString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  if (ml >= 1) return `${ml.toFixed(1)} mL`;
  if (ml >= 0.001) return `${(ml * 1000).toFixed(1)} uL`;
  return `${ml.toFixed(4)} mL`;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "-";
}

function formatMaybeMs(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)} ms` : "-";
}

function formatMaybeTps(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(value >= 10 ? 0 : 1)} t/s` : "-";
}

function formatMaybeSuitability(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value * 100)}%` : "-";
}

function rowLabel(row: AnalyticsRow): string {
  return row.model ?? row.providerId ?? "-";
}

export function AnalyticsPage(): JSX.Element {
  const [windowValue, setWindowValue] = useStoredState<"daily" | "weekly" | "monthly">(
    LS_ANALYTICS_WINDOW,
    "weekly",
    validateWindow,
  );
  const [sort, setSort] = useStoredState(LS_ANALYTICS_SORT, "suitability", validateSort);
  const [providerFocus, setProviderFocus] = useStoredState(LS_ANALYTICS_PROVIDER, "", validateString);
  const [modelFocus, setModelFocus] = useStoredState(LS_ANALYTICS_MODEL, "", validateString);
  const [modelSearch, setModelSearch] = useState("");
  const [providerSearch, setProviderSearch] = useState("");
  const [analytics, setAnalytics] = useState<ProviderModelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await getProviderModelAnalytics(sort, windowValue);
        if (!cancelled) {
          setAnalytics(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sort, windowValue]);

  const providerOptions = useMemo(() =>
    (analytics?.providers ?? [])
      .map((row) => row.providerId)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
    [analytics],
  );

  const modelOptions = useMemo(() =>
    (analytics?.models ?? [])
      .map((row) => row.model)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
    [analytics],
  );

  useEffect(() => {
    if (providerFocus && !providerOptions.includes(providerFocus)) {
      setProviderFocus("");
    }
  }, [providerFocus, providerOptions]);

  useEffect(() => {
    if (modelFocus && !modelOptions.includes(modelFocus)) {
      setModelFocus("");
    }
  }, [modelFocus, modelOptions]);

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    if (!query) {
      return analytics?.models ?? [];
    }

    return (analytics?.models ?? []).filter((row) => rowLabel(row).toLowerCase().includes(query));
  }, [analytics, modelSearch]);

  const filteredProviders = useMemo(() => {
    const query = providerSearch.trim().toLowerCase();
    if (!query) {
      return analytics?.providers ?? [];
    }

    return (analytics?.providers ?? []).filter((row) => rowLabel(row).toLowerCase().includes(query));
  }, [analytics, providerSearch]);

  const filteredPairs = useMemo(() => {
    return (analytics?.providerModels ?? []).filter((row) => {
      if (providerFocus && row.providerId !== providerFocus) {
        return false;
      }
      if (modelFocus && row.model !== modelFocus) {
        return false;
      }
      return true;
    });
  }, [analytics, providerFocus, modelFocus]);

  const topModel = analytics?.models[0] ?? null;
  const topProvider = analytics?.providers[0] ?? null;

  return (
    <div className="analytics-layout">
      <section className="analytics-panel panel-sheen analytics-hero">
        <div>
          <p className="dashboard-kicker">Routing Intelligence</p>
          <h2>Provider + model analytics</h2>
          <p>
            Explore observed performance by model, by provider, and by provider × model pair.
            Suitability is a heuristic derived from TTFT, TPS, error rate, cache behavior, and confidence.
          </p>
        </div>
        <div className="analytics-hero-meta">
          <span>Updated {formatDate(analytics?.generatedAt ?? null)}</span>
          <span>Auto-refresh every 30s</span>
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      {analytics?.coverage && !analytics.coverage.hasFullWindowCoverage ? (
        <p className="error-text">
          Selected window is not fully covered yet. Coverage starts {formatDate(analytics.coverage.coverageStart)};
          requested window starts {formatDate(analytics.coverage.requestedWindowStart)}.
          Ranking and suitability are still useful, but historical totals may be partial.
        </p>
      ) : null}

      <section className="analytics-summary-grid">
        <article className="analytics-stat-card panel-sheen">
          <span>Observed Models</span>
          <strong>{loading ? "..." : formatCompactNumber(analytics?.models.length ?? 0)}</strong>
          <small>Top model: {topModel?.model ?? "-"}</small>
        </article>
        <article className="analytics-stat-card panel-sheen">
          <span>Observed Providers</span>
          <strong>{loading ? "..." : formatCompactNumber(analytics?.providers.length ?? 0)}</strong>
          <small>Top provider: {topProvider?.providerId ?? "-"}</small>
        </article>
        <article className="analytics-stat-card panel-sheen">
          <span>Provider × Model Pairs</span>
          <strong>{loading ? "..." : formatCompactNumber(analytics?.providerModels.length ?? 0)}</strong>
          <small>Window: {windowValue}</small>
        </article>
        <article className="analytics-stat-card panel-sheen">
          <span>Top Model Suitability</span>
          <strong>{loading ? "..." : formatMaybeSuitability(topModel?.suitabilityScore ?? null)}</strong>
          <small>{topModel?.model ?? "-"}</small>
        </article>
        <article className="analytics-stat-card panel-sheen">
          <span>Top Provider Suitability</span>
          <strong>{loading ? "..." : formatMaybeSuitability(topProvider?.suitabilityScore ?? null)}</strong>
          <small>{topProvider?.providerId ?? "-"}</small>
        </article>
      </section>

      <section className="analytics-panel panel-sheen">
        <header className="analytics-panel-header">
          <div>
            <h3>Controls</h3>
            <p>Change the observed window, sort order, and pair-level focus.</p>
          </div>
          <div className="analytics-toolbar">
            <label>
              Window&nbsp;
              <select value={windowValue} onChange={(event) => setWindowValue(event.currentTarget.value as typeof windowValue)}>
                <option value="daily">Daily (24h)</option>
                <option value="weekly">Weekly (7d)</option>
                <option value="monthly">Monthly (30d)</option>
              </select>
            </label>
            <label>
              Sort&nbsp;
              <select value={sort} onChange={(event) => setSort(event.currentTarget.value)}>
                <option value="suitability">Suitability</option>
                <option value="tokens">Tokens</option>
                <option value="requests">Requests</option>
                <option value="ttft">TTFT</option>
                <option value="tps">TPS</option>
                <option value="errors">Error rate</option>
                <option value="cost">Cost</option>
              </select>
            </label>
            <label>
              Provider focus&nbsp;
              <select value={providerFocus} onChange={(event) => setProviderFocus(event.currentTarget.value)}>
                <option value="">All providers</option>
                {providerOptions.map((providerId) => <option key={providerId} value={providerId}>{providerId}</option>)}
              </select>
            </label>
            <label>
              Model focus&nbsp;
              <select value={modelFocus} onChange={(event) => setModelFocus(event.currentTarget.value)}>
                <option value="">All models</option>
                {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
              </select>
            </label>
          </div>
        </header>
      </section>

      <section className="analytics-panel panel-sheen">
        <header className="analytics-panel-header">
          <div>
            <h3>Global Model Stats</h3>
            <p>How each model performs across all observed providers.</p>
          </div>
          <input
            value={modelSearch}
            onChange={(event) => setModelSearch(event.currentTarget.value)}
            placeholder="Search models…"
          />
        </header>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Providers</th>
                <th>Suitability</th>
                <th>Confidence</th>
                <th>Avg TTFT</th>
                <th>Avg TPS</th>
                <th>Error Rate</th>
                <th>Requests</th>
                <th>Tokens</th>
                <th>Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((row) => (
                <tr key={`model-${row.model}`}>
                  <td>{row.model}</td>
                  <td>{formatCompactNumber(row.providerCoverageCount ?? 0)}</td>
                  <td>{formatMaybeSuitability(row.suitabilityScore)}</td>
                  <td>{formatMaybeSuitability(row.confidenceScore)}</td>
                  <td>{formatMaybeMs(row.avgTtftMs)}</td>
                  <td>{formatMaybeTps(row.avgTps)}</td>
                  <td>{formatPercent(row.errorRate)}</td>
                  <td>{formatCompactNumber(row.requestCount)}</td>
                  <td>{formatCompactNumber(row.totalTokens)}</td>
                  <td>{formatUsd(row.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-panel panel-sheen">
        <header className="analytics-panel-header">
          <div>
            <h3>Global Provider Stats</h3>
            <p>How each provider performs across all observed models.</p>
          </div>
          <input
            value={providerSearch}
            onChange={(event) => setProviderSearch(event.currentTarget.value)}
            placeholder="Search providers…"
          />
        </header>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Models</th>
                <th>Suitability</th>
                <th>Confidence</th>
                <th>Avg TTFT</th>
                <th>Avg TPS</th>
                <th>Error Rate</th>
                <th>Requests</th>
                <th>Tokens</th>
                <th>Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((row) => (
                <tr key={`provider-${row.providerId}`}>
                  <td>{row.providerId}</td>
                  <td>{formatCompactNumber(row.modelCoverageCount ?? 0)}</td>
                  <td>{formatMaybeSuitability(row.suitabilityScore)}</td>
                  <td>{formatMaybeSuitability(row.confidenceScore)}</td>
                  <td>{formatMaybeMs(row.avgTtftMs)}</td>
                  <td>{formatMaybeTps(row.avgTps)}</td>
                  <td>{formatPercent(row.errorRate)}</td>
                  <td>{formatCompactNumber(row.requestCount)}</td>
                  <td>{formatCompactNumber(row.totalTokens)}</td>
                  <td>{formatUsd(row.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-panel panel-sheen">
        <header className="analytics-panel-header">
          <div>
            <h3>Model Given Provider</h3>
            <p>Observed pair-level performance: the concrete routing surface.</p>
          </div>
          <small>{filteredPairs.length} matching pair(s)</small>
        </header>
        <div className="analytics-table-wrap">
          <table className="analytics-table analytics-table-wide">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Model</th>
                <th>Suitability</th>
                <th>Confidence</th>
                <th>Avg TTFT</th>
                <th>Avg TPS</th>
                <th>Error Rate</th>
                <th>Cache Hit</th>
                <th>Requests</th>
                <th>Tokens</th>
                <th>Est. Cost</th>
                <th>Water</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.map((row) => (
                <tr key={`pair-${row.providerId}-${row.model}`}>
                  <td>{row.providerId}</td>
                  <td>{row.model}</td>
                  <td>{formatMaybeSuitability(row.suitabilityScore)}</td>
                  <td>{formatMaybeSuitability(row.confidenceScore)}</td>
                  <td>{formatMaybeMs(row.avgTtftMs)}</td>
                  <td>{formatMaybeTps(row.avgTps)}</td>
                  <td>{formatPercent(row.errorRate)}</td>
                  <td>{formatPercent(row.cacheHitRate)}</td>
                  <td>{formatCompactNumber(row.requestCount)}</td>
                  <td>{formatCompactNumber(row.totalTokens)}</td>
                  <td>{formatUsd(row.costUsd)}</td>
                  <td>{formatWater(row.waterEvaporatedMl)}</td>
                  <td>{formatDate(row.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
