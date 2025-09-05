---
uuid: 2018f7fc-1182-434c-a1a2-6c405513dd7f
created_at: seperate-speech-from-thought.md
filename: seperate-speech-from-thought
title: seperate-speech-from-thought
description: >-
  A Lisp function that extracts speech from text by identifying and processing
  parenthetical phrases.
tags:
  - lisp
  - text-processing
  - speech-extraction
related_to_uuid:
  - 8f1782ee-a75f-4c9e-acb7-3f744ad2c952
related_to_title:
  - Optimizing Command Limitations in System Design
references:
  - uuid: 8f1782ee-a75f-4c9e-acb7-3f744ad2c952
    line: 1
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
```
