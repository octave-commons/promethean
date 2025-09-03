// SPDX-License-Identifier: GPL-3.0-only
import type { AgentBus } from '../bus';

export function OrchestratorSystem(
    w: any,
    bus: AgentBus,
    C: any,
    getContext: (text: string) => Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>,
    systemPrompt: () => string,
) {
    const { Turn, TranscriptFinal, VisionRing, VisionFrame } = C;

    const q = w.makeQuery({
        changed: [TranscriptFinal],
        all: [Turn, TranscriptFinal, VisionRing],
    });

    return async function run() {
        for (const [agent, get] of w.iter(q)) {
            const tf = get(TranscriptFinal);
            console.log('orchestrator triggered on changed transcript', tf);
            if (!tf || !tf.text) continue;
            const turnId = get(Turn)?.id ?? 0;
            const ring = get(VisionRing);
            const frames = (ring?.frames ?? [])
                .slice(-4)
                .map((eid: number) => w.get(eid, VisionFrame)!.ref)
                .filter(Boolean);
            const context = await getContext(tf.text);
            bus.enqueue('llm.generate', {
                prompt: systemPrompt(),
                context, // [{role, content}...]
                format: null, // keep simple
                replyTopic: 'agent.llm.result',
                images: frames,
                turnId,
            });
            // clear consumed transcript by writing to the next buffer
            w.set(agent, TranscriptFinal, { ...tf, text: '' });
        }
    };
}
