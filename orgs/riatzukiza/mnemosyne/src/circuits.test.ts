import test from "ava";

import { resolveAutoModels } from "./circuits.js";

test("resolveAutoModels falls back to GLM_MODEL for all circuits", (t) => {
  const models = resolveAutoModels({
    GLM_MODEL: "gpt-oss:20b",
  });

  t.is(models.c1, "gpt-oss:20b");
  t.is(models.c4, "gpt-oss:20b");
  t.is(models.c5, "gpt-oss:20b");
  t.is(models.c8, "gpt-oss:20b");
});

test("resolveAutoModels honors fast/deep auto model overrides", (t) => {
  const models = resolveAutoModels({
    CEPHALON_AUTO_MODEL_FAST: "qwen3.5:4b",
    CEPHALON_AUTO_MODEL_DEEP: "qwen3.5:32b",
  });

  t.is(models.c1, "qwen3.5:4b");
  t.is(models.c4, "qwen3.5:4b");
  t.is(models.c5, "qwen3.5:32b");
  t.is(models.c8, "qwen3.5:32b");
});

test("resolveAutoModels keeps per-circuit overrides highest priority", (t) => {
  const models = resolveAutoModels({
    GLM_MODEL: "gpt-oss:20b",
    CEPHALON_MODEL_C3: "openai/gpt-5.4-mini",
    CEPHALON_MODEL_C8: "openai/gpt-5.4",
  });

  t.is(models.c1, "gpt-oss:20b");
  t.is(models.c3, "openai/gpt-5.4-mini");
  t.is(models.c5, "gpt-oss:20b");
  t.is(models.c8, "openai/gpt-5.4");
});