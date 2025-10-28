import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseFrontmatter as parseMarkdownFrontmatter } from '@promethean-os/markdown/frontmatter';
export const readYaml = async (file) => {
    const txt = await fs.readFile(file, 'utf8');
    const cfg = parseYaml(txt);
    return cfg;
};
export const readTaskFrontmatter = async (file) => {
    const txt = await fs.readFile(file, 'utf8');
    const parsed = parseMarkdownFrontmatter(txt);
    return parsed.data;
};
export const listMarkdownTasks = async (dir) => {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    const md = ents
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => path.join(dir, e.name));
    return md;
};
//# sourceMappingURL=config.js.map