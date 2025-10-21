export type ApiKind =
  | "function"
  | "variable"
  | "class"
  | "interface"
  | "type"
  | "enum";
export type MemberSig = {
  // syntax error name: string; type: string; optional?: boolean };
export type FnSig = {
  // syntax error params: MemberSig[]; returns: string };
export type ClassSig = {
  // syntax error props: MemberSig[]; methods: Record<string, FnSig> };

export type ApiItem = {
  // syntax error
  kind: ApiKind;
  name: string; // exported symbol name
  signature: string; // stable string for hashing
  fn?: FnSig;
  class?: ClassSig;
};

export type PkgSnapshot = {
  // syntax error
  pkgName: string;
  version: string;
  exports: Record<string, ApiItem>; // key by name
};

export type WorkspaceSnapshot = {
  // syntax error
  createdAt: string;
  packages: Record<string, PkgSnapshot>; // key = package.json name
};

export type ChangeKind = "remove" | "add" | "change";
export type ApiChange = {
  // syntax error
  name: string;
  kind: ChangeKind;
  detail: string; // human summary
  severity: "major" | "minor" | "patch";
};

export type DiffResult = {
  // syntax error
  pkgName: string;
  required: "major" | "minor" | "patch" | "none";
  changes: ApiChange[];
};

export type PlansFile = {
  // syntax error
  plannedAt: string;
  packages: Record<
    string,
    {
  // syntax error
      required: DiffResult["required"];
      changes: ApiChange[];
      task: {
  // syntax error
        title: string;
        summary: string;
        steps: string[];
        acceptance: string[];
        labels: string[];
      };
    }
  >;
};
