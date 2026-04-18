#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const repoRoot = path.resolve(scriptDir, '..');
const defaultConfigPath = path.join(repoRoot, 'size-lint.config.mjs');

const parseArgs = (argv) => {
  const positionals = [];
  let configPath = defaultConfigPath;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') {
      if (!argv[i + 1]) throw new Error('Missing value after --config');
      configPath = path.resolve(repoRoot, argv[++i]);
    } else {
      positionals.push(argv[i]);
    }
  }
  return { configPath, positionals };
};

const normalizePath = (p) => path.relative(repoRoot, p) || '.';

const loadConfig = async (configPath) => {
  const loaded = await import(pathToFileURL(configPath).href);
  return loaded.default ?? loaded;
};

const countLines = (text) => {
  if (!text.length) return 0;
  const segs = text.replace(/\r\n?/gu, '\n').split('\n');
  return segs.at(-1) === '' ? segs.length - 1 : segs.length;
};

const colorize = (text, code) =>
  process.stdout.isTTY ? `\u001B[${code}m${text}\u001B[0m` : text;

const colors = {
  red: (t) => colorize(t, 31),
  yellow: (t) => colorize(t, 33),
  cyan: (t) => colorize(t, 36),
  dim: (t) => colorize(t, 2),
};

const shouldIgnore = (filePath, config) => {
  const rel = normalizePath(filePath);
  const base = path.basename(filePath);
  return (
    (config.ignoreFiles ?? []).includes(rel) ||
    (config.ignoreFiles ?? []).includes(base) ||
    (config.ignoreSuffixes ?? []).some((s) => rel.endsWith(s))
  );
};

const visitTargets = async (targets, config, files = []) => {
  for (const target of targets) {
    const abs = path.resolve(repoRoot, target);
    let info;
    try { info = await stat(abs); }
    catch (e) {
      if (e?.code === 'ENOENT') throw new Error(`Target does not exist: ${target}`);
      throw e;
    }
    if (info.isDirectory()) {
      const entries = await readdir(abs, { withFileTypes: true });
      const children = entries
        .filter((e) => !(e.isDirectory() && (config.ignoreDirectories ?? []).includes(e.name)))
        .map((e) => path.join(target, e.name));
      await visitTargets(children, config, files);
    } else if (info.isFile()) {
      const ext = path.extname(abs);
      if (config.thresholdsByExtension?.[ext] && !shouldIgnore(abs, config))
        files.push(abs);
    }
  }
  return files;
};

const classifyFile = async (filePath, config) => {
  const src = await readFile(filePath, 'utf8');
  const lines = countLines(src);
  const t = config.thresholdsByExtension[path.extname(filePath)];
  const severity = lines >= t.error ? 'error' : lines >= t.warn ? 'warn' : 'ok';
  return { severity, lines, threshold: severity === 'error' ? t.error : t.warn, filePath };
};

const printGroup = (title, findings, fmt) => {
  if (!findings.length) return;
  console.log(title);
  findings.forEach((f) => console.log(`  ${fmt(f)}`));
  console.log('');
};

const main = async () => {
  const { configPath, positionals } = parseArgs(process.argv.slice(2));
  const config = await loadConfig(configPath);
  const targets = positionals.length > 0 ? positionals : (config.includePaths ?? []);
  if (!targets.length) throw new Error('No targets configured for size linting.');

  const summary = Object.entries(config.thresholdsByExtension)
    .map(([e, t]) => `${e}: warn ${t.warn}, error ${t.error}`).join(' | ');
  console.log(colors.cyan('size lint'));
  console.log(colors.dim(`thresholds -> ${summary}`));
  console.log(colors.dim(`targets -> ${targets.join(', ')}`));
  console.log('');

  const files = await visitTargets(targets, config);
  const findings = await Promise.all(files.map((f) => classifyFile(f, config)));
  const sorted = findings.toSorted((a, b) => b.lines - a.lines || a.filePath.localeCompare(b.filePath));
  const errors = sorted.filter((f) => f.severity === 'error');
  const warnings = sorted.filter((f) => f.severity === 'warn');

  printGroup(colors.red(`Errors (${errors.length})`), errors,
    (f) => `${colors.red('ERROR')} ${f.lines} lines (error ${f.threshold}) ${normalizePath(f.filePath)}`);
  printGroup(colors.yellow(`Warnings (${warnings.length})`), warnings,
    (f) => `${colors.yellow('WARN ')} ${f.lines} lines (warn ${f.threshold}) ${normalizePath(f.filePath)}`);

  const status = errors.length > 0 ? colors.red('failing')
    : warnings.length > 0 ? colors.yellow('warnings only') : 'clean';
  console.log(`Checked ${files.length} files -> ${errors.length} errors, ${warnings.length} warnings, status ${status}.`);
  if (errors.length > 0) process.exitCode = 1;
};

main().catch((e) => {
  console.error(colors.red('size lint failed'));
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
