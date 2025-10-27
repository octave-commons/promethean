# Context Management and Data Curation

Context management lets participants curate which data sources are active in a
conversation and how agents may access them. Metadata distinguishes ownership,
discoverability, and permissions.

## Data Source Metadata

```ts
export type SourceKind = "fs" | "api" | "db" | "http" | "mcp" | "enso-asset" | "other";
export type OwnerRef = { userId: string } | { groupId: string };
export type Discoverability = "invisible" | "discoverable" | "visible" | "hidden";

export interface DataSourceId {
  kind: SourceKind;
  location: string;                 // unique identifier per kind
}

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
```

## Context Graph

```ts
export type ContextState = "active" | "inactive" | "standby" | "pinned" | "ignored";

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
  rules?: {
    include?: RuleExpr[];
    exclude?: RuleExpr[];
    caps?: string[];
  };
  privacy?: {
    inheritRoom: boolean;
    messageTTLOverrideSeconds?: number;
  };
}
```

## Context Events

```json
{ "kind": "event", "type": "datasource.add", "payload": { "meta": DataSourceMeta } }
{ "kind": "event", "type": "datasource.update", "payload": { "id": DataSourceId, "patch": { "tags": ["policy"] } } }
{ "kind": "event", "type": "context.create", "payload": { "ctx": { "name": "Sprint Review" } } }
{ "kind": "event", "type": "context.add", "payload": { "ctxId": "ctx1", "entry": ContextEntry } }
{ "kind": "event", "type": "context.apply", "payload": { "ctxId": "ctx1" } }
```

Helpers like `context.pin`, `context.activate`, and `context.ignore` provide
sugar for common state transitions.

## LLM View Generation

When a context is applied the gateway computes the LLM view to tell agents what
resources are available.

```ts
export interface LlmView {
  ctxId: string;
  active: DataSourceMeta[];
  standby: DataSourceMeta[];
  ignored: DataSourceMeta[];
  grants: Array<{ id: DataSourceId; permissions: ContentPermissions }>;
  parts: Array<{ id: DataSourceId; purpose: "text" | "image" | "other"; uri: string; mime: string }>;
}
```

Agents must honour availability rules. Soft conditions trigger
`approval.request` events; work continues only after `approval.grant`.

## Auditing and Privacy Integration

* `context.diff` summarises changes to an applied context.
* Ghost and ephemeral rooms may replace detailed diffs with aggregate counts.
* Contexts inherit room privacy by default; overrides allow more restrictive TTL
  without breaking policy.
