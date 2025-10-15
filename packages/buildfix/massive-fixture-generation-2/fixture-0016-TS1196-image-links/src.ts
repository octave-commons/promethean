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

function extractMarkdownImageTarget(raw: string): string | null {
  const inner = raw.trim();
  if (!inner) return null;
  if (inner.startsWith("<")) {
    const closing = inner.indexOf(">");
    const enclosed = closing === -1 ? inner.slice(1) : inner.slice(1, closing);
    return enclosed.trim() || null;
  }
  const extracted = reduceMarkdownDestination(inner).output.trim();
  return extracted ? extracted : null;
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

const isBrokenLink = (
  value: BrokenImageLink | null,
): value is BrokenImageLink => value !== null;

const toBrokenMarkdownLink = async (
  file: string,
  alt: string,
  rawTarget: string,
): Promise<BrokenImageLink | null> => {
  const target = extractMarkdownImageTarget(rawTarget);
  const url = target ? normalizeLocalUrl(target) : null;
  if (!url) return null;
  const imgPath = path.resolve(path.dirname(file), url);
  return (await pathExists(imgPath)) ? null : { file, url, alt };
};

const toBrokenOrgLink = async (
  file: string,
  rawUrl: string,
  alt: string,
): Promise<BrokenImageLink | null> => {
  const url = normalizeLocalUrl(rawUrl);
  if (!url) return null;
  const imgPath = path.resolve(path.dirname(file), url);
  return (await pathExists(imgPath)) ? null : { file, url, alt };
};

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
        // markdown ![alt](url)
        const mdRegex = /!\[([^\]]*?)\]\(([^)]*?)\)/g;
        const mdBroken = await Promise.all(
          Array.from(content.matchAll(mdRegex)).map((match) =>
            toBrokenMarkdownLink(file, match[1] ?? "", match[2] ?? ""),
          ),
        );
        // org [[file:img.png][alt]] or [[img.png]]
        const orgRegex = /\[\[(?:file:)?([^\]\[]+?)\](?:\[([^\]]*?)\])?\]/g;
        const orgBroken = await Promise.all(
          Array.from(content.matchAll(orgRegex)).map((match) =>
            toBrokenOrgLink(file, match[1] ?? "", match[2] ?? ""),
          ),
        );
        return [...mdBroken, ...orgBroken].filter(isBrokenLink);
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

type MarkdownState = {
  readonly output: string;
  readonly depth: number;
  readonly done: boolean;
  readonly skipNext: boolean;
};

const whitespaceCharacters = [" ", "\t", "\n", "\r"] as const;

const appendOutput = (
  state: MarkdownState,
  addition: string,
  overrides: Partial<MarkdownState> = {},
): MarkdownState => ({
  ...state,
  ...overrides,
  output: `${state.output}${addition}`,
});

const shouldStopAfterWhitespace = (inner: string, index: number): boolean => {
  const rest = inner.slice(index + 1).trimStart();
  return (
    !rest ||
    rest.startsWith('"') ||
    rest.startsWith("'") ||
    rest.startsWith("(")
  );
};

const handleWhitespace = (
  inner: string,
  state: MarkdownState,
  ch: string,
  index: number,
): MarkdownState =>
  shouldStopAfterWhitespace(inner, index)
    ? { ...state, done: true }
    : appendOutput(state, ch);

const handleClosingParenthesis = (state: MarkdownState): MarkdownState =>
  state.depth === 0
    ? { ...state, done: true }
    : appendOutput(state, ")", { depth: state.depth - 1 });

const advanceMarkdownState = (
  inner: string,
  state: MarkdownState,
  ch: string,
  index: number,
): MarkdownState => {
  if (state.skipNext) {
    return { ...state, skipNext: false };
  }
  if (ch === "\\") {
    const nextChar = inner[index + 1];
    return nextChar ? appendOutput(state, nextChar, { skipNext: true }) : state;
  }
  if (
    whitespaceCharacters.some((whitespace) => whitespace === ch) &&
    state.depth === 0
  ) {
    return handleWhitespace(inner, state, ch, index);
  }
  if (ch === "(") {
    return appendOutput(state, ch, { depth: state.depth + 1 });
  }
  if (ch === ")") {
    return handleClosingParenthesis(state);
  }
  return appendOutput(state, ch);
};

const reduceMarkdownDestination = (inner: string): MarkdownState =>
  Array.from(inner).reduce<MarkdownState>(
    (state, ch, index) =>
      state.done ? state : advanceMarkdownState(inner, state, ch, index),
    { output: "", depth: 0, done: false, skipNext: false },
  );

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

undefinedVariable;