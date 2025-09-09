import test from "ava";

import { setSelection, getSelection } from "../../frontend/selection.js";

test("setSelection stores a copy, exposes legacy global, and emits event", (t) => {
  let received: any = null;
  (globalThis as any).window = {
    docopsSelection: undefined,
    dispatchEvent: (ev: any) => {
      received = ev;
    },
  };
  const src = ["/a.md", "/b.md"];
  setSelection(src);
  t.deepEqual(getSelection(), src);
  t.not(getSelection(), src, "returns a copy, not the original array");
  t.deepEqual((globalThis as any).window.docopsSelection, src);
  t.truthy(received);
  t.is(received.type, "docops:selection-changed");
  t.deepEqual(received.detail, src);
});

// ---------------------------------------------------------------------------
// Unit tests for selection utilities
// Framework note:
// - Uses global describe/test/expect (works in Vitest and Jest).
// - Event tests auto-skip if no DOM/jsdom-like environment is available.
// ---------------------------------------------------------------------------

const __getTarget = () => ((globalThis as any).window ?? (globalThis as any));

const __supportsEvents = () => {
  const t = __getTarget();
  return (
    typeof t?.addEventListener === "function" &&
    typeof t?.removeEventListener === "function" &&
    typeof t?.dispatchEvent === "function" &&
    typeof (globalThis as any).CustomEvent === "function"
  );
};

describe("docops selection state", () => {
  beforeEach(() => {
    const t = __getTarget();
    // Reset snapshot between tests
    try {
      delete (t as any).docopsSelection;
    } catch {
      (t as any).docopsSelection = undefined;
    }
  });

  test("getSelection returns [] when uninitialized and returns a fresh copy each call", () => {
    const a = getSelection();
    expect(Array.isArray(a)).toBe(true);
    expect(a).toHaveLength(0);

    // Mutating returned copy must not affect internal state
    a.push("x");
    const b = getSelection();
    expect(b).toHaveLength(0);
    expect(b).not.toBe(a);
  });

  test("setSelection stores a cloned snapshot; modifying input later does not affect stored selection", () => {
    const input = ["a", "b"];
    setSelection(input);

    // Modify original array after setting
    input.push("c");

    const current = getSelection();
    expect(current).toEqual(["a", "b"]);
    expect(current).not.toBe(input);

    // Verify the underlying global snapshot mirrors the expected value
    const t = __getTarget();
    expect((t as any).docopsSelection).toEqual(["a", "b"]);
    expect((t as any).docopsSelection).not.toBe(input);
  });

  ( __supportsEvents() ? test : test.skip )(
    "dispatches 'docops:selection-changed' with a cloned detail payload",
    () => {
      const t = __getTarget();
      const seen: any[] = [];
      const handler = (ev: any) => {
        seen.push(ev?.detail);
      };
      t.addEventListener?.("docops:selection-changed", handler);

      const src = ["x", "y"];
      setSelection(src);

      // Event should have fired once with a cloned detail
      expect(seen).toHaveLength(1);
      const detail0 = seen[0];
      expect(detail0).toEqual(["x", "y"]);
      expect(detail0).not.toBe(src);

      // Mutating the event detail must not affect internal snapshot
      detail0.push("z");
      expect(getSelection()).toEqual(["x", "y"]);

      t.removeEventListener?.("docops:selection-changed", handler);
    }
  );

  test("handles invalid inputs safely (non-array coerces to empty) without throwing", () => {
    expect(() => setSelection(null as any)).not.toThrow();
    expect(getSelection()).toEqual([]);

    expect(() => setSelection(undefined as any)).not.toThrow();
    expect(getSelection()).toEqual([]);

    expect(() => setSelection({} as any)).not.toThrow();
    expect(getSelection()).toEqual([]);
  });

  ( __supportsEvents() ? test : test.skip )(
    "ignores dispatch errors gracefully (try/catch around dispatchEvent)",
    () => {
      const t = __getTarget();
      const original = t.dispatchEvent;
      // Replace dispatchEvent to simulate a runtime failure
      t.dispatchEvent = () => { throw new Error("boom"); };

      expect(() => setSelection(["ok"])).not.toThrow();
      expect(getSelection()).toEqual(["ok"]);

      // Restore
      t.dispatchEvent = original;
    }
  );

  test("subsequent calls overwrite previous snapshot", () => {
    setSelection(["a"]);
    expect(getSelection()).toEqual(["a"]);

    setSelection(["b", "c"]);
    expect(getSelection()).toEqual(["b", "c"]);
  });

  test("getSelection returns a new array instance on each call (immutability of return value)", () => {
    setSelection(["d"]);
    const s1 = getSelection();
    const s2 = getSelection();
    expect(s1).toEqual(["d"]);
    expect(s2).toEqual(["d"]);
    expect(s1).not.toBe(s2);

    s1.push("e");
    expect(getSelection()).toEqual(["d"]);
    expect(s2).toEqual(["d"]);
  });

  test("supports empty arrays and unusual string values", () => {
    setSelection([]);
    expect(getSelection()).toEqual([]);

    setSelection(["", " ", "🔥", "dup", "dup"]);
    expect(getSelection()).toEqual(["", " ", "🔥", "dup", "dup"]);
  });

  test("does not share reference with internal snapshot when reading via getSelection", () => {
    setSelection(["alpha"]);
    const first = getSelection();
    first.push("beta");

    // Internal state remains unchanged
    expect(getSelection()).toEqual(["alpha"]);
  });
});
