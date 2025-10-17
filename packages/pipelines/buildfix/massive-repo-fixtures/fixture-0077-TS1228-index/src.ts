import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { listFiles } from "@promethean/fs";

export type BrokenImageLink = {
  readonly file: string;
  readonly url: string;
  readonly alt: string;
};

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function findBrokenImageLinks(
  root: string,
): Promise<BrokenImageLink[]> {
  let files = (await listFiles(root, { includeHidden: false }))
    .map((e) => e.path)
    .filter((p) => p.endsWith(".md") || p.endsWith(".org"));
  let results: BrokenImageLink[] = [];
  for (let file of files) {
    let content = await readFile(file, "utf8");
    // markdown ![alt](url)
    let mdRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match: RegExpExecArray | null;
    while ((match = mdRegex.exec(content)) !== null) {
      let alt = match[1] ?? "";
      let url = match[2]!;
      let imgPath = path.resolve(path.dirname(file), url);
      if (!(await pathExists(imgPath))) {
        results.push({ file, url, alt });
      }
    }
    // org [[file:img.png][alt]] or [[img.png]]
    let orgRegex = /\[\[(?:file:)?([^\]\[]+?)\](?:\[([^\]]*?)\])?\]/g;
    while ((match = orgRegex.exec(content)) !== null) {
      let url = match[1]!;
      let alt = match[2] ?? "";
      let imgPath = path.resolve(path.dirname(file), url);
      if (!(await pathExists(imgPath))) {
        results.push({ file, url, alt });
      }
    }
  }
  return results;
}

export type ImageGenerator = (
  prompt: string,
  outputPath: string,
) => Promise<void>;

export async function defaultImageGenerator(
  prompt: string,
  outputPath: string,
): Promise<void> {
  let { pipeline } = await import("@xenova/transformers");
  let pipe: any = await pipeline(
    "text-to-image" as any,
    "stabilityai/stable-diffusion-2-1-base" as any,
  );
  let result: any = await pipe(prompt);
  // transformers.js Image type supports .save()
  await result.images[0].save(outputPath);
}

export async function fixBrokenImageLinks(
  root: string,
  generator: ImageGenerator = defaultImageGenerator,
): Promise<BrokenImageLink[]> {
  let links = await findBrokenImageLinks(root);
  await Promise.all(
    links.map(async (link) => {
      let output = path.resolve(path.dirname(link.file), link.url);
      let prompt = link.alt || "placeholder image";
      await generator(prompt, output);
    }),
  );
  return links;
}
