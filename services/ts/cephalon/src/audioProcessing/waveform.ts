import { createCanvas } from 'canvas';
import {annotateImage} from "./annotate-image"
import { getCurrentDateTime } from './get-current-date-time';
import { captureAudio } from './desktopAudioCapture';
import { generateSpectrogram } from './spectrogram';

const DEFAULT_WIDTH = 1024
const DEFAULT_HEIGHT = 256

export async function renderWaveForm(channelData:Float32Array, {
     width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT
}) {
    const samplesPerPixel = Math.floor(channelData.length / width);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#00ffaa';
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
        const start = x * samplesPerPixel; const segment = channelData.slice(start, start + samplesPerPixel);
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
export type AudioImageData = {
    waveForm:Buffer,
    spectrogram:Buffer
}
export async function captureAndRenderWaveform({
    duration = 5,
    width = 1024,
    height = 1024,
} = {}) {
  console.log(`🎙 Capturing ${duration}s of audio into memory...`);
    const {waveBuffer, channelData}:{waveBuffer:Buffer, channelData:Float32Array} = await captureAudio({duration})
    const waveForm = await renderWaveForm( channelData,{width, height})
    const spectrogram = await generateSpectrogram(waveBuffer)
    return {waveForm,spectrogram}

}
