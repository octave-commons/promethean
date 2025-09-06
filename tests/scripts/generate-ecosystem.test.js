import test from "ava";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { generateEcosystem } from "../../scripts/generate-ecosystem.mjs";

test("generates apps array from package configs", async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "eco-"));
  const pkgs = path.join(tmp, "packages");
  fs.mkdirSync(pkgs);
  fs.mkdirSync(path.join(pkgs, "pkg1"));
  fs.writeFileSync(
    path.join(pkgs, "pkg1", "ecosystem.config.js"),
    "export const apps = ['a'];",
  );
  fs.mkdirSync(path.join(pkgs, "pkg2"));
  fs.writeFileSync(
    path.join(pkgs, "pkg2", "ecosystem.config.js"),
    "export default { apps: ['b'] };",
  );
  const out = path.join(tmp, "ecosystem.generated.mjs");
  generateEcosystem({ packagesDir: pkgs, outputFile: out });
  const { apps } = await import(pathToFileURL(out));
  t.deepEqual(apps, ["a", "b"]);
});
