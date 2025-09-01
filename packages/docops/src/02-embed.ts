import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import {
  parseArgs,
  listFilesRec,
  writeJSON,
  readJSON,
  parseMarkdownChunks,
} from "./utils";
import type { Chunk, Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(
  args["--ext"].split(",").map((s) => s.trim().toLowerCase()),
);
const EMBED_MODEL = args["--embed-model"];
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");
const EMBED_CACHE = path.join(CACHE, "embeddings.json");
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  const data = await res.json();
  return data.embedding as number[];
}

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
  const embedCache: Record<string, number[]> = await readJSON(EMBED_CACHE, {});
  const docsByUuid: Record<string, { path: string; title: string }> =
    await readJSON(DOCS_MAP, {});

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const chunks = parseMarkdownChunks(content).map((c, i) => ({
      ...c,
      id: `${fm.uuid}:${i}`,
      docUuid: fm.uuid!,
      docPath: f,
    }));
    for (const ch of chunks) {
      if (!embedCache[ch.id])
        embedCache[ch.id] = await ollamaEmbed(EMBED_MODEL, ch.text);
      ch.embedding = embedCache[ch.id];
    }
    chunksByDoc[fm.uuid] = chunks;
    docsByUuid[fm.uuid] = { path: f, title: fm.filename || path.parse(f).name };
  }

  await writeJSON(CHUNK_CACHE, chunksByDoc);
  await writeJSON(EMBED_CACHE, embedCache);
  await writeJSON(DOCS_MAP, docsByUuid);
  console.log("02-embed: done.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
