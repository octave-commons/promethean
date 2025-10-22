import path from "path";
import { promises as fs } from "fs";

import { ContextStore } from "@promethean/persistence";

const TAG_PATTERN = /(?<!\w)#(\w+)/g;

export class GraphDB {
  private readonly repoPath: string;
  private readonly links: any;
  private readonly hashtags: any;

  private constructor(repoPath: string, links: any, hashtags: any) {
    this.repoPath = path.resolve(repoPath);
    this.links = links;
    this.hashtags = hashtags;
  }

  static async create(repoPath: string, store?: any): Promise<GraphDB> {
    const ctx = store ?? new ContextStore();
    const links = await ctx.createCollection(
      "markdown_graph_links",
      "text",
      "timestamp",
    );
    const hashtags = await ctx.createCollection(
      "markdown_graph_hashtags",
      "text",
      "timestamp",
    );
    return new GraphDB(repoPath, links, hashtags);
  }

  private rel(p: string): string {
    const abs = path.isAbsolute(p) ? p : path.join(this.repoPath, p);
    return path.relative(this.repoPath, path.resolve(abs));
  }

  private parseLinks(content: string): string[] {
    const results: string[] = [];
    const extension = ".md";
    let searchIndex = 0;

    while (searchIndex < content.length) {
      const openBracket = content.indexOf("[", searchIndex);
      if (openBracket === -1) break;
      searchIndex = openBracket + 1;

      // Skip image links like ![alt](image.png)
      if (openBracket > 0 && content[openBracket - 1] === "!") {
        continue;
      }

      const closingBracket = content.indexOf("]", openBracket + 1);
      if (closingBracket === -1) {
        continue;
      }
      if (
        closingBracket + 1 >= content.length ||
        content[closingBracket + 1] !== "("
      ) {
        searchIndex = closingBracket + 1;
        continue;
      }

      const closingParen = content.indexOf(")", closingBracket + 2);
      if (closingParen === -1) {
        searchIndex = closingBracket + 1;
        continue;
      }

      const rawLink = content.slice(closingBracket + 2, closingParen);
      const link = rawLink.trim();
      if (link.toLowerCase().endsWith(extension)) {
        results.push(link);
      }

      searchIndex = closingParen + 1;
    }

    return results;
  }

  private parseTags(content: string): string[] {
    return Array.from(content.matchAll(TAG_PATTERN), (m) => m[1]!);
  }

  async updateFile(filePath: string, content: string): Promise<void> {
    const rel = this.rel(filePath);
    await this.links.mongoCollection.deleteMany({ "metadata.src": rel } as any);
    await this.hashtags.mongoCollection.deleteMany({
      "metadata.path": rel,
    } as any);

    const dir = path.dirname(rel);
    for (const link of this.parseLinks(content)) {
      const target = path.normalize(path.join(dir, link));
      const dst = this.rel(target);
      await this.links.insert({
        text: dst,
        timestamp: Date.now(),
        metadata: { src: rel, dst },
      });
    }
    for (const tag of this.parseTags(content)) {
      await this.hashtags.insert({
        text: tag,
        timestamp: Date.now(),
        metadata: { path: rel, tag },
      });
    }
  }

  async getLinks(p: string): Promise<string[]> {
    const rel = this.rel(p);
    const docs = await this.links.mongoCollection
      .find({ "metadata.src": rel } as any)
      .toArray();
    return docs.map((d: any) => d.metadata?.dst as string);
  }

  async getFilesWithTag(tag: string): Promise<string[]> {
    const docs = await this.hashtags.mongoCollection
      .find({ "metadata.tag": tag } as any)
      .toArray();
    return docs.map((d: any) => d.metadata?.path as string);
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
