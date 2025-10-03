import { promises as fs } from 'node:fs';
import path from 'node:path';

const DOC_DIR_CANDIDATES = (slug: string) => [
  path.join('docs', 'packages', slug),
  path.join('docs', 'services', slug),
  path.join('docs', 'libraries', slug),
  path.join('docs', 'apps', slug),
];

const fileExists = async (p: string) => {
  try { await fs.stat(p); return true; } catch { return false; }
};

const docsExist = async (slug: string) => {
  for (const dir of DOC_DIR_CANDIDATES(slug)) {
    if (await fileExists(dir)) return { ok: true as const, dir };
  }
  return { ok: false as const };
};

const hasSrcMarker = (file: string) => file.split('/').includes('src');
const hasCodeExt = (file: string) => ['.ts', '.tsx', '.js', '.mjs', '.cjs'].some(ext => file.endsWith(ext));
const isTestFile = (file: string) => file.includes('/test/') || file.endsWith('.spec.ts') || file.endsWith('.test.ts');

const isSrcChange = (file: string) => {
  if (!file.startsWith('packages/')) return false;
  if (isTestFile(file)) return false;
  return hasSrcMarker(file) && hasCodeExt(file);
};

const toSlug = (file: string) => file.split('/')[1];

export type DocGuardOptions = {
  owner?: string;
  repo?: string;
  token?: string;
  pr?: string | number;
};

export async function docguard(opts: DocGuardOptions) {
  const owner = opts.owner || process.env.GITHUB_OWNER;
  const repo = opts.repo || process.env.GITHUB_REPO;
  const token = opts.token || process.env.GITHUB_TOKEN;
  const prNum = Number(opts.pr || process.env.PR_NUMBER || 0);
  if (!owner || !repo || !token || !prNum) {
    console.log(JSON.stringify({ ok: false, reason: 'missing-env', owner, repo, prNum }));
    process.exit(0); // don't hard-fail locally
  }

  // list changed files
  const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNum}/files`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!filesRes.ok) {
    console.error('Failed to list PR files', filesRes.status);
    process.exit(1);
  }
  const files = await filesRes.json() as Array<{ filename: string }>;
  const changed = files.map(f => f.filename);
  const pkgSrcChanges = changed.filter(isSrcChange);
  const slugs = Array.from(new Set(pkgSrcChanges.map(toSlug)));

  // get labels on the PR
  const labelsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNum}/labels`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  const labelsJson = labelsRes.ok ? await labelsRes.json() : [];
  const labels: string[] = (labelsJson || []).map((l: any) => l.name);
  const bypass = labels.includes('skip-docs');

  const problems: Array<{ slug: string; message: string }> = [];
  for (const slug of slugs) {
    const docs = await docsExist(slug);
    if (!docs.ok) {
      problems.push({ slug, message: `No docs folder found for package '${slug}'. Expected one of: ${DOC_DIR_CANDIDATES(slug).join(', ')}` });
      continue;
    }
    const docDir = docs.dir!;
    // Did any doc files change in this PR?
    const docTouched = changed.some((p) => p.startsWith(docDir + '/'));
    if (!docTouched) {
      problems.push({ slug, message: `Package '${slug}' source changed without docs change in '${docDir}'. Add a note or update diagrams, or label PR with 'skip-docs'.` });
    }
  }

  const ok = bypass || problems.length === 0;
  const result = { ok, bypass, problems, packages: slugs, changed };
  console.log(JSON.stringify(result));
  if (!ok) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const prArg = process.argv.slice(2)[0];
  docguard({ pr: prArg }).catch((e) => { console.error(e); process.exit(1); });
}
