import { proxy } from "./proxy.js";

export function registerAgentRoutes(v1: any) {
  // ------------------------------------------------------------------
  // Agents (proxy to v0 endpoints)
  // ------------------------------------------------------------------
  v1.get("/agents", {
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "agents")],
    schema: {
      summary: "List agents",
      operationId: "listAgents",
      tags: ["Agents"],
    },
    handler: proxy(v1, "GET", "/v0/agent/list", undefined),
  });

  v1.post("/agents", {
    preHandler: [v1.authUser, v1.requirePolicy("write", () => "agents")],
    schema: {
      summary: "Start an agent",
      operationId: "startAgent",
      tags: ["Agents"],
      body: {
        type: "object",
        description: "Parameters used to start an agent instance",
        properties: {},
        additionalProperties: true,
        minProperties: 1,
      },
    },
    handler: proxy(v1, "POST", "/v0/agent/start", undefined),
  });

  v1.get("/agents/:id", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", (req: any) => `agent:${req.params.id}`),
    ],
    schema: {
      summary: "Get agent status",
      operationId: "getAgentStatus",
      tags: ["Agents"],
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
    },
    handler: proxy(
      v1,
      "GET",
      (req: any) =>
        `/v0/agent/status?id=${encodeURIComponent(String(req.params.id))}`,
      undefined,
    ),
  });

  v1.get("/agents/:id/logs", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", (req: any) => `agent:${req.params.id}`),
    ],
    schema: {
      summary: "Get agent logs",
      operationId: "getAgentLogs",
      tags: ["Agents"],
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      querystring: {
        type: "object",
        properties: {
          tail: { type: "integer", minimum: 1, maximum: 5000, default: 500 },
          level: {
            type: "string",
            enum: ["debug", "info", "warn", "error"],
            nullable: true,
          },
        },
      },
    },
    handler: proxy(
      v1,
      "GET",
      (req: any) =>
        `/v0/agent/tail?id=${encodeURIComponent(
          String(req.params.id),
        )}&bytes=${Number(req.query?.tail || 500)}`,
      undefined,
    ),
  });

  v1.get("/agents/:id/stream", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", (req: any) => `agent:${req.params.id}`),
    ],
    schema: {
      summary: "Stream agent logs (SSE)",
      operationId: "streamAgentLogs",
      tags: ["Agents"],
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
    },
    handler: proxy(
      v1,
      "GET",
      (req: any) =>
        `/v0/agent/stream?id=${encodeURIComponent(String(req.params.id))}`,
      undefined,
    ),
  });

  v1.post("/agents/:id", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", (req: any) => `agent:${req.params.id}`),
    ],
    schema: {
      summary: "Control agent",
      operationId: "controlAgent",
      tags: ["Agents"],
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      body: {
        type: "object",
        required: ["op"],
        properties: {
          op: { type: "string", enum: ["send", "interrupt", "resume", "kill"] },
          input: {
            type: "string",
            nullable: true,
            description: "Message for op=send",
          },
        },
      },
    },
    async handler(req: any, reply: any) {
      const { op, input } = req.body || {};
      const id = String(req.params.id);
      let url = "";
      let payload: any = {};
      if (op === "send") {
        url = "/v0/agent/send";
        payload = { id, input };
      } else if (op === "interrupt") {
        url = "/v0/agent/interrupt";
        payload = { id };
      } else if (op === "resume") {
        url = "/v0/agent/resume";
        payload = { id };
      } else if (op === "kill") {
        url = "/v0/agent/kill";
        payload = { id };
      } else {
        return reply.code(400).send({ ok: false, error: "invalid op" });
      }
      const res = await v1.inject({
        method: "POST",
        url,
        payload,
        headers: req.headers,
      });
      reply.code(res.statusCode);
      for (const [k, v] of Object.entries(res.headers))
        reply.header(k, v as any);
      try {
        reply.send(res.json());
      } catch {
        reply.send(res.payload);
      }
    },
  });
}
