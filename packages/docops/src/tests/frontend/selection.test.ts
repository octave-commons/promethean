import test from "ava";

import { setSelection, getSelection } from "../../frontend/selection.js";
test.afterEach.always(() => {
  delete (globalThis as any).window;
});

test.serial("setSelection stores a copy, exposes legacy global, and emits event", (t) => {
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





















































































































































    expect(getSelection()).toEqual(["alpha"]);
  });
});

/*
Note: Using AVA as the testing library and framework (aligned with existing tests).
These tests extend coverage for frontend/selection by verifying:
- getSelection returns defensive copies on every call
- setSelection does not mutate inputs and is resilient to external mutations
- Proper event dispatch semantics and payloads
- Behavior when window or dispatchEvent are absent
- Handling of empty selections
*/

test.serial("getSelection returns a fresh array on each call (defensive copy)", (t) => {
  const events: any[] = [];
  (globalThis as any).window = {
    docopsSelection: undefined,
    dispatchEvent: (ev: any) => events.push(ev),
  };

  const src = ["/a.md", "/b.md"];
  setSelection(src);

  const first = getSelection();
  const second = getSelection();

  t.deepEqual(first, src);
  t.deepEqual(second, src);
  t.not(first, second, "each call returns a new array instance");
  t.not(first, src, "returned array must not be the original input instance");
  t.truthy(events[0], "an event should be dispatched on initial set");
  t.is(events[0].type, "docops:selection-changed");
  t.deepEqual(events[0].detail, src, "event detail matches selection contents");
  t.not(events[0].detail, src, "event detail should also be a copy, not the original reference");
});

test.serial("setSelection does not mutate input and later input mutations do not affect stored state", (t) => {
  const events: any[] = [];
  (globalThis as any).window = {
    docopsSelection: undefined,
    dispatchEvent: (ev: any) => events.push(ev),
  };

  const src = ["/a.md", "/b.md"];
  const snapshot = [...src];
  setSelection(src);

  // Mutate the original array after calling setSelection
  src.push("/c.md");

  // Stored state must reflect the original contents, not the mutated input
  t.deepEqual(getSelection(), snapshot, "stored selection should not change when the input is later mutated");
  t.deepEqual((globalThis as any).window.docopsSelection, snapshot, "legacy global should reflect stored state, not mutated input");
  t.is(events.length, 1, "exactly one event for the single setSelection call");
});

test.serial("setSelection emits an event for each change with correct payloads", (t) => {
  const events: any[] = [];
  (globalThis as any).window = {
    docopsSelection: undefined,
    dispatchEvent: (ev: any) => events.push(ev),
  };

  const firstSel = ["/a.md"];
  const secondSel = ["/a.md", "/b.md"];
  setSelection(firstSel);
  setSelection(secondSel);

  t.is(events.length, 2, "two distinct selection updates should emit two events");

  t.is(events[0].type, "docops:selection-changed");
  t.deepEqual(events[0].detail, firstSel);
  t.not(events[0].detail, firstSel, "first event detail should be a copy");

  t.is(events[1].type, "docops:selection-changed");
  t.deepEqual(events[1].detail, secondSel);
  t.not(events[1].detail, secondSel, "second event detail should be a copy");

  t.deepEqual((globalThis as any).window.docopsSelection, secondSel, "legacy global updates to latest selection");
});

test.serial("setSelection tolerates missing window and missing dispatchEvent", (t) => {
  // Case 1: No window at all
  delete (globalThis as any).window;
  const sel1 = ["/x.md"];
  t.notThrows(() => setSelection(sel1), "should not throw when window is undefined");
  t.deepEqual(getSelection(), sel1, "selection still stored without window");

  // Case 2: Window exists but dispatchEvent is missing
  (globalThis as any).window = {}; // no dispatchEvent
  const sel2 = ["/y.md"];
  t.notThrows(() => setSelection(sel2), "should not throw when window.dispatchEvent is missing");
  t.deepEqual(getSelection(), sel2, "selection stored successfully without dispatchEvent");
  t.deepEqual((globalThis as any).window.docopsSelection, sel2, "legacy global is still written when window exists");
});

test.serial("handles empty selection array consistently", (t) => {
  const events: any[] = [];
  (globalThis as any).window = {
    docopsSelection: undefined,
    dispatchEvent: (ev: any) => events.push(ev),
  };

  const empty: string[] = [];
  setSelection(empty);

  t.deepEqual(getSelection(), empty, "empty selection is stored and retrievable");
  t.deepEqual((globalThis as any).window.docopsSelection, empty, "legacy global mirrors empty selection");
  t.true(events.length >= 1, "an event should be emitted on set");
  t.is(events[events.length - 1].type, "docops:selection-changed");
  t.deepEqual(events[events.length - 1].detail, empty, "event payload for empty selection is []");
  t.not(events[events.length - 1].detail, empty, "event payload should be a copy, not the original empty array");
});
