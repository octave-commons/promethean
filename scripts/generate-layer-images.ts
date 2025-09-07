import {
  findBrokenImageLinks,
  type BrokenImageLink,
} from "@promethean/image-link-generator/dist/src/index.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PLACEHOLDER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YsZxMIAAAAASUVORK5CYII=",
  "base64",
);

async function placeholderGenerator(
  _prompt: string,
  outputPath: string,
): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, PLACEHOLDER);
}

async function main(): Promise<void> {
  const root = process.argv[2] ?? ".emacs/layers";
  const links = await findBrokenImageLinks(root);
  const images = links.filter((l) => /\.(png|jpe?g|gif)$/.test(l.url));
  await Promise.all(
    images.map(async (link: BrokenImageLink) => {
      const output = path.resolve(path.dirname(link.file), link.url);
      const prompt = link.alt || "placeholder image";
      await placeholderGenerator(prompt, output);
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
