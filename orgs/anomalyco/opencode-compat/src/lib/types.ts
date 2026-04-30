export type CompatLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type PermissionAction = "allow" | "deny" | "ask";

export type PermissionRule = {
  permission: string;
  pattern: string;
  action: PermissionAction;
};

export type CompatFileDiff = {
  file: string;
  before: string;
  after: string;
  additions: number;
  deletions: number;
  status?: "added" | "deleted" | "modified";
};

export type TextPartInput = {
  id?: string;
  type: "text";
  text: string;
  synthetic?: boolean;
  ignored?: boolean;
  time?: {
    start: number;
    end?: number;
  };
  metadata?: Record<string, unknown>;
};

export type FilePartInput = {
  id?: string;
  type: "file";
  mime: string;
  filename?: string;
  url: string;
  source?: Record<string, unknown>;
};

export type AgentPartInput = {
  id?: string;
  type: "agent";
  name: string;
  source?: {
    value: string;
    start: number;
    end: number;
  };
};

export type SubtaskPartInput = {
  id?: string;
  type: "subtask";
  prompt: string;
  description: string;
  agent: string;
};

export type PromptPartInput = TextPartInput | FilePartInput | AgentPartInput | SubtaskPartInput;

export type TextPart = TextPartInput & {
  id: string;
  sessionID: string;
  messageID: string;
};

export type FilePart = FilePartInput & {
  id: string;
  sessionID: string;
  messageID: string;
};

export type AgentPart = AgentPartInput & {
  id: string;
  sessionID: string;
  messageID: string;
};

export type SubtaskPart = SubtaskPartInput & {
  id: string;
  sessionID: string;
  messageID: string;
};

export type CompatPart = TextPart | FilePart | AgentPart | SubtaskPart;

export type UserMessage = {
  id: string;
  sessionID: string;
  role: "user";
  time: {
    created: number;
  };
  format?: string;
  summary?: {
    title?: string;
    body?: string;
    diffs: CompatFileDiff[];
  };
  agent: string;
  model: {
    providerID: string;
    modelID: string;
  };
  system?: string;
  tools?: Record<string, boolean>;
  variant?: string;
};

export type CompatError = {
  name: string;
  data: Record<string, unknown>;
};

export type AssistantMessage = {
  id: string;
  sessionID: string;
  role: "assistant";
  time: {
    created: number;
    completed?: number;
  };
  error?: CompatError;
  parentID: string;
  modelID: string;
  providerID: string;
  mode: string;
  agent: string;
  path: {
    cwd: string;
    root: string;
  };
  summary?: boolean;
  cost: number;
  tokens: {
    input: number;
    output: number;
    reasoning: number;
    cache: {
      read: number;
      write: number;
    };
  };
  structured?: unknown;
  variant?: string;
  finish?: string;
};

export type MessageInfo = UserMessage | AssistantMessage;

export type MessageWithParts = {
  info: MessageInfo;
  parts: CompatPart[];
};

export type SessionStatus =
  | { type: "idle" }
  | { type: "busy" }
  | { type: "retry"; attempt: number; message: string; next: number };

export type CompatSession = {
  id: string;
  slug: string;
  projectID: string;
  directory: string;
  parentID?: string;
  summary?: {
    additions: number;
    deletions: number;
    files: number;
    diffs?: CompatFileDiff[];
  };
  share?: {
    url: string;
  };
  title: string;
  version: string;
  time: {
    created: number;
    updated: number;
    compacting?: number;
    archived?: number;
  };
  permission?: PermissionRule[];
  revert?: {
    messageID: string;
    partID?: string;
    snapshot?: string;
    diff?: string;
  };
};

export type AgentInfo = {
  name: string;
  description?: string;
  mode: "subagent" | "primary" | "all";
  native?: boolean;
  hidden?: boolean;
  topP?: number;
  temperature?: number;
  color?: string;
  permission: PermissionRule[];
  model?: {
    modelID: string;
    providerID: string;
  };
  variant?: string;
  prompt?: string;
  options: Record<string, unknown>;
  steps?: number;
};

export type McpLocalConfig = {
  type: "local";
  command: string[];
  environment?: Record<string, string>;
  enabled?: boolean;
  timeout?: number;
};

export type McpRemoteConfig = {
  type: "remote";
  url: string;
  enabled?: boolean;
  headers?: Record<string, string>;
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    scope?: string;
  } | false;
  timeout?: number;
};

export type McpServerConfig = McpLocalConfig | McpRemoteConfig;

export type McpStatus =
  | { status: "connected" }
  | { status: "disabled" }
  | { status: "failed"; error: string }
  | { status: "needs_auth" }
  | { status: "needs_client_registration"; error: string };

export type StoredMcpServer = {
  directory: string;
  name: string;
  config: McpServerConfig;
  status: McpStatus;
};

export type QuestionInfo = {
  question: string;
  header: string;
  options: Array<{
    label: string;
    description: string;
  }>;
  multiple?: boolean;
  custom?: boolean;
};

export type PermissionRequest = {
  id: string;
  sessionID: string;
  permission: string;
  patterns: string[];
  metadata: Record<string, unknown>;
  always: string[];
  tool?: {
    messageID: string;
    callID: string;
  };
};

export type QuestionRequest = {
  id: string;
  sessionID: string;
  questions: QuestionInfo[];
  tool?: {
    messageID: string;
    callID: string;
  };
};

export type CompatEvent = {
  type: string;
  properties: Record<string, unknown>;
};

export type EventEnvelope = {
  directory: string;
  payload: CompatEvent;
};

export type CompatConfigDoc = {
  $schema?: string;
  logLevel?: CompatLogLevel;
  server?: {
    hostname?: string;
    port?: number;
  };
  command?: Record<
    string,
    {
      template: string;
      description?: string;
      agent?: string;
      model?: string;
      subtask?: boolean;
    }
  >;
  watcher?: {
    ignore?: string[];
  };
  plugin?: string[];
  snapshot?: boolean;
  share?: "manual" | "auto" | "disabled";
  autoupdate?: boolean | "notify";
  model?: string;
  small_model?: string;
  default_agent?: string;
  username?: string;
  agent?: Record<
    string,
    {
      model?: string;
      temperature?: number;
      top_p?: number;
      prompt?: string;
    }
  >;
  provider?: Record<string, unknown>;
  mcp?: Record<string, McpServerConfig>;
  [key: string]: unknown;
};

export type CreateSessionInput = {
  directory: string;
  title?: string;
  parentID?: string;
  permission?: PermissionRule[];
};

export type UpdateSessionInput = {
  title?: string;
  archived?: number;
  shareUrl?: string | null;
};

export type SessionListQuery = {
  directory?: string;
  roots?: boolean;
  start?: number;
  search?: string;
  limit?: number;
};

export type PromptRequestBody = {
  messageID?: string;
  model?: {
    providerID: string;
    modelID: string;
  };
  agent?: string;
  noReply?: boolean;
  tools?: Record<string, boolean>;
  system?: string;
  variant?: string;
  parts: PromptPartInput[];
};
