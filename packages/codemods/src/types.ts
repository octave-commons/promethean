export type FnId = string; // from @promethean/simtasks FunctionInfo.id

export type ModSpec = {
  clusterId: string;
  title: string;
  summary?: string;

  canonical: {
    path: string;        // repo-relative, e.g. packages/libs/core/src/strings/format.ts
    name: string;        // canonical function name
    params?: string[];   // canonical param names (if found on disk)
    importName?: string; // optional alias at callsite
  };

  // Functions considered duplicates to migrate to the canonical API:
  duplicates: Array<{
    id: FnId;
    package: string;     // npm name
    file: string;        // repo-rel
    name: string;        // declared/used name
    kind: "function" | "arrow" | "method";
    exported: boolean;

    params?: string[];       // duplicate's parameter names (if found)
    paramMap?: number[];     // index map: canonical[i] -> duplicate[index] (or -1 if unknown)
  }>;

  // Optional human hints (kept for future use)
  argHints?: Array<{ fromName: string; toName: string }>;
};

export type ModSpecFile = {
  specs: ModSpec[];
};
