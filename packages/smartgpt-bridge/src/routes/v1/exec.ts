import { runCommand } from "../../exec.js";

export type ExecDeps = {
  runCommand?:
    | ((
        opts: Parameters<typeof runCommand>[0],
      ) => ReturnType<typeof runCommand>)
    | undefined;
};

export function registerExecRoutes(v1: any, deps: ExecDeps = {}) {
  const ROOT_PATH = v1.ROOT_PATH;
  const run = deps.runCommand ?? runCommand;
  v1.post("/exec/run", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    schema: {
      summary: "Run a shell command",
      operationId: "runCommand",
      tags: ["Exec"],
      body: {
        type: "object",
        required: ["command"],
        properties: {
          command: { type: "string" },
          cwd: { type: "string" },
          env: { type: "object", additionalProperties: { type: "string" } },
          timeoutMs: { type: "integer", default: 600000 },
          tty: { type: "boolean", default: false },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            exitCode: { type: ["integer", "null"] },
            signal: { type: ["string", "null"] },
            stdout: { type: "string" },
            stderr: { type: "string" },
            error: { type: "string" },
          },
        },
        403: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const execEnabled =
          String(process.env.EXEC_ENABLED || "false").toLowerCase() === "true";
        if (!execEnabled)
          return reply.code(403).send({ ok: false, error: "exec disabled" });
        const { command, cwd, env, timeoutMs, tty } = req.body || {};
        if (!command)
          return reply
            .code(400)
            .send({ ok: false, error: "Missing 'command'" });
        const out = await run({
          command: String(command),
          cwd: cwd ? String(cwd) : ROOT_PATH,
          repoRoot: ROOT_PATH,
          env,
          timeoutMs: Number(timeoutMs || 600000),
          tty: Boolean(tty),
        });
        reply.send(out);
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });
}
