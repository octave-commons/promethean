// @ts-nocheck
import crypto from "crypto";
import { User } from "../../models/User.js";

export function registerUserRoutes(app) {
  app.post("/users/create", {
    preHandler: [app.authUser, app.requirePolicy("write", "users")],
    schema: {
      summary: "Create user",
      operationId: "createUser",
      tags: ["Admin"],
      body: {
        type: "object",
        required: ["username"],
        properties: {
          username: { type: "string" },
          roles: { type: "array", items: { type: "string" } },
        },
      },
    },
    handler: async (req) => {
      const { username, roles } = req.body || {};
      const apiKey = crypto.randomBytes(32).toString("hex");
      const user = await User.create({
        username,
        roles: roles || ["user"],
        apiKey,
      });
      return {
        ok: true,
        user: { username: user.username, apiKey, roles: user.roles },
      };
    },
  });

  app.get("/users/list", {
    preHandler: [app.authUser, app.requirePolicy("read", "users")],
    schema: { operationId: "listUsers", tags: ["Admin"] },
    handler: async () => {
      const users = await User.find(
        {},
        { username: 1, roles: 1, createdAt: 1 },
      ).lean();
      return { users };
    },
  });

  app.post("/users/delete", {
    preHandler: [app.authUser, app.requirePolicy("write", "users")],
    schema: {
      operationId: "deleteUser",
      tags: ["Admin"],
      body: {
        type: "object",
        required: ["username"],
        properties: { username: { type: "string" } },
      },
    },
    handler: async (req) => {
      const { username } = req.body || {};
      await User.deleteOne({ username });
      return { ok: true };
    },
  });
}
