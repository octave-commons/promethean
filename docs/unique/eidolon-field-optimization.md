---
uuid: de226416-562b-45ea-8cb3-e7e0e708a07c
created_at: eidolon-field-optimization.md
filename: Eidolon Field Optimization
title: Eidolon Field Optimization
description: >-
  This document outlines the optimization of eidolon fields for improved
  contextual understanding and memory retention. It details parameters for
  refining visual and temporal aspects of the system, along with potential new
  features like visual recurrence and concept-image relationships. The text also
  includes observations on handling multi-sentence parentheticals and detecting
  interruptions in speech.
tags:
  - eidolon
  - optimization
  - contextual
  - memory
  - visual
  - recurrence
  - concept
  - image
  - speech
  - interruption
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
