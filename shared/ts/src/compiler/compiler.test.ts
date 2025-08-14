import { compileAndRun } from "./driver";

test("compiles and runs basic program", () => {
  const src = "let x = 2 + 3 in if x > 3 then x*10 else 0";
  const result = compileAndRun(src);
  expect(result.out).toBe(50);
});
