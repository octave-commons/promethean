export type AgentSandboxMode = "default" | "nsjail";

export interface AgentSummary {
  readonly id: string;
  readonly sandbox: AgentSandboxMode | string;
}

export interface AgentStatus {
  readonly id: string;
  readonly prompt: string;
  readonly startedAt: number;
  readonly exited: boolean;
  readonly logfile: string;
  readonly sandbox: AgentSandboxMode | string;
  readonly bypassApprovals: boolean;
}

export interface StartAgentRequest {
  readonly prompt: string;
  readonly bypassApprovals?: boolean;
  readonly sandbox?: AgentSandboxMode | boolean;
  readonly tty?: boolean;
  readonly env?: Record<string, string>;
}

export type StartAgentResponse = { readonly ok: boolean } & AgentStatus;

export interface AgentLogsQuery {
  readonly tail?: number;
  readonly level?: "debug" | "info" | "warn" | "error" | null;
}

export interface AgentLogsResponse {
  readonly ok: boolean;
  readonly total: number;
  readonly chunk: string;
}

export interface AgentStatusResponse {
  readonly ok: boolean;
  readonly status: AgentStatus;
}

export interface AgentControlRequest {
  readonly op: "send" | "interrupt" | "resume" | "kill";
  readonly input?: string;
}

export interface AgentControlResponse {
  readonly ok: boolean;
  readonly error?: string;
}

export interface ListAgentsResponse {
  readonly ok: boolean;
  readonly agents: AgentSummary[];
}

export interface ListFilesParams {
  readonly targetPath?: string;
  readonly path?: string;
  readonly hidden?: boolean;
  readonly type?: "file" | "dir";
  readonly depth?: number;
  readonly tree?: boolean;
  readonly line?: number;
  readonly context?: number;
}

export interface FileListEntry {
  readonly name: string;
  readonly path: string;
  readonly type: string;
  readonly size: number | null;
  readonly mtimeMs: number | null;
}

export interface FileTreeNode {
  readonly name: string;
  readonly path: string;
  readonly type: string;
  readonly size?: number;
  readonly mtimeMs?: number;
  readonly children?: FileTreeNode[];
}

export interface FileListResponse {
  readonly ok: true;
  readonly base: string;
  readonly entries: FileListEntry[];
}

export interface FileTreeResponse {
  readonly ok: true;
  readonly base: string;
  readonly tree: FileTreeNode;
}

export interface FileViewResponse {
  readonly ok: true;
  readonly path: string;
  readonly totalLines: number;
  readonly startLine: number;
  readonly endLine: number;
  readonly focusLine: number;
  readonly snippet: string;
}

export type FilesSuccessResponse =
  | FileListResponse
  | FileTreeResponse
  | FileViewResponse;

export interface ReindexFilesRequest {
  readonly path: string;
}

export interface ReindexFilesResponse {
  readonly ok: boolean;
  readonly queued?: number;
  readonly ignored?: boolean;
  readonly mode?: string;
}

export interface PutFileRequest {
  readonly path: string;
  readonly content?: string;
  readonly lines?: string[];
  readonly startLine?: number;
}

export interface PutFileResponse {
  readonly ok: boolean;
  readonly path: string;
}

export interface GrepMatch {
  readonly path: string;
  readonly line: number;
  readonly column: number;
  readonly lineText: string;
  readonly snippet: string;
  readonly startLine: number;
  readonly endLine: number;
}

export interface CodeSearchRequest {
  readonly pattern: string;
  readonly path?: string;
  readonly flags?: string;
  readonly maxMatches?: number;
  readonly context?: number;
}

export interface CodeSearchResponse {
  readonly ok: boolean;
  readonly results: GrepMatch[];
}

export interface SemanticSearchRequest {
  readonly q: string;
  readonly n?: number;
  readonly where?: Record<string, unknown>;
}

export interface SemanticSearchResult {
  readonly id: string;
  readonly path: string;
  readonly chunkIndex: number;
  readonly startLine: number;
  readonly endLine: number;
  readonly score?: number;
  readonly text: string;
}

export interface SemanticSearchResponse {
  readonly results: SemanticSearchResult[];
}

export interface WebSearchRequest {
  readonly q: string;
  readonly n?: number;
  readonly lang?: string;
  readonly site?: string;
}

export interface WebSearchResult {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
}

export interface WebSearchResponse {
  readonly results: WebSearchResult[];
}

export interface ListSinksResponse {
  readonly ok: boolean;
  readonly sinks: string[];
}

export interface SinkSearchRequest {
  readonly q: string;
  readonly n?: number;
  readonly where?: Record<string, unknown>;
}

export interface ChromaQueryResult {
  readonly ids?: string[][];
  readonly distances?: number[][];
  readonly metadatas?: Array<Array<Record<string, unknown>>>;
  readonly documents?: string[][];
  readonly embeddings?: number[][];
  readonly data?: unknown;
}

export interface SinkSearchResponse {
  readonly results: ChromaQueryResult;
}

export interface IndexerStatusResponse {
  readonly ok: boolean;
  readonly status: Record<string, unknown>;
  readonly lastIndexedAt: string | null;
  readonly stats: Record<string, unknown> | null;
}

export interface ControlIndexerRequest {
  readonly op: "index" | "remove" | "reset" | "reindex";
  readonly path?: string;
}

export interface ControlIndexerResponse {
  readonly ok: boolean;
  readonly message?: string | null;
  readonly error?: string;
}

export interface RunCommandRequest {
  readonly command: string;
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly timeoutMs?: number;
  readonly tty?: boolean;
}

export interface RunCommandResponse {
  readonly ok: boolean;
  readonly exitCode: number | null;
  readonly signal: string | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly error?: string;
}

export type OpenApiDocument = Record<string, unknown>;

export interface RequestOptions {
  readonly signal?: AbortSignal;
  readonly headers?: Record<string, string>;
}

export interface SmartGptBridgeV1Client {
  listAgents(options?: RequestOptions): Promise<ListAgentsResponse>;
  startAgent(
    payload: StartAgentRequest,
    options?: RequestOptions,
  ): Promise<StartAgentResponse>;
  getAgentStatus(
    id: string,
    options?: RequestOptions,
  ): Promise<AgentStatusResponse>;
  getAgentLogs(
    id: string,
    query?: AgentLogsQuery,
    options?: RequestOptions,
  ): Promise<AgentLogsResponse>;
  streamAgentLogs(id: string, options?: RequestOptions): Promise<Response>;
  controlAgent(
    id: string,
    payload: AgentControlRequest,
    options?: RequestOptions,
  ): Promise<AgentControlResponse>;
  listFiles(
    params?: ListFilesParams,
    options?: RequestOptions,
  ): Promise<FilesSuccessResponse>;
  reindexFiles(
    payload: ReindexFilesRequest,
    options?: RequestOptions,
  ): Promise<ReindexFilesResponse>;
  putFile(
    payload: PutFileRequest,
    options?: RequestOptions,
  ): Promise<PutFileResponse>;
  searchCode(
    payload: CodeSearchRequest,
    options?: RequestOptions,
  ): Promise<CodeSearchResponse>;
  searchSemantic(
    payload: SemanticSearchRequest,
    options?: RequestOptions,
  ): Promise<SemanticSearchResponse>;
  searchWeb(
    payload: WebSearchRequest,
    options?: RequestOptions,
  ): Promise<WebSearchResponse>;
  listSinks(options?: RequestOptions): Promise<ListSinksResponse>;
  searchSink(
    name: string,
    payload: SinkSearchRequest,
    options?: RequestOptions,
  ): Promise<SinkSearchResponse>;
  getIndexerStatus(options?: RequestOptions): Promise<IndexerStatusResponse>;
  controlIndexer(
    payload: ControlIndexerRequest,
    options?: RequestOptions,
  ): Promise<ControlIndexerResponse>;
  runCommand(
    payload: RunCommandRequest,
    options?: RequestOptions,
  ): Promise<RunCommandResponse>;
  fetchOpenApi(options?: RequestOptions): Promise<OpenApiDocument>;
}

export interface SmartGptBridgeV1ClientConfig {
  readonly baseUrl: string;
  readonly fetchImpl?: typeof fetch;
  readonly defaultHeaders?: Record<string, string>;
  readonly pathPrefix?: string;
}
