import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import test from "ava";

import { DEFAULT_OUTPUT_FILE_NAME, generateEcosystem } from "../ecosystem.js";

test("generateEcosystem aggregates apps from edn files", async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "shadow-conf-"));
  const inputDir = path.join(tmpDir, "input");

  const serviceADir = path.join(inputDir, "service-a");
  await mkdir(serviceADir, { recursive: true });
  await writeFile(
    path.join(serviceADir, "ecosystem.edn"),
    '{:apps [{:name "service-a" :env {:NODE_ENV "production"}}]}\n',
    "utf8",
  );

  const serviceBDir = path.join(inputDir, "service-b");
  await mkdir(serviceBDir, { recursive: true });
  await writeFile(
    path.join(serviceBDir, "ecosystem.edn"),
    '{:apps [{:name "service-b" :instances 2}]}\n',
    "utf8",
  );

  const outputDir = path.join(tmpDir, "out");
  const { outputPath, apps, files } = await generateEcosystem({
    inputDir,
    outputDir,
  });

  t.is(outputPath, path.join(outputDir, DEFAULT_OUTPUT_FILE_NAME));
  t.deepEqual(
    files.map((file) => path.relative(inputDir, file)),
    [
      path.join("service-a", "ecosystem.edn"),
      path.join("service-b", "ecosystem.edn"),
    ],
  );
  t.deepEqual(apps, [
    {
      name: "service-a",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "service-b",
      instances: 2,
    },
  ]);

  const importedModule = (await import(pathToFileURL(outputPath).href)) as {
    readonly apps: typeof apps;
  };
  t.deepEqual(importedModule.apps, apps);
});

test("generateEcosystem resolves relative paths against the output dir", async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "shadow-conf-"));
  const inputDir = path.join(tmpDir, "input");
  await mkdir(inputDir, { recursive: true });

  const serviceDir = path.join(inputDir, "service");
  await mkdir(serviceDir, { recursive: true });
  await writeFile(
    path.join(serviceDir, "ecosystem.edn"),
    '{:apps [{:name "service" :cwd "./services/service" :script "./scripts/index.js" :watch ["./services/service" "./shared"] :env_file "./.env.local" :env {:CONFIG_PATH "./config" :PORT "8080"}}]}\n',
    "utf8",
  );

  const outputDir = path.join(tmpDir, "out");
  const { apps } = await generateEcosystem({ inputDir, outputDir });

  t.like(apps[0], {
    cwd: "./services/service",
    script: "./scripts/index.js",
    env_file: "./.env.local",
  });

  t.deepEqual(apps[0]?.watch, ["./services/service", "./shared"]);

  t.deepEqual(apps[0]?.env, {
    CONFIG_PATH: "./config",
    PORT: "8080",
  });
});
