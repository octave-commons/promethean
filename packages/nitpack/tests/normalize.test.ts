import test from "ava";

import { normalizeComments } from "../src/text.js";

test("normalize strips code fences and paths", (t) => {
  const input = [
    'Please add .js suffix in imports from "./foo" in packages/x/src/a.ts:12.```ts\nimport x from "./bar"\n```',
  ];
  const got = normalizeComments(input);
  t.is(got.length, 1);
  t.true(got[0]?.includes(".js suffix"));
  t.false(got[0]?.includes("```"));
  t.false(/packages\/x\/src\/a\.ts/.test(got[0] ?? ""));
});

test("handles ~~~ fences and Windows paths", (t) => {
  const input = ["See C:\\proj\\a.ts:5~~~ts\nconsole.log()\n~~~"];
  const got = normalizeComments(input);
  t.is(got.length, 1);
  t.false(got[0]?.includes("~~~"));
  t.false(/C:\\proj\\a\.ts/.test(got[0] ?? ""));
});
