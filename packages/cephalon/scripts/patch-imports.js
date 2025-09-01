import fs from "fs/promises";
import path from "path";

const DIST_DIR = path.resolve("./dist");

async function patchFile(filePath) {
  let content = await fs.readFile(filePath, "utf8");

  // Match import/export statements with relative paths (./ or ../)
  const result = content.replace(
    /(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g,
    (_, prefix, importPath, suffix) => {
      // Add .js unless it already ends with .js or .mjs or contains query params
      if (
        importPath.endsWith(".js") ||
        importPath.endsWith(".mjs") ||
        importPath.includes("?")
      ) {
        return `${prefix}${importPath}${suffix}`;
      }
      return `${prefix}${importPath}.js${suffix}`;
    },
  );

  await fs.writeFile(filePath, result);
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
console.log("✅ All relative imports patched to use .js");
