import { Readable, PassThrough } from "node:stream";
import * as prism from "prism-media";
import * as wav from "wav";

export function convert(oggStream: Readable): PassThrough {
  const decoder = new prism.opus.Decoder({
    channels: 2,
    rate: 48000,
    frameSize: 960,
  });

  const wavWriter = new wav.Writer({
    channels: 2,
    sampleRate: 48000,
    bitDepth: 16,
  });

  const output = new PassThrough();
  oggStream.pipe(decoder).pipe(wavWriter).pipe(output);
  return output;
}
