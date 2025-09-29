import test from "ava";

import { slug } from "../slug.js";

test("slug basic rules", (t) => {
  t.is(slug(" Hello, World! "), "hello-world");
  t.is(slug("O'Reilly"), "o-reilly");
});

test("slug collapses consecutive separators", (t) => {
  t.is(slug("A___B---C"), "a-b-c");
});

test("slug trims leading and trailing separators", (t) => {
  t.is(slug("***Promethean***"), "promethean");
  t.is(slug("***"), "");
});

test("slug keeps digits", (t) => {
  t.is(slug(" Version 2.0 "), "version-2-0");
});
