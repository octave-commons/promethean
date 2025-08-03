import test from "ava";
// @ts-ignore
import { getFormatCommand } from "../src/index.js";

test("python files use black", (t) => {
  const cmd = getFormatCommand("foo/bar.py");
  t.deepEqual(cmd, ["black", ["foo/bar.py"]]);
});

test("typescript files use prettier", (t) => {
  const cmd = getFormatCommand("foo/baz.ts");
  t.deepEqual(cmd, ["npx", ["prettier", "--write", "foo/baz.ts"]]);
});

test("unsupported files return null", (t) => {
  const cmd = getFormatCommand("foo/data.txt");
  t.is(cmd, null);
});
