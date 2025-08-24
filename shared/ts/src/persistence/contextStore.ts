import { DualStore } from './dualStore';
import { DualEntry } from './types';
import { Message } from 'ollama';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export class ContextStore {
    stores: Map<string, DualStore>;

    constructor() {
        this.stores = new Map();
    }

    async createCollection(name: string, textKey: string, timeKey: string) {
        if (this.stores.has(name)) throw new Error(`Collection ${name} already exists`);
        const store = await DualStore.create(name, textKey, timeKey);
        this.stores.set(name, store);
        return store;
    }

    getCollection(name: string) {
        if (!this.stores.has(name)) throw new Error(`Collection ${name} does not exist`);
        return this.stores.get(name)!;
    }

    async getAllRelatedDocuments(querys: string[], limit = 100): Promise<DualEntry[]> {
        const results = [];
        for (const store of this.stores.values()) {
            results.push(await store.getMostRelevant(querys, limit));
        }
        return results.flat();
    }

    async getLatestDocuments(limit = 100): Promise<DualEntry[]> {
        const results = [];
        for (const store of this.stores.values()) {
            results.push(await store.getMostRecent(limit));
        }
        return results.flat();
    }

    async compileContext(
        texts: string[] = [],
        recentLimit = 10,
        queryLimit = 5,
        limit = 20,
        formatAssistantMessages = false,
    ): Promise<Message[]> {
        const latest = await this.getLatestDocuments(recentLimit);
        const query = [...texts, ...latest.map((d) => d.text)].slice(-queryLimit);
        const related = await this.getAllRelatedDocuments(query, limit);

        const unique = new Set<string>();

        let results = [...related, ...latest]
            .filter((d) => {
                if (!d.text) return false;
                if (unique.has(d.text)) return false;
                if (!d.metadata) return false;
                unique.add(d.text);
                return true;
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (results.length > limit * this.stores.size * 2) {
            results = results.slice(-(limit * this.stores.size * 2));
        }

        return results.map((m) => ({
            role: m.metadata?.userName === 'Duck' ? (m.metadata?.isThought ? 'system' : 'assistant') : 'user',
            content:
                m.metadata?.userName === 'Duck'
                    ? formatAssistantMessages
                        ? this.formatMessage(m)
                        : m.text
                    : this.formatMessage(m),
        }));
    }

    private formatMessage(m: DualEntry): string {
        return `${m.metadata?.userName === 'Duck' ? 'You' : m.metadata.userName} ${
            m.metadata?.isThought ? 'thought' : 'said'
        } (${timeAgo.format(new Date(m.timestamp).getTime())}): ${m.text}`;
    }
}
