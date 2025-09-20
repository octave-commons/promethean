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
  const variants = names(schema.name);
  const normalized = variants.fileName;
  const preset = schema.preset ?? "base";
  const templateDirectory = joinPathFragments(__dirname, "files", preset);
  const projectRoot = joinPathFragments("packages", normalized);
  generateFiles(tree, templateDirectory, projectRoot, {
    tmpl: "",
    name: normalized,
    className: variants.className,
    propertyName: variants.propertyName,
    constantName: variants.constantName,
    pipelineExt: "json",
  });
  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
