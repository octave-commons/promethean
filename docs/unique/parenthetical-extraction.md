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
  - Optimizing Command Limitations in System Design
  - Promethean Infrastructure Setup
  - ParticleSimulationWithCanvasAndFFmpeg
  - Dynamic Context Model for Web Components
  - Chroma Toolkit Consolidation Plan
  - 'Agent Tasks: Persistence Migration to DualStore'
  - DSL
  - Window Management
related_to_uuid:
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
references:
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 1
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
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
## Sources
- [pm2-orchestration-patterns — L217](pm2-orchestration-patterns.md#^ref-51932e7b-217-0) (line 217, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
