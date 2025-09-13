import * as path from "node:path";
import { promises as fs } from "node:fs";

import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { FileSchema, type PiperFile, type PiperStep } from "../../types.js";
import { sseInit } from "../sse.js";
import { runPipeline } from "../../runner.js";
import type { PiperEvent } from "../../lib/events.js";

async function loadConfig(configPath: string): Promise<PiperFile> {
  const raw = await fs.readFile(configPath, "utf-8");
  const parsed = FileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

function parseVal(v: string): string | number | boolean {
  if (v === "true") return true;
  if (v === "false") return false;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
}

type Overrides = {
  readonly files: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly args: Readonly<Record<string, unknown>>;
  readonly js: Readonly<Partial<NonNullable<PiperStep["js"]>>>;
  readonly ts: Readonly<Partial<NonNullable<PiperStep["ts"]>>>;
  readonly step: Readonly<Partial<Omit<PiperStep, "env" | "js" | "ts">>>;
};

function parseOverridesFromQuery(
  query: Readonly<Record<string, string | undefined>>,
): Overrides {
  const files = (query.files || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const env: Record<string, string> = {};
  const args: Record<string, unknown> = {};
  const js: Record<string, unknown> = {};
  const ts: Record<string, unknown> = {};
  const step: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(query)) {
    if (v == null) continue;
    if (k.startsWith("env.")) env[k.slice(4)] = String(v);
    else if (k.startsWith("arg.")) args[k.slice(4)] = parseVal(v);
    else if (k.startsWith("js.")) js[k.slice(3)] = v;
    else if (k.startsWith("ts.")) ts[k.slice(3)] = v;
    else if (!["pipeline", "step", "files", "force"].includes(k))
      step[k] = parseVal(v);
  }

  return {
    files,
    env,
    args,
    js: js as Partial<NonNullable<PiperStep["js"]>>,
    ts: ts as Partial<NonNullable<PiperStep["ts"]>>,
    step: step as Partial<Omit<PiperStep, "env" | "js" | "ts">>,
  };
}

function ensureRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object"
    ? (v as Record<string, unknown>)
    : undefined;
}

function mergeArgs(
  current: unknown,
  add: Readonly<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  const hasAdds = Object.keys(add).length > 0;
  if (!hasAdds && (!current || typeof current !== "object")) return undefined;
  const base = ensureRecord(current) || {};
  return { ...base, ...add };
}

function mergeEnv(
  step: PiperStep,
  env: Readonly<Record<string, string>>,
): PiperStep {
  if (Object.keys(env).length === 0) return step;
  return { ...step, env: { ...(step.env || {}), ...env } };
}

function mergeJs(
  step: PiperStep,
  jsOv: Overrides["js"],
  argsOv: Overrides["args"],
): PiperStep {
  if (Object.keys(jsOv).length === 0 && Object.keys(argsOv).length === 0)
    return step;
  const cur = ensureRecord((step as { js?: unknown }).js);
  const mergedArgs = mergeArgs(cur?.args, argsOv);
  const next = { ...(cur || {}), ...jsOv } as Record<string, unknown>;
  if (mergedArgs !== undefined) next.args = mergedArgs;
  return { ...step, js: next as NonNullable<PiperStep["js"]> };
}

function mergeTs(
  step: PiperStep,
  tsOv: Overrides["ts"],
  argsOv: Overrides["args"],
): PiperStep {
  if (Object.keys(tsOv).length === 0 && Object.keys(argsOv).length === 0)
    return step;
  const cur = ensureRecord((step as { ts?: unknown }).ts);
  const mergedArgs = mergeArgs(cur?.args, argsOv);
  const next = { ...(cur || {}), ...tsOv } as Record<string, unknown>;
  if (mergedArgs !== undefined) next.args = mergedArgs;
  return { ...step, ts: next as NonNullable<PiperStep["ts"]> };
}

function applyFilesOverride(
  step: PiperStep,
  files: readonly string[],
): PiperStep {
  if (files.length === 0) return step;
  if ((step as { js?: unknown }).js) {
    const cur = ensureRecord((step as { js?: unknown }).js) || {};
    const curArgs = ensureRecord(cur.args) || {};
    const jsWithFiles = { ...cur, args: { ...curArgs, files } } as Record<
      string,
      unknown
    >;
    return { ...step, js: jsWithFiles as NonNullable<PiperStep["js"]> };
  }
  return {
    ...step,
    env: { ...(step.env || {}), PIPER_FILES: JSON.stringify(files) },
  };
}

function applyOverridesToStep(base: PiperStep, ov: Overrides): PiperStep {
  const withStep = { ...base, ...ov.step };
  const withEnv = mergeEnv(withStep, ov.env);
  const withJs = mergeJs(withEnv, ov.js, ov.args);
  const withTs = mergeTs(withJs, ov.ts, ov.args);
  return applyFilesOverride(withTs, ov.files);
}

function applyOverridesImmutable(
  cfg: PiperFile,
  pipelineName: string,
  stepId: string,
  ov: Overrides,
): PiperFile {
  return {
    pipelines: cfg.pipelines.map((p) =>
      p.name !== pipelineName
        ? p
        : {
            name: p.name,
            steps: p.steps.map((s) =>
              s.id === stepId ? applyOverridesToStep(s, ov) : s,
            ),
          },
    ),
  };
}

async function writeTemporaryConfigCopy(
  configPath: string,
  cfg: PiperFile,
): Promise<string> {
  const cacheDir = path.resolve(path.dirname(configPath), ".cache");
  await fs.mkdir(cacheDir, { recursive: true });
  const tmpPath = path.join(
    cacheDir,
    `piper.ui.run-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );
  await fs.writeFile(tmpPath, JSON.stringify(cfg, null, 2), "utf8");
  return tmpPath;
}

function hasAnyOverrides(ov: Overrides): boolean {
  return (
    ov.files.length > 0 ||
    Object.keys(ov.env).length > 0 ||
    Object.keys(ov.args).length > 0 ||
    Object.keys(ov.js).length > 0 ||
    Object.keys(ov.ts).length > 0 ||
    Object.keys(ov.step).length > 0
  );
}

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
  readonly cfg: PiperFile;
  readonly pipeline: string;
  readonly step: string;
  readonly ov: Overrides;
  readonly force: boolean;
  readonly send: (s: string) => void;
  readonly errToString: (e: unknown) => string;
};

async function executeRun(opts: ExecuteRunOptions): Promise<void> {
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
    "/api/run-step",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    makeRunStepHandler(CONFIG_PATH, errToString),
  );
}
