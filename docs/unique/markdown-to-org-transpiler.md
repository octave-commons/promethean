---
uuid: 8dbe24fe-8fe5-41ef-a20b-feeb647a85d9
created_at: markdown-to-org-transpiler.md
filename: markdown-to-org-transpiler
title: markdown-to-org-transpiler
description: >-
  A zero-dependency transpiler that converts Markdown to Org-mode format,
  supporting common Markdown features like headings, lists, blockquotes, code
  fences, and tables. Works in both Node.js and browsers with minimal
  configuration.
tags:
  - markdown
  - org-mode
  - transpiler
  - zero-deps
  - browser
  - node
  - commonmark
---
Heck yeah—**Markdown → Org-mode** transpiler, zero deps, Node + browser safe. Handles the 90%: headings (ATX/Setext), lists (bulleted/ordered, nested, checkboxes), blockquotes, code fences, inline code, emphasis, strike, links/images, horizontal rules, and pipe tables. ^ref-ab54cdd8-1-0

Drop this in: ^ref-ab54cdd8-3-0

# `shared/js/prom-lib/text/md2org.ts`

````ts
// MIT. Zero deps. Node + browser.
// Markdown → Org-mode (CommonMark-ish subset).
// Handles: #/##/..., Setext headings, lists (nested, tasks), blockquotes,
// fences ```lang, inline code, **bold**/*italic*/~~strike~~, links/images,
// HR, and pipe tables.
//
// Usage:
//   import { mdToOrg } from "./md2org";
//   const org = mdToOrg(markdown, { hardWrap:false });

export interface Md2OrgOptions {
  hardWrap?: boolean;       // if true, preserve <br> line breaks inside paragraphs
}

export function mdToOrg(md: string, opts: Md2OrgOptions = {}): string {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  let inFence = false;
  let fenceLang = "";
  let inQuote = false;
  let inTable = false;
  let pendingSetext: { lineIdx: number; level: number } | null = null;

  // list stack: tracks indent -> marker
  const listStack: { indent: number; ordered: boolean }[] = [];

  const flushList = () => { listStack.length = 0; };
  const endQuote = () => { if (inQuote) { out.push("#+end_quote"); inQuote = false; } };
  const endFence = () => { if (inFence) { out.push("#+end_src"); inFence = false; fenceLang = ""; } };
  const endTable = () => { if (inTable) { inTable = false; } };

  while (i < lines.length) {
    let line = lines[i];

    // ---- Code fences ----
    const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})(\s*)(\S+)?\s*$/);
    if (fenceMatch) {
      endQuote(); endTable(); // no nesting
      if (!inFence) {
        inFence = true; fenceLang = (fenceMatch[4] || "").trim();
        out.push(`#+begin_src ${fenceLang}`.trim());
      } else {
        endFence();
      }
      i++; continue;
    }
    if (inFence) { out.push(line); i++; continue; }

    // ---- Horizontal rule ----
    if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})\s*$/.test(line)) {
      endQuote(); endTable(); flushList();
      out.push("-----"); i++; continue;
    }

    // ---- Setext heading lookahead ----
    if (!pendingSetext && i + 1 < lines.length) {
      const nxt = lines[i + 1];
      if (/^\s*===+\s*$/.test(nxt)) pendingSetext = { lineIdx: i, level: 1 };
      else if (/^\s*---+\s*$/.test(nxt)) pendingSetext = { lineIdx: i, level: 2 };
    }
    if (pendingSetext && pendingSetext.lineIdx === i) {
      endQuote(); endTable(); flushList();
      const text = inline(lines[i].trim(), opts);
      out.push(`${"*".repeat(pendingSetext.level)} ${text}`);
      i += 2; pendingSetext = null; continue;
    }

    // ---- ATX heading ----
    const atx = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atx) {
      endQuote(); endTable(); flushList();
      const level = Math.min(6, atx[1].length);
      out.push(`${"*".repeat(level)} ${inline(atx[2], opts)}`);
      i++; continue;
    }

    // ---- Blockquote (group contiguous) ----
    if (/^\s{0,3}>\s?/.test(line)) {
      if (!inQuote) { endTable(); out.push("#+begin_quote"); inQuote = true; }
      // Strip leading '>' (allow nested '>>')
      line = line.replace(/^\s{0,3}>\s?/, "");
      out.push(inline(line, opts));
      i++; 
      // keep consuming quote lines; loop naturally handles
      continue;
    } else {
      endQuote();
    }

    // ---- Tables (pipe) ----
    if (/^\s*\|.*\|\s*$/.test(line)) {
      endQuote(); flushList();
      inTable = true;
      // Header separator in MD: |---|---|  → Org hline: |---+---|
      if (/^\s*\|?\s*:?-{3,}.*\|\s*$/.test(line)) {
        const cols = countColumns(lines[i - 1] || line);
        out.push(makeOrgHline(cols));
      } else {
        out.push(normalizeTableRow(line));
      }
      i++; 
      // close table when next line isn't a table row
      if (i < lines.length && !/^\s*\|.*\|\s*$/.test(lines[i])) endTable();
      continue;
    } else {
      endTable();
    }

    // ---- Lists (bulleted / ordered / task) ----
    const list = line.match(/^(\s*)([*+\-]|\d+[.)])\s+(.*)$/);
    if (list) {
      const indent = list[1].replace(/\t/g, "    ").length;
      const marker = list[2];
      const text = list[3];

      // adjust stack
      while (listStack.length && indent < listStack[listStack.length - 1].indent) listStack.pop();
      if (!listStack.length || indent > listStack[listStack.length - 1].indent) {
        listStack.push({ indent, ordered: /^\d/.test(marker) });
      }

      const top = listStack[listStack.length - 1];
      const orgMarker = top.ordered ? "1." : "-";

      // task?
      const task = text.match(/^\[( |x|X)\]\s+(.*)$/);
      const body = task ? `[${task[1].toUpperCase()}] ${inline(task[2], opts)}` : inline(text, opts);

      out.push(`${" ".repeat(top.indent)}${orgMarker} ${body}`);
      i++; continue;
    } else {
      // leaving list context on blank or non-list
      if (/^\s*$/.test(line)) flushList();
    }

    // ---- Blank line ----
    if (/^\s*$/.test(line)) { out.push(""); i++; continue; }

    // ---- Paragraph (with hardWrap option for <br>) ----
    out.push(inline(line, opts));
    i++;
  }

  // close any open blocks
  endFence(); endQuote(); endTable(); flushList();

  return out.join("\n");
}

// ---------- helpers ----------

function inline(s: string, opts: Md2OrgOptions): string {
  if (s === "") return s;

  // protect code spans with sentinels
  const codes: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_m, g1) => {
    codes.push(g1);
    return `\u0001${codes.length - 1}\u0001`;
  });

  // images !alt
  s = s.replace(/!\[([^\]]*)\]\((\S+?)(?:\s+"[^"]*")?\)/g, (_m, alt, url) => `[[${url}][${alt}]]`);
  // links text
  s = s.replace(/\[([^\]]+)\]\((\S+?)\)/g, (_m, txt, url) => `[[${url}][${txt}]]`);
  // autolinks 
  s = s.replace(/<((?:https?|mailto):[^>]+)>/g, (_m, url) => `[[${url}]]`);

  // strikethrough ~~text~~ → +text+
  s = s.replace(/~~([^~]+)~~/g, (_m, g1) => `+${g1}+`);

  // bold **text** or __text__ → *text*
  s = s.replace(/\*\*([^\n*][\s\S]*?)\*\*/g, (_m, g1) => `*${g1}*`);
  s = s.replace(/__([^\n_][\s\S]*?)__/g, (_m, g1) => `*${g1}*`);

  // italics *text* or _text_ → /text/
  // try to avoid clobbering bold we just produced: use negative lookarounds
  s = s.replace(/(^|[^*])\*([^\s*][\s\S]*?)\*(?!\*)/g, (_m, pre, g1) => `${pre}/${g1}/`);
  s = s.replace(/(^|[^_])_([^\s_][\s\S]*?)_(?!_)/g, (_m, pre, g1) => `${pre}/${g1}/`);

  // line breaks
  if (!opts.hardWrap) {
    // collapse trailing two-spaces line break → Org needs explicit \\ or keep as is
    s = s.replace(/ {2,}\n/g, "\\\\\n");
  }

  // restore code spans as ~code~
  s = s.replace(/\u0001(\d+)\u0001/g, (_m, idx) => `~${codes[Number(idx)]}~`);

  return s;
}

function countColumns(row: string): number {
  const cells = row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.length;
}
function makeOrgHline(cols: number): string {
  return "|" + Array.from({ length: cols }, () => "---").join("+") + "|";
}
function normalizeTableRow(line: string): string {
  // Ensure leading & trailing pipe, trim cells
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => " " + c.trim() + " ").join("|");
  return "|" + inner + "|";
}
````
^ref-ab54cdd8-7-0 ^ref-ab54cdd8-216-0

## Tiny examples
 ^ref-ab54cdd8-219-0
```ts
const md = `
# Title

A *para* with **bold**, _italics_, ~~strike~~, \`code\`, a link, and !img.

> quoted
> block

- [x] done
  - [ ] nested
1. item
2. item

\`\`\`ts
console.log("hi")
\`\`\`

| a | b |
|---|---|
| 1 | 2 |
`;

console.log(mdToOrg(md));
^ref-ab54cdd8-219-0
``` ^ref-ab54cdd8-245-0

**Output (vibes):** ^ref-ab54cdd8-247-0

```
* Title

A /para/ with *bold*, /italics/, +strike+, ~code~, a [[ and [[file.png][img]].

#+begin_quote
quoted
block
#+end_quote

- [X] done
  - [ ] nested
1. item
2. item

#+begin_src ts
console.log("hi")
#+end_src

| a | b |
|---+---|
^ref-ab54cdd8-247-0
| 1 | 2 |
```
^ref-ab54cdd8-272-0
 ^ref-ab54cdd8-273-0
## Bonus: CLI (Node)

```ts
// tools/md2org.mjs
import fs from "node:fs/promises";
import { mdToOrg } from "../shared/js/prom-lib/text/md2org.js";

const input = process.argv[2];
if (!input) { console.error("usage: node tools/md2org.mjs <file.md>"); process.exit(1); }
const md = await fs.readFile(input, "utf8");
const org = mdToOrg(md);
const out = input.replace(/\.md$/i, ".org");
^ref-ab54cdd8-273-0
await fs.writeFile(out, org, "utf8");
console.log(`Wrote ${out}`);
``` ^ref-ab54cdd8-289-0
 ^ref-ab54cdd8-291-0
--- ^ref-ab54cdd8-291-0
 ^ref-ab54cdd8-292-0 ^ref-ab54cdd8-293-0
If you want, I can add: ^ref-ab54cdd8-293-0
 ^ref-ab54cdd8-294-0
* **Footnotes** (`[^id]` → `[fn:id]`) and references,
* **Definition lists** and **task list → TODO/DONE** mapping, ^ref-ab54cdd8-297-0
* **TOC** (`[[toc]]` → `#+toc`), ^ref-ab54cdd8-297-0
* or a **remark/unified** adapter so you can swap in a full Markdown AST for perfect fidelity when you *do* want deps.
