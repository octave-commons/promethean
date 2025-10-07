import {
  runFrontmatter,
  type FrontmatterOptions,
  runPurge,
  type PurgeOptions,
  runEmbed,
  type EmbedOptions,
  runQuery,
  type QueryOptions,
  runRelations,
  type RelationsOptions,
  runFooters,
  type FootersOptions,
  runRename,
  type RenameOptions,
} from "../index.js";
import type { DBs } from "../db.js";

import { getChromaCollection } from "./chroma.js";
import type { ChromaCollection as QueryColl } from "./query.js";

export type StepId =
  | "purge"
  | "frontmatter"
  | "embed"
  | "query"
  | "relations"
  | "footers"
  | "rename";

export type RunArgs = {
  dir: string;
  collection: string;
  docT: string | number;
  refT: string | number;
  files?: string[];
  embedModel?: string;
  genModel?: string;
  k?: number;
  force?: boolean;
  anchorStyle?: string;
  // relations tuning
  maxRelated?: number;
  maxReferences?: number;
  refMin?: number;
  refMax?: number;
};

type Progress = {
  step: string;
  done?: number;
  total?: number;
  percent?: number;
  message?: string;
  index?: number;
  of?: number;
};

type Coll = QueryColl & {
  upsert(input: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas: unknown[];
  }): Promise<unknown>;
};

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
};

const toBoolParam = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (!lowered) return undefined;
    if (lowered === "false" || lowered === "0") return false;
    if (lowered === "true" || lowered === "1") return true;
  }
  return undefined;
};

const normalizeRunArgs = (input: any) => {
  const args: any = { ...(input ?? {}) };
  const setFinite = (key: string) => {
    const parsed = toFiniteNumber(args[key]);
    if (parsed !== undefined) args[key] = parsed;
    else delete args[key];
  };

  setFinite("docT");
  setFinite("refT");
  setFinite("k");
  setFinite("maxRelated");
  setFinite("maxReferences");
  setFinite("refMin");
  setFinite("refMax");

  const force = toBoolParam(args.force);
  if (typeof force === "boolean") args.force = force;
  else delete args.force;

  return args;
};

export async function runDocopsStep(
  db: DBs,
  step: StepId,
  args: any,
  onProgress?: (p: Progress) => void,
) {
  const normalizedArgs = normalizeRunArgs(args);
  switch (step) {
    case "purge": {
      const files = normalizedArgs.files as string[] | undefined;
      const dir = normalizedArgs.dir as string;
      const opts: PurgeOptions = { dir, ...(files ? { files } : {}) };
      await runPurge(opts, onProgress);
      return;
    }
    case "frontmatter": {
      const files = normalizedArgs.files as string[] | undefined;
      const opts: FrontmatterOptions = {
        dir: normalizedArgs.dir,
        genModel: normalizedArgs.genModel || "qwen3:4b",
        ...(files ? { files } : {}),
      };
      await runFrontmatter(opts, db, onProgress);
      return;
    }
    case "embed": {
      const files = normalizedArgs.files as string[] | undefined;
      const { coll } = await getChromaCollection({
        collection: String(normalizedArgs.collection),
        embedModel: String(
          normalizedArgs.embedModel || "nomic-embed-text:latest",
        ),
      });
      const opts: EmbedOptions = {
        dir: normalizedArgs.dir,
        embedModel: normalizedArgs.embedModel || "nomic-embed-text:latest",
        collection: normalizedArgs.collection,
        ...(files ? { files } : {}),
      };
      await runEmbed(opts, db, coll as Coll, onProgress);
      return;
    }
    case "query": {
      const files = normalizedArgs.files as string[] | undefined;
      const { coll } = await getChromaCollection({
        collection: String(normalizedArgs.collection),
        embedModel: String(
          normalizedArgs.embedModel || "nomic-embed-text:latest",
        ),
      });
      const opts: QueryOptions = {
        embedModel: normalizedArgs.embedModel || "nomic-embed-text:latest",
        collection: normalizedArgs.collection,
        k: Number(normalizedArgs.k || 16),
        force: !!normalizedArgs.force,
        ...(files ? { files } : {}),
      };
      await runQuery(opts, db, coll as QueryColl, onProgress);
      return;
    }
    case "relations": {
      const files = normalizedArgs.files as string[] | undefined;
      const opts: RelationsOptions = {
        docsDir: normalizedArgs.dir,
        docThreshold: Number(normalizedArgs.docT ?? 0.78),
        refThreshold: Number(normalizedArgs.refT ?? 0.85),
        ...(Number.isFinite(normalizedArgs.maxRelated)
          ? { maxRelated: Number(normalizedArgs.maxRelated) }
          : {}),
        ...(Number.isFinite(normalizedArgs.maxReferences)
          ? { maxReferences: Number(normalizedArgs.maxReferences) }
          : {}),
        ...(Number.isFinite(normalizedArgs.refMin)
          ? { refMin: Number(normalizedArgs.refMin) }
          : {}),
        ...(Number.isFinite(normalizedArgs.refMax)
          ? { refMax: Number(normalizedArgs.refMax) }
          : {}),
        ...(files ? { files } : {}),
      };
      await runRelations(opts, db, onProgress);
      return;
    }
    case "footers": {
      const files = normalizedArgs.files as string[] | undefined;
      const opts: FootersOptions = {
        dir: normalizedArgs.dir,
        anchorStyle: normalizedArgs.anchorStyle || "block",
        ...(files ? { files } : {}),
      };
      await runFooters(opts, db, onProgress);
      return;
    }
    case "rename": {
      const files = normalizedArgs.files as string[] | undefined;
      const opts: RenameOptions = {
        dir: normalizedArgs.dir,
        ...(files ? { files } : {}),
      };
      await runRename(opts, db, onProgress);
      return;
    }
    default: {
      const validSteps: StepId[] = [
        "purge",
        "frontmatter",
        "embed",
        "query",
        "relations",
        "footers",
        "rename",
      ];
      throw new Error(
        `Unknown docops step "${String(
          step,
        )}". Expected one of: ${validSteps.join(", ")}`,
      );
    }
  }
}

export async function runDocopsPipeline(
  db: DBs,
  steps: StepId[],
  baseArgs: any,
  onProgress: (p: Progress) => void,
) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    onProgress({ step, index: i + 1, of: steps.length });
    await runDocopsStep(db, step, baseArgs, (p) => {
      const payload: Progress = { step: p.step || step };
      if (typeof p.percent === "number") payload.percent = p.percent;
      if (typeof p.message === "string") payload.message = p.message;
      if (typeof p.done === "number") payload.done = p.done;
      if (typeof p.total === "number") payload.total = p.total;
      if (typeof (p as any).index === "number")
        payload.index = (p as any).index;
      if (typeof (p as any).of === "number") payload.of = (p as any).of;
      onProgress(payload);
    });
  }
}

export async function servePipeline(
  db: DBs,
  send: (line: string) => void,
  args: RunArgs,
) {
  const embedModel = args.embedModel || "nomic-embed-text:latest";
  const steps: StepId[] = [
    "frontmatter",
    "embed",
    "query",
    "relations",
    "footers",
    "rename",
  ];
  send(`Starting pipeline in ${args.dir}`);
  try {
    await runDocopsPipeline(
      db,
      steps,
      {
        dir: args.dir,
        collection: args.collection,
        embedModel,
        files: args.files,
        docT: args.docT,
        refT: args.refT,
      },
      (p) =>
        send(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              index: p.index,
              of: p.of,
              percent: p.percent,
              message: p.message,
              done: p.done,
              total: p.total,
            }),
        ),
    );
  } catch (e: any) {
    send(String(e?.stack || e));
  }
}
