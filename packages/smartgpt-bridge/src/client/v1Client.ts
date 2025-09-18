import type {
  AgentControlRequest,
  AgentControlResponse,
  AgentLogsQuery,
  AgentLogsResponse,
  AgentStatusResponse,
  CodeSearchRequest,
  CodeSearchResponse,
  ControlIndexerRequest,
  ControlIndexerResponse,
  FilesSuccessResponse,
  IndexerStatusResponse,
  ListAgentsResponse,
  ListFilesParams,
  ListSinksResponse,
  OpenApiDocument,
  PutFileRequest,
  PutFileResponse,
  ReindexFilesRequest,
  ReindexFilesResponse,
  RequestOptions,
  RunCommandRequest,
  RunCommandResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
  SinkSearchRequest,
  SinkSearchResponse,
  SmartGptBridgeV1Client,
  SmartGptBridgeV1ClientConfig,
  StartAgentRequest,
  StartAgentResponse,
  WebSearchRequest,
  WebSearchResponse,
} from "./v1Types.js";

const jsonContentType = "application/json";
const jsonAcceptHeader = "application/json";

const toPairs = (query: Record<string, unknown>): Array<[string, string]> =>
  Object.entries(query).flatMap(([key, raw]) => {
    if (raw === undefined || raw === null) return [] as Array<[string, string]>;
    const values = Array.isArray(raw) ? raw : [raw];
    return values.map((value) => [key, String(value)] as [string, string]);
  });

const compact = (
  query: Record<string, unknown | null | undefined>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

const encodePath = (value: string): string =>
  value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

/**
 * Domain-specific error raised when the SmartGPT bridge responds with a non-success status.
 */
export class SmartGptBridgeError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const parseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const ensureOkJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await parseBody(response);
    throw new SmartGptBridgeError(
      `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  }
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes(jsonContentType)) {
    const body = await parseBody(response);
    return body as T;
  }
  return (await response.json()) as T;
};

const toPathSegments = (value: string | undefined | null): string[] =>
  value ? value.split("/").filter(Boolean) : [];

const joinPathSegments = (segments: string[]): string =>
  segments.length > 0 ? `/${segments.join("/")}` : "/";

const buildUrl = (
  baseUrl: string,
  baseSegments: readonly string[],
  prefixSegments: readonly string[],
  path: string,
  query?: Record<string, unknown>,
): string => {
  const url = new URL(baseUrl);
  const segments = [
    ...baseSegments,
    ...prefixSegments,
    ...toPathSegments(path),
  ];
  url.pathname = joinPathSegments(segments);
  url.search = "";
  url.hash = "";
  if (query && Object.keys(query).length > 0) {
    const pairs = toPairs(query);
    if (pairs.length > 0) {
      const next = new URL(url.toString());
      next.search = new URLSearchParams(pairs).toString();
      return next.toString();
    }
  }
  return url.toString();
};

const createHeaders = (
  base: Record<string, string>,
  hasBody: boolean,
  overrides?: Record<string, string>,
): Record<string, string> => ({
  Accept: jsonAcceptHeader,
  ...base,
  ...(hasBody ? { "content-type": jsonContentType } : {}),
  ...(overrides ?? {}),
});

/**
 * Creates an immutable API client for SmartGPT bridge v1 endpoints.
 */
export const createSmartGptBridgeV1Client = (
  config: SmartGptBridgeV1ClientConfig,
): SmartGptBridgeV1Client => {
  const fetchImpl = config.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new Error(
      "No fetch implementation available. Provide config.fetchImpl or ensure globalThis.fetch is defined.",
    );
  }
  const baseHeaders = { ...(config.defaultHeaders ?? {}) };
  const baseUrl = new URL(config.baseUrl);
  const baseSegments = toPathSegments(baseUrl.pathname);
  baseUrl.pathname = "/";
  baseUrl.search = "";
  baseUrl.hash = "";
  const normalizedBaseUrl = baseUrl.toString();
  const prefixSegments = toPathSegments(config.pathPrefix ?? "");

  const withSignal = (init: RequestInit, signal?: AbortSignal): RequestInit =>
    signal ? { ...init, signal } : init;

  const requestJson = async <T>(
    path: string,
    init: RequestInit,
    query?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<T> => {
    const url = buildUrl(
      normalizedBaseUrl,
      baseSegments,
      prefixSegments,
      path,
      query,
    );
    const response = await fetchImpl(url, withSignal(init, signal));
    return ensureOkJson<T>(response);
  };

  const requestStream = async (
    path: string,
    init: RequestInit,
    query?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<Response> => {
    const url = buildUrl(
      normalizedBaseUrl,
      baseSegments,
      prefixSegments,
      path,
      query,
    );
    const response = await fetchImpl(url, withSignal(init, signal));
    if (!response.ok) {
      const body = await parseBody(response);
      throw new SmartGptBridgeError(
        `Request failed with status ${response.status}`,
        response.status,
        body,
      );
    }
    return response;
  };

  /**
   * Lists all tracked agents along with their sandbox mode.
   */
  const listAgents = (options?: RequestOptions): Promise<ListAgentsResponse> =>
    requestJson<ListAgentsResponse>(
      "/v1/agents",
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      undefined,
      options?.signal,
    );

  /**
   * Starts a new agent process using the provided configuration.
   */
  const startAgent = (
    payload: StartAgentRequest,
    options?: RequestOptions,
  ): Promise<StartAgentResponse> =>
    requestJson<StartAgentResponse>(
      "/v1/agents",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Fetches the current status for a specific agent.
   */
  const getAgentStatus = (
    id: string,
    options?: RequestOptions,
  ): Promise<AgentStatusResponse> =>
    requestJson<AgentStatusResponse>(
      `/v1/agents/${encodePath(id)}`,
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      undefined,
      options?.signal,
    );

  /**
   * Retrieves recent logs for a specific agent.
   */
  const getAgentLogs = (
    id: string,
    query?: AgentLogsQuery,
    options?: RequestOptions,
  ): Promise<AgentLogsResponse> =>
    requestJson<AgentLogsResponse>(
      `/v1/agents/${encodePath(id)}/logs`,
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      query
        ? compact({
            tail: query.tail,
            level: query.level ?? undefined,
          })
        : undefined,
      options?.signal,
    );

  /**
   * Opens a server-sent events stream for live agent logs.
   */
  const streamAgentLogs = (
    id: string,
    options?: RequestOptions,
  ): Promise<Response> =>
    requestStream(
      `/v1/agents/${encodePath(id)}/stream`,
      {
        method: "GET",
        headers: {
          ...baseHeaders,
          Accept: "text/event-stream",
          ...(options?.headers ?? {}),
        },
      },
      undefined,
      options?.signal,
    );

  /**
   * Sends a control command to an agent, such as send or interrupt.
   */
  const controlAgent = (
    id: string,
    payload: AgentControlRequest,
    options?: RequestOptions,
  ): Promise<AgentControlResponse> =>
    requestJson<AgentControlResponse>(
      `/v1/agents/${encodePath(id)}`,
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Lists files, returns a directory tree, or views a file snippet depending on parameters.
   */
  const listFiles = (
    params?: ListFilesParams,
    options?: RequestOptions,
  ): Promise<FilesSuccessResponse> => {
    const { targetPath, ...query } = params ?? {};
    const pathSegment =
      targetPath && targetPath.length > 0 ? `/${encodePath(targetPath)}` : "";
    const queryParams = compact(
      query as Record<string, unknown | null | undefined>,
    );
    return requestJson<FilesSuccessResponse>(
      `/v1/files${pathSegment}`,
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      Object.keys(queryParams).length > 0 ? queryParams : undefined,
      options?.signal,
    );
  };

  /**
   * Schedules file reindexing for a subset of the repository.
   */
  const reindexFiles = (
    payload: ReindexFilesRequest,
    options?: RequestOptions,
  ): Promise<ReindexFilesResponse> =>
    requestJson<ReindexFilesResponse>(
      "/v1/files/reindex",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Writes or updates file contents on disk.
   */
  const putFile = (
    payload: PutFileRequest,
    options?: RequestOptions,
  ): Promise<PutFileResponse> =>
    requestJson<PutFileResponse>(
      "/v1/files",
      {
        method: "PUT",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Performs a regex search across repository files.
   */
  const searchCode = (
    payload: CodeSearchRequest,
    options?: RequestOptions,
  ): Promise<CodeSearchResponse> =>
    requestJson<CodeSearchResponse>(
      "/v1/search/code",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Executes semantic search over the default embedding sink.
   */
  const searchSemantic = (
    payload: SemanticSearchRequest,
    options?: RequestOptions,
  ): Promise<SemanticSearchResponse> =>
    requestJson<SemanticSearchResponse>(
      "/v1/search/semantic",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Performs an internet search via DuckDuckGo.
   */
  const searchWeb = (
    payload: WebSearchRequest,
    options?: RequestOptions,
  ): Promise<WebSearchResponse> =>
    requestJson<WebSearchResponse>(
      "/v1/search/web",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Lists semantic sinks available on the bridge.
   */
  const listSinks = (options?: RequestOptions): Promise<ListSinksResponse> =>
    requestJson<ListSinksResponse>(
      "/v1/sinks",
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      undefined,
      options?.signal,
    );

  /**
   * Runs a semantic query against a specific sink.
   */
  const searchSink = (
    name: string,
    payload: SinkSearchRequest,
    options?: RequestOptions,
  ): Promise<SinkSearchResponse> =>
    requestJson<SinkSearchResponse>(
      `/v1/sinks/${encodePath(name)}/search`,
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Retrieves the current indexer status, statistics, and timestamps.
   */
  const getIndexerStatus = (
    options?: RequestOptions,
  ): Promise<IndexerStatusResponse> =>
    requestJson<IndexerStatusResponse>(
      "/v1/indexer",
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      undefined,
      options?.signal,
    );

  /**
   * Controls the indexer lifecycle for operations such as index, remove, and reset.
   */
  const controlIndexer = (
    payload: ControlIndexerRequest,
    options?: RequestOptions,
  ): Promise<ControlIndexerResponse> =>
    requestJson<ControlIndexerResponse>(
      "/v1/indexer",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Executes a shell command on the SmartGPT bridge host.
   */
  const runCommand = (
    payload: RunCommandRequest,
    options?: RequestOptions,
  ): Promise<RunCommandResponse> =>
    requestJson<RunCommandResponse>(
      "/v1/exec/run",
      {
        method: "POST",
        headers: createHeaders(baseHeaders, true, options?.headers),
        body: JSON.stringify(payload),
      },
      undefined,
      options?.signal,
    );

  /**
   * Fetches the OpenAPI description exposed for v1 endpoints.
   */
  const fetchOpenApi = (options?: RequestOptions): Promise<OpenApiDocument> =>
    requestJson<OpenApiDocument>(
      "/v1/openapi.json",
      {
        method: "GET",
        headers: createHeaders(baseHeaders, false, options?.headers),
      },
      undefined,
      options?.signal,
    );

  return {
    listAgents,
    startAgent,
    getAgentStatus,
    getAgentLogs,
    streamAgentLogs,
    controlAgent,
    listFiles,
    reindexFiles,
    putFile,
    searchCode,
    searchSemantic,
    searchWeb,
    listSinks,
    searchSink,
    getIndexerStatus,
    controlIndexer,
    runCommand,
    fetchOpenApi,
  };
};
