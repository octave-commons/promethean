import { useEffect, useMemo, useRef, useState } from "react";

import { getHostsOverview, type HostDashboardSnapshot, type HostsOverview } from "../lib/api";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function HostReachabilityPill({ host }: { readonly host: HostDashboardSnapshot }): JSX.Element {
  if (!host.reachable) {
    return <span className="hosts-pill hosts-pill-error">Unreachable</span>;
  }

  if (host.errors.length > 0) {
    return <span className="hosts-pill hosts-pill-warn">Partial</span>;
  }

  return <span className="hosts-pill hosts-pill-ok">Live</span>;
}

function formatContainerPorts(ports: readonly string[]): string {
  if (ports.length === 0) {
    return "—";
  }

  return ports.join(", ");
}

function formatRouteMatch(host: HostDashboardSnapshot, index: number): string {
  const route = host.routes[index];
  if (!route) {
    return "—";
  }

  if (route.matchPaths.length > 0) {
    return route.matchPaths.join(" ");
  }

  if (route.matcher) {
    return route.matcher;
  }

  return "default";
}

function hostLastError(host: HostDashboardSnapshot): string | null {
  return host.errors.length > 0 ? host.errors[host.errors.length - 1] ?? null : null;
}

export function HostsPage(): JSX.Element {
  const [overview, setOverview] = useState<HostsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);
      try {
        const nextOverview = await getHostsOverview();
        if (!cancelled && requestId === requestIdRef.current) {
          setOverview(nextOverview);
        }
      } catch (loadError) {
        if (!cancelled && requestId === requestIdRef.current) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        isFetchingRef.current = false;
        if (!cancelled && requestId === requestIdRef.current) {
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
  }, []);

  const hosts = overview?.hosts ?? [];
  const totals = useMemo(() => ({
    hostCount: hosts.length,
    reachableCount: hosts.filter((host) => host.reachable).length,
    containerCount: hosts.reduce((sum, host) => sum + host.summary.containerCount, 0),
    routeCount: hosts.reduce((sum, host) => sum + host.summary.routeCount, 0),
  }), [hosts]);

  return (
    <section className="hosts-page">
      <header className="hosts-hero panel-sheen">
        <div>
          <p className="dashboard-kicker">Host Fleet</p>
          <h2>Promethean ussy host dashboard</h2>
          <p>
            One view for container inventory and routed subdomains across the ussy hosts. Remote hosts stay visible even when
            access or auth is broken.
          </p>
        </div>
        <div className="hosts-hero-meta">
          <strong>{totals.reachableCount}/{totals.hostCount}</strong>
          <span>reachable hosts</span>
          <strong>{totals.containerCount}</strong>
          <span>containers tracked</span>
          <strong>{totals.routeCount}</strong>
          <span>subdomain routes parsed</span>
          <small>{overview ? `Updated ${formatDate(overview.generatedAt)}` : "Waiting for first sample…"}</small>
        </div>
      </header>

      {loading && !overview ? (
        <div className="hosts-empty">Loading host inventory…</div>
      ) : null}
      {error ? <div className="hosts-empty hosts-empty-error">{error}</div> : null}

      <div className="hosts-grid">
        {hosts.map((host) => {
          const lastError = hostLastError(host);
          return (
            <article key={host.id} className="hosts-card panel-sheen">
              <header className="hosts-card-header">
                <div>
                  <div className="hosts-card-title-row">
                    <h3>{host.label}</h3>
                    {overview?.selfTargetId === host.id ? <span className="hosts-pill hosts-pill-self">This console</span> : null}
                    <HostReachabilityPill host={host} />
                  </div>
                  <p>
                    {host.baseUrl ?? host.publicHost ?? host.id}
                    {host.notes ? ` · ${host.notes}` : ""}
                  </p>
                </div>
                <div className="hosts-card-stats">
                  <div>
                    <strong>{host.summary.runningCount}/{host.summary.containerCount}</strong>
                    <span>running</span>
                  </div>
                  <div>
                    <strong>{host.summary.healthyCount}</strong>
                    <span>healthy</span>
                  </div>
                  <div>
                    <strong>{host.summary.routeCount}</strong>
                    <span>routes</span>
                  </div>
                </div>
              </header>

              {lastError ? <div className="hosts-card-error">{lastError}</div> : null}

              <div className="hosts-card-body">
                <section className="hosts-section">
                  <div className="hosts-section-header">
                    <h4>Subdomains</h4>
                    <small>{host.routes.length} routes</small>
                  </div>
                  {host.routes.length === 0 ? (
                    <div className="hosts-section-empty">No routed subdomains detected.</div>
                  ) : (
                    <div className="hosts-table-wrap">
                      <table className="hosts-table">
                        <thead>
                          <tr>
                            <th>Host</th>
                            <th>Match</th>
                            <th>Upstream</th>
                          </tr>
                        </thead>
                        <tbody>
                          {host.routes.map((route, index) => (
                            <tr key={`${route.host}-${route.upstreams.join(",")}-${index}`}>
                              <td>{route.host}</td>
                              <td>{formatRouteMatch(host, index)}</td>
                              <td>{route.upstreams.join(", ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="hosts-section">
                  <div className="hosts-section-header">
                    <h4>Containers</h4>
                    <small>{host.containers.length} containers</small>
                  </div>
                  {host.containers.length === 0 ? (
                    <div className="hosts-section-empty">No container data available.</div>
                  ) : (
                    <div className="hosts-table-wrap">
                      <table className="hosts-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Status</th>
                            <th>Ports</th>
                          </tr>
                        </thead>
                        <tbody>
                          {host.containers.map((container) => (
                            <tr key={container.id}>
                              <td>
                                <strong>{container.name}</strong>
                              </td>
                              <td>{container.image}</td>
                              <td>
                                <span className={`hosts-container-state hosts-container-state-${container.state.toLowerCase()}`}>
                                  {container.status}
                                </span>
                              </td>
                              <td>{formatContainerPorts(container.ports)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
