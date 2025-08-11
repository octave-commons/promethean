import { AVLTree } from "./bst";

describe("AVLTree", () => {
  test("basic operations", () => {
    const t = new AVLTree<number, string>();
    t.set(5, "e");
    t.set(2, "b");
    t.set(8, "h");
    t.set(3, "c");
    t.set(7, "g");

    expect(t.get(3)).toBe("c");
    expect(t.firstEntry()).toEqual([2, "b"]);
    expect(t.lastEntry()).toEqual([8, "h"]);
    expect(t.floor(6)).toEqual([5, "e"]);
    expect(t.ceil(6)).toEqual([7, "g"]);
    expect(t.rank(7)).toBe(3);
    expect(t.select(2)).toEqual([5, "e"]);
    expect([...t.range(3, 7)]).toEqual([
      [3, "c"],
      [5, "e"],
      [7, "g"],
    ]);
    expect([...t]).toEqual([
      [2, "b"],
      [3, "c"],
      [5, "e"],
      [7, "g"],
      [8, "h"],
    ]);
    t.validate();
  });
});
