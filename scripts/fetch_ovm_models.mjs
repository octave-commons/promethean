import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_CONFIG_URL = new URL("../config/ovm.json", import.meta.url);

export async function fetchOvmModels(configUrl = DEFAULT_CONFIG_URL) {
  const content = await readFile(configUrl, "utf8");
  const { model_config_list } = JSON.parse(content);
  return model_config_list.map(({ config }) => config.name);
}

const entryPoint = process.argv[1] ? path.resolve(process.argv[1]) : undefined;

if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
  const models = await fetchOvmModels();
  for (const name of models) {
    console.log(name);
  }
}
