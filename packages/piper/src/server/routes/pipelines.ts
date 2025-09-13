import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { sseInit } from "../sse.js";
import { runPipeline } from "../../runner.js";
import type { PiperEvent } from "../../lib/events.js";
import type { PiperFile } from "../../types.js";

import {
  loadConfig,
  parseOverridesFromQuery,
  applyOverridesImmutable,
  writeTemporaryConfigCopy,
  hasAnyOverrides,
  type ReadonlyDeep,
  type Overrides,
} from "./pipelines-helpers.js";

function makePipelinesListHandler(
  CONFIG_PATH: string,
  errToString: (e: unknown) => string,
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

        type ExecuteRunOptions = {
          readonly CONFIG_PATH: string;
          readonly cfg: ReadonlyDeep<PiperFile>;
          readonly pipeline: string;
          readonly step: string;
          readonly ov: Readonly<Overrides>;
          readonly force: boolean;
          readonly send: (s: string) => void;
          readonly errToString: (e: unknown) => string;
        };

        async function executeRun(
          opts: Readonly<ExecuteRunOptions>,
        ): Promise<void> {
          const {
            CONFIG_PATH,
            cfg,
            pipeline,
            step,
            ov,
            force,
            send,
            errToString,
          } = opts;
          const emit = makeEmitForStep(step, send);
          if (hasAnyOverrides(ov)) {
            try {
              const overridden = applyOverridesImmutable(
                cfg,
                pipeline,
                step,
                ov,
              );
              const tmpPath = await writeTemporaryConfigCopy(
                CONFIG_PATH,
                overridden,
              );
              await runPipeline(tmpPath, pipeline, { json: true, force, emit });
            } catch (e: unknown) {
              send(`failed to prepare run config: ${errToString(e)}`);
              return;
            }
          } else {
            try {
              await runPipeline(CONFIG_PATH, pipeline, {
                json: true,
                force,
                emit,
              });
            } catch (e: unknown) {
              send(String((e as Error)?.stack || e));
            }
          }
        }

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
              const cur =
                s2.js && typeof s2.js.args === "object" ? s2.js.args : {};
              s2.js = { ...(s2.js || {}), args: { ...cur, ...args } } as any;
            }
          }
          if (Object.keys(ts).length || (Object.keys(args).length && s2.ts)) {
            s2.ts = { ...(s2.ts || {}), ...ts } as any;
            if (Object.keys(args).length) {
              const cur =
                s2.ts && typeof s2.ts.args === "object" ? s2.ts.args : {};
              s2.ts = { ...(s2.ts || {}), args: { ...cur, ...args } } as any;
            }
          }
          if (files.length) {
            if (s2.js) {
              const current =
                s2.js.args && typeof s2.js.args === "object" ? s2.js.args : {};
              s2.js.args = { ...current, files };
            } else {
              s2.env = {
                ...(s2.env || {}),
                PIPER_FILES: JSON.stringify(files),
              };
            }
          }
          const tmpPath = path.resolve(
            path.dirname(CONFIG_PATH),
            ".cache/piper.ui.run.json",
          );
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
