import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getUsageOverview,
  listCredentials,
  listRequestLogs,
  type KeyPoolStatus,
  type RequestLogEntry,
  type UsageAccountSummary,
  type UsageOverview,
} from "../lib/api";
import { formatAuthType } from "../lib/format";
import { useStoredState } from "../lib/use-stored-state";

const ALL_PROVIDERS_FILTER = "__all_providers__";
const DEFAULT_USAGE_WINDOW: "daily" | "weekly" | "monthly" = "weekly";

const LS_DASHBOARD_WINDOW = "open-hax-proxy.ui.dashboard.window";
const LS_DASHBOARD_ACCOUNT_SORT = "open-hax-proxy.ui.dashboard.accountSort";
const LS_DASHBOARD_ACCOUNT_PROVIDER = "open-hax-proxy.ui.dashboard.accountProvider";

function validateUsageWindow(value: unknown): "daily" | "weekly" | "monthly" | undefined {
  return value === "daily" || value === "weekly" || value === "monthly" ? value : undefined;
}

function validateNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function validateAccountSort(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "health" || normalized === "ttft" || normalized === "tps" || normalized === "tokens" || normalized === "requests") {
    return normalized;
  }

  return undefined;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  if (ml >= 1) return `${ml.toFixed(1)} mL`;
  if (ml >= 0.001) return `${(ml * 1000).toFixed(1)} uL`;
  return `${ml.toFixed(4)} mL`;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "Never";
}

function formatMaybeMs(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)} ms` : "-";
}

function formatMaybeTps(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(value >= 10 ? 0 : 1)} t/s` : "-";
}

function formatMaybeScore(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value * 100)}%` : "-";
}

function formatServiceTier(entry: RequestLogEntry): string {
  if (!entry.serviceTier) {
    return "Standard";
  }

  if (entry.serviceTierSource === "fast_mode") {
    return "Fast mode";
  }

  if (entry.serviceTier === "priority") {
    return "Priority";
  }

  return entry.serviceTier.replace(/[_-]+/g, " ");
}

function metricTone(value: number, inverse = false): string {
  if (value <= 0) {
    return "dashboard-metric-neutral";
  }

  if (inverse) {
    return value >= 5 ? "dashboard-metric-danger" : value >= 1 ? "dashboard-metric-warn" : "dashboard-metric-good";
  }

  return value >= 1 ? "dashboard-metric-good" : "dashboard-metric-neutral";
}

function miniBars(values: readonly { readonly t: string; readonly v: number }[]): JSX.Element {
  const max = values.reduce((current, point) => Math.max(current, point.v), 0);
  return (
    <div className="dashboard-sparkbars" aria-hidden="true">
      {values.map((point) => {
        const height = max > 0 ? Math.max((point.v / max) * 100, 8) : 8;
        return <span key={point.t} style={{ height: `${height}%` }} />;
      })}
    </div>
  );
}

function donutSegments(accounts: readonly UsageAccountSummary[]): JSX.Element {
  const total = accounts.reduce((sum, account) => sum + account.totalTokens, 0);
  if (total <= 0) {
    return <div className="dashboard-donut-empty">No token activity yet</div>;
  }

  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="dashboard-donut-chart" aria-hidden="true">
      <circle cx="60" cy="60" r="42" className="dashboard-donut-track" />
      {accounts.slice(0, 6).map((account, index) => {
        const share = account.totalTokens / total;
        const length = share * 264;
        const element = (
          <circle
            key={`${account.providerId}-${account.accountId}`}
            cx="60"
            cy="60"
            r="42"
            className={`dashboard-donut-segment dashboard-donut-segment-${index % 6}`}
            strokeDasharray={`${length} 264`}
            strokeDashoffset={-offset}
          />
        );
        offset += length;
        return element;
      })}
    </svg>
  );
}

function usageWindowLabel(windowValue: "daily" | "weekly" | "monthly"): string {
  return windowValue === "monthly" ? "30d" : windowValue === "weekly" ? "7d" : "24h";
}

function serviceTierShareBars(summary: UsageOverview["summary"]): JSX.Element {
  const tiers = [
    { label: "Fast mode", value: summary.serviceTierRequests24h.fastMode, className: "dashboard-tier-fast_mode" },
    { label: "Priority", value: summary.serviceTierRequests24h.priority, className: "dashboard-tier-explicit" },
    { label: "Standard", value: summary.serviceTierRequests24h.standard, className: "dashboard-tier-none" },
  ];
  const total = tiers.reduce((sum, tier) => sum + tier.value, 0);

  if (total <= 0) {
    return <div className="dashboard-account-empty">No tiered request activity yet.</div>;
  }

  return (
    <div className="dashboard-tier-summary">
      {tiers.map((tier) => {
        const percent = total > 0 ? (tier.value / total) * 100 : 0;
        return (
          <div key={tier.label} className="dashboard-tier-summary-row">
            <div className="dashboard-tier-summary-labels">
              <strong>{tier.label}</strong>
              <small>{formatCompactNumber(tier.value)} req · {formatPercent(percent)}</small>
            </div>
            <div className="dashboard-tier-summary-track" aria-hidden="true">
              <span className={`dashboard-tier-summary-fill ${tier.className}`} style={{ width: `${Math.max(percent, tier.value > 0 ? 6 : 0)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const [overview, setOverview] = useState<UsageOverview | null>(null);
  const [keyPoolStatuses, setKeyPoolStatuses] = useState<Record<string, KeyPoolStatus>>({});
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountSort, setAccountSort] = useStoredState(LS_DASHBOARD_ACCOUNT_SORT, "health", validateAccountSort);
  const [accountProviderFilter, setAccountProviderFilter] = useStoredState(LS_DASHBOARD_ACCOUNT_PROVIDER, ALL_PROVIDERS_FILTER, validateNonEmptyString);
  const [usageWindow, setUsageWindow] = useStoredState<"daily" | "weekly" | "monthly">(
    LS_DASHBOARD_WINDOW,
    DEFAULT_USAGE_WINDOW,
    validateUsageWindow,
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const logSentinelRef = useRef<HTMLDivElement | null>(null);
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const [healthVisible, setHealthVisible] = useState(50);
  const healthSentinelRef = useRef<HTMLDivElement | null>(null);
  const healthScrollRef = useRef<HTMLDivElement | null>(null);

  const LOG_PAGE_SIZE = 50;

  const topAccounts = useMemo(() =>
    [...(overview?.accounts ?? [])]
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, 6),
    [overview]);
  const allAccounts = useMemo(() => overview?.accounts ?? [], [overview]);
  const accountProviderOptions = useMemo(() =>
    [...new Set(allAccounts.map((account) => account.providerId))].sort((left, right) => left.localeCompare(right)),
    [allAccounts]);
  const filteredAccounts = useMemo(() => {
    if (accountProviderFilter === ALL_PROVIDERS_FILTER) {
      return allAccounts;
    }

    return allAccounts.filter((account) => account.providerId === accountProviderFilter);
  }, [allAccounts, accountProviderFilter]);
  const visibleAccounts = useMemo(() => filteredAccounts.slice(0, healthVisible), [filteredAccounts, healthVisible]);
  const providerStatuses = useMemo(() => Object.values(keyPoolStatuses).sort((a, b) => a.providerId.localeCompare(b.providerId)), [keyPoolStatuses]);

  const windowLabel = usageWindowLabel(usageWindow);

  useEffect(() => {
    if (accountProviderFilter !== ALL_PROVIDERS_FILTER && !accountProviderOptions.includes(accountProviderFilter)) {
      setAccountProviderFilter(ALL_PROVIDERS_FILTER);
    }
  }, [accountProviderFilter, accountProviderOptions]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextOverview, credentials, nextLogs] = await Promise.all([
          getUsageOverview(accountSort, usageWindow),
          listCredentials(false),
          listRequestLogs({ limit: LOG_PAGE_SIZE }),
        ]);
        if (!cancelled) {
          setOverview(nextOverview);
          setKeyPoolStatuses(credentials.keyPoolStatuses);
          setRequestLogs(nextLogs);
          setHasMore(nextLogs.length >= LOG_PAGE_SIZE);
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
  }, [accountSort, usageWindow]);

  const loadMoreLogs = useCallback(async () => {
    if (loadingMore || !hasMore || requestLogs.length === 0) return;
    const lastId = requestLogs[requestLogs.length - 1]?.id;
    if (!lastId) return;
    setLoadingMore(true);
    try {
      const older = await listRequestLogs({ limit: LOG_PAGE_SIZE, before: lastId });
      setRequestLogs((prev) => [...prev, ...older]);
      setHasMore(older.length >= LOG_PAGE_SIZE);
    } catch {
      // silently ignore pagination errors
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, requestLogs]);

  useEffect(() => {
    const sentinel = logSentinelRef.current;
    const scrollRoot = logScrollRef.current;
    if (!sentinel || !scrollRoot) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadMoreLogs(); },
      { root: scrollRoot, rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreLogs]);

  const loadMoreHealth = useCallback(() => {
    setHealthVisible((prev) => Math.min(prev + 50, filteredAccounts.length));
  }, [filteredAccounts.length]);

  useEffect(() => {
    const sentinel = healthSentinelRef.current;
    const scrollRoot = healthScrollRef.current;
    if (!sentinel || !scrollRoot) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMoreHealth(); },
      { root: scrollRoot, rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreHealth]);

  useEffect(() => { setHealthVisible(50); }, [overview, accountProviderFilter]);

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero panel-sheen">
        <div>
          <p className="dashboard-kicker">Single Proxy Control Tower</p>
          <h2>Codex usage visibility without leaving your proxy.</h2>
          <p>
            Watch request volume, token burn, account health, and recent traffic from the same OpenAI-compatible edge.
          </p>
        </div>
        <div className="dashboard-hero-meta">
          <span>Updated {formatDate(overview?.generatedAt ?? null)}</span>
          <span>Auto-refresh every 30s</span>
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      {overview?.coverage && !overview.coverage.hasFullWindowCoverage ? (
        <p className="error-text">
          Selected {windowLabel} window is not fully covered yet. Coverage starts {formatDate(overview.coverage.coverageStart)};
          requested window starts {formatDate(overview.coverage.requestedWindowStart)}. Cost/water/top-model stats may be partial.
        </p>
      ) : null}

      <section className="dashboard-metrics-grid">
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.requests24h ?? 0)}`}>
          <span>Requests / {windowLabel}</span>
          <strong>{loading ? "..." : formatCompactNumber(overview?.summary.requests24h ?? 0)}</strong>
          {overview ? miniBars(overview.trends.requests) : <div className="dashboard-sparkbars dashboard-sparkbars-placeholder" />}
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.tokens24h ?? 0)}`}>
          <span>Tokens / {windowLabel}</span>
          <strong>{loading ? "..." : formatCompactNumber(overview?.summary.tokens24h ?? 0)}</strong>
          <small>
            In {formatCompactNumber(overview?.summary.promptTokens24h ?? 0)} / Out {formatCompactNumber(overview?.summary.completionTokens24h ?? 0)}
            {" · "}
            Cached {formatCompactNumber(overview?.summary.cachedPromptTokens24h ?? 0)}
            {" · "}
            Cache hit {formatPercent(overview?.summary.cacheHitRate24h ?? 0)}
          </small>
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.imageCount24h ?? 0)}`}>
          <span>Images / {windowLabel}</span>
          <strong>{loading ? "..." : formatCompactNumber(overview?.summary.imageCount24h ?? 0)}</strong>
          <small>
            Cost {formatUsd(overview?.summary.imageCostUsd24h ?? 0)}
          </small>
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.errorRate24h ?? 0, true)}`}>
          <span>Error Rate</span>
          <strong>{loading ? "..." : formatPercent(overview?.summary.errorRate24h ?? 0)}</strong>
          {overview ? miniBars(overview.trends.errors) : <div className="dashboard-sparkbars dashboard-sparkbars-placeholder" />}
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.activeAccounts ?? 0)}`}>
          <span>Active Accounts</span>
          <strong>{loading ? "..." : formatCompactNumber(overview?.summary.activeAccounts ?? 0)}</strong>
          <small>
            Top model {overview?.summary.topModel ?? "-"} · Top provider {overview?.summary.topProvider ?? "-"}
          </small>
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.costUsd24h ?? 0)}`}>
          <span>Est. Cost / {windowLabel}</span>
          <strong>{loading ? "..." : formatUsd(overview?.summary.costUsd24h ?? 0)}</strong>
          <small>
            {formatCompactNumber((overview?.summary.energyJoules24h ?? 0) / 1000)} kJ energy
          </small>
        </article>
        <article className={`dashboard-metric-card ${metricTone(overview?.summary.waterEvaporatedMl24h ?? 0)}`}>
          <span>Water Evaporated / {windowLabel}</span>
          <strong>{loading ? "..." : formatWater(overview?.summary.waterEvaporatedMl24h ?? 0)}</strong>
          <small>
            ~1.8 L/kWh DC cooling avg
          </small>
        </article>
      </section>

      <div className="dashboard-area-left">
        <article className="dashboard-panel panel-sheen">
          <header className="dashboard-panel-header">
            <div>
              <h3>Account Token Share</h3>
              <p>Who is carrying the last 24h load.</p>
            </div>
          </header>
          <div className="dashboard-panel-scroll">
            <div className="dashboard-donut-wrap">
              {donutSegments(topAccounts)}
              <div className="dashboard-donut-legend">
                {topAccounts.map((account, index) => (
                  <div key={`${account.providerId}-${account.accountId}`} className="dashboard-legend-row">
                    <span className={`dashboard-legend-swatch dashboard-donut-segment-${index % 6}`} />
                    <div>
                      <strong>{account.displayName}</strong>
                      <small>{formatCompactNumber(account.totalTokens)} tokens</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel panel-sheen">
          <header className="dashboard-panel-header">
            <div>
              <h3>Service Tier Mix</h3>
            </div>
          </header>
          <div className="dashboard-panel-scroll">
            {overview ? serviceTierShareBars(overview.summary) : <div className="dashboard-account-empty">Loading tier mix…</div>}
          </div>
        </article>

        <article className="dashboard-panel panel-sheen">
          <header className="dashboard-panel-header">
            <div>
              <h3>Traffic Trend</h3>
            </div>
            <div className="dashboard-panel-controls">
              <label>
                Window&nbsp;
                <select value={usageWindow} onChange={(event) => setUsageWindow(event.target.value as typeof usageWindow)}>
                  <option value="daily">Daily (24h)</option>
                  <option value="weekly">Weekly (7d)</option>
                  <option value="monthly">Monthly (30d)</option>
                </select>
              </label>
            </div>
          </header>
          <div className="dashboard-panel-scroll">
            <div className="dashboard-trend-grid">
              <div>
                <span className="dashboard-chart-label">Requests</span>
                {overview ? miniBars(overview.trends.requests) : <div className="dashboard-sparkbars dashboard-sparkbars-placeholder" />}
              </div>
              <div>
                <span className="dashboard-chart-label">Tokens</span>
                {overview ? miniBars(overview.trends.tokens) : <div className="dashboard-sparkbars dashboard-sparkbars-placeholder" />}
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel panel-sheen">
          <header className="dashboard-panel-header">
            <div>
              <h3>Provider Pool</h3>
            </div>
          </header>
          <div className="dashboard-panel-scroll">
            <div className="dashboard-provider-grid">
              {providerStatuses.length === 0 ? (
                <div className="dashboard-account-empty">No provider status available yet.</div>
              ) : providerStatuses.map((status) => (
                <article key={status.providerId} className="dashboard-provider-card">
                  <div className="dashboard-provider-card-header">
                    <strong>{status.providerId}</strong>
                    <span className={`dashboard-status-pill dashboard-status-${status.cooldownAccounts > 0 ? "cooldown" : "healthy"}`}>
                      {formatAuthType(status.authType)}
                    </span>
                  </div>
                  <dl>
                    <div><dt>Total</dt><dd>{formatCompactNumber(status.totalAccounts)}</dd></div>
                    <div><dt>Available</dt><dd>{formatCompactNumber(status.availableAccounts)}</dd></div>
                    <div><dt>Cooling Down</dt><dd>{formatCompactNumber(status.cooldownAccounts)}</dd></div>
                    <div><dt>Ready In</dt><dd>{status.nextReadyInMs > 0 ? `${Math.ceil(status.nextReadyInMs / 1000)}s` : "now"}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="dashboard-panel panel-sheen dashboard-area-logs">
        <header className="dashboard-panel-header">
          <div>
            <h3>Recent Request Log</h3>
            <p>The last few upstream attempts, useful for spotting fallback churn and model failures.</p>
          </div>
        </header>
        <div className="dashboard-panel-scroll" ref={logScrollRef}>
          <div className="dashboard-log-table">
            <div className="dashboard-log-header">
              <span>When</span>
              <span>Provider</span>
              <span>Model</span>
              <span>Tier</span>
              <span>Status</span>
              <span>Latency</span>
            </div>
            {requestLogs.length === 0 ? (
              <div className="dashboard-account-empty">No request log entries yet.</div>
            ) : requestLogs.map((entry) => (
              <div key={entry.id} className="dashboard-log-row">
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span>{entry.providerId}/{entry.accountId}</span>
                <span>{entry.model}</span>
                <span className={`dashboard-status-pill dashboard-tier-pill dashboard-tier-${entry.serviceTierSource}`}>
                  {formatServiceTier(entry)}
                </span>
                <span className={`dashboard-status-pill dashboard-status-${entry.status === 0 || entry.status >= 400 ? "cooldown" : "healthy"}`}>{entry.status === 0 ? "ERR" : entry.status}</span>
                <span>{Math.round(entry.latencyMs)} ms</span>
              </div>
            ))}
            <div ref={logSentinelRef} className="dashboard-log-sentinel">
              {loadingMore ? <span className="dashboard-log-loading">Loading more…</span> : null}
            </div>
          </div>
        </div>
      </article>

      <article className="dashboard-panel panel-sheen dashboard-area-health">
        <header className="dashboard-panel-header">
          <div>
            <h3>Account Health</h3>
            <p>Ordered by health by default; filter to a provider or sort by tokens/requests/TTFT/TPS.</p>
          </div>
          <div className="dashboard-panel-controls">
            <label>
              Sort&nbsp;
              <select value={accountSort} onChange={(event) => setAccountSort(event.target.value)}>
                <option value="health">Health</option>
                <option value="ttft">TTFT</option>
                <option value="tps">TPS</option>
                <option value="tokens">Tokens</option>
                <option value="requests">Requests</option>
              </select>
            </label>
            <label>
              Provider&nbsp;
              <select value={accountProviderFilter} onChange={(event) => setAccountProviderFilter(event.target.value)}>
                <option value={ALL_PROVIDERS_FILTER}>All providers</option>
                {accountProviderOptions.map((providerId) => (
                  <option key={providerId} value={providerId}>{providerId}</option>
                ))}
              </select>
            </label>
          </div>
        </header>
        <div className="dashboard-panel-scroll" ref={healthScrollRef}>
          <div className="dashboard-account-table">
            <div className="dashboard-account-table-header">
              <span>Account</span>
              <span>Status</span>
              <span>Health</span>
              <span>TTFT</span>
              <span>TPS</span>
              <span>Cache</span>
              <span>Requests</span>
              <span>Tokens</span>
              <span>Last Seen</span>
            </div>
            {visibleAccounts.length === 0 ? (
              <div className="dashboard-account-empty">
                {allAccounts.length === 0
                  ? "No request log activity yet."
                  : `No accounts found for provider ${accountProviderFilter}.`}
              </div>
            ) : (
              visibleAccounts.map((account) => (
                <div key={`${account.providerId}-${account.accountId}`} className="dashboard-account-row">
                  <div>
                    <strong>{account.displayName}</strong>
                    <small>{formatAuthType(account.authType)}</small>
                  </div>
                  <span className={`dashboard-status-pill dashboard-status-${account.status}`}>{account.status}</span>
                  <span>{formatMaybeScore(account.healthScore)}</span>
                  <span>{formatMaybeMs(account.avgTtftMs)}</span>
                  <span>{formatMaybeTps(account.avgTps)}</span>
                  <span>
                    {account.cacheKeyUseCount > 0
                      ? `${formatPercent((account.cacheHitCount / account.cacheKeyUseCount) * 100)} (${account.cacheHitCount}/${account.cacheKeyUseCount})`
                      : "-"}
                    {account.cachedPromptTokens > 0 ? ` · ${formatCompactNumber(account.cachedPromptTokens)} cached` : ""}
                  </span>
                  <span>
                    {formatCompactNumber(account.requestCount)}
                    {account.imageCount > 0 ? ` · ${formatCompactNumber(account.imageCount)} img` : ""}
                  </span>
                  <span>
                    {formatCompactNumber(account.totalTokens)}
                    {account.imageCostUsd > 0 ? ` · ${formatUsd(account.imageCostUsd)}` : ""}
                  </span>
                  <span>{formatDate(account.lastUsedAt)}</span>
                </div>
              ))
            )}
            {healthVisible < filteredAccounts.length && (
              <div ref={healthSentinelRef} className="dashboard-log-sentinel">
                <span className="dashboard-log-loading">Loading more…</span>
              </div>
            )}
            {healthVisible >= filteredAccounts.length && filteredAccounts.length > 0 && (
              <div ref={healthSentinelRef} className="dashboard-log-sentinel" />
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
