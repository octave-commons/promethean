export type FnKind = "function" | "arrow" | "method";

export type FunctionInfo = {
  id: string; // stable hash
  pkgName: string; // from package.json name
  pkgFolder: string; // packages/<folder>
  fileAbs: string;
  fileRel: string; // repo-relative path
  moduleRel: string; // path inside package folder
  name: string; // function/variable/method name
  kind: FnKind;
  className?: string; // for methods
  exported: boolean;
  signature?: string;
  jsdoc?: string;
  startLine: number;
  endLine: number;
  snippet: string; // full declaration text
};

export type EmbeddingMap = Record<string, number[]>; // id -> vector

export type Cluster = {
  id: string; // cluster-<n>
  memberIds: string[]; // FunctionInfo.id[]
  maxSim: number; // best pairwise similarity inside the cluster
  avgSim: number; // mean top-k similarity
};

export type Plan = {
  clusterId: string;
  title: string; // task title
  summary: string; // 1-2 lines
  canonicalPath: string; // e.g. packages/libs/core/src/strings/format.ts
  canonicalName: string; // suggested function name
  proposedSignature?: string;
  risks?: string[];
  steps?: string[];
  acceptance?: string[];
};
