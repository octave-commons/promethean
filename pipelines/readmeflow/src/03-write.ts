import * as path from 'path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import matter from 'gray-matter';
import { openLevelCache } from '@promethean-os/level-cache';
import { parseArgs, writeText, readMaybe } from '@promethean-os/utils';

import type { ScanOut, OutlinesFile, Outline } from './types.js';

const START = '<!-- READMEFLOW:BEGIN -->';
const END = '<!-- READMEFLOW:END -->';

function stripGenerated(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return `${text.slice(0, si).trimEnd()}\n`.trimEnd();
  return text.trimEnd();
}

function buildPrometheanRemoteLinks(gitmodulesPath: string | undefined) {
  try {
    if (!gitmodulesPath) return '';
    const raw = fs.readFileSync(gitmodulesPath, 'utf-8') as unknown as string; // sync read ok during generation
    const lines = raw.split(/\r?\n/);
    const repos: string[] = [];
    for (const rawLine of lines) {
      const line = rawLine?.trim();
      if (!line) continue;
      if (line.startsWith('url = ')) {
        const url = line.slice('url = '.length).trim();
        const m = /github\.com[:/](?:riatzukiza)\/([A-Za-z0-9._-]+)(?:\.git)?$/i.exec(url);
        if (m && m[1]) repos.push(m[1].replace(/\.git$/i, ''));
      }
    }
    if (repos.length === 0) return '';
    const bullets = repos
      .sort((a, b) => a.localeCompare(b))
      .map((r) => `- [riatzukiza/${r}](https://github.com/riatzukiza/${r}#readme)`)
      .join('\n');
    return [
      '## Promethean Packages (Remote READMEs)',
      '',
      '- Back to [riatzukiza/promethean](https://github.com/riatzukiza/promethean#readme)',
      '',
      '<!-- BEGIN: PROMETHEAN-PACKAGES-READMES -->',
      bullets,
      '<!-- END: PROMETHEAN-PACKAGES-READMES -->',
      '',
    ].join('\n');
  } catch {
    return '';
  }
}

function makeReadme(_pkg: unknown, outline: Outline, mermaid?: string, remoteLinks?: string) {
  const toc = outline.includeTOC ? '[TOC]\n\n' : '';
  const sec = outline.sections.map((s) => `## ${s.heading}\n\n${s.body}\n`).join('\n');
  const badges = (outline.badges ?? []).join(' ');
  const diag = mermaid ? `\n### Package graph\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : '';
  const links = remoteLinks ? `\n${remoteLinks}\n` : '';

  return [
    START,
    `# ${outline.title}`,
    badges ? `\n${badges}\n` : '',
    `${outline.tagline}\n`,
    toc,
    sec,
    diag,
    links,
    END,
    '',
  ].join('\n');
}

export async function writeReadmes(
  options: { cache?: string; mermaid?: boolean } = {},
): Promise<void> {
  const cache = await openLevelCache<ScanOut | OutlinesFile>({
    path: path.resolve(options.cache ?? '.cache/readmes'),
  });
  const scan = (await cache.get('scan')) as ScanOut;
  const outlines = (await cache.get('outlines')) as OutlinesFile;

  const first = scan.packages.at(0);
  if (!first) {
    console.warn('readmeflow: no packages discovered during README generation');
    await cache.close();
    return;
  }

  // Derive repo root from first package dir and locate .gitmodules there
  const packagesDir = path.dirname(first.dir); // .../promethean/packages
  const repoRoot = path.dirname(packagesDir); // .../promethean
  const gitmodulesPath = path.join(repoRoot, '.gitmodules');
  const remoteLinks = buildPrometheanRemoteLinks(gitmodulesPath);

  for (const pkg of scan.packages) {
    const out = outlines.outlines[pkg.name];
    if (!out) continue;

    const readmePath = path.join(pkg.dir, 'README.md');
    const existing = await readMaybe(readmePath);
    const gm = existing ? matter(existing) : { content: '', data: {} as Record<string, unknown> };

    const stripped = stripGenerated(gm.content);
    const content =
      (stripped ? `${stripped}\n\n` : '') +
      makeReadme(pkg, out, options.mermaid ? scan.graphMermaid : undefined, remoteLinks);

    const fm = { ...gm.data };
    const final = matter.stringify(content, fm, { language: 'yaml' });
    await writeText(readmePath, final);
  }
  await cache.close();
  console.log(`readmeflow: wrote ${scan.packages.length} README(s)`);
}

export default writeReadmes;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    '--cache': '.cache/readmes',
    '--mermaid': 'true',
  });
  writeReadmes({
    cache: args['--cache'],
    mermaid: args['--mermaid'] === 'true',
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
