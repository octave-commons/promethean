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
  const normalized = names(schema.name).fileName;
  const projectRoot = joinPathFragments("packages", normalized);
  const templateDirectory = resolveTemplateDirectory(schema.preset);

  generateFiles(tree, templateDirectory, projectRoot, {
    tmpl: "",
    name: normalized,
    pipelineExt: "json",
    preset: schema.preset ?? DEFAULT_PRESET,
  });

  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
