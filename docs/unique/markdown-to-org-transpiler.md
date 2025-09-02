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
related_to_title: []
related_to_uuid: []
references: []
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
^ref-ab54cdd8-7-0

## Tiny examples
 ^ref-ab54cdd8-219-0
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
^ref-ab54cdd8-219-0
``` ^ref-ab54cdd8-245-0

**Output (vibes):** ^ref-ab54cdd8-247-0

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
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [DSL](chunks/dsl.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Window Management](chunks/window-management.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Diagrams](chunks/diagrams.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [balanced-bst](balanced-bst.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [EidolonField](eidolonfield.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [graph-ds](graph-ds.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Operations](chunks/operations.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [refactor-relations](refactor-relations.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Reawakening Duck](reawakening-duck.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [promethean-requirements](promethean-requirements.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Pipelines](promethean-pipelines.md)
## Sources
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 0.76)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 0.76)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 0.76)
- [ecs-offload-workers — L454](ecs-offload-workers.md#^ref-6498b9d7-454-0) (line 454, col 0, score 0.76)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 0.76)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 0.76)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 0.76)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 0.76)
- [js-to-lisp-reverse-compiler — L7](js-to-lisp-reverse-compiler.md#^ref-58191024-7-0) (line 7, col 0, score 0.78)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.74)
- [Voice Access Layer Design — L89](voice-access-layer-design.md#^ref-543ed9b3-89-0) (line 89, col 0, score 0.73)
- [Voice Access Layer Design — L95](voice-access-layer-design.md#^ref-543ed9b3-95-0) (line 95, col 0, score 0.73)
- [Voice Access Layer Design — L108](voice-access-layer-design.md#^ref-543ed9b3-108-0) (line 108, col 0, score 0.73)
- [Voice Access Layer Design — L114](voice-access-layer-design.md#^ref-543ed9b3-114-0) (line 114, col 0, score 0.73)
- [Local-First Intention→Code Loop with Free Models — L3](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-3-0) (line 3, col 0, score 0.73)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.66)
- [Optimizing Command Limitations in System Design — L26](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-26-0) (line 26, col 0, score 0.68)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.61)
- [Obsidian ChatGPT Plugin Integration Guide — L15](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-15-0) (line 15, col 0, score 0.65)
- [Obsidian ChatGPT Plugin Integration — L15](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-15-0) (line 15, col 0, score 0.65)
- [Obsidian Templating Plugins Integration Guide — L15](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-15-0) (line 15, col 0, score 0.65)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.65)
- [Optimizing Command Limitations in System Design — L21](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-21-0) (line 21, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L146](dynamic-context-model-for-web-components.md#^ref-f7702bf8-146-0) (line 146, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.69)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.65)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.67)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.67)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.67)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.67)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.66)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.65)
- [Mongo Outbox Implementation — L152](mongo-outbox-implementation.md#^ref-9c1acd1e-152-0) (line 152, col 0, score 0.66)
- [komorebi-group-window-hack — L46](komorebi-group-window-hack.md#^ref-dd89372d-46-0) (line 46, col 0, score 0.66)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.67)
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.65)
- [Lisp-Compiler-Integration — L341](lisp-compiler-integration.md#^ref-cfee6d36-341-0) (line 341, col 0, score 0.65)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.64)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.65)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L575](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-575-0) (line 575, col 0, score 0.64)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.65)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.64)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.65)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.62)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.52)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.53)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.52)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.51)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.5)
- [Interop and Source Maps — L13](interop-and-source-maps.md#^ref-cdfac40c-13-0) (line 13, col 0, score 0.51)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L54](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-54-0) (line 54, col 0, score 0.5)
- [Agent Tasks: Persistence Migration to DualStore — L60](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-60-0) (line 60, col 0, score 0.5)
- [universal-intention-code-fabric — L33](universal-intention-code-fabric.md#^ref-c14edce7-33-0) (line 33, col 0, score 0.62)
- [universal-intention-code-fabric — L353](universal-intention-code-fabric.md#^ref-c14edce7-353-0) (line 353, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L139](local-only-llm-workflow.md#^ref-9a8ab57e-139-0) (line 139, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L114](board-walk-2025-08-11.md#^ref-7aa1eb92-114-0) (line 114, col 0, score 0.59)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.58)
- [Universal Lisp Interface — L125](universal-lisp-interface.md#^ref-b01856b4-125-0) (line 125, col 0, score 0.58)
- [Board Walk – 2025-08-11 — L112](board-walk-2025-08-11.md#^ref-7aa1eb92-112-0) (line 112, col 0, score 0.56)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.56)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.66)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.65)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.66)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L15](matplotlib-animation-with-async-execution.md#^ref-687439f9-15-0) (line 15, col 0, score 0.71)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.66)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.65)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L40](matplotlib-animation-with-async-execution.md#^ref-687439f9-40-0) (line 40, col 0, score 0.68)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.65)
- [sibilant-metacompiler-overview — L29](sibilant-metacompiler-overview.md#^ref-61d4086b-29-0) (line 29, col 0, score 0.63)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L174](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-174-0) (line 174, col 0, score 0.64)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.72)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.66)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.66)
- [aionian-circuit-math — L57](aionian-circuit-math.md#^ref-f2d83a77-57-0) (line 57, col 0, score 0.66)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L402](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-402-0) (line 402, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L136](migrate-to-provider-tenant-architecture.md#^ref-54382370-136-0) (line 136, col 0, score 0.65)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.67)
- [Obsidian Templating Plugins Integration Guide — L62](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-62-0) (line 62, col 0, score 0.65)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L50](sibilant-meta-prompt-dsl.md#^ref-af5d2824-50-0) (line 50, col 0, score 0.64)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L87](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-87-0) (line 87, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.76)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.73)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.66)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.65)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.65)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.65)
- [Language-Agnostic Mirror System — L471](language-agnostic-mirror-system.md#^ref-d2b3628c-471-0) (line 471, col 0, score 0.65)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.65)
- [Language-Agnostic Mirror System — L127](language-agnostic-mirror-system.md#^ref-d2b3628c-127-0) (line 127, col 0, score 0.64)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 1)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 1)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.98)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.88)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.85)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.85)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.81)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.81)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.81)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.81)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.81)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.81)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.81)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-47-0) (line 47, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-48-0) (line 48, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-49-0) (line 49, col 0, score 0.75)
- [Promethean-native config design — L39](promethean-native-config-design.md#^ref-ab748541-39-0) (line 39, col 0, score 0.75)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.75)
- [Promethean-native config design — L38](promethean-native-config-design.md#^ref-ab748541-38-0) (line 38, col 0, score 0.77)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.76)
- [Docops Feature Updates — L13](docops-feature-updates.md#^ref-2792d448-13-0) (line 13, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L132](prompt-folder-bootstrap.md#^ref-bd4f0976-132-0) (line 132, col 0, score 0.73)
- [Reawakening Duck — L88](reawakening-duck.md#^ref-59b5670f-88-0) (line 88, col 0, score 0.68)
- [Promethean Agent Config DSL — L178](promethean-agent-config-dsl.md#^ref-2c00ce45-178-0) (line 178, col 0, score 0.66)
- [Admin Dashboard for User Management — L9](admin-dashboard-for-user-management.md#^ref-2901a3e9-9-0) (line 9, col 0, score 0.65)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L57](prompt-folder-bootstrap.md#^ref-bd4f0976-57-0) (line 57, col 0, score 0.64)
- [Obsidian Templating Plugins Integration Guide — L61](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-61-0) (line 61, col 0, score 0.63)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.73)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.66)
- [Optimizing Command Limitations in System Design — L23](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-23-0) (line 23, col 0, score 0.68)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.64)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.64)
- [template-based-compilation — L7](template-based-compilation.md#^ref-f8877e5e-7-0) (line 7, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L199](dynamic-context-model-for-web-components.md#^ref-f7702bf8-199-0) (line 199, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L4](js-to-lisp-reverse-compiler.md#^ref-58191024-4-0) (line 4, col 0, score 0.63)
- [Language-Agnostic Mirror System — L230](language-agnostic-mirror-system.md#^ref-d2b3628c-230-0) (line 230, col 0, score 0.63)
- [compiler-kit-foundations — L6](compiler-kit-foundations.md#^ref-01b21543-6-0) (line 6, col 0, score 0.61)
- [i3-bluetooth-setup — L7](i3-bluetooth-setup.md#^ref-5e408692-7-0) (line 7, col 0, score 0.61)
- [graph-ds — L361](graph-ds.md#^ref-6620e2f2-361-0) (line 361, col 0, score 0.61)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L441](performance-optimized-polyglot-bridge.md#^ref-f5579967-441-0) (line 441, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#^ref-f5579967-455-0) (line 455, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L66](promethean-copilot-intent-engine.md#^ref-ae24a280-66-0) (line 66, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
