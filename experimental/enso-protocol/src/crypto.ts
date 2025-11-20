export interface KeyUpdate {
  purpose: "room" | "whisper";
  recipients: string[];
  encKey: Uint8Array;
  epoch: number;
}
export interface E2E {
  generateIdentity(): Promise<{ pub: string; priv: string }>;
  seal(toPub: string, data: Uint8Array): Promise<Uint8Array>;
  open(fromPub: string, data: Uint8Array): Promise<Uint8Array>;
  // pluggable backends: MLS lib / double-ratchet lib
}
