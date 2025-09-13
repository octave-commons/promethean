import * as path from "node:path";
import { promises as fs } from "node:fs";

import { FileSchema, type PiperFile, type PiperStep } from "../../types.js";

export type ReadonlyDeep<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends Promise<infer U>
    ? Promise<ReadonlyDeep<U>>
    : T extends object
      ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
      : T;

export async function loadConfig(
  configPath: string,
): Promise<ReadonlyDeep<PiperFile>> {
  const raw = await fs.readFile(configPath, "utf-8");
  const parsed = FileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data as ReadonlyDeep<PiperFile>;
}

function parseVal(v: string): string | number | boolean {
  if (v === "true") return true;
  if (v === "false") return false;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
}

export type Overrides = {
  readonly files: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly args: Readonly<Record<string, unknown>>;
  readonly js: Readonly<Partial<NonNullable<PiperStep["js"]>>>;
  readonly ts: Readonly<Partial<NonNullable<PiperStep["ts"]>>>;
  readonly step: Readonly<Partial<Omit<PiperStep, "env" | "js" | "ts">>>;
};

export function parseOverridesFromQuery(
  query: Readonly<Record<string, string | undefined>>,
): Overrides {
  const files = (query.files || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const init = {
    env: {} as Record<string, string>,
    args: {} as Record<string, unknown>,
    js: {} as Record<string, unknown>,
    ts: {} as Record<string, unknown>,
    step: {} as Record<string, unknown>,
  };

  const { env, args, js, ts, step } = Object.entries(query).reduce(
    (acc, [k, v]) => {
      if (v == null) return acc;
      if (k.startsWith("env."))
        return { ...acc, env: { ...acc.env, [k.slice(4)]: String(v) } };
      if (k.startsWith("arg."))
        return { ...acc, args: { ...acc.args, [k.slice(4)]: parseVal(v) } };
      if (k.startsWith("js."))
        return { ...acc, js: { ...acc.js, [k.slice(3)]: v } };
      if (k.startsWith("ts."))
        return { ...acc, ts: { ...acc.ts, [k.slice(3)]: v } };
      if (!["pipeline", "step", "files", "force"].includes(k))
        return { ...acc, step: { ...acc.step, [k]: parseVal(v) } };
      return acc;
    },
    init,
  );

  return {
    files,
    env,
    args,
    js: js as Partial<NonNullable<PiperStep["js"]>>,
    ts: ts as Partial<NonNullable<PiperStep["ts"]>>,
    step: step as Partial<Omit<PiperStep, "env" | "js" | "ts">>,
  };
}

function ensureRecord(
  v: unknown,
): Readonly<Record<string, unknown>> | undefined {
  return v && typeof v === "object"
    ? (v as Readonly<Record<string, unknown>>)
    : undefined;
}

function mergeArgs(
  current: unknown,
  add: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> | undefined {
  const hasAdds = Object.keys(add).length > 0;
  if (!hasAdds && (!current || typeof current !== "object")) return undefined;
  const base = ensureRecord(current) || {};
  return { ...base, ...add } as Readonly<Record<string, unknown>>;
}

function mergeEnv(
  step: ReadonlyDeep<PiperStep>,
  env: Readonly<Record<string, string>>,
): ReadonlyDeep<PiperStep> {
  if (Object.keys(env).length === 0) return step;
  return {
    ...step,
    env: { ...(step.env || {}), ...env },
  } as ReadonlyDeep<PiperStep>;
}

function mergeJs(
  step: ReadonlyDeep<PiperStep>,
  jsOv: Overrides["js"],
  argsOv: Overrides["args"],
): ReadonlyDeep<PiperStep> {
  if (Object.keys(jsOv).length === 0 && Object.keys(argsOv).length === 0)
    return step;
  const cur = ensureRecord((step as { js?: unknown }).js);
  const mergedArgs = mergeArgs(cur?.args, argsOv);
  const next = { ...(cur || {}), ...jsOv } as Record<string, unknown>;
  const nextWithArgs =
    mergedArgs !== undefined ? { ...next, args: mergedArgs } : next;
  return {
    ...step,
    js: nextWithArgs as NonNullable<PiperStep["js"]>,
  } as ReadonlyDeep<PiperStep>;
}

function mergeTs(
  step: ReadonlyDeep<PiperStep>,
  tsOv: Overrides["ts"],
  argsOv: Overrides["args"],
): ReadonlyDeep<PiperStep> {
  if (Object.keys(tsOv).length === 0 && Object.keys(argsOv).length === 0)
    return step;
  const cur = ensureRecord((step as { ts?: unknown }).ts);
  const mergedArgs = mergeArgs(cur?.args, argsOv);
  const next = { ...(cur || {}), ...tsOv } as Record<string, unknown>;
  const nextWithArgs =
    mergedArgs !== undefined ? { ...next, args: mergedArgs } : next;
  return {
    ...step,
    ts: nextWithArgs as NonNullable<PiperStep["ts"]>,
  } as ReadonlyDeep<PiperStep>;
}

function applyFilesOverride(
  step: ReadonlyDeep<PiperStep>,
  files: readonly string[],
): ReadonlyDeep<PiperStep> {
  if (files.length === 0) return step;
  if ((step as { js?: unknown }).js) {
    const cur = ensureRecord((step as { js?: unknown }).js) || {};
    const curArgs = ensureRecord((cur as { args?: unknown }).args) || {};
    const jsWithFiles = { ...cur, args: { ...curArgs, files } } as Record<
      string,
      unknown
    >;
    return {
      ...step,
      js: jsWithFiles as NonNullable<PiperStep["js"]>,
    } as ReadonlyDeep<PiperStep>;
  }
  return {
    ...step,
    env: { ...(step.env || {}), PIPER_FILES: JSON.stringify(files) },
  } as ReadonlyDeep<PiperStep>;
}

export function applyOverridesToStep(
  base: ReadonlyDeep<PiperStep>,
  ov: Overrides,
): PiperStep {
  const withStep = { ...base, ...ov.step } as ReadonlyDeep<PiperStep>;
  const withEnv = mergeEnv(withStep, ov.env);
  const withJs = mergeJs(withEnv, ov.js, ov.args);
  const withTs = mergeTs(withJs, ov.ts, ov.args);
  return applyFilesOverride(withTs, ov.files) as PiperStep;
}

export function applyOverridesImmutable(
  cfg: ReadonlyDeep<PiperFile>,
  pipelineName: string,
  stepId: string,
  ov: Overrides,
): ReadonlyDeep<PiperFile> {
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
  } as ReadonlyDeep<PiperFile>;
}

export async function writeTemporaryConfigCopy(
  configPath: string,
  cfg: ReadonlyDeep<PiperFile>,
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

export function hasAnyOverrides(ov: Readonly<Overrides>): boolean {
  return (
    ov.files.length > 0 ||
    Object.keys(ov.env).length > 0 ||
    Object.keys(ov.args).length > 0 ||
    Object.keys(ov.js).length > 0 ||
    Object.keys(ov.ts).length > 0 ||
    Object.keys(ov.step).length > 0
  );
}
