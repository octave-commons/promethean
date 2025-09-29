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

export async function runDocopsStep(
  db: DBs,
  step: StepId,
  args: any,
  onProgress?: (p: Progress) => void,
) {
  const stepFn: Record<StepId, (args: any) => Promise<void>> = {
    purge: async (args) => {
      const files = args.files as string[] | undefined;
      const dir = args.dir as string;
      const opts: PurgeOptions = { dir, ...(files ? { files } : {}) };
      await runPurge(opts, onProgress);
    },
    frontmatter: async (args) => {
      const files = args.files as string[] | undefined;
      const opts: FrontmatterOptions = {
        dir: args.dir,
        genModel: args.genModel || "qwen3:4b",
        ...(files ? { files } : {}),
      };
      await runFrontmatter(opts, db, onProgress);
    },
    embed: async (args) => {
      const files = args.files as string[] | undefined;
      const { coll } = await getChromaCollection({
        collection: String(args.collection),
        embedModel: String(args.embedModel || "nomic-embed-text:latest"),
      });
      const opts: EmbedOptions = {
        dir: args.dir,
        embedModel: args.embedModel || "nomic-embed-text:latest",
        collection: args.collection,
        ...(files ? { files } : {}),
      };
      await runEmbed(opts, db, coll as Coll, onProgress);
    },
    query: async (args) => {
      const files = args.files as string[] | undefined;
      const { coll } = await getChromaCollection({
        collection: String(args.collection),
        embedModel: String(args.embedModel || "nomic-embed-text:latest"),
      });
      const opts: QueryOptions = {
        embedModel: args.embedModel || "nomic-embed-text:latest",
        collection: args.collection,
        k: Number(args.k || 16),
        force: !!args.force,
        ...(files ? { files } : {}),
      };
      await runQuery(opts, db, coll as QueryColl, onProgress);
    },
    relations: async (args) => {
      const files = args.files as string[] | undefined;
      const opts: RelationsOptions = {
        docsDir: args.dir,
        docThreshold: Number(args.docT ?? 0.78),
        refThreshold: Number(args.refT ?? 0.85),
        ...(Number.isFinite(args.maxRelated)
          ? { maxRelated: Number(args.maxRelated) }
          : {}),
        ...(Number.isFinite(args.maxReferences)
          ? { maxReferences: Number(args.maxReferences) }
          : {}),
        ...(Number.isFinite(args.refMin)
          ? { refMin: Number(args.refMin) }
          : {}),
        ...(Number.isFinite(args.refMax)
          ? { refMax: Number(args.refMax) }
          : {}),
        ...(files ? { files } : {}),
      };
      await runRelations(opts, db, onProgress);
    },
    footers: async (args) => {
      const files = args.files as string[] | undefined;
      const opts: FootersOptions = {
        dir: args.dir,
        anchorStyle: args.anchorStyle || "block",
        ...(files ? { files } : {}),
      };
      await runFooters(opts, db, onProgress);
    },
    rename: async (args) => {
      const files = args.files as string[] | undefined;
      const opts: RenameOptions = {
        dir: args.dir,
        ...(files ? { files } : {}),
      };
      await runRename(opts);
    },
  };

  if (!Object.prototype.hasOwnProperty.call(stepFn, step)) {
    const validSteps = Object.keys(stepFn).join(", ");
    throw new Error(
      `Unknown docops step "${String(step)}". Expected one of: ${validSteps}`,
    );
  }

  const handler = stepFn[step];
  if (typeof handler !== "function") {
    const validSteps = Object.keys(stepFn).join(", ");
    throw new Error(
      `Docops step "${String(step)}" is not callable. Expected one of: ${validSteps}`,
    );
  }
  await handler(args);
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
