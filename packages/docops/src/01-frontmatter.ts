import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { parseArgs, listFilesRec, randomUUID } from "./utils";
import type { Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

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

async function ollamaGenerateJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" }),
  });
  const data = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  for (const f of files) {
    const originalName = path.basename(f);
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm: Front = (gm.data || {}) as Front;

    let changed = false;
    if (!fm.uuid) { fm.uuid = randomUUID(); changed = true; }
    if (!fm.created_at) { fm.created_at = originalName; changed = true; }

    const missing: Array<keyof z.infer<typeof GenSchema>> = [];
    if (!fm.filename) missing.push("filename");
    if (!fm.description) missing.push("description");
    if (!fm.tags || fm.tags.length === 0) missing.push("tags");

    if (missing.length) {
      const preview = gm.content.slice(0, 4000);
      let current: Partial<z.infer<typeof GenSchema>> = {};
      for (let round = 0; round < 3 && missing.length; round++) {
        const ask = [...missing];
        const sys = `Return ONLY JSON with keys: ${ask.join(", ")}. filename: human title (no ext), description: 1-3 sentences, tags: 3-12 keywords.`;
        const payload = `SYSTEM:\n${sys}\n\nUSER:\nPath: ${f}\nExisting: ${JSON.stringify({ filename: fm.filename ?? null, description: fm.description ?? null, tags: fm.tags ?? null })}\nPreview:\n${preview}`;
        let obj: any;
        try { obj = await ollamaGenerateJSON(GEN_MODEL, payload); } catch { break; }
        const shape: any = {};
        if (ask.includes("filename")) shape.filename = z.string().min(1);
        if (ask.includes("description")) shape.description = z.string().min(1);
        if (ask.includes("tags")) shape.tags = z.array(z.string()).min(1);
        const Partial = z.object(shape);
        const parsed = Partial.safeParse(obj);
        if (parsed.success) {
          current = { ...current, ...parsed.data };
          for (const k of ask) if ((current as any)[k]) missing.splice(missing.indexOf(k), 1);
        }
      }
      if (!fm.filename && current.filename) { fm.filename = current.filename; changed = true; }
      if (!fm.description && current.description) { fm.description = current.description; changed = true; }
      if ((!fm.tags || fm.tags.length === 0) && current.tags) { fm.tags = Array.from(new Set(current.tags)); changed = true; }
    }

    if (changed && !DRY) {
      const out = matter.stringify(gm.content, fm, { language: "yaml" });
      await fs.writeFile(f, out, "utf-8");
    }
  }
  console.log("01-frontmatter: done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
