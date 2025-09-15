import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { Project, SyntaxKind } from "ts-morph";
import { diffLines } from "diff";
import { relFromRepo } from "@promethean/utils";

import { listCodeFiles } from "./utils.js";

const args = parseArgs({
  "--root": "packages",
  "--modsDir": "codemods",
  "--mode": "dry", // dry | apply
  "--report": "docs/agile/tasks/codemods",
  "--specs": ".cache/codemods/specs.json",
  "--delete-duplicates": "true",
});

const specsPath = args["--specs"];

function parseArgs<T extends Record<string, string>>(defaults: T): T {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k?.startsWith("--")) continue;
    const next = a[i + 1];
    const v = next && !next.startsWith("--") ? (i++, next) : "true";
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

async function loadTransforms(modsDir: string) {
  const dirs = await fs
    .readdir(modsDir, { withFileTypes: true })
    .catch(() => []);
  const loaders: Array<{
    id: string;
    run: (
      p: Project,
      f: string,
    ) => Promise<{ changed: boolean; notes: string[] }>;
  }> = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const id = d.name;
    const js = path.join(modsDir, id, "transform.js");
    const ts = path.join(modsDir, id, "transform.ts");
    let mod: unknown;
    try {
      mod = await import(pathToFileURL(js).href);
    } catch {
      mod = await import(pathToFileURL(ts).href);
    }
    if (mod && typeof mod === "object" && "runTransform" in mod) {
      const { runTransform } = mod as {
        runTransform: (
          p: Project,
          f: string,
        ) => Promise<{ changed: boolean; notes: string[] }>;
      };
      loaders.push({ id, run: runTransform });
    }
  }
  return loaders;
}

type SpecsFile = {
  specs: Array<{
    clusterId: string;
    canonical: { path: string };
    duplicates: Array<{ file: string }>;
  }>;
};

async function main() {
  const ROOT = path.resolve(args["--root"]);
  const MODS = path.resolve(args["--modsDir"]);
  const MODE = args["--mode"] as "dry" | "apply";
  const REPORT_ROOT = path.resolve(args["--report"]);
  const DELETE = args["--delete-duplicates"] === "true";

  const transforms = await loadTransforms(MODS);
  if (!transforms.length) {
    console.log("No transforms found.");
    return;
  }

  await fs.mkdir(REPORT_ROOT, { recursive: true });

  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  const files = await listCodeFiles(ROOT);
  files.forEach((f: string) => {
    project.addSourceFileAtPathIfExists(f);
  });

  const summary: string[] = [];
  const deletionsWanted = new Set<string>(); // abs paths
  const deletionsDone: string[] = [];

  for (const t of transforms) {
    const reportLines: string[] = [
      `# Codemod ${t.id}`,
      "",
      `Mode: \`${MODE}\``,
      "",
    ];
    let changedCount = 0;

    for (const f of files) {
      const sf = project.getSourceFile(f);
      if (!sf) continue;
      const before = sf.getFullText();

      const res = await t.run(project, path.resolve(f));
      if (!res.changed) continue;

      changedCount++;
      const after = sf.getFullText();

      if (MODE === "dry") {
        const diffs = diffLines(before, after);

        type DiffPart = { added?: boolean; removed?: boolean; value: string };
        const pretty = diffs
          .map((part: DiffPart) => {
            const prefix = part.added ? "+" : part.removed ? "-" : " ";
            return part.value
              .split("\n")
              .map((line: string) => prefix + line)
              .join("\n");
          })
          .join("");
        // revert in dry mode
        sf.replaceWithText(before);

        reportLines.push(`## ${relFromRepo(f)}`);
        if (res.notes.length) {
          reportLines.push(
            "",
            "**Notes:**",
            ...res.notes.map((n) => `- ${n}`),
            "",
          );
        }
        reportLines.push("```diff", pretty.trimEnd(), "```", "");
      }
    }

    summary.push(
      `- ${t.id}: ${changedCount} file(s) ${
        MODE === "dry" ? "would change" : "changed"
      }`,
    );
    await fs.writeFile(
      path.join(REPORT_ROOT, `${t.id}.md`),
      reportLines.join("\n"),
      "utf-8",
    );
  }

  // Candidate deletions (files that now have no meaningful statements)
  if (DELETE) {
    const specs: SpecsFile = JSON.parse(
      await fs.readFile(path.resolve(specsPath), "utf-8"),
    );
    for (const s of specs.specs) {
      for (const dup of s.duplicates) {
        const abs = path.resolve(dup.file);
        const sf = project.getSourceFile(abs);
        if (!sf) continue;
        const keep = sf.getStatements().some((st) => {
          const k = st.getKind();
          // keep if any real declaration/assignment/export remains
          return ![
            SyntaxKind.ImportDeclaration,
            SyntaxKind.EmptyStatement,
          ].includes(k);
        });
        if (!keep) deletionsWanted.add(abs);
      }
    }

    if (MODE === "apply") {
      // save changes first
      await project.save();
      for (const abs of deletionsWanted) {
        try {
          await fs.rm(abs);
          deletionsDone.push(relFromRepo(abs));
        } catch {
          /* ignore */
        }
      }
    }
  }

  const index = [
    "# Codemods report",
    "",
    `Mode: \`${MODE}\``,
    "",
    ...summary,
    "",
    DELETE
      ? `## Duplicate files ${
          MODE === "dry" ? "that would be deleted" : "deleted"
        }`
      : "",
    DELETE
      ? deletionsDone.length
        ? deletionsDone.map((p) => `- ${p}`).join("\n")
        : Array.from(deletionsWanted).length
          ? Array.from(deletionsWanted)
              .map((a) => `- ${relFromRepo(a)}`)
              .join("\n")
          : "_None_"
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await fs.writeFile(
    path.join(REPORT_ROOT, `README.md`),
    `${index}\n`,
    "utf-8",
  );

  if (MODE === "apply") {
    await project.save();
  }
  console.log(
    `codemods:${MODE} — see ${path.relative(process.cwd(), REPORT_ROOT)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
