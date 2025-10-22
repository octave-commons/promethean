import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import test from "ava";
import { Window } from "happy-dom";
import { sleep } from "@promethean/utils";

const setupDom = (): Window => {
  const win = new Window();
  const g = globalThis as unknown as {
    window: Window;
    document: Window["document"];
    HTMLElement: typeof win.HTMLElement;
    customElements: typeof win.customElements;
    Event: typeof win.Event;
    CustomEvent: typeof win.CustomEvent;
    Node: typeof win.Node;
    fetch?: typeof win.fetch;
  };
  g.window = win;
  g.document = win.document;
  g.HTMLElement = win.HTMLElement;
  g.customElements = win.customElements;
  g.Event = win.Event;
  g.CustomEvent = win.CustomEvent;
  g.Node = win.Node;
  return win;
};

test("file-tree emits selection events", async (t) => {
  const win = setupDom();
  const tplPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../ui/templates/file-tree.html",
  );
  const template = readFileSync(tplPath, "utf8");
  const tree = { dir: ".", tree: [{ type: "file", name: "a.md" }] };
  win.fetch = async (url: string) => {
    if (url.includes("/ui/templates/file-tree.html")) {
      return new win.Response(template);
    }
    if (url.startsWith("/api/files")) {
      return new win.Response(JSON.stringify(tree), {
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error("unknown fetch " + url);
  };
  const g = globalThis as unknown as { fetch?: typeof win.fetch };
  const origFetch = g.fetch;
  g.fetch = win.fetch.bind(win);
  await import("../file-tree.js");
  const el = document.createElement("file-tree");
  document.body.appendChild(el);
  await sleep(0);
  const root = (el.shadowRoot as ShadowRoot).getElementById(
    "selAll",
  ) as HTMLButtonElement;
  const selections: string[][] = [];
  win.addEventListener("piper:files-changed", (ev) => {
    selections.push(
      (ev as unknown as CustomEvent<readonly string[]>).detail.slice(),
    );
  });
  root.click();
  t.deepEqual(selections[0], ["./a.md"]);
  g.fetch = origFetch as typeof win.fetch;
});
