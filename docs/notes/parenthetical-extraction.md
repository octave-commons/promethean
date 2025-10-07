---
$$
uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
$$
$$
created_at: 2025.08.01.22.08.42.md
$$
$$
filename: parenthetical-extraction
$$
$$
description: >-
$$
  Extracts parenthetical phrases from text using regex and classifies pauses
  into silence, ambient, introspective, or narrative types with duration
  estimation.
tags:
  - regex
  - text processing
  - pause classification
  - duration estimation
  - parentheticals
$$
related_to_title:
$$
  - Eidolon-Field-Optimization
  - homeostasis-decay-formulas
  - ripple-propagation-demo
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - EidolonField
$$
related_to_uuid:
$$
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
references:
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 1
    score: 0.87
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 157
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 157
    col: 3
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 114
    col: 1
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 114
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 215
    col: 1
    score: 0.86
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 215
    col: 3
    score: 0.86
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 210
    col: 1
    score: 0.86
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 210
    col: 3
    score: 0.86
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

```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[eidolon-field-optimization]$
- $[homeostasis-decay-formulas]$
- $[docs/unique/ripple-propagation-demo|ripple-propagation-demo]$
- $[2d-sandbox-field]$
- $[eidolon-field-abstract-model|Eidolon Field Abstract Model]$
- [[eidolonfield]]

## Sources
- $[eidolon-field-optimization#L50|Eidolon-Field-Optimization — L50]$ (line 50, col 1, score 0.87)
- $[homeostasis-decay-formulas#L157|homeostasis-decay-formulas — L157]$ (line 157, col 1, score 1)
- $[homeostasis-decay-formulas#L157|homeostasis-decay-formulas — L157]$ (line 157, col 3, score 1)
- $[docs/unique/ripple-propagation-demo#L114|ripple-propagation-demo — L114]$ (line 114, col 1, score 1)
- $[docs/unique/ripple-propagation-demo#L114|ripple-propagation-demo — L114]$ (line 114, col 3, score 1)
- $[2d-sandbox-field#L215|2d-sandbox-field — L215]$ (line 215, col 1, score 0.86)
- $[2d-sandbox-field#L215|2d-sandbox-field — L215]$ (line 215, col 3, score 0.86)
- $[eidolon-field-abstract-model#L210|Eidolon Field Abstract Model — L210]$ (line 210, col 1, score 0.86)
- $[eidolon-field-abstract-model#L210|Eidolon Field Abstract Model — L210]$ (line 210, col 3, score 0.86)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
