import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_RE = /^\d+(?:\.\d+)*\.(added|changed|deprecated|removed|fixed|security)\.md$/;

export function findInvalidFragments(dir: string = "changelog.d"): string[] {
        if (!fs.existsSync(dir)) {
                return [];
        }
        return fs
                .readdirSync(dir, { withFileTypes: true })
                .filter((d) => d.isFile())
                .map((d) => d.name)
                .filter((name) => name.endsWith(".md") && !VALID_RE.test(name));
}

export function main(): number {
	const invalid = findInvalidFragments();
	if (invalid.length > 0) {
		console.error("Invalid changelog fragment names detected:");
		for (const name of invalid) {
			console.error(` - ${name}`);
		}
		return 1;
	}
	return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
        process.exit(main());
}
