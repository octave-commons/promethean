import * as path from "path";
import { promises as fs } from "fs";

import test from "ava";

function dist(pathFromPkg: string) {
  const PKG = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "dist",
  );
  return path.join(PKG, pathFromPkg);
}

test.serial(
  "piper-step module defines element and contains Run button markup",
  async (t) => {
    const js = await fs.readFile(
      dist("frontend/components/piper-step.js"),
      "utf8",
    );
    t.true(js.includes('customElements.define("piper-step"'));
    t.true(js.includes('<button id="runBtn">Run</button>'));
  },
);
