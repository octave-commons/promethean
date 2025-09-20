export type MarkdownChunk = {
    readonly text: string;
    readonly startLine: number;
    readonly startCol: number;
    readonly endLine: number;
    readonly endCol: number;
    readonly kind: 'text' | 'code';
    readonly title?: string;
};
