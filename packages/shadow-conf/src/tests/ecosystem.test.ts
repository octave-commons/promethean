import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import test from "ava";

import {
  DEFAULT_OUTPUT_FILE_NAME,
  generateEcosystem,
  type GenerateEcosystemResult,
} from "../ecosystem.js";

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

const serviceAEcosystem = `{:apps [{:name "service-a" :env {:NODE_ENV "production"}}]
  :triggers [{:name "service-a-ready" :event "service-a/ready" :actions ["notify"]}]
  :schedules [{:name "service-a-health" :cron "*/5 * * * *" :actions ["notify"]}]
  :actions [{:name "notify" :type "log" :message "service-a ready"}]}
`;

const serviceBEcosystem = `{:apps [{:name "service-b" :instances 2}]
  :triggers [{:name "service-b-ready" :event "service-b/ready"}]
  :schedules [{:name "service-b-restart" :cron "0 3 * * *" :actions ["restart"]}]
  :actions [{:name "restart" :type "pm2" :command "restart service-b"}]}
`;

const expectedAggregatedApps = [
  { name: "service-a", env: { NODE_ENV: "production" } },
  { name: "service-b", instances: 2 },
] as const;

const expectedAggregatedTriggers = [
  { name: "service-a-ready", event: "service-a/ready", actions: ["notify"] },
  { name: "service-b-ready", event: "service-b/ready" },
] as const;

const expectedAggregatedSchedules = [
  { name: "service-a-health", cron: "*/5 * * * *", actions: ["notify"] },
  { name: "service-b-restart", cron: "0 3 * * *", actions: ["restart"] },
] as const;

const expectedAggregatedActions = [
  { name: "notify", type: "log", message: "service-a ready" },
  { name: "restart", type: "pm2", command: "restart service-b" },
] as const;

type AggregatedResult = Pick<
  GenerateEcosystemResult,
  "apps" | "triggers" | "schedules" | "actions"
>;

test("generateEcosystem aggregates apps from edn files", async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "shadow-conf-"));
  const inputDir = path.join(tmpDir, "input");
  await Promise.all(
    ([
      ["service-a", serviceAEcosystem] as const,
      ["service-b", serviceBEcosystem] as const,
    ] satisfies readonly (readonly [string, string])[]).map(
      ([serviceName, contents]) =>
        writeServiceEcosystem(inputDir, serviceName, contents),
    ),
  );
  const outputDir = path.join(tmpDir, "out");
  const { outputPath, files, ...aggregated } = await generateEcosystem({
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
  t.deepEqual(aggregated, {
    apps: expectedAggregatedApps,
    triggers: expectedAggregatedTriggers,
    schedules: expectedAggregatedSchedules,
    actions: expectedAggregatedActions,
  });

  const moduleExports = (await import(
    pathToFileURL(outputPath).href,
  )) as AggregatedResult;
  const exportedData: AggregatedResult = {
    apps: moduleExports.apps,
    triggers: moduleExports.triggers,
    schedules: moduleExports.schedules,
    actions: moduleExports.actions,
  };

  t.deepEqual(exportedData, aggregated);
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
  const { apps, triggers, schedules, actions } = await generateEcosystem({
    inputDir,
    outputDir,
  });

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
  t.deepEqual(triggers, []);
  t.deepEqual(schedules, []);
  t.deepEqual(actions, []);
});
