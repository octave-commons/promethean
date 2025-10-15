// export type PkgInfo = {
  name: string;
  version: string;
  dir: string;
  description?: string;
  bin?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaceDeps: string[];     // internal deps
  hasTsConfig: boolean;
  readme?: string;             // existing README content (if any)
};

// export type ScanOut = {
  createdAt: string;
  packages: PkgInfo[];
  graphMermaid: string;
};

// export type Outline = {
  name: string;
  title: string;
  tagline: string;
  sections: Array<{ heading: string; body: string }>;
  includeTOC: boolean;
  badges?: string[];
};

// export type OutlinesFile = { plannedAt: string; outlines: Record<string, Outline> };

// export type VerifyReport = {
  checkedAt: string;
  results: Array<{ pkg: string; broken: string[] }>;
};
