# Description

The current implementation of [[sprites.md]] does not support sprite sheets, only individual [[sprites.md]]. To animate them would require switching between different textures which may hurt performance
## Related Epics
- [[Graphics.md]]
## Requirements

- There is an implementation of [[sprites.md]] with a new shader that allows for a single image sprite sheet
- The performance of the implementation is better than implementing animations alternating between textures
- There is a benchmark that demsonstrates this

## Tasks 

- [ ] Write new shader
- [ ] write new component system
- [ ] write component system for multi texture sprite animations
- [ ] write benchmark for comparing all 3 implementations (generating images from vert pixels one at a time, the current way, and the new way)
## Blocked by 

{{BlockedBy}}

- Can't be worked on till this task is [[done.md]]
- blocking task
- blocking task

## Blocks

{{Blocks}}

- This task cannot be [[done.md]] until this one is [[done.md]].
- neither can this one
- or this one