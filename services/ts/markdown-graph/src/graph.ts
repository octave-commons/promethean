import path from 'path';
import { promises as fs } from 'fs';
import { ContextStore, DualStoreManager } from '@shared/ts/dist/persistence/index.js';

const LINK_PATTERN = /\[[^\]]*\]\(([^)]+\.md)\)/g;
const TAG_PATTERN = /(?<!\w)#(\w+)/g;

export class GraphDB {
    private repoPath: string;
    private links: DualStoreManager<'text', 'timestamp'>;
    private hashtags: DualStoreManager<'text', 'timestamp'>;

    private constructor(
        repoPath: string,
        links: DualStoreManager<'text', 'timestamp'>,
        hashtags: DualStoreManager<'text', 'timestamp'>,
    ) {
        this.repoPath = path.resolve(repoPath);
        this.links = links;
        this.hashtags = hashtags;
    }

    static async create(repoPath: string): Promise<GraphDB> {
        const store = new ContextStore();
        const links = (await store.createCollection(
            'markdown_graph_links',
            'text',
            'timestamp',
        )) as DualStoreManager<'text', 'timestamp'>;
        const hashtags = (await store.createCollection(
            'markdown_graph_hashtags',
            'text',
            'timestamp',
        )) as DualStoreManager<'text', 'timestamp'>;
        return new GraphDB(repoPath, links, hashtags);
    }

    private rel(p: string): string {
        const abs = path.isAbsolute(p) ? p : path.join(this.repoPath, p);
        return path.relative(this.repoPath, path.resolve(abs));
    }

    private parseLinks(content: string): string[] {
        const results: string[] = [];
        for (const match of content.matchAll(LINK_PATTERN)) {
            results.push(match[1]!);
        }
        return results;
    }

    private parseTags(content: string): string[] {
        const results: string[] = [];
        for (const match of content.matchAll(TAG_PATTERN)) {
            results.push(match[1]!);
        }
        return results;
    }

    async updateFile(filePath: string, content: string): Promise<void> {
        const rel = this.rel(filePath);
        await this.links.mongoCollection.deleteMany({ 'metadata.src': rel } as any);
        await this.hashtags.mongoCollection.deleteMany({ 'metadata.path': rel } as any);

        const dir = path.dirname(rel);
        for (const link of this.parseLinks(content)) {
            const target = path.normalize(path.join(dir, link));
            const dst = this.rel(target);
            await this.links.mongoCollection.insertOne({
                text: dst,
                timestamp: Date.now(),
                metadata: { src: rel, dst },
            } as any);
        }
        for (const tag of this.parseTags(content)) {
            await this.hashtags.mongoCollection.insertOne({
                text: tag,
                timestamp: Date.now(),
                metadata: { path: rel, tag },
            } as any);
        }
    }

    async getLinks(p: string): Promise<string[]> {
        const rel = this.rel(p);
        const docs = await this.links.mongoCollection
            .find({ 'metadata.src': rel } as any)
            .toArray();
        return docs.map((d) => d.metadata?.dst as string);
    }

    async getFilesWithTag(tag: string): Promise<string[]> {
        const docs = await this.hashtags.mongoCollection
            .find({ 'metadata.tag': tag } as any)
            .toArray();
        return docs.map((d) => d.metadata?.path as string);
    }

    async coldStart(): Promise<void> {
        const start = path.join(this.repoPath, 'readme.md');
        const queue: string[] = [start];
        const seen = new Set<string>();

        while (queue.length) {
            const current = queue.shift()!;
            const rel = this.rel(current);
            if (seen.has(rel)) continue;
            seen.add(rel);
            try {
                const content = await fs.readFile(current, 'utf8');
                await this.updateFile(current, content);
                for (const link of this.parseLinks(content)) {
                    const next = path.normalize(path.join(path.dirname(current), link));
                    if (next.startsWith(this.repoPath)) {
                        queue.push(next);
                    }
                }
            } catch {
                // ignore missing files
            }
        }
    }
}
