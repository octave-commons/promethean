import { readFile } from "node:fs/promises";

const DEFAULT_CONFIG_URL = new URL("../config/ovm.json", import.meta.url);

export async function fetchOvmModels(configUrl = DEFAULT_CONFIG_URL) {
  const content = await readFile(configUrl, "utf8");
  const { model_config_list } = JSON.parse(content);
  return model_config_list.map(({ config }) => config.name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const models = await fetchOvmModels();
  for (const name of models) {
    console.log(name);
  }
}
