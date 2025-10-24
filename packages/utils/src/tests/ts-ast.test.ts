import test from "ava";
import ts from "typescript";
import { getJsDocText, getNodeText, posToLine } from "@promethean-os/utils";

test("posToLine returns 1-based line numbers", (t) => {
  const src = "a\n b";
  const sf = ts.createSourceFile("x.ts", src, ts.ScriptTarget.ES2022, true);
  const pos = src.indexOf("b");
  t.is(posToLine(sf, pos), 2);
});

test("getJsDocText extracts jsdoc comments", (t) => {
  const src = "/** hi */\nfunction foo() {}";
  const sf = ts.createSourceFile("x.ts", src, ts.ScriptTarget.ES2022, true);
  const node = sf.statements[0] as ts.FunctionDeclaration;
  t.is(getJsDocText(node), "hi");
});

test("getNodeText slices source", (t) => {
  const src = "function foo() {}";
  const sf = ts.createSourceFile("x.ts", src, ts.ScriptTarget.ES2022, true);
  const node = sf.statements[0]!;
  t.is(getNodeText(src, node), src);
});
