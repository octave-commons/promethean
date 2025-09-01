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
related_to_title:
  - Eidolon-Field-Optimization
  - homeostasis-decay-formulas
  - ripple-propagation-demo
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - EidolonField
related_to_uuid:
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
