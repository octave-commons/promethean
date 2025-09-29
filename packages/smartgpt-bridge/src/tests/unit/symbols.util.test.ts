import path from "node:path";

import test from "ava";

import { symbolsIndex, symbolsFind } from "../../symbols.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test.serial(
  "symbols: indexes small TS fixtures and finds Greeter class",
  async (t) => {
    const info = await symbolsIndex(ROOT, { paths: ["**/*.ts"] });
    t.true(info.files >= 1);
    const res = await symbolsFind("Greeter", {
      kind: "class",
      snapshot: info.snapshot,
    });
    t.true(
      res.some((r) => r.name === "Greeter" && r.path.endsWith("hello.ts")),
    );
  },
);

test.serial("symbols: tolerates broken TS file without crashing", async (t) => {
  const info = await symbolsIndex(ROOT, { paths: ["broken.ts"] });
  const res = await symbolsFind("Broken", {
    kind: "class",
    snapshot: info.snapshot,
  });
  // May or may not be found, but should not throw and returns array
  t.true(Array.isArray(res));
});
