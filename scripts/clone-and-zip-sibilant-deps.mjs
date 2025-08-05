import { execSync } from "child_process";
import {
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
} from "fs";
import { join, resolve } from "path";
import AdmZip from "adm-zip";

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

function zipDir(sourceDir, outPath) {
  const zip = new AdmZip();
  const addDirToZip = (dir, zipPath = "") => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        addDirToZip(fullPath, join(zipPath, entry));
      } else {
        zip.addFile(join(zipPath, entry), readFileSync(fullPath));
      }
    }
  };
  addDirToZip(sourceDir);
  zip.writeZip(outPath);
}

for (const [name, url] of Object.entries(deps)) {
  const path = join(tmpDir, name);
  console.log(`Cloning ${name}...`);
  execSync(`git clone --depth=1 ${url} "${path}"`, { stdio: "inherit" });

  const zipPath = join(outDir, `${name}.zip`);
  console.log(`Zipping ${name} -> ${zipPath}`);
  zipDir(path, zipPath);
}

console.log("✅ All zipped to ./kits-zipped/");
