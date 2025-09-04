import { pipeline, env } from '@xenova/transformers';
import { spawn } from 'node:child_process';

// Cache directory can be overridden via XENOVA_CACHE_DIR
env.cacheDir = process.env.XENOVA_CACHE_DIR ?? '.cache/transformers';
const PYTHON = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');

async function main() {
  try {
    const asr = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
      { quantized: true }
    );
    const silence = new Float32Array(16000);
    const result = await asr(silence, { sampling_rate: 16000 });
    console.log('Transcription:', result.text);
  } catch (err) {
    console.warn('JS ASR failed; falling back to Python:', (err as Error)?.message ?? err);
    await new Promise<void>((resolve, reject) => {
      const child = spawn(PYTHON, ['scripts/whisper_test.py'], { stdio: 'inherit' });
      child.once('error', reject);
      child.once('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Python script exited with code ${code}`));
      });
    });
  }
}

main().catch((err) => {
  console.error('Unexpected error in whisper_test.ts', err);
});
