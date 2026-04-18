import type { ProxyConfig } from "./config.js";
import type { KeyPool, ProviderCredential } from "./key-pool.js";
import type { ProviderRoute, ResolvedModelCatalog } from "./provider-routing.js";
import { parseModelIdsFromCatalogPayload, buildLargestModelAliases, dedupeModelIds } from "./provider-routing.js";
import { fetchWithResponseTimeout } from "./provider-utils.js";
import { loadModelPreferences, type ModelPreferences } from "./models.js";

export interface ProviderCatalogEntry {
  readonly providerId: string;
  readonly modelIds: readonly string[];
  readonly fetchedAt: number;
  readonly stale: boolean;
  readonly sourceEndpoints: readonly string[];
}

export interface ResolvedCatalogWithPreferences {
  readonly catalog: ResolvedModelCatalog;
  readonly providerCatalogs: Readonly<Record<string, ProviderCatalogEntry>>;
  readonly preferences: ModelPreferences;
}

interface CachedCatalog {
  readonly expiresAt: number;
  readonly resolved: ResolvedCatalogWithPreferences;
}

function providerModelCatalogPaths(providerId: string): string[] {
  const normalizedProviderId = providerId.trim().toLowerCase();
  if (normalizedProviderId === "zai") {
    return ["/models"];
  }

  return ["/v1/models"];
}

function uniqueOrdered(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function filterDisabled(models: readonly string[], disabled: readonly string[]): string[] {
  if (disabled.length === 0) {
    return [...models];
  }
  const disabledSet = new Set(disabled.map((entry) => entry.trim()).filter((entry) => entry.length > 0));
  return models.filter((modelId) => !disabledSet.has(modelId));
}

function orderPreferredFirst(models: readonly string[], preferred: readonly string[]): string[] {
  if (preferred.length === 0) {
    return [...models];
  }
  const preferredSet = new Set(preferred.map((entry) => entry.trim()).filter((entry) => entry.length > 0));
  const preferredModels: string[] = [];
  const remaining: string[] = [];
  for (const modelId of models) {
    if (preferredSet.has(modelId)) {
      preferredModels.push(modelId);
    } else {
      remaining.push(modelId);
    }
  }
  return [...preferredModels, ...remaining];
}

function extractPreferredDiscovered(preferred: readonly string[], discovered: readonly string[]): string[] {
  const discoveredSet = new Set(discovered);
  return preferred.filter((entry) => discoveredSet.has(entry));
}

function buildPreferredAliasTargets(preferredAliases: Readonly<Record<string, string>>, discovered: readonly string[]): Record<string, string> {
  const discoveredSet = new Set(discovered);
  const aliases: Record<string, string> = {};
  for (const [alias, target] of Object.entries(preferredAliases)) {
    if (discoveredSet.has(target)) {
      aliases[alias] = target;
    }
  }
  return aliases;
}

export class ProviderCatalogStore {
  private cached: CachedCatalog | null = null;
  private readonly ttlMs: number;

  constructor(
    private readonly config: ProxyConfig,
    private readonly keyPool: KeyPool,
    private readonly routes: readonly ProviderRoute[],
    private readonly ollamaRoutes: readonly ProviderRoute[],
  ) {
    this.ttlMs = Math.max(5_000, Math.min(120_000, Math.trunc(config.keyReloadMs)));
  }

  public async getCatalog(forceRefresh = false): Promise<ResolvedCatalogWithPreferences> {
    const now = Date.now();
    if (!forceRefresh && this.cached && this.cached.expiresAt > now) {
      return this.cached.resolved;
    }

    const preferences = await loadModelPreferences(this.config.modelsFilePath, []);
    const providerCatalogs: Record<string, ProviderCatalogEntry> = {};
    const discoveredModels: string[] = [];

    for (const route of this.routes) {
      const sourceEndpoints = providerModelCatalogPaths(route.providerId);
      const providerModels = await this.fetchProviderModelCatalog(route, sourceEndpoints);
      if (providerModels.length > 0) {
        providerCatalogs[route.providerId] = {
          providerId: route.providerId,
          modelIds: providerModels,
          fetchedAt: Date.now(),
          stale: false,
          sourceEndpoints,
        };
        discoveredModels.push(...providerModels);
      }
    }

    for (const route of this.ollamaRoutes) {
      const providerModels = await this.fetchProviderModelCatalog(route, ["/v1/models", "/api/tags"]);
      if (providerModels.length > 0) {
        const existing = providerCatalogs[route.providerId];
        if (existing) {
          providerCatalogs[route.providerId] = {
            ...existing,
            modelIds: uniqueOrdered([...existing.modelIds, ...providerModels]),
          };
        } else {
          providerCatalogs[route.providerId] = {
            providerId: route.providerId,
            modelIds: providerModels,
            fetchedAt: Date.now(),
            stale: false,
            sourceEndpoints: ["/v1/models", "/api/tags"],
          };
        }
        discoveredModels.push(...providerModels);
      }
    }

    const dedupedDiscovered = dedupeModelIds(discoveredModels);
    const disabledFiltered = filterDisabled(dedupedDiscovered, preferences.disabled);
    const preferredDiscovered = extractPreferredDiscovered(preferences.preferred, disabledFiltered);
    const orderedModels = orderPreferredFirst(disabledFiltered, preferredDiscovered);

    const ollamaModelIds = dedupeModelIds(
      this.ollamaRoutes.flatMap((route) => providerCatalogs[route.providerId]?.modelIds ?? [])
    );
    const aliasTargets = {
      ...buildLargestModelAliases(ollamaModelIds),
      ...buildPreferredAliasTargets(preferences.aliases, disabledFiltered),
    };
    const aliasIds = Object.keys(aliasTargets);
    const modelIds = dedupeModelIds([...orderedModels, ...aliasIds]);

    const resolvedCatalog: ResolvedModelCatalog = {
      modelIds,
      aliasTargets,
      dynamicOllamaModelIds: ollamaModelIds,
    };

    const resolved = {
      catalog: resolvedCatalog,
      providerCatalogs,
      preferences: {
        preferred: preferredDiscovered,
        disabled: preferences.disabled,
        aliases: preferences.aliases,
      },
    };

    this.cached = {
      expiresAt: now + this.ttlMs,
      resolved,
    };

    return resolved;
  }

  public async isModelAvailable(providerId: string, modelId: string): Promise<boolean> {
    const resolved = await this.getCatalog(false);
    const entry = resolved.providerCatalogs[providerId];
    if (!entry) {
      return false;
    }
    return entry.modelIds.includes(modelId);
  }

  private async fetchProviderModelCatalog(
    route: ProviderRoute,
    candidatePaths: readonly string[] = ["/v1/models"],
  ): Promise<string[]> {
    let accounts: ProviderCredential[];
    try {
      accounts = await this.keyPool.getAllAccounts(route.providerId);
    } catch {
      return [];
    }

    if (accounts.length === 0) {
      return [];
    }

    for (const account of accounts) {
      for (const candidatePath of candidatePaths) {
        const normalizedBase = route.baseUrl.replace(/\/+$/, "");
        const normalizedPath = candidatePath.startsWith("/") ? candidatePath : `/${candidatePath}`;
        const url = `${normalizedBase}${normalizedPath}`;
        let response: Response;
        try {
          response = await fetchWithResponseTimeout(url, {
            method: "GET",
            headers: {
              authorization: `Bearer ${account.token}`,
              accept: "application/json",
            },
          }, Math.min(this.config.requestTimeoutMs, 45_000));
        } catch {
          continue;
        }

        if (!response.ok) {
          try {
            await response.arrayBuffer();
          } catch {
            // ignore body read failures
          }
          continue;
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          continue;
        }

        const modelIds = parseModelIdsFromCatalogPayload(payload);
        if (modelIds.length > 0) {
          return modelIds;
        }
      }
    }

    return [];
  }
}
