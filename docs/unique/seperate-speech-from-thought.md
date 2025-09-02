---
uuid: 8ef6b79b-cc45-478e-bf3b-3d766da472c5
created_at: 2025.08.02.02.08.87.md
filename: seperate-speech-from-thought
description: >-
  A Lisp function that extracts speech from text by separating parenthetical
  phrases.
tags:
  - lisp
  - text-processing
  - speech-extraction
related_to_title:
  - archetype-ecs
related_to_uuid:
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
references:
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 7
    col: 0
    score: 1
---

```lisp
(def seperate-speech-from-thought (string)
	(const parenthetics (extract-parenthetics string))
	
	(var temp [string])
	(for-each p parenthics
		(assign temp [
			...(.map temp (=> (s)  (.split s)))
			]) )
	(return {speech:temp, parenthetics})
			
)
```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [archetype-ecs](archetype-ecs.md)
## Sources
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
