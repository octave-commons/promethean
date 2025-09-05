---
uuid: d561308b-933e-4c30-ac2f-affb3504ae91
created_at: parenthetical-extraction.md
filename: Parenthetical Extraction
title: Parenthetical Extraction
description: >-
  A TypeScript implementation for extracting parenthetical phrases from text and
  classifying pauses with their durations. The code includes functions to
  extract content within parentheses, classify pause types, and estimate pause
  durations based on phrase length.
tags:
  - TypeScript
  - text processing
  - parenthetical extraction
  - pause classification
  - duration estimation
related_to_uuid: []
related_to_title: []
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

```
hes.map((m) => m[1].trim());
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
