type FetchLike = typeof fetch;

export type GitHubEnv = {
  token?: string;
  owner?: string;
  repo?: string;
};

const required = (v: string | undefined, name: string): string => {
  if (!v || !v.trim()) throw new Error(`Missing ${name}`);
  return v;
};

export const makeGh = (env: GitHubEnv, f: FetchLike = fetch) => {
  const base = 'https://api.github.com';
  const token = env.token;
  const owner = env.owner;
  const repo = env.repo;

  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' };

  const url = (p: string) => `${base}${p}`;

  const applyLabels = async (issueNumber: number, labels: string[]) => {
    if (!token) return { skipped: true, reason: 'no-token' } as const;
    required(owner, 'owner');
    required(repo, 'repo');
    const r = await f(url(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ labels }),
    });
    const ok = r.ok;
    return { ok, status: r.status };
  };

  const comment = async (issueNumber: number, body: string) => {
    if (!token) return { skipped: true, reason: 'no-token' } as const;
    required(owner, 'owner');
    required(repo, 'repo');
    const r = await f(url(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ body }),
    });
    return { ok: r.ok, status: r.status };
  };

  return { applyLabels, comment } as const;
};
