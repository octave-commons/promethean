import { pathToFileURL } from "url";

import { openLevelCache } from "@promethean/level-cache";
import type { ReadonlyDeep } from "type-fest";

import { parseArgs, SONAR_URL, authHeader } from "./utils.js";
import type { SonarIssue } from "./types.js";

export type FetchOpts = {
  project: string;
  out: string;
  statuses: string;
  types: string;
  severities: string;
  pageSize: number;
};

async function sonarGet<T extends Record<string, unknown>>(
  pathname: string,
  params: Record<string, string | number>,
): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${SONAR_URL}${pathname}?${qs}`;
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(`Sonar API ${res.status} ${pathname}`);
  return (await res.json()) as T;
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
type SonarSearchResults = {
  total: number;
  issues: Array<Record<string, unknown>>;
};
export const sonarSearch = (
  opts: ReadonlyDeep<FetchOpts>,
): Promise<ReadonlyDeep<SonarSearchResults>> =>
  sonarGet<SonarSearchResults>("/api/issues/search", {
    projectKeys: opts.project,
    statuses: opts.statuses,
    types: opts.types,
    severities: opts.severities,
    ps: opts.pageSize,
    additionalFields: "_all",
  });

export async function fetchIssues(opts: FetchOpts) {
  const project = opts.project;
  if (!project) throw new Error("Provide project");

  const total = (
    await sonarGet<{ total: number; issues: Array<Record<string, unknown>> }>(
      "/api/issues/search",
      {
        projectKeys: project,
        statuses: opts.statuses,
        types: opts.types,
        severities: opts.severities,
        ps: opts.pageSize,
        additionalFields: "_all",
      },
    )
  ).total;

  const pageCount = Math.ceil(total / opts.pageSize);
  const pageRequests: Array<Promise<{ total: number; issues: SonarIssue[] }>> =
    pageCount === 0
      ? []
      : Array.from({ length: pageCount }, (_, index) =>
          sonarGet<SonarSearchResults>("/api/issues/search", {
            projectKeys: project,
            statuses: opts.statuses,
            types: opts.types,
            severities: opts.severities,
            p: index + 1,
            ps: opts.pageSize,
            additionalFields: "_all",
          }).then((data) => ({
            total: data.total,
            issues: data.issues.map((it) => toSonarIssue(it)),
          })),
        );
  const pageResults = await Promise.all(pageRequests);
  const issues = pageResults.flatMap((result) => result.issues);

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
