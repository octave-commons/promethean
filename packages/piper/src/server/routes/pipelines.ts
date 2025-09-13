import * as path from "node:path";
import { promises as fs } from "node:fs";

import type { FastifyInstance } from "fastify";

import { FileSchema } from "../../types.js";
import { sseInit } from "../sse.js";
import { runPipeline } from "../../runner.js";
import type { PiperEvent } from "../../lib/events.js";
import rateLimit from "@fastify/rate-limit";

async function loadConfig(configPath: string) {
  const raw = await fs.readFile(configPath, "utf-8");
  const parsed = FileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

export async function registerPipelineRoutes(
  app: FastifyInstance,
  opts: { CONFIG_PATH: string; errToString: (e: unknown) => string },
) {
  const { CONFIG_PATH, errToString } = opts;
  // Register the rate limit plugin globally if not already registered
  await app.register(rateLimit, {
    max: 100, // Default: max 100 requests per 15 min window
    timeWindow: "15 minutes",
    allowList: [], // Adjust as needed
  });

  app.get("/api/pipelines", async (_req, reply) => {
    try {
      const cfg = await loadConfig(CONFIG_PATH);
      reply.header("content-type", "application/json");
      return reply.send({ pipelines: cfg.pipelines });
    } catch (e: unknown) {
      reply.code(200).header("content-type", "application/json");
      return reply.send({ pipelines: [], error: errToString(e) });
    }
  });

  app.get<{ Querystring: Record<string, string | undefined> }>(
    "/api/run-step",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const pipeline = req.query.pipeline ?? "";
      const step = req.query.step ?? "";
      const send = sseInit(reply);
      if (!pipeline || !step) {
        send("missing pipeline or step");
        reply.raw.end();
        return;
      }
      const cfg = await loadConfig(CONFIG_PATH);
      const pl = cfg.pipelines.find((p) => p.name === pipeline);
      if (!pl) {
        send(`pipeline '${pipeline}' not found`);
        reply.raw.end();
        return;
      }
      if (!pl.steps.some((s) => s.id === step)) {
        send(`step '${step}' not found in pipeline '${pipeline}'`);
        reply.raw.end();
        return;
      }
      // Optional one-off overrides
      let useConfigPath = CONFIG_PATH;
      try {
        const filesParam = req.query.files || "";
        const files = filesParam
          ? filesParam
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const overrides: Record<string, any> = {};
        const env: Record<string, string> = {};
        const args: Record<string, any> = {};
        const js: Record<string, any> = {};
        const ts: Record<string, any> = {};
        const parseVal = (v: string) => {
          if (v === "true") return true;
          if (v === "false") return false;
          const n = Number(v);
          return Number.isNaN(n) ? v : n;
        };
        for (const [k, v] of Object.entries(req.query)) {
          if (k.startsWith("env.")) env[k.slice(4)] = v!;
          else if (k.startsWith("arg.")) args[k.slice(4)] = parseVal(v!);
          else if (k.startsWith("js.")) js[k.slice(3)] = v!;
          else if (k.startsWith("ts.")) ts[k.slice(3)] = v!;
          else if (!["pipeline", "step", "files", "force"].includes(k))
            overrides[k] = parseVal(v!);
        }

        const hasOverrides =
          files.length ||
          Object.keys(overrides).length ||
          Object.keys(env).length ||
          Object.keys(args).length ||
          Object.keys(js).length ||
          Object.keys(ts).length;

        if (hasOverrides) {
          const clone = JSON.parse(JSON.stringify(cfg)) as typeof cfg;
          const p2 = clone.pipelines.find((p) => p.name === pipeline);
          if (!p2) throw new Error(`pipeline '${pipeline}' not found`);
          const s2 = p2.steps.find((x) => x.id === step);
          if (!s2) throw new Error(`step '${step}' not found`);
          Object.assign(s2, overrides);
          if (Object.keys(env).length) s2.env = { ...(s2.env || {}), ...env };
          if (Object.keys(js).length || (Object.keys(args).length && s2.js)) {
            s2.js = { ...(s2.js || {}), ...js } as any;
            if (Object.keys(args).length) {
              const cur = s2.js && typeof s2.js.args === "object" ? s2.js.args : {};
              s2.js = { ...(s2.js || {}), args: { ...cur, ...args } } as any;
            }
          }
          if (Object.keys(ts).length || (Object.keys(args).length && s2.ts)) {
            s2.ts = { ...(s2.ts || {}), ...ts } as any;
            if (Object.keys(args).length) {
              const cur = s2.ts && typeof s2.ts.args === "object" ? s2.ts.args : {};
              s2.ts = { ...(s2.ts || {}), args: { ...cur, ...args } } as any;
            }
          }
          if (files.length) {
            if (s2.js) {
              const current = s2.js.args && typeof s2.js.args === "object" ? s2.js.args : {};
              s2.js.args = { ...current, files };
            } else {
              s2.env = { ...(s2.env || {}), PIPER_FILES: JSON.stringify(files) };
            }
          }
          const tmpPath = path.resolve(path.dirname(CONFIG_PATH), ".cache/piper.ui.run.json");
          await fs.mkdir(path.dirname(tmpPath), { recursive: true });
          await fs.writeFile(tmpPath, JSON.stringify(clone, null, 2), "utf8");
          useConfigPath = tmpPath;
        }
      } catch (e: unknown) {
        send(`failed to prepare run config: ${errToString(e)}`);
      }
      const emit = (ev: PiperEvent) => {
        if (ev.stepId !== step) return;
        if (ev.type === "start") send(`START ${ev.stepId}`);
        else if (ev.type === "skip") send(`SKIP ${ev.reason}`);
        else if (ev.type === "end") {
          if (ev.result.stdout) send(ev.result.stdout);
          if (ev.result.stderr) send(ev.result.stderr);
          send(`EXIT ${ev.result.exitCode}`);
        }
      };
      try {
        await runPipeline(useConfigPath, pipeline, {
          json: true,
          force: req.query.force === "true",
          emit,
        });
      } catch (e: unknown) {
        send(String((e as Error)?.stack || e));
      }
      reply.raw.end();
    },
  );
}
