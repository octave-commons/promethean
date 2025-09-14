import { promises as fs } from "fs";
import { pathToFileURL } from "node:url";

const WIKILINK_RE = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

export async function convertWikilinks(file: string): Promise<void> {
  const text = await fs.readFile(file, "utf-8");
  const newText = text.replace(
    WIKILINK_RE,
    (_match, target: string, _pipe: string, alias: string) => {
      const link = target.replace(/ /g, "%20") + ".md";
      return `[${alias ?? target}](${link})`;
    },
  );
  if (newText !== text) {
    await fs.writeFile(file, newText, "utf-8");
  }
}

const isDirect =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: convert-wikilinks <files>");
    process.exit(1);
  }
  Promise.all(files.map((f) => convertWikilinks(f))).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
