import crypto from "crypto";

import { User } from "../../models/User.js";

function requireLocal(req: any, reply: any, done: any) {
  const remote = req?.socket?.remoteAddress;
  const forwarded =
    req.headers?.["x-forwarded-for"] || req.headers?.["forwarded"];
  const isLoopback =
    remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
  if (isLoopback && !forwarded) return done();
  reply.code(403).send({ ok: false, error: "Bootstrap must be run locally" });
}

export function registerBootstrapRoutes(app: any) {
  app.post("/bootstrap/admin", {
    preHandler: [requireLocal],
    schema: {
      summary: "Bootstrap first admin (one-time, local only)",
      operationId: "bootstrapAdmin",
      tags: ["Admin"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            username: { type: "string" },
            apiKey: { type: "string" },
          },
          required: ["ok", "username", "apiKey"],
        },
        400: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
        403: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async () => {
      const users = await User.find({});
      if (users.length > 0) {
        return { ok: false, error: "Already initialized" };
      }
      const apiKey = crypto.randomBytes(32).toString("hex");
      const user = await User.create({
        username: "admin",
        apiKey,
        roles: ["admin"],
      });
      return { ok: true, username: user.username, apiKey };
    },
  });
}
