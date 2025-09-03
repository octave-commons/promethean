import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

import test from 'ava';
import { makeTransformer, applyTransformer } from '@promethean/compiler/transform/transformer.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runFixtureTransform(t: any, name: string, file: string) {
    const before = fs.readFileSync(path.join(__dirname, `fixtures/${file}.before.ts`), 'utf8');
    const after = fs.readFileSync(path.join(__dirname, `fixtures/${file}.after.ts`), 'utf8');

    const transformer = makeTransformer(before, after);
    const output = applyTransformer(before, transformer);

    t.is(output.trim(), after.trim());
}

test.skip('Cephalon voice-synth ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'voice-synth', 'cephalon');
});

test.skip('Cephalon desktopAudioCapture ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'desktopAudioCapture', 'desktopAudioCapture');
});

test.skip('Cephalon spectrogram ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'spectrogram', 'spectrogram');
});
