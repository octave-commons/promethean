import { promises as fs } from "fs";
import { pathToFileURL } from "node:url";

const WIKILINK_RE = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

const encodeSpaces = (value: string): string => value.replace(/ /g, "%20");

type TargetParts = {
  readonly base: string;
  readonly anchor: string;
};

const splitTarget = (target: string): TargetParts => {
  const delimiterIndex = target.search(/[?#]/);
  return delimiterIndex === -1
    ? { base: target, anchor: "" }
    : {
        base: target.slice(0, delimiterIndex),
        anchor: target.slice(delimiterIndex),
      };
};

const toMarkdownLink = ({ base, anchor }: TargetParts): string => {
  const encodedBase = encodeSpaces(base);
  const encodedAnchor = encodeSpaces(anchor);
  return `${encodedBase}.md${encodedAnchor}`;
};

export async function convertWikilinks(file: string): Promise<void> {
  const text = await fs.readFile(file, "utf-8");
  const newText = text.replace(
    WIKILINK_RE,
    (_match, target: string, _pipe: string, alias: string) => {
      const parts = splitTarget(target);
      return `[${alias ?? parts.base}](${toMarkdownLink(parts)})`;
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
