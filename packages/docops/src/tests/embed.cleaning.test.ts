import test from "ava";

import { parseMarkdownChunks } from "../utils.js";

// Mirror cleaning rules used in 02-embed.ts
const REF_HEADING_RE =
  /^(references|external links|see also|footnotes|sources|bibliography)$/i;
const LINK_DEF_RE = /^\s*\[[^\]]+\]:\s*\S+/; // [label]: url
const BARE_LINK_RE =
  /^(?:[-*+]\s*)?(?:<https?:\/\/\S+>|https?:\/\/\S+|\[[^\]]+\]\([^)]*\))\s*$/i;

type MiniChunk = { title?: string; text?: string };
function cleanChunkText(c: MiniChunk) {
  const title = c.title;
  if (title && REF_HEADING_RE.test(title.trim())) return "";
  const lines = (c.text || "").split("\n");
  const kept = lines.filter(
    (L: string) => !(LINK_DEF_RE.test(L) || BARE_LINK_RE.test(L.trim())),
  );
  return kept.join("\n").trim();
}

test("embed cleaning drops footer links and link definitions", (t) => {
  const md = [
    "# Title",
    "",
    "Main paragraph with some text.",
    "",
    "## References",
    "- https://example.com",
    "- [Site](https://example.org)",
    "",
    "[ref1]: https://foo.bar",
  ].join("\n");

  const chunks = parseMarkdownChunks(md);
  t.true(chunks.length >= 2);

  const main = chunks.find((c) => (c.text || "").includes("Main paragraph"));
  const refs = chunks.filter((c) => c.title === "References");

  t.truthy(main, "main paragraph chunk exists");
  t.true(refs.length > 0, "reference section chunks exist");

  // Main chunk is unaffected
  t.is(cleanChunkText(main!), main!.text.trim());

  // Every reference chunk should clean to empty
  for (const r of refs) {
    t.is(cleanChunkText(r), "");
  }

  // Link definition lines at end are also removed
  const linkDefs = chunks.filter((c) =>
    (c.text || "").includes("[ref1]: https://foo.bar"),
  );
  for (const c of linkDefs) {
    t.is(cleanChunkText(c), "");
  }
});
