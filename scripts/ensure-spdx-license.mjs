import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const checkMode = process.argv.includes('--check');

const exts = ['js', 'ts', 'py'];

const lsFilesCmd = "git ls-files '*.js' '*.ts' '*.py' ':!sites/**'";
const files = execSync(lsFilesCmd).toString().trim().split('\n').filter(Boolean);

const headers = {
  js: '// SPDX-License-Identifier: GPL-3.0-only',
  ts: '// SPDX-License-Identifier: GPL-3.0-only',
  py: '# SPDX-License-Identifier: GPL-3.0-only'
};

const missing = [];

for (const file of files) {
  const ext = path.extname(file).slice(1);
  const header = headers[ext];
  if (!header) continue;
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (content.includes('SPDX-License-Identifier')) continue;
  if (checkMode) {
    missing.push(file);
    continue;
  }
  if (content.startsWith('#!')) {
    const end = content.indexOf('\n');
    const shebang = content.slice(0, end + 1);
    const rest = content.slice(end + 1);
    content = shebang + header + '\n' + rest;
  } else {
    content = header + '\n' + content;
  }
  writeFileSync(file, content);
}

if (checkMode && missing.length) {
  console.error('Missing SPDX headers in:');
  for (const f of missing) {
    console.error(f);
  }
  process.exit(1);
}
