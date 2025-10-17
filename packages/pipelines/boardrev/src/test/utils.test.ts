import test from "ava";
import { cosine, parseArgs } from "@promethean/utils";

test("parseArgs merges defaults and argv", (t) => {
  const prev = process.argv;
  process.argv = ["node", "script", "--foo", "bar"];
  const args = parseArgs({ "--foo": "baz", "--a": "1" });
  t.is(args["--foo"], "bar");
  t.is(args["--a"], "1");
  process.argv = prev;
});

test("cosine computes similarity", (t) => {
  t.is(cosine([1, 0], [0, 1]), 0);
  t.true(Math.abs(cosine([1, 1], [1, 1]) - 1) < 1e-9);
});
