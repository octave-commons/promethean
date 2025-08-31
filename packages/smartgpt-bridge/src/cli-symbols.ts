// @ts-nocheck
import { symbolsIndex } from "./symbols.js";
const ROOT_PATH = process.env.ROOT_PATH;
if (!ROOT_PATH) {
  console.error("Set ROOT_PATH");
  process.exit(1);
}
const info = await symbolsIndex(ROOT_PATH, {});
console.log(JSON.stringify({ ok: true, info }, null, 2));
