import { runLisp } from "./driver";

test("basic arithmetic", () => {
  expect(runLisp("(+ 2 40)")).toBe(42);
});

test("macro expansion", () => {
  const src = `
    (defmacro twice (x)
      \`(+ ,x ,x))
    (twice 21)
  `;
  expect(runLisp(src)).toBe(42);
});
