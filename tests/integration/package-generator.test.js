import test from "ava";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing.js";
import { readJson } from "@nx/devkit";
import generator from "../../tools/generators/package/index.js";

const exists = (tree, path) => tree.exists(path);

test("scaffolds docops-style package", async (t) => {
  const tree = createTreeWithEmptyWorkspace();
  await generator(tree, { name: "demo" });
  t.true(exists(tree, "packages/demo/package.json"));
  t.true(exists(tree, "packages/demo/tsconfig.json"));
  t.true(exists(tree, "packages/demo/ava.config.mjs"));
  t.true(exists(tree, "packages/demo/pipelines.json"));
  const pipeline = readJson(tree, "packages/demo/pipelines.json");
  t.is(pipeline.pipelines[0].name, "demo");
  t.is(pipeline.pipelines[0].steps[0].shell, 'echo "running demo pipeline"');
  t.true(exists(tree, "packages/demo/project.json"));
  t.true(exists(tree, "packages/demo/src/tests/sample.test.ts"));
  const pkg = readJson(tree, "packages/demo/package.json");
  t.is(pkg.name, "@promethean/demo");
  const pipelines = readJson(tree, "packages/demo/pipelines.json");
  t.is(pipelines.pipelines[0].name, "demo");
});

test("does not copy fastify preset when preset not selected", async (t) => {
  const tree = createTreeWithEmptyWorkspace();
  await generator(tree, { name: "demo" });
  t.false(exists(tree, "packages/demo/fastify-service/package.json"));
  t.false(exists(tree, "packages/demo/fastify-service/project.json"));
});

test("copies fastify preset when selected", async (t) => {
  const tree = createTreeWithEmptyWorkspace();
  await generator(tree, { name: "demo", preset: "fastify-service" });
  t.true(exists(tree, "packages/demo/package.json"));
  t.true(exists(tree, "packages/demo/src/index.ts"));
  t.true(exists(tree, "packages/demo/src/tests/server.test.ts"));
});
