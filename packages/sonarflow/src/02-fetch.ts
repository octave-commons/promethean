/* eslint-disable */
import { pathToFileURL } from "url";

import { parseArgs, SONAR_URL, authHeader } from "./utils.js";
import { openLevelCache } from "@promethean/level-cache";
import type { SonarIssue } from "./types.js";

export type FetchOpts = {
  project: string;
  out: string;
  statuses: string;
  types: string;
  severities: string;
  pageSize: number;
};

async function sonarGet(
  pathname: string,
  params: Record<string, string | number>,
) {
  const qs = new URLSearchParams(params as any).toString();
  const url = `${SONAR_URL}${pathname}?${qs}`;
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(`Sonar API ${res.status} ${pathname}`);
  const data: any = await res.json();
  return data;
}

async function fetchIssuePage(project: string, opts: FetchOpts, page: number) {
  return sonarGet("/api/issues/search", {
    projectKeys: project,
    statuses: opts.statuses,
    types: opts.types,
    severities: opts.severities,
    p: page,
    ps: opts.pageSize,
    additionalFields: "_all",
  });
}

export function toSonarIssue(raw: Record<string, unknown>): SonarIssue {
  return {
    key: String(raw.key ?? ""),
    rule: String(raw.rule ?? ""),
    severity: String(raw.severity ?? "") as SonarIssue["severity"],
    type: String(raw.type ?? "") as SonarIssue["type"],
    component: String(raw.component ?? ""),
    project: String(raw.project ?? ""),
    line: typeof raw.line === "number" ? raw.line : undefined,
    message: String(raw.message ?? ""),
    debt: String(raw.debt ?? ""),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
  };
}

export async function fetchIssues(opts: FetchOpts) {
  const project = opts.project;
  if (!project) throw new Error("Provide project");
  const issues: SonarIssue[] = [];
  let page = 1,
    total = 0;

  do {
    const data = await fetchIssuePage(project, opts, page);

    total = data.total;
    for (const it of data.issues as Array<Record<string, unknown>>) {
      issues.push(toSonarIssue(it));
    }
    page++;
  } while ((page - 1) * opts.pageSize < total);

  const cache = await openLevelCache<
    SonarIssue | { project: string; fetchedAt: string }
  >({
    path: opts.out,
  });

  for await (const [k] of cache.entries()) {
    await cache.del(k);
  }

  await cache.batch([
    {
      type: "put",
      key: "__meta__",
      value: { project, fetchedAt: new Date().toISOString() },
    },
    ...issues.map((i) => ({ type: "put" as const, key: i.key, value: i })),
  ]);
  await cache.close();
  console.log(
    `sonarflow: fetched ${issues.length} issues for ${project} → ${opts.out}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    "--project": process.env.SONAR_PROJECT_KEY ?? "",
    "--out": ".cache/sonar/issues",
    "--statuses": "OPEN,REOPENED,CONFIRMED",
    "--types": "BUG,VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT",
    "--severities": "BLOCKER,CRITICAL,MAJOR,MINOR,INFO",
    "--pageSize": "500",
  });
  fetchIssues({
    project: args["--project"]!,
    out: args["--out"]!,
    statuses: args["--statuses"]!,
    types: args["--types"]!,
    severities: args["--severities"]!,
    pageSize: Number(args["--pageSize"]),
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default fetchIssues;
