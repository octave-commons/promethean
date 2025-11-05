export const SYSTEM = [
  'You write precise Conventional Commit messages.',
  'Subject line ≤ 72 chars; imperative mood; lowercase type.',
  'If changes are mixed, choose the most user-visible type.',
  'Include a short bullet list body only when helpful.',
].join(' ');

export const USER = (summary: string, fileList: string, diff: string): string => `
Project summary:
${summary}

Changed files:
${fileList}

Unified diff (truncated if large):
${diff}

Write one Conventional Commit. If appropriate, add a short body with bullets.
Return ONLY the commit message text.
`;
