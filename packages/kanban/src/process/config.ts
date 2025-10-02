import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseFrontmatter as parseMarkdownFrontmatter } from '@promethean/markdown/frontmatter';
import type { ProcessConfig, TaskFM } from './types.js';

export const readYaml = async (file: string): Promise<ProcessConfig> => {
  const txt = await fs.readFile(file, 'utf8');
  const cfg = parseYaml(txt) as ProcessConfig;
  return cfg;
};

export const readTaskFrontmatter = async (file: string): Promise<TaskFM> => {
  const txt = await fs.readFile(file, 'utf8');
  const { frontmatter } = parseMarkdownFrontmatter(txt);
  return frontmatter as TaskFM;
};

export const listMarkdownTasks = async (dir: string): Promise<string[]> => {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  const md = ents
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.join(dir, e.name));
  return md;
};
