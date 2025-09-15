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

export async function fetchIssues(opts: FetchOpts) {
  const project = opts.project;
  if (!project) throw new Error("Provide project");

  const pageSize = Number(opts.pageSize);
  const issues: SonarIssue[] = [];
  let page = 1,
    total = 0;

  do {
    const data = await sonarGet("/api/issues/search", {
      projectKeys: project,
      statuses: opts.statuses,
      types: opts.types,
      severities: opts.severities,
      p: page,
      ps: pageSize,
      additionalFields: "_all",
    });

    total = data.total;
    for (const it of data.issues as Array<Record<string, unknown>>) {
      const issue: SonarIssue = {
        key: String(it.key ?? ""),
        rule: String(it.rule ?? ""),
        severity: String(it.severity ?? "") as SonarIssue["severity"],
        type: String(it.type ?? "") as SonarIssue["type"],
        component: String(it.component ?? ""),
        project: String(it.project ?? ""),
        line: typeof it.line === "number" ? it.line : undefined,
        message: String(it.message ?? ""),
        debt: String(it.debt ?? ""),
        tags: Array.isArray(it.tags) ? it.tags.map((t) => String(t)) : [],
      };
      issues.push(issue);
    }
    page++;
  } while ((page - 1) * pageSize < total);

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
