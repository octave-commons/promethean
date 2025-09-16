import { writeFile } from "fs/promises";
import { join, resolve } from "path";
import { openLevelCache } from "@promethean/level-cache";

const args = process.argv.slice(2);
const KEY = args[0];
const OUT = args[1];

if (!KEY) {
  console.error(
    "Usage: node scripts/dedupe-versions-plan.mjs <key> [out.json]",
  );
  process.exit(1);
}

const CACHE_PATH = join(process.cwd(), ".cache", "dedupe-versions");
const cache = await openLevelCache({ path: CACHE_PATH });
const plan = await cache.get(KEY);
await cache.close();

if (!plan) {
  console.error(`No plan found for key ${KEY}`);
  process.exit(1);
}

const json = JSON.stringify(plan, null, 2);
if (OUT) {
  await writeFile(resolve(OUT), json);
  console.log(`Wrote plan to ${OUT}`);
} else {
  console.log(json);
}
