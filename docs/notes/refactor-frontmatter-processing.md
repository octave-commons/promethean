---
$$
uuid: 3616c84d-e4ad-47c9-a206-06de43afb7f4
$$
$$
created_at: refactor-frontmatter-processing.md
$$
filename: Refactor Frontmatter Processing
title: Refactor Frontmatter Processing
$$
description: >-
$$
  Refactors the frontmatter processing logic to use Ollama JS library and
  LevelDB for key-value storage, reducing complexity and improving immutability
  while avoiding loops and favoring functional style.
tags:
  - refactor
  - frontmatter
  - ollama
  - leveldb
  - immutability
  - functional
  - promises
$$
related_to_uuid:
$$
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
$$
related_to_title:
$$
  - refactor-relations
  - Refactor 05-footers.ts
  - ecs-scheduler-and-prefabs
  - SentenceProcessing
  - sibilant-meta-string-templating-runtime
  - Ghostly Smoke Interference
  - template-based-compilation
  - Event Bus Projections Architecture
  - State Snapshots API and Transactional Projector
  - Sibilant Meta-Prompt DSL
  - Matplotlib Animation with Async Execution
  - markdown-to-org-transpiler
  - Functional Refactor of TypeScript Document Processing
  - Local-First Intention→Code Loop with Free Models
  - Exception Layer Analysis
  - mystery-lisp-search-session
  - file-watcher-auth-fix
  - prom ui bootstrap
  - layer-1-uptime-diagrams
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - polymorphic-meta-programming-engine
  - Eidolon-Field-Optimization
  - Chroma-Embedding-Refactor
  - compiler-kit-foundations
  - Promethean Event Bus MVP v0.1
references:
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 3
    col: 0
    score: 0.97
  - uuid: 80d4d883-59f9-401b-8699-7a2723148b1e
    line: 3
    col: 0
    score: 0.97
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 6
    col: 0
    score: 0.9
  - uuid: 80d4d883-59f9-401b-8699-7a2723148b1e
    line: 6
    col: 0
    score: 0.9
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 8
    col: 0
    score: 0.89
  - uuid: 80d4d883-59f9-401b-8699-7a2723148b1e
    line: 8
    col: 0
    score: 0.89
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.87
  - uuid: 681a4ab2-8fef-4833-a09d-bceb62d114da
    line: 30
    col: 0
    score: 0.86
---
Refactor 01-frontmatter.ts under the following contraints: ^ref-cfbdca2f-1-0

1. Use the ollama js library ^ref-cfbdca2f-3-0
2. use level db for kv store instead of json objects ^ref-cfbdca2f-4-0
$$
3. reduce complexity ^ref-cfbdca2f-5-0
$$
$$
4. prefer functional style ^ref-cfbdca2f-6-0
$$
$$
5. prefer immutability ^ref-cfbdca2f-7-0
$$
$$
6. avoid loops ^ref-cfbdca2f-8-0
$$
7. prefer then/catch methods when handling errors with promises. ^ref-cfbdca2f-9-0

```typescript
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { parseArgs, listFilesRec, randomUUID } from "./utils";
import type { Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--gen-model": "qwen3:4b",
  "--dry-run": "false",
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const GEN_MODEL = args["--gen-model"];
const DRY = args["--dry-run"] === "true";

const GenSchema = z.object({
  filename: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

async function ollamaGenerateJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" }),
  });
  const data = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  const cleaned = raw.replace(/```$$
json\s*/g, "").replace(/
$$```\s*$/g, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  for (const f of files) {
    const originalName = path.basename(f);
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm: Front = (gm.data || {}) as Front;

    let changed = false;
    if (!fm.uuid) { fm.uuid = randomUUID(); changed = true; }
    if (!fm.created_at) { fm.created_at = originalName; changed = true; }

    const missing: Array<keyof z.infer<typeof GenSchema>> = [];
    if (!fm.filename) missing.push("filename");
    if (!fm.description) missing.push("description");
    if (!fm.tags || fm.tags.length === 0) missing.push("tags");

    if (missing.length) {
      const preview = gm.content.slice(0, 4000);
      let current: Partial<z.infer<typeof GenSchema>> = {};
      for (let round = 0; round < 3 && missing.length; round++) {
        const ask = [...missing];
        const sys = `Return ONLY JSON with keys: ${ask.join(", ")}. filename: human title (no ext), description: 1-3 sentences, tags: 3-12 keywords.`;
        const payload = `SYSTEM:\n${sys}\n\nUSER:\nPath: ${f}\nExisting: ${JSON.stringify({ filename: fm.filename ?? null, description: fm.description ?? null, tags: fm.tags ?? null })}\nPreview:\n${preview}`;
        let obj: any;
        try { obj = await ollamaGenerateJSON(GEN_MODEL, payload); } catch { break; }
        const shape: any = {};
        if (ask.includes("filename")) shape.filename = z.string().min(1);
        if (ask.includes("description")) shape.description = z.string().min(1);
        if (ask.includes("tags")) shape.tags = z.array(z.string()).min(1);
        const Partial = z.object(shape);
        const parsed = Partial.safeParse(obj);
        if (parsed.success) {
          current = { ...current, ...parsed.data };
          for (const k of ask) if ((current as any)[k]) missing.splice(missing.indexOf(k), 1);
        }
      }
      if (!fm.filename && current.filename) { fm.filename = current.filename; changed = true; }
      if (!fm.description && current.description) { fm.description = current.description; changed = true; }
      if ((!fm.tags || fm.tags.length === 0) && current.tags) { fm.tags = Array.from(new Set(current.tags)); changed = true; }
    }

    if (changed && !DRY) {
      const out = matter.stringify(gm.content, fm, { language: "yaml" });
      await fs.writeFile(f, out, "utf-8");
    }
  }
  console.log("01-frontmatter: done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
```
$$
^ref-cfbdca2f-11-0
$$
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $refactor-relations$$refactor-relations.md$
- $Refactor 05-footers.ts$$refactor-05-footers-ts.md$
- $ecs-scheduler-and-prefabs$$ecs-scheduler-and-prefabs.md$
- [SentenceProcessing](sentenceprocessing.md)
- $sibilant-meta-string-templating-runtime$$sibilant-meta-string-templating-runtime.md$
- [Ghostly Smoke Interference]$ghostly-smoke-interference.md$
- $template-based-compilation$$template-based-compilation.md$
- [Event Bus Projections Architecture]$event-bus-projections-architecture.md$
- [State Snapshots API and Transactional Projector]$state-snapshots-api-and-transactional-projector.md$
- $Sibilant Meta-Prompt DSL$$sibilant-meta-prompt-dsl.md$
- [Matplotlib Animation with Async Execution]$matplotlib-animation-with-async-execution.md$
- $markdown-to-org-transpiler$$markdown-to-org-transpiler.md$
- [Functional Refactor of TypeScript Document Processing]$functional-refactor-of-typescript-document-processing.md$
- $Local-First Intention→Code Loop with Free Models$$local-first-intention-code-loop-with-free-models.md$
- [Exception Layer Analysis]$exception-layer-analysis.md$
- $mystery-lisp-search-session$$mystery-lisp-search-session.md$
- $file-watcher-auth-fix$$file-watcher-auth-fix.md$
- [prom ui bootstrap]$promethean-web-ui-setup.md$
- $layer-1-uptime-diagrams$$layer-1-uptime-diagrams.md$
- $Polyglot S-expr Bridge: Python-JS-Lisp Interop$$polyglot-s-expr-bridge-python-js-lisp-interop.md$
- $polymorphic-meta-programming-engine$$polymorphic-meta-programming-engine.md$
- $Eidolon-Field-Optimization$$eidolon-field-optimization.md$
- $Chroma-Embedding-Refactor$$chroma-embedding-refactor.md$
- $compiler-kit-foundations$$compiler-kit-foundations.md$
- [Promethean Event Bus MVP v0.1]$promethean-event-bus-mvp-v0-1.md$
## Sources
- $refactor-relations — L3$$refactor-relations.md#^ref-41ce0216-3-0$ (line 3, col 0, score 0.97)
- $Refactor 05-footers.ts — L3$$refactor-05-footers-ts.md#^ref-80d4d883-3-0$ (line 3, col 0, score 0.97)
- $refactor-relations — L6$$refactor-relations.md#^ref-41ce0216-6-0$ (line 6, col 0, score 0.9)
- $Refactor 05-footers.ts — L6$$refactor-05-footers-ts.md#^ref-80d4d883-6-0$ (line 6, col 0, score 0.9)
- $refactor-relations — L8$$refactor-relations.md#^ref-41ce0216-8-0$ (line 8, col 0, score 0.89)
- $Refactor 05-footers.ts — L8$$refactor-05-footers-ts.md#^ref-80d4d883-8-0$ (line 8, col 0, score 0.89)
- $ecs-scheduler-and-prefabs — L379$$ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0$ (line 379, col 0, score 0.87)
- [SentenceProcessing — L30]$sentenceprocessing.md#^ref-681a4ab2-30-0$ (line 30, col 0, score 0.86)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
