import { tsToLisp } from "./ts2lisp";

test("transpiles TypeScript to Lisp", async () => {
  const src = "const x: number = 1 + 1;";
  const { lisp } = await tsToLisp(src);
  expect(lisp).toContain("(+ 1 1)");
});
