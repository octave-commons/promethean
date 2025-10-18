import { execa } from 'execa';

export async function gitRoot(cwd: string): Promise<string> {
  const { stdout } = await execa('git', ['rev-parse', '--show-toplevel'], { cwd });
  return stdout.trim();
}

export async function hasRepo(cwd: string): Promise<boolean> {
  try {
    await gitRoot(cwd);
    return true;
  } catch {
    return false;
  }
}

export async function statusPorcelain(cwd: string): Promise<string> {
  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd });
  return stdout.trim();
}

export async function listChangedFiles(cwd: string): Promise<string[]> {
  const s = await statusPorcelain(cwd);
  return s
    ? s
        .split('\n')
        .map((l: string) => l.slice(3).trim())
        .filter(Boolean)
    : [];
}

export async function addAll(cwd: string): Promise<void> {
  await execa('git', ['add', '-A'], { cwd });
}

export async function hasStagedChanges(cwd: string): Promise<boolean> {
  try {
    await execa('git', ['diff', '--cached', '--quiet'], { cwd }); // exits 0 when no diff
    return false;
  } catch {
    return true;
  }
}

export async function stagedDiff(cwd: string, maxBytes: number): Promise<string> {
  const { stdout } = await execa('git', ['diff', '--cached', '--unified=0'], {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });
  const buf = Buffer.from(stdout);
  return buf.byteLength > maxBytes
    ? buf.subarray(0, maxBytes).toString('utf8') + '\n…[truncated]'
    : stdout;
}

export async function repoSummary(cwd: string): Promise<string> {
  const { stdout: remote } = await execa('git', ['remote', '-v'], { cwd, reject: false });
  const { stdout: branch } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd,
    reject: false,
  });
  return `branch: ${branch.trim() || 'unknown'}; remote: ${remote.split('\n')[0] || 'none'}`;
}

/**
 * Creates a git commit with the given message.
 * @param cwd - Working directory for the git repository
 * @param message - Commit message (will be sanitized to prevent injection)
 * @param signoff - Whether to add signoff flag
 * @throws Error if message is invalid after sanitization
 */
export async function commit(cwd: string, message: string, signoff = false): Promise<void> {
  // Sanitize message to prevent command injection
  const sanitizedMessage = sanitizeCommitMessage(message);
  if (!sanitizedMessage) {
    throw new Error('Invalid commit message: message is empty after sanitization');
  }

  const args = ['commit', '-m', sanitizedMessage];
  if (signoff) args.push('--signoff');
  await execa('git', args, { cwd });
}

/**
 * Sanitizes a commit message to prevent command injection attacks.
 * Removes control characters and limits length to reasonable bounds.
 * @param message - Raw commit message
 * @returns Sanitized message safe for git commands
 */
export function sanitizeCommitMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Remove control characters (except newline and tab) and trim
  let sanitized = message
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \t \n
    .trim();

  // Split into lines and apply limits
  const lines = sanitized.split('\n');

  // Truncate first line if it's too long (git recommends <72 chars for first line)
  if (lines[0] && lines[0].length > 72) {
    lines[0] = lines[0].substring(0, 69) + '...';
  }

  // Limit to 50 lines total
  const limitedLines = lines.slice(0, 50);

  // Also limit total length to prevent issues
  sanitized = limitedLines.join('\n');
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  return sanitized;
}
