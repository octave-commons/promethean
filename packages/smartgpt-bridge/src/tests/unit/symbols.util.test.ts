// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from "ava";
import path from "node:path";
import { symbolsIndex, symbolsFind } from "../../symbols.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

test("symbols: indexes small TS fixtures and finds Greeter class", async (t) => {
  const info = await symbolsIndex(ROOT, { paths: ["**/*.ts"] });
  t.true(info.files >= 1);
  const res = await symbolsFind("Greeter", { kind: "class" });
  t.true(res.some((r) => r.name === "Greeter" && r.path.endsWith("hello.ts")));
});

test("symbols: tolerates broken TS file without crashing", async (t) => {
  await symbolsIndex(ROOT, { paths: ["broken.ts"] });
  const res = await symbolsFind("Broken", { kind: "class" });
  // May or may not be found, but should not throw and returns array
  t.true(Array.isArray(res));
});
