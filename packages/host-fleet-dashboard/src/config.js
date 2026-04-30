const DEFAULT_TARGETS = Object.freeze([
  {
    id: 'ussy',
    label: 'ussy.promethean.rest',
    mode: 'local',
    publicBaseUrl: 'https://ussy.promethean.rest/fleet',
    routeFiles: ['/workspace/services/proxx/Caddyfile'],
    notes: 'primary',
  },
  {
    id: 'ussy3',
    label: 'ussy3.promethean.rest',
    mode: 'remote-http',
    publicBaseUrl: 'https://ussy3.promethean.rest/fleet',
    notes: 'staging',
  },
]);

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeMode(value) {
  const normalized = String(value ?? 'remote-http').trim().toLowerCase();
  if (normalized === 'local' || normalized === 'remote-http' || normalized === 'remote_http' || normalized === 'http') {
    return normalized === 'local' ? 'local' : 'remote-http';
  }
  return null;
}

function normalizeTarget(target) {
  if (!target || typeof target !== 'object') {
    return null;
  }

  const id = typeof target.id === 'string' ? target.id.trim() : '';
  const label = typeof target.label === 'string' ? target.label.trim() : '';
  const mode = normalizeMode(target.mode ?? 'remote-http');
  if (!id || !label || !mode) {
    return null;
  }

  const routeFiles = Array.isArray(target.routeFiles)
    ? [...new Set(target.routeFiles.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean))]
    : [];

  return {
    id,
    label,
    mode,
    publicBaseUrl: typeof target.publicBaseUrl === 'string' && target.publicBaseUrl.trim()
      ? target.publicBaseUrl.trim().replace(/\/+$/, '')
      : undefined,
    routeFiles,
    notes: typeof target.notes === 'string' && target.notes.trim() ? target.notes.trim() : undefined,
    authToken: typeof target.authToken === 'string' && target.authToken.trim() ? target.authToken.trim() : undefined,
    authTokenEnv: typeof target.authTokenEnv === 'string' && target.authTokenEnv.trim() ? target.authTokenEnv.trim() : undefined,
  };
}

export function loadTargetsFromEnv(env = process.env) {
  const raw = typeof env.HOST_FLEET_TARGETS_JSON === 'string' ? env.HOST_FLEET_TARGETS_JSON.trim() : '';
  if (!raw) {
    return DEFAULT_TARGETS;
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('HOST_FLEET_TARGETS_JSON must be a JSON array');
  }

  const targets = parsed.map(normalizeTarget).filter(Boolean);
  if (targets.length === 0) {
    throw new Error('HOST_FLEET_TARGETS_JSON did not contain any valid targets');
  }

  return Object.freeze(targets);
}

export function resolveTargetAuthToken(target, env = process.env, fallbackToken = '') {
  if (target.authToken) {
    return target.authToken;
  }
  if (target.authTokenEnv) {
    const token = typeof env[target.authTokenEnv] === 'string' ? env[target.authTokenEnv].trim() : '';
    if (token) {
      return token;
    }
  }
  return fallbackToken;
}

export function loadConfig(env = process.env) {
  const port = parsePositiveInteger(env.HOST_FLEET_DASHBOARD_PORT ?? env.PORT ?? env.WEB_PORT, 8791);
  const authToken = typeof env.HOST_FLEET_DASHBOARD_AUTH_TOKEN === 'string'
    ? env.HOST_FLEET_DASHBOARD_AUTH_TOKEN.trim()
    : '';

  return {
    host: typeof env.HOST_FLEET_DASHBOARD_HOST === 'string' && env.HOST_FLEET_DASHBOARD_HOST.trim()
      ? env.HOST_FLEET_DASHBOARD_HOST.trim()
      : '0.0.0.0',
    port,
    authToken,
    allowUnauthenticated: parseBoolean(env.HOST_FLEET_DASHBOARD_ALLOW_UNAUTHENTICATED, false),
    requestTimeoutMs: parsePositiveInteger(env.HOST_FLEET_REQUEST_TIMEOUT_MS, 10000),
    dockerSocketPath: typeof env.HOST_FLEET_DOCKER_SOCKET_PATH === 'string' && env.HOST_FLEET_DOCKER_SOCKET_PATH.trim()
      ? env.HOST_FLEET_DOCKER_SOCKET_PATH.trim()
      : '/var/run/docker.sock',
    selfTargetId: typeof env.HOST_FLEET_SELF_TARGET_ID === 'string' && env.HOST_FLEET_SELF_TARGET_ID.trim()
      ? env.HOST_FLEET_SELF_TARGET_ID.trim()
      : undefined,
    targets: loadTargetsFromEnv(env),
  };
}
