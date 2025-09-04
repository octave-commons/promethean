type Comment = Readonly<{ id: number; body: string }>;

type FetchAllArgs = Readonly<{
  owner: string;
  repo: string;
  pr: number;
  token: string;
}>;

const gh = async <T>(url: string, token: string): Promise<readonly T[]> => {
  const out: T[] = [];
  let page = 1;
  for (;;) {
    const u = new URL(url);
    u.searchParams.set("per_page", "100");
    u.searchParams.set("page", String(page));
    const res = await fetch(u, {
const res = await fetch(u, {
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nitpack/0.1 (+https://github.com/riatzukiza/promethean)",
  },
});
    });
    if (!res.ok)
      throw new Error(`GitHub ${res.status} ${res.statusText} for ${u}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    out.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return out;
};

export const fetchAllComments = async (
  a: FetchAllArgs,
): Promise<{
  issueComments: readonly Comment[];
  reviewComments: readonly Comment[];
}> => {
  const base = `https://api.github.com/repos/${a.owner}/${a.repo}`;
  const issueComments = await gh<Comment>(
    `${base}/issues/${a.pr}/comments`,
    a.token,
  );
  const reviewComments = await gh<Comment>(
    `${base}/pulls/${a.pr}/comments`,
    a.token,
  );
  return { issueComments, reviewComments };
};
