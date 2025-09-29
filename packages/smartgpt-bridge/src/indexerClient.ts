import type {
  ScheduleResponse,
  ControlResponse,
} from "@promethean/indexer-service/client";
import {
  createIndexerServiceClient,
  IndexerServiceError,
} from "@promethean/indexer-service/client";
import {
  indexerManager as localIndexerManager,
  search as localSearch,
} from "./indexer.js";

const SERVICE_URL =
  process.env.INDEXER_SERVICE_URL || process.env.SMARTGPT_INDEXER_URL || "";

const serviceClient = SERVICE_URL
  ? createIndexerServiceClient({
      baseUrl: SERVICE_URL.endsWith("/") ? SERVICE_URL : `${SERVICE_URL}/`,
    })
  : null;

function unwrapStatus(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const maybe = payload as { status?: unknown };
  if (maybe.status && typeof maybe.status === "object") {
    return maybe.status as Record<string, unknown>;
  }
  return payload as Record<string, unknown>;
}

export const usingIndexerService = () => serviceClient !== null;

export async function ensureIndexerBootstrap(rootPath: string): Promise<void> {
  if (serviceClient) {
    try {
      await serviceClient.reset();
      return;
    } catch (error: unknown) {
      if (error instanceof IndexerServiceError) {
        if (error.status === 409) return;
      }
      throw error;
    }
  }
  await localIndexerManager.ensureBootstrap(rootPath);
}

export async function getIndexerStatus(): Promise<Record<string, unknown>> {
  if (serviceClient) {
    const payload = await serviceClient.status();
    return unwrapStatus(payload);
  }
  return localIndexerManager.status();
}

export async function scheduleReindexAll(): Promise<ScheduleResponse> {
  if (serviceClient) {
    return serviceClient.reindexAll();
  }
  return localIndexerManager.scheduleReindexAll();
}

export async function scheduleReindexSubset(
  globs: string | string[],
): Promise<ScheduleResponse> {
  if (serviceClient) {
    return serviceClient.reindexFiles(globs);
  }
  return localIndexerManager.scheduleReindexSubset(globs);
}

export async function scheduleIndexFile(
  path: string,
): Promise<ScheduleResponse> {
  if (serviceClient) {
    return serviceClient.indexPath(path);
  }
  return localIndexerManager.scheduleIndexFile(path);
}

export async function removeIndexedPath(
  path: string,
): Promise<ControlResponse> {
  if (serviceClient) {
    return serviceClient.removePath(path);
  }
  return localIndexerManager.removeFile(path);
}

export async function resetIndexer(rootPath: string): Promise<void> {
  if (serviceClient) {
    await serviceClient.reset();
    return;
  }
  await localIndexerManager.resetAndBootstrap(rootPath);
}

export async function isIndexerBusy(): Promise<boolean> {
  if (serviceClient) {
    const status = await getIndexerStatus();
    const active = Boolean(status.active);
    const queued = Number(status.queuedFiles || status.queue || 0);
    return active || queued > 0;
  }
  return localIndexerManager.isBusy();
}

export async function searchIndex(
  rootPath: string,
  query: string,
  n = 8,
): Promise<unknown[]> {
  if (serviceClient) {
    const payload = await serviceClient.search(query, n);
    const { results } = payload;
    return Array.isArray(results) ? results : [];
  }
  return localSearch(rootPath, query, n);
}
