---
uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
created_at: 2025.08.01.22.08.42.md
filename: parenthetical-extraction
description: >-
  Extracts parenthetical phrases from text using regex and classifies pauses
  into silence, ambient, introspective, or narrative types with duration
  estimation.
tags:
  - regex
  - text processing
  - pause classification
  - duration estimation
  - parentheticals
related_to_title:
  - pm2-orchestration-patterns
  - Promethean Event Bus MVP v0.1
  - Promethean-native config design
  - RAG UI Panel with Qdrant and PostgREST
  - Recursive Prompt Construction Engine
  - set-assignment-in-lisp-ast
  - State Snapshots API and Transactional Projector
  - System Scheduler with Resource-Aware DAG
  - universal-intention-code-fabric
  - Vectorial Exception Descent
  - eidolon-field-math-foundations
  - Eidolon Field Abstract Model
  - Reawakening Duck
  - Ice Box Reorganization
  - heartbeat-fragment-demo
  - ParticleSimulationWithCanvasAndFFmpeg
  - Fnord Tracer Protocol
  - Optimizing Command Limitations in System Design
  - Promethean Infrastructure Setup
  - Dynamic Context Model for Web Components
  - Chroma Toolkit Consolidation Plan
  - 'Agent Tasks: Persistence Migration to DualStore'
  - DSL
  - Window Management
  - Model Selection for Lightweight Conversational Tasks
  - TypeScript Patch for Tool Calling Support
  - Migrate to Provider-Tenant Architecture
  - The Jar of Echoes
  - field-interaction-equations
  - graph-ds
  - plan-update-confirmation
related_to_uuid:
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 54382370-1931-4a19-a634-46735708a9ea
  - 18138627-a348-4fbb-b447-410dfb400564
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
references:
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 305
    col: 0
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 1
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 1
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 1
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3821
    col: 0
    score: 0.85
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 436
    col: 0
    score: 0.85
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 378
    col: 0
    score: 0.85
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 222
    col: 0
    score: 0.85
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 262
    col: 0
    score: 0.85
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 303
    col: 0
    score: 0.85
---

# Extract parens
```typescript
function extractParentheticals(text: string): string[] {
	const matches = [...text.matchAll(/$([^)]+)$/g)];
	return matches.map((m) => m[1].trim());
}

function classifyPause(phrase: string): 'silence' | 'ambient' | 'introspective' | 'narrative' | 'unknown' {
	const lc = phrase.toLowerCase();
	if (lc.includes('silence') || lc.includes('pause')) return 'silence';
	if (lc.includes('hum') || lc.includes('fan') || lc.includes('noise') || lc.includes('background')) return 'ambient';
	if (lc.includes('thought') || lc.includes('introspective') || lc.includes('considering')) return 'introspective';
	if (lc.includes('sigh') || lc.includes('murmur') || lc.includes('drawn') || lc.includes('drift')) return 'narrative';
	return 'unknown';
}

function estimatePauseDuration(phrase: string): number {
	const base = 1000; // base duration in ms
	const len = phrase.length;
	return base + Math.min(len * 40, 8000); // caps around 8s
}

function main():void {

const x = "I have a thing with a paren in it. (it's here.)"
console.log(extractParentheticals(x));
}

```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Reawakening Duck](reawakening-duck.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [field-interaction-equations](field-interaction-equations.md)
- [graph-ds](graph-ds.md)
- [plan-update-confirmation](plan-update-confirmation.md)
## Sources
- [pm2-orchestration-patterns — L217](pm2-orchestration-patterns.md#^ref-51932e7b-217-0) (line 217, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 1)
- [Promethean-native config design — L305](promethean-native-config-design.md#^ref-ab748541-305-0) (line 305, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 1)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 1)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 1)
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 1)
- [eidolon-field-math-foundations — L3821](eidolon-field-math-foundations.md#^ref-008f2ac0-3821-0) (line 3821, col 0, score 0.85)
- [Eidolon Field Abstract Model — L436](eidolon-field-abstract-model.md#^ref-5e8b2388-436-0) (line 436, col 0, score 0.85)
- [Reawakening Duck — L378](reawakening-duck.md#^ref-59b5670f-378-0) (line 378, col 0, score 0.85)
- [Ice Box Reorganization — L222](ice-box-reorganization.md#^ref-291c7d91-222-0) (line 222, col 0, score 0.85)
- [heartbeat-fragment-demo — L262](heartbeat-fragment-demo.md#^ref-dd00677a-262-0) (line 262, col 0, score 0.85)
- [heartbeat-fragment-demo — L303](heartbeat-fragment-demo.md#^ref-dd00677a-303-0) (line 303, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
