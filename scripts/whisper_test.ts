import { pipeline } from '@xenova/transformers';
import { spawn } from 'node:child_process';

async function main() {
  try {
    const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    const silence = new Float32Array(16000);
    const result = await asr(silence);
    console.log('Transcription:', result.text);
  } catch (err) {
    console.warn('Falling back to Python implementation due to', err);
    const child = spawn('python3', ['scripts/whisper_test.py'], { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
      }
    });
  }
}

main().catch((err) => {
  console.error('Unexpected error in whisper_test.ts', err);
});
