import { MongoClient, Collection } from "mongodb";
import path from "path";
import { promises as fs } from "fs";

const LINK_PATTERN = /\[[^\]]*\]\(([^)]+\.md)\)/g;
const TAG_PATTERN = /(?<!\w)#(\w+)/g;

type LinkDoc = { src: string; dst: string };
type TagDoc = { path: string; tag: string };

export class GraphDB {
  private repoPath: string;
  private links: Collection<LinkDoc>;
  private hashtags: Collection<TagDoc>;

  constructor(client: MongoClient, repoPath: string) {
    this.repoPath = path.resolve(repoPath);
    const db = client.db("markdown_graph");
    this.links = db.collection<LinkDoc>("links");
    this.hashtags = db.collection<TagDoc>("hashtags");
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
    await this.links.deleteMany({ src: rel });
    await this.hashtags.deleteMany({ path: rel });

    const dir = path.dirname(rel);
    for (const link of this.parseLinks(content)) {
      const target = path.normalize(path.join(dir, link));
      const dst = this.rel(target);
      await this.links.insertOne({ src: rel, dst });
    }
    for (const tag of this.parseTags(content)) {
      await this.hashtags.insertOne({ path: rel, tag });
    }
  }

  async getLinks(p: string): Promise<string[]> {
    const rel = this.rel(p);
    const docs = await this.links.find({ src: rel }).toArray();
    return docs.map((d) => d.dst);
  }

  async getFilesWithTag(tag: string): Promise<string[]> {
    const docs = await this.hashtags.find({ tag }).toArray();
    return docs.map((d) => d.path);
  }

  async coldStart(): Promise<void> {
    const start = path.join(this.repoPath, "readme.md");
    const queue: string[] = [start];
    const seen = new Set<string>();

    while (queue.length) {
      const current = queue.shift()!;
      const rel = this.rel(current);
      if (seen.has(rel)) continue;
      seen.add(rel);
      try {
        const content = await fs.readFile(current, "utf8");
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
