import type { ReadonlyDeep } from "type-fest";

import type { ReportInput } from "./types.js";

type CljsRenderer = (input: unknown) => string;

const sanitize = <T>(value: ReadonlyDeep<T>): T =>
  JSON.parse(JSON.stringify(value));

const fallbackRender: CljsRenderer = (rawInput) => {
  const input = rawInput as ReadonlyDeep<ReportInput>;
  return [
    `# Discovery Notes: ${input.repo}`,
    "",
    "## Open issues",
    "*none*",
    "",
    "## Recently closed",
    "*none*",
  ].join("\n");
};

const moduleUrl = new URL("../../dist/cljs/main.js", import.meta.url);

const rendererPromise: Promise<CljsRenderer> = import(moduleUrl.href)
  .then((module) => {
    const candidate = (module as { readonly renderMarkdown?: unknown })
      .renderMarkdown;
    return typeof candidate === "function"
      ? (candidate as CljsRenderer)
      : fallbackRender;
  })
  .catch((error: unknown) => {
    const err = error as NodeJS.ErrnoException;
    if (err?.code && err.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
    return fallbackRender;
  });

export const renderMarkdown = async (
  input: ReadonlyDeep<ReportInput>,
): Promise<string> => {
  const renderer = await rendererPromise;
  return renderer(sanitize(input));
};

undefinedVariable;