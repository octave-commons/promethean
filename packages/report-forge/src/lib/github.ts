import { request } from "undici";
import type { GithubAdapter, Issue } from "./types.js";

const ghBase = "https://api.github.com";

export const github = (
  token = process.env.GITHUB_TOKEN ?? "",
): GithubAdapter => ({
  async listIssues(repo, opts = { state: "all" }) {
    const url = new URL(`${ghBase}/repos/${repo}/issues`);
    url.searchParams.set("state", opts.state ?? "all");
    url.searchParams.set("per_page", "100");
    const { body } = await request(url, {
      method: "GET",
      headers: {
        "user-agent": "report-forge",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await body.json();
    return (Array.isArray(data) ? data : [])
      .filter((x) => !x.pull_request)
      .map(
        (x: any): Issue => ({
          id: x.id,
          number: x.number,
          title: x.title,
          state: x.state,
          labels: (x.labels ?? []).map((l: any) => ({ name: String(l.name) })),
          url: x.html_url,
          createdAt: x.created_at,
          closedAt: x.closed_at ?? undefined,
          body: x.body ?? undefined,
        }),
      );
  },
});
