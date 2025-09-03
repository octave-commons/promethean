// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import { parseArgs, SONAR_URL, authHeader, writeJSON } from "./utils.js";
import type { SonarIssue, FetchPayload } from "./types.js";

const args = parseArgs({
  "--project": process.env.SONAR_PROJECT_KEY ?? "",
  "--out": ".cache/sonar/issues.json",
  "--statuses": "OPEN,REOPENED,CONFIRMED",
  "--types": "BUG,VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT",
  "--severities": "BLOCKER,CRITICAL,MAJOR,MINOR,INFO",
  "--pageSize": "500"
});

async function sonarGet(pathname: string, params: Record<string,string|number>) {
  const qs = new URLSearchParams(params as any).toString();
  const url = `${SONAR_URL}${pathname}?${qs}`;
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(`Sonar API ${res.status} ${pathname}`);
  const data: any = await res.json();
  return data;
}

async function main() {
  const project = args["--project"];
  if (!project) throw new Error("Provide --project or SONAR_PROJECT_KEY");

  const pageSize = Number(args["--pageSize"]);
  const issues: SonarIssue[] = [];
  let page = 1, total = 0;

  do {
    const data = await sonarGet("/api/issues/search", {
      projectKeys: project,
      statuses: args["--statuses"],
      types: args["--types"],
      severities: args["--severities"],
      p: page, ps: pageSize, additionalFields: "_all"
    });

    total = data.total;
    for (const it of data.issues as any[]) {
      issues.push({
        key: it.key,
        rule: it.rule,
        severity: it.severity,
        type: it.type,
        component: it.component, // usually "<project>:path/to/file.ts"
        project: it.project,
        line: it.line,
        message: it.message,
        debt: it.debt,
        tags: it.tags
      });
    }
    page++;
  } while ((page - 1) * pageSize < total);

  const payload: FetchPayload = {
    issues,
    fetchedAt: new Date().toISOString(),
    project
  };

  await writeJSON(args["--out"], payload);
  console.log(`sonarflow: fetched ${issues.length} issues for ${project} → ${args["--out"]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
