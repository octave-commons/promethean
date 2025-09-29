import {
  EventError,
  onFilesReindexEvent,
  onFilesRequestEvent,
  onFilesWriteEvent,
} from "../../events/files.js";
import type { EventResponse } from "../../events/files.js";

export function registerFilesRoutes(v1: any) {
  const ROOT_PATH = v1.ROOT_PATH || process.cwd();

  const rateLimits = {
    read: { max: 120, timeWindow: "1 minute" },
    mutate: { max: 30, timeWindow: "1 minute" },
    reindex: { max: 10, timeWindow: "1 minute" },
  } as const;

  const handleError = (reply: any, error: unknown, fallbackStatus = 400) => {
    if (error instanceof EventError) {
      reply.code(error.status).send({ ok: false, error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    reply.code(fallbackStatus).send({ ok: false, error: message });
  };

  const sendResponse = (
    reply: any,
    result: EventResponse<any>,
    fallbackStatus = 200,
  ) => {
    const status =
      typeof result.status === "number" ? result.status : fallbackStatus;
    reply.code(status).send(result.body);
  };

  async function filesHandler(req: any, reply: any) {
    try {
      const result = await onFilesRequestEvent({
        rootPath: ROOT_PATH,
        query: req.query ?? {},
        params: req.params ?? {},
      });
      sendResponse(reply, result);
    } catch (error) {
      handleError(reply, error);
    }
  }

  // ------------------------------------------------------------------
  // Files
  // Unified handler for /files and /files/*
  v1.get("/files", {
    config: { rateLimit: rateLimits.read },
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "files")],
    schema: {
      summary: "List files, tree, or view file",
      operationId: "files",
      tags: ["Files"],
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          hidden: { type: "boolean", default: false },
          type: { type: "string", enum: ["file", "dir"] },
          depth: { type: "integer", minimum: 0, default: 2 },
          tree: { type: "boolean", default: false },
          line: { type: "integer", minimum: 1 },
          context: { type: "integer", minimum: 0 },
        },
      },
    },
    handler: filesHandler,
  });

  v1.get("/files/*", {
    config: { rateLimit: rateLimits.read },
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "files")],
    schema: {
      summary: "List files, tree, or view file",
      operationId: "files",
      tags: ["Files"],
      params: {
        type: "object",
        properties: {
          "*": { type: "string" },
        },
      },
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          hidden: { type: "boolean", default: false },
          type: { type: "string", enum: ["file", "dir"] },
          depth: { type: "integer", minimum: 0, default: 2 },
          tree: { type: "boolean", default: false },
          line: { type: "integer", minimum: 1 },
          context: { type: "integer", minimum: 0 },
        },
      },
    },
    handler: filesHandler,
  });

  v1.post("/files/reindex", {
    config: { rateLimit: rateLimits.reindex },
    preHandler: [v1.authUser, v1.requirePolicy("write", () => "files")],
    schema: {
      summary: "Reindex files under a path",
      operationId: "reindexFiles",
      tags: ["Files"],
      body: {
        type: "object",
        properties: { path: { type: "string" } },
      },
    },
    async handler(req: any, reply: any) {
      try {
        const result = await onFilesReindexEvent({ body: req.body ?? {} });
        sendResponse(reply, result);
      } catch (error) {
        handleError(reply, error, 500);
      }
    },
  });

  // PUT /files: create, overwrite, or edit lines in a file
  v1.put("/files", {
    config: { rateLimit: rateLimits.mutate },
    preHandler: [v1.authUser, v1.requirePolicy("write", () => "files")],
    schema: {
      summary: "Create, overwrite, or edit lines in a file",
      operationId: "putFile",
      tags: ["Files"],
      body: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: {
            type: "string",
            description: "Full file content (overwrites file)",
          },
          lines: {
            type: "array",
            items: { type: "string" },
            description: "Lines to write/replace",
          },
          startLine: {
            type: "integer",
            minimum: 1,
            description: "1-based line to start writing lines at",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, path: { type: "string" } },
        },
        400: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    async handler(req: any, reply: any) {
      try {
        const result = await onFilesWriteEvent({
          rootPath: ROOT_PATH,
          body: req.body ?? {},
        });
        sendResponse(reply, result);
      } catch (error) {
        handleError(reply, error);
      }
    },
  });
}
