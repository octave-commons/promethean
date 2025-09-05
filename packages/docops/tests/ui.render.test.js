import test from "ava";
import { renderSelectedMarkdown } from "../ui/js/render.js";
import { setSelection } from "../ui/js/selection.js";

function makeEl() {
  return { value: "", innerHTML: "", textContent: "" };
}

test("renderSelectedMarkdown handles no selection and successful render", async (t) => {
  // Minimal DOM stubs
  const els = {
    dir: makeEl(),
    mdInfo: makeEl(),
    mdRender: makeEl(),
  };
  els.dir.value = "/docs";
  global.document = {
    getElementById: (id) => els[id],
  };
  // Marked stub
  global.marked = { parse: (md) => `<h1>${md.replace(/^#\s*/, "")}</h1>` };
  // Fetch will be used by readFileText in api.js
  global.fetch = async (url) => ({ ok: true, text: async () => "# Hello" });

  // No selection -> info message
  setSelection([]);
  await renderSelectedMarkdown();
  t.regex(els.mdInfo.textContent, /No file selected/i);

  // With selection -> renders HTML
  setSelection(["/docs/file.md"]);
  await renderSelectedMarkdown();
  t.is(els.mdInfo.textContent, "Rendering: /docs/file.md");
  t.is(els.mdRender.innerHTML, "<h1>Hello</h1>");
});
