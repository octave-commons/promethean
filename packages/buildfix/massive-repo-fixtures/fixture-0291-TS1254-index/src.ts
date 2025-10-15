// import { readFile, stat } from "node:fs/promises";
// import path from "node:path";

// import { listFiles } from "@promethean/fs";

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
  const files = (await listFiles(root, { includeHidden: false }))
    .map((e) => e.path)
    .filter((p) => p.endsWith(".md") || p.endsWith(".org"));
  const results: BrokenImageLink[] = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    // markdown ![alt](url)
    const mdRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match: RegExpExecArray | null;
    while ((match = mdRegex.exec(content)) !== null) {
      const alt = match[1] ?? "";
      const url = match[2]!;
      const imgPath = path.resolve(path.dirname(file), url);
      if (!(await pathExists(imgPath))) {
        results.push({ file, url, alt });
      }
    }
    // org [[file:img.png][alt]] or [[img.png]]
    const orgRegex = /\[\[(?:file:)?([^\]\[]+?)\](?:\[([^\]]*?)\])?\]/g;
    while ((match = orgRegex.exec(content)) !== null) {
      const url = match[1]!;
      const alt = match[2] ?? "";
      const imgPath = path.resolve(path.dirname(file), url);
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
  const { pipeline } = await // import("@xenova/transformers");
  const pipe: any = await pipeline(
    "text-to-image" as any,
    "stabilityai/stable-diffusion-2-1-base" as any,
  );
  const result: any = await pipe(prompt);
  // transformers.js Image type supports .save()
  await result.images[0].save(outputPath);
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
