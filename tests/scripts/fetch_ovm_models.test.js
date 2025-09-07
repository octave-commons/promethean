import test from "ava";
import { fetchOvmModels } from "../../scripts/fetch_ovm_models.mjs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const fileUrl = (path) => new URL(`file://${path}`);

test("fetchOvmModels reads default config", async (t) => {
  const models = await fetchOvmModels();
  t.deepEqual(models, ["whisper_tiny", "silero_vad", "resnet50"]);
});

test("fetchOvmModels reads provided config path", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "ovm-"));
  const configPath = join(dir, "ovm.json");
  await writeFile(
    configPath,
    JSON.stringify({ model_config_list: [{ config: { name: "custom" } }] }),
    "utf8",
  );
  const models = await fetchOvmModels(fileUrl(configPath));
  t.deepEqual(models, ["custom"]);
});
