import type { MarkdownChunk } from "@promethean/markdown/types";

export type Front = {
  uuid?: string;
  created_at?: string;
  filename?: string;
  title?: string;
  description?: string;
  tags?: string[];
  related_to_title?: string[];
  related_to_uuid?: string[];
  references?: Array<{
    uuid: string;
    line: number;
    col: number;
    score?: number;
  }>;
  [k: string]: any;
};

export type Chunk = MarkdownChunk & {
  id: string; // docUuid:index
  docUuid: string;
  docPath: string;
  embedding?: number[];
};

export type QueryHit = {
  id: string; // chunk id
  docUuid: string;
  score: number; // cosine
  startLine: number;
  startCol: number;
};
