import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import test from "ava";

import { DEFAULT_OUTPUT_FILE_NAME, generateEcosystem } from "../ecosystem.js";

async function writeServiceEcosystem(
  rootDir: string,
  serviceName: string,
  contents: string,
): Promise<void> {
  const serviceDir = path.join(rootDir, serviceName);
  await mkdir(serviceDir, { recursive: true });
  await writeFile(
    path.join(serviceDir, "ecosystem.edn"),
    `${contents}\n`,
    "utf8",
  );
}

test("generateEcosystem aggregates apps from edn files", async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "shadow-conf-"));
  const inputDir = path.join(tmpDir, "input");
  await writeServiceEcosystem(
    inputDir,
    "service-a",
    '{:apps [{:name "service-a" :env {:NODE_ENV "production"}}]}',
  );
  await writeServiceEcosystem(
    inputDir,
    "service-b",
    '{:apps [{:name "service-b" :instances 2}]}',
  );
  const outputDir = path.join(tmpDir, "out");
  const { outputPath, apps, files } = await generateEcosystem({
    inputDir,
    outputDir,
  });
  const fileContents = await readFile(outputPath, "utf8");

  t.is(outputPath, path.join(outputDir, DEFAULT_OUTPUT_FILE_NAME));
  t.deepEqual(
    files.map((file) => path.relative(inputDir, file)),
    [
      path.join("service-a", "ecosystem.edn"),
      path.join("service-b", "ecosystem.edn"),
    ],
  );
  t.true(fileContents.includes('const dotenvModule = await import("dotenv");'));
  t.true(fileContents.includes("configDotenv();"));
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

  await writeServiceEcosystem(
    inputDir,
    "service",
    '{:apps [{:name "service" :cwd "./services/service" :script "./scripts/index.js" :watch ["./services/service" "./shared"] :env_file "./.env.local" :env {:CONFIG_PATH "./config" :PORT "8080"}}]}',
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
