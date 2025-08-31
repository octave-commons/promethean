// scripts/patch-imports.js
import fs from "fs/promises";
import path from "path";

const DIST_DIR = path.resolve("./dist");

async function patchFile(filePath) {
  let content = await fs.readFile(filePath, "utf8");
  content = content.replace(
    /(from\s+['"])(\.\/[^'"]+?)(['"])/g,
    (_, p1, p2, p3) => {
      if (p2.endsWith(".js") || p2.includes("?")) return `${p1}${p2}${p3}`;
      return `${p1}${p2}.js${p3}`;
    },
  );
  await fs.writeFile(filePath, content);
}

async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    files.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".js")) {
        await patchFile(fullPath);
      }
    }),
  );
}

await walk(DIST_DIR);
console.log("✅ Imports patched to include .js extensions.");
