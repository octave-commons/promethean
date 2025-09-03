// SPDX-License-Identifier: GPL-3.0-only
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAgentRoutes = registerAgentRoutes;
// @ts-nocheck
var path_1 = require("path");
var agentSupervisor_js_1 = require("../../agentSupervisor.js");
var agent_js_1 = require("../../agent.js");
// Maintain separate supervisors for different sandbox modes, and a registry mapping id->supervisor
var SUPS = new Map();
var DEFAULT_KEY = "default";
var NSJAIL_KEY = "nsjail";
var AGENT_INDEX = new Map(); // id -> key
function getSup(fastify, key) {
  var k = key === "nsjail" ? NSJAIL_KEY : DEFAULT_KEY;
  if (SUPS.has(k)) return SUPS.get(k);
  // Use the long-lived supervisor from agent.js for the default sandbox so
  // tests can easily stub its methods without wrestling with new instances.
  if (k === DEFAULT_KEY) {
    SUPS.set(k, agent_js_1.supervisor);
    return agent_js_1.supervisor;
  }
  var ROOT_PATH = fastify.ROOT_PATH;
  var logDir = path_1.default.join(
    path_1.default.dirname(new URL(import.meta.url).pathname),
    "../../logs/agents",
  );
  var sup = new agentSupervisor_js_1.AgentSupervisor({
    cwd: ROOT_PATH,
    logDir: logDir,
    sandbox: k === NSJAIL_KEY ? "nsjail" : false,
  });
  SUPS.set(k, sup);
  return sup;
}
function registerAgentRoutes(fastify) {
  var _this = this;
  var ROOT_PATH = fastify.ROOT_PATH;
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a,
          prompt_1,
          cwd,
          env,
          bypassApprovals,
          sandbox,
          tty,
          mode,
          sup,
          id,
          status_1,
          name_1,
          msg;
        return __generator(this, function (_b) {
          try {
            (_a = req.body || {}),
              (prompt_1 = _a.prompt),
              (cwd = _a.cwd),
              (env = _a.env),
              (bypassApprovals = _a.bypassApprovals),
              (sandbox = _a.sandbox),
              (tty = _a.tty);
            mode = sandbox === "nsjail" ? "nsjail" : "default";
            sup = getSup(fastify, mode);
            id = sup.start({
              prompt: prompt_1,
              env: env,
              bypassApprovals: Boolean(bypassApprovals),
              tty: tty !== false,
            });
            AGENT_INDEX.set(id, mode);
            status_1 = sup.status(id) || {};
            reply.send(__assign({ ok: true }, status_1));
          } catch (e) {
            name_1 = (e === null || e === void 0 ? void 0 : e.name) || "";
            msg = String(
              (e === null || e === void 0 ? void 0 : e.message) || e || "",
            );
            if (
              name_1 === "PTY_UNAVAILABLE" ||
              msg.includes("PTY_UNAVAILABLE")
            ) {
              return [
                2 /*return*/,
                reply.code(503).send({ ok: false, error: "pty_unavailable" }),
              ];
            }
            reply.code(500).send({
              ok: false,
              error: String(
                (e === null || e === void 0 ? void 0 : e.message) || e,
              ),
            });
          }
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, status;
        var _a;
        return __generator(this, function (_b) {
          id = String(
            ((_a = req.query) === null || _a === void 0 ? void 0 : _a.id) || "",
          );
          key = AGENT_INDEX.get(id);
          sup = key ? getSup(fastify, key) : null;
          status = sup ? sup.status(id) : null;
          if (!status) {
            // Try both supervisors if not indexed
            status =
              getSup(fastify, "default").status(id) ||
              getSup(fastify, "nsjail").status(id);
          }
          if (!status)
            return [
              2 /*return*/,
              reply.code(404).send({ ok: false, error: "not found" }),
            ];
          reply.send({ ok: true, status: status });
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, status;
        var _a;
        return __generator(this, function (_b) {
          id = String(
            ((_a = req.params) === null || _a === void 0 ? void 0 : _a.id) ||
              "",
          );
          key = AGENT_INDEX.get(id);
          sup = key ? getSup(fastify, key) : null;
          status = sup ? sup.status(id) : null;
          if (!status) {
            status =
              getSup(fastify, "default").status(id) ||
              getSup(fastify, "nsjail").status(id);
          }
          if (!status)
            return [
              2 /*return*/,
              reply.code(404).send({ ok: false, error: "not found" }),
            ];
          reply.send({ ok: true, status: status });
          return [2 /*return*/];
        });
      });
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
    handler: function (_req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var agents;
        return __generator(this, function (_a) {
          agents = Array.from(AGENT_INDEX.entries()).map(function (_a) {
            var id = _a[0],
              key = _a[1];
            return {
              id: id,
              sandbox: key,
            };
          });
          reply.send({ ok: true, agents: agents });
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, r, text;
        var _a, _b;
        return __generator(this, function (_c) {
          id = String(
            ((_a = req.query) === null || _a === void 0 ? void 0 : _a.id) || "",
          );
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(fastify, key);
          try {
            text = sup.logs(
              id,
              Number(
                ((_b = req.query) === null || _b === void 0
                  ? void 0
                  : _b.bytes) || 8192,
              ),
            );
            r = { total: text.length, chunk: text };
          } catch (_d) {
            r = null;
          }
          if (!r)
            return [
              2 /*return*/,
              reply.code(404).send({ ok: false, error: "not found" }),
            ];
          reply.send(__assign({ ok: true }, r));
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, r, text;
        var _a, _b;
        return __generator(this, function (_c) {
          id = String(
            ((_a = req.query) === null || _a === void 0 ? void 0 : _a.id) || "",
          );
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(fastify, key);
          try {
            text = sup.logs(
              id,
              Number(
                ((_b = req.query) === null || _b === void 0
                  ? void 0
                  : _b.bytes) || 8192,
              ),
            );
            r = { total: text.length, chunk: text };
          } catch (_d) {
            r = null;
          }
          if (!r)
            return [
              2 /*return*/,
              reply.code(404).send({ ok: false, error: "not found" }),
            ];
          reply.send(__assign({ ok: true }, r));
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, chunk, handler;
        var _a;
        return __generator(this, function (_b) {
          id = String(
            ((_a = req.query) === null || _a === void 0 ? void 0 : _a.id) || "",
          );
          if (!id) return [2 /*return*/, reply.code(400).send()];
          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(fastify, key);
          try {
            chunk = sup.logs(id, 2048);
            reply.raw.write(
              "event: replay\ndata: ".concat(
                JSON.stringify({ text: chunk }),
                "\n\n",
              ),
            );
          } catch (_c) {}
          handler = function (data) {
            return reply.raw.write(
              "event: data\ndata: ".concat(
                JSON.stringify({ text: String(data) }),
                "\n\n",
              ),
            );
          };
          sup.on(id, handler);
          req.raw.on("close", function () {
            try {
              sup.off(id, handler);
            } catch (_a) {}
          });
          return [2 /*return*/];
        });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, id, input, key, sup;
        return __generator(this, function (_b) {
          (_a = req.body || {}), (id = _a.id), (input = _a.input);
          if (!id)
            return [
              2 /*return*/,
              reply.code(400).send({ ok: false, error: "missing id" }),
            ];
          key = AGENT_INDEX.get(String(id)) || "default";
          sup = getSup(fastify, key);
          try {
            sup.send(String(id), String(input || ""));
            reply.send({ ok: true });
          } catch (e) {
            reply.send({
              ok: false,
              error: String(
                (e === null || e === void 0 ? void 0 : e.message) || e,
              ),
            });
          }
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, ok;
        return __generator(this, function (_a) {
          id = (req.body || {}).id;
          key = AGENT_INDEX.get(String(id)) || "default";
          sup = getSup(fastify, key);
          try {
            ok = sup.send(String(id), "\u0003");
            reply.send({ ok: Boolean(ok) });
          } catch (_b) {
            reply.send({ ok: false });
          }
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, ok;
        return __generator(this, function (_a) {
          id = (req.body || {}).id;
          key = AGENT_INDEX.get(String(id)) || "default";
          sup = getSup(fastify, key);
          ok = sup.kill(String(id || ""));
          reply.send({ ok: ok });
          return [2 /*return*/];
        });
      });
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
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var id, key, sup, ok;
        return __generator(this, function (_a) {
          id = (req.body || {}).id;
          key = AGENT_INDEX.get(String(id)) || "default";
          sup = getSup(fastify, key);
          try {
            ok = sup.resume(String(id || ""));
            reply.send({ ok: ok });
          } catch (e) {
            reply.send({
              ok: false,
              error: String(
                (e === null || e === void 0 ? void 0 : e.message) || e,
              ),
            });
          }
          return [2 /*return*/];
        });
      });
    },
  });
}
