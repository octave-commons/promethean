// @ts-nocheck
import crypto from "crypto";
import { User } from "../../models/User.js";

function requireLocal(req, reply, done) {
  const ip = req.ip;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
    return done();
  }
  reply.code(403).send({ ok: false, error: "Bootstrap must be run locally" });
}

export function registerBootstrapRoutes(app) {
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
      const count = await User.countDocuments();
      if (count > 0) {
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
