import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(
  fileURLToPath(new URL("../../..", import.meta.url)),
);
const PACKAGE_FIXTURES = path.join(PACKAGE_ROOT, "tests", "fixtures");
const CWD_FIXTURES = path.join(process.cwd(), "tests", "fixtures");

function hasCoreFixture(dir: string): boolean {
  return existsSync(path.join(dir, "readme.md"));
}

export function resolveFixturesRoot(): string {
  const candidates = [CWD_FIXTURES, PACKAGE_FIXTURES];
  for (const candidate of candidates) {
    if (hasCoreFixture(candidate)) {
      return path.resolve(candidate);
    }
  }
  return PACKAGE_FIXTURES;
}

export const FIXTURES_ROOT = resolveFixturesRoot();

export function fixturePath(...parts: string[]): string {
  return path.join(FIXTURES_ROOT, ...parts);
}

export function packageRoot(): string {
  return PACKAGE_ROOT;
}
