import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
} from "@nx/devkit";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PRESET = "ts-lib";
const TEMPLATE_ROOT = joinPathFragments(__dirname, "files");

const toTitle = (value) =>
  value
    .replace(/[-_]/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const selectTemplateDirectory = (preset) =>
  joinPathFragments(TEMPLATE_ROOT, preset ?? DEFAULT_PRESET);

const resolveTemplateDirectory = (preset) => {
  const templateDirectory = selectTemplateDirectory(preset);
  if (!existsSync(templateDirectory)) {
    throw new Error(
      `Unknown package preset "${preset}". Expected directory at ${templateDirectory}.`,
    );
  }
  return templateDirectory;
};

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
  const templateDirectory = resolveTemplateDirectory(schema.preset);

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
    preset: schema.preset ?? DEFAULT_PRESET,
  });
  if (!preset) {
    tree.delete(joinPathFragments(projectRoot, "fastify-service"));
  }

  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
