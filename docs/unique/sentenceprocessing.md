---
uuid: 77a0f2f2-06a6-4e0b-8fcb-a79eee68c51a
created_at: sentenceprocessing.md
filename: Sentence Processing
title: Sentence Processing
description: >-
  A TypeScript implementation for processing and speaking sentences with pauses
  for parenthetical elements. The code handles sentence splitting, cleaning, and
  adding appropriate pauses based on parenthetical content.
tags:
  - TypeScript
  - sentence processing
  - text-to-speech
  - parentheticals
  - pauses
  - speech synthesis
---
```typescript
function splitSentances(text: string) {
    const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
    return mergeShortFragments(cleaned);
}

const sentances: string[] = splitSentances(content);
console.log('sentances', sentances);
const finishedSentances = [];

const startTime = Date.now();
for (let sentance of sentances) {
	if (sentance.includes("(Silent.)")) {
		await sleep(Math.random() * 5000)
	} else {
		await this.speak(sentance.trim());
	}
	finishedSentances.push(sentance);
	if (this.isStopped) {
		this.isStopped = false;
		break;
	}
}

```
^ref-681a4ab2-1-0


 ^ref-681a4ab2-29-0
```typescript
const sentences: string[] = splitSentances(content);
console.log('sentences', sentences);
const finishedSentences = [];

const startTime = Date.now();
for (let sentence of sentences) {
	const parentheticals = extractParentheticals(sentence);

	if (parentheticals.length > 0) {
		for (const p of parentheticals) {
			const kind = classifyPause(p);
			const ms = estimatePauseDuration(p);

			console.log(`[Pause] (${kind}) "${p}" → sleeping ${ms}ms`);
			await sleep(ms);
		}
	} else {
		await this.speak(sentence.trim());
	}

	finishedSentences.push(sentence);

	if (this.isStopped) {
		this.isStopped = false;
		break;
	}
}

^ref-681a4ab2-29-0
```
