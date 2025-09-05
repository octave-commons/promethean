import test from "ava";
import { setSelection, getSelection } from "../ui/js/selection.js";

test("setSelection stores a copy, exposes legacy global, and emits event", (t) => {
  let received = null;
  global.window = {
    docopsSelection: undefined,
    dispatchEvent: (ev) => {
      received = ev;
    },
  };
  const src = ["/a.md", "/b.md"];
  setSelection(src);
  t.deepEqual(getSelection(), src);
  t.not(getSelection(), src, "returns a copy, not the original array");
  t.deepEqual(global.window.docopsSelection, src);
  t.truthy(received);
  t.is(received.type, "docops:selection-changed");
  t.deepEqual(received.detail, src);
});
