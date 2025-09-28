import test from "ava";

import { symbolsIndex, symbolsFind } from "../../symbols.js";
import { FIXTURES_ROOT } from "../helpers/fixtures.js";

const ROOT = FIXTURES_ROOT;

test.serial(
  "symbols: indexes small TS fixtures and finds Greeter class",
  async (t) => {
    const info = await symbolsIndex(ROOT, { paths: ["**/*.ts"] });
    t.true(info.files >= 1);
    const res = await symbolsFind("Greeter", { kind: "class" });
    t.true(
      res.some((r) => r.name === "Greeter" && r.path.endsWith("hello.ts")),
    );
  },
);

test.serial("symbols: tolerates broken TS file without crashing", async (t) => {
  await symbolsIndex(ROOT, { paths: ["broken.ts"] });
  const res = await symbolsFind("Broken", { kind: "class" });
  // May or may not be found, but should not throw and returns array
  t.true(Array.isArray(res));
});
