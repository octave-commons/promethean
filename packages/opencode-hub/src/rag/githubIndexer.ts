import { setTimeout as delay } from "node:timers/promises";
import { Repo } from "../types.js";

// Light-weight GitHub indexer without octokit to reduce deps; uses fetch from Node 20+
const base = "https://api.github.com";

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  const h: Record<string,string> = { "Accept": "application/vnd.github+json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url}`);
  return res.json();
}

export async function* fetchIssuesAndPRs(ownerRepo: string) {
  const urlIssues = `${base}/repos/${ownerRepo}/issues?state=all&per_page=50`;
  const urlPRs = `${base}/repos/${ownerRepo}/pulls?state=all&per_page=50`;
  const [issues, prs] = await Promise.all([fetchJson(urlIssues), fetchJson(urlPRs)]);
  yield* issues.map((i: any) => ({ kind: "issue", id: String(i.id), title: i.title, body: i.body ?? "", url: i.html_url }));
  yield* prs.map((p: any) => ({ kind: "pr", id: String(p.id), title: p.title, body: p.body ?? "", url: p.html_url }));
}

export async function indexGithubForRepo(repo: Repo, sink: { indexDocs: Function }) {
  if (repo.provider !== "github" || !repo.repoSlug) return;
  let count = 0;
  for await (const doc of fetchIssuesAndPRs(repo.repoSlug)) {
    await sink.indexDocs([{ id: `${repo.id}:${doc.kind}:${doc.id}`, repoId: repo.id, kind: doc.kind, text: `${doc.title}\n\n${doc.body}`, meta: { url: doc.url } }]);
    count++;
    if (count % 25 === 0) await delay(200);
  }
}