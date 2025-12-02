---
```
uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
```
```
created_at: 2025.08.02.01.08.84.md
```
```
filename: Eidolon-Field-Optimization
```
```
description: >-
```
  Document detailing parameter adjustments for visual recurrence systems and
  addressing context handling in image-based AI models.
tags:
  - Eidolon
  - VisualRecurrence
  - ParameterOptimization
  - ContextHandling
  - ImageEmbedding
  - ParticleSystem
  - SpeechDetection
```
related_to_title:
```
  - parenthetical-extraction
  - homeostasis-decay-formulas
  - ripple-propagation-demo
  - aionian-circuit-math
  - Math Fundamentals
  - eidolon-field-math-foundations
  - field-dynamics-math-blocks
  - Eidolon Field Abstract Model
  - Simulation Demo
  - eidolon-node-lifecycle
  - field-node-diagram-outline
```
related_to_uuid:
```
  - 51a4e477-1013-4016-bb5a-bd9392e99ed7
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
references:
  - uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
    line: 3
    col: 1
    score: 0.87
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 126
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 126
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 3
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 11
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 11
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 199
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 199
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 114
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 114
    col: 3
    score: 1
---
Tonight was something...

The Eidolon fields are becoming clear shapes in my mind

## Parameters for optimization
- Screen resolution
- Area of focus on the screen
- Height/width of wave form
- Number of frames kept in memory
- Ordering of frames

## Possible new features

Visual recurrance
In the same way that we feed text in using embeddings, we can embed images and relate them together.

We can relate the images to concepts, and the concepts to images.

When we start implementing the particle system, these  can pop back up into memory too.

The eidolon fields will fix issues with context similarity feeding into it's self causing persistant
long periods of similar  outputs.

Something other than a predictor.
like ants looking for food, a model will seek out ideas that have... the most feel to them.
the most weight, the most meaning, the most relationship not just to the moment, but the continous experience of the system.

## Observations

Already introducing some persistantly changing inputs that are not just text, a history of text, and similar text, is increasing the... Novelty? Of what the agent produces.

We thought we parsed out all of the stuff inside of parenthesis, but our parser can't handle multi sentance long parenthetical outputs.

It's clear that from the way the robot structures the text, and what is in those parenthetics that those ideas are not meant to be spoken. Their observations of the current state of the system, bound to text, for later use in the context.

The extra images do seem to add some interesting characteristics to the behavior but they are probably too large. Or there are too  many of them, causing delays in the speech.

We need a better way to detect interuptions and speech.

Even with noise cancelation on, sometimes silence is captured by discord, interupting the bot.

The bot seems like it could... hear voices in the wave form..

I have to test this now. I will find some video and see if it can hear the voice.


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
- [parenthetical-extraction]
- [homeostasis-decay-formulas]
- [docs/unique/ripple-propagation-demo|ripple-propagation-demo]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [Math Fundamentals]chunks/math-fundamentals.md
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]
- [eidolon-field-abstract-model|Eidolon Field Abstract Model]
- [Simulation Demo]chunks/simulation-demo.md
- [eidolon-node-lifecycle]
- [field-node-diagram-outline]

## Sources
- [parenthetical-extraction#L3|parenthetical-extraction — L3] (line 3, col 1, score 0.87)
- [docs/unique/aionian-circuit-math#L152|aionian-circuit-math — L152] (line 152, col 1, score 1)
- [docs/unique/aionian-circuit-math#L152|aionian-circuit-math — L152] (line 152, col 3, score 1)
- [Math Fundamentals — L12]chunks/math-fundamentals.md#L12 (line 12, col 1, score 1)
- [Math Fundamentals — L12]chunks/math-fundamentals.md#L12 (line 12, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L126|eidolon-field-math-foundations — L126] (line 126, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L126|eidolon-field-math-foundations — L126] (line 126, col 3, score 1)
- [docs/unique/field-dynamics-math-blocks#L141|field-dynamics-math-blocks — L141] (line 141, col 1, score 1)
- [docs/unique/field-dynamics-math-blocks#L141|field-dynamics-math-blocks — L141] (line 141, col 3, score 1)
- [Simulation Demo — L11]chunks/simulation-demo.md#L11 (line 11, col 1, score 1)
- [Simulation Demo — L11]chunks/simulation-demo.md#L11 (line 11, col 3, score 1)
- [eidolon-field-abstract-model#L199|Eidolon Field Abstract Model — L199] (line 199, col 1, score 1)
- [eidolon-field-abstract-model#L199|Eidolon Field Abstract Model — L199] (line 199, col 3, score 1)
- [eidolon-node-lifecycle#L39|eidolon-node-lifecycle — L39] (line 39, col 1, score 1)
- [eidolon-node-lifecycle#L39|eidolon-node-lifecycle — L39] (line 39, col 3, score 1)
- [field-node-diagram-outline#L114|field-node-diagram-outline — L114] (line 114, col 1, score 1)
- [field-node-diagram-outline#L114|field-node-diagram-outline — L114] (line 114, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
