import path from "path";

import { AgentSupervisor as NewAgentSupervisor } from "../../agentSupervisor.js";
import { supervisor as defaultSupervisor } from "../../agent.js";

// Maintain separate supervisors for different sandbox modes, and a registry mapping id->supervisor
const SUPS: Map<string, any> = new Map();
const DEFAULT_KEY = "default";
const NSJAIL_KEY = "nsjail";
const AGENT_INDEX: Map<string, string> = new Map(); // id -> key

function getSup(fastify: any, key: string) {
  const k = key === "nsjail" ? NSJAIL_KEY : DEFAULT_KEY;
  if (SUPS.has(k)) return SUPS.get(k);
  // Use the long-lived supervisor from agent.js for the default sandbox so
  // tests can easily stub its methods without wrestling with new instances.
  if (k === DEFAULT_KEY) {
    SUPS.set(k, defaultSupervisor);
    return defaultSupervisor;
  }
  const ROOT_PATH = fastify.ROOT_PATH as string;
  const logDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "../../logs/agents",
  );
  const sup = new NewAgentSupervisor({
    cwd: ROOT_PATH,
    logDir,
    sandbox: k === NSJAIL_KEY ? "nsjail" : false,
  });
  SUPS.set(k, sup);
  return sup;
}

export function registerAgentRoutes(fastify: any) {
  // ROOT_PATH available via fastify.ROOT_PATH if needed
  fastify.post("/agent/start", {
    schema: {
      summary: "Start a background agent",
      operationId: "startAgent",
      tags: ["Agent"],
      body: {
        $id: "AgentStartRequest",
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: { type: "string" },
          bypassApprovals: { type: "boolean", default: false },
          sandbox: {
            type: ["string", "boolean"],
            enum: ["nsjail", true, false],
            default: false,
          },
          tty: { type: "boolean", default: true },
          env: { type: "object", additionalProperties: { type: "string" } },
        },
      },
      response: {
        200: {
          $id: "AgentStartResponse",
          type: "object",
          properties: {
            ok: { type: "boolean" },
            id: { type: "string" },
            prompt: { type: "string" },
            startedAt: { type: "integer" },
            sandbox: { type: "string" },
            bypassApprovals: { type: "boolean" },
            logfile: { type: "string" },
          },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const {
          prompt,
          cwd: _cwd,
          env,
          bypassApprovals,
          sandbox,
          tty,
        } = req.body || {};
        const mode = sandbox === "nsjail" ? "nsjail" : "default";
        const sup = getSup(fastify, mode);
        const { id } = await sup.start({
          prompt,
          env,
          bypassApprovals: Boolean(bypassApprovals),
          tty: tty !== false,
        });
        AGENT_INDEX.set(id, mode);
        const status = sup.status(id) || {};
        reply.send({ ok: true, ...status });
      } catch (e: any) {
        const name = e?.name || "";
        const msg = String(e?.message || e || "");
        if (name === "PTY_UNAVAILABLE" || msg.includes("PTY_UNAVAILABLE")) {
          return reply.code(503).send({ ok: false, error: "pty_unavailable" });
        }
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.get("/agent/status", {
    schema: {
      summary: "Get agent status",
      operationId: "getAgentStatus",
      tags: ["Agent"],
      querystring: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: {
        200: {
          $id: "AgentStatusResponse",
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "object" },
          },
        },
        404: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const id = String(req.query?.id || "");
      const key = AGENT_INDEX.get(id);
      const sup = key ? getSup(fastify, key) : null;
      let status = sup ? sup.status(id) : null;
      if (!status) {
        // Try both supervisors if not indexed
        status =
          getSup(fastify, "default").status(id) ||
          getSup(fastify, "nsjail").status(id);
      }
      if (!status)
        return reply.code(404).send({ ok: false, error: "not found" });
      reply.send({ ok: true, status });
    },
  });

  // Convenience alias with path param
  fastify.get("/agent/status/:id", {
    schema: {
      summary: "Get agent status by id",
      operationId: "getAgentStatusById",
      tags: ["Agent"],
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, status: { type: "object" } },
        },
        404: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const id = String(req.params?.id || "");
      const key = AGENT_INDEX.get(id);
      const sup = key ? getSup(fastify, key) : null;
      let status = sup ? sup.status(id) : null;
      if (!status) {
        status =
          getSup(fastify, "default").status(id) ||
          getSup(fastify, "nsjail").status(id);
      }
      if (!status)
        return reply.code(404).send({ ok: false, error: "not found" });
      reply.send({ ok: true, status });
    },
  });

  fastify.get("/agent/list", {
    schema: {
      summary: "List active agents",
      operationId: "listAgents",
      tags: ["Agent"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            agents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  sandbox: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    handler: async (_req: any, reply: any) => {
      const agents = Array.from(AGENT_INDEX.entries()).map(([id, key]) => ({
        id,
        sandbox: key,
      }));
      reply.send({ ok: true, agents });
    },
  });

  fastify.get("/agent/logs", {
    schema: {
      summary: "Get agent logs",
      operationId: "getAgentLogs",
      tags: ["Agent"],
      querystring: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
          bytes: { type: "integer", default: 8192 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            total: { type: "integer" },
            chunk: { type: "string" },
          },
        },
        404: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const id = String(req.query?.id || "");
      const key = AGENT_INDEX.get(id) || "default";
      const sup = getSup(fastify, key);
      let r;
      try {
        const text = sup.logs(id, Number(req.query?.bytes || 8192));
        r = { total: text.length, chunk: text };
      } catch {
        r = null;
      }
      if (!r) return reply.code(404).send({ ok: false, error: "not found" });
      reply.send({ ok: true, ...r });
    },
  });

  fastify.get("/agent/tail", {
    schema: {
      summary: "Tail agent logs",
      operationId: "tailAgentLogs",
      tags: ["Agent"],
      querystring: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
          bytes: { type: "integer", default: 8192 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            total: { type: "integer" },
            chunk: { type: "string" },
          },
        },
        404: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const id = String(req.query?.id || "");
      const key = AGENT_INDEX.get(id) || "default";
      const sup = getSup(fastify, key);
      let r;
      try {
        const text = sup.logs(id, Number(req.query?.bytes || 8192));
        r = { total: text.length, chunk: text };
      } catch {
        r = null;
      }
      if (!r) return reply.code(404).send({ ok: false, error: "not found" });
      reply.send({ ok: true, ...r });
    },
  });

  fastify.get("/agent/stream", {
    schema: {
      summary: "Stream agent logs",
      operationId: "streamAgentLogs",
      tags: ["Agent"],
      querystring: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: { 200: { type: "string" } },
    },
    attachValidation: true,
    handler: async (req: any, reply: any) => {
      const id = String(req.query?.id || "");
      if ((req as any).validationError || !id)
        return reply.code(400).send({ ok: false, error: "id is required" });
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      const key = AGENT_INDEX.get(id) || "default";
      const sup = getSup(fastify, key);
      try {
        const chunk = sup.logs(id, 2048);
        reply.raw.write(
          `event: replay\ndata: ${JSON.stringify({ text: chunk })}\n\n`,
        );
      } catch {}
      const handler = (data: any) =>
        reply.raw.write(
          `event: data\ndata: ${JSON.stringify({ text: String(data) })}\n\n`,
        );
      sup.on(id, handler);
      req.raw.on("close", () => {
        try {
          sup.off(id, handler);
        } catch {}
      });
    },
  });

  fastify.post("/agent/send", {
    schema: {
      summary: "Send input to agent",
      operationId: "sendAgentInput",
      tags: ["Agent"],
      body: {
        type: "object",
        properties: { id: { type: "string" }, input: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const { id, input } = req.body || {};
      if (!id) return reply.code(400).send({ ok: false, error: "missing id" });
      const key = AGENT_INDEX.get(String(id)) || "default";
      const sup = getSup(fastify, key);
      try {
        sup.send(String(id), String(input || ""));
        reply.send({ ok: true });
      } catch (e: any) {
        reply.send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/agent/interrupt", {
    schema: {
      summary: "Interrupt agent",
      operationId: "interruptAgent",
      tags: ["Agent"],
      body: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: {
        200: { type: "object", properties: { ok: { type: "boolean" } } },
      },
    },
    handler: async (req: any, reply: any) => {
      const { id } = req.body || {};
      const key = AGENT_INDEX.get(String(id)) || "default";
      const sup = getSup(fastify, key);
      try {
        const ok = sup.send(String(id), "\u0003");
        reply.send({ ok: Boolean(ok) });
      } catch {
        reply.send({ ok: false });
      }
    },
  });

  fastify.post("/agent/kill", {
    schema: {
      summary: "Kill an agent",
      operationId: "killAgent",
      tags: ["Agent"],
      body: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: {
        200: { type: "object", properties: { ok: { type: "boolean" } } },
      },
    },
    handler: async (req: any, reply: any) => {
      const { id } = req.body || {};
      const key = AGENT_INDEX.get(String(id)) || "default";
      const sup = getSup(fastify, key);
      const ok = sup.kill(String(id || ""));
      reply.send({ ok });
    },
  });

  fastify.post("/agent/resume", {
    schema: {
      summary: "Resume agent (not supported)",
      operationId: "resumeAgent",
      tags: ["Agent"],
      body: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      const { id } = req.body || {};
      const key = AGENT_INDEX.get(String(id)) || "default";
      const sup = getSup(fastify, key);
      try {
        const ok = sup.resume(String(id || ""));
        reply.send({ ok });
      } catch (e: any) {
        reply.send({ ok: false, error: String(e?.message || e) });
      }
    },
  });
}

// Expose supervisor lookup and index for other route layers (e.g., v1 proxies)
export { AGENT_INDEX, getSup };
