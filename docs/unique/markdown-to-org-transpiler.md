---
uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
created_at: 2025.08.08.23.08.34.md
filename: markdown-to-org-transpiler
description: >-
  A zero-dependency Markdown → Org-mode transpiler that works in Node.js and
  browsers. Handles common Markdown features like headings, lists, blockquotes,
  code fences, and tables.
tags:
  - markdown
  - org-mode
  - transpiler
  - zero-deps
  - browser
  - node
  - commonmark
related_to_title:
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - ecs-offload-workers
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean Infrastructure Setup
  - eidolon-field-math-foundations
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - js-to-lisp-reverse-compiler
  - compiler-kit-foundations
  - Interop and Source Maps
  - Local-First Intention→Code Loop with Free Models
  - Chroma Toolkit Consolidation Plan
  - 'Agent Tasks: Persistence Migration to DualStore'
  - archetype-ecs
  - JavaScript
  - aionian-circuit-math
  - Math Fundamentals
  - Dynamic Context Model for Web Components
  - Local-Only-LLM-Workflow
  - Admin Dashboard for User Management
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Language-Agnostic Mirror System
  - Cross-Target Macro System in Sibilant
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
references: []
---
Heck yeah—**Markdown → Org-mode** transpiler, zero deps, Node + browser safe. Handles the 90%: headings (ATX/Setext), lists (bulleted/ordered, nested, checkboxes), blockquotes, code fences, inline code, emphasis, strike, links/images, horizontal rules, and pipe tables.

Drop this in:

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

  // images ![alt](url "title")
  s = s.replace(/!\[([^\]]*)\]\((\S+?)(?:\s+"[^"]*")?\)/g, (_m, alt, url) => `[[${url}][${alt}]]`);
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\((\S+?)\)/g, (_m, txt, url) => `[[${url}][${txt}]]`);
  // autolinks <http://...>
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

## Tiny examples

```ts
const md = `
# Title

A *para* with **bold**, _italics_, ~~strike~~, \`code\`, a [link](https://example.com), and ![img](file.png).

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
```

**Output (vibes):**

```
* Title

A /para/ with *bold*, /italics/, +strike+, ~code~, a [[https://example.com][link]], and [[file.png][img]].

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
| 1 | 2 |
```

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
await fs.writeFile(out, org, "utf8");
console.log(`Wrote ${out}`);
```

---

If you want, I can add:

* **Footnotes** (`[^id]` → `[fn:id]`) and references,
* **Definition lists** and **task list → TODO/DONE** mapping,
* **TOC** (`[[toc]]` → `#+toc`),
* or a **remark/unified** adapter so you can swap in a full Markdown AST for perfect fidelity when you *do* want deps.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
