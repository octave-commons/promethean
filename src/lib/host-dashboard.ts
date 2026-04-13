import { request as httpRequest } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface HostDashboardTarget {
  readonly id: string;
  readonly label: string;
  readonly baseUrl?: string;
  readonly publicHost?: string;
  readonly authToken?: string;
  readonly authTokenEnv?: string;
  readonly notes?: string;
}

export interface HostDashboardContainerSummary {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly state: string;
  readonly status: string;
  readonly ports: readonly string[];
}

export interface HostDashboardRouteSummary {
  readonly host: string;
  readonly matcher?: string;
  readonly matchPaths: readonly string[];
  readonly upstreams: readonly string[];
}

export interface HostDashboardSummary {
  readonly containerCount: number;
  readonly runningCount: number;
  readonly healthyCount: number;
  readonly routeCount: number;
}

export interface HostDashboardSnapshot {
  readonly id: string;
  readonly label: string;
  readonly source: "local" | "remote";
  readonly fetchedAt: string;
  readonly reachable: boolean;
  readonly baseUrl?: string;
  readonly publicHost?: string;
  readonly notes?: string;
  readonly errors: readonly string[];
  readonly containers: readonly HostDashboardContainerSummary[];
  readonly routes: readonly HostDashboardRouteSummary[];
  readonly summary: HostDashboardSummary;
}

interface DockerContainerRow {
  readonly Id?: string;
  readonly Names?: readonly string[];
  readonly Image?: string;
  readonly State?: string;
  readonly Status?: string;
  readonly Ports?: readonly DockerPortRow[];
}

interface DockerPortRow {
  readonly IP?: string;
  readonly PrivatePort?: number;
  readonly PublicPort?: number;
  readonly Type?: string;
}

const DEFAULT_HOST_DASHBOARD_TARGETS: readonly HostDashboardTarget[] = [
  {
    id: "ussy",
    label: "ussy.promethean.rest",
    baseUrl: "https://ussy.promethean.rest",
    publicHost: "ussy.promethean.rest",
    authTokenEnv: "HOST_DASHBOARD_USSY_TOKEN",
  },
  {
    id: "ussy3",
    label: "ussy3.promethean.rest",
    baseUrl: "https://ussy3.promethean.rest",
    publicHost: "ussy3.promethean.rest",
    authTokenEnv: "HOST_DASHBOARD_USSY3_TOKEN",
  },
];

function normalizeHost(value: string | undefined): string {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return value.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))];
}

function summarizeSnapshot(input: {
  readonly containers: readonly HostDashboardContainerSummary[];
  readonly routes: readonly HostDashboardRouteSummary[];
}): HostDashboardSummary {
  return {
    containerCount: input.containers.length,
    runningCount: input.containers.filter((container) => container.state === "running").length,
    healthyCount: input.containers.filter((container) => container.status.toLowerCase().includes("healthy")).length,
    routeCount: input.routes.length,
  };
}

function unavailableSnapshot(target: HostDashboardTarget, source: "local" | "remote", error: string): HostDashboardSnapshot {
  return {
    id: target.id,
    label: target.label,
    source,
    fetchedAt: new Date().toISOString(),
    reachable: false,
    baseUrl: target.baseUrl,
    publicHost: target.publicHost,
    notes: target.notes,
    errors: [error],
    containers: [],
    routes: [],
    summary: summarizeSnapshot({ containers: [], routes: [] }),
  };
}

function countChar(value: string, needle: string): number {
  let count = 0;
  for (const char of value) {
    if (char === needle) {
      count += 1;
    }
  }
  return count;
}

function formatDockerPorts(ports: readonly DockerPortRow[] | undefined): readonly string[] {
  if (!Array.isArray(ports) || ports.length === 0) {
    return [];
  }

  return ports.map((port) => {
    const protocol = typeof port.Type === "string" && port.Type.length > 0 ? port.Type : "tcp";
    if (typeof port.PublicPort === "number" && typeof port.PrivatePort === "number") {
      const host = typeof port.IP === "string" && port.IP.length > 0 ? port.IP : "0.0.0.0";
      return `${host}:${port.PublicPort}->${port.PrivatePort}/${protocol}`;
    }

    if (typeof port.PrivatePort === "number") {
      return `${port.PrivatePort}/${protocol}`;
    }

    return protocol;
  });
}

function sanitizeTarget(candidate: unknown): HostDashboardTarget | undefined {
  if (typeof candidate !== "object" || candidate === null) {
    return undefined;
  }

  const record = candidate as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const label = typeof record.label === "string" ? record.label.trim() : "";
  if (id.length === 0 || label.length === 0) {
    return undefined;
  }

  const baseUrl = typeof record.baseUrl === "string" && record.baseUrl.trim().length > 0
    ? record.baseUrl.trim().replace(/\/+$/, "")
    : undefined;
  const publicHost = typeof record.publicHost === "string" && record.publicHost.trim().length > 0
    ? record.publicHost.trim()
    : undefined;
  const authToken = typeof record.authToken === "string" && record.authToken.trim().length > 0
    ? record.authToken.trim()
    : undefined;
  const authTokenEnv = typeof record.authTokenEnv === "string" && record.authTokenEnv.trim().length > 0
    ? record.authTokenEnv.trim()
    : undefined;
  const notes = typeof record.notes === "string" && record.notes.trim().length > 0
    ? record.notes.trim()
    : undefined;

  return {
    id,
    label,
    baseUrl,
    publicHost,
    authToken,
    authTokenEnv,
    notes,
  };
}

export function loadHostDashboardTargetsFromEnv(env: NodeJS.ProcessEnv): readonly HostDashboardTarget[] {
  const raw = env.HOST_DASHBOARD_TARGETS_JSON?.trim();
  if (!raw) {
    return DEFAULT_HOST_DASHBOARD_TARGETS;
  }

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("HOST_DASHBOARD_TARGETS_JSON must be a JSON array");
  }

  const targets = parsed
    .map((candidate) => sanitizeTarget(candidate))
    .filter((candidate): candidate is HostDashboardTarget => candidate !== undefined);

  if (targets.length === 0) {
    throw new Error("HOST_DASHBOARD_TARGETS_JSON did not contain any valid targets");
  }

  return targets;
}

export function resolveHostDashboardTargetToken(target: HostDashboardTarget, env: NodeJS.ProcessEnv): string | undefined {
  if (target.authToken) {
    return target.authToken;
  }

  if (target.authTokenEnv) {
    const token = env[target.authTokenEnv]?.trim();
    if (token && token.length > 0) {
      return token;
    }
  }

  return undefined;
}

export function inferSelfHostDashboardTargetId(input: {
  readonly targets: readonly HostDashboardTarget[];
  readonly explicitSelfId?: string;
  readonly requestBaseUrl?: string;
  readonly requestHost?: string;
}): string | undefined {
  const explicit = input.explicitSelfId?.trim();
  if (explicit && input.targets.some((target) => target.id === explicit)) {
    return explicit;
  }

  const requestHosts = uniqueStrings([
    normalizeHost(input.requestBaseUrl),
    normalizeHost(input.requestHost),
  ]);

  for (const target of input.targets) {
    const candidates = uniqueStrings([
      normalizeHost(target.baseUrl),
      normalizeHost(target.publicHost),
    ]);
    if (candidates.some((candidate) => requestHosts.includes(candidate))) {
      return target.id;
    }
  }

  return undefined;
}

export function parseCaddyRoutes(source: string): readonly HostDashboardRouteSummary[] {
  const lines = source.split(/\r?\n/);
  const routes: HostDashboardRouteSummary[] = [];
  let currentHosts: readonly string[] = [];
  let depth = 0;
  let matchers = new Map<string, readonly string[]>();

  for (const rawLine of lines) {
    const withoutComment = rawLine.replace(/\s+#.*$/, "");
    const line = withoutComment.trim();
    if (line.length === 0) {
      continue;
    }

    if (depth <= 0) {
      const siteMatch = line.match(/^([^@][^{]+?)\s*\{$/);
      if (!siteMatch) {
        continue;
      }

      currentHosts = uniqueStrings(
        siteMatch[1]
          .split(/[\s,]+/)
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0 && !entry.includes("__PUBLIC_HOST__")),
      );
      depth = 1;
      matchers = new Map<string, readonly string[]>();
      continue;
    }

    if (line.startsWith("@")) {
      const parts = line.split(/\s+/);
      if (parts.length >= 3 && parts[1] === "path") {
        matchers.set(parts[0], parts.slice(2));
      }
    } else if (line.startsWith("reverse_proxy")) {
      if (line.includes("{")) {
        continue;
      }

      const parts = line.split(/\s+/).slice(1);
      const matcher = parts[0]?.startsWith("@") ? parts[0] : undefined;
      const upstreams = matcher ? parts.slice(1) : parts;
      for (const host of currentHosts) {
        routes.push({
          host,
          matcher,
          matchPaths: matcher ? (matchers.get(matcher) ?? []) : [],
          upstreams: uniqueStrings(upstreams),
        });
      }
    }

    depth += countChar(line, "{") - countChar(line, "}");
    if (depth <= 0) {
      currentHosts = [];
      matchers = new Map<string, readonly string[]>();
      depth = 0;
    }
  }

  return routes.sort((left, right) => {
    if (left.host !== right.host) {
      return left.host.localeCompare(right.host);
    }
    return left.upstreams.join(",").localeCompare(right.upstreams.join(","));
  });
}

async function dockerRequestJson<T>(socketPath: string, path: string): Promise<T> {
  return new Promise<T>((resolvePromise, reject) => {
    const req = httpRequest({
      socketPath,
      path,
      method: "GET",
      headers: {
        Host: "docker",
      },
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if ((response.statusCode ?? 500) >= 400) {
          reject(new Error(`docker API ${response.statusCode ?? 500}: ${body || "request failed"}`));
          return;
        }

        try {
          resolvePromise(JSON.parse(body) as T);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });

    req.setTimeout(5_000, () => {
      req.destroy(new Error("docker socket request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function listDockerContainers(socketPath: string): Promise<readonly HostDashboardContainerSummary[]> {
  const rows = await dockerRequestJson<readonly DockerContainerRow[]>(socketPath, "/containers/json?all=1");
  return rows
    .map((row) => ({
      id: typeof row.Id === "string" ? row.Id.slice(0, 12) : "unknown",
      name: Array.isArray(row.Names) && typeof row.Names[0] === "string" ? row.Names[0].replace(/^\//, "") : "unknown",
      image: typeof row.Image === "string" ? row.Image : "unknown",
      state: typeof row.State === "string" ? row.State : "unknown",
      status: typeof row.Status === "string" ? row.Status : "unknown",
      ports: formatDockerPorts(row.Ports),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function firstReadableFile(paths: readonly string[]): Promise<string | undefined> {
  for (const path of paths) {
    try {
      const content = await readFile(path, "utf8");
      if (content.trim().length > 0) {
        return content;
      }
    } catch {
      // Try next candidate.
    }
  }

  return undefined;
}

async function loadLocalCaddyRoutes(runtimeRoot: string | undefined): Promise<readonly HostDashboardRouteSummary[]> {
  const roots = uniqueStrings([
    runtimeRoot ?? "",
    process.cwd(),
  ]);

  const candidates = roots.flatMap((root) => {
    if (root.length === 0) {
      return [];
    }
    return [
      resolve(root, "Caddyfile"),
      resolve(root, "deploy/Caddyfile"),
      resolve(root, "deploy/Caddyfile.template"),
    ];
  });

  const text = await firstReadableFile(candidates);
  if (!text) {
    return [];
  }

  return parseCaddyRoutes(text);
}

export async function collectLocalHostDashboardSnapshot(input: {
  readonly target: HostDashboardTarget;
  readonly dockerSocketPath?: string;
  readonly runtimeRoot?: string;
}): Promise<HostDashboardSnapshot> {
  const errors: string[] = [];
  let containers: readonly HostDashboardContainerSummary[] = [];
  let routes: readonly HostDashboardRouteSummary[] = [];

  if (input.dockerSocketPath) {
    try {
      containers = await listDockerContainers(input.dockerSocketPath);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  } else {
    errors.push("docker socket not configured");
  }

  try {
    routes = await loadLocalCaddyRoutes(input.runtimeRoot);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return {
    id: input.target.id,
    label: input.target.label,
    source: "local",
    fetchedAt: new Date().toISOString(),
    reachable: errors.length === 0 || containers.length > 0 || routes.length > 0,
    baseUrl: input.target.baseUrl,
    publicHost: input.target.publicHost,
    notes: input.target.notes,
    errors,
    containers,
    routes,
    summary: summarizeSnapshot({ containers, routes }),
  };
}

export async function fetchRemoteHostDashboardSnapshot(input: {
  readonly target: HostDashboardTarget;
  readonly authToken?: string;
  readonly timeoutMs: number;
}): Promise<HostDashboardSnapshot> {
  const baseUrl = input.target.baseUrl?.trim();
  if (!baseUrl) {
    return unavailableSnapshot(input.target, "remote", "target baseUrl is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const headers = new Headers();
    if (input.authToken && input.authToken.length > 0) {
      headers.set("authorization", `Bearer ${input.authToken}`);
    }

    const response = await fetch(`${baseUrl}/api/ui/hosts/self`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    const parsed = text.length > 0 ? JSON.parse(text) as Partial<HostDashboardSnapshot> & { readonly error?: string } : {};
    if (!response.ok) {
      const detail = typeof parsed.error === "string" ? parsed.error : `request failed with ${response.status}`;
      return unavailableSnapshot(input.target, "remote", detail);
    }

    const containers = Array.isArray(parsed.containers)
      ? parsed.containers.filter((container): container is HostDashboardContainerSummary => typeof container === "object" && container !== null)
      : [];
    const routes = Array.isArray(parsed.routes)
      ? parsed.routes.filter((route): route is HostDashboardRouteSummary => typeof route === "object" && route !== null)
      : [];
    const errors = Array.isArray(parsed.errors)
      ? parsed.errors.filter((entry): entry is string => typeof entry === "string")
      : [];

    return {
      id: input.target.id,
      label: typeof parsed.label === "string" && parsed.label.trim().length > 0 ? parsed.label : input.target.label,
      source: "remote",
      fetchedAt: typeof parsed.fetchedAt === "string" && parsed.fetchedAt.trim().length > 0 ? parsed.fetchedAt : new Date().toISOString(),
      reachable: parsed.reachable !== false,
      baseUrl,
      publicHost: typeof parsed.publicHost === "string" && parsed.publicHost.trim().length > 0 ? parsed.publicHost : input.target.publicHost,
      notes: typeof parsed.notes === "string" && parsed.notes.trim().length > 0 ? parsed.notes : input.target.notes,
      errors,
      containers,
      routes,
      summary: summarizeSnapshot({ containers, routes }),
    };
  } catch (error) {
    return unavailableSnapshot(
      input.target,
      "remote",
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    clearTimeout(timeout);
  }
}
