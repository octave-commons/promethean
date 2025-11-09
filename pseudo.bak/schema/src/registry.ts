import { ZodTypeAny } from 'zod';

export type Compat = 'none' | 'backward' | 'forward';
export type TopicId = string;

export type TopicSchema = {
    topic: TopicId;
    version: number;
    schema: ZodTypeAny;
    compat: Compat; // evolution rule vs previous version(s)
};

export class SchemaRegistry {
    private versions = new Map<TopicId, TopicSchema[]>(); // ascending by version

    register(def: TopicSchema): void {
        const list = this.versions.get(def.topic) ?? [];
        // ensure monotonic
        if (list.length > 0 && def.version <= list[list.length - 1]!.version) {
            throw new Error(`version must increase for ${def.topic}`);
        }
        // validate compatibility (very light check via zod "shape" introspection best-effort)
        if (list.length > 0 && def.compat !== 'none') {
            const prev = list[list.length - 1]!;
            checkCompat(prev.schema, def.schema, def.compat);
        }
        list.push(def);
        this.versions.set(def.topic, list);
    }

    latest(topic: TopicId): TopicSchema | undefined {
        const list = this.versions.get(topic);
        if (!list || !list.length) return;
        return list[list.length - 1];
    }

    validate(topic: TopicId, payload: unknown, version?: number): void {
        const list = this.versions.get(topic);
        if (!list || list.length === 0) return; // no schema → allow
        const schema = version ? list.find((s) => s.version === version)?.schema : list[list.length - 1]!.schema;
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
