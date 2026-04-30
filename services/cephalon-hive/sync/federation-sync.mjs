#!/usr/bin/env node

const baseUrl = (process.env.CEPHALON_FEDERATION_SYNC_BASE_URL ?? 'http://proxx:8789').replace(/\/+$/, '');
const authToken = (process.env.CEPHALON_FEDERATION_SYNC_AUTH_TOKEN ?? process.env.PROXX_PROXY_AUTH_TOKEN ?? '').trim();
const ownerSubject = (process.env.CEPHALON_FEDERATION_SYNC_OWNER_SUBJECT ?? process.env.PROXX_FEDERATION_DEFAULT_OWNER_SUBJECT ?? 'did:web:proxx.promethean.rest:brethren').trim();
const peerId = (process.env.CEPHALON_FEDERATION_SYNC_PEER_ID ?? 'hub-local-proxx').trim();
const importProvidersMode = (process.env.CEPHALON_FEDERATION_SYNC_IMPORT_PROVIDERS ?? 'auto').trim();
const bridgeAgentId = (process.env.CEPHALON_FEDERATION_SYNC_BRIDGE_AGENT_ID ?? '').trim();
const bridgeImportProvidersMode = (process.env.CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_PROVIDERS ?? '').trim();
const bridgeImportLimit = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_LIMIT, 500);
const bridgeRefreshBufferMs = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_BRIDGE_REFRESH_BUFFER_MS, 10 * 60_000);
const intervalMs = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_INTERVAL_MS, 300_000);
const initialDelayMs = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_INITIAL_DELAY_MS, 15_000);
const jitterMs = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_JITTER_MS, 10_000);
const requestTimeoutMs = parsePositiveInt(process.env.CEPHALON_FEDERATION_SYNC_REQUEST_TIMEOUT_MS, 45_000);

let stopped = false;

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function log(message, extra) {
  const prefix = `[federation-sync ${new Date().toISOString()}]`;
  if (extra === undefined) {
    console.log(`${prefix} ${message}`);
    return;
  }
  console.log(`${prefix} ${message} ${JSON.stringify(extra)}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    const text = await response.text();
    const data = text.length > 0 ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.error ?? data?.detail ?? `request failed with ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function resolveProviderAllowList(projectedAccounts) {
  const mode = importProvidersMode.toLowerCase();
  if (!mode || mode === 'auto' || mode === 'all') {
    return null;
  }
  const providers = mode.split(',').map((entry) => entry.trim()).filter(Boolean);
  return new Set(providers);
}

function resolveBridgeImportProviders() {
  const mode = bridgeImportProvidersMode.toLowerCase();
  if (!mode || mode === 'none' || mode === 'off' || mode === 'false') {
    return [];
  }
  return [...new Set(mode.split(',').map((entry) => entry.trim()).filter(Boolean))];
}

async function syncOnce() {
  const health = await requestJson('/health', { method: 'GET' });
  log('health ok', {
    upstreamProvider: health?.keyPool?.providerId ?? null,
    openaiAvailable: health?.keyPoolProviders?.openai?.availableAccounts ?? null,
    openaiTotal: health?.keyPoolProviders?.openai?.totalAccounts ?? null,
  });

  const pullResult = await requestJson('/api/ui/federation/sync/pull', {
    method: 'POST',
    body: JSON.stringify({
      peerId,
      ownerSubject,
      pullUsage: false,
    }),
  });

  const accounts = await requestJson(`/api/ui/federation/accounts?ownerSubject=${encodeURIComponent(ownerSubject)}`, {
    method: 'GET',
  });

  const projectedAccounts = Array.isArray(accounts?.projectedAccounts) ? accounts.projectedAccounts : [];
  const providerAllowList = resolveProviderAllowList(projectedAccounts);

  const pendingProviders = [...new Set(
    projectedAccounts
      .filter((account) => account?.sourcePeerId === peerId)
      .map((account) => String(account.providerId ?? '').trim())
      .filter(Boolean)
      .filter((providerId) => !providerAllowList || providerAllowList.has(providerId))
  )];

  const importSummary = [];
  for (const providerId of pendingProviders) {
    const result = await requestJson('/api/ui/federation/projected-accounts/import-all', {
      method: 'POST',
      body: JSON.stringify({
        sourcePeerId: peerId,
        providerId,
      }),
    });
    importSummary.push({
      providerId,
      imported: result?.imported ?? 0,
      failed: result?.failed ?? 0,
    });
  }

  const bridgeImportSummary = [];
  const bridgeImportProviders = bridgeAgentId ? resolveBridgeImportProviders() : [];
  for (const providerId of bridgeImportProviders) {
    const result = await requestJson('/api/ui/federation/bridges/lease/import', {
      method: 'POST',
      body: JSON.stringify({
        agentId: bridgeAgentId,
        providerId,
        limit: bridgeImportLimit,
        refreshBufferMs: bridgeRefreshBufferMs,
      }),
    });

    bridgeImportSummary.push({
      providerId,
      remoteAccountCount: result?.remoteAccountCount ?? 0,
      plannedImportCount: result?.plannedImportCount ?? 0,
      imported: result?.imported ?? 0,
      refreshed: result?.refreshed ?? 0,
      skipped: result?.skipped ?? 0,
      failed: result?.failed ?? 0,
    });
  }

  log('sync complete', {
    peerId,
    ownerSubject,
    importedProjectedAccountsCount: pullResult?.importedProjectedAccountsCount ?? 0,
    remoteDiffCount: pullResult?.remoteDiffCount ?? 0,
    pendingProviders,
    importSummary,
    bridgeAgentId: bridgeAgentId || null,
    bridgeImportSummary,
  });
}

async function main() {
  if (!authToken) {
    throw new Error('CEPHALON_FEDERATION_SYNC_AUTH_TOKEN or PROXX_PROXY_AUTH_TOKEN is required');
  }

  log('starting', {
    baseUrl,
    peerId,
    ownerSubject,
    intervalMs,
    initialDelayMs,
    jitterMs,
    importProvidersMode,
    bridgeAgentId: bridgeAgentId || null,
    bridgeImportProvidersMode,
  });

  if (initialDelayMs > 0) {
    await sleep(initialDelayMs);
  }

  while (!stopped) {
    try {
      await syncOnce();
    } catch (error) {
      log('sync failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (stopped) break;
    const jitter = jitterMs > 0 ? Math.floor(Math.random() * jitterMs) : 0;
    await sleep(intervalMs + jitter);
  }
}

process.on('SIGINT', () => {
  stopped = true;
  log('received SIGINT, stopping');
});
process.on('SIGTERM', () => {
  stopped = true;
  log('received SIGTERM, stopping');
});

main().catch((error) => {
  log('fatal', { error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
});
