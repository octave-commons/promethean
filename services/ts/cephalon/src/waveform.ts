import { execa } from 'execa';
import { decode } from 'wav-decoder';
import { createCanvas } from 'canvas';
import {annotateImage} from "./annotate-image"
import { getCurrentDateTime } from './get-current-date-time';

const AUDIO_INPUT = 'audio=Voicemeeter Out B1 (VB-Audio Voicemeeter VAIO)';

export async function captureAndRenderWaveform({ duration = 5, width = 1600, height = 400 } = {}) {
  console.log(`🎙 Capturing ${duration}s of audio into memory...`);

  const ffmpeg = execa('ffmpeg', [
    '-y',
    '-f', 'dshow',
    '-i', AUDIO_INPUT,
    '-t', duration.toString(),
    '-acodec', 'pcm_s16le',
    '-ar', '44100',
    '-ac', '1',
    '-f', 'wav',
    'pipe:1' // Output to stdout
  ], { stdout: 'pipe', stderr: 'inherit' ,
      encoding: 'buffer' // ← this is the fix
     });

  const { stdout } = await ffmpeg;
    const audioData = await decode(Buffer.from(stdout));

  const channelData = audioData.channelData[0];
    if(!channelData) throw new Error("No audio channel")
  const samplesPerPixel = Math.floor(channelData.length / width);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#00ffaa';
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    const start = x * samplesPerPixel;
    const segment = channelData.slice(start, start + samplesPerPixel);
    const min = Math.min(...segment);
    const max = Math.max(...segment);
    const y1 = (1 - ((max + 1) / 2)) * height;
    const y2 = (1 - ((min + 1) / 2)) * height;
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
  }

  ctx.stroke();

  const pngBuffer = canvas.toBuffer('image/png');
  console.log('✅ In-memory waveform generated');

    return annotateImage(
        pngBuffer,
        getCurrentDateTime(),
        "Wave form of Desktop Audio"
    );
}
