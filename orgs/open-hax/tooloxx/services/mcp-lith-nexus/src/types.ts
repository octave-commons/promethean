export interface SourcePoint {
  offset: number
  line: number
  column: number
}

export interface SourceSpan {
  path: string
  start: SourcePoint
  end: SourcePoint
}

interface LithNodeBase {
  span: SourceSpan
  text: string
}

export interface LithListNode extends LithNodeBase {
  type: "list"
  items: LithNode[]
}

export interface LithVectorNode extends LithNodeBase {
  type: "vector"
  items: LithNode[]
}

export interface LithSymbolNode extends LithNodeBase {
  type: "symbol"
  value: string
}

export interface LithKeywordNode extends LithNodeBase {
  type: "keyword"
  value: string
}

export interface LithStringNode extends LithNodeBase {
  type: "string"
  value: string
}

export interface LithNumberNode extends LithNodeBase {
  type: "number"
  value: number
  raw: string
}

export type LithNode =
  | LithListNode
  | LithVectorNode
  | LithSymbolNode
  | LithKeywordNode
  | LithStringNode
  | LithNumberNode

export interface ParseLithOptions {
  filePath?: string
  baseOffset?: number
  baseLine?: number
}

export interface NexusMimeConfig {
  lith: string
  md: string
}

export interface NexusWriteConfig {
  factsDir: string
  inboxDir: string
  allowSecretWrites?: boolean
}

export interface NexusIndexConfig {
  useGitLsFiles: boolean
  watch: boolean
}

export interface NexusConfig {
  repoRoot: string
  configPath: string
  roots: string[]
  includeExt: string[]
  ignoreGlob: string[]
  mime: NexusMimeConfig
  writes: NexusWriteConfig
  index: NexusIndexConfig
}

export type NexusNodeKind = "file" | "form" | "packet" | "contract" | "fact" | "spec" | "tag" | "symbol"

export type NexusEdgeKind = "contains" | "declares" | "references" | "tagged" | "depends_on" | "derived_from"

export interface NexusSourceRef {
  path: string
  span: SourceSpan
  sha256: string
}

export interface NexusProvenance {
  source: NexusSourceRef
  p?: number
}

export interface IndexedForm {
  id: string
  filePath: string
  head: string
  form: LithNode
  canonical: string
  formSha256: string
  stableNodeId: string
  title: string
  explicitId?: string
  resourceKey?: string
  declaredKind?: NexusNodeKind
  declaredNodeId?: string
  tags: string[]
  referenceCandidates: string[]
}

export interface IndexedFile {
  relPath: string
  absPath: string
  ext: string
  content: string
  sha256: string
  formIds: string[]
  fileNodeId: string
  specNodeId?: string
}

export interface NexusNode {
  id: string
  kind: NexusNodeKind
  uri: string
  title: string
  tags: string[]
  text: string
  path: string
  sha256: string
  canonical?: string
  resourceKey?: string
  lookupKeys: string[]
  provenance: NexusProvenance
  metadata: Record<string, unknown>
}

export interface NexusEdge {
  id: string
  kind: NexusEdgeKind
  source: string
  target: string
  provenance: NexusProvenance
}

export interface ResourcePayload {
  uri: string
  mimeType: string
  text: string
}

export interface FindOptions {
  query: string
  kinds?: string[]
  tags?: string[]
  pathGlob?: string
  limit?: number
}

export interface FindMatch {
  node: NexusNode
  score: number
}

export interface QueryOptions {
  queryLith: string
}

export interface CreateResourceInput {
  kind: string
  title: string
  tags?: string[]
  links?: Array<{ uri: string; rel: string }>
  facts?: string
  pathHint?: string
}

export interface CreateFactInput {
  factLith: string
  target?: {
    packetId?: string
    contractId?: string
    resourceId?: string
    path?: string
  }
}
