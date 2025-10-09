import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { OLLAMA_URL } from '../packages/utils/dist/ollama.js';

async function runEslint(target = 'packages') {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['exec', 'eslint', target, '--format', 'json'], {
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let out = '';
    proc.stdout.on('data', (d) => {
      out += d.toString();
    });
    proc.on('close', (code) => {
      if (code === 0 || code === 1) {
        resolve(out);
      } else {
        reject(new Error(`eslint exited with code ${code}`));
      }
    });
    proc.on('error', reject);
  });
}

async function ollamaSuggest(model, prompt) {
  const disabled = String(process.env.OLLAMA_DISABLE ?? 'false').toLowerCase() === 'true';
  if (disabled) return 'No suggestion available (OLLAMA_DISABLE=true).';
  const url = OLLAMA_URL;
  if (!url) return 'No suggestion available.';
  try {
    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });
    const json = await res.json();
    return typeof json.response === 'string' ? json.response.trim() : 'No suggestion available.';
  } catch {
    return 'No suggestion available.';
  }
}

export async function tasks(args = {}) {
  const reportPath = args.report ?? '.cache/eslint/report.json';
  const outDir = args.outDir ?? 'docs/agile/tasks';
  const model = args.model ?? 'qwen3:4b';

  let reportRaw;
  try {
    reportRaw = await fs.readFile(reportPath, 'utf8');
  } catch {
    reportRaw = await runEslint();
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, reportRaw);
  }

  const results = JSON.parse(reportRaw);
  await fs.mkdir(outDir, { recursive: true });

  for (const file of results) {
    const { filePath, messages } = file;
    if (!messages?.length) continue;
    let source;
    try {
      source = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }
    const lines = source.split(/\r?\n/);
    for (const msg of messages) {
      const { line, endLine, ruleId, message, severity } = msg;
      const start = Math.max(0, (line ?? 1) - 3);
      const end = Math.min(lines.length, (endLine ?? line ?? 1) + 2);
      const context = lines.slice(start, end).join('\n');
      const suggestion = await ollamaSuggest(
        model,
        `ESLint ${severity === 2 ? 'error' : 'warning'} ${
          ruleId ?? ''
        } in ${filePath}:${line}.\nMessage: ${message}.\nContext:\n${context}\nProvide a concise fix or guidance.`,
      );
      const rel = path.relative(process.cwd(), filePath);
      const title = `Resolve ${ruleId ?? 'lint issue'} in ${rel}:${line}`;
      const body = `#Todo\n\n## 🛠️ Task: ${title}\n\nESLint ${
        severity === 2 ? 'error' : 'warning'
      }: ${message}\n\n### 💡 Suggestion\n${suggestion}\n\n---\n\n## 🎯 Goals\n- [ ] Fix ${
        ruleId ?? 'lint issue'
      }\n\n---\n\n## 📦 Requirements\n- [ ] ESLint passes for ${rel}\n\n---\n\n## 📋 Subtasks\n- [ ] Address the ${
        severity === 2 ? 'error' : 'warning'
      } in ${rel}\n\n---\n`;
      const slug = `${rel.replace(/[^a-zA-Z0-9]/g, '_')}_${line}.md`;
      const outPath = path.join(outDir, slug);
      await fs.writeFile(outPath, body);
    }
  }
}
