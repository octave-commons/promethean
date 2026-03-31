---
```
uuid: 8ef6b79b-cc45-478e-bf3b-3d766da472c5
```
```
created_at: 2025.08.02.02.08.87.md
```
filename: seperate-speech-from-thought
```
description: >-
```
  A Lisp function that extracts speech from text by separating parenthetical
  phrases.
tags:
  - lisp
  - text-processing
  - speech-extraction
```
related_to_title:
```
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
```
related_to_uuid:
```
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
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
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [ai-first-os-model-context-protocol]
- [balanced-bst]

## Sources
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 3, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 1, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 3, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 1, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 3, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 1, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
