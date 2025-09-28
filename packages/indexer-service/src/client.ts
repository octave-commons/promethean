import { URL } from "node:url";

export class IndexerServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "IndexerServiceError";
  }
}

export type IndexerServiceClientConfig = Readonly<{
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}>;

export type IndexerStatus = Record<string, unknown>;

export type ScheduleResponse = Readonly<{
  ok: boolean;
  queued?: number;
  ignored?: boolean;
  mode?: string;
}>;

export type ControlResponse = Readonly<{ ok: boolean; error?: string }>;

export type SearchResponse = Readonly<{ ok: boolean; results: unknown[] }>;

export class IndexerServiceClient {
  #base: URL;
  #fetch: typeof fetch;
  #headers: Record<string, string>;

  constructor(config: IndexerServiceClientConfig) {
    this.#base = new URL(
      config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`,
    );
    this.#fetch = config.fetchImpl ?? fetch;
    this.#headers = config.headers ?? {};
  }

  async status(signal?: AbortSignal): Promise<IndexerStatus> {
    const res = await this.#request("GET", "indexer/status", undefined, signal);
    return (await res.json()) as IndexerStatus;
  }

  async reset(signal?: AbortSignal): Promise<ControlResponse> {
    const res = await this.#request("POST", "indexer/reset", undefined, signal);
    return (await res.json()) as ControlResponse;
  }

  async reindexAll(signal?: AbortSignal): Promise<ScheduleResponse> {
    const res = await this.#request(
      "POST",
      "indexer/reindex",
      undefined,
      signal,
    );
    return (await res.json()) as ScheduleResponse;
  }

  async reindexFiles(
    path: string | string[],
    signal?: AbortSignal,
  ): Promise<ScheduleResponse> {
    const body = Array.isArray(path) ? { path } : { path };
    const res = await this.#request(
      "POST",
      "indexer/files/reindex",
      body,
      signal,
    );
    return (await res.json()) as ScheduleResponse;
  }

  async indexPath(
    path: string,
    signal?: AbortSignal,
  ): Promise<ScheduleResponse> {
    const res = await this.#request("POST", "indexer/index", { path }, signal);
    return (await res.json()) as ScheduleResponse;
  }

  async removePath(
    path: string,
    signal?: AbortSignal,
  ): Promise<ControlResponse> {
    const res = await this.#request("POST", "indexer/remove", { path }, signal);
    return (await res.json()) as ControlResponse;
  }

  async search(
    query: string,
    n = 8,
    signal?: AbortSignal,
  ): Promise<SearchResponse> {
    const res = await this.#request("POST", "search", { q: query, n }, signal);
    return (await res.json()) as SearchResponse;
  }

  async #request(
    method: "GET" | "POST",
    pathname: string,
    payload?: unknown,
    signal?: AbortSignal,
  ): Promise<Response> {
    const url = new URL(pathname, this.#base);
    const res = await this.#fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
        ...this.#headers,
      },
      body: payload && method === "POST" ? JSON.stringify(payload) : undefined,
      signal,
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new IndexerServiceError(errorText || res.statusText, res.status);
    }
    return res;
  }
}

export function createIndexerServiceClient(
  config: IndexerServiceClientConfig,
): IndexerServiceClient {
  return new IndexerServiceClient(config);
}
