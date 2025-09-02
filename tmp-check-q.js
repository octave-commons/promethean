import { Level } from "level";
const location = ".cache/docops.level";
const root = new Level(location, { valueEncoding: "json" });
const q = root.sublevel("q", { valueEncoding: "json" });
const chunks = root.sublevel("chunks", { valueEncoding: "json" });
const docs = root.sublevel("docs", { valueEncoding: "json" });
await root.open();
let qCount = 0,
  hitsTotal = 0,
  ge01 = 0,
  max = 0;
for await (const [k, v] of q.iterator()) {
  qCount++;
  const hs = v || [];
  for (const h of hs) {
    hitsTotal++;
    if (h.score > max) max = h.score;
    if ((h.score ?? 0) >= 0.1) ge01++;
  }
}
let chunkDocs = 0,
  chunkCount = 0;
for await (const [doc, arr] of chunks.iterator()) {
  chunkDocs++;
  chunkCount += (arr || []).length;
}
let docCount = 0;
for await (const _ of docs.iterator()) {
  docCount++;
}
console.log(
  JSON.stringify(
    { qKeys: qCount, hitsTotal, ge01, max, chunkDocs, chunkCount, docCount },
    null,
    2,
  ),
);
await root.close();
