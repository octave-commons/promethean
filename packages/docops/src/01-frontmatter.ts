// packages/docops/src/01-frontmatter.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import ollama from "ollama";
import { openDB } from "./db";
import { parseArgs, listFilesRec, randomUUID } from "./utils";
import type { Front } from "./types";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--gen-model": "qwen3:4b",
  "--dry-run": "false",
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const GEN_MODEL = args["--gen-model"];
const DRY = args["--dry-run"] === "true";

const GenSchema = z.object({
  filename: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

(async () => {

const db = await openDB();
const frontKV = db.root.sublevel<string, Front>("front", { valueEncoding: "json" });
const docsKV = db.docs; // from db.ts — { path, title }

const uniq = (xs: readonly string[] | undefined) =>
  Array.from(new Set((xs ?? []).map((s) => s.trim()).filter(Boolean)));

const deriveFilename = (fpath: string) => path.parse(fpath).name;

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
  const cleaned = s.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const askModel = (model: string, prompt: string) =>
  ollama
    .generate({ model, prompt, stream: false, format: "json", options: { temperature: 0 } })
    .then((res) => (typeof res.response === "string" ? res.response : JSON.stringify(res.response)))
    .then(parseModelJSON);

const ensureBaseFront = (fpath: string, fm: Front): Front => {
  const baseName = path.basename(fpath);
  return Object.freeze<Front>({
    ...fm,
    uuid: fm.uuid ?? randomUUID(),
    created_at: fm.created_at ?? baseName,
  });
};

const mergeFront = (base: Front, gen: Partial<z.infer<typeof GenSchema>>, fpath: string): Front => {
  const filename = base.filename ?? gen.filename ?? deriveFilename(fpath);
  const description = base.description ?? gen.description ?? "";
  const tags = base.tags && base.tags.length ? base.tags : uniq(gen.tags);
  return Object.freeze<Front>({ ...base, filename, description, tags });
};

const validateGen = (obj: unknown) => {
  const p = GenSchema.safeParse(obj);
  return p.success ? p.data : null;
};

const writeFrontmatter = (fpath: string, content: string, fm: Front) =>
  DRY
    ? Promise.resolve()
    : fs.writeFile(fpath, matter.stringify(content, fm, { language: "yaml" }), "utf8");

const persistKV = (uuid: string, fpath: string, fm: Front) =>
  Promise.all([
    frontKV.put(uuid, fm),
    docsKV.put(uuid, { path: fpath, title: fm.filename ?? deriveFilename(fpath) }),
  ]).then(() => undefined);

const processFile = (fpath: string) =>
  fs
    .readFile(fpath, "utf8")
    .then((raw) => {
      const gm = matter(raw);
      const base = ensureBaseFront(fpath, (gm.data || {}) as Front);
      const hasAll =
        Boolean(base.filename) && Boolean(base.description) && Boolean(base.tags && base.tags.length);

      const preview = gm.content.slice(0, 4000);

      // Single-shot model call; fallback to derived values on failure
      const genP = hasAll
        ? Promise.resolve<Partial<z.infer<typeof GenSchema>>>({})
        : askModel(GEN_MODEL, buildPrompt(fpath, base, preview)).then((obj) => {
            const valid = validateGen(obj);
            return valid ?? {};
          });

      return genP.then((gen) => {
        const next = mergeFront(base, gen, fpath);

        // Only write if anything actually changed
        const changed =
          next.uuid !== (gm.data as Front)?.uuid ||
          next.created_at !== (gm.data as Front)?.created_at ||
          next.filename !== (gm.data as Front)?.filename ||
          next.description !== (gm.data as Front)?.description ||
          JSON.stringify(uniq(next.tags)) !== JSON.stringify(uniq((gm.data as Front)?.tags));

        return (changed ? writeFrontmatter(fpath, gm.content, next) : Promise.resolve())
          .then(() => persistKV(next.uuid!, fpath, next))
          .then(() => undefined);
      });
    });

listFilesRec(ROOT, EXTS)
  .then((files) => Promise.all(files.map(processFile)))
  .then(() => console.log("01-frontmatter: done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
})()
