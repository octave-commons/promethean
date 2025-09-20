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
  const variants = names(schema.name);
  const normalized = variants.fileName;
  const preset = schema.preset ?? DEFAULT_PRESET;
  const templateDirectory = resolveTemplateDirectory(preset);
  const projectRoot = joinPathFragments("packages", normalized);
  const serviceTitle = toTitle(normalized);

  generateFiles(tree, templateDirectory, projectRoot, {
    tmpl: "",
    name: normalized,
    className: variants.className,
    propertyName: variants.propertyName,
    constantName: variants.constantName,
    pipelineExt: "json",
    preset,
    serviceName: normalized,
    serviceTitle,
  });

  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
