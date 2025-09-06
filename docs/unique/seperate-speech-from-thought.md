---
uuid: 7e11391e-fd77-4e80-b1dc-fa6ed1f50431
created_at: seperate-speech-from-thought.md
filename: seperate-speech-from-thought
title: seperate-speech-from-thought
description: >-
  A Lisp function that extracts speech from text by identifying and processing
  parenthetical expressions.
tags:
  - lisp
  - text-processing
  - speech-extraction
related_to_uuid: []
related_to_title: []
references: []
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
```
s})
			
)
```
])
	(for-each p parenthics
		(assign temp [
			...(.map temp (=> (s)  (.split s)))
			]) )
	(return {speech:temp, parenthetics})
			
)
```
s})
			
)
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
