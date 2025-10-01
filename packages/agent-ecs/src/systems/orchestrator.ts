import type { Entity, World } from '@promethean/ds/ecs.js';

import type { AgentBus } from '../bus.js';
import type { AgentComponents, TranscriptFinalComponent, VisionFrameComponent, VisionRingComponent } from '../types.js';

type ConversationMessage = { readonly role: 'user' | 'assistant' | 'system'; readonly content: string };

type ConversationContext = ReadonlyArray<ConversationMessage>;

const extractFrames = (
    world: World,
    components: AgentComponents,
    ring: VisionRingComponent | undefined,
): ReadonlyArray<VisionFrameComponent['ref']> =>
    (ring?.frames ?? [])
        .slice(-4)
        .map((entity) => world.get(entity, components.VisionFrame)?.ref)
        .filter((ref): ref is VisionFrameComponent['ref'] => ref != null);

const clearTranscript = (
    world: World,
    components: AgentComponents,
    agent: Entity,
    transcript: TranscriptFinalComponent,
): void => {
    world.set(agent, components.TranscriptFinal, { ...transcript, text: '' });
};

export type OrchestratorBus = Pick<AgentBus, 'enqueue'>;

type OrchestratorContext = {
    readonly world: World;
    readonly bus: OrchestratorBus;
    readonly components: AgentComponents;
    readonly getContext: (text: string) => Promise<ConversationContext>;
    readonly systemPrompt: () => string;
};

export const OrchestratorSystem = ({ world, bus, components, getContext, systemPrompt }: OrchestratorContext) => {
    const query = world.makeQuery({
        changed: [components.TranscriptFinal],
        all: [components.Turn, components.TranscriptFinal, components.VisionRing],
    });

    return async (): Promise<void> => {
        for (const [agent] of world.iter(query)) {
            const transcript = world.get(agent, components.TranscriptFinal);
            if (!transcript || !transcript.text) continue;
            const turnId = world.get(agent, components.Turn)?.id ?? 0;
            const ring = world.get(agent, components.VisionRing);
            const frames = extractFrames(world, components, ring);
            const context = await getContext(transcript.text);
            bus.enqueue('llm.generate', {
                prompt: systemPrompt(),
                context,
                format: null,
                replyTopic: 'agent.llm.result',
                images: frames,
                turnId,
            });
            clearTranscript(world, components, agent, transcript);
        }
    };
};
