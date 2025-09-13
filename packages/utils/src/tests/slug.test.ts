import test from "ava";
import { slug } from "../slug.js";

test("slug basic rules", (t) => {
  t.is(slug(" Hello, World! "), "hello-world");
  t.is(slug("O'Reilly"), "o-reilly");
});
