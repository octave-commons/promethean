import test from "ava";
import { mkAliasRewriter } from "@promethean/naming";

test("re-exports naming", (t) => {
  t.is(typeof mkAliasRewriter, "function");
});

test("alias-rewrite re-exports from naming", async (t) => {
  const mod = await import("@promethean/alias-rewrite");
  t.is(typeof (mod as any).mkAliasRewriter, "function");
});
