import test from "ava";
import { renderSelectedMarkdown } from "../js/render.js";
import { setSelection } from "../js/selection.js";

function makeEl() {
  return { value: "", innerHTML: "", textContent: "" } as any;
}

test("renderSelectedMarkdown handles no selection and successful render", async (t) => {
  const els: Record<string, any> = {
    dir: makeEl(),
    mdInfo: makeEl(),
    mdRender: makeEl(),
  };
  els.dir.value = "/docs";
  (globalThis as any).document = { getElementById: (id: string) => els[id] };
  (globalThis as any).marked = {
    parse: (md: string) => `<h1>${md.replace(/^#\s*/, "")}</h1>`,
  };
  (globalThis as any).fetch = async (url: string) => ({
    ok: true,
    text: async () => "# Hello",
  });

  setSelection([]);
  await renderSelectedMarkdown();
  t.regex(els.mdInfo.textContent, /No file selected/i);

  setSelection(["/docs/file.md"]);
  await renderSelectedMarkdown();
  t.is(els.mdInfo.textContent, "Rendering: /docs/file.md");
  t.is(els.mdRender.innerHTML, "<h1>Hello</h1>");
});
