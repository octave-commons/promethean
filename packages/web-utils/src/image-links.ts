import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { listFiles } from "@promethean/fs";
import type { PipelineType } from "@xenova/transformers";

export type BrokenImageLink = {
  readonly file: string;
  readonly url: string;
  readonly alt: string;
};

async function pathExists(p: string): Promise<boolean> {
  return stat(p).then(
    () => true,
    () => false,
  );
}

function isRemoteOrData(u: string): boolean {
  return /^(?:https?:|data:|mailto:|tel:)/i.test(u);
}

function normalizeLocalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  const unwrapped =
    trimmed.startsWith("<") && trimmed.endsWith(">")
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  if (!unwrapped || isRemoteOrData(unwrapped)) return null;
  return unwrapped;
}

export async function findBrokenImageLinks(
  root: string,
): Promise<BrokenImageLink[]> {
  const files = (await listFiles(root, { includeHidden: false }))
    .map((e) => e.path)
    .filter((p) => p.endsWith(".md") || p.endsWith(".org"));
  const results = (
    await Promise.all(
      files.map(async (file) => {
        const content = await readFile(file, "utf8");
        const brokenLinks: BrokenImageLink[] = [];
        // markdown ![alt](url)
        const mdRegex =
          /!\[([^\]]*?)\]\(\s*(<[^>]+>|[^)\s]+(?:\s[^)"']+)*)\s*(?:("[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
        for (const match of content.matchAll(mdRegex)) {
          const alt = match[1] ?? "";
          const url = normalizeLocalUrl(match[2] ?? "");
          if (!url) continue;
          const imgPath = path.resolve(path.dirname(file), url);
          if (!(await pathExists(imgPath))) {
            brokenLinks.push({ file, url, alt });
          }
        }
        // org [[file:img.png][alt]] or [[img.png]]
        const orgRegex = /\[\[(?:file:)?([^\]\[]+?)\](?:\[([^\]]*?)\])?\]/g;
        for (const match of content.matchAll(orgRegex)) {
          const url = normalizeLocalUrl(match[1] ?? "");
          const alt = match[2] ?? "";
          if (!url) continue;
          const imgPath = path.resolve(path.dirname(file), url);
          if (!(await pathExists(imgPath))) {
            brokenLinks.push({ file, url, alt });
          }
        }
        return brokenLinks;
      }),
    )
  ).flat();
  return results;
}

export type ImageGenerator = (
  prompt: string,
  outputPath: string,
) => Promise<void>;

type Image = { save: (p: string) => Promise<void> };
type TextToImageResult = { images: readonly Image[] };
type TextToImagePipeline = (p: string) => Promise<TextToImageResult>;

export async function defaultImageGenerator(
  prompt: string,
  outputPath: string,
): Promise<void> {
  const { pipeline } = await import("@xenova/transformers");
  const pipe = (await pipeline(
    "text-to-image" as unknown as PipelineType,
    "stabilityai/stable-diffusion-2-1-base",
  )) as unknown as TextToImagePipeline;
  const result = await pipe(prompt);
  // transformers.js Image type supports .save()
  await result.images[0]?.save(outputPath);
}

export async function fixBrokenImageLinks(
  root: string,
  generator: ImageGenerator = defaultImageGenerator,
): Promise<BrokenImageLink[]> {
  const links = await findBrokenImageLinks(root);
  await Promise.all(
    links.map(async (link) => {
      const output = path.resolve(path.dirname(link.file), link.url);
      const prompt = link.alt || "placeholder image";
      await generator(prompt, output);
    }),
  );
  return links;
}
