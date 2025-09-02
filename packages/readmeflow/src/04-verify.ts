/* eslint-disable no-console */
import * as path from "node:path";
import { promises as fs } from "node:fs";
import { parseArgs, writeText } from "./utils.js";
import type { VerifyReport } from "./types.js";

const args = parseArgs({
	"--root": "packages",
	"--out": "docs/agile/reports/readmes",
	"--max": "200",
});

async function main() {
	const ROOT_DIR = args["--root"]!;
	const OUT_DIR = args["--out"]!;
	const MAX = Number(args["--max"]!);

	const pkgs = await fs
		.readdir(path.resolve(ROOT_DIR), { withFileTypes: true })
		.then((ents) =>
			ents
				.filter((e) => e.isDirectory())
				.map((e) => path.join(ROOT_DIR, e.name)),
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
		const links = Array.from(raw.matchAll(/\[[^\]]+?\]\(([^)]+)\)/g))
			.map((m) => m[1])
			.filter((h) => !h.startsWith("http"));
		const broken: string[] = [];
		for (const href of links.slice(0, MAX)) {
			const target = path.resolve(dir, href.split("#")[0]);
			try {
				await fs.access(target);
			} catch {
				broken.push(href);
			}
		}
		if (broken.length) results.push({ pkg: dir.split("/").pop()!, broken });
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

	await fs.mkdir(path.resolve(OUT_DIR), { recursive: true });
	await writeText(path.join(OUT_DIR, `readmes-${ts}.md`), md);
	await writeText(
		path.join(OUT_DIR, `README.md`),
		`# Readme Reports\n\n- [Latest](readmes-${ts}.md)\n`,
	);
	console.log(
		`readmeflow: verify report → ${path.join(OUT_DIR, `readmes-${ts}.md`)}`,
	);
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
