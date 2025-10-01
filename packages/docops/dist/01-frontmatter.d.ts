#!/usr/bin/env node
import type { DBs } from "./db.js";
export type FrontmatterOptions = {
  dir: string;
  exts?: string[];
  genModel: string;
  dryRun?: boolean;
  files?: string[];
};
export declare function runFrontmatter(
  opts: FrontmatterOptions,
  db: DBs,
  onProgress?: (p: {
    step: "frontmatter";
    done: number;
    total: number;
    message?: string;
  }) => void,
): Promise<void>;
//# sourceMappingURL=01-frontmatter.d.ts.map
