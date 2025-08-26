import type { EmbeddingFunction, EmbeddingFunctionSpace } from 'chromadb';

export class RemoteEmbeddingFunction implements EmbeddingFunction {
    name = 'remote';
    url: string;
    driver: string | undefined;
    fn: string | undefined;

    constructor(
        url = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000/embed',
        driver = process.env.EMBEDDING_DRIVER,
        fn = process.env.EMBEDDING_FUNCTION,
    ) {
        this.url = url;
        this.driver = driver;
        this.fn = fn;
    }

    async generate(texts: Array<string | { type: string; data: string }>): Promise<number[][]> {
        const items = texts.map((t) => (typeof t === 'string' ? { type: 'text', data: t } : t));
        const body: any = { items };
        if (this.driver) body.driver = this.driver;
        if (this.fn) body.function = this.fn;
        const fetchFn = (globalThis as any).fetch;
        const res = await fetchFn(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        return json.embeddings;
    }

    defaultSpace(): EmbeddingFunctionSpace {
        return 'l2';
    }
    supportedSpaces(): EmbeddingFunctionSpace[] {
        return ['l2', 'cosine'];
    }
    static buildFromConfig(): RemoteEmbeddingFunction {
        return new RemoteEmbeddingFunction();
    }
    getConfig() {
        return {};
    }
}
