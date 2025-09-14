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
  return async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const cfg = await loadConfig(CONFIG_PATH);
      reply.header("content-type", "application/json");
      return reply.send({ pipelines: cfg.pipelines });
    } catch (e: unknown) {
      reply.code(200).header("content-type", "application/json");
      return reply.send({ pipelines: [], error: errToString(e) });
    }
  };
}

function makeEmitForStep(stepId: string, send: (s: string) => void) {
  return (ev: PiperEvent) => {
    if (ev.stepId !== stepId) return;
    if (ev.type === "start") send(`START ${ev.stepId}`);
    else if (ev.type === "skip") send(`SKIP ${ev.reason}`);
    else if (ev.type === "retry")
      send(`RETRY attempt=${ev.attempt} exit=${ev.exitCode ?? "null"}`);
    else if (ev.type === "end") {
      if (ev.result.stdout) send(ev.result.stdout);
      if (ev.result.stderr) send(ev.result.stderr);
      send(`EXIT ${ev.result.exitCode}`);
    }
  };
}

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

async function executeRun(opts: Readonly<ExecuteRunOptions>): Promise<void> {
  const { CONFIG_PATH, cfg, pipeline, step, ov, force, send, errToString } =
    opts;
  const emit = makeEmitForStep(step, send);
  if (hasAnyOverrides(ov)) {
    try {
      const overridden = applyOverridesImmutable(cfg, pipeline, step, ov);
      const tmpPath = await writeTemporaryConfigCopy(CONFIG_PATH, overridden);
      await runPipeline(tmpPath, pipeline, { json: true, force, emit });
    } catch (e: unknown) {
      send(`failed to prepare run config: ${errToString(e)}`);
      return;
    }
  } else {
    try {
      await runPipeline(CONFIG_PATH, pipeline, { json: true, force, emit });
    } catch (e: unknown) {
      send(String((e as Error)?.stack || e));
    }
  }
}

function makeRunStepHandler(
  CONFIG_PATH: string,
  errToString: (e: unknown) => string,
) {
  return async (
    req: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
    reply: FastifyReply,
  ) => {
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

    const ov = parseOverridesFromQuery(req.query);
    await executeRun({
      CONFIG_PATH,
      cfg,
      pipeline,
      step,
      ov,
      force: req.query.force === "true",
      send,
      errToString,
    });

    reply.raw.end();
  };
}

function makePipelineEmit(send: (s: string) => void) {
  return (ev: PiperEvent) => {
    if (ev.type === "start") send(`START ${ev.stepId}`);
    else if (ev.type === "skip") send(`SKIP ${ev.stepId} ${ev.reason}`);
    else if (ev.type === "retry")
      send(
        `RETRY ${ev.stepId} attempt=${ev.attempt} exit=${
          ev.exitCode ?? "null"
        }`,
      );
    else if (ev.type === "end") {
      if (ev.result.stdout) send(`${ev.stepId} ${ev.result.stdout}`);
      if (ev.result.stderr) send(`${ev.stepId} ${ev.result.stderr}`);
      send(`EXIT ${ev.stepId} ${ev.result.exitCode}`);
    }
  };
}

function makeRunPipelineHandler(
  CONFIG_PATH: string,
  errToString: (e: unknown) => string,
) {
  return async (
    req: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
    reply: FastifyReply,
  ) => {
    const pipeline = req.query.pipeline ?? "";
    const send = sseInit(reply);

    if (!pipeline) {
      send("missing pipeline");
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
    const emit = makePipelineEmit(send);

    try {
      await runPipeline(CONFIG_PATH, pipeline, {
        json: true,
        force: req.query.force === "true",
        emit,
      });
    } catch (e: unknown) {
      send(errToString(e));
    }

    reply.raw.end();
  };
}

export async function registerPipelineRoutes(
  app: FastifyInstance,
  opts: { CONFIG_PATH: string; errToString: (e: unknown) => string },
): Promise<void> {
  const { CONFIG_PATH, errToString } = opts;
  // Register the rate limit plugin globally if not already registered
  await app.register(rateLimit, {
    max: 100, // Default: max 100 requests per 15 min window
    timeWindow: "15 minutes",
    allowList: [], // Adjust as needed
  });

  app.get(
    "/api/pipelines",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    makePipelinesListHandler(CONFIG_PATH, errToString),
  );

  app.get<{ Querystring: Record<string, string | undefined> }>(
    "/api/run",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    makeRunPipelineHandler(CONFIG_PATH, errToString),
  );

  app.get<{ Querystring: Record<string, string | undefined> }>(
    "/api/run-step",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    makeRunStepHandler(CONFIG_PATH, errToString),
  );
}
