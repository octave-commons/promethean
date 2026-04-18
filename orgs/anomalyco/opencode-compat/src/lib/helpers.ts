import { randomUUID } from "node:crypto";

import type { FastifyRequest } from "fastify";

import type { CompatRuntimeConfig } from "./config.js";
import type { AgentInfo, CompatConfigDoc, CompatPart, CompatSession, MessageWithParts, PromptPartInput, PromptRequestBody, SessionStatus, StoredMcpServer, TextPart } from "./types.js";

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

export function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "session";
}

export function projectIdForDirectory(directory: string): string {
  const normalized = directory.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `prj_${normalized || "default"}`;
}

export function resolveDirectory(request: FastifyRequest, fallback: string): string {
  const query = request.query as Record<string, unknown> | undefined;
  const fromQuery = typeof query?.directory === "string" ? query.directory : undefined;
  const fromHeader = request.headers["x-opencode-directory"];
  if (typeof fromQuery === "string" && fromQuery.trim().length > 0) {
    return fromQuery;
  }
  if (typeof fromHeader === "string" && fromHeader.trim().length > 0) {
    return fromHeader;
  }
  return fallback;
}

export function defaultConfigDocument(cfg: CompatRuntimeConfig, mcp: Record<string, StoredMcpServer>): CompatConfigDoc {
  const model = `${cfg.defaultProvider}/${cfg.defaultModel}`;
  const mcpConfig = Object.fromEntries(Object.entries(mcp).map(([name, entry]) => [name, entry.config]));
  return {
    $schema: `${cfg.publicBaseUrl}/schemas/opencode-compat.json`,
    logLevel: cfg.logLevel,
    server: {
      hostname: cfg.host,
      port: cfg.port
    },
    snapshot: false,
    share: "manual",
    model,
    small_model: model,
    default_agent: cfg.defaultAgent,
    agent: {
      general: {
        model,
        prompt: "General purpose cloud compatibility agent."
      },
      explore: {
        model,
        prompt: "Repository exploration agent for remote MCP-backed sessions."
      }
    },
    mcp: mcpConfig
  };
}

export function defaultAgents(cfg: CompatRuntimeConfig): AgentInfo[] {
  const model = {
    providerID: cfg.defaultProvider,
    modelID: cfg.defaultModel
  };
  return [
    {
      name: "general",
      description: "General purpose remote agent",
      mode: "primary",
      native: false,
      hidden: false,
      permission: [],
      model,
      prompt: "Default cloud harness agent.",
      options: {}
    },
    {
      name: "explore",
      description: "Repository exploration agent",
      mode: "primary",
      native: false,
      hidden: false,
      permission: [],
      model,
      prompt: "Exploration-focused agent for remote MCP workflows.",
      options: {}
    }
  ];
}

export function buildSessionTitle(input: { title?: string; directory: string }): string {
  if (input.title && input.title.trim().length > 0) {
    return input.title.trim();
  }
  const tail = input.directory.split("/").filter(Boolean).at(-1);
  return tail ? `Session for ${tail}` : "New Session";
}

export function createSessionRecord(input: { directory: string; title: string; version: string; parentID?: string; permission?: CompatSession["permission"] }): CompatSession {
  const created = Date.now();
  return {
    id: createId("ses"),
    slug: slugify(input.title),
    projectID: projectIdForDirectory(input.directory),
    directory: input.directory,
    parentID: input.parentID,
    title: input.title,
    version: input.version,
    time: {
      created,
      updated: created
    },
    summary: {
      additions: 0,
      deletions: 0,
      files: 0,
      diffs: []
    },
    permission: input.permission
  };
}

export function defaultSessionStatus(): SessionStatus {
  return { type: "idle" };
}

export function materializeParts(sessionID: string, messageID: string, parts: PromptPartInput[]): CompatPart[] {
  return parts.map((part) => {
    const id = part.id ?? createId("prt");
    if (part.type === "text") {
      return {
        id,
        sessionID,
        messageID,
        type: "text",
        text: part.text,
        synthetic: part.synthetic,
        ignored: part.ignored,
        time: part.time,
        metadata: part.metadata
      } satisfies TextPart;
    }
    if (part.type === "file") {
      return {
        id,
        sessionID,
        messageID,
        type: "file",
        mime: part.mime,
        filename: part.filename,
        url: part.url,
        source: part.source
      };
    }
    if (part.type === "agent") {
      return {
        id,
        sessionID,
        messageID,
        type: "agent",
        name: part.name,
        source: part.source
      };
    }
    return {
      id,
      sessionID,
      messageID,
      type: "subtask",
      prompt: part.prompt,
      description: part.description,
      agent: part.agent
    };
  });
}

export function extractPromptText(body: PromptRequestBody): string {
  const text = body.parts
    .flatMap((part) => {
      if (part.type === "text") {
        return [part.text];
      }
      if (part.type === "file") {
        return [`file:${part.filename ?? part.url}`];
      }
      if (part.type === "agent") {
        return [`agent:${part.name}`];
      }
      return [`subtask:${part.description}`];
    })
    .join("\n")
    .trim();
  return text.length > 0 ? text : "(empty prompt)";
}

export function summarizeConnectedMcp(mcp: Record<string, StoredMcpServer>): string {
  const names = Object.values(mcp)
    .filter((entry) => entry.status.status === "connected")
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  if (names.length === 0) {
    return "none";
  }
  return names.join(", ");
}

export function buildAssistantResponse(input: {
  body: PromptRequestBody;
  session: CompatSession;
  mcp: Record<string, StoredMcpServer>;
}): string {
  const promptText = extractPromptText(input.body);
  const connected = summarizeConnectedMcp(input.mcp);
  return [
    "opencode-compat scaffold received your prompt.",
    `session=${input.session.id}`,
    `connected_mcp=${connected}`,
    "runner=stub",
    "next=replace this response path with a real model plus remote MCP loop",
    "prompt:",
    promptText
  ].join("\n");
}

export function buildMessageLookup(entries: MessageWithParts[]): Record<string, MessageWithParts> {
  return Object.fromEntries(entries.map((entry) => [entry.info.id, entry]));
}
