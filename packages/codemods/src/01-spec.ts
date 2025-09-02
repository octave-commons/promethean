/* eslint-disable no-console */
import * as path from "path";
import { Project } from "ts-morph";
import { readJSON, writeJSON } from "./utils.js";
import type { ModSpecFile, ModSpec } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/simtasks/functions.json",
  "--clusters": ".cache/simtasks/clusters.json",
  "--plans": ".cache/simtasks/plans.json",
  "--out": ".cache/codemods/specs.json",
  "--tsconfig": "tsconfig.json",
});

const scan = args["--scan"]!;
const clusters = args["--clusters"]!;
const plans = args["--plans"]!;
const out = args["--out"]!;
const tsconfig = args["--tsconfig"]!;

function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    out[k] = v;
  }
  return out;
}

type Fn = {
  id: string;
  pkgName: string;
  fileRel: string;
  name: string;
  kind: "function" | "arrow" | "method";
  exported: boolean;
};
type Cluster = {
  id: string;
  memberIds: string[];
  maxSim: number;
  avgSim: number;
};
type Plan = {
  clusterId: string;
  title: string;
  summary?: string;
  canonicalPath: string;
  canonicalName: string;
  proposedSignature?: string;
};

function normName(s: string) {
  return s.replace(/[_-]/g, "").toLowerCase();
}

function buildParamMap(canon: string[], dup: string[]): number[] {
  if (!canon.length || !dup.length) return [];
  const ix = new Map(dup.map((n, i) => [normName(n), i]));
  return canon.map((cn) => (ix.has(normName(cn)) ? ix.get(normName(cn))! : -1));
}

async function main() {
  const scanData = await readJSON<{ functions: Fn[] }>(path.resolve(scan), {
    functions: [],
  });
  const clustersData = await readJSON<Cluster[]>(path.resolve(clusters), []);
  const plansData = await readJSON<Record<string, Plan>>(
    path.resolve(plans),
    {},
  );

  const project = new Project({
    tsConfigFilePath: path.resolve(tsconfig),
    skipAddingFilesFromTsConfig: true,
  });

  const specs: ModSpec[] = [];

  // Helper: get param names for a function name in a file
  function getParamNames(
    fileAbs: string,
    funcName: string,
  ): string[] | undefined {
    let sf = project.getSourceFile(fileAbs);
    if (!sf) {
      try {
        sf = project.addSourceFileAtPath(fileAbs);
      } catch {
        return undefined;
      }
    }
    // function declarations
    const f = sf.getFunctions().find((fn) => fn.getName() === funcName);
    if (f) return f.getParameters().map((p) => p.getName());
    // const foo = (...) => {}
    const vd = sf.getVariableDeclaration(funcName);
    const init = vd?.getInitializer();
    if (init && typeof (init as any).getParameters === "function") {
      // arrow or function expression
      // @ts-ignore
      if (init.getParameters)
        return init.getParameters().map((p: any) => p.getName());
    }
    return undefined;
  }

  for (const c of clustersData) {
    const plan = plansData[c.id];
    if (!plan) continue;

    const dupsAll = c.memberIds.map((id) => byId.get(id)!).filter(Boolean);
    const dups = dupsAll.filter((d) => d.kind !== "method"); // v1: free functions / arrows

    const spec: ModSpec = {
      clusterId: c.id,
      title: plan.title,
      summary: plan.summary,
      canonical: {
        path: plan.canonicalPath,
        name: plan.canonicalName,
        params: undefined,
      },
      duplicates: dups.map((d) => ({
        id: d.id,
        package: d.pkgName,
        file: d.fileRel,
        name: d.name,
        kind: d.kind,
        exported: d.exported,
      })),
      canonical: { path: plan.canonicalPath, name: plan.canonicalName },
      duplicates: dups.map(d => ({
        id: d.id, package: d.pkgName, file: d.fileRel, name: d.name, kind: d.kind, exported: d.exported
      }))
    };

    // try to load canonical + duplicates to extract params
    const canonAbs = path.resolve(plan.canonicalPath);
    try {
      const canonParams = getParamNames(canonAbs, plan.canonicalName);
      if (canonParams?.length) spec.canonical.params = canonParams;
    } catch {
      /* ignore */
    }

    for (const dup of spec.duplicates) {
      try {
        const dupAbs = path.resolve(dup.file);
        const dupParams = getParamNames(dupAbs, dup.name);
        if (dupParams?.length) {
          dup.params = dupParams;
          if (spec.canonical.params?.length)
            dup.paramMap = buildParamMap(spec.canonical.params, dupParams);
        }
      } catch {
        /* ignore */
      }
    }

    specs.push(spec);
  }

  await writeJSON(path.resolve(out), { specs } satisfies ModSpecFile);
  console.log(
    `codemods:01-spec → ${specs.length} specs with param maps where possible`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
