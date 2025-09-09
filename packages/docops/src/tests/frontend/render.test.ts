import test from "ava";

import { renderSelectedMarkdown } from "../../frontend/render.js";
import { setSelection } from "../../frontend/selection.js";

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
  (globalThis as any).fetch = async (_url: string) => ({
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












































































































































































































































    const mod = require("../../frontend/api.js");
    return (mod.readFileText as any);
  }
}
// Additional tests generated to improve coverage for renderSelectedMarkdown.
// Test framework: AVA
// These tests focus on edge cases and failure modes surfaced by recent changes.

import test from "ava";
import { renderSelectedMarkdown } from "../../frontend/render.js";
import { setSelection } from "../../frontend/selection.js";

function makeEl() {
  return { value: "", innerHTML: "", textContent: "" } as any;
}

function installDom(override: Partial<Record<string, any>> = {}) {
  const els: Record<string, any> = {
    dir: makeEl(),
    mdInfo: makeEl(),
    mdRender: makeEl(),
    ...override,
  };
  (globalThis as any).document = { getElementById: (id: string) => (els as any)[id] };
  return els;
}

test.serial("renderSelectedMarkdown handles non-OK fetch response (e.g., 404) gracefully", async (t) => {
  const els = installDom();
  els.dir.value = "/docs";
  (globalThis as any).marked = { parse: (md: string) => `<p>${md}</p>` };
  (globalThis as any).fetch = async (_url: string) => ({
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: async () => "not found",
  });

  setSelection(["/docs/missing.md"]);
  await renderSelectedMarkdown();

  // Expectations: Implementation-specific messaging; check it indicates failure somehow.
  t.regex(String(els.mdInfo.textContent), /(error|fail|cannot|not\s*found|status)/i);
  // On failure, no HTML should be rendered or should be empty.
  t.truthy(els.mdRender.innerHTML === "" || /error/i.test(String(els.mdRender.innerHTML)));
});

test.serial("renderSelectedMarkdown handles fetch rejection (network error)", async (t) => {
  const els = installDom();
  els.dir.value = "/docs";
  (globalThis as any).marked = { parse: (md: string) => `<p>${md}</p>` };
  (globalThis as any).fetch = async (_url: string) => {
    throw new Error("Network down");
  };

  setSelection(["/docs/file.md"]);
  await renderSelectedMarkdown();

  t.regex(String(els.mdInfo.textContent), /(network|error|fail)/i);
  t.truthy(els.mdRender.innerHTML === "" || /error/i.test(String(els.mdRender.innerHTML)));
});

test.serial("renderSelectedMarkdown handles marked.parse throwing", async (t) => {
  const els = installDom();
  els.dir.value = "/docs";
  (globalThis as any).marked = {
    parse: (_md: string) => {
      throw new Error("Marked failed");
    },
  };
  (globalThis as any).fetch = async (_url: string) => ({
    ok: true,
    text: async () => "# Title",
  });

  setSelection(["/docs/file.md"]);
  await renderSelectedMarkdown();

  t.regex(String(els.mdInfo.textContent), /(error|fail)/i);
  // Ensure we don't leave partial/unsafe HTML behind.
  t.is(els.mdRender.innerHTML, "");
});

test.serial("renderSelectedMarkdown uses the first selected file when multiple are provided", async (t) => {
  const els = installDom();
  els.dir.value = "/docs";
  (globalThis as any).marked = { parse: (md: string) => `<h1>${md.replace(/^#\\s*/, "")}</h1>` };
  const texts: Record<string, string> = {
    "/docs/a.md": "# A",
    "/docs/b.md": "# B",
  };
  (globalThis as any).fetch = async (url: string) => ({
    ok: true,
    text: async () => texts[url] ?? "# Unknown",
  });

  setSelection(["/docs/a.md", "/docs/b.md"]);
  await renderSelectedMarkdown();

  t.is(els.mdInfo.textContent, "Rendering: /docs/a.md");
  t.is(els.mdRender.innerHTML, "<h1>A</h1>");
});

test.serial("renderSelectedMarkdown respects directory prefix in composed fetch URL", async (t) => {
  const els = installDom();
  els.dir.value = "/docs/base";
  (globalThis as any).marked = { parse: (md: string) => `<h1>${md.replace(/^#\\s*/, "")}</h1>` };

  let requestedUrl = "";
  (globalThis as any).fetch = async (url: string) => {
    requestedUrl = url;
    return { ok: true, text: async () => "# Hello" };
  };

  setSelection(["/docs/base/guide.md"]);
  await renderSelectedMarkdown();

  t.regex(requestedUrl, /guide\.md$/);
  t.is(els.mdInfo.textContent, "Rendering: /docs/base/guide.md");
  t.is(els.mdRender.innerHTML, "<h1>Hello</h1>");
});

test.serial("renderSelectedMarkdown handles missing mdInfo or mdRender elements without throwing", async (t) => {
  const els = installDom({ mdInfo: undefined, mdRender: undefined });
  // When elements are missing, ensure function is resilient.
  (globalThis as any).marked = { parse: (md: string) => `<h1>${md.replace(/^#\\s*/, "")}</h1>` };
  (globalThis as any).fetch = async (_url: string) => ({ ok: true, text: async () => "# Hello" });

  // dir is still needed if implementation reads it; provide it.
  (globalThis as any).document.getElementById = (id: string) => {
    if (id === "dir") return makeEl();
    return (els as any)[id]; // undefined for missing elements
  };

  setSelection(["/docs/file.md"]);
  await t.notThrowsAsync(renderSelectedMarkdown as any);
});

test.serial("renderSelectedMarkdown clears previous content on subsequent renders", async (t) => {
  const els = installDom();
  els.dir.value = "/docs";
  (globalThis as any).marked = { parse: (md: string) => `<h1>${md.replace(/^#\\s*/, "")}</h1>` };
  (globalThis as any).fetch = async (_url: string) => ({ ok: true, text: async () => "# First" });

  setSelection(["/docs/first.md"]);
  await renderSelectedMarkdown();
  t.is(els.mdRender.innerHTML, "<h1>First</h1>");

  // Second render with different content
  (globalThis as any).fetch = async (_url: string) => ({ ok: true, text: async () => "# Second" });
  setSelection(["/docs/second.md"]);
  await renderSelectedMarkdown();
  t.is(els.mdRender.innerHTML, "<h1>Second</h1>");
});