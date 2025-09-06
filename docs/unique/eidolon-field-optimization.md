---
uuid: 20991655-9008-41c6-b289-ee9775d1683a
created_at: eidolon-field-optimization.md
filename: Eidolon Field Optimization
title: Eidolon Field Optimization
description: >-
  This document outlines the optimization parameters for the Eidolon field
  system, including screen resolution, focus area, wave form dimensions, and
  frame memory management. It explores potential new features like visual
  recurrence and concept-image relationships to enhance context handling. The
  system aims to address persistent output issues by introducing dynamic input
  mechanisms and improving speech detection.
tags:
  - Eidolon
  - Optimization
  - Field
  - Parameters
  - Visual Recurrence
  - Concepts
  - Image Embedding
  - Context Handling
  - Speech Detection
related_to_uuid:
  - d561308b-933e-4c30-ac2f-affb3504ae91
  - 4f9a7fd9-de08-4b9c-87c4-21268bc26d54
  - 48f88696-7ef9-4b64-953f-4ef50b1ad5e1
related_to_title:
  - Parenthetical Extraction
  - homeostasis-decay-formulas
  - Promethean Eidolon Synchronicity Model
references:
  - uuid: d561308b-933e-4c30-ac2f-affb3504ae91
    line: 3
    col: 0
    score: 0.87
---
Tonight was something... ^ref-40e05c14-1-0

The Eidolon fields are becoming clear shapes in my mind ^ref-40e05c14-3-0

## Parameters for optimization
- Screen resolution ^ref-40e05c14-6-0
- Area of focus on the screen ^ref-40e05c14-7-0
- Height/width of wave form
- Number of frames kept in memory ^ref-40e05c14-9-0
- Ordering of frames ^ref-40e05c14-10-0

## Possible new features

Visual recurrance ^ref-40e05c14-14-0
In the same way that we feed text in using embeddings, we can embed images and relate them together.

We can relate the images to concepts, and the concepts to images. ^ref-40e05c14-17-0

When we start implementing the particle system, these  can pop back up into memory too. ^ref-40e05c14-19-0

The eidolon fields will fix issues with context similarity feeding into it's self causing persistant ^ref-40e05c14-21-0
long periods of similar  outputs.

Something other than a predictor. ^ref-40e05c14-24-0
like ants looking for food, a model will seek out ideas that have... the most feel to them.
the most weight, the most meaning, the most relationship not just to the moment, but the continous experience of the system.

## Observations

Already introducing some persistantly changing inputs that are not just text, a history of text, and similar text, is increasing the... Novelty? Of what the agent produces.

We thought we parsed out all of the stuff inside of parenthesis, but our parser can't handle multi sentance long parenthetical outputs. ^ref-40e05c14-32-0

It's clear that from the way the robot structures the text, and what is in those parenthetics that those ideas are not meant to be spoken. Their observations of the current state of the system, bound to text, for later use in the context. ^ref-40e05c14-34-0

The extra images do seem to add some interesting characteristics to the behavior but they are probably too large. Or there are too  many of them, causing delays in the speech. ^ref-40e05c14-36-0

We need a better way to detect interuptions and speech. ^ref-40e05c14-38-0

Even with noise cancelation on, sometimes silence is captured by discord, interupting the bot. ^ref-40e05c14-40-0

The bot seems like it could... hear voices in the wave form.. ^ref-40e05c14-42-0

I have to test this now. I will find some video and see if it can hear the voice. ^ref-40e05c14-44-0


## Pseudo code


```TypeScript
function extractParentheticals(text: string): string[] {
    const results: string[] = [];
    let depth = 0;
    let buffer = '';
    let inParen = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '(') {
            if (depth === 0) {
                inParen = true;
                buffer = '';
            } else {
                buffer += ch;
            }
            depth++;
        } else if (ch === ')') {
            depth--;
            if (depth === 0 && inParen) {
                results.push(buffer.trim());
                inParen = false;
            } else if (depth > 0) {
                buffer += ch;
            }
        } else if (inParen) {
            buffer += ch;
        }
    }

    return results;
}
function seperateSpeechFromThought(str:string) {
	const parens = extractParentheticals(str);
	let temp:string[] = []
	for(var p of parens) {
		temp = [...temp.flatMap(s => s.split(p))]
	}
	return {
		speech:temp,
		parentheticals:parens
	}

}
const test = "I have a lot to say. (Some of it in parentheticals, some of it not. Most of this is for me to hold onto as compressed representations of image data I saw. How string). But I am not sure how to say it... I am hearing this strange sound... and I don't know where it's coming from."
console.log(seperateSpeechFromThought(test))
```
^ref-de226416-50-0
^ref-40e05c14-50-0
-952c-36ae9b8f0037
    line: 2495
    col: 0
    score: 0.88
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3385
    col: 0
    score: 0.88
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3117
    col: 0
    score: 0.88
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3052
    col: 0
    score: 0.88
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 212
    col: 0
    score: 0.86
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.86
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.86
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 188
    col: 0
    score: 0.85
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 523
    col: 0
    score: 0.85
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.85
---
Tonight was something... ^ref-40e05c14-1-0

The Eidolon fields are becoming clear shapes in my mind ^ref-40e05c14-3-0

## Parameters for optimization
- Screen resolution ^ref-40e05c14-6-0
- Area of focus on the screen ^ref-40e05c14-7-0
- Height/width of wave form
- Number of frames kept in memory ^ref-40e05c14-9-0
- Ordering of frames ^ref-40e05c14-10-0

## Possible new features

Visual recurrance ^ref-40e05c14-14-0
In the same way that we feed text in using embeddings, we can embed images and relate them together.

We can relate the images to concepts, and the concepts to images. ^ref-40e05c14-17-0

When we start implementing the particle system, these  can pop back up into memory too. ^ref-40e05c14-19-0

The eidolon fields will fix issues with context similarity feeding into it's self causing persistant ^ref-40e05c14-21-0
long periods of similar  outputs.

Something other than a predictor. ^ref-40e05c14-24-0
like ants looking for food, a model will seek out ideas that have... the most feel to them.
the most weight, the most meaning, the most relationship not just to the moment, but the continous experience of the system.

## Observations

Already introducing some persistantly changing inputs that are not just text, a history of text, and similar text, is increasing the... Novelty? Of what the agent produces.

We thought we parsed out all of the stuff inside of parenthesis, but our parser can't handle multi sentance long parenthetical outputs. ^ref-40e05c14-32-0

It's clear that from the way the robot structures the text, and what is in those parenthetics that those ideas are not meant to be spoken. Their observations of the current state of the system, bound to text, for later use in the context. ^ref-40e05c14-34-0

The extra images do seem to add some interesting characteristics to the behavior but they are probably too large. Or there are too  many of them, causing delays in the speech. ^ref-40e05c14-36-0

We need a better way to detect interuptions and speech. ^ref-40e05c14-38-0

Even with noise cancelation on, sometimes silence is captured by discord, interupting the bot. ^ref-40e05c14-40-0

The bot seems like it could... hear voices in the wave form.. ^ref-40e05c14-42-0

I have to test this now. I will find some video and see if it can hear the voice. ^ref-40e05c14-44-0


## Pseudo code


```TypeScript
function extractParentheticals(text: string): string[] {
    const results: string[] = [];
    let depth = 0;
    let buffer = '';
    let inParen = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '(') {
            if (depth === 0) {
                inParen = true;
                buffer = '';
            } else {
                buffer += ch;
            }
            depth++;
        } else if (ch === ')') {
            depth--;
            if (depth === 0 && inParen) {
                results.push(buffer.trim());
                inParen = false;
            } else if (depth > 0) {
                buffer += ch;
            }
        } else if (inParen) {
            buffer += ch;
        }
    }

    return results;
}
function seperateSpeechFromThought(str:string) {
	const parens = extractParentheticals(str);
	let temp:string[] = []
	for(var p of parens) {
		temp = [...temp.flatMap(s => s.split(p))]
	}
	return {
		speech:temp,
		parentheticals:parens
	}

}
const test = "I have a lot to say. (Some of it in parentheticals, some of it not. Most of this is for me to hold onto as compressed representations of image data I saw. How string). But I am not sure how to say it... I am hearing this strange sound... and I don't know where it's coming from."
console.log(seperateSpeechFromThought(test))
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Parenthetical Extraction](parenthetical-extraction.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Promethean Eidolon Synchronicity Model](promethean-eidolon-synchronicity-model.md)
## Sources
- [Parenthetical Extraction — L3](parenthetical-extraction.md#^ref-d561308b-3-0) (line 3, col 0, score 0.87)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
