import { spawn, execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

const execFileAsync = (file, args) =>
  new Promise((resolve, reject) => {
    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });

const nxJson = await loadNxJson();

async function loadNxJson() {
  try {
    const url = new URL('../nx.json', import.meta.url);
    const data = await readFile(url, 'utf8');

    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function normalizeList(values) {
  return values
    .flatMap((value) => value.split(',').map((item) => item.trim()))
    .filter((item) => item.length > 0);
}

function extractOption(args, name) {
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === `--${name}`) {
      const value = args[index + 1];

      return {
        value,
        index,
        type: 'separate',
      };
    }

    if (token.startsWith(`--${name}=`)) {
      const value = token.slice(name.length + 3);

      return {
        value,
        index,
        type: 'joined',
      };
    }
  }

  return null;
}

function removeListOption(args, name) {
  const remaining = [];
  const collected = [];

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === `--${name}`) {
      const value = args[index + 1];
      if (value) {
        collected.push(value);
      }

      index += 1;
      continue;
    }

    if (token.startsWith(`--${name}=`)) {
      const value = token.slice(name.length + 3);
      if (value.length > 0) {
        collected.push(value);
      }

      continue;
    }

    remaining.push(token);
  }

  return {
    remaining,
    collected: normalizeList(collected),
  };
}

function hasProjectsOption(args) {
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === '--projects' || token === '-p') {
      const value = args[index + 1];
      if (value && !value.startsWith('-')) {
        return true;
      }
    }

    if (token.startsWith('--projects=') || token.startsWith('-p=')) {
      return true;
    }
  }

  return false;
}

async function promptForBaseBranch(defaultBase) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'A base branch is required when running non-interactively. Provide it via --base or NX_BASE.',
    );
  }

  let stdout = '';
  try {
    ({ stdout } = await execFileAsync('git', ['branch', '--format', '%(refname:short)']));
  } catch (error) {
    throw new Error('Unable to read git branches. Provide the base branch via --base.');
  }
  const branches = stdout
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .sort((a, b) => a.localeCompare(b));

  const completer = (line) => {
    const hits = branches.filter((branch) => branch.startsWith(line));
    return [hits.length > 0 ? hits : branches, line];
  };

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
  });

  const question = (query) =>
    new Promise((resolve) => {
      rl.question(query, resolve);
    });

  const suffix = defaultBase ? ` (${defaultBase})` : '';
  const answer = (await question(`Select base branch${suffix}: `)).trim();
  rl.close();

  if (answer.length > 0) {
    return answer;
  }

  if (defaultBase) {
    return defaultBase;
  }

  throw new Error('A base branch must be provided.');
}

function ensureOption(args, name, value) {
  const existing = extractOption(args, name);

  if (!existing) {
    if (value === undefined) {
      return;
    }

    args.push(`--${name}`);
    if (value !== null) {
      args.push(value);
    }
    return;
  }

  if (existing.type === 'separate') {
    if (value !== undefined && value !== null) {
      args[existing.index + 1] = value;
    }

    return;
  }

  if (existing.type === 'joined' && value !== undefined && value !== null) {
    args[existing.index] = `--${name}=${value}`;
  }
}

async function runNx(commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn('nx', commandArgs, {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const [target, mode, ...rest] = process.argv.slice(2);

  if (!target || !mode) {
    console.error('Usage: node scripts/run-nx-task.mjs <target> <mode> [--options]');
    process.exit(1);
  }

  const rawArgs = [...rest];
  let exitCode = 1;

  switch (mode) {
    case 'all': {
      const nxArgs = ['run-many', `--target=${target}`, ...rawArgs];
      exitCode = await runNx(nxArgs);
      break;
    }
    case 'affected': {
      const nxArgs = [...rawArgs];
      const defaultBase = nxJson?.affected?.defaultBase;
      const envBase =
        process.env.NX_BASE ??
        process.env.NX_BASE_BRANCH ??
        process.env.BASE ??
        process.env.BASE_BRANCH ??
        null;

      const baseOption = extractOption(nxArgs, 'base');
      let baseValue = baseOption?.value ?? envBase ?? null;

      if (!baseValue || baseValue.length === 0) {
        baseValue = await promptForBaseBranch(defaultBase ?? undefined);
      }

      ensureOption(nxArgs, 'base', baseValue);

      const envHead = process.env.NX_HEAD ?? process.env.HEAD ?? null;
      if (envHead && envHead.length > 0 && !extractOption(nxArgs, 'head')) {
        nxArgs.push('--head', envHead);
      }

      const commandArgs = ['affected', `--target=${target}`, ...nxArgs];
      exitCode = await runNx(commandArgs);
      break;
    }
    case 'selection': {
      if (!hasProjectsOption(rawArgs)) {
        console.error(
          'The selection mode requires at least one project. Provide them via --projects or -p.',
        );
        process.exit(1);
      }

      const nxArgs = ['run-many', `--target=${target}`, ...rawArgs];
      exitCode = await runNx(nxArgs);
      break;
    }
    case 'tagged': {
      const { remaining, collected } = removeListOption(rawArgs, 'tags');
      const envTags = normalizeList(
        (process.env.NX_TAGS ?? process.env.TAGS ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      );

      const tags = collected.length > 0 ? collected : envTags;

      if (tags.length === 0) {
        console.error(
          'The tagged mode requires at least one tag via --tags or the NX_TAGS environment variable.',
        );
        process.exit(1);
      }

      const selector = tags.map((tag) => (tag.startsWith('tag:') ? tag : `tag:${tag}`)).join(',');

      const nxArgs = ['run-many', `--target=${target}`, `--projects=${selector}`, ...remaining];
      exitCode = await runNx(nxArgs);
      break;
    }
    default: {
      console.error(`Unknown mode: ${mode}`);
      process.exit(1);
    }
  }

  process.exit(exitCode);
}

try {
  await main();
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
}
