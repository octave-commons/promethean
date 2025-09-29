import { execSync } from "child_process";
import { mkdirSync, rmSync } from "fs";
import { join, resolve } from "path";

const deps = {
  kit: "https://github.com/riatzukiza/kit.git",
  "kit-async": "https://github.com/riatzukiza/kit-async.git",
  "kit-events": "https://github.com/riatzukiza/kit-events.git",
  "kit-file-system": "https://github.com/riatzukiza/kit-file-system.git",
  "kit-html": "https://github.com/riatzukiza/kit-html.git",
  "kit-http": "https://github.com/riatzukiza/kit-http.git",
  "kit-interface": "https://github.com/riatzukiza/kit-interface.git",
  "kit-repl": "https://github.com/riatzukiza/kit-repl.git",
  "kit-shell": "https://github.com/riatzukiza/kit-shell.git",
  "tree-kit": "https://github.com/riatzukiza/tree-kit.git",
};

const outDir = "./kits-zipped";
const tmpDir = "./kits-clone-tmp";

mkdirSync(outDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir);

for (const [name, url] of Object.entries(deps)) {
  const path = join(tmpDir, name);
  console.log(`Cloning ${name}...`);
  execSync(`git clone --depth=1 ${url} "${path}"`, { stdio: "inherit" });

  const zipPath = join(outDir, `${name}.zip`);
  console.log(`Zipping ${name} -> ${zipPath}`);
  execSync(`git archive --format=zip -o "${resolve(zipPath)}" HEAD`, {
    cwd: path,
    stdio: "inherit",
  });
}

console.log("✅ All zipped to ./kits-zipped/");
