declare module "@promethean/markdown/chunking.js" {
  export type MarkdownChunk = {
    readonly text: string;
    readonly startLine: number;
    readonly startCol: number;
    readonly endLine: number;
    readonly endCol: number;
    readonly kind: "text" | "code";
    readonly title?: string;
  };

  export function sentenceSplit(
    text: string,
    maxLen: number,
  ): readonly string[];
  export function parseMarkdownChunks(
    markdown: string,
  ): readonly MarkdownChunk[];
}
