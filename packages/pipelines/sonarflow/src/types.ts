export type SonarIssue = {
  key: string;
  rule: string;
  severity: "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO";
  type: "BUG" | "VULNERABILITY" | "CODE_SMELL" | "SECURITY_HOTSPOT";
  component: string;   // e.g. repo path
  project: string;
  line?: number;
  message: string;
  debt?: string;       // effort
  tags?: string[];
};

export type IssueBundle = {
  id: string;                  // stable hash for grouping
  title: string;               // human label for the group
  issues: SonarIssue[];
  severityTop: SonarIssue["severity"];
  types: string[];             // distinct types in bundle
  rule?: string;               // if homogenous by rule
  prefix?: string;             // path prefix base
};

export type PlanTask = {
  id: string;                  // derived from bundle id
  title: string;
  summary: string;
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  labels: string[];
  acceptance: string[];
  steps: string[];
  refs: Array<{ key: string; file: string; line?: number }>;
};

export type FetchPayload = { issues: SonarIssue[]; fetchedAt: string; project: string };
export type PlanPayload = { tasks: PlanTask[]; plannedAt: string; project: string };
