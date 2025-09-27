import test from "ava";
import type { ReadonlyDeep } from "type-fest";

type UtilsModule = typeof import("../utils.js");

const utilsHref = new URL("../utils.js", import.meta.url).href;
const importUtils = async (): Promise<ReadonlyDeep<UtilsModule>> =>
  import(
    `${utilsHref}?v=${Date.now()}-${Math.random().toString(36).slice(2)}`
  ).then((mod) => mod as ReadonlyDeep<UtilsModule>);

test.serial("parseArgs merges CLI flags with defaults", async (t) => {
  const { parseArgs } = await importUtils();
  const result = parseArgs(
    {
      "--project": "",
      "--toggle": "false",
      "--unchanged": "default",
    },
    ["node", "script", "--project", "demo", "--toggle", "--unchanged", "value"],
  );

  t.deepEqual(result, {
    "--project": "demo",
    "--toggle": "true",
    "--unchanged": "value",
  });
});

test.serial(
  "severityToPriority maps severities to priority levels",
  async (t) => {
    const { severityToPriority } = await importUtils();

    t.is(severityToPriority("BLOCKER"), "P0");
    t.is(severityToPriority("CRITICAL"), "P1");
    t.is(severityToPriority("MAJOR"), "P2");
    t.is(severityToPriority("MINOR"), "P3");
    t.is(severityToPriority("INFO"), "P4");
    t.is(severityToPriority("UNKNOWN"), "P4");
  },
);

test.serial("pathPrefix trims to the requested depth", async (t) => {
  const { pathPrefix } = await importUtils();

  t.is(pathPrefix("a/b/c/d.ts"), "a/b");
  t.is(pathPrefix("a/b/c/d.ts", 3), "a/b/c");
  t.is(pathPrefix("single", 5), "single");
});

test.serial("authHeader requires SONAR_TOKEN", async (t) => {
  const { authHeader } = await importUtils();
  const error = t.throws(() => authHeader(""));
  t.is(error?.message, "SONAR_TOKEN env is required");
});

test.serial("authHeader encodes SONAR_TOKEN using basic auth", async (t) => {
  const { authHeader } = await importUtils();
  t.deepEqual(authHeader("secret"), { Authorization: "Basic c2VjcmV0Og==" });
});
