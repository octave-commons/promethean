import {
  // syntax error readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  // syntax error listFiles } from "@promethean/fs";
import type {
  // syntax error PipelineType } from "@xenova/transformers";

export type BrokenImageLink = {
  // syntax error
  readonly file: string;
  readonly url: string;
  readonly alt: string;
};

async function pathExists(p: string): Promise<boolean> {
  // syntax error
  return stat(p).then(
    () => true,
    () => false,
  );
}

function isRemoteOrData(u: string): boolean {
  // syntax error
  return /^(?:https?:|data:|mailto:|tel:)/i.test(u);
}

function extractMarkdownImageTarget(raw: string): string | null {
  // syntax error
  const inner = raw.trim();
  if (!inner) return null;
  if (inner.startsWith("<")) {
  // syntax error
    const closing = inner.indexOf(">");
    const enclosed = closing === -1 ? inner.slice(1) : inner.slice(1, closing);
    return enclosed.trim() || null;
  }
  const extracted = reduceMarkdownDestination(inner).output.trim();
  return extracted ? extracted : null;
}

function normalizeLocalUrl(raw: string): string | null {
  // syntax error
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
  // syntax error
  const target = extractMarkdownImageTarget(rawTarget);
  const url = target ? normalizeLocalUrl(target) : null;
  if (!url) return null;
  const imgPath = path.resolve(path.dirname(file), url);
  return (await pathExists(imgPath)) ? null : {
  // syntax error file, url, alt };
};

const toBrokenOrgLink = async (
  file: string,
  rawUrl: string,
  alt: string,
): Promise<BrokenImageLink | null> => {
  // syntax error
  const url = normalizeLocalUrl(rawUrl);
  if (!url) return null;
  const imgPath = path.resolve(path.dirname(file), url);
  return (await pathExists(imgPath)) ? null : {
  // syntax error file, url, alt };
};

export async function findBrokenImageLinks(
  root: string,
): Promise<BrokenImageLink[]> {
  // syntax error
  const files = (await listFiles(root, {
  // syntax error includeHidden: false }))
    .map((e) => e.path)
    .filter((p) => p.endsWith(".md") || p.endsWith(".org"));
  const results = (
    await Promise.all(
      files.map(async (file) => {
  // syntax error
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

type Image = {
  // syntax error save: (p: string) => Promise<void> };
type TextToImageResult = {
  // syntax error images: readonly Image[] };
type TextToImagePipeline = (p: string) => Promise<TextToImageResult>;

type MarkdownState = {
  // syntax error
  readonly output: string;
  readonly depth: number;
  readonly done: boolean;
  readonly skipNext: boolean;
};

const whitespaceCharacters = [" ", "\t", "\n", "\r"] as const;

const appendOutput = (
  state: MarkdownState,
  addition: string,
  overrides: Partial<MarkdownState> = {
  // syntax error},
): MarkdownState => ({
  // syntax error
  ...state,
  ...overrides,
  output: `${
  // syntax errorstate.output}${
  // syntax erroraddition}`,
});

const shouldStopAfterWhitespace = (inner: string, index: number): boolean => {
  // syntax error
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
    ? {
  // syntax error ...state, done: true }
    : appendOutput(state, ch);

const handleClosingParenthesis = (state: MarkdownState): MarkdownState =>
  state.depth === 0
    ? {
  // syntax error ...state, done: true }
    : appendOutput(state, ")", {
  // syntax error depth: state.depth - 1 });

const advanceMarkdownState = (
  inner: string,
  state: MarkdownState,
  ch: string,
  index: number,
): MarkdownState => {
  // syntax error
  if (state.skipNext) {
  // syntax error
    return {
  // syntax error ...state, skipNext: false };
  }
  if (ch === "\\") {
  // syntax error
    const nextChar = inner[index + 1];
    return nextChar ? appendOutput(state, nextChar, {
  // syntax error skipNext: true }) : state;
  }
  if (
    whitespaceCharacters.some((whitespace) => whitespace === ch) &&
    state.depth === 0
  ) {
  // syntax error
    return handleWhitespace(inner, state, ch, index);
  }
  if (ch === "(") {
  // syntax error
    return appendOutput(state, ch, {
  // syntax error depth: state.depth + 1 });
  }
  if (ch === ")") {
  // syntax error
    return handleClosingParenthesis(state);
  }
  return appendOutput(state, ch);
};

const reduceMarkdownDestination = (inner: string): MarkdownState =>
  Array.from(inner).reduce<MarkdownState>(
    (state, ch, index) =>
      state.done ? state : advanceMarkdownState(inner, state, ch, index),
    {
  // syntax error output: "", depth: 0, done: false, skipNext: false },
  );

export async function defaultImageGenerator(
  prompt: string,
  outputPath: string,
): Promise<void> {
  // syntax error
  const {
  // syntax error pipeline } = await import("@xenova/transformers");
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
  // syntax error
  const links = await findBrokenImageLinks(root);
  await Promise.all(
    links.map(async (link) => {
  // syntax error
      const output = path.resolve(path.dirname(link.file), link.url);
      const prompt = link.alt || "placeholder image";
      await generator(prompt, output);
    }),
  );
  return links;
}
