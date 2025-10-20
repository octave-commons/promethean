import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import test from "ava";
import { openLevelCache } from "@promethean/level-cache";

import { writeTasks } from "../05-write.js";
import type { Cluster, FunctionInfo, Plan } from "../types.js";

const TMP_PREFIX = `simtask-write-${Date.now()}-` as const;

type Paths = Readonly<{
  scan: string;
  clusters: string;
  plans: string;
  out: string;
}>;

const makePaths = (dir: string): Paths =>
  ({
    scan: path.join(dir, "scan-cache"),
    clusters: path.join(dir, "clusters.json"),
    plans: path.join(dir, "plans.json"),
    out: path.join(dir, "tasks-out"),
  }) as const satisfies Paths;

const buildFunctions = (baseDir: string) =>
  [
    {
      id: "fn-1",
      pkgName: 'pkg"with]chars',
      pkgFolder: "packages/special",
      fileAbs: path.join(baseDir, "packages/special/src/example.ts"),
      fileRel: "packages/special/src/example.ts",
      moduleRel: "src/example.ts",
      name: 'do"Thing',
      kind: "function",
      className: undefined,
      exported: false,
      signature: "(value: string) => string",
      jsdoc: undefined,
      startLine: 1,
      endLine: 5,
      snippet: "export const doThing = (value: string) => value;",
    },
  ] as const satisfies ReadonlyArray<FunctionInfo>;

const buildClusters = () =>
  [
    { id: "cluster-1", memberIds: ["fn-1"], maxSim: 0.9, avgSim: 0.9 },
  ] as const satisfies ReadonlyArray<Cluster>;

const buildPlans = () =>
  ({
    "cluster-1": {
      clusterId: "cluster-1",
      title: 'Consolidate "special" path',
      summary: "Verify escaping behaviour",
      canonicalPath: 'packages/special/"canonical"\npath.ts',
      canonicalName: 'makeThing"Better',
      proposedSignature: "(value: string) => string",
      risks: [],
      steps: [],
      acceptance: [],
    },
  }) as const satisfies Readonly<Record<string, Plan>>;

const seedFunctions = async (
  scanPath: string,
  fns: ReadonlyArray<FunctionInfo>,
): Promise<void> => {
  const cache = await openLevelCache<ReadonlyArray<FunctionInfo>>({
    path: scanPath,
  });
  await cache.set("functions", [...fns]);
  await cache.close();
};

const writeJson = (file: string, data: unknown): Promise<void> =>
  fs.writeFile(file, JSON.stringify(data), "utf8");

const readMermaidSection = async (outDir: string): Promise<string> => {
  const files = await fs.readdir(outDir);
  const taskFile = files.find((file) => file !== "README.md");
  if (taskFile === undefined) {
    throw new Error("Task file not generated");
  }
  const markdown = await fs.readFile(path.join(outDir, taskFile), "utf8");
  const section = markdown.split("```mermaid")[1]?.split("```")[0];
  if (section === undefined) {
    throw new Error("Mermaid section missing");
  }
  return section;
};

type TmpDirTask<T> = Readonly<{
  run: (input: Readonly<{ dir: string }>) => Promise<T>;
}>;

const withTmpDir = async <T>({ run }: TmpDirTask<T>): Promise<T> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), TMP_PREFIX));
  const execution = Promise.resolve(run({ dir }));
  return execution.finally(async () => {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  });
};

test("writeTasks escapes mermaid labels for special characters", async (t) => {
  await withTmpDir({
    // eslint-disable-next-line functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types
    run: async ({ dir }: Readonly<{ dir: string }>) => {
      const paths = makePaths(dir);
      await seedFunctions(paths.scan, buildFunctions(dir));
      await writeJson(paths.clusters, buildClusters());
      await writeJson(paths.plans, buildPlans());

      await writeTasks({
        "--scan": paths.scan,
        "--clusters": paths.clusters,
        "--plans": paths.plans,
        "--out": paths.out,
        "--priority": "P1",
        "--status": "todo",
        "--label": "qa",
      });

      const mermaid = await readMermaidSection(paths.out);
      t.true(
        mermaid.includes('C["packages/special/\\"canonical\\"\\npath.ts"]'),
      );
      t.true(mermaid.includes('P1["pkg\\"with]chars"]'));
      return undefined;
    },
  });
});
