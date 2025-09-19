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
    pipelineExt: "json",
    preset,
    serviceName: normalized.fileName,
    serviceTitle,
  });
  // templates include pipelines.json for DocOps-style pipelines
  await formatFiles(tree);
}
