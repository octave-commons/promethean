import {
  generateFiles,
  joinPathFragments,
  names,
  formatFiles,
} from "@nx/devkit";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const toTitle = (value) =>
  value
    .replace(/[-_]/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export default async function generator(tree, schema) {
/*<<<<<<< codex/create-fastify-service-generator-template
  const normalized = names(schema.name);
  const projectRoot = joinPathFragments("packages", normalized.fileName);
  const preset = schema.preset === "fastify-service" ? schema.preset : null;
  const templateDir = preset
    ? joinPathFragments(__dirname, "files", preset)
    : joinPathFragments(__dirname, "files");
  const serviceTitle = toTitle(normalized.fileName);
  generateFiles(tree, templateDir, projectRoot, {
    tmpl: "",
    name: normalized.fileName,
    className: normalized.className,
    propertyName: normalized.propertyName,
    constantName: normalized.constantName,
=======*/
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
// >>>>>>> main
    pipelineExt: "json",
    preset,
    serviceName: normalized.fileName,
    serviceTitle,
  });
  if (!preset) {
    tree.delete(joinPathFragments(projectRoot, "fastify-service"));
  }
  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
