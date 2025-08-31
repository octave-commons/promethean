export type Front = {
  uuid?: string;
  created_at?: string;
  filename?: string;
  description?: string;
  tags?: string[];
  related_to_title?: string[];
  related_to_uuid?: string[];
  references?: Array<{ uuid: string; line: number; col: number; score?: number }>;
  [k: string]: any;
};

export type Chunk = {
  id: string;           // docUuid:index
  docUuid: string;
  docPath: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  text: string;
  title?: string;       // nearest heading
  kind: "text" | "code";
  embedding?: number[];
};

export type QueryHit = {
  id: string;      // chunk id
  docUuid: string;
  score: number;   // cosine
  startLine: number;
  startCol: number;
};
