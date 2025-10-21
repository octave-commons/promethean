export type ApiKind =
  | "function"
  | "variable"
  | "class"
  | "interface"
  | "type"
  | "enum";
export type MemberSig = { name: string; type: string; optional?: boolean };
export type FnSig = { params: MemberSig[]; returns: string };
export type ClassSig = { props: MemberSig[]; methods: Record<string, FnSig> };

export type ApiItem = {
  kind: ApiKind;
  name: string; // exported symbol name
  signature: string; // stable string for hashing
  fn?: FnSig;
  class?: ClassSig;
};

export type PkgSnapshot = {
  pkgName: string;
  version: string;
  exports: Record<string, ApiItem>; // key by name
};

export type WorkspaceSnapshot = {
  createdAt: string;
  packages: Record<string, PkgSnapshot>; // key = package.json name
};

export type ChangeKind = "remove" | "add" | "change";
export type ApiChange = {
  name: string;
  kind: ChangeKind;
  detail: string; // human summary
  severity: "major" | "minor" | "patch";
};

export type DiffResult = {
  pkgName: string;
  required: "major" | "minor" | "patch" | "none";
  changes: ApiChange[];
};

export type PlansFile = {
  plannedAt: string;
  packages: Record<
    string,
    {
      required: DiffResult["required"];
      changes: ApiChange[];
      task: {
        title: string;
        summary: string;
        steps: string[];
        acceptance: string[];
        labels: string[];
      };
    }
  >;
};
