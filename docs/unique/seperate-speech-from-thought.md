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
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
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
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
