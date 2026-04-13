import { request as httpRequest } from 'node:http';
import { readFile } from 'node:fs/promises';

import { parseCaddyRoutes, parseDockerPsLines } from './parse.js';
import { resolveTargetAuthToken } from './config.js';

function hostSummary(snapshot) {
  return {
    containerCount: snapshot.containers.length,
    runningCount: snapshot.containers.filter((container) => container.state === 'running').length,
    healthyCount: snapshot.containers.filter((container) => container.status.toLowerCase().includes('healthy')).length,
    routeCount: snapshot.routes.length,
  };
}

function normalizeSnapshot(target, partial, overrides = {}) {
  const containers = Array.isArray(partial.containers) ? partial.containers : [];
  const routes = Array.isArray(partial.routes) ? partial.routes : [];
  const errors = Array.isArray(partial.errors) ? partial.errors.filter((entry) => typeof entry === 'string') : [];
  return {
    id: target.id,
    label: target.label,
    mode: target.mode,
    publicBaseUrl: target.publicBaseUrl,
    notes: target.notes,
    fetchedAt: typeof partial.fetchedAt === 'string' && partial.fetchedAt ? partial.fetchedAt : new Date().toISOString(),
    reachable: partial.reachable !== false && (errors.length === 0 || containers.length > 0 || routes.length > 0),
    errors,
    containers,
    routes,
    routeFile: typeof partial.routeFile === 'string' ? partial.routeFile : undefined,
    summary: hostSummary({ containers, routes }),
    ...overrides,
  };
}

async function dockerRequestJson(socketPath, path, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      socketPath,
      path,
      method: 'GET',
      headers: { Host: 'docker' },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if ((response.statusCode ?? 500) >= 400) {
          reject(new Error(`docker API ${response.statusCode ?? 500}: ${body || 'request failed'}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('docker socket request timed out'));
    });
    req.on('error', reject);
    req.end();
  });
}

async function collectLocalContainers(config) {
  const rows = await dockerRequestJson(config.dockerSocketPath, '/containers/json?all=1', config.requestTimeoutMs);
  const lines = rows.map((row) => JSON.stringify({
    ID: row.Id ? String(row.Id).slice(0, 12) : 'unknown',
    Image: typeof row.Image === 'string' ? row.Image : 'unknown',
    Names: Array.isArray(row.Names) && typeof row.Names[0] === 'string' ? row.Names[0].replace(/^\//, '') : 'unknown',
    State: typeof row.State === 'string' ? row.State : 'unknown',
    Status: typeof row.Status === 'string' ? row.Status : 'unknown',
    Ports: Array.isArray(row.Ports)
      ? row.Ports.map((port) => {
        const protocol = typeof port.Type === 'string' && port.Type ? port.Type : 'tcp';
        if (typeof port.PublicPort === 'number' && typeof port.PrivatePort === 'number') {
          const host = typeof port.IP === 'string' && port.IP ? port.IP : '0.0.0.0';
          return `${host}:${port.PublicPort}->${port.PrivatePort}/${protocol}`;
        }
        if (typeof port.PrivatePort === 'number') {
          return `${port.PrivatePort}/${protocol}`;
        }
        return protocol;
      }).join(', ')
      : '',
  }));
  return parseDockerPsLines(lines.join('\n'));
}

async function collectLocalRoutes(target) {
  const routeFiles = Array.isArray(target.routeFiles) ? target.routeFiles : [];
  for (const file of routeFiles) {
    try {
      const text = await readFile(file, 'utf8');
      if (text.trim()) {
        return {
          routeFile: file,
          routes: parseCaddyRoutes(text),
        };
      }
    } catch {
      // continue to next candidate
    }
  }

  throw new Error('no readable route file configured');
}

export async function collectLocalSnapshot(target, config) {
  const errors = [];
  let containers = [];
  let routes = [];
  let routeFile;

  try {
    containers = await collectLocalContainers(config);
  } catch (error) {
    errors.push(`containers: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const routeData = await collectLocalRoutes(target);
    routes = routeData.routes;
    routeFile = routeData.routeFile;
  } catch (error) {
    errors.push(`routes: ${error instanceof Error ? error.message : String(error)}`);
  }

  return normalizeSnapshot(target, {
    fetchedAt: new Date().toISOString(),
    reachable: errors.length === 0 || containers.length > 0 || routes.length > 0,
    errors,
    containers,
    routes,
    routeFile,
  });
}

function unavailableSnapshot(target, error) {
  return normalizeSnapshot(target, {
    reachable: false,
    errors: [error],
    containers: [],
    routes: [],
    routeFile: undefined,
  });
}

export async function collectRemoteSnapshot(target, config) {
  if (!target.publicBaseUrl) {
    return unavailableSnapshot(target, 'target publicBaseUrl is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const headers = new Headers();
    const token = resolveTargetAuthToken(target, process.env, config.authToken);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${target.publicBaseUrl}/api/self`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload.error === 'string' ? payload.error : `request failed with ${response.status}`;
      return unavailableSnapshot(target, detail);
    }

    if (
      typeof payload !== 'object'
      || payload === null
      || !Array.isArray(payload.containers)
      || !Array.isArray(payload.routes)
      || !Array.isArray(payload.errors)
    ) {
      return unavailableSnapshot(target, 'remote host returned an invalid self snapshot');
    }

    return normalizeSnapshot(target, payload, {
      mode: target.mode,
      publicBaseUrl: target.publicBaseUrl,
      notes: target.notes,
    });
  } catch (error) {
    return unavailableSnapshot(target, error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timeout);
  }
}

export function getSelfTarget(config) {
  const explicit = config.selfTargetId
    ? config.targets.find((target) => target.id === config.selfTargetId)
    : undefined;
  if (explicit) {
    return explicit;
  }

  return config.targets.find((target) => target.mode === 'local') ?? config.targets[0];
}

export async function collectSelfSnapshot(config) {
  const target = getSelfTarget(config);
  if (!target) {
    throw new Error('no host targets configured');
  }
  if (target.mode !== 'local') {
    throw new Error(`self target ${target.id} is not configured as local`);
  }
  return collectLocalSnapshot(target, config);
}

export async function collectAllHosts(config) {
  return Promise.all(config.targets.map((target) => {
    if (target.mode === 'local') {
      return collectLocalSnapshot(target, config);
    }
    return collectRemoteSnapshot(target, config);
  }));
}
