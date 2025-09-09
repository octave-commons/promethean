import {
  generateFiles,
  joinPathFragments,
  names,
  formatFiles,
} from "@nx/devkit";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function generator(tree, schema) {
  const normalized = names(schema.name).fileName;
  const projectRoot = joinPathFragments("packages", normalized);
  generateFiles(tree, joinPathFragments(__dirname, "files"), projectRoot, {
    tmpl: "",
    name: normalized,
  });
  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
