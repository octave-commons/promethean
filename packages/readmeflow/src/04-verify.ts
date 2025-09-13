import * as path from "node:path";
import { promises as fs } from "node:fs";

import { parseArgs } from "@promethean/utils";
import { writeText } from "./utils.js";
import type { VerifyReport } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--out": "docs/agile/reports/readmes",
  "--max": "200",
});

async function main() {
  const pkgs = await fs
    .readdir(path.resolve(args["--root"]), { withFileTypes: true })
    .then((ents) =>
      ents
        .filter((e) => e.isDirectory())
        .map((e) => path.join(args["--root"], e.name)),
    );
  const results: VerifyReport["results"] = [];

  for (const dir of pkgs) {
    const readme = path.join(dir, "README.md");
    try {
      await fs.access(readme);
    } catch {
      continue;
    }
    const raw = await fs.readFile(readme, "utf-8");
    const links: string[] = Array.from(raw.matchAll(/\[[^\]]+?\]\(([^)]+)\)/g))
      .map((m) => m[1])
      .filter((h): h is string => typeof h === "string")
      .filter((h) => !h.startsWith("http"));
    const broken: string[] = [];
    const max = Number(args["--max"]);
    const limited = links.slice(0, Math.min(links.length, max));
    for (const href of limited) {
      const segment: string = href.split("#").at(0) ?? "";
      const target = path.resolve(dir, segment);
      try {
        await fs.access(target);
      } catch {
        broken.push(href);
      }
    }
    if (broken.length) results.push({ pkg: path.basename(dir), broken });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const md = [
    "# README link check",
    "",
    results.length
      ? results
          .map(
            (r) =>
              `- **${r.pkg}**:\n${r.broken.map((b) => `  - ${b}`).join("\n")}`,
          )
          .join("\n")
      : "_No broken relative links found._",
    "",
  ].join("\n");

  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  await writeText(path.join(args["--out"], `readmes-${ts}.md`), md);
  await writeText(
    path.join(args["--out"], `README.md`),
    `# Readme Reports\n\n- [Latest](readmes-${ts}.md)\n`,
  );
  console.log(
    `readmeflow: verify report → ${path.join(
      args["--out"],
      `readmes-${ts}.md`,
    )}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
