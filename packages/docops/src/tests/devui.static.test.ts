import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

const PKG_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
);

async function read(file: string) {
  return fs.readFile(file, "utf8");
}

test.serial("dev-ui serves index + js with correct prefixes", async (t) => {
  const distDevUi = path.join(PKG_ROOT, "dist", "dev-ui.js");
  const uiIndex = path.join(PKG_ROOT, "ui", "index.html");

  const hasAssets = await Promise.all([
    fs
      .stat(distDevUi)
      .then(() => true)
      .catch(() => false),
    fs
      .stat(uiIndex)
      .then(() => true)
      .catch(() => false),
  ]);
  if (!hasAssets.every(Boolean)) {
    t.pass();
    return;
  }

  const [devUiJs, indexHtml] = await Promise.all([
    read(distDevUi),
    read(uiIndex),
  ]);

  // index should load frontend app from /js
  t.regex(indexHtml, /<script[^>]+type="module"[^>]+src="\/js\/main\.js"/);

  // server should mount UI under /ui and JS under /js
  t.true(/prefix:\s*"\/ui"/.test(devUiJs), "UI static mount uses /ui prefix");
  t.true(/prefix:\s*"\/js"/.test(devUiJs), "JS static mount uses /js prefix");

  // ensure we don't redecorate sendFile on the JS mount
  const jsMountMatch = devUiJs.match(
    /register\([^,]+,\s*\{[^}]*prefix:\s*"\/js"[\s\S]*?\}/,
  );
  t.truthy(jsMountMatch, "found /js static registration");
  t.true(
    /decorateReply:\s*false/.test(jsMountMatch![0]),
    "JS mount disables decorateReply",
  );
});
