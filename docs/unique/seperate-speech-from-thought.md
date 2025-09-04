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
related_to_title: []
related_to_uuid: []
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
```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
