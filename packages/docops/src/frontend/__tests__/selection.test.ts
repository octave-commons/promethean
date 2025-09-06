import test from "ava";
import { setSelection, getSelection } from "../js/selection.js";

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
