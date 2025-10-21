export type SourceKind =
  | "fs"
  | "api"
  | "db"
  | "http"
  | "mcp"
  | "enso-asset"
  | "other";
export interface DataSourceId {
  kind: SourceKind;
  location: string;
}
export type OwnerRef = { userId: string } | { groupId: string };
export type Discoverability =
  | "invisible"
  | "discoverable"
  | "visible"
  | "hidden";

export type Availability =
  | { mode: "private" }
  | { mode: "public" }
  | { mode: "shared"; members: string[] }
  | { mode: "conditional"; conditions: Condition[] };

export type RuleExpr =
  | { op: "roomHasMember"; id: string }
  | { op: "timeBetween"; start: string; end: string }
  | { op: "tagIncludes"; tag: string }
  | { op: "contextNameMatches"; regex: string };

export type Condition =
  | { kind: "hard"; rule: RuleExpr; requireApproval?: boolean }
  | { kind: "soft"; prompt: string; requireApproval: true };

export interface DataSourceMeta {
  id: DataSourceId;
  owners: OwnerRef[];
  title?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  discoverability: Discoverability;
  availability: Availability;
  contentHints?: { lang?: string; mime?: string; schema?: string };
}

export interface DataSourceInit
  extends Omit<DataSourceMeta, "createdAt" | "updatedAt"> {
  createdAt?: string;
  updatedAt?: string;
}

export type ContextState =
  | "active"
  | "inactive"
  | "standby"
  | "pinned"
  | "ignored";
export interface ContentPermissions {
  readable?: boolean;
  changeable?: boolean;
  movable?: boolean;
  exchangeable?: boolean;
  sendable?: boolean;
  addable?: boolean;
  removable?: boolean;
  deletable?: boolean;
  saveable?: boolean;
  viewable?: boolean;
}
export interface ContextEntry {
  id: DataSourceId;
  state: ContextState;
  overrides?: {
    discoverability?: Discoverability;
    availability?: Availability;
  };
  permissions?: ContentPermissions;
}
export interface Context {
  ctxId: string;
  name: string;
  owner: OwnerRef;
  createdAt: string;
  updatedAt: string;
  entries: ContextEntry[];
  rules?: { include?: RuleExpr[]; exclude?: RuleExpr[]; caps?: string[] };
  privacy?: { inheritRoom: boolean; messageTTLOverrideSeconds?: number };
}

export interface ContextInit
  extends Omit<Context, "ctxId" | "createdAt" | "updatedAt"> {
  ctxId?: string;
  createdAt?: string;
  updatedAt?: string;
}
export type ContextViewState = "active" | "standby" | "ignored";
export interface LlmView {
  ctxId: string;
  active: DataSourceMeta[];
  standby: DataSourceMeta[];
  ignored: DataSourceMeta[];
  grants: Array<{ id: DataSourceId; permissions: ContentPermissions }>;
  parts: Array<{
    id: DataSourceId;
    purpose: "text" | "image" | "other";
    uri: string;
    mime: string;
  }>;
}

export interface ContextParticipant {
  id: string;
  roles?: string[];
  groups?: string[];
  tags?: string[];
}

export interface ContextEnvironment {
  now: Date;
  contextName: string;
  contextTags?: string[];
  roomMembers: string[];
  participantIds: string[];
}

export interface ApprovalRequest {
  id: string;
  ctxId: string;
  dataSource: DataSourceId;
  condition: Condition;
  reason: "soft-condition" | "hard-condition-approval";
  prompt?: string;
}

export interface AvailabilityResult {
  status: "granted" | "denied" | "pending";
  approvals: ApprovalRequest[];
  reason?: string;
}

export interface DeniedDataSource {
  id: DataSourceId;
  reason: string;
}

export interface ContextDiff {
  added: DataSourceId[];
  removed: DataSourceId[];
  stateChanged: Array<{
    id: DataSourceId;
    from: ContextViewState;
    to: ContextViewState;
  }>;
}

export interface ContextApplication {
  view: LlmView;
  approvals: ApprovalRequest[];
  denied: DeniedDataSource[];
  diff?: ContextDiff;
}

export interface ContextApplyOptions {
  participants: ContextParticipant[];
  requester?: string;
  contextTags?: string[];
  now?: Date;
  previousView?: LlmView;
  includeInactive?: boolean;
}
