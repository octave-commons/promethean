export type CodeBlock = {
  id: string;
  source: "doc" | "example" | "readme";
  file: string;
  lang: string;          // ts, js, bash, sh, json, yaml, etc.
  code: string;
  context: string;       // surrounding lines / header
};

export type ScanOutput = {
  createdAt: string;
  blocks: CodeBlock[];
};

export type ClassEntry = {
  id: string;
  task: string;          // taxonomy (e.g., ingest, transform, visualize, automate, test, deploy)
  runtime: string;       // node@20, shell, python@3.x
  language: string;      // ts, js, bash, etc.
  title: string;
  score?: number;        // classifier confidence
};

export type ClassesFile = {
  plannedAt: string;
  classes: Record<string, ClassEntry>; // key = block.id
  embeddings: Record<string, number[]>; // block.id -> vector
};

export type Group = {
  key: string;               // task|runtime|language
  blockIds: string[];
  centroid?: number[];       // average vector (for info)
};
export type GroupsFile = { groupedAt: string; groups: Group[]; };

export type PlanRecipe = {
  uuid: string;
  task: string;
  title: string;
  problem: string;
  runtime: string;           // e.g., "node@20" | "shell"
  difficulty: "easy" | "medium" | "hard";
  estimated_time: string;    // "5m", "15m", "1h"
  ingredients: string[];     // deps/tools
  steps: string[];           // numbered steps
  code_lang: string;         // code block language
  code: string;              // runnable snippet
  see_also: string[];        // relative links
  tags: string[];
  expected_output_hash?: string; // filled by verify --accept
};

export type PlanFile = { plannedAt: string; groups: Record<string, PlanRecipe[]>; };

export type RunResult = {
  recipePath: string;    // docs/cookbook/...md
  ok: boolean;
  stdoutHash?: string;
  stderrHash?: string;
  exitCode?: number | null;
  stdoutPreview?: string;
  stderrPreview?: string;
};

export type RunResultsFile = { ranAt: string; results: RunResult[]; };

export type VerifyItem = {
  recipePath: string;
  expected?: string;
  actual?: string;
  ok: boolean;
};
export type VerifyFile = { verifiedAt: string; items: VerifyItem[]; };
