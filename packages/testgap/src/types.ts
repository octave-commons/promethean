export type ExportSymbol = {
  pkg: string;
  file: string;
  kind: "function"|"class"|"variable"|"interface"|"type"|"enum";
  name: string;
  startLine: number;
  endLine: number;
};

export type ExportScan = { scannedAt: string; symbols: ExportSymbol[] };

export type FileCoverage = {
  file: string;                          // repo-relative path
  linesTotal: number;
  linesCovered: number;
  coveredLines: number[];                // 1-based
};
export type CoverageIndex = { collectedAt: string; files: Record<string, FileCoverage> };

export type SymbolCoverage = {
  symbol: ExportSymbol;
  covered: number;
  total: number;
  ratio: number;                         // 0..1
};
export type GapItem = SymbolCoverage & {
  severity: "high"|"med"|"low";
  reasons: string[];                     // e.g., "exported API uncovered"
  cookbookHits?: string[];               // recipe files that exercise it (static)
};
export type GapMap = { mappedAt: string; items: GapItem[] };

export type CookbookHit = { recipe: string; pkg: string; imported: string[] };
export type CookbookCross = { analyzedAt: string; hits: CookbookHit[] };

export type PlanTask = {
  title: string;
  summary: string;
  steps: string[];
  acceptance: string[];
  labels: string[];
  priority: "P1"|"P2"|"P3";
  refs: Array<{ file: string; line: number; sym: string }>;
};
export type PlanFile = { plannedAt: string; tasks: Record<string, PlanTask[]> }; // key by pkg
