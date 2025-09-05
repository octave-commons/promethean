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
