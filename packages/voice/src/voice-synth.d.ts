import EventEmitter from "events";
import { IncomingMessage } from "http";
import { Readable } from "stream";
export type VoiceSynthOptions = {
  host: string;
  endpoint: string;
  port: number;
};
export declare class VoiceSynth extends EventEmitter {
  host: string;
  endpoint: string;
  port: number;
  constructor(options?: VoiceSynthOptions);
  generateAndUpsampleVoice(text: string): Promise<{
    stream: Readable;
    cleanup: () => void;
  }>;
  generateVoice(text: string): Promise<IncomingMessage>;
}
//# sourceMappingURL=voice-synth.d.ts.map
