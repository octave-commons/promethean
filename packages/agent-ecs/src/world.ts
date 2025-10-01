import type { Entity } from '@promethean/ds/ecs.js';
import { World } from '@promethean/ds/ecs.js';
import { sleep } from '@promethean/utils/sleep.js';

import { defineAgentComponents } from './components.js';
import type { AgentComponents, AudioPlayer, BargeIn } from './types.js';
import { SpeechArbiterSystem } from './systems/speechArbiter.js';
import { TurnDetectionSystem } from './systems/turn.js';
import { VADUpdateSystem } from './systems/vad.js';

type AgentSystem = (dtMs: number) => void | Promise<void>;

type AgentWorldHandle = {
    readonly w: World;
    readonly agent: Entity;
    readonly C: AgentComponents;
    readonly tick: (dtMs?: number) => Promise<void>;
    readonly addSystem: (system: AgentSystem) => void;
    readonly start: (delay: number) => Promise<void>;
    readonly stop: () => Promise<void>;
};

class AgentTicker {
    private systems: ReadonlyArray<AgentSystem>;
    private running = false;
    private tickPromise: Promise<void> = Promise.resolve();
    private startPromise: Promise<void> = Promise.resolve();
    private resolveStart: (() => void) | undefined;

    constructor(
        private readonly world: World,
        systems: ReadonlyArray<AgentSystem>,
    ) {
        this.systems = systems;
    }

    async tick(dtMs = 50): Promise<void> {
        const command = this.world.beginTick();
        await this.systems.reduce<Promise<void>>(
            (promise, system) => promise.then(() => Promise.resolve(system(dtMs))).then(() => undefined),
            Promise.resolve(),
        );
        command.flush();
        this.world.endTick();
    }

    addSystem(system: AgentSystem): void {
        this.systems = [...this.systems, system];
    }

    async start(delay: number): Promise<void> {
        if (this.running) return this.startPromise;
        this.running = true;
        this.startPromise = new Promise<void>((resolve) => {
            this.resolveStart = resolve;
        });

        const schedule = (elapsed: number): void => {
            if (!this.running) return;
            void iterate(elapsed).catch((error) => {
                console.error('[agent-ecs] ticker loop failed', error);
                this.running = false;
                this.resolveStart?.();
                this.resolveStart = undefined;
            });
        };

        const iterate = async (previousDelta: number): Promise<void> => {
            if (!this.running) return;
            const tickStart = Date.now();
            await this.tickPromise;
            if (!this.running) return;
            this.tickPromise = this.tick(previousDelta);
            const tickStop = Date.now();
            const elapsed = tickStop - tickStart;
            const remaining = delay - elapsed;
            if (remaining > 0) await sleep(remaining);
            schedule(elapsed);
        };

        schedule(0);

        return this.startPromise;
    }

    async stop(): Promise<void> {
        if (!this.running) throw new Error('There is no ticker to stop');
        await this.tickPromise;
        this.running = false;
        this.resolveStart?.();
        this.resolveStart = undefined;
    }
}

export const createAgentWorld = (audioPlayer: AudioPlayer): AgentWorldHandle => {
    const world = new World();
    const components = defineAgentComponents(world);

    const command = world.beginTick();
    const agent = command.createEntity();
    command.add(agent, components.Turn);
    command.add(agent, components.PlaybackQ, { items: [] });
    command.add(agent, components.Policy, { defaultBargeIn: 'pause' as BargeIn });
    command.add(agent, components.AudioRef, { player: audioPlayer });
    command.add(agent, components.RawVAD);
    command.add(agent, components.VAD);
    command.add(agent, components.TranscriptFinal);
    command.add(agent, components.BargeState);
    command.add(agent, components.VisionRing);
    command.add(agent, components.VoiceState);
    command.flush();
    world.endTick();

    const ticker = new AgentTicker(world, [
        VADUpdateSystem(world, components),
        TurnDetectionSystem(world, components),
        SpeechArbiterSystem(world, components),
    ]);

    return {
        w: world,
        agent,
        C: components,
        tick: (dtMs = 50) => ticker.tick(dtMs),
        addSystem: (system: AgentSystem) => ticker.addSystem(system),
        start: (delay: number) => ticker.start(delay),
        stop: () => ticker.stop(),
    };
};
