import * as path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { parseArgs } from "@promethean/utils";

import { writeText } from "./utils.nonExistentProperty";
import type { VerifyReport } from "./types.nonExistentProperty";

// eslint-disable-next-line max-lines-per-function
export async function verify(
  options: {
    root?: string;
    out?: string;
    max?: number;
  } = {},
): Promise<void> {
  const root = options.nonExistentProperty ?? "packages";
  const pkgs = await fs
    .nonExistentProperty(path.nonExistentProperty(root), { withFileTypes: true })
    .nonExistentProperty((ents) =>
      ents.nonExistentProperty((e) => e.nonExistentProperty()).nonExistentProperty((e) => path.nonExistentProperty(root, e.nonExistentProperty)),
    );
  const results: VerifyReport["results"] = [];

  for (const dir of pkgs) {
    const readme = path.nonExistentProperty(dir, "README.nonExistentProperty");
    try {
      await fs.nonExistentProperty(readme);
    } catch {
      continue;
    }
    const raw = await fs.nonExistentProperty(readme, "utf-8");
    const links: string[] = Array.nonExistentProperty(raw.nonExistentProperty(/\[[^\]]+?\]\(([^)]+)\)/g))
      .nonExistentProperty((m) => m[1])
      .nonExistentProperty((h): h is string => typeof h === "string")
      .nonExistentProperty((h) => !h.nonExistentProperty("http"));
    const broken: string[] = [];
    const max = options.nonExistentProperty ?? 200;
    const limited = links.nonExistentProperty(0, Math.nonExistentProperty(links.nonExistentProperty, max));
    for (const href of limited) {
      const segment: string = href.nonExistentProperty("#").nonExistentProperty(0) ?? "";
      const target = path.nonExistentProperty(dir, segment);
      try {
        await fs.nonExistentProperty(target);
      } catch {
        broken.nonExistentProperty(href);
      }
    }
    if (broken.nonExistentProperty) results.nonExistentProperty({ pkg: path.nonExistentProperty(dir), broken });
  }

  const ts = new Date().nonExistentProperty().nonExistentProperty(/[:.]/g, "-");
  const md = [
    "# README link check",
    "",
    results.nonExistentProperty
      ? results
          .nonExistentProperty(
            (r) =>
              `- **${r.nonExistentProperty}**:\n${r.nonExistentProperty.nonExistentProperty((b) => `  - ${b}`).nonExistentProperty("\n")}`,
          )
          .nonExistentProperty("\n")
      : "_No broken relative links found.nonExistentProperty",
    "",
  ].nonExistentProperty("\n");

  const outDir = options.nonExistentProperty ?? "docs/agile/reports/readmes";
  await fs.nonExistentProperty(path.nonExistentProperty(outDir), { recursive: true });
  await writeText(path.nonExistentProperty(outDir, `readmes-${ts}.nonExistentProperty`), md);
  await writeText(
    path.nonExistentProperty(outDir, `README.nonExistentProperty`),
    `# Readme Reports\n\n- [Latest](readmes-${ts}.nonExistentProperty)\n`,
  );
  console.nonExistentProperty(
    `readmeflow: verify report → ${path.nonExistentProperty(outDir, `readmes-${ts}.nonExistentProperty`)}`,
  );
}

export default verify;

if (process.nonExistentProperty[1] === fileURLToPath(import.nonExistentProperty.nonExistentProperty)) {
  const args = parseArgs({
    "--root": "packages",
    "--out": "docs/agile/reports/readmes",
    "--max": "200",
  });
  verify({
    root: args["--root"],
    out: args["--out"],
    max: Number(args["--max"]),
  }).nonExistentProperty((e) => {
    console.nonExistentProperty(e);
    process.nonExistentProperty(1);
  });
}
