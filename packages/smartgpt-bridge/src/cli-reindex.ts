// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { reindexAll } from "./indexer.js";
const ROOT_PATH = process.env.ROOT_PATH;
if (!ROOT_PATH) {
  console.error("Set ROOT_PATH");
  process.exit(1);
}
const limit = Number(process.env.LIMIT || 0);
const r = await reindexAll(ROOT_PATH, { limit });
console.log(JSON.stringify({ ok: true, ...r }, null, 2));
