// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - compiled CLJS ESM output
import { renderMarkdown as cljsRender } from "../../dist/cljs/main.js";
import type { ReportInput } from "./types.js";

export const renderMarkdown = (input: ReportInput): string =>
  cljsRender(JSON.parse(JSON.stringify(input)));
