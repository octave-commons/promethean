import test from 'ava';

import { setSelection, getSelection } from '../selection.js';

test.afterEach.always(() => {
  delete (globalThis as any).window;
});

test.serial('getSelection returns a defensive copy', (t) => {
  (globalThis as any).window = { dispatchEvent: () => {} };
  setSelection(['/a.md']);
  const a = getSelection() as string[];
  a.push('/b.md');
  t.deepEqual(getSelection(), ['/a.md']);
});

test.serial('setSelection emits event when window.dispatchEvent exists', (t) => {
  const events: any[] = [];
  (globalThis as any).window = {
    dispatchEvent: (ev: any) => events.push(ev),
  };
  const sel = ['/x.md'];
  setSelection(sel);
  t.deepEqual(getSelection(), sel);
  t.is(events[0].type, 'piper:selection-changed');
  t.deepEqual(events[0].detail, sel);
  t.not(events[0].detail, sel, 'event payload is a copy');
});

test.serial('setSelection tolerates missing dispatchEvent', (t) => {
  (globalThis as any).window = {};
  t.notThrows(() => setSelection(['/y.md']));
  t.deepEqual(getSelection(), ['/y.md']);
});
