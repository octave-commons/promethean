import test from "ava";
import { mkAliasRewriter } from "@promethean/naming";

test("re-exports naming", (t) => {
  t.is(typeof mkAliasRewriter, "function");
});
