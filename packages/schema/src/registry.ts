import { ZodTypeAny } from 'zod';

export type Compat = 'none' | 'backward' | 'forward';
export type TopicId = string;

export type TopicSchema = Readonly<{
    topic: TopicId;
    version: number;
    schema: ZodTypeAny;
    compat: Compat; // evolution rule vs previous version(s)
}>;

const REGISTRY_STATE = new WeakMap<SchemaRegistry, ReadonlyMap<TopicId, readonly TopicSchema[]>>();

export class SchemaRegistry {
    constructor() {
        REGISTRY_STATE.set(this, new Map());
    }

    #versions(): ReadonlyMap<TopicId, readonly TopicSchema[]> {
        return REGISTRY_STATE.get(this) ?? new Map();
    }

    register(def: TopicSchema): void {
        const versions = this.#versions();
        const list = versions.get(def.topic) ?? [];
        const latest = list.at(-1);

        if (latest && def.version <= latest.version) {
            throw new Error(`version must increase for ${def.topic}`);
        }

        if (latest && def.compat !== 'none') {
            checkCompat(latest.schema, def.schema, def.compat);
        }

        const nextEntries = [...versions.entries()].filter(
            ([topic]: readonly [TopicId, readonly TopicSchema[]]) => topic !== def.topic,
        );
        REGISTRY_STATE.set(this, new Map([...nextEntries, [def.topic, [...list, def]]]));
    }

    latest(topic: TopicId): TopicSchema | undefined {
        const list = this.#versions().get(topic);
        return list?.at(-1);
    }

    validate(topic: TopicId, payload: unknown, version?: number): void {
        const list = this.#versions().get(topic);
        if (!list?.length) {
            return;
        }

        const schema = version
            ? list.find((schemaEntry: TopicSchema) => schemaEntry.version === version)?.schema
            : list.at(-1)?.schema;
        schema?.parse(payload);
    }
}

function checkCompat(prev: ZodTypeAny, next: ZodTypeAny, compat: Compat): void {
    // Minimal heuristic:
    // - backward: next must accept all fields prev accepted (no required field added)
    // - forward: prev must accept all fields next accepted (no required field removed)
    // We approximate using `.partial()` and safeParse roundtrips.
    if (compat === 'backward') {
        const res = next.safeParse(prev.parse({} as unknown));
        if (!res.success) throw new Error('backward compatibility check failed');
    }
    if (compat === 'forward') {
        const res = prev.safeParse(next.parse({} as unknown));
        if (!res.success) throw new Error('forward compatibility check failed');
    }
}
