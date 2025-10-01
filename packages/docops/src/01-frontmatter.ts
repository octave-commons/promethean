#!/usr/bin/env node
// packages/docops/src/01-frontmatter.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";
import ollama from "ollama";
import { scanFiles } from "@promethean/file-indexer";
import type { IndexedFile, ScanProgress } from "@promethean/file-indexer";
import {
  ensureBaselineFrontmatter,
  mergeFrontmatterWithGenerated,
  normalizeStringList,
  parseFrontmatter,
  stringifyFrontmatter,
  deriveFilenameFromPath,
} from "@promethean/markdown/frontmatter";

import { openDB } from "./db.js";
import { parseArgs, randomUUID } from "./utils.js";
import { usingFakeServices } from "./lib/services.js";
import type { Front } from "./types.js";
import type { DBs } from "./db.js";

// CLI entry (ESM-safe)

export type FrontmatterOptions = {
  dir: string;
  exts?: string[];
  genModel: string;
  dryRun?: boolean;
  files?: string[]; // absolute or relative paths; if provided, limit to this set
};

const GenSchema = z.object({
  filename: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

export async function runFrontmatter(
  opts: FrontmatterOptions,
  db: DBs,
  onProgress?: (p: {
    step: "frontmatter";
    done: number;
    total: number;
    message?: string;
  }) => void,
) {
  const ROOT = path.resolve(opts.dir);
  const EXTS = new Set(
    (opts.exts ?? [".md", ".mdx", ".txt"]).map((s) => s.trim().toLowerCase()),
  );
  const GEN_MODEL = opts.genModel;
  const DRY = Boolean(opts.dryRun);
  const frontKV = db.root.sublevel<string, Front>("front", {
    valueEncoding: "json",
  });
  const docsKV = db.docs; // from db.ts — { path, title }

  const buildPrompt = (fpath: string, fm: Front, preview: string) =>
    [
      "SYSTEM:",
      "Return ONLY strict JSON with keys exactly: filename, description, tags.",
      "filename: short human title (no extension).",
      "description: 1–3 sentences.",
      "tags: 3–12 concise keywords.",
      "",
      "USER:",
      `Path: ${fpath}`,
      `Existing: ${JSON.stringify({
        filename: fm.filename ?? null,
        description: fm.description ?? null,
        tags: fm.tags ?? null,
      })}`,
      "Preview:",
      preview,
    ].join("\n");

  const parseModelJSON = (s: string) => {
    const cleaned = s
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  };

  const askModel = async (model: string, prompt: string) => {
    try {
      const res = await ollama.generate({
        model,
        prompt,
        stream: false,
        format: "json",
        options: { temperature: 0 },
      });
      const raw =
        typeof res.response === "string"
          ? res.response
          : JSON.stringify(res.response);
      return parseModelJSON(raw);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "";
      if (message) {
        console.warn(
          `Frontmatter generation fell back to deterministic values: ${message}`,
        );
      }
      return null;
    }
  };

  const toStringListInput = (value: unknown): readonly unknown[] | undefined =>
    Array.isArray(value)
      ? value
      : value === undefined || value === null
        ? undefined
        : [value];

  const normalizeTags = (value: unknown): string[] =>
    normalizeStringList(toStringListInput(value));

  const isoFromBasename = (name: string) => {
    const base = name.replace(/\.[^.]+$/, "");
    const m = base.match(
      /(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})/,
    );
    return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : undefined;
  };

  const validateGen = (obj: unknown) => {
    const p = GenSchema.safeParse(obj);
    return p.success ? p.data : null;
  };

  const writeFrontmatter = (fpath: string, content: string, fm: Front) =>
    DRY
      ? Promise.resolve()
      : fs.writeFile(fpath, stringifyFrontmatter(content, fm), "utf8");

  const persistKV = (uuid: string, fpath: string, fm: Front) =>
    Promise.all([
      frontKV.put(uuid, fm),
      docsKV.put(uuid, {
        path: fpath,
        title: fm.title ?? fm.filename ?? deriveFilenameFromPath(fpath),
      }),
    ]).then(() => undefined);

  const processFile = (fpath: string, raw: string) => {
    const gm = parseFrontmatter<Front>(raw);
    const base = ensureBaselineFrontmatter(gm.data ?? ({} as Front), {
      filePath: fpath,
      uuidFactory: randomUUID,
      createdAtFactory: ({ filePath }: { filePath?: string }) =>
        filePath ? isoFromBasename(path.basename(filePath)) : undefined,
      titleFactory: ({ frontmatter }: { frontmatter: Front }) =>
        typeof frontmatter.filename === "string"
          ? frontmatter.filename
          : undefined,
    });
    const hasAll =
      Boolean(base.filename) &&
      Boolean(base.description) &&
      Boolean(normalizeTags(base.tags).length);

    const preview = gm.content.slice(0, 4000);

    const fallbackGen = () => {
      const ensuredFilename =
        base.filename ?? deriveFilenameFromPath(fpath) ?? "doc";
      const ensuredDescription =
        base.description ??
        `DocOps summary for ${deriveFilenameFromPath(fpath)}`;
      const normalized = normalizeTags(base.tags);
      const ensuredTags =
        normalized.length > 0
          ? normalized
          : normalizeTags([ensuredFilename, "docops", "autogenerated"]);
      return {
        filename: ensuredFilename,
        description: ensuredDescription,
        tags: ensuredTags,
      } satisfies z.infer<typeof GenSchema>;
    };

    const genP = hasAll
      ? Promise.resolve<Partial<z.infer<typeof GenSchema>>>({})
      : usingFakeServices()
        ? Promise.resolve(fallbackGen())
        : askModel(GEN_MODEL, buildPrompt(fpath, base, preview)).then((obj) => {
            const valid = validateGen(obj);
            return valid ?? fallbackGen();
          });

    return genP.then((gen) => {
      const next = mergeFrontmatterWithGenerated(base, gen, {
        filePath: fpath,
        descriptionFallback: "",
      }) as Front;

      const changed =
        next.uuid !== (gm.data as Front)?.uuid ||
        next.created_at !== (gm.data as Front)?.created_at ||
        next.filename !== (gm.data as Front)?.filename ||
        next.description !== (gm.data as Front)?.description ||
        JSON.stringify(normalizeTags(next.tags)) !==
          JSON.stringify(normalizeTags((gm.data as Front)?.tags));

      return (
        changed ? writeFrontmatter(fpath, gm.content, next) : Promise.resolve()
      )
        .then(() => persistKV(next.uuid!, fpath, next))
        .then(() => undefined);
    });
  };

  const wanted =
    opts.files && opts.files.length
      ? new Set(opts.files.map((p) => path.resolve(p)))
      : null;
  let done = 0;
  await scanFiles({
    root: ROOT,
    exts: EXTS,
    readContent: true,
    onFile: async (file: IndexedFile, progress: ScanProgress) => {
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(ROOT, file.path);
      if (wanted && !wanted.has(abs)) return;
      const raw = file.content ?? (await fs.readFile(abs, "utf8"));
      await processFile(abs, raw);
      done++;
      onProgress?.({
        step: "frontmatter",
        done,
        total: wanted ? wanted.size : progress.total,
      });
    },
  });
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--gen-model": "qwen3:4b",
    "--dry-run": "false",
  });
  const db = await openDB();
  const dir = args["--dir"] ?? "docs/unique";
  const extsArg = args["--ext"] ?? ".md,.mdx,.txt";
  const genModel = args["--gen-model"] ?? "qwen3:4b";
  const dryRun = (args["--dry-run"] ?? "false") === "true";
  runFrontmatter(
    {
      dir,
      exts: extsArg.split(","),
      genModel,
      dryRun,
    },
    db,
  )
    .then(() => console.log("01-frontmatter: done."))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await db.root.close();
      } catch {}
    });
}
