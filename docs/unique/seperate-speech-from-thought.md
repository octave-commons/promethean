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
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [parenthetical-extraction](parenthetical-extraction.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [refactor-relations](refactor-relations.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Simple Log Example](simple-log-example.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
## Sources
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.81)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.7)
- [parenthetical-extraction — L3](parenthetical-extraction.md#^ref-51a4e477-3-0) (line 3, col 0, score 0.63)
- [SentenceProcessing — L1](sentenceprocessing.md#^ref-681a4ab2-1-0) (line 1, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L817](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-817-0) (line 817, col 0, score 0.66)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.64)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.63)
- [Eidolon-Field-Optimization — L32](eidolon-field-optimization.md#^ref-40e05c14-32-0) (line 32, col 0, score 0.63)
- [Eidolon-Field-Optimization — L34](eidolon-field-optimization.md#^ref-40e05c14-34-0) (line 34, col 0, score 0.63)
- [homeostasis-decay-formulas — L173](homeostasis-decay-formulas.md#^ref-37b5d236-173-0) (line 173, col 0, score 0.63)
- [ripple-propagation-demo — L126](ripple-propagation-demo.md#^ref-8430617b-126-0) (line 126, col 0, score 0.63)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
