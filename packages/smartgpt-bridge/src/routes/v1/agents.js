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
function registerAgentRoutes(v1) {
  // ------------------------------------------------------------------
  // Agents
  // ------------------------------------------------------------------
  v1.get("/agents", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "agents";
      }),
    ],
    schema: {
      summary: "List agents",
      operationId: "listAgents",
      tags: ["Agents"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            agents: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    handler: function () {
      return __awaiter(this, void 0, void 0, function () {
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
          return [2 /*return*/, { ok: true, agents: agents }];
        });
      });
    },
  });
  v1.post("/agents", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", function () {
        return "agents";
      }),
    ],
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
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            id: { type: "string" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
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
            sup = getSup(v1, mode);
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
            msg = String(
              (e === null || e === void 0 ? void 0 : e.message) || e || "",
            );
            if (msg.includes("PTY_UNAVAILABLE"))
              return [
                2 /*return*/,
                reply.code(503).send({ ok: false, error: "pty_unavailable" }),
              ];
            reply.code(500).send({ ok: false, error: msg });
          }
          return [2 /*return*/];
        });
      });
    },
  });
  v1.get("/agents/:id", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function (req) {
        return "agent:".concat(req.params.id);
      }),
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
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "string" },
            agent: { type: "object" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var id, key, sup, status;
        return __generator(this, function (_a) {
          id = String(req.params.id);
          key = AGENT_INDEX.get(id);
          sup = key ? getSup(v1, key) : null;
          status = sup ? sup.status(id) : null;
          if (!status) {
            status =
              getSup(v1, "default").status(id) ||
              getSup(v1, "nsjail").status(id);
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
  v1.get("/agents/:id/logs", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function (req) {
        return "agent:".concat(req.params.id);
      }),
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
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var id, key, sup, r;
        var _a;
        return __generator(this, function (_b) {
          id = String(req.params.id);
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(v1, key);
          try {
            r = sup.tail(
              id,
              Number(
                ((_a = req.query) === null || _a === void 0
                  ? void 0
                  : _a.tail) || 500,
              ),
            );
          } catch (_c) {
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
  v1.get("/agents/:id/stream", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function (req) {
        return "agent:".concat(req.params.id);
      }),
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
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var id, key, sup, chunk, handler;
        return __generator(this, function (_a) {
          id = String(req.params.id);
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(v1, key);
          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });
          try {
            chunk = sup.tail(id, 2048).chunk;
            reply.raw.write(
              "event: replay\ndata: ".concat(
                JSON.stringify({ text: chunk }),
                "\n\n",
              ),
            );
          } catch (_b) {}
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
  v1.post("/agents/:id", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", function (req) {
        return "agent:".concat(req.params.id);
      }),
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
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            message: { type: "string", nullable: true },
          },
        },
        400: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            error: { type: "string" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var _a, op, input, id, key, sup, ok, ok, ok;
        return __generator(this, function (_b) {
          (_a = req.body || {}), (op = _a.op), (input = _a.input);
          id = String(req.params.id);
          key = AGENT_INDEX.get(id) || "default";
          sup = getSup(v1, key);
          try {
            if (op === "send") {
              sup.send(id, String(input || ""));
              return [2 /*return*/, reply.send({ ok: true })];
            } else if (op === "interrupt") {
              ok = sup.send(id, "\u0003");
              return [2 /*return*/, reply.send({ ok: Boolean(ok) })];
            } else if (op === "resume") {
              ok = sup.resume(id);
              return [2 /*return*/, reply.send({ ok: ok })];
            } else if (op === "kill") {
              ok = sup.kill(id);
              return [2 /*return*/, reply.send({ ok: ok })];
            }
            return [
              2 /*return*/,
              reply.code(400).send({ ok: false, error: "invalid op" }),
            ];
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
