import { execa } from 'execa';
import { decode } from 'wav-decoder';
const AUDIO_INPUT = 'audio=Voicemeeter Out B1 (VB-Audio Voicemeeter VAIO)';
export async function captureAudio({ duration = 5 } = {}) {

    const startTime = Date.now()

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
    ], {
        stdout: 'pipe', stderr: 'ignore',
        encoding: 'buffer' // ← this is the fix
    });
    const endTime = Date.now()

    const { stdout } = await ffmpeg;
    const waveBuffer = Buffer.from(stdout)
    const audioData = await decode(waveBuffer);

    const channelData = audioData.channelData[0];
    if (!channelData) throw new Error("No audio channel")
    return {
        startTime,
        endTime,
        audioData,
        channelData,
        waveBuffer
    }
}
