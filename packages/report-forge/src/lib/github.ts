import { request } from 'undici';

import type { GithubAdapter, Issue } from './types.js';

const ghBase = 'https://api.github.com';

// Type definitions for GitHub API responses
type GitHubIssue = {
  readonly id: number;
  readonly number: number;
  readonly title: string;
  readonly state: string;
  readonly labels: readonly { readonly name: string }[];
  readonly html_url: string;
  readonly created_at: string;
  readonly closed_at?: string;
  readonly body?: string;
  readonly pull_request?: unknown;
};

export const github = (token = process.env.GITHUB_TOKEN ?? ''): GithubAdapter => ({
  async listIssues(repo, opts = { state: 'all' }) {
    const url = new URL(`${ghBase}/repos/${repo}/issues`);
    url.searchParams.set('state', opts.state ?? 'all');
    url.searchParams.set('per_page', '100');
    const { body } = await request(url, {
      method: 'GET',
      headers: {
        'user-agent': 'report-forge',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = (await body.json());
    return (Array.isArray(data) ? data : [])
      .filter((x): x is GitHubIssue => !!(x as GitHubIssue).pull_request === false)
      .map(
        (x: GitHubIssue): Issue => ({
          id: x.id,
          number: x.number,
          title: x.title,
           
          state: x.state as 'open' | 'closed',
          labels: x.labels.map((l) => ({ name: l.name })),
          url: x.html_url,
          createdAt: x.created_at,
          closedAt: x.closed_at,
          body: x.body,
        }),
      );
  },
});
