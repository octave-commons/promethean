/* eslint-disable functional/immutable-data */
import test from "ava";

import {
  canonicalHttpUrl,
  hostIsAllowed,
  resolveHttpHref,
} from "../helpers.js";

test.serial("helpers tolerate environments without URL.canParse", (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis.URL,
    "canParse",
  );

  if (descriptor !== undefined) {
    Object.defineProperty(globalThis.URL, "canParse", {
      ...descriptor,
      value: undefined,
    });
    t.teardown(() => {
      Object.defineProperty(globalThis.URL, "canParse", descriptor);
    });
  }

  t.false(hostIsAllowed(["example.com"], "nota url"));
  t.is(canonicalHttpUrl("nota url"), null);
  t.is(resolveHttpHref("https://example.com", "javascript:alert(1)"), null);
});
