import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");

export function checkDuplicateFragments(
	changelogDir: string = path.join(repoRoot, "changelog.d"),
): boolean {
	const prefixes = new Map<string, string>();
	if (!fs.existsSync(changelogDir)) {
		return true;
	}
	for (const name of fs.readdirSync(changelogDir)) {
		if (!name.endsWith(".md")) continue;
		const prefix = name.split(".")[0];
		if (prefixes.has(prefix)) {
			console.error(
				"Duplicate changelog fragments detected for PR",
				prefix,
				`(${prefixes.get(prefix)}, ${name})`,
			);
			return false;
		}
		prefixes.set(prefix, name);
	}
	return true;
}

export function changelogModified(
	changelogPath: string = path.join(repoRoot, "CHANGELOG.md"),
	runner: typeof spawnSync = spawnSync,
): boolean {
	const result = runner(
		"git",
		["diff", "--name-only", "--cached", changelogPath],
		{
			encoding: "utf8",
		},
	);
	return result.stdout.trim().length > 0;
}

export function main(): number {
	let ok = true;
	if (!checkDuplicateFragments()) {
		ok = false;
	}
	if (changelogModified()) {
		console.error(
			"Direct modifications to CHANGELOG.md are not allowed. Add a fragment under changelog.d/ instead.",
		);
		ok = false;
	}
	return ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exit(main());
}
