import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { CompatRuntimeConfig } from "./lib/config.js";
import { isRecord, badRequest, notFound } from "./lib/errors.js";
import { defaultConfigDocument, resolveDirectory } from "./lib/helpers.js";
import { CompatEventBus } from "./lib/events.js";
import { PromptRunner } from "./lib/prompt-runner.js";
import type { CompatStore } from "./lib/store.js";
import type { AgentInfo, CompatConfigDoc, McpServerConfig, McpStatus, PermissionRule, PromptRequestBody, StoredMcpServer } from "./lib/types.js";

type RouteDeps = {
  cfg: CompatRuntimeConfig;
  store: CompatStore;
  events: CompatEventBus;
  promptRunner: PromptRunner;
  agents: AgentInfo[];
};

export async function registerRoutes(app: FastifyInstance, deps: RouteDeps) {
  app.get("/", async () => ({
    ok: true,
    service: "opencode-compat",
    version: deps.cfg.version
  }));

  app.get("/health", async () => ({
    ok: true,
    service: "opencode-compat"
  }));

  app.get("/global/health", async () => ({
    healthy: true,
    version: deps.cfg.version
  }));

  app.get("/agent", async () => deps.agents);

  app.get("/config", async (request) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    return loadConfigDocument(directory, deps);
  });

  app.get("/global/config", async (request) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    return loadConfigDocument(directory, deps);
  });

  app.patch("/config", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const body = request.body;
    if (!isRecord(body)) {
      return badRequest(reply, "config body must be an object");
    }
    const next = { ...(await loadConfigDocument(directory, deps)), ...body } satisfies CompatConfigDoc;
    if (isRecord(body.mcp)) {
      for (const [name, value] of Object.entries(body.mcp)) {
        const config = asMcpConfig(value);
        if (!config) {
          return badRequest(reply, `invalid mcp config for ${name}`);
        }
        await deps.store.putMcp(directory, name, config, statusForConfig(config));
      }
    }
    await deps.store.putConfig(directory, next);
    return loadConfigDocument(directory, deps);
  });

  app.patch("/global/config", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const body = request.body;
    if (!isRecord(body)) {
      return badRequest(reply, "config body must be an object");
    }
    const next = { ...(await loadConfigDocument(directory, deps)), ...body } satisfies CompatConfigDoc;
    if (isRecord(body.mcp)) {
      for (const [name, value] of Object.entries(body.mcp)) {
        const config = asMcpConfig(value);
        if (!config) {
          return badRequest(reply, `invalid mcp config for ${name}`);
        }
        await deps.store.putMcp(directory, name, config, statusForConfig(config));
      }
    }
    await deps.store.putConfig(directory, next);
    return loadConfigDocument(directory, deps);
  });

  app.get("/mcp", async (request) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    return statusMap(await deps.store.listMcp(directory));
  });

  app.post("/mcp", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const body = request.body;
    if (!isRecord(body) || typeof body.name !== "string") {
      return badRequest(reply, "mcp add requires name and config");
    }
    const config = asMcpConfig(body.config);
    if (!config) {
      return badRequest(reply, "invalid mcp config");
    }
    const result = await deps.store.putMcp(directory, body.name, config, statusForConfig(config));
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return statusMap(result);
  });

  app.post("/mcp/:name/connect", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    await deps.store.setMcpStatus(directory, name, { status: "connected" });
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return true;
  });

  app.post("/mcp/:name/disconnect", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    await deps.store.setMcpStatus(directory, name, { status: "disabled" });
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return true;
  });

  app.post("/mcp/:name/auth", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    if (current.config.type !== "remote" || current.config.oauth === false || current.config.oauth === undefined) {
      return badRequest(reply, `mcp server ${name} does not support oauth`);
    }
    return {
      authorizationUrl: `${deps.cfg.publicBaseUrl}/oauth/mock/${encodeURIComponent(name)}`
    };
  });

  app.post("/mcp/:name/auth/callback", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    await deps.store.setMcpStatus(directory, name, { status: "connected" });
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return { status: "connected" } satisfies McpStatus;
  });

  app.post("/mcp/:name/auth/authenticate", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    if (current.config.type !== "remote" || current.config.oauth === false || current.config.oauth === undefined) {
      return badRequest(reply, `mcp server ${name} does not support oauth`);
    }
    await deps.store.setMcpStatus(directory, name, { status: "connected" });
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return { status: "connected" } satisfies McpStatus;
  });

  app.delete("/mcp/:name/auth", async (request, reply) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const name = (request.params as { name: string }).name;
    const current = await deps.store.getMcp(directory, name);
    if (!current) {
      return notFound(reply, `mcp server ${name} not found`);
    }
    const next = current.config.type === "remote" && current.config.oauth
      ? { status: "needs_auth" } satisfies McpStatus
      : { status: "connected" } satisfies McpStatus;
    await deps.store.setMcpStatus(directory, name, next);
    deps.events.publish(directory, {
      type: "mcp.tools.changed",
      properties: {}
    });
    return { success: true as const };
  });

  app.get("/session", async (request) => {
    const query = request.query as Record<string, unknown> | undefined;
    return deps.store.listSessions({
      directory: typeof query?.directory === "string" ? query.directory : undefined,
      roots: parseBoolean(query?.roots),
      start: parseNumber(query?.start),
      search: typeof query?.search === "string" ? query.search : undefined,
      limit: parseNumber(query?.limit),
    });
  });

  app.post("/session", async (request) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    const body = isRecord(request.body) ? request.body : {};
    const session = await deps.store.createSession({
      directory,
      title: typeof body.title === "string" ? body.title : undefined,
      parentID: typeof body.parentID === "string" ? body.parentID : undefined,
      permission: asPermissionRules(body.permission)
    });
    deps.events.publish(directory, {
      type: "session.created",
      properties: {
        info: session
      }
    });
    return session;
  });

  app.get("/session/status", async (request) => {
    const directory = resolveDirectory(request, deps.cfg.defaultDirectory);
    return deps.store.listSessionStatus(directory);
  });

  app.get("/session/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const session = await deps.store.getSession(id);
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    return session;
  });

  app.patch("/session/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const body = request.body;
    if (!isRecord(body)) {
      return badRequest(reply, "session patch body must be an object");
    }
    const session = await deps.store.updateSession(id, {
      title: typeof body.title === "string" ? body.title : undefined,
      archived: isRecord(body.time) && typeof body.time.archived === "number" ? body.time.archived : undefined
    });
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    deps.events.publish(session.directory, {
      type: "session.updated",
      properties: {
        info: session
      }
    });
    return session;
  });

  app.delete("/session/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const session = await deps.store.getSession(id);
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    await deps.store.deleteSession(id);
    deps.events.publish(session.directory, {
      type: "session.deleted",
      properties: {
        info: session
      }
    });
    return true;
  });

  app.get("/session/:id/children", async (request) => {
    const id = (request.params as { id: string }).id;
    return deps.store.listSessionChildren(id);
  });

  app.get("/session/:id/todo", async () => []);

  app.post("/session/:id/init", async () => true);

  app.post("/session/:id/abort", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const session = await deps.store.getSession(id);
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    await deps.store.setSessionStatus(id, session.directory, { type: "idle" });
    deps.events.publish(session.directory, {
      type: "session.idle",
      properties: {
        sessionID: session.id
      }
    });
    return true;
  });

  app.post("/session/:id/share", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const session = await deps.store.updateSession(id, {
      shareUrl: `${deps.cfg.publicBaseUrl}/share/${encodeURIComponent(id)}`
    });
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    return session;
  });

  app.delete("/session/:id/share", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const session = await deps.store.updateSession(id, { shareUrl: null });
    if (!session) {
      return notFound(reply, `session ${id} not found`);
    }
    return session;
  });

  app.get("/session/:id/diff", async () => []);

  app.post("/session/:id/summarize", async () => true);

  app.get("/session/:id/message", async (request, reply) => {
    const params = request.params as { id: string };
    const session = await deps.store.getSession(params.id);
    if (!session) {
      return notFound(reply, `session ${params.id} not found`);
    }
    const query = request.query as Record<string, unknown> | undefined;
    const limit = parseNumber(query?.limit);
    return deps.store.listMessages(params.id, limit);
  });

  app.get("/session/:id/message/:messageID", async (request, reply) => {
    const params = request.params as { id: string; messageID: string };
    const message = await deps.store.getMessage(params.id, params.messageID);
    if (!message) {
      return notFound(reply, `message ${params.messageID} not found`);
    }
    return message;
  });

  app.post("/session/:id/message", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asPromptBody(request.body);
    if (!body) {
      return badRequest(reply, "prompt body must include parts");
    }
    const session = await deps.store.getSession(params.id);
    if (!session) {
      return notFound(reply, `session ${params.id} not found`);
    }
    return deps.promptRunner.run(params.id, body);
  });

  app.post("/session/:id/prompt_async", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asPromptBody(request.body);
    if (!body) {
      return badRequest(reply, "prompt body must include parts");
    }
    const session = await deps.store.getSession(params.id);
    if (!session) {
      return notFound(reply, `session ${params.id} not found`);
    }
    deps.promptRunner.queue(params.id, body);
    return reply.code(204).send();
  });

  app.get("/permission", async () => deps.store.listPermissions());

  app.post("/permission/:requestID/reply", async (request, reply) => {
    const requestId = (request.params as { requestID: string }).requestID;
    const pending = await deps.store.resolvePermission(requestId);
    if (!pending) {
      return notFound(reply, `permission request ${requestId} not found`);
    }
    deps.events.publish(deps.cfg.defaultDirectory, {
      type: "permission.replied",
      properties: {
        sessionID: pending.sessionID,
        requestID: requestId,
        reply: isRecord(request.body) && typeof request.body.reply === "string" ? request.body.reply : "once"
      }
    });
    return true;
  });

  app.get("/question", async () => deps.store.listQuestions());

  app.post("/question/:requestID/reply", async (request, reply) => {
    const requestId = (request.params as { requestID: string }).requestID;
    const pending = await deps.store.resolveQuestion(requestId);
    if (!pending) {
      return notFound(reply, `question request ${requestId} not found`);
    }
    deps.events.publish(deps.cfg.defaultDirectory, {
      type: "question.replied",
      properties: {
        sessionID: pending.sessionID,
        requestID: requestId,
        answers: isRecord(request.body) && Array.isArray(request.body.answers) ? request.body.answers : []
      }
    });
    return true;
  });

  app.post("/question/:requestID/reject", async (request, reply) => {
    const requestId = (request.params as { requestID: string }).requestID;
    const pending = await deps.store.rejectQuestion(requestId);
    if (!pending) {
      return notFound(reply, `question request ${requestId} not found`);
    }
    deps.events.publish(deps.cfg.defaultDirectory, {
      type: "question.rejected",
      properties: {
        sessionID: pending.sessionID,
        requestID: requestId
      }
    });
    return true;
  });

  app.get("/event", async (request, reply) => openEventStream(request, reply, deps, false));
  app.get("/global/event", async (request, reply) => openEventStream(request, reply, deps, true));
}

async function loadConfigDocument(directory: string, deps: RouteDeps): Promise<CompatConfigDoc> {
  const stored = (await deps.store.getConfig(directory)) ?? {};
  const mcp = await deps.store.listMcp(directory);
  return {
    ...defaultConfigDocument(deps.cfg, mcp),
    ...stored,
    mcp: Object.fromEntries(Object.entries(mcp).map(([name, value]) => [name, value.config]))
  };
}

function statusMap(entries: Record<string, StoredMcpServer>): Record<string, McpStatus> {
  return Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, value.status]));
}

function asMcpConfig(value: unknown): McpServerConfig | undefined {
  if (!isRecord(value) || typeof value.type !== "string") {
    return undefined;
  }
  if (value.type === "local" && Array.isArray(value.command) && value.command.every((item) => typeof item === "string")) {
    return {
      type: "local",
      command: [...value.command],
      environment: stringRecord(value.environment),
      enabled: typeof value.enabled === "boolean" ? value.enabled : undefined,
      timeout: typeof value.timeout === "number" ? value.timeout : undefined
    };
  }
  if (value.type === "remote" && typeof value.url === "string") {
    return {
      type: "remote",
      url: value.url,
      enabled: typeof value.enabled === "boolean" ? value.enabled : undefined,
      headers: stringRecord(value.headers),
      oauth: value.oauth === false
        ? false
        : (isRecord(value.oauth)
          ? {
              clientId: typeof value.oauth.clientId === "string" ? value.oauth.clientId : undefined,
              clientSecret: typeof value.oauth.clientSecret === "string" ? value.oauth.clientSecret : undefined,
              scope: typeof value.oauth.scope === "string" ? value.oauth.scope : undefined
            }
          : undefined),
      timeout: typeof value.timeout === "number" ? value.timeout : undefined
    };
  }
  return undefined;
}

function statusForConfig(config: McpServerConfig): McpStatus {
  if (config.enabled === false) {
    return { status: "disabled" };
  }
  if (config.type === "remote" && config.oauth) {
    return { status: "needs_auth" };
  }
  return { status: "connected" };
}

function asPromptBody(value: unknown): PromptRequestBody | undefined {
  if (!isRecord(value) || !Array.isArray(value.parts)) {
    return undefined;
  }
  return {
    messageID: typeof value.messageID === "string" ? value.messageID : undefined,
    model: isRecord(value.model) && typeof value.model.providerID === "string" && typeof value.model.modelID === "string"
      ? { providerID: value.model.providerID, modelID: value.model.modelID }
      : undefined,
    agent: typeof value.agent === "string" ? value.agent : undefined,
    noReply: typeof value.noReply === "boolean" ? value.noReply : undefined,
    tools: isRecord(value.tools)
      ? Object.fromEntries(Object.entries(value.tools).filter(([, item]) => typeof item === "boolean")) as Record<string, boolean>
      : undefined,
    system: typeof value.system === "string" ? value.system : undefined,
    variant: typeof value.variant === "string" ? value.variant : undefined,
    parts: value.parts as PromptRequestBody["parts"]
  };
}

function asPermissionRules(value: unknown): PermissionRule[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const rules = value.filter(isRecord).flatMap((entry) => {
    if (typeof entry.permission !== "string" || typeof entry.pattern !== "string") {
      return [];
    }
    if (entry.action !== "allow" && entry.action !== "deny" && entry.action !== "ask") {
      return [];
    }
    return [{
      permission: entry.permission,
      pattern: entry.pattern,
      action: entry.action as PermissionRule["action"]
    }];
  });
  return rules;
}

function stringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string")) as Record<string, string>;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

async function openEventStream(_request: FastifyRequest, reply: FastifyReply, deps: RouteDeps, includeDirectory: boolean) {
  reply.hijack();
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  writeSse(reply, includeDirectory
    ? { directory: "global", payload: { type: "server.connected", properties: {} } }
    : { type: "server.connected", properties: {} });
  const off = deps.events.subscribe((event) => {
    writeSse(reply, includeDirectory ? event : event.payload);
  });
  const heartbeat = setInterval(() => {
    reply.raw.write(`: ping\n\n`);
  }, 10000);
  reply.raw.on("close", () => {
    clearInterval(heartbeat);
    off();
  });
  return reply;
}

function writeSse(reply: FastifyReply, payload: unknown) {
  reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
}
