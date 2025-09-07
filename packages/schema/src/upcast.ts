// loosen typing to avoid cross-package type coupling
import { SchemaRegistry } from './registry.js';

export type Upcaster = (e: any) => any;

export class UpcastChain {
    // map: topic -> version -> upcaster to next
    private chains = new Map<string, Map<number, Upcaster>>();

    add(topic: string, fromVersion: number, fn: Upcaster) {
        const m = this.chains.get(topic) ?? new Map<number, Upcaster>();
        m.set(fromVersion, fn);
        this.chains.set(topic, m);
    }

    // walk from e.headers["x-schema-version"] up to latest
    toLatest(topic: string, e: any, reg: SchemaRegistry): any {
        const m = this.chains.get(topic);
        const latest = reg.latest(topic)?.version;
        if (!m || latest == null) return e;

        const vRaw = Number(e.headers?.['x-schema-version']);
        let v = Number.isFinite(vRaw) ? vRaw : latest; // if no version assume latest (legacy)
        let cur = e;

        while (v < latest) {
            const step = m.get(v);
            if (!step) break; // missing hop; best-effort
            cur = step(cur);
            v++;
        }
        // stamp new version so downstream knows it’s normalized
        cur.headers = {
            ...(cur.headers ?? {}),
            'x-schema-version': String(latest),
        };
        return cur;
    }
}
