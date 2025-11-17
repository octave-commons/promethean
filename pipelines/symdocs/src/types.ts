export type SymKind = "function" | "variable" | "class" | "type";

export type SymbolInfo = {
  id: string;                 // stable hash
  pkg: string;                // package folder under packages/
  fileAbs: string;            // absolute path
  fileRel: string;            // relative to repo root
  moduleRel: string;          // relative to packages/<pkg>/
  lang: "ts" | "tsx" | "js" | "jsx";
  name: string;
  kind: SymKind;
  exported: boolean;
  jsdoc?: string;
  signature?: string;         // human-readable signature (functions/types)
  startLine: number;
  endLine: number;
  snippet: string;            // declaration text
};

export type ScanResult = { symbols: SymbolInfo[] };

export type DocDraft = {
  id: string;                 // SymbolInfo.id
  name: string;
  kind: SymKind;
  title: string;
  summary: string;            // 1-2 lines
  usage?: string;             // code fence
  details?: string;           // markdown
  pitfalls?: string[];        // bullets
  tags?: string[];
  mermaid?: string;           // optional diagram (e.g., class or flow)
};

export type DocMap = Record<string, DocDraft>; // id -> draft
