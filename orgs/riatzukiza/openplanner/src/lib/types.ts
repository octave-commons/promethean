export type BlobRef = {
  blob: string; // sha256 hex
  mime: string;
  name?: string;
  size?: number;
};

export type SourceRef = Partial<{
  project: string;
  session: string;
  message: string;
  turn: string;
}>;

export type EventEnvelopeV1 = {
  schema: "openplanner.event.v1";
  id: string;
  ts: string; // ISO
  source: string;
  kind: string;
  source_ref?: SourceRef;
  text?: string;
  attachments?: BlobRef[];
  meta?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

export type EventIngestRequest = { events: EventEnvelopeV1[] };

export type SearchTier = "hot" | "compact" | "both";

export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  project: string;
  kind: "docs" | "code" | "config" | "data";
  visibility: "internal" | "review" | "public" | "archived";
  source?: string;
  sourcePath?: string;
  domain?: string;
  language?: string;
  createdBy?: string;
  publishedBy?: string;
  publishedAt?: string | null;
  aiDrafted?: boolean;
  aiModel?: string | null;
  aiPromptHash?: string | null;
  metadata?: Record<string, unknown>;
  ts?: string;
};

export type DocumentUpsertRequest = {
  document: Omit<DocumentRecord, 'visibility' | 'source' | 'domain' | 'language' | 'createdBy' | 'metadata' | 'aiDrafted' | 'ts'> & {
    visibility?: DocumentRecord['visibility'];
    source?: string;
    domain?: string;
    language?: string;
    createdBy?: string;
    metadata?: Record<string, unknown>;
    aiDrafted?: boolean;
    ts?: string;
  };
};

export type DocumentPatchRequest = Partial<Omit<DocumentRecord, 'id'>> & { id: string };

export type FtsSearchRequest = {
  q: string;
  limit?: number;
  source?: string;
  kind?: string;
  project?: string;
  session?: string;
  tier?: SearchTier;
};

export type VectorSearchRequest = {
  q: string;
  k?: number;
  source?: string;
  kind?: string;
  project?: string;
  where?: Record<string, unknown>;
  tier?: SearchTier;
};
