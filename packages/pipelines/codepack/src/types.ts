export type CodeBlock = {
  id: string; // stable hash id
  srcPath: string; // absolute source file
  relPath: string; // relative to --dir
  lang?: string; // fence info string language
  startLine: number;
  endLine: number;
  code: string;
  contextBefore: string; // nearby prose/heading above
  contextAfter: string; // nearby prose after
  hintedName?: string; // filename/path hint detected
};

export type EmbeddingMap = Record<string, number[]>; // id -> vector

export type Cluster = {
  id: string; // cluster id (uuid)
  memberIds: string[]; // CodeBlock ids
};

export type NamedGroup = {
  clusterId: string;
  dir: string; // e.g. packages/foo/src
  files: Array<{ id: string; filename: string }>;
  readme: string; // README.md content
};

export type BlockManifest = {
  blocks: CodeBlock[];
};

export type NamePlan = {
  groups: NamedGroup[];
};
