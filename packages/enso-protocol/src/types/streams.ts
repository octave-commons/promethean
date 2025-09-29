export interface StreamFrame {
  streamId: string;
  codec: "opus/48000/2" | "pcm16le/16000/1" | "text/utf8" | "jsonl";
  seq: number;
  pts: number; // ms
  eof?: boolean;
  data: Uint8Array | string;
  encoding?: "base64";
}
