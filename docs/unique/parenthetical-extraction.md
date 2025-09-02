---
uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
created_at: 2025.08.01.22.08.42.md
filename: parenthetical-extraction
description: >-
  Extracts parenthetical phrases from text using regex and classifies pauses
  into silence, ambient, introspective, or narrative types with duration
  estimation.
tags:
  - regex
  - text processing
  - pause classification
  - duration estimation
  - parentheticals
related_to_title: []
related_to_uuid: []
references: []
---

# Extract parens
```typescript
function extractParentheticals(text: string): string[] {
	const matches = [...text.matchAll(/$([^)]+)$/g)];
	return matches.map((m) => m[1].trim());
}

function classifyPause(phrase: string): 'silence' | 'ambient' | 'introspective' | 'narrative' | 'unknown' {
	const lc = phrase.toLowerCase();
	if (lc.includes('silence') || lc.includes('pause')) return 'silence';
	if (lc.includes('hum') || lc.includes('fan') || lc.includes('noise') || lc.includes('background')) return 'ambient';
	if (lc.includes('thought') || lc.includes('introspective') || lc.includes('considering')) return 'introspective';
	if (lc.includes('sigh') || lc.includes('murmur') || lc.includes('drawn') || lc.includes('drift')) return 'narrative';
	return 'unknown';
}

function estimatePauseDuration(phrase: string): number {
	const base = 1000; // base duration in ms
	const len = phrase.length;
	return base + Math.min(len * 40, 8000); // caps around 8s
}

function main():void {

const x = "I have a thing with a paren in it. (it's here.)"
console.log(extractParentheticals(x));
}

```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [EidolonField](eidolonfield.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Simple Log Example](simple-log-example.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [SentenceProcessing](sentenceprocessing.md)
- [refactor-relations](refactor-relations.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [seperate-speech-from-thought](seperate-speech-from-thought.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
## Sources
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.8)
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.7)
- [seperate-speech-from-thought — L2](seperate-speech-from-thought.md#^ref-8ef6b79b-2-0) (line 2, col 0, score 0.7)
- [SentenceProcessing — L1](sentenceprocessing.md#^ref-681a4ab2-1-0) (line 1, col 0, score 0.68)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.64)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.66)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.65)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.64)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.71)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.63)
- [Eidolon-Field-Optimization — L32](eidolon-field-optimization.md#^ref-40e05c14-32-0) (line 32, col 0, score 0.63)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.7)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.79)
- [Promethean Agent DSL TS Scaffold — L817](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-817-0) (line 817, col 0, score 0.78)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.67)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.72)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.68)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.69)
- [ripple-propagation-demo — L36](ripple-propagation-demo.md#^ref-8430617b-36-0) (line 36, col 0, score 0.68)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.67)
- [ripple-propagation-demo — L23](ripple-propagation-demo.md#^ref-8430617b-23-0) (line 23, col 0, score 0.67)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
